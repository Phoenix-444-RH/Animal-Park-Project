import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { useAppState } from "../lib/app-state";

const ROLE_COPY = {
  user: {
    title: "User",
    subtitle: "Premium shopping, vet help, grooming, and live tracking",
    credentials: "Demo: priya@email.com / pass123",
  },
  doctor: {
    title: "Doctor",
    subtitle: "Consultation workflow and clinic-side appointment handling",
    credentials: "Demo: meera@vet.com / doc123",
  },
  groomer: {
    title: "Groomer",
    subtitle: "Pickup grooming, live stages, and customer updates",
    credentials: "Demo: lakshmi@groom.com / groom123",
  },
};

const USER_PREMIUM_PERKS = [
  "Free delivery on product orders",
  "Priority pricing on grooming and consultations",
  "Member-only premium dashboard styling",
  "Fast support and high-visibility tracking perks",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  petType: "dog",
  location: "Chennai",
  subscription: "basic",
  specialization: "General Veterinary",
  clinic: "",
  experience: "",
  certifications: "",
  studio: "",
  specialty: "Dog, Cat",
  pickupVehicle: "Bike",
};

export default function LoginPage() {
  const router = useRouter();
  const { isHydrated, session, login, registerAccount, startCheckout, premiumPlan } = useAppState();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (session) {
      router.replace("/dashboard");
    }
  }, [isHydrated, router, session]);

  const activeCopy = ROLE_COPY[role];
  const userPlanIsPremium = role === "user" && form.subscription === "premium";

  const submitLabel = useMemo(() => {
    if (mode === "login") return `Login as ${role}`;
    if (userPlanIsPremium) return "Continue to premium payment";
    return `Create ${role} account`;
  }, [mode, role, userPlanIsPremium]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        const result = login({ role, email: form.email, password: form.password });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        window.location.href = "/dashboard";
        return;
      }

      if (role === "user" && form.subscription === "premium") {
        startCheckout({
          kind: "premium_signup",
          title: premiumPlan.title,
          subtitle: premiumPlan.subtitle,
          subtotal: premiumPlan.subtotal,
          gstAmount: premiumPlan.gstAmount,
          deliveryFee: premiumPlan.deliveryFee,
          total: premiumPlan.total,
          benefits: premiumPlan.benefits,
          signupData: {
            name: form.name,
            email: form.email,
            password: form.password,
            petType: form.petType,
            location: form.location,
          },
        });
        window.location.href = "/payment";
        return;
      }

      const result = registerAccount({ role, form });
      if (!result.ok) {
        setError(result.error || "Could not create your account.");
        return;
      }

      window.location.href = "/dashboard";
    } finally {
      setSubmitting(false);
    }
  };

  if (!isHydrated || session) return null;

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-slate-900">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-92px)] max-w-6xl items-start px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-1">
            <section className="bg-[radial-gradient(circle_at_top_left,rgba(255,196,87,0.18),transparent_35%),linear-gradient(135deg,#ffffff_0%,#fffdf7_48%,#f7fbf8_100%)] px-8 py-10 sm:px-12 sm:py-12">
              <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#b2770a]">Animal Park access</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl">
                  Login, signup, and eligibility flows
                </h1>
                <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`rounded-full px-6 py-3 text-lg font-medium transition ${mode === "login" ? "bg-[#1e5a35] text-white shadow-[0_14px_30px_rgba(30,90,53,0.2)]" : "text-slate-700 hover:text-slate-900"}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`rounded-full px-6 py-3 text-lg font-medium transition ${mode === "signup" ? "bg-[#1e5a35] text-white shadow-[0_14px_30px_rgba(30,90,53,0.2)]" : "text-slate-700 hover:text-slate-900"}`}
                  >
                    Sign up
                  </button>
                </div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {Object.entries(ROLE_COPY).map(([key, item]) => {
                  const active = role === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(key)}
                      className={`rounded-[1.75rem] border px-6 py-7 text-left transition ${active ? "border-[#1e5a35] bg-[#edf8f0] shadow-[0_18px_40px_rgba(30,90,53,0.08)]" : "border-slate-200 bg-[#f9fbfd] hover:border-slate-300 hover:bg-white"}`}
                    >
                      <div className="text-2xl font-semibold text-slate-900">{item.title}</div>
                      <p className="mt-4 text-xl leading-8 text-slate-600">{item.credentials}</p>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                {mode === "signup" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">Full name</span>
                      <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} required className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                    </label>
                    {role === "user" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Pet type</span>
                        <select value={form.petType} onChange={(event) => updateForm("petType", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10">
                          <option value="dog">Dog</option>
                          <option value="cat">Cat</option>
                        </select>
                      </label>
                    )}
                    {role === "user" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Location</span>
                        <select value={form.location} onChange={(event) => updateForm("location", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10">
                          <option value="Chennai">Chennai</option>
                          <option value="Bangalore">Bangalore</option>
                        </select>
                      </label>
                    )}
                    {role === "user" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Subscription</span>
                        <select value={form.subscription} onChange={(event) => updateForm("subscription", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10">
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                        </select>
                      </label>
                    )}
                    {role === "doctor" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Specialization</span>
                        <input value={form.specialization} onChange={(event) => updateForm("specialization", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                      </label>
                    )}
                    {role === "doctor" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Clinic</span>
                        <input value={form.clinic} onChange={(event) => updateForm("clinic", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                      </label>
                    )}
                    {role === "doctor" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Experience (years)</span>
                        <input value={form.experience} onChange={(event) => updateForm("experience", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                      </label>
                    )}
                    {role === "doctor" && (
                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Certifications</span>
                        <input value={form.certifications} onChange={(event) => updateForm("certifications", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                      </label>
                    )}
                    {role === "groomer" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Studio name</span>
                        <input value={form.studio} onChange={(event) => updateForm("studio", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                      </label>
                    )}
                    {role === "groomer" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Specialty</span>
                        <input value={form.specialty} onChange={(event) => updateForm("specialty", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                      </label>
                    )}
                    {role === "groomer" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Experience (years)</span>
                        <input value={form.experience} onChange={(event) => updateForm("experience", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                      </label>
                    )}
                    {role === "groomer" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Pickup vehicle</span>
                        <select value={form.pickupVehicle} onChange={(event) => updateForm("pickupVehicle", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10">
                          <option value="Bike">Bike</option>
                          <option value="Van">Van</option>
                        </select>
                      </label>
                    )}
                    {role !== "user" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-600">Location</span>
                        <select value={form.location} onChange={(event) => updateForm("location", event.target.value)} className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10">
                          <option value="Chennai">Chennai</option>
                          <option value="Bangalore">Bangalore</option>
                        </select>
                      </label>
                    )}
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
                    <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} required className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
                    <input type="password" value={form.password} onChange={(event) => updateForm("password", event.target.value)} required className="w-full rounded-[1.15rem] border border-slate-200 bg-white px-5 py-4 text-lg outline-none transition focus:border-[#1e5a35] focus:ring-4 focus:ring-[#1e5a35]/10" />
                  </label>
                </div>

                {error ? (
                  <div className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-[1.5rem] bg-[#1e5a35] px-6 py-5 text-xl font-semibold text-white shadow-[0_22px_45px_rgba(30,90,53,0.24)] transition hover:-translate-y-0.5 hover:bg-[#194b2c] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Please wait..." : submitLabel}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}




