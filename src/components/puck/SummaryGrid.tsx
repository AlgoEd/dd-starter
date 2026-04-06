/**
 * SummaryGrid — full editor config with field definitions.
 */
import type { ComponentConfig } from '@puckeditor/core'
import { createMediaField } from '@delmaredigital/payload-puck/fields'
import { SummaryGridRender, defaultProps } from './SummaryGrid.render'
import type { SummaryGridProps } from './SummaryGrid.render'

export type { SummaryGridProps, SummaryCard } from './SummaryGrid.render'
export { SummaryGridRender, defaultProps } from './SummaryGrid.render'

export const SummaryGridConfig: ComponentConfig<SummaryGridProps> = {
  label: 'Summary Grid',
  fields: {
    heading: { type: 'text', label: 'Heading' },
    cards: {
      type: 'array',
      label: 'Summary Cards',
      arrayFields: {
        icon: createMediaField({ label: 'Icon' }),
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
      },
    },
    primaryColor: { type: 'text', label: 'Brand Color (hex)' },
  },
  defaultProps,
  render: SummaryGridRender,
}
