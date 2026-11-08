import { useEffect } from 'react'

const DEFAULT_DESCRIPTION =
  'Creators Hub is a multidisciplinary creative organisation and community bringing together people across fashion, technology, film and storytelling, arts and design.'

/** Sets the tab title and, for public pages, the search description. */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Creators Hub` : 'Creators Hub'
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = description ?? DEFAULT_DESCRIPTION
  }, [title, description])
}
