/**
 * Central type definitions for the competition Puck config.
 * This is the single source of truth — all consumers derive from here.
 *
 * Type flow:
 *   CompetitionRootProps + CompetitionComponents (source of truth, this file)
 *     ↓
 *   config.tsx / config.server.tsx render signature typed against CompetitionRootProps
 *     ↓
 *   extendConfig(...) output cast to Config<CompetitionComponents, CompetitionRootProps>
 *     (one cast per config file — the only untruth, at the plugin boundary)
 *     ↓
 *   PuckData = Data<CompetitionComponents, CompetitionRootProps>
 *     ↓
 *   Consumers (OG route, RSC renderer, admin UI) read puckData as PuckData.
 *     content.find(c => c.type === 'CompetitionHero') narrows to typed props
 *     via Puck's ComponentDataMap discriminated union.
 *
 * Adding / renaming a field on CompetitionRootProps will cause TypeScript
 * errors at:
 *   - config.tsx / config.server.tsx render destructure & defaultProps
 *   - any consumer that reads puckData.root.props.<field>
 *
 * Adding a component requires touching 3 places:
 *   - import the Props type + add a key in CompetitionComponents (this file)
 *   - add registry entry in src/components/puck/index.ts (editor)
 *   - add registry entry in src/components/puck/index.server.ts (SSR)
 *
 * Puck type machinery used here:
 *   - Config<Components, RootProps>        — typed config shape (for boundary cast)
 *   - RootConfig<RootProps>                — typed root slice (for satisfies)
 *   - Data<Components, RootProps>          — typed puckData (discriminated content)
 *   - DefaultRootFieldProps                — Puck's built-in root fields (title, etc.)
 *
 * Alt approach not taken: ExtractConfigParams<typeof puckConfig>['rootProps']
 *   would derive the types FROM a typed config. We went the other direction —
 *   declare types here, flow them INTO the config via generics — because the
 *   plugin's extendConfig() erases generics on output, blocking derivation.
 */
import type { Data, DefaultRootFieldProps } from '@puckeditor/core'
import type { CompetitionHeroProps } from '@/components/puck/CompetitionHero.render'
import type { TwoColumnFeatureProps } from '@/components/puck/TwoColumnFeature.render'
import type { BenefitsGridProps } from '@/components/puck/BenefitsGrid.render'
import type { EligibilityStripProps } from '@/components/puck/EligibilityStrip.render'
import type { AboutPartnerProps } from '@/components/puck/AboutPartner.render'
import type { CompetitionStructureProps } from '@/components/puck/CompetitionStructure.render'
import type { DeadlineTableProps } from '@/components/puck/DeadlineTable.render'
import type { CompetitionFormatProps } from '@/components/puck/CompetitionFormat.render'
import type { AwardsSectionProps } from '@/components/puck/AwardsSection.render'
import type { AwardsSectionLegacyProps } from '@/components/puck/AwardsSectionLegacy.render'
import type { JoinCTAProps } from '@/components/puck/JoinCTA.render'
import type { FeeWaiverProps } from '@/components/puck/FeeWaiver.render'
import type { AlgoEdFooterProps } from '@/components/puck/AlgoEdFooter.render'
import type { CompetitionFooterProps } from '@/components/puck/CompetitionFooter.render'
import type { SummaryGridProps } from '@/components/puck/SummaryGrid.render'
import type { CategoryGridProps } from '@/components/puck/CategoryGrid.render'
import type { CompetitionNavProps } from '@/components/puck/CompetitionNav.render'
import type { ResponsiveImageSectionProps } from '@/components/puck/ResponsiveImageSection.render'
import type { EligibilitySectionProps } from '@/components/puck/EligibilitySection.render'
import type { CompetitionFormatV2Props } from '@/components/puck/CompetitionFormatV2.render'
import type { AboutPartnerV2Props } from '@/components/puck/AboutPartnerV2.render'
import type { AboutLeagueProps } from '@/components/puck/AboutLeague.render'
import type { FosteringSectionProps } from '@/components/puck/FosteringSection.render'

/** Custom root props set on every competition page via the Puck editor sidebar. */
export interface CompetitionRootProps {
  primaryDark: string
  primaryBright: string
  heroTheme: string
  heroTextStyle: string
  highlightOverride: string
  ctaStyle: string
  heroCtaAccent: string
}

/**
 * Map of Puck component name → props interface.
 * Feeds Puck's Config<Components, RootProps> and Data<Components, RootProps>
 * generics to generate a discriminated union for puckData.content.
 */
export interface CompetitionComponents {
  CompetitionHero: CompetitionHeroProps
  TwoColumnFeature: TwoColumnFeatureProps
  BenefitsGrid: BenefitsGridProps
  EligibilityStrip: EligibilityStripProps
  AboutPartner: AboutPartnerProps
  CompetitionStructure: CompetitionStructureProps
  DeadlineTable: DeadlineTableProps
  CompetitionFormat: CompetitionFormatProps
  AwardsSection: AwardsSectionProps
  AwardsSectionLegacy: AwardsSectionLegacyProps
  JoinCTA: JoinCTAProps
  FeeWaiver: FeeWaiverProps
  AlgoEdFooter: AlgoEdFooterProps
  CompetitionFooter: CompetitionFooterProps
  SummaryGrid: SummaryGridProps
  CategoryGrid: CategoryGridProps
  CompetitionNav: CompetitionNavProps
  ResponsiveImageSection: ResponsiveImageSectionProps
  EligibilitySection: EligibilitySectionProps
  CompetitionFormatV2: CompetitionFormatV2Props
  AboutPartnerV2: AboutPartnerV2Props
  AboutLeague: AboutLeagueProps
  FosteringSection: FosteringSectionProps
}

/** Full root props on stored puckData — our fields plus Puck's built-ins (e.g. `title`). */
export type PuckRootProps = CompetitionRootProps & DefaultRootFieldProps

/**
 * Fully typed puckData shape — use this at every DB/consumer boundary.
 *
 * Usage:
 *   const puckData = page.puckData as PuckData | undefined
 *   const hero = puckData?.content.find(c => c.type === 'CompetitionHero')
 *   hero?.props.titleLine1  // typed as string, no cast needed
 */
export type PuckData = Data<CompetitionComponents, PuckRootProps>

/** Name of every component registered in the competition Puck config. */
export type CompetitionComponentName = keyof CompetitionComponents
