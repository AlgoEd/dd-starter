'use client'

import { extendConfig } from '@delmaredigital/payload-puck/config/editor'
import { fullConfig } from '@delmaredigital/payload-puck/config/editor'
import { competitionComponents, competitionCategories } from '@/components/puck'
import { createColorField, createOptionalColorField, createBrandPickerField } from '@/components/puck/fields'
import type { ReactNode } from 'react'

export const puckConfig = extendConfig({
  base: fullConfig,
  components: competitionComponents,
  categories: competitionCategories,
  root: {
    fields: {
      primaryDark: createColorField({ label: 'Primary Dark (text, borders, UI — required)' }),
      primaryBright: createOptionalColorField({ label: 'Primary Bright (hero overlay, accents — optional)' }),
      ctaBgSource: createBrandPickerField({ label: 'CTA Button Background' }),
    },
    defaultProps: {
      primaryDark: '',
      primaryBright: '',
      ctaBgSource: 'dark',
    },
    render: ({ primaryDark, primaryBright, ctaBgSource, children }: { primaryDark?: string; primaryBright?: string; ctaBgSource?: string; children: ReactNode }) => (
      <div style={{
        '--primary-dark': primaryDark || '#222',
        '--primary-bright': primaryBright || primaryDark || '#222',
        '--cta-bg': (ctaBgSource ?? 'dark') === 'bright' ? 'var(--primary-bright)' : 'var(--primary-dark)',
        '--cta-text': (ctaBgSource ?? 'dark') === 'bright' ? 'var(--primary-dark)' : '#ffffff',
      } as React.CSSProperties}>
        {children}
      </div>
    ),
  },
})
