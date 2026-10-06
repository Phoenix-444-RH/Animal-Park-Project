import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { demoProducts } from "../lib/animal-data";

const featuredProducts = demoProducts.slice(0, 3);

const featureCards = [
  {
    title: "Unified pet platform",
    body: "Shopping, vet appointments, grooming, chat, and tracking work together in one premium flow.",
    accent: "from-emerald-100 to-white",
    tag: "Platform",
  },
  {
    title: "Role-aware operations",
    body: "Users, doctors, and groomers all get tailored dashboards with the context they actually need.",
    accent: "from-sky-100 to-white",
    tag: "Workflows",
  },
  {
    title: "Live service visibility",
    body: "Track grooming journeys, order progress, and booking activity with a premium real-time feel.",
    accent: "from-amber-100 to-white",
    tag: "Tracking",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a service",
    body: "Browse curated products, clinics, or premium grooming partners matched to your pet's needs.",
  },
  {
    number: "02",
    title: "Confirm with confidence",
    body: "Review pricing, premium benefits, and slots before moving into a clean checkout flow.",
  },
  {
    number: "03",
    title: "Stay updated live",
    body: "Track appointments, orders, and grooming progress from one dashboard with alerts built in.",
  },
  {
    number: "04",
    title: "Return anytime",
    body: "Receipts, notifications, subscriptions, and role-based actions remain available in your account.",
  },
];

