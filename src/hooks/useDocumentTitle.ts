import { useEffect } from 'react'
import { pageMeta } from '../content/seo'

const DEFAULT_DESCRIPTION = pageMeta['/'].description

/** Homepage title: specific enough to stand out from other organisations with a similar name. */
const HOME_TITLE = pageMeta['/'].title

/** Sets a public page's exact title and description from src/content/seo.ts (the same words Google receives). */
export function usePageMeta(path: keyof typeof pageMeta) {
  const { title, description } = pageMeta[path]
  useEffect(() => {
    document.title = title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = description
  }, [title, description])
}

/** Sets the tab title and, for public pages, the search description. */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Creator's Hub` : HOME_TITLE
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = description ?? DEFAULT_DESCRIPTION
  }, [title, description])
}
