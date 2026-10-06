'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useAppState } from "../lib/app-state";

export default function VetsPage() {
  const router = useRouter();
  const { session, startCheckout, doctors, clinicServices, currentUser } = useAppState();
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState(0);
  const [selectedService, setSelectedService] = useState({});
  const [notice, setNotice] = useState("");
  const [openSelect, setOpenSelect] = useState(null);
  const [failedClinicImages, setFailedClinicImages] = useState({});
  const filtersRef = useRef(null);

  const clinicProfiles = {
    d1: { image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80", mood: "Preventive care wing" },
    d2: { image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=80", mood: "Skin and coat clinic" },
    d3: { image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=80", mood: "Advanced surgery center" },
    d4: { image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80", mood: "Pet nutrition studio" },
    d5: { image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80", mood: "Dental care suite" },
    d6: { image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80", mood: "Family vet clinic" },
    d7: { image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1400&q=80", mood: "24x7 emergency unit" },
    d8: { image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1400&q=80", mood: "Urban dermatology lounge" },
  };

  const getClinicProfile = (doctor) => clinicProfiles[doctor.id] || {
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80",
    mood: "Premium pet clinic",
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenSelect(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderPremiumSelect = (id, value, onChange, options, placeholder) => {
    const selectedOption = options.find((option) => String(option.value) === String(value));
    const isOpen = openSelect === id;

    return (
      <div className={`relative ${isOpen ? "z-[70]" : "z-10"}`}>
        <button
          type="button"
          onClick={() => setOpenSelect((current) => (current === id ? null : id))}
          className={`group relative w-full overflow-hidden rounded-[1.7rem] border px-6 py-4 text-left transition duration-300 ${
            isOpen
              ? "border-[#87d5df] bg-[linear-gradient(135deg,#f2fcff_0%,#ddf6f8_38%,#eef6ff_100%)] shadow-[0_28px_56px_rgba(74,163,173,0.22)]"
              : "border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff9fb_38%,#f4f8ff_100%)] shadow-[0_18px_34px_rgba(28,74,46,0.08)] hover:-translate-y-0.5 hover:border-[#a8dce3] hover:shadow-[0_28px_48px_rgba(52,124,132,0.18)]"
          }`}
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_center,rgba(92,205,215,0.42),rgba(255,255,255,0))]" />
          <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-[linear-gradient(90deg,rgba(102,192,199,0),rgba(102,192,199,0.55),rgba(102,192,199,0))] opacity-0 transition duration-300 group-hover:opacity-100" />
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
          <div className="absolute left-0 right-0 top-[calc(100%-4px)] z-[80] overflow-hidden rounded-[1.45rem] border border-[#a5dce2] bg-[linear-gradient(180deg,#fbfeff_0%,#e9fbfd_62%,#eef6ff_100%)] p-2 shadow-[0_30px_80px_rgba(52,124,132,0.2)]">
            <button
              type="button"
              onClick={() => {
                onChange({ target: { value: options[0]?.resetValue ?? "" } });
                setOpenSelect(null);
              }}
              className={`flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-sm font-medium transition duration-200 ${
                String(value) === String(options[0]?.resetValue ?? "")
                  ? "bg-[linear-gradient(135deg,#1c4a2e,#2d6d45)] text-white shadow-[0_14px_24px_rgba(28,74,46,0.25)]"
                  : "text-slate-700 hover:bg-[linear-gradient(135deg,#dcf7f5,#eef8ff)] hover:text-[#18636c] hover:translate-x-1"
              }`}
            >
              <span>{placeholder}</span>
              {String(value) === String(options[0]?.resetValue ?? "") && <span className="text-[10px] uppercase tracking-[0.24em] text-white/80">Any</span>}
            </button>
            <div className="mt-2 space-y-1">
              {options.filter((option) => option.value !== option.resetValue).map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={String(option.value)}
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

  const recommendedDoctors = useMemo(() => (Array.isArray(doctors) ? doctors : []), [doctors]);

  const filteredDoctors = useMemo(() => {
    return recommendedDoctors.filter((doctor) => {
      if (category && doctor.specialization !== category) return false;
      if (rating && doctor.rating < rating) return false;
      if (price && doctor.price > price) return false;
      return doctor.approved;
    });
  }, [recommendedDoctors, category, rating, price]);

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <Navbar />
      <section className="pt-28">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-10 rounded-[2rem] bg-white p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#946206]">Doctor consultation</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Recommended vets based on rating and experience.</h1>
            <p className="mt-4 max-w-3xl text-slate-600">Users can request only after paying the selected clinic service fee. Premium users receive a 15% discount.</p>
          </div>

          <div ref={filtersRef} className={`relative mb-10 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#fafdff_0%,#eef8ff_48%,#f2fbfb_100%)] p-4 shadow-[0_26px_60px_rgba(48,112,129,0.12)] backdrop-blur-xl md:p-5 ${openSelect ? "z-[60]" : "z-10"}`}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#1f6c78]">Smart filters</p>
                <p className="mt-1 text-sm text-slate-500">Refine clinics by specialization, rating, and price band.</p>
              </div>
              <div className="hidden rounded-full border border-[#bfe2e7] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c4a2e] shadow-[0_10px_22px_rgba(28,74,46,0.08)] md:block">
                Live clinic matching
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
            {renderPremiumSelect(
              "specialization",
              category,
              (e) => setCategory(e.target.value),
              [
                { value: "", label: "All specializations", resetValue: "" },
                ...[...new Set(recommendedDoctors.map((doctor) => doctor.specialization))].map((specialization) => ({ value: specialization, label: specialization })),
              ],
              "All specializations",
            )}
            {renderPremiumSelect(
              "rating",
              rating,
              (e) => setRating(Number(e.target.value)),
              [
                { value: 0, label: "Any rating", resetValue: 0 },
                { value: 4.5, label: "4.5 and above" },
                { value: 4.8, label: "4.8 and above" },
              ],
              "Any rating",
            )}
            {renderPremiumSelect(
              "price",
              price,
              (e) => setPrice(Number(e.target.value)),
              [
                { value: 0, label: "Any price", resetValue: 0 },
                { value: 1200, label: "Up to Rs. 1200" },
                { value: 1800, label: "Up to Rs. 1800" },
                { value: 2500, label: "Up to Rs. 2500" },
              ],
              "Any price",
            )}
            </div>
          </div>

          <div className="relative z-0 grid gap-6 md:grid-cols-2">
            {filteredDoctors.map((doctor, index) => {
              const doctorServices = clinicServices.filter((service) => doctor.services.includes(service.id));
              const serviceId = selectedService[doctor.id] || doctorServices[0]?.id;
              const service = doctorServices.find((item) => item.id === serviceId) || doctorServices[0];
              const total = service ? Math.round((doctor.price + service.price) * (currentUser?.subscription === "premium" ? 0.85 : 1)) : doctor.price;

              const clinicProfile = getClinicProfile(doctor);

              return (
                <motion.div key={doctor.id} whileHover={{ y: -6 }} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={failedClinicImages[doctor.id] ? clinicProfile.image : (doctor.clinicImage || clinicProfile.image)}
                      alt={doctor.clinicName}
                      onError={() => setFailedClinicImages((prev) => ({ ...prev, [doctor.id]: true }))}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/25 to-transparent" />
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
                      <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-xl">
                        {index < 3 ? "Recommended" : "Doctor consultation"}
                      </div>
                      <div className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">{doctor.experience} yrs exp</div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/75">{clinicProfile.mood}</div>
                      <h2 className="mt-2 text-3xl font-semibold leading-tight">{doctor.name}</h2>
                      <p className="mt-1 text-sm text-white/80">{doctor.clinicName} ? {doctor.specialization} ? {doctor.location}</p>
                    </div>
                  </div>

                  <div className="p-8">
                    <p className="text-slate-600">{doctor.description}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <p className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Rating: {doctor.rating}</p>
                      <p className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Reviews: {doctor.reviews}</p>
                      <p className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Base fee: Rs. {doctor.price}</p>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">Clinic services</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {doctorServices.map((item) => (
                          <label key={item.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                            <span>{item.name}</span>
                            <span className="flex items-center gap-3">
                              <span>Rs. {item.price}</span>
                              <input
                                type="radio"
                                name={`doctor-${doctor.id}`}
                                checked={serviceId === item.id}
                                onChange={() => setSelectedService((prev) => ({ ...prev, [doctor.id]: item.id }))}
                              />
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-500">Payable now</div>
                        <div className="text-2xl font-bold text-[#1c4a2e]">Rs. {total}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (!session || session.role !== "user") {
                            router.push("/login");
                            return;
                          }
                          startCheckout({
                            kind: "vet",
                            title: `${doctor.name} consultation`,
                            amount: total,
                            subtotal: total,
                            gstAmount: 0,
                            deliveryFee: 0,
                            total,
                            doctorId: doctor.id,
                            doctorName: doctor.name,
                            clinic: doctor.clinicName,
                            serviceId,
                            serviceName: service?.name || "Consultation",
                          });
                          window.location.href = "/payment";
                        }}
                        className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white"
                      >
                        Pay & Request
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







