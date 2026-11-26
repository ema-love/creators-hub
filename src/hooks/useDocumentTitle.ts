import { useEffect } from 'react'

const DEFAULT_DESCRIPTION =
  'Creators Hub is a creative community in Lagos, Nigeria, bringing together fashion, technology, film and storytelling, and arts and design. Register free for Creators Hub 001: The First Room, Saturday 19 December 2026, 9:00 AM – 3:00 PM (WAT), in Lagos or online.'

/** Homepage title: specific enough to stand out from other organisations named Creators Hub. */
const HOME_TITLE = 'Creators Hub · The First Room · Lagos & online · 19 Dec 2026'

/** Sets the tab title and, for public pages, the search description. */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Creators Hub` : HOME_TITLE
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = description ?? DEFAULT_DESCRIPTION
  }, [title, description])
}