const trackerTimeline = [
  { label: "Booking confirmed", status: "done" },
  { label: "Groomer on the way", status: "active" },
  { label: "Pickup in progress", status: "upcoming" },
  { label: "Spa care started", status: "upcoming" },
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7f3ea_0%,#fffdf8_36%,#edf5ef_100%)] text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden pt-20 sm:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[#ffd98b]/30 blur-3xl" />
          <div className="absolute right-[-5rem] top-28 h-80 w-80 rounded-full bg-[#8de1c8]/18 blur-3xl" />
          <div className="absolute left-1/3 top-44 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.06)] backdrop-blur">
                Premium pet care and live tracking
              </div>

              <h1 className="mt-8 text-5xl font-black tracking-[-0.06em] text-slate-900 sm:text-6xl xl:text-7xl">
                Animal Park brings premium care, booking, and tracking into one elegant pet platform.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Book vets, schedule grooming, shop curated accessories, and follow every service journey through a polished startup-grade experience.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="rounded-full bg-[#1c4a2e] px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_35px_rgba(28,74,46,0.24)] transition hover:-translate-y-0.5 hover:bg-[#245f3b]"
                >
                  Shop Now
                </Link>
                <Link
                  href="/vets"
                  className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-900 shadow-[0_16px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-[#1c4a2e] hover:text-[#1c4a2e]"
                >
                  Find Vet
                </Link>
                <Link
                  href="/groomers"
                  className="rounded-full bg-[#d79312] px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_35px_rgba(215,147,18,0.22)] transition hover:-translate-y-0.5 hover:bg-[#bf7f0c]"
                >
                  Book Grooming
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="text-3xl font-semibold text-slate-900">4.9/5</div>
                  <p className="mt-2 text-sm text-slate-500">Premium service sentiment across care journeys</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="text-3xl font-semibold text-slate-900">3 roles</div>
                  <p className="mt-2 text-sm text-slate-500">Tailored workflows for users, vets, and groomers</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="text-3xl font-semibold text-slate-900">Live</div>
                  <p className="mt-2 text-sm text-slate-500">Tracking, alerts, and premium dashboard visibility</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 34, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-[640px]"
            >
              <div className="absolute inset-6 rounded-[2.4rem] bg-[radial-gradient(circle_at_top,#fff3cf_0%,rgba(255,243,207,0.18)_42%,transparent_72%)] blur-2xl" />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-[2.6rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(245,251,247,0.95)_52%,rgba(236,247,240,0.94)_100%)] p-6 shadow-[0_34px_80px_rgba(15,23,42,0.12)] backdrop-blur"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ffd98b]/40 blur-3xl" />
                <div className="absolute -left-12 bottom-10 h-44 w-44 rounded-full bg-[#93e6ce]/25 blur-3xl" />

                <div className="relative grid gap-4">
                  <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="rounded-[2rem] bg-[#102235] p-6 text-white shadow-[0_20px_44px_rgba(10,24,40,0.32)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                          Live service
                        </span>
                        <span className="rounded-full bg-[#44d5bd]/15 px-3 py-1 text-xs font-semibold text-[#82f1d7]">
                          Active
                        </span>
                      </div>
                      <div className="mt-6">
                        <p className="text-sm text-slate-300">Current grooming journey</p>
                        <h3 className="mt-2 text-2xl font-semibold">Lakshmi's Pet Studio</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          Doorstep pickup, live route updates, and premium service visibility from one dashboard.
                        </p>
                      </div>
                      <div className="mt-6 rounded-[1.4rem] bg-white/6 p-4">
                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>ETA</span>
                          <span className="font-semibold text-white">12 mins</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div className="h-2 w-2/3 rounded-full bg-[linear-gradient(90deg,#44d5bd_0%,#ffb347_100%)]" />
                        </div>
                      </div>
                    </motion.div>

                    <div className="grid gap-4">
                      <motion.div
                        whileHover={{ y: -6 }}
                        className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Order clarity</div>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-[#1ea34a]" />
                            <span className="text-sm font-medium text-slate-700">Consultation confirmed</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-[#44d5bd]" />
                            <span className="text-sm font-medium text-slate-700">Groomer on the way</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-[#d7dee8]" />
                            <span className="text-sm font-medium text-slate-500">Payment completed</span>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -6 }}
                        className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(145deg,#fffaf0_0%,#ffffff_100%)] p-5 shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#946206]">Premium access</div>
                        <h4 className="mt-3 text-xl font-semibold text-slate-900">Member-grade checkout</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Delivery waivers, cleaner receipts, and high-visibility tracking for loyal customers.
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Role-aware dashboards", value: "User, Doctor, Groomer" },
                      { label: "Active routes", value: "Shop, Vets, Groomers" },
                      { label: "Care model", value: "Premium and trackable" },
                    ].map((item) => (
                      <motion.div
                        key={item.label}
                        whileHover={{ y: -6 }}
                        className="rounded-[1.6rem] border border-slate-200 bg-white/88 p-4 shadow-[0_14px_28px_rgba(15,23,42,0.06)]"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {item.label}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-800">{item.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section {...fadeUp} className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#946206]">Trusted features</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
            One premium operating layer for pet care.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Animal Park turns shopping, consultations, grooming, and service visibility into one clean customer experience.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {featureCards.map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.22 }}
              className={`rounded-[2rem] border border-slate-200 bg-[linear-gradient(145deg,var(--tw-gradient-stops))] ${card.accent} p-7 shadow-[0_20px_40px_rgba(15,23,42,0.08)]`}
            >
              <div className="inline-flex rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {card.tag}
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{card.title}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{card.body}</p>
              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#1c4a2e]">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1c4a2e]" />
                Built for visible, premium flows
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-[2.4rem] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fcf9_100%)] p-8 shadow-[0_28px_60px_rgba(15,23,42,0.08)] md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#0c7d84]">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-4xl">
                Designed to feel effortless from booking to completion.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              The homepage now leads users into a simple four-step service journey without overwhelming them.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <motion.div
                key={step.number}
                whileHover={{ y: -8 }}
                className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Step
                  </span>
                  <span className="rounded-full bg-[#eef6f1] px-3 py-1 text-sm font-semibold text-[#1c4a2e]">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.2rem] border border-slate-200 bg-[linear-gradient(160deg,#0b1828_0%,#102235_62%,#0d3340_100%)] p-7 text-white shadow-[0_26px_60px_rgba(8,18,32,0.24)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7cefd7]">Live tracking preview</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">A more premium service handoff.</h3>
              </div>
              <span className="rounded-full bg-[#44d5bd]/14 px-4 py-2 text-sm font-semibold text-[#86f3d9]">
                Live
              </span>
            </div>

            <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Lakshmi's Pet Studio</p>
                  <h4 className="mt-1 text-xl font-semibold text-white">Groomer on the way</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ETA</p>
                  <p className="mt-1 text-lg font-semibold text-white">11 mins</p>
                </div>
              </div>

              <div className="mt-6 h-36 rounded-[1.5rem] bg-[linear-gradient(180deg,#18283c_0%,#101b2a_100%)] p-4">
                <div className="relative h-full overflow-hidden rounded-[1.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))]">
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                  <div className="absolute left-8 top-20 h-2 w-56 rounded-full bg-[#2b6ce8]/30" />
                  <div className="absolute left-8 top-20 h-2 w-40 rounded-full bg-[linear-gradient(90deg,#44d5bd_0%,#2b6ce8_100%)]" />
                  <motion.div
                    animate={{ x: [0, 110, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-8 top-[68px] h-8 w-8 rounded-full border-4 border-white bg-[#ffb347] shadow-[0_8px_20px_rgba(255,179,71,0.35)]"
                  />
                  <div className="absolute left-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Pickup
                  </div>
                  <div className="absolute right-6 bottom-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Studio
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {trackerTimeline.map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-4 w-4 rounded-full ${
                        step.status === "done"
                          ? "bg-[#ffb347]"
                          : step.status === "active"
                          ? "bg-[#44d5bd] shadow-[0_0_0_8px_rgba(68,213,189,0.12)]"
                          : "border border-dashed border-slate-500"
                      }`}
                    />
                    <span className={`${step.status === "upcoming" ? "text-slate-400" : "text-white"} text-sm font-medium`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-slate-200 bg-white p-7 shadow-[0_26px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#745b2a]">Featured products</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                  Premium picks for cats and dogs
                </h2>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-[#1c4a2e] transition hover:text-[#2d6e45]">
                Explore full catalog
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <motion.div key={product.id} whileHover={{ y: -8 }} transition={{ duration: 0.22 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
