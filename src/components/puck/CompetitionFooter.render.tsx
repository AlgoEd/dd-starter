/**
 * CompetitionFooter — render function and types.
 * Server-safe: no client-only imports.
 *
 * Privacy/terms links and copyright are identical across all competitions — hardcoded.
 * Only primaryColor varies per competition.
 *
 * Links use plain <a> not next/Link: targets are external (www.algoed.co), so
 * Link's client-routing/prefetch would be skipped anyway — it'd just wrap an
 * <a>. If we ever consolidate these legal pages under this app's base URL
 * (e.g. serve /legal/* from here), revisit and switch to next/Link for
 * in-app navigation benefits.
 *
 * Source CSS: .competition-footer, .heading-52, .heading-53, .heading-54, .container-50
 */
import { BRAND_DARK, BRAND_BRIGHT } from './shared'

export interface CompetitionFooterProps {
  bgSource: string
}

export const defaultProps: CompetitionFooterProps = {
  bgSource: 'dark',
}

export function CompetitionFooterRender({ bgSource }: CompetitionFooterProps) {
  const color = (bgSource ?? 'dark') === 'bright' ? BRAND_BRIGHT : BRAND_DARK

  return (
    <section className="py-4 md:py-8" style={{ backgroundColor: color }}>
      <div className="px-3 md:px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-0">
            <a
              href="https://www.algoed.co/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <h6 className="text-white font-medium text-base leading-tight m-0">PRIVACY POLICY</h6>
            </a>
            <a
              href="https://www.algoed.co/legal/terms-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <h6 className="text-white font-medium text-base leading-tight m-0">
                TERMS &amp; CONDITIONS
              </h6>
            </a>
            <h6 className="text-white font-semibold text-base leading-tight m-0">
              &copy;AlgoEd 2026
            </h6>
          </div>
        </div>
      </div>
    </section>
  )
}
