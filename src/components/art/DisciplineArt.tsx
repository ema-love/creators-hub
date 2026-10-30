import type { DisciplineId } from '../../content/site'
import type { ArtProps } from './shared'
import { FashionArt } from './FashionArt'
import { TechnologyArt } from './TechnologyArt'
import { FilmArt } from './FilmArt'
import { ArtDesignArt } from './ArtDesignArt'

const ART: Record<DisciplineId, (props: ArtProps) => React.ReactElement> = {
  fashion: FashionArt,
  technology: TechnologyArt,
  film: FilmArt,
  artdesign: ArtDesignArt,
}

/** Original illustration for a discipline (16:10). */
export function DisciplineArt({ kind, ...props }: ArtProps & { kind: DisciplineId }) {
  const Art = ART[kind]
  return <Art {...props} />
}
