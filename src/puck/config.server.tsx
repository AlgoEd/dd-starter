/**
 * Server-safe Puck Configuration
 *
 * This config is used for server-side rendering with HybridPageRenderer.
 * Imports from .render.tsx files to avoid client-only functions (createMediaField).
 */

import { baseConfig } from '@delmaredigital/payload-puck/config'
import { extendConfig } from '@delmaredigital/payload-puck/config'
import { competitionComponentsServer } from '@/components/puck/index.server'
import { DEFAULT_HERO_THEME, DEFAULT_CTA_STYLE, resolveTheme, resolveCtaStyle } from './theme'
import type { Config, RootConfig } from '@puckeditor/core'
import type { CompetitionRootProps, CompetitionComponents } from './types'
import type { ReactNode } from 'react'

// `satisfies RootConfig<CompetitionRootProps>` validates at the defining site:
// render param shape matches WithChildren<CompetitionRootProps>. The server render
// doesn't define `fields` or `defaultProps` — those live in config.tsx and are
// already validated there — so this mostly catches drift in the render signature.
const rootConfig = {
  render: ({
    primaryDark,
    primaryBright,
    heroTheme,
    heroTextStyle,
    highlightOverride,
    ctaStyle,
    heroCtaAccent,
    children,
  }: Partial<CompetitionRootProps> & { children: ReactNode }) => {
    const override = heroTextStyle === 'default' ? undefined : heroTextStyle
    const t = resolveTheme(heroTheme ?? DEFAULT_HERO_THEME, override)
    const c = resolveCtaStyle(ctaStyle ?? DEFAULT_CTA_STYLE)
    const accentBtn1 = heroCtaAccent?.startsWith('accent-')
    const accentBoth = heroCtaAccent?.startsWith('accent-both')
    const darkText = heroCtaAccent?.endsWith('-dark')
    const heroCta = accentBtn1
      ? {
          bg: 'var(--primary-bright)',
          text: darkText ? 'var(--primary-dark)' : '#ffffff',
          cta2: accentBoth ? 'var(--primary-bright)' : 'var(--hero-text)',
        }
      : { bg: 'var(--highlight-bg)', text: 'var(--highlight-text)', cta2: 'var(--hero-text)' }
    return (
      <div
        style={
          {
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
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    )
  },
} satisfies RootConfig<CompetitionRootProps>

// Single cast at the plugin boundary: extendConfig returns an untyped PuckConfig;
// we restore our typed view on the way out.
export const puckServerConfig = extendConfig({
  base: baseConfig,
  components: competitionComponentsServer,
  root: rootConfig,
}) as unknown as Config<CompetitionComponents, CompetitionRootProps>
