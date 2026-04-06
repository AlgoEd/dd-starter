/**
 * CategoryGrid — full editor config with field definitions.
 */
import type { ComponentConfig } from '@puckeditor/core'
import { createMediaField } from '@delmaredigital/payload-puck/fields'
import { CategoryGridRender, defaultProps } from './CategoryGrid.render'
import type { CategoryGridProps } from './CategoryGrid.render'

export type { CategoryGridProps, CategoryItem } from './CategoryGrid.render'
export { CategoryGridRender, defaultProps } from './CategoryGrid.render'

export const CategoryGridConfig: ComponentConfig<CategoryGridProps> = {
  label: 'Category Grid',
  fields: {
    heading: { type: 'text', label: 'Heading' },
    categories: {
      type: 'array',
      label: 'Categories',
      arrayFields: {
        name: { type: 'text', label: 'Category Name' },
        link: { type: 'text', label: 'Category Link' },
        backgroundImage: createMediaField({ label: 'Background Image' }),
      },
    },
  },
  defaultProps,
  render: CategoryGridRender,
}
