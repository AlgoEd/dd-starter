// Next.js instrumentation hook — using @vercel/otel.
//
// Why @vercel/otel instead of manual NodeSDK + auto-instrumentations-node:
// NodeSDK's http auto-instrumentation has to patch Node's `http` module
// BEFORE Next.js loads it. register() runs too late; even top-level import
// in instrumentation.ts is a race. Result: http.server.* metrics never
// emit. See vercel/next.js#80262.
//
// @vercel/otel sidesteps the race: it uses FetchInstrumentation (patches
// the global fetch runtime lookup, not an importable module) and relies on
// Next.js's own route-aware HTTP server spans from BaseServer.handleRequest.
// No module-load ordering requirement.
//
// Pg instrumentation is added explicitly for DB span visibility —
// @vercel/otel ships fetch only by default.
import { OTLPHttpProtoTraceExporter, registerOTel } from '@vercel/otel'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'

export function register() {
  // Emit NEW stable semconv attribute names (http.request.method,
  // db.system.name, …) instead of the legacy ones. Our Collector's
  // spanmetrics connector keys on the new names — without this, derived
  // metric labels come out empty.
  process.env.OTEL_SEMCONV_STABILITY_OPT_IN ??= 'database,http'

  registerOTel({
    serviceName: 'payload-cms',
    instrumentations: [new PgInstrumentation()],
    traceExporter: new OTLPHttpProtoTraceExporter({
      url: 'http://collector.railway.internal:4318/v1/traces',
    }),
  })
}
