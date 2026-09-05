import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";

const STEPS = [
  {
    title: "Post and fund",
    description:
      "A company describes the work and puts the budget in up front. The money is held, not sent.",
  },
  {
    title: "Get matched",
    description:
      "Students apply. The company picks one and shares the files they need to start.",
  },
  {
    title: "Submit work",
    description:
      "The student hands in the finished work with a link and a summary of what was built.",
  },
  {
    title: "Automatic payout",
    description:
      "An independent review scores the work against the brief. Pass, and the payment releases.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <span className="text-card-title font-semibold text-ink">TrustMesh</span>
          <nav className="flex items-center gap-6">
            <Link href="/verify" className="hidden text-body text-ink-soft hover:text-ink sm:block">
              Check a claim
            </Link>
            <Link href="/login" className="hidden text-body text-ink-soft hover:text-ink sm:block">
              For companies
            </Link>
            <Link href="/login" className="hidden text-body text-ink-soft hover:text-ink sm:block">
              For students
            </Link>
            <ButtonLink href="/login" size="sm">
              Sign in
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-content px-6 py-24">
          <h1 className="max-w-3xl text-hero font-semibold tracking-tight text-ink">
            Post a job. Get matched. Pay only for verified work.
          </h1>
          <p className="mt-6 max-w-2xl text-body text-ink-soft">
            TrustMesh connects Malaysian companies with university students for paid project work.
            The budget is locked on Sui before the work starts, and released once Gonka multi-model AI consensus
            verifies the deliverables against the brief.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/login" size="lg">
              I&rsquo;m a company
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">
              I&rsquo;m a student
            </ButtonLink>
          </div>
        </section>

        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-content px-6 py-24">
            <h2 className="text-section font-semibold text-ink">How it works</h2>
            <div className="mt-12">
              <Stepper steps={STEPS} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-content px-6 py-24">
          <h2 className="max-w-2xl text-section font-semibold text-ink">
            Neither side has to trust the other
          </h2>
          <div className="mt-8 grid max-w-4xl gap-12 sm:grid-cols-2">
            <div>
              <h3 className="text-card-title font-medium text-ink">For the student</h3>
              <p className="mt-3 text-body text-ink-soft">
                The money is already set aside before you start. The company cannot take it back
                once your work has passed the review, and you can see the budget sitting in escrow
                the whole time you are working.
              </p>
            </div>
            <div>
              <h3 className="text-card-title font-medium text-ink">For the company</h3>
              <p className="mt-3 text-body text-ink-soft">
                Nothing is paid out for work that does not match the brief. The review scores the
                submission out of 100, and the payment only unlocks at 80 or above.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-content px-6 py-16">
            <p className="text-small text-ink-soft">
              Built on Sui. Sign-in uses zkLogin, so students sign in with Google rather than
              managing a wallet, and network fees are covered for both sides. The review runs
              through Gonka Router.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 px-6 py-8 text-small text-ink-soft">
          <span>TrustMesh — MUBA Hacks 2026</span>
          <span>Demo authentication. Production would verify the zkLogin JWT server-side.</span>
        </div>
      </footer>
    </div>
  );
}
