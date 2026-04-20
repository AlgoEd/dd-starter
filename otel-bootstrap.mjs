// OTel bootstrap — preloaded via `node --import ./otel-bootstrap.mjs` (set
// through NODE_OPTIONS in package.json's start script).
//
// Why this file exists (read before modifying):
//
// Next.js's standard instrumentation.ts hook runs LATE — after Node has
// already loaded `http` and other core modules. By that time,
// instrumentation-http's require-hook monkey-patching can no longer
// intercept the module, so http.server.request.duration metrics never
// emit. The canonical community workaround (vercel/next.js#80262) is to
// preload OTel via Node's --import flag BEFORE any application code:
//
//   node --import ./otel-bootstrap.mjs .next/server.js
//
// Or equivalently, via NODE_OPTIONS when running `next start`, which spawns
// node and inherits the options. That's what package.json uses here.
//
// This file mirrors algoed-new/src/telemetry.ts in structure and intent —
// both services converge on the spec-native metric path:
//   - http.server.request.duration  (instrumentation-http, incoming)
//   - http.client.request.duration  (instrumentation-http, outgoing)
//   - db.client.operation.duration  (instrumentation-pg, Postgres)
//
// @vercel/otel is NOT used. It was intentionally retired when this file
// landed — see the git log around this commit for the reasoning.
//
// OTEL_SEMCONV_STABILITY_OPT_IN: forces stable semconv names (http.request.method,
// db.query.text, …) instead of legacy (http.method, db.statement).
// TODO(delete-by-2026-Q3): OTel JS SDK v3 (targeted June 2026) makes stable
// semconv the default and REMOVES this flag entirely.
// https://opentelemetry.io/docs/specs/semconv/non-normative/http-migration/
process.env.OTEL_SEMCONV_STABILITY_OPT_IN ??= 'database,http';

// Enable ALL NodeSDK resource detectors (host, os, service-instance,
// process, env). Default is only [env, process, host] — misses
// serviceInstanceIdDetector (needed for multi-replica) and osDetector.
// "all" is future-proof: any detector a later SDK version registers flows
// through automatically. Churny/uninformative attrs (host.name,
// process.pid, process.command_args, etc.) are stripped at the Collector
// via resource/strip_junk — see algoed-new/observability/otel-collector.yaml
// (shared collector config across all algoed services).
process.env.OTEL_NODE_RESOURCE_DETECTORS ??= 'all';

// ══════════════ DIAGNOSTIC LOGGING (temporary) ══════════════
// Added 2026-04-20 to diagnose why pages-cms produces no native HTTP
// metrics after the --import migration. Remove once verified working.
console.log('[OTEL-BOOT] 0 file-loaded pid=' + process.pid + ' cwd=' + process.cwd() + ' node=' + process.version);
// ════════════════════════════════════════════════════════════

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from '@opentelemetry/semantic-conventions/incubating';

// ══════════════ DIAGNOSTIC LOGGING (temporary) ══════════════
console.log('[OTEL-BOOT] 1 imports-done');
// Enable OTel's internal diag logger. DEBUG is verbose but we're here
// to debug — instrumentation-http/pg and MetricReader log patch
// attempts, export attempts, and errors at this level.
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
console.log('[OTEL-BOOT] 2 diag-logger-set level=DEBUG');
console.log('[OTEL-BOOT] RAILWAY_GIT_COMMIT_SHA=' + (process.env.RAILWAY_GIT_COMMIT_SHA || '<unset>'));
console.log('[OTEL-BOOT] RAILWAY_ENVIRONMENT_NAME=' + (process.env.RAILWAY_ENVIRONMENT_NAME || '<unset>'));
console.log('[OTEL-BOOT] NEXT_RUNTIME=' + (process.env.NEXT_RUNTIME || '<unset>'));
// ════════════════════════════════════════════════════════════

try {

const sdk = new NodeSDK({
  // App-known resource attrs. Auto-detected attrs (host.arch,
  // service.instance.id, process.runtime.*, etc.) merge on top via the
  // detectors enabled above.
  //
  // Note: AWS/GCP/Azure ship official @opentelemetry/resource-detector-*
  // packages that auto-map platform env vars to OTel attrs. No Railway
  // equivalent exists (may never ship — smaller ecosystem), so the
  // RAILWAY_* reads below are hand-rolled glue. If
  // @opentelemetry/resource-detector-railway ever lands, this is where
  // you'd swap it in.
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'payload-cms',
    [ATTR_SERVICE_NAMESPACE]: 'algoed',
    [ATTR_SERVICE_VERSION]:
      process.env.RAILWAY_GIT_COMMIT_SHA ??
      process.env.npm_package_version ??
      'unknown',
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
      process.env.RAILWAY_ENVIRONMENT_NAME ?? 'local',
  }),

  // AlwaysOnSampler — 100% trace capture, sampler-independent metrics.
  // Native http.server/.client.request.duration and
  // db.client.operation.duration don't depend on this; it's for full
  // fidelity when clicking through from a metric spike to its traces.
  sampler: new AlwaysOnSampler(),

  traceExporter: new OTLPTraceExporter({
    url: 'http://collector.railway.internal:4318/v1/traces',
  }),

  // Auto-instrumentations patches http, fs, pg, dns, etc. via Node's
  // module-loading hooks. Works here because --import preloads this file
  // BEFORE Next.js evaluates next.config.ts or requires 'http'. See the
  // top-of-file note on the vercel/next.js#80262 ordering constraint.
  instrumentations: [getNodeAutoInstrumentations()],

  // Native metrics pipeline. Histograms emitted directly by:
  //   - instrumentation-http → http.server.request.duration,
  //                             http.client.request.duration
  //   - instrumentation-pg → db.client.operation.duration
  // Collector forwards app → otlp → VictoriaMetrics; no spanmetrics
  // derivation anywhere in the stack for this service.
  //
  // Default export interval is 60s; override via OTEL_METRIC_EXPORT_INTERVAL.
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: 'http://collector.railway.internal:4318/v1/metrics',
      }),
    }),
  ],
});

// ══════════════ DIAGNOSTIC LOGGING (temporary) ══════════════
console.log('[OTEL-BOOT] 3 NodeSDK-constructed');
sdk.start();
console.log('[OTEL-BOOT] 4 sdk.start-returned');

setTimeout(() => {
  console.log('[OTEL-BOOT] 5 alive-at-1s (event loop OK, NodeSDK still running)');
}, 1000).unref();

setTimeout(() => {
  console.log('[OTEL-BOOT] 6 alive-at-65s (one metric-export cycle should have fired)');
}, 65_000).unref();

process.on('uncaughtException', (e) => {
  console.log('[OTEL-BOOT] UNCAUGHT:', e.stack || e.message);
});
process.on('unhandledRejection', (e) => {
  console.log('[OTEL-BOOT] UNHANDLED-REJECTION:', e && (e.stack || e.message || String(e)));
});

} catch (e) {
  console.log('[OTEL-BOOT] FATAL in NodeSDK setup:', e && (e.stack || e.message));
  throw e;
}
// ════════════════════════════════════════════════════════════
