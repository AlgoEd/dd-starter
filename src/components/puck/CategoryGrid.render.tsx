/**
 * CategoryGrid — render function and types.
 * Server-safe: no client-only imports.
 *
 * Grid of selectable category cards with optional background images.
 * Reference: docs/reference/webflow/harvard-quiz-bowl.html section.section-88
 * Source CSS: .section-88, .link-block-34
 */
import type { MediaReference } from '@delmaredigital/payload-puck/fields'

export interface CategoryItem {
  name: string
  link: string
  backgroundImage: MediaReference | null
}

export interface CategoryGridProps {
  heading: string
  categories: CategoryItem[]
}

export const defaultProps: CategoryGridProps = {
  heading: 'Choose Category',
  categories: [
    { name: 'Economics & Business', link: '#', backgroundImage: null },
    { name: 'World History', link: '#', backgroundImage: null },
    { name: 'Math', link: '#', backgroundImage: null },
    { name: 'Biology', link: '#', backgroundImage: null },
    { name: 'Physics', link: '#', backgroundImage: null },
    { name: 'Chemistry', link: '#', backgroundImage: null },
  ],
}

export function CategoryGridRender({
  heading, categories,
}: CategoryGridProps) {
  return (
    <section style={{ paddingTop: '50px', paddingBottom: '50px' }}>
      <div className="max-w-[940px] mx-auto px-4 md:px-0">
        <h2
          className="font-poppins font-bold text-center mb-8"
          style={{ fontSize: '26px', color: '#333' }}
        >
          {heading}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
          {categories.map((cat, i) => (
            <a
              key={i}
              href={cat.link}
              className="no-underline rounded-[15px] flex items-end font-poppins"
              style={{
                backgroundColor: '#f2f3f0',
                backgroundImage: cat.backgroundImage?.url ? `url(${cat.backgroundImage.url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '20px 23px',
                width: '100%',
                maxWidth: '210px',
                minHeight: '80px',
                color: '#000',
                fontSize: '18px',
                fontWeight: 700,
                lineHeight: '22px',
              }}
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
