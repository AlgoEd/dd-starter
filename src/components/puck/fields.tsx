/**
 * Custom Puck field helpers for competition components.
 * Client-only — uses Puck editor components.
 */
import { FieldLabel } from '@puckeditor/core'

/** Color picker that always returns valid hex. For fields that must have a color. */
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

/** Color picker with a clear button. Returns hex or empty string. For optional colors. */
export function createOptionalColorField({ label }: { label: string }) {
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="color"
            name={name}
            value={value || '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            style={{ flex: 1, height: 40, cursor: 'pointer' }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                padding: '8px 12px',
                fontSize: 12,
                border: '1px solid #ccc',
                borderRadius: 4,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
        {!value && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>No color set (transparent)</div>}
      </FieldLabel>
    ),
  }
}
