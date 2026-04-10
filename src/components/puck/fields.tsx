/**
 * Custom Puck field helpers for competition components.
 * Client-only — uses Puck editor components.
 */
import { FieldLabel } from '@puckeditor/core'

/** Native browser color picker field. Always returns valid hex. */
export function createColorField({ label }: { label: string }) {
  return {
    type: 'custom' as const,
    label,
    render: ({ name, onChange, value, field }: {
      name: string
      onChange: (val: string) => void
      value: string
      field: { label?: string }
    }) => (
      <FieldLabel label={field.label || label}>
        <input
          type="color"
          name={name}
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', height: 40, cursor: 'pointer' }}
        />
      </FieldLabel>
    ),
  }
}
