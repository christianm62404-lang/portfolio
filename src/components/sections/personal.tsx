import { site } from "@/content/site";
import { MonoLabel, Panel, SectionHeading } from "@/components/ui/primitives";
import { HiddenPhoto } from "@/components/ui/hidden-photo";
import { Reveal } from "@/components/ui/reveal";

/**
 * Where to find him away from the work. Only ever rendered in the hidden mode,
 * which is the whole reason it can be this personal: the ordinary site leads
 * with GitHub and LinkedIn, and these are not those.
 */
export function Personal({ photo }: { photo?: string | null }) {
  return (
    <Panel id="personal">
      <SectionHeading
        index="07"
        eyebrow="Elsewhere"
        title="Off the clock"
        lede="The rest of it — what is playing, and where the photographs end up."
        meta={[
          {
            label: "Accounts",
            value: String(site.personalSocials.length).padStart(2, "0"),
          },
        ]}
      />

      {site.personalSocials.map((account, index) => (
        <Reveal key={account.label} delay={index * 0.08} className="col col-md">
          <a
            href={account.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border border-line bg-panel/60 p-7 transition-colors duration-300 hover:border-signal"
          >
            <div className="flex items-center gap-3">
              <MonoLabel className="text-signal">
                {String(index + 1).padStart(2, "0")}
              </MonoLabel>
              <MonoLabel>{account.label}</MonoLabel>
              <hr className="rule flex-1" />
              <span
                aria-hidden
                className="text-ink-faint transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-signal"
              >
                &#8599;
              </span>
            </div>

            <p className="mt-5 text-[clamp(1.4rem,2.4vw,1.9rem)] leading-tight font-semibold tracking-tight">
              {account.handle}
            </p>

            <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-dim">
              {account.label === "Spotify"
                ? "Playlists, and whatever has been on repeat while the rest of this was being built."
                : "Photographs, mostly of things that are not code."}
            </p>
          </a>
        </Reveal>
      ))}

      <HiddenPhoto src={photo} />
    </Panel>
  );
}
