'use client'

import { extendConfig } from '@delmaredigital/payload-puck/config/editor'
import { fullConfig } from '@delmaredigital/payload-puck/config/editor'
import { competitionComponents, competitionCategories } from '@/components/puck'
import { createColorField } from '@/components/puck/fields'
import type { ReactNode } from 'react'

export const puckConfig = extendConfig({
  base: fullConfig,
  components: competitionComponents,
  categories: competitionCategories,
  root: {
    fields: {
      primaryColor: createColorField({ label: 'Primary Brand Color' }),
      secondaryColor: createColorField({ label: 'Secondary Color (for tints; optional)' }),
    },
    defaultProps: {
      primaryColor: '',
      secondaryColor: '',
    },
    render: ({ primaryColor, secondaryColor, children }: { primaryColor?: string; secondaryColor?: string; children: ReactNode }) => (
      <div style={{
        '--brand-color': primaryColor || undefined,
        '--tint-color': secondaryColor || primaryColor || undefined,
      } as React.CSSProperties}>
        {children}
      </div>
    ),
  },
})
