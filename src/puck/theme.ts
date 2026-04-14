/** Hero theme options and resolver — shared between client and server Puck configs. */

export const HERO_THEMES = [
  { label: 'Dark / White + Dark', value: 'dark-white-dark' },
  { label: 'Dark / White + Bright', value: 'dark-white-bright' },
  { label: 'Dark / Bright + White', value: 'dark-bright-white' },
  { label: 'Dark / Bright + Dark', value: 'dark-bright-dark' },
  { label: 'Bright / White + Dark', value: 'bright-white-dark' },
  { label: 'Bright / White + Bright', value: 'bright-white-bright' },
  { label: 'Bright / Dark + White', value: 'bright-dark-white' },
  { label: 'Bright / Dark + Bright', value: 'bright-dark-bright' },
]

export function resolveTheme(theme: string) {
  const [overlay, highlightBg, highlightText] = (theme || 'dark-white-dark').split('-') as [string, string, string]
  const v = (token: string) =>
    token === 'dark' ? 'var(--primary-dark)' : token === 'bright' ? 'var(--primary-bright)' : '#ffffff'
  return {
    overlay: v(overlay),
    heroText: v(highlightBg),
    highlightBg: v(highlightBg),
    highlightText: v(highlightText),
  }
}
