import { community, disciplines } from '../content/site'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'
import { Marquee } from '../components/ui/Marquee'

export function Community() {
  return (
    <Section id="community" surface="light" aria-labelledby="community-title" className="overflow-hidden pb-28 md:pb-40">
      <Marquee
        items={[...disciplines.map((d) => d.name), 'Music', 'Writing', 'Photography', 'Architecture']}
        className="border-b border-ink/10 py-6 font-display text-title font-medium text-forest"
      />

      <div className="container-edge pt-24 md:pt-32">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Eyebrow className="text-bright">{community.eyebrow}</Eyebrow>
            <h2 id="community-title" className="mt-6 text-headline font-medium">
              <MaskText lines={[community.title]} />
            </h2>
          </div>
          <p className="text-sm text-ink/60 md:col-span-4 md:col-start-9 md:self-end">{community.note}</p>
        </div>

        <ul className="mt-16 grid gap-x-12 md:mt-24 md:grid-cols-2">
          {community.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={(i % 2) * 0.08}
              className={i % 2 ? 'md:mt-24' : undefined}
            >
              <div className="group border-t border-ink/15 py-10">
                <span className="font-display text-sm text-bright tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-title font-medium">{item.title}</h3>
                <p className="mt-3 max-w-md text-ink/70">{item.body}</p>
                <span
                  aria-hidden="true"
                  className="mt-8 block h-px w-12 bg-forest transition-[width] duration-700 ease-[var(--ease-out-expo)] group-hover:w-32"
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  )
}
