import { useEffect } from 'react'

const DEFAULT_DESCRIPTION =
  'Creators Hub is a creative community in Lagos, Nigeria, bringing together fashion, technology, film and storytelling, and arts and design. Register free for Creators Hub 001: The First Room on 19 December 2026.'

/** Homepage title: specific enough to stand out from other organisations named Creators Hub. */
const HOME_TITLE = 'Creators Hub · The First Room, Lagos · 19 December 2026'

/** Sets the tab title and, for public pages, the search description. */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Creators Hub` : HOME_TITLE
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = description ?? DEFAULT_DESCRIPTION
  }, [title, description])
}
