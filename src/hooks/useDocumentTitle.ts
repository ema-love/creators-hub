import { useEffect } from 'react'

const DEFAULT_DESCRIPTION =
  "Creator's Hub is a community for young African creatives and builders: anyone carrying an idea they haven't started yet. Register free for Creator's Hub 001: The First Room, Saturday 19 December 2026, 9:00 AM – 3:00 PM (WAT), in Lagos or online."

/** Homepage title: specific enough to stand out from other organisations with a similar name. */
const HOME_TITLE = "Creator's Hub · The First Room · Lagos & online · 19 Dec 2026"

/** Sets the tab title and, for public pages, the search description. */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Creator's Hub` : HOME_TITLE
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = description ?? DEFAULT_DESCRIPTION
  }, [title, description])
}
