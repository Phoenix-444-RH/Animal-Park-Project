'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useAppState } from "../lib/app-state";

export default function GroomersPage() {
  const router = useRouter();
  const { session, startCheckout, groomers, groomingBookings, groomingServices, groomingTimeSlots, currentUser } = useAppState();
  const [location, setLocation] = useState("");
  const [petType, setPetType] = useState(currentUser?.petType || "Dog");
  const [vehicleType, setVehicleType] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedServices, setSelectedServices] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});
  const [notice, setNotice] = useState("");
  const [openSelect, setOpenSelect] = useState(null);
  const filtersRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;

    if (typeof router.query.location === "string") setLocation(router.query.location);
    if (typeof router.query.petType === "string") setPetType(router.query.petType);
    if (typeof router.query.vehicleType === "string") setVehicleType(router.query.vehicleType);
    if (typeof router.query.service === "string") setServiceFilter(router.query.service);
    if (typeof router.query.minRating === "string") {
      const nextRating = Number(router.query.minRating);
      if (!Number.isNaN(nextRating)) setMinRating(nextRating);
    }
    if (typeof router.query.sortBy === "string") setSortBy(router.query.sortBy);
  }, [router.isReady, router.query.location, router.query.petType, router.query.vehicleType, router.query.service, router.query.minRating, router.query.sortBy]);

  const groomerProfiles = {
    "g1": {
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1400&q=80",
      mood: "Luxury pickup studio",
      quality: "Premium finish",
      qualityFactor: 1.12,
      accent: "from-emerald-950/80 via-emerald-800/55 to-transparent",
    },
    "g2": {
      image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1400&q=80",
      mood: "Fast home-service hub",
      quality: "Express care",
      qualityFactor: 1.04,
      accent: "from-sky-950/75 via-sky-800/50 to-transparent",
    },
    "g3": {
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80",
      mood: "Spa-grade grooming suites",
      quality: "Elite spa quality",
      qualityFactor: 1.1,
      accent: "from-fuchsia-950/75 via-rose-700/45 to-transparent",
    },
    "g4": {
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
      mood: "Calm feline-only lounge",
      quality: "Quiet cat care",
      qualityFactor: 1.03,
      accent: "from-indigo-950/75 via-violet-800/45 to-transparent",
    },
    "g5": {
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
      mood: "Flagship luxury spa",
      quality: "Signature luxury",
      qualityFactor: 1.16,
      accent: "from-amber-950/80 via-orange-800/45 to-transparent",
    },
    "g6": {
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      mood: "Friendly family grooming",
      quality: "Balanced value",
      qualityFactor: 1.05,
      accent: "from-teal-950/75 via-cyan-800/45 to-transparent",
    },
    "g7": {
      image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80",
      mood: "Mobile palace salon",
      quality: "High-comfort mobile care",
      qualityFactor: 1.11,
      accent: "from-emerald-950/80 via-lime-800/35 to-transparent",
    },
    "g8": {
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
      mood: "Young urban grooming pod",
      quality: "Budget quick care",
      qualityFactor: 0.98,
      accent: "from-slate-950/75 via-slate-700/45 to-transparent",
    },
    "g9": {
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      mood: "Low-stress cat retreat",
      quality: "Comfort-first feline spa",
      qualityFactor: 1.08,
      accent: "from-purple-950/75 via-pink-700/45 to-transparent",
    },
    "g10": {
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
      mood: "Citywide van salon",
      quality: "Professional urban care",
      qualityFactor: 1.06,
      accent: "from-cyan-950/80 via-blue-800/45 to-transparent",
    },
  };

  const getGroomerProfile = (groomer) => groomerProfiles[groomer.id] || {
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1400&q=80",
    mood: "Premium pet spa",
    quality: "Signature care",
    qualityFactor: 1.05,
    accent: "from-emerald-950/80 via-emerald-800/45 to-transparent",
  };

  const groomerServiceMap = {
    g1: ["svc1", "svc2", "svc3", "svc4", "svc5", "svc6", "svc7", "svc8"],
    g2: ["svc1", "svc4", "svc5", "svc8"],
    g3: ["svc1", "svc2", "svc3", "svc4", "svc5", "svc6", "svc8"],
    g4: ["svc1", "svc2", "svc4", "svc6", "svc8"],
    g5: ["svc1", "svc2", "svc3", "svc4", "svc5", "svc6", "svc7", "svc8"],
    g6: ["svc1", "svc2", "svc4", "svc5", "svc6"],
    g7: ["svc1", "svc2", "svc3", "svc4", "svc5", "svc7", "svc8"],
    g8: ["svc1", "svc4", "svc5"],
    g9: ["svc1", "svc2", "svc4", "svc6", "svc8"],
    g10: ["svc1", "svc2", "svc4", "svc5", "svc6", "svc8"],
  };

  const serviceStory = {
    svc1: "Warm water rinse, skin-safe shampoo, and fluff-dry comfort with anti-slip handling.",
    svc2: "Aromatherapy steam wrap, coat-softening mask, and salon-grade finishing spray.",
    svc3: "Precision trimming shears, rounded-edge styling, and breed-aware coat shaping.",
    svc4: "Low-noise filing tools, paw-pad balm, and stress-light handling for sensitive paws.",
    svc5: "Dermal-safe cleanse, medicated comb-through, and hygienic tool sterilisation.",
    svc6: "Soft-bristle oral tools, fresh-breath gel, and enamel-friendly plaque care.",
    svc7: "Pressure-light paw kneading, calming lotion, and warm towel comfort therapy.",
    svc8: "De-matting comb system, de-shed vacuum assist, and coat-smoothing finish.",
  };

  const getGroomerServices = (groomer) => {
    const allowed = groomerServiceMap[groomer.id] || groomingServices.map((service) => service.id);
    return groomingServices.filter((service) => allowed.includes(service.id) && service.petTypes.includes(petType));
  };

  const getAdjustedServicePrice = (groomer, service) => {
    const profile = getGroomerProfile(groomer);
    const ratingFactor = 1 + Math.max(0, groomer.rating - 4) * 0.06;
    const experienceFactor = 1 + Math.min(groomer.experience, 15) * 0.012;
    return Math.round(service.basePrice * ratingFactor * experienceFactor * profile.qualityFactor);
  };

  const getStartingPrice = (groomer) => {
    const availableServices = getGroomerServices(groomer);
    const prices = availableServices.map((service) => getAdjustedServicePrice(groomer, service));
    return prices.length ? Math.min(...prices) : 0;
  };

  const isGroomerAccount = session?.role === "groomer";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenSelect(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGroomers = useMemo(() => {
    return groomers
      .filter((groomer) => {
        const availableServices = getGroomerServices(groomer);
        const minServicePrice = getStartingPrice(groomer);

        if (location && !groomer.location.toLowerCase().includes(location.toLowerCase())) return false;
        if (!groomer.petSpecialties.includes(petType)) return false;
        if (vehicleType && groomer.vehicleType !== vehicleType) return false;
        if (serviceFilter && !availableServices.some((service) => service.name === serviceFilter)) return false;
        if (groomer.rating < minRating) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "experience") return b.experience - a.experience;
        if (sortBy === "price-low") {
          return getStartingPrice(a) - getStartingPrice(b);
        }
        return (b.rating * 100 + b.experience * 10) - (a.rating * 100 + a.experience * 10);
      });
  }, [groomers, location, petType, vehicleType, serviceFilter, minRating, sortBy, groomingServices]);

  const vehicleOptions = [...new Set(groomers.map((groomer) => groomer.vehicleType))];
  const serviceOptions = [...new Set(
    groomers
      .flatMap((groomer) => getGroomerServices(groomer).map((service) => service.name))
  )];

  const renderPremiumSelect = (id, value, onChange, options, placeholder) => {
    const selectedOption = options.find((option) => option.value === value);
    const isOpen = openSelect === id;

    return (
      <div className="relative min-w-[220px]">
        <button
          type="button"
          onClick={() => setOpenSelect((current) => (current === id ? null : id))}
          className={`group relative w-full overflow-hidden rounded-[1.7rem] border px-6 py-4 text-left transition duration-300 ${
            isOpen
              ? "border-[#7ecad1] bg-[linear-gradient(135deg,#eefbff_0%,#dcf7f5_42%,#eef5ff_100%)] shadow-[0_24px_52px_rgba(74,163,173,0.18)]"
              : "border-white/70 bg-[linear-gradient(135deg,#fefeff_0%,#edf9fb_46%,#eef4ff_100%)] shadow-[0_18px_34px_rgba(28,74,46,0.08)] hover:-translate-y-0.5 hover:shadow-[0_26px_44px_rgba(52,124,132,0.16)]"
          }`}
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[radial-gradient(circle_at_center,rgba(111,214,223,0.45),rgba(255,255,255,0))]" />
          <span className="relative z-10 block pr-10 text-sm font-semibold text-slate-800">
            {selectedOption?.label || placeholder}
          </span>
          <span className={`pointer-events-none absolute right-6 top-1/2 z-10 -translate-y-1/2 text-[#1c4a2e] transition duration-300 ${
            isOpen ? "rotate-180 scale-110" : "group-hover:translate-y-[-55%]"
          }`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%-2px)] z-30 overflow-hidden rounded-[1.45rem] border border-[#9ed8de] bg-[linear-gradient(180deg,#fbfeff_0%,#eafafb_100%)] p-2 shadow-[0_26px_70px_rgba(52,124,132,0.18)]">
            <button
              type="button"
              onClick={() => {
                onChange({ target: { value: "" } });
                setOpenSelect(null);
              }}
              className={`flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-sm font-medium transition duration-200 ${
                value === ""
                  ? "bg-[linear-gradient(135deg,#1c4a2e,#2d6d45)] text-white shadow-[0_14px_24px_rgba(28,74,46,0.25)]"
                  : "text-slate-700 hover:bg-[linear-gradient(135deg,#dcf7f5,#eef8ff)] hover:text-[#18636c] hover:translate-x-1"
              }`}
            >
              <span>{placeholder}</span>
              {value === "" && <span className="text-[10px] uppercase tracking-[0.24em] text-white/80">Any</span>}
            </button>
            <div className="mt-2 space-y-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: option.value } });
                      setOpenSelect(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-sm font-medium transition duration-200 ${
                      isSelected
                        ? "bg-[linear-gradient(135deg,#1c4a2e,#2d6d45)] text-white shadow-[0_14px_24px_rgba(28,74,46,0.22)]"
                        : "text-slate-700 hover:bg-[linear-gradient(135deg,#dcf7f5,#eef8ff)] hover:text-[#18636c] hover:translate-x-1"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span className="text-[10px] uppercase tracking-[0.24em] text-white/80">Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <Navbar />
      <section className="pt-28">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-10 rounded-[2rem] bg-white p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#2c6f77]">Grooming marketplace</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Pickup grooming with live website notifications.</h1>
            <p className="mt-4 max-w-3xl text-slate-600">Choose pet type, services, and get Zomato-style stage updates once the groomer takes the pet away.</p>
          </div>

          <div ref={filtersRef} className="mb-8 rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#fbfcfe_100%)] p-5 shadow-[0_22px_48px_rgba(28,74,46,0.08)]">
            <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or area" className="rounded-[1.7rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#f5fbff_100%)] px-5 py-4 shadow-[0_18px_34px_rgba(28,74,46,0.08)] outline-none placeholder:text-slate-400" />
              {renderPremiumSelect(
                "petType",
                petType,
                (e) => setPetType(e.target.value),
                [
                  { value: "Dog", label: "Dog" },
                  { value: "Cat", label: "Cat" },
                ],
                "Pet type",
              )}
              {renderPremiumSelect(
                "vehicleType",
                vehicleType,
                (e) => setVehicleType(e.target.value),
                vehicleOptions.map((option) => ({ value: option, label: option })),
                "Any vehicle",
              )}
              {renderPremiumSelect(
                "sortBy",
                sortBy,
                (e) => setSortBy(e.target.value),
                [
                  { value: "recommended", label: "Recommended first" },
                  { value: "rating", label: "Top rated" },
                  { value: "experience", label: "Most experienced" },
                  { value: "price-low", label: "Lowest starting price" },
                ],
                "Sort groomers",
              )}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              {renderPremiumSelect(
                "serviceFilter",
                serviceFilter,
                (e) => setServiceFilter(e.target.value),
                serviceOptions.map((option) => ({ value: option, label: option })),
                "Any service",
              )}
              <div className="rounded-[1.5rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#f5fbff_100%)] px-4 py-3 shadow-[0_16px_28px_rgba(28,74,46,0.08)]">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2c6f77]">Rating slider</span>
                  <span className="rounded-full bg-[#eef6ef] px-2.5 py-1 text-[11px] font-semibold text-[#1c4a2e]">{minRating.toFixed(1)} and above</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,#1c4a2e_0%,#28b6c5_100%)] accent-[#1c4a2e]"
                />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>0.0</span>
                  <span>5.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredGroomers.map((groomer) => {
              const profile = getGroomerProfile(groomer);
              const availableServices = getGroomerServices(groomer);
              const chosen = selectedServices[groomer.id] || [];
              const chosenSlot = selectedSlots[groomer.id] || "";
              const subtotal = availableServices.filter((item) => chosen.includes(item.id)).reduce((sum, item) => sum + getAdjustedServicePrice(groomer, item), 0);
              const total = Math.round(subtotal * (currentUser?.subscription === "premium" ? 0.9 : 1));
              const startingPrice = getStartingPrice(groomer);
              const lockedSlots = groomingBookings
                .filter((booking) => booking.groomerId === groomer.id && booking.status === "accepted" && booking.stage !== "Delivered back")
                .map((booking) => booking.timeSlot);

              return (
                <motion.div key={groomer.id} whileHover={{ y: -6 }} className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf5_100%)] shadow-[0_24px_60px_rgba(28,74,46,0.12)]">
                  <div className="relative h-60 overflow-hidden">
                    <img src={groomer.image || profile.image} alt={groomer.salonName} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${profile.accent}`} />
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
                      <div className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-xl">
                        {profile.quality}
                      </div>
                      <div className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">
                        {groomer.experience} yrs
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#fff2bf] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#18636c]">{groomer.location}</span>
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-xl">Starting from Rs. {startingPrice}</span>
                      </div>
                      <h2 className="text-3xl font-semibold leading-tight">{groomer.name}</h2>
                      <p className="mt-1 text-sm text-white/85">{profile.mood}</p>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,#f7fbf8,#edf7f0)] px-4 py-4 shadow-inner">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2c6f77]">Rating</div>
                        <div className="mt-2 text-2xl font-bold text-slate-900">{groomer.rating}</div>
                      </div>
                      <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,#f9fbff,#eef4ff)] px-4 py-4 shadow-inner">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2c6f77]">Vehicle</div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{groomer.vehicleType}</div>
                      </div>
                      <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,#fffdf7,#fff4dd)] px-4 py-4 shadow-inner">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2c6f77]">Quality</div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{profile.quality}</div>
                      </div>
                      <div className="rounded-[1.35rem] bg-[linear-gradient(135deg,#fdf8ff,#f6eeff)] px-4 py-4 shadow-inner">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2c6f77]">Specialty</div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{groomer.petSpecialties.join(", ")}</div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.6rem] border border-[#eef1f4] bg-[linear-gradient(180deg,#f8fbff_0%,#f5f7fb_100%)] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2c6f77]">Available services for {petType}</p>
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm">Curated spa menu</span>
                      </div>
                      <div className="grid gap-3">
                        {availableServices.map((service) => {
                          const adjustedPrice = getAdjustedServicePrice(groomer, service);
                          return (
                            <label key={service.id} className="group flex items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-[#d7b463] hover:shadow-[0_16px_28px_rgba(200,136,10,0.12)]">
                              <span>
                                <span className="block text-base font-semibold text-slate-900">{service.name}</span>
                                <span className="mt-1 block max-w-[28rem] text-xs leading-5 text-slate-500">{serviceStory[service.id] || "Comfort-first grooming with hygienic tools and premium finishing care."}</span>
                              </span>
                              <span className="flex items-center gap-3">
                                <span className="rounded-full bg-[linear-gradient(135deg,#fff5d8,#fffaf0)] px-4 py-2 text-sm font-semibold text-[#18636c]">Rs. {adjustedPrice}</span>
                                <input
                                  type="checkbox"
                                  checked={chosen.includes(service.id)}
                                  onChange={(event) =>
                                    setSelectedServices((prev) => ({
                                      ...prev,
                                      [groomer.id]: event.target.checked
                                        ? [...(prev[groomer.id] || []), service.id]
                                        : (prev[groomer.id] || []).filter((item) => item !== service.id),
                                    }))
                                  }
                                  disabled={isGroomerAccount}
                                  className={`h-5 w-5 rounded border-slate-300 text-[#1c4a2e] focus:ring-[#1c4a2e] ${isGroomerAccount ? "hidden" : ""}`}
                                />
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`mt-5 rounded-[1.6rem] border border-[#eef1f4] bg-[linear-gradient(180deg,#fcfcfc_0%,#f7faf7_100%)] p-5 ${isGroomerAccount ? "hidden" : ""}`}>
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#2c6f77]">Choose time slot</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {groomingTimeSlots.map((slot) => {
                          const isLocked = lockedSlots.includes(slot);
                          const isSelected = chosenSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isLocked}
                              onClick={() => setSelectedSlots((prev) => ({ ...prev, [groomer.id]: slot }))}
                              className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm transition ${
                                isLocked
                                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                  : isSelected
                                    ? "border-[#1c4a2e] bg-[linear-gradient(135deg,#e6f2ea,#f4fbf5)] text-[#1c4a2e] shadow-[0_12px_24px_rgba(28,74,46,0.12)]"
                                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#d7b463] hover:shadow-[0_14px_24px_rgba(28,74,46,0.08)]"
                              }`}
                            >
                              <div className="font-semibold">{slot}</div>
                              <div className="mt-1 text-xs uppercase tracking-[0.16em]">
                                {isLocked ? "Accepted slot locked" : isSelected ? "Selected" : "Available"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`mt-6 flex items-end justify-between gap-4 ${isGroomerAccount ? "hidden" : ""}`}>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2c6f77]">Estimated total</div>
                        <div className="mt-2 text-3xl font-bold text-[#1c4a2e]">Rs. {total}</div>
                        <div className="mt-1 text-sm text-slate-500">Premium users get 10% off grooming totals</div>
                      </div>
                      <button
                        onClick={() => {
                          if (!session || session.role !== "user") {
                            router.push("/login");
                            return;
                          }
                          if (!chosenSlot) {
                            setNotice("Please choose a grooming time slot first");
                            return;
                          }
                          const chosenServices = availableServices
                            .filter((item) => chosen.includes(item.id))
                            .map((item) => ({ ...item, price: getAdjustedServicePrice(groomer, item) }));
                          startCheckout({
                            kind: "grooming",
                            title: `${groomer.name} grooming session`,
                            amount: total,
                            subtotal,
                            gstAmount: 0,
                            deliveryFee: 0,
                            total,
                            groomerId: groomer.id,
                            groomerName: groomer.name,
                            petType,
                            services: chosenServices,
                            serviceNames: chosenServices.map((item) => item.name),
                            serviceIds: chosen,
                            timeSlot: chosenSlot,
                          });
                          window.location.href = "/payment";
                        }}
                        className="rounded-full bg-[linear-gradient(135deg,#1c4a2e,#2a6b43)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_28px_rgba(28,74,46,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_34px_rgba(28,74,46,0.24)]"
                      >
                        Book Grooming
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {notice && <p className="mt-6 rounded-3xl bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">{notice}</p>}
        </div>
      </section>
    </main>
  );
}





