import type { CollectionAfterChangeHook, CollectionSlug, Payload } from 'payload'
import type { FolderDocument } from '../types.js'

interface CascadeOptions {
  collections: string[]
  folderSlug: string
  segmentFieldName: string
  folderFieldName: string
}

/**
 * Creates an afterChange hook for folders that cascades slug updates to all affected pages
 * when a folder's pathSegment changes or it's moved to a different parent.
 *
 * IMPORTANT: Cascade only runs when context.updateSlugs is true.
 * This prevents accidental URL changes when folders are edited through Payload's standard UI.
 * To update slugs, use the tree view's "Update URLs" option or the /api/page-tree/regenerate-slugs endpoint.
 */
export function createCascadeSlugUpdatesHook(
  options: CascadeOptions,
): CollectionAfterChangeHook<FolderDocument> {
  const { collections, folderSlug, folderFieldName } = options

  return async ({ doc, previousDoc, req, context }) => {
    // Prevent infinite loops - check if we're already cascading
    if (context?.cascading) return doc

    // Only cascade if explicitly requested
    // This prevents breaking URLs when folders are edited via Payload's standard UI
    if (!context?.updateSlugs) return doc

    // Check if pathSegment changed or parent folder changed
    const segmentChanged = doc.pathSegment !== previousDoc?.pathSegment
    const parentChanged = getParentId(doc.folder) !== getParentId(previousDoc?.folder)

    if (!segmentChanged && !parentChanged) {
      req.payload.logger.info(`[cascade] no segment/parent change, skipping`)
      return doc
    }

    req.payload.logger.info(
      `[cascade] START segmentChanged=${segmentChanged} parentChanged=${parentChanged}`,
    )
    const t0 = Date.now()

    // Find all folders that are children of this folder (at any depth)
    const childFolderIds = await getAllChildFolderIds(doc.id, req.payload, folderSlug)
    const allAffectedFolderIds = [doc.id, ...childFolderIds]
    req.payload.logger.info(
      `[cascade] found ${allAffectedFolderIds.length} affected folders in ${Date.now() - t0}ms`,
    )

    // Update all pages in affected folders
    for (const collectionSlug of collections) {
      try {
        const t1 = Date.now()
        const { docs: pages } = await req.payload.find({
          collection: collectionSlug as CollectionSlug,
          where: {
            [folderFieldName]: {
              in: allAffectedFolderIds,
            },
          },
          limit: 0,
          depth: 0,
        })
        req.payload.logger.info(
          `[cascade] found ${pages.length} pages in ${collectionSlug} in ${Date.now() - t1}ms`,
        )

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          const t2 = Date.now()
          req.payload.logger.info(
            `[cascade] updating page ${i + 1}/${pages.length} id=${page.id}...`,
          )
          await req.payload.update({
            collection: collectionSlug as CollectionSlug,
            id: page.id,
            data: {},
            context: { cascading: true, updateSlugs: true },
            req,
          })
          req.payload.logger.info(`[cascade] page ${page.id} updated in ${Date.now() - t2}ms`)
        }
      } catch (error) {
        req.payload.logger.info(`[cascade] ERROR in ${collectionSlug}: ${error}`)
        console.error(
          `[payload-page-tree] Error updating ${collectionSlug} slugs after folder change:`,
          error,
        )
      }
    }

    req.payload.logger.info(`[cascade] DONE total=${Date.now() - t0}ms`)
    return doc
  }
}

/**
 * Recursively finds all child folder IDs
 */
async function getAllChildFolderIds(
  parentId: number | string,
  payload: Payload,
  folderSlug: string,
): Promise<(number | string)[]> {
  const result = await payload.find({
    collection: folderSlug as CollectionSlug,
    where: {
      folder: {
        equals: parentId,
      },
    },
    limit: 0,
    depth: 0,
  })

  const children = result.docs as unknown as FolderDocument[]
  const childIds = children.map((child) => child.id)

  // Recursively get grandchildren
  const grandchildIds: (number | string)[] = []
  for (const childId of childIds) {
    const descendants = await getAllChildFolderIds(childId, payload, folderSlug)
    grandchildIds.push(...descendants)
  }

  return [...childIds, ...grandchildIds]
}

/**
 * Helper to extract parent folder ID from potentially populated field
 */
function getParentId(
  folder: number | string | FolderDocument | null | undefined,
): number | string | null {
  if (!folder) return null
  if (typeof folder === 'object') return folder.id
  return folder
}
