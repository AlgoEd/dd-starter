import type { Data, PuckAction, Config } from '@puckeditor/core'

export interface PuckStateAccessors {
  getState: () => { data: Data }
  dispatch: (action: PuckAction) => void
  getConfig: () => Config
}

export function createGetPageStateTool(accessors: PuckStateAccessors) {
  return {
    name: 'get_page_state',
    readOnly: true,
    description:
      'Returns the current page state from the Puck editor: the full puckData JSON (root props, content array, zones), plus a summary of components on the page (count, types used). Call this first to understand what exists before making changes.',
    inputSchema: { type: 'object' as const, properties: {} },
    execute: async () => {
      const { data } = accessors.getState()
      const content = data.content || []

      const typeCounts: Record<string, number> = {}
      const countComponents = (items: Data['content']) => {
        for (const item of items) {
          typeCounts[item.type] = (typeCounts[item.type] || 0) + 1
        }
      }
      countComponents(content)
      if (data.zones) {
        for (const zone of Object.values(data.zones)) {
          countComponents(zone)
        }
      }

      const summary = {
        totalComponents: Object.values(typeCounts).reduce((a, b) => a + b, 0),
        componentTypes: typeCounts,
        rootProps: data.root?.props || {},
        hasZones: !!data.zones && Object.keys(data.zones).length > 0,
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ puckData: data, summary }, null, 2) }],
      }
    },
  }
}
