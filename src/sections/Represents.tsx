import { represents } from '../content/site'
import { Section } from '../components/layout/Section'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MaskText } from '../components/ui/MaskText'
import { Reveal } from '../components/ui/Reveal'

export function Represents() {
  return (
    <Section id="represents" surface="dark" aria-labelledby="represents-title" className="py-28 md:py-40">
      <div className="container-edge grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Eyebrow className="text-electric">{represents.eyebrow}</Eyebrow>
            <h2 id="represents-title" className="mt-6 text-headline font-medium">
              <MaskText lines={[represents.title]} />
            </h2>
          </div>
        </div>

        <ol className="md:col-span-7">
          {represents.items.map((item, i) => (
            <Reveal as="li" key={item.n} delay={i * 0.05} className="group border-t hairline last:border-b">
              <div className="grid grid-cols-[3.5rem_1fr] gap-x-4 py-8 md:grid-cols-[5rem_1fr] md:py-10">
                <span className="font-display text-sm text-silver tabular-nums transition-colors duration-500 group-hover:text-electric">
                  {item.n}
                </span>
                <div>
                  <h3 className="flex items-center gap-4 text-title font-medium">
                    <span className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                      {item.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 scale-0 rounded-full bg-electric transition-transform duration-500 group-hover:scale-100"
                    />
                  </h3>
                  <p className="mt-3 max-w-xl text-cream/70">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  )
}
