/**
 * Shared Puck type definitions for competition pages.
 *
 * ⚠️ TYPE DEBT — these types are manually maintained, not derived from the Puck config.
 *
 * The proper approach (not yet implemented):
 * 1. Type the Puck config with RootConfig<CompetitionRootProps> or
 *    Config<{ root: CompetitionRootProps; components: ... }>
 * 2. Use ExtractConfigParams<typeof puckConfig>['rootProps'] to derive the
 *    root props type from the config, so it stays in sync automatically.
 * 3. Build a discriminated union for content[].props keyed by component type,
 *    mapping each type string to its actual props interface (CompetitionHeroProps,
 *    CompetitionNavProps, etc.) — eliminating the need for casts when reading
 *    puckData from Payload.
 *
 * Current state: CompetitionRootProps is manually kept in sync with the
 * defaultProps/fields in config.tsx and config.server.tsx. Component props
 * are cast to their render-file interfaces at read sites (e.g. opengraph-image.tsx).
 * If a field is added to the config but not here, the type will be stale.
 *
 * Puck references:
 * - RootConfig<Props>: types root config with explicit props
 * - ExtractConfigParams<Config>['rootProps']: derives root props from typed config
 * - @puckeditor/core types: Config, Data, RootData, ComponentData
 *
 * See also: config.tsx render() inline type annotation — should use CompetitionRootProps
 * instead of repeating the property list.
 */

/** Custom root props set on every competition page via the Puck editor sidebar. */
export interface CompetitionRootProps {
  primaryDark: string
  primaryBright: string
  heroTheme: string
  heroTextStyle: string
  highlightOverride: string
  ctaStyle: string
  heroCtaColor: string
}

/**
 * Shape of puckData as stored in the Payload DB.
 *
 * ⚠️ content[].props is Record<string, unknown> — callers must cast to the
 * specific component props type (e.g. CompetitionHeroProps) when accessing
 * component-specific fields. The proper fix is a discriminated union keyed
 * by component type, but that requires mapping all 17+ component types.
 */
export interface PuckPageData {
  root?: {
    props?: CompetitionRootProps & Record<string, unknown>
  }
  content?: Array<{
    type: string
    props?: Record<string, unknown>
  }>
}
