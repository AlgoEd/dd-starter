import { componentConfigToSchema, type ComponentSchema } from '../fields-to-schema'
import type { PuckStateAccessors } from './get-page-state'

export function createGetComponentSchemaTool(accessors: PuckStateAccessors) {
  return {
    name: 'get_component_schema',
    readOnly: true,
    description:
      'Returns the full schema for available Puck components: field definitions (with types, labels, enums), default props, and whether the component has slots for nesting child components. Pass a component name to get one, or omit to get all. Use this to understand what props are valid before calling update_page.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        component: {
          type: 'string',
          description:
            'Optional. Name of a specific component (e.g. "Section", "Heading", "Button"). Omit to get all components.',
        },
      },
    },
    execute: async (params: { component?: string }) => {
      const config = accessors.getConfig()
      const components = config.components

      let schemas: ComponentSchema[]

      if (params.component) {
        const comp = components[params.component]
        if (!comp) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Component "${params.component}" not found. Available: ${Object.keys(components).join(', ')}`,
              },
            ],
            isError: true,
          }
        }
        schemas = [componentConfigToSchema(params.component, comp)]
      } else {
        schemas = Object.entries(components).map(([name, comp]) =>
          componentConfigToSchema(name, comp),
        )
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(schemas, null, 2) }],
      }
    },
  }
}
