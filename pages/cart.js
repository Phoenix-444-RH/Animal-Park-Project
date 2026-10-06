'use client';
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { useAppState } from "../lib/app-state";

const GST_RATE = 0.18;
const STANDARD_DELIVERY_FEE = 89;

export default function CartPage() {
  const router = useRouter();
  const { cart, currentUser, startCheckout, removeFromCart, updateCartQuantity } = useAppState();

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const gstAmount = Math.round(subtotal * GST_RATE);
  const isPremium = currentUser?.subscription === "premium";
  const deliveryFee = cart.length === 0 ? 0 : isPremium ? 0 : STANDARD_DELIVERY_FEE;
  const payableTotal = subtotal + gstAmount + deliveryFee;
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const premiumSavings = isPremium ? STANDARD_DELIVERY_FEE : 0;

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <Navbar />
      <section className="pt-28">
        <div className="container mx-auto px-6 py-10">
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#946206]">Curated pet cart</p>
                  <h1 className="mt-3 text-4xl font-semibold text-slate-900">Cart</h1>
                  <p className="mt-3 text-slate-600">Review your premium picks, remove items, and see the full billing summary before payment.</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#efc85b] bg-[radial-gradient(circle_at_70%_18%,rgba(255,225,123,0.78),rgba(255,248,224,0.95)_44%,#fff_78%)] px-5 py-4 shadow-[0_16px_35px_rgba(170,124,19,0.14)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b77904]">Membership</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{isPremium ? "Premium delivery waived" : "Standard delivery applies"}</div>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {cart.length === 0 ? (
                  <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">Your cart is empty.</p>
                ) : (
                  cart.map((item) => {
                    const quantity = item.quantity || 1;
                    const lineTotal = item.price * quantity;
                    return (
                      <div key={item.id} className="group rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffdf8_100%)] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.1)]">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-xl font-semibold text-slate-900">{item.name}</div>
                            <div className="mt-2 text-sm text-slate-500">Rs. {item.price} each</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#1c4a2e]">Rs. {lineTotal}</div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="mt-2 text-sm font-semibold text-[#c24141] transition hover:text-[#991b1b]"
                            >
                              Remove item
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] bg-slate-50 px-4 py-3">
                          <div className="text-sm font-medium text-slate-600">Quantity controls</div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateCartQuantity(item.id, quantity - 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition hover:border-[#1c4a2e] hover:text-[#1c4a2e]"
                            >
                              -
                            </button>
                            <div className="min-w-10 text-center text-lg font-semibold text-slate-900">{quantity}</div>
                            <button
                              onClick={() => updateCartQuantity(item.id, quantity + 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition hover:border-[#1c4a2e] hover:text-[#1c4a2e]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[#efc85b] bg-[radial-gradient(circle_at_82%_12%,rgba(255,221,120,0.72),rgba(255,248,228,0.94)_34%,#ffffff_74%)] p-8 shadow-[0_24px_50px_rgba(170,124,19,0.16)]">
              <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,228,146,0.55),rgba(255,255,255,0))]" />
              <div className="pointer-events-none absolute left-8 top-0 h-[3px] w-36 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,223,131,0.92),rgba(255,255,255,0))]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-[#946206]">Billing summary</p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-900">Checkout total</h2>
                  </div>
                  <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1c4a2e] shadow-sm backdrop-blur-xl">
                    Secure checkout
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-white/80 px-4 py-4 shadow-[0_12px_24px_rgba(170,124,19,0.08)] backdrop-blur-xl">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#946206]">Items</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{itemCount}</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/80 px-4 py-4 shadow-[0_12px_24px_rgba(170,124,19,0.08)] backdrop-blur-xl">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#946206]">Delivery</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{isPremium ? "Free" : `Rs. ${deliveryFee}`}</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/80 px-4 py-4 shadow-[0_12px_24px_rgba(170,124,19,0.08)] backdrop-blur-xl">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#946206]">Savings</div>
                    <div className="mt-2 text-2xl font-bold text-[#1c4a2e]">Rs. {premiumSavings}</div>
                  </div>
                </div>

                <div className="mt-8 space-y-4 rounded-[1.5rem] bg-white/90 p-5 shadow-inner">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">Rs. {subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-slate-900">Rs. {gstAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Delivery fee</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? "text-[#1c4a2e]" : "text-slate-900"}`}>
                      {deliveryFee === 0 ? "Free" : `Rs. ${deliveryFee}`}
                    </span>
                  </div>
                  {isPremium && (
                    <div className="rounded-[1.25rem] bg-[#eef8f1] px-4 py-3 text-sm font-medium text-[#1c4a2e]">
                      Premium perk applied: doorstep delivery charge waived.
                    </div>
                  )}
                  <div className="rounded-[1.25rem] border border-[#f0e3b0] bg-[linear-gradient(135deg,#fffaf0,#fffdf8)] px-4 py-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Payment protection</span>
                      <span className="font-semibold text-[#1c4a2e]">256-bit secure</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">UPI</span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">Cards</span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">Netbanking</span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">Wallets</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-900">Payable total</span>
                      <span className="text-3xl font-bold text-[#1c4a2e]">Rs. {payableTotal}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Inclusive of taxes and doorstep fulfilment charges where applicable.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (cart.length === 0) return;
                    startCheckout({
                      kind: "order",
                      title: "Product order",
                      amount: payableTotal,
                      subtotal,
                      gstAmount,
                      deliveryFee,
                      total: payableTotal,
                      items: cart,
                    });
                    window.location.href = "/payment";
                  }}
                  className="group mt-8 w-full rounded-full bg-[linear-gradient(135deg,#1c4a2e,#2a6b43)] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(28,74,46,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(28,74,46,0.28)]"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-sm transition duration-300 group-hover:scale-110">🔒</span>
                    <span>Purchase items</span>
                    <span className="text-white/70 transition duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </button>

                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-[#1c4a2e]" />
                  <span>Instant payment confirmation</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>Live order tracking after checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

