import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const ParallaxComponent = dynamic(
  () => import('@/components/ui/parallax-scrolling').then((mod) => mod.ParallaxComponent),
  { ssr: false },
);

export default function ParallaxDemo() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <Navbar />
      <section className="px-6 pt-28">
        <div className="mx-auto mb-12 max-w-6xl rounded-[2rem] bg-white p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#946206]">UI Demo</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900">Parallax Scrolling Demo</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                This component lives in <code>/components/ui</code> and uses GSAP, ScrollTrigger, Lenis, Tailwind, and TypeScript.
              </p>
            </div>
            <Link href="/" className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white">
              Back Home
            </Link>
          </div>
        </div>
      </section>
      <ParallaxComponent />
      <div className="osmo-credits">
        <p className="osmo-credits__p">
          Resource inspiration adapted for Animal Park
        </p>
      </div>
    </main>
  );
}
