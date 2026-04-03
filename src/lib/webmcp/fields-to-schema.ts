import type { Config, Field } from '@puckeditor/core'

type PuckField = Field & {
  arrayFields?: Record<string, Field>
  objectFields?: Record<string, Field>
}

export type PuckComponentConfig = Config['components'][string]

interface JsonSchemaProperty {
  type: string
  description?: string
  enum?: string[]
  items?: JsonSchemaProperty
  properties?: Record<string, JsonSchemaProperty>
  [key: string]: unknown
}

interface JsonSchema {
  type: 'object'
  properties: Record<string, JsonSchemaProperty>
  description?: string
  [key: string]: unknown
}

function fieldToSchemaProperty(name: string, field: PuckField): JsonSchemaProperty | null {
  const label = field.label || name

  switch (field.type) {
    case 'text':
    case 'textarea':
      return { type: 'string', description: label }

    case 'number':
      return { type: 'number', description: label }

    case 'select':
    case 'radio': {
      // TODO: replace with zod when added as dep. Ugly runtime narrowing because
      // Puck's Field.options is a wide union (string | number | boolean | { label, value } | null | ...).
      // Correct and safe — each check is a real type guard. No cast, no validator dep.
      const enumValues: string[] = []
      for (const opt of field.options || []) {
        if (typeof opt === 'string') enumValues.push(opt)
        else if (typeof opt === 'object' && opt !== null && 'value' in opt && typeof opt.value === 'string') enumValues.push(opt.value)
      }
      return { type: 'string', description: label, enum: enumValues }
    }

    case 'slot':
      return { type: 'array', description: `${label} (slot — accepts nested components)` }

    case 'array': {
      if (field.arrayFields) {
        const itemSchema = fieldsToSchema(field.arrayFields)
        return { type: 'array', description: label, items: itemSchema }
      }
      return { type: 'array', description: label }
    }

    case 'object': {
      if (field.objectFields) {
        const objSchema = fieldsToSchema(field.objectFields)
        return { ...objSchema, description: label }
      }
      return { type: 'object', description: label }
    }

    case 'custom':
      // Custom fields from factories (ColorPicker, Margin, Padding, etc.)
      // Exposed as opaque objects — agent can reference defaultProps for shape
      return { type: 'object', description: `${label} (custom field — see defaultProps for shape)` }

    default:
      return { type: 'string', description: `${label} (${field.type})` }
  }
}

export function fieldsToSchema(fields: Record<string, PuckField | Field>): JsonSchema {
  const properties: Record<string, JsonSchemaProperty> = {}

  for (const [name, field] of Object.entries(fields)) {
    if (name.startsWith('_')) continue
    const prop = fieldToSchemaProperty(name, field)
    if (prop) {
      properties[name] = prop
    }
  }

  return { type: 'object', properties }
}

export interface ComponentSchema {
  name: string
  label: string
  hasSlots: boolean
  fields: JsonSchema
  defaultProps: Record<string, unknown>
}

export function componentConfigToSchema(
  name: string,
  config: PuckComponentConfig,
): ComponentSchema {
  const fields = config.fields || {}
  const hasSlots = Object.values(fields).some((f) => f.type === 'slot')

  return {
    name,
    label: config.label || name,
    hasSlots,
    fields: fieldsToSchema(fields),
    defaultProps: config.defaultProps || {},
  }
}
