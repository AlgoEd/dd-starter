import type { Metadata } from 'next'

import type { Page, Post } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const serverUrl = getServerSideURL()
  // OG image is always auto-generated via /api/og — no manual upload picker exists
  const ogImage = doc?.slug ? `${serverUrl}/api/og?slug=${encodeURIComponent(doc.slug)}` : ''

  const rawTitle = doc?.meta?.title || ''
  // Prepend brand prefix unless the title already contains it
  const title = rawTitle
    ? rawTitle.toLowerCase().includes('algoed') ? rawTitle : `AlgoEd | ${rawTitle}`
    : 'AlgoEd'

  const canonicalUrl = doc?.slug ? `${serverUrl}/${doc.slug}` : serverUrl

  return {
    description: doc?.meta?.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: doc?.slug ? `/${doc.slug}` : '/',
    }),
    title,
  }
}
