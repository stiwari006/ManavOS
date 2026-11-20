import { Reveal, RevealLines } from "./Reveal";

const ITEMS = [
  ["Security", "Encryption in transit and at rest, SSO/SAML and role-based access. Built toward SOC 2 Type II."],
  ["Privacy", "Candidate data is never used to train shared models. Retention windows you set, deletion on request."],
  ["Disclosure by design", "Every persona says it's an AI at the start of every conversation. Not configurable."],
  ["Fairness", "Same questions, same rubric for everyone, with adverse-impact reporting on outcomes."],
  ["Scale & reliability", "Thousands of concurrent sessions, regional media routing and a public status page."],
  ["Custom deployment", "Dedicated tenancy, data residency options and private networking for regulated teams."],
];

export function Enterprise() {
  return (
    <section id="enterprise" className="section border-t border-line">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="t-mono text-mute">Enterprise</p>
          <RevealLines className="t-h2 mt-5" lines={["Built for the", "interviews", "that matter."]} />
        </div>
        <div className="lg:col-span-8">
          <dl className="grid sm:grid-cols-2">
            {ITEMS.map(([k, v], i) => (
              <Reveal key={k} delay={(i % 2) * 0.08}>
                <div className="border-t border-line py-7 sm:pr-10">
                  <dt className="text-[1.3rem] font-medium tracking-[-0.035em]">{k}</dt>
                  <dd className="t-body mt-2 max-w-[40ch] text-ink/65">{v}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
