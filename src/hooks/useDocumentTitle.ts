import { useEffect } from 'react'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Creators Hub` : 'Creators Hub'
  }, [title])
}
