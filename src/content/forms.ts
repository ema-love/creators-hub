/** Netlify form names. Must match the static form stubs in index.html. */
export const formNames = {
  volunteer: 'volunteer',
  partnership: 'partnership',
  contact: 'contact',
} as const

export type FormName = (typeof formNames)[keyof typeof formNames]
