'use client'

import { extendConfig } from '@delmaredigital/payload-puck/config/editor'
import { fullConfig } from '@delmaredigital/payload-puck/config/editor'
import { competitionComponents, competitionCategories } from '@/components/puck'
import { createColorField, createOptionalColorField, createPillField } from '@/components/puck/fields'
import { HERO_THEMES, DEFAULT_HERO_THEME, CTA_STYLES, DEFAULT_CTA_STYLE, resolveTheme, resolveCtaStyle } from './theme'
import type { Config, RootConfig } from '@puckeditor/core'
import type { CompetitionRootProps, CompetitionComponents } from './types'
import type { ReactNode } from 'react'

// `satisfies RootConfig<CompetitionRootProps>` validates at the defining site:
// every `fields` key must be in CompetitionRootProps, defaultProps must match the
// shape, render takes WithChildren<CompetitionRootProps>. Changing the interface
// fails here first — before anything downstream can drift.
const rootConfig = {
  fields: {
    primaryDark: createColorField({ label: 'Primary Dark (text, borders, UI — required)' }),
    primaryBright: createOptionalColorField({ label: 'Primary Bright (hero overlay, accents — optional)', emptyText: 'Using Primary Dark' }),
    heroTheme: {
      type: 'select' as const,
      label: 'Hero Theme',
      options: HERO_THEMES,
    },
    heroTextStyle: createPillField({
      label: 'Hero Text Color',
      options: [
        { label: 'Default (follows highlight)', value: 'default' },
        { label: 'White', value: 'white' },
        { label: 'Primary', value: 'primary' },
      ],
      defaultValue: 'default',
    }),
    highlightOverride: createOptionalColorField({ label: 'Override Highlight', emptyText: 'Using theme preset' }),
    ctaStyle: {
      type: 'select' as const,
      label: 'CTA Button Style',
      options: CTA_STYLES,
    },
    heroCtaAccent: {
      type: 'select' as const,
      label: 'Hero Button Accent',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Accent one, dark text on primary', value: 'accent-one-dark' },
        { label: 'Accent one, white text on primary', value: 'accent-one-white' },
        { label: 'Accent both, dark text on primary', value: 'accent-both-dark' },
        { label: 'Accent both, white text on primary', value: 'accent-both-white' },
      ],
    },
  },
  defaultProps: {
    primaryDark: '',
    primaryBright: '',
    heroTheme: DEFAULT_HERO_THEME,
    heroTextStyle: 'default',
    highlightOverride: '',
    ctaStyle: DEFAULT_CTA_STYLE,
    heroCtaAccent: 'default',
  },
  render: ({ primaryDark, primaryBright, heroTheme, heroTextStyle, highlightOverride, ctaStyle, heroCtaAccent, children }: Partial<CompetitionRootProps> & { children: ReactNode }) => {
    const override = heroTextStyle === 'default' ? undefined : heroTextStyle
    const t = resolveTheme(heroTheme ?? DEFAULT_HERO_THEME, override)
    const c = resolveCtaStyle(ctaStyle ?? DEFAULT_CTA_STYLE)
    const accentBtn1 = heroCtaAccent?.startsWith('accent-')
    const accentBoth = heroCtaAccent?.startsWith('accent-both')
    const darkText = heroCtaAccent?.endsWith('-dark')
    const heroCta = accentBtn1
      ? { bg: 'var(--primary-bright)', text: darkText ? 'var(--primary-dark)' : '#ffffff', cta2: accentBoth ? 'var(--primary-bright)' : 'var(--hero-text)' }
      : { bg: 'var(--highlight-bg)', text: 'var(--highlight-text)', cta2: 'var(--hero-text)' }
    return (
    <div style={{
      '--primary-dark': primaryDark || '#222',
      '--primary-bright': primaryBright || primaryDark || '#222',
      '--hero-overlay': t.overlay,
      '--hero-text': t.heroText,
      '--highlight-bg': highlightOverride || t.highlightBg,
      '--highlight-text': t.highlightText,
      '--hero-cta-bg': heroCta.bg,
      '--hero-cta-text': heroCta.text,
      '--hero-cta2-color': heroCta.cta2,
      '--cta-bg': c.bg,
      '--cta-text': c.text,
      '--cta2-bg': c.bg2,
      '--cta2-text': c.text2,
      '--cta2-border': c.border2,
    } as React.CSSProperties}>
      {children}
    </div>
    )
  },
} satisfies RootConfig<CompetitionRootProps>

// Single cast at the plugin boundary: extendConfig returns an untyped PuckConfig;
// we restore our typed view on the way out. Downstream consumers of Data<...>,
// UsePuck<typeof puckConfig>, etc. get full type safety from this one assertion.
export const puckConfig = extendConfig({
  base: fullConfig,
  components: competitionComponents,
  categories: competitionCategories,
  root: rootConfig,
}) as unknown as Config<CompetitionComponents, CompetitionRootProps>
