import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { useAppState } from "../lib/app-state";

const PAYMENT_METHODS = ["Card", "UPI", "Netbanking", "Wallet"];

function formatMoney(value) {
  const amount = Number(value || 0);
  return amount > 0 ? `Rs. ${amount}` : "Free";
}

export default function PaymentPage() {
  const router = useRouter();
  const {
    isHydrated,
    session,
    checkoutDraft,
    completeCheckout,
    clearCheckoutDraft,
    premiumPlan,
  } = useAppState();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const requiresSession = checkoutDraft?.kind !== "premium_signup";

  const receiptMeta = useMemo(() => {
    if (!checkoutDraft) {
      return {
        subtotal: 0,
        discountAmount: 0,
        gstAmount: 0,
        deliveryFee: 0,
        total: 0,
        lineItems: [],
      };
    }

    const subtotal = Number(checkoutDraft.subtotal ?? checkoutDraft.amount ?? checkoutDraft.total ?? 0);
    const discountAmount = Number(checkoutDraft.discountAmount || 0);
    const gstAmount = Number(checkoutDraft.gstAmount || 0);
    const deliveryFee = Number(checkoutDraft.deliveryFee || 0);
    const total = Number(checkoutDraft.total ?? checkoutDraft.amount ?? subtotal - discountAmount + gstAmount + deliveryFee);

    let lineItems = [];
    if (checkoutDraft.kind === "order") {
      lineItems = (checkoutDraft.items || []).map((item) => ({
        label: item.name,
        meta: `Qty: ${item.qty}`,
        amount: item.price * item.qty,
      }));
    } else if (checkoutDraft.kind === "grooming") {
      lineItems = (checkoutDraft.services || []).map((service) => ({
        label: service.name,
        meta: checkoutDraft.timeSlot || checkoutDraft.petType || "Grooming service",
        amount: service.price,
      }));
    } else if (checkoutDraft.kind === "vet") {
      lineItems = [
        {
          label: checkoutDraft.serviceName || "Consultation service",
          meta: checkoutDraft.doctorName || checkoutDraft.clinic || "Doctor appointment",
          amount: subtotal,
        },
      ];
    } else if (checkoutDraft.kind === "premium_signup" || checkoutDraft.kind === "premium_upgrade") {
      lineItems = (checkoutDraft.benefits || premiumPlan.benefits).map((benefit) => ({
        label: benefit,
        meta: "Included with membership",
        amount: null,
      }));
    }

    return { subtotal, discountAmount, gstAmount, deliveryFee, total, lineItems };
  }, [checkoutDraft, premiumPlan.benefits]);

  const billingLines = useMemo(() => {
    if (!checkoutDraft) return [];

    const lines = [{ label: "Subtotal", value: receiptMeta.subtotal }];

    if (receiptMeta.discountAmount > 0) {
      lines.push({ label: "Premium savings", value: -receiptMeta.discountAmount });
    }

    lines.push({ label: receiptMeta.gstAmount ? "GST (18%)" : "Platform fee", value: receiptMeta.gstAmount || 0 });
    lines.push({ label: "Delivery fee", value: receiptMeta.deliveryFee || 0 });

    return lines;
  }, [checkoutDraft, receiptMeta]);

  if (!isHydrated) return null;

  if (!checkoutDraft) {
    router.replace(session ? "/dashboard" : "/login");
    return null;
  }

  if (requiresSession && !session) {
    router.replace("/login");
    return null;
  }

  const handlePay = async () => {
    setError("");
    setIsSubmitting(true);
    const result = completeCheckout({ method: paymentMethod });
    if (!result.ok) {
      setError(result.error || "Unable to complete payment.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.redirectTo || "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(255,196,87,0.18),transparent_36%),linear-gradient(135deg,#ffffff_0%,#fffef9_45%,#f7fbf8_100%)] px-8 py-8 sm:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.36em] text-[#b2770a]">Payment review</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl">
                Complete your checkout
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                Confirm the billing details and choose your payment method to finish this Animal Park flow.
              </p>
            </div>

            <div className="space-y-6 px-8 py-8 sm:px-10">
              <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Current transaction</div>
                    <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-900">{checkoutDraft.title}</div>
                    {checkoutDraft.subtitle ? (
                      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">{checkoutDraft.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                    {checkoutDraft.kind === "premium_signup"
                      ? "Premium signup"
                      : checkoutDraft.kind === "premium_upgrade"
                      ? "Premium upgrade"
                      : checkoutDraft.kind === "order"
                      ? "Product order"
                      : checkoutDraft.kind === "vet"
                      ? "Consultation"
                      : "Grooming booking"}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Order receipt</div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">Receipt preview</div>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {paymentMethod}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {receiptMeta.lineItems.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-4 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{item.label}</div>
                        {item.meta ? <div className="mt-1 text-sm text-slate-500">{item.meta}</div> : null}
                      </div>
                      <div className="text-right text-sm font-semibold text-slate-900">
                        {item.amount == null ? "Included" : `Rs. ${item.amount}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(checkoutDraft.kind === "premium_signup" || checkoutDraft.kind === "premium_upgrade") && (
                <div className="overflow-hidden rounded-[1.9rem] border border-[#f1c14f]/30 bg-[radial-gradient(circle_at_top_right,rgba(255,212,91,0.35),transparent_38%),linear-gradient(135deg,#fffdf8_0%,#fff5cb_42%,#fff8ea_100%)] p-6 shadow-[0_24px_55px_rgba(241,193,79,0.18)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.28em] text-[#b2770a]">Membership perks</div>
                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                        Premium perks activate immediately after payment
                      </h2>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[radial-gradient(circle_at_top,#ffe084_0%,#ffbf47_58%,#d69213_100%)] text-4xl shadow-[0_18px_30px_rgba(214,146,19,0.28)]">
                      ★
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {(checkoutDraft.benefits || premiumPlan.benefits).map((benefit) => (
                      <div key={benefit} className="rounded-[1rem] border border-[#f2c55b]/40 bg-white/70 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm">
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Choose payment method</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((method) => {
                    const selected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-[1.3rem] border px-5 py-4 text-left transition ${selected ? "border-[#1e5a35] bg-[#edf8f0] shadow-[0_16px_35px_rgba(30,90,53,0.08)]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                      >
                        <div className="text-lg font-semibold text-slate-900">{method}</div>
                        <div className="mt-1 text-sm text-slate-500">Secure simulated checkout for Animal Park demo payments.</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error ? (
                <div className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          <aside className="overflow-hidden rounded-[2rem] border border-[#f1c14f]/35 bg-[radial-gradient(circle_at_top,rgba(255,216,102,0.38),transparent_35%),linear-gradient(135deg,#fffdf8_0%,#fff6d7_52%,#fffef6_100%)] p-8 shadow-[0_28px_70px_rgba(241,193,79,0.18)]">
            <p className="text-sm font-semibold uppercase tracking-[0.36em] text-[#b2770a]">Billing summary</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-900">Checkout total</h2>

            <div className="mt-8 rounded-[1.8rem] border border-white/70 bg-white/88 p-7 shadow-[0_22px_50px_rgba(15,23,42,0.06)] backdrop-blur-md">
              <div className="space-y-4">
                {billingLines.map((line) => (
                  <div key={line.label} className="flex items-center justify-between gap-4 text-lg text-slate-700">
                    <span>{line.label}</span>
                    <span className={`font-semibold ${line.value < 0 ? "text-emerald-700" : "text-slate-900"}`}>
                      {line.value < 0 ? `- Rs. ${Math.abs(line.value)}` : formatMoney(line.value)}
                    </span>
                  </div>
                ))}
              </div>

              {(checkoutDraft.kind === "premium_signup" || checkoutDraft.kind === "premium_upgrade") && (
                <div className="mt-6 rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                  Premium membership charges are collected now so your benefits become active immediately after this transaction.
                </div>
              )}

              <div className="mt-6 h-px bg-slate-200" />

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Payable total</div>
                  <div className="mt-2 text-5xl font-semibold tracking-[-0.06em] text-[#1e5a35]">Rs. {receiptMeta.total}</div>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                  {paymentMethod}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={handlePay}
                disabled={isSubmitting}
                className="rounded-[1.4rem] bg-[#1e5a35] px-6 py-5 text-lg font-semibold text-white shadow-[0_22px_45px_rgba(30,90,53,0.24)] transition hover:-translate-y-0.5 hover:bg-[#194b2c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Processing payment..." : "Pay now"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCheckoutDraft();
                  router.push(session ? "/dashboard" : "/login");
                }}
                className="rounded-[1.4rem] border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Cancel transaction
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
