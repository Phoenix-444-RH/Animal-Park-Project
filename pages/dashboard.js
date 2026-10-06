'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAppState } from "../lib/app-state";

export default function DashboardPage() {
  const router = useRouter();
  const {
    isHydrated,
    session,
    currentUser,
    bookings,
    groomingBookings,
    orders,
    notifications,
    groomingMessages,
    receipts,
    premiumPlan,
    approveBooking,
    approveGrooming,
    advanceGroomingStage,
    sendGroomingMessage,
    upgradeToPremium,
    dismissNotification,
    resetDemoData,
  } = useAppState();
  const [activeGroomingBookingId, setActiveGroomingBookingId] = useState("");
  const [activeOrderId, setActiveOrderId] = useState("");
  const [groomingChatInput, setGroomingChatInput] = useState("");
  const [clock, setClock] = useState(Date.now());
  const [clearingNotifications, setClearingNotifications] = useState([]);
  const [liveToast, setLiveToast] = useState(null);
  const [showInvoices, setShowInvoices] = useState(false);
  const groomingToastReadyRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!session) router.replace("/login");
  }, [isHydrated, router, session]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notifications.length) return;
    const latest = notifications[0];
    if (!(latest.notificationKind === "grooming_message" || /Grooming message/i.test(latest.title))) return;
    if (!groomingToastReadyRef.current) {
      groomingToastReadyRef.current = true;
      return;
    }

    const linkedBooking = latest.bookingId
      ? groomingBookings.find((booking) => booking.id === latest.bookingId)
      : null;

    if (!latest.bookingId || !linkedBooking || linkedBooking.stage === "Delivered back") {
      dismissNotification(latest.id);
      setLiveToast(null);
      return;
    }

    setLiveToast({ id: latest.id, title: latest.title, description: latest.description || latest.message, bookingId: latest.bookingId });
  }, [dismissNotification, groomingBookings, notifications]);

  const activeGroomingMessages = activeGroomingBookingId ? (groomingMessages[activeGroomingBookingId] || []) : [];

  useEffect(() => {
    if (!liveToast?.bookingId) return;
    if (activeGroomingBookingId === liveToast.bookingId) {
      dismissNotification(liveToast.id);
      setLiveToast(null);
    }
  }, [activeGroomingBookingId, dismissNotification, liveToast]);

  const orderStages = ["Order placed", "Order confirmed", "Order dispatched", "Out for delivery", "Delivered"];
  const ORDER_STAGE_INTERVAL_MS = 15000;
  const TRAVEL_LEG_MS = 10000;
  const userVetBookings = bookings.filter((booking) => booking.userId === session?.id);

  const getBookingServiceNames = (booking) => {
    if (Array.isArray(booking?.serviceNames) && booking.serviceNames.length) {
      return booking.serviceNames;
    }
    if (Array.isArray(booking?.services) && booking.services.length) {
      return booking.services.map((service) => service?.name).filter(Boolean);
    }
    return [];
  };

  const formatBookingServiceNames = (booking, fallback = "Grooming service") => {
    const serviceNames = getBookingServiceNames(booking);
    return serviceNames.length ? serviceNames.join(", ") : fallback;
  };
  const createMapBounds = (points, paddingFactor = 0.28) => {
    const validPoints = (Array.isArray(points) ? points : []).filter((point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lng));
    if (!validPoints.length) {
      return { minLat: 12.9, maxLat: 13.0, minLng: 77.55, maxLng: 77.68 };
    }

    const lats = validPoints.map((point) => point.lat);
    const lngs = validPoints.map((point) => point.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latPad = Math.max(0.01, (maxLat - minLat || 0.03) * paddingFactor);
    const lngPad = Math.max(0.01, (maxLng - minLng || 0.03) * paddingFactor);

    return {
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
    };
  };

  const buildOpenStreetMapEmbedUrl = (bounds) => {
    if (!bounds) return "";
    const bbox = [bounds.minLng, bounds.minLat, bounds.maxLng, bounds.maxLat]
      .map((value) => Number(value).toFixed(6))
      .join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  };

  const pointToPercent = (point, bounds) => {
    if (!point || !bounds) return { left: 50, top: 50 };
    const lngSpan = bounds.maxLng - bounds.minLng || 1;
    const latSpan = bounds.maxLat - bounds.minLat || 1;
    const left = ((point.lng - bounds.minLng) / lngSpan) * 100;
    const top = (1 - (point.lat - bounds.minLat) / latSpan) * 100;
    return {
      left: Math.min(96, Math.max(4, left)),
      top: Math.min(94, Math.max(6, top)),
    };
  };

  const interpolatePoint = (from, to, progress = 0) => ({
    lat: from.lat + (to.lat - from.lat) * progress,
    lng: from.lng + (to.lng - from.lng) * progress,
  });

  const getGroomingTrackingStatus = (booking) => booking?.tracking?.status || (booking?.status === "accepted" ? "accepted" : booking?.status || "pending");
  const isGroomingDelivered = (booking) => getGroomingTrackingStatus(booking) === "delivered" || booking?.stage === "Delivered back";
  const getOrderTrackingStatus = (order) => order?.tracking?.status || "placed";
  const isOrderDelivered = (order) => getOrderTrackingStatus(order) === "delivered" || order?.status === "Delivered";
  const getGroomingTimelineSteps = (booking) => [
    "Booking accepted",
    "Pet picked up",
    "Reached grooming center",
    "Grooming session in progress",
    ...getBookingServiceNames(booking),
    "Returning home",
    "Delivered back",
  ];
  const getTrackingStageLabel = (booking) => {
    if (!booking) return "";
    if (["session_in_progress", "grooming_processes"].includes(getGroomingTrackingStatus(booking))) {
      return booking?.tracking?.currentProcess || booking?.stage || "Grooming in progress";
    }
    return booking?.stage || "Awaiting acceptance";
  };
  const getTrackingStatusText = (booking) => getTrackingStageLabel(booking);
  const canAdvanceGroomingService = (booking) => session?.role === "groomer" && ["reached_center", "session_in_progress", "grooming_processes"].includes(getGroomingTrackingStatus(booking));
  const getAdvanceGroomingLabel = (booking) => {
    if (getGroomingTrackingStatus(booking) === "reached_center") return "Start grooming session";
    if (getGroomingTrackingStatus(booking) === "session_in_progress") return booking?.tracking?.currentProcess ? `Start ${booking.tracking.currentProcess}` : "Start first service";
    return booking?.tracking?.currentProcess ? `Complete ${booking.tracking.currentProcess}` : "Complete current service";
  };

  const userGroomingBookings = groomingBookings.filter((booking) => booking.userId === session?.id && !isGroomingDelivered(booking));
  const getOrderStageDurationMs = (status) => {
    if (["placed", "confirmed", "dispatched"].includes(status)) return ORDER_STAGE_INTERVAL_MS;
    if (status === "out_for_delivery") return TRAVEL_LEG_MS;
    return 0;
  };

  const getOrderTrackingMeta = (order) => {
    const tracking = order?.tracking || {};
    const status = getOrderTrackingStatus(order);
    const trackingStage = ({
      placed: "Order placed",
      confirmed: "Order confirmed",
      dispatched: "Order dispatched",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
    })[status] || "Order placed";
    const stageStartedAt = Number(tracking.stageStartedAt || tracking.startedAt || new Date(order?.createdAt || Date.now()).getTime());
    const travelStartedAt = Number(tracking.travelStartedAt || stageStartedAt);
    const travelDurationMs = Number(tracking.travelDurationMs || TRAVEL_LEG_MS);
    const stageDurationMs = getOrderStageDurationMs(status);
    const activeStartedAt = status === "out_for_delivery" ? travelStartedAt : stageStartedAt;
    const elapsed = Math.max(0, clock - activeStartedAt);
    const remainingSeconds = stageDurationMs ? Math.max(0, Math.ceil((stageDurationMs - elapsed) / 1000)) : 0;
    const routeProgress = status === "out_for_delivery" ? Math.min(1, elapsed / travelDurationMs) : status === "delivered" ? 1 : 0;
    return {
      status,
      trackingStage,
      liveStatus: trackingStage,
      remainingSeconds,
      etaLabel: status === "delivered" ? "Delivered successfully" : status === "out_for_delivery" ? `Arriving in ${remainingSeconds} sec` : `Next update in ${remainingSeconds} sec`,
      routeProgress,
    };
  };

  const getOrderMapMeta = () => ({
    city: "Bengaluru",
    areaA: "Rajajinagar",
    areaB: "Phoenix Marketcity",
    areaC: "Indiranagar",
    hub: "JP Nagar Store",
    destination: "Customer Home",
    roadA: "Outer Ring Road",
    roadB: "Old Airport Road",
    roadC: "MG Road",
    landmarkA: "Orion Mall",
    landmarkB: "Lalbagh",
    landmarkC: "HAL Airport Road",
                    userOrders.map((order) => (
                      <div key={order.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">Order {order.id}</div>
                            <div className="mt-1 text-sm text-slate-500">
                              {(Array.isArray(order.items) ? order.items.length : 0)} items - Total Rs. {order.total}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-[#e6f2ea] px-4 py-2 text-sm text-[#1c4a2e]">{order.liveStatus}</span>
                            <button
                              type="button"
                              onClick={() => setActiveOrderId(order.id)}
                              className="rounded-full bg-[#1c4a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163923]"
                            >
                              Track live
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            .map((item) => ({
              label: item.name,
              amount: typeof item.price === "number" ? item.price : null,
              meta: relatedGroomingBooking?.groomerName || null,
            })))
          : (receipt.lineItems || []);

    const fallbackSubtotal = receipt.kind === "order"
      ? (relatedOrder?.pricing?.subtotal ?? relatedOrder?.subtotal)
      : receipt.kind === "vet"
        ? (relatedVetBooking?.fee ?? receipt.amount)
        : receipt.kind === "grooming"
          ? (relatedGroomingBooking?.total ?? receipt.amount)
          : receipt.subtotal;

    const fallbackGstAmount = receipt.kind === "order"
      ? (relatedOrder?.pricing?.gstAmount ?? relatedOrder?.gstAmount)
      : (receipt.gstAmount ?? 0);

    const fallbackDeliveryFee = receipt.kind === "order"
      ? (relatedOrder?.pricing?.deliveryFee ?? relatedOrder?.deliveryFee)
      : (receipt.deliveryFee ?? 0);

    const fallbackAmount = receipt.kind === "order"
      ? (relatedOrder?.pricing?.total ?? relatedOrder?.total)
      : receipt.kind === "vet"
        ? (relatedVetBooking?.fee ?? receipt.amount)
        : receipt.kind === "grooming"
          ? (relatedGroomingBooking?.total ?? receipt.amount)
          : receipt.amount;

    return {
      reference: receipt.relatedId || receipt.orderId || receipt.bookingId || receipt.id,
      lineItems: (receipt.lineItems && receipt.lineItems.length ? receipt.lineItems : fallbackLineItems) || [],
      subtotal: Number(receipt.subtotal ?? fallbackSubtotal ?? 0),
      gstAmount: Number(receipt.gstAmount ?? fallbackGstAmount ?? 0),
      deliveryFee: Number(receipt.deliveryFee ?? fallbackDeliveryFee ?? 0),
      amount: Number(receipt.amount ?? fallbackAmount ?? 0),
    };
  };

  const latestReceiptDisplay = userReceipts[0] ? getReceiptDisplayData(userReceipts[0]) : null;


  if (!isHydrated || !session) return null;

  const getOrderNotificationDescription = (stage) => ({
    "Order placed": "Your order is now being prepared for dispatch.",
    "Order confirmed": "Your order has been confirmed and is being packed.",
    "Order dispatched": "Your order has been dispatched from the store.",
    "Out for delivery": "Your delivery partner is heading to your location.",
    Delivered: "Your order was delivered successfully.",
  }[stage] || "Your order is being processed.");

  const getGroomingMapMeta = (location, groomerName) => {
    if ((location || "").toLowerCase().includes("chennai")) {
      return {
        city: "Chennai",
        areaA: "T Nagar",
        areaB: "Nungambakkam",
        areaC: "Alwarpet",
        park: "Semmozhi Poonga",
        roadA: "Cathedral Road",
        roadB: "Anna Salai",
        roadC: "RK Salai",
        water: "Marina shoreline",
        pickupTag: "Doorstep pickup",
        destinationTag: groomerName,
        routeText: `T Nagar pickup to ${groomerName}`,
        helperText: "Live route between your pickup point and the spa.",
        pickupPoint: { lat: 13.0418, lng: 80.2337 },
        spaPoint: { lat: 13.0495, lng: 80.2456 },
      };
    }
    return {
      city: "Bengaluru",
      areaA: "JP Nagar",
      areaB: "Indiranagar",
      areaC: "Richmond Town",
      park: "Cubbon Park",
      roadA: "Lavelle Road",
      roadB: "Richmond Road",
      roadC: "MG Road",
      water: "Ulsoor Lake",
      pickupTag: "Doorstep pickup",
      destinationTag: groomerName,
      routeText: `JP Nagar pickup to ${groomerName}`,
      helperText: "Live route between your pickup point and the spa.",
      pickupPoint: { lat: 12.9077, lng: 77.5850 },
      spaPoint: { lat: 12.9784, lng: 77.6408 },
    };
  };

  const getGroomingMapState = (booking, mapMeta, progress = 0) => {
    if (!booking || !mapMeta) return null;
    const trackingStatus = getGroomingTrackingStatus(booking);
    const bounds = createMapBounds([mapMeta.pickupPoint, mapMeta.spaPoint], 0.35);
    const currentPoint = trackingStatus === "delivered"
      ? mapMeta.pickupPoint
      : interpolatePoint(mapMeta.pickupPoint, mapMeta.spaPoint, progress);

    return {
      embedUrl: buildOpenStreetMapEmbedUrl(bounds),
      pickupPosition: pointToPercent(mapMeta.pickupPoint, bounds),
      spaPosition: pointToPercent(mapMeta.spaPoint, bounds),
      currentPosition: pointToPercent(currentPoint, bounds),
    };
  };
  function getOrderPricing(order) {
    const orderItems = Array.isArray(order?.items) ? order.items : [];
    const subtotal = order.subtotal ?? orderItems.reduce((sum, item) => sum + item.price * (item.quantity || item.qty || 1), 0);
    const gstAmount = order.gstAmount ?? Math.round(subtotal * 0.18);
    const deliveryFee = order.deliveryFee ?? 0;
    const total = order.total ?? subtotal + gstAmount + deliveryFee;
    return { subtotal, gstAmount, deliveryFee, total };
  }


  const activeMapMeta = activeGroomingBooking ? getGroomingMapMeta(activeGroomingBooking.location, activeGroomingBooking.groomerName) : null;
  const activeGroomingTimeline = activeGroomingBooking ? getGroomingTimelineSteps(activeGroomingBooking) : [];
  const activeGroomingStageLabel = activeGroomingBooking ? getTrackingStageLabel(activeGroomingBooking) : "";
  const activeGroomingStageIndex = activeGroomingBooking ? Math.max(0, activeGroomingTimeline.indexOf(activeGroomingStageLabel)) : 0;
  const showLiveRoute = Boolean(activeGroomingBooking && getGroomingTrackingStatus(activeGroomingBooking) !== "pending");
  const groomingMarkerProgress = (() => {
    if (!activeGroomingBooking) return 0;
    const trackingStatus = getGroomingTrackingStatus(activeGroomingBooking);
    const travelStartedAt = Number(activeGroomingBooking?.tracking?.travelStartedAt || activeGroomingBooking?.tracking?.startedAt || 0);
    const travelDurationMs = Number(activeGroomingBooking?.tracking?.travelDurationMs || TRAVEL_LEG_MS);
    const legElapsed = Math.max(0, clock - travelStartedAt);
    const legProgress = Math.min(1, legElapsed / travelDurationMs);

    if (trackingStatus === "accepted") return 1 - legProgress;
    if (trackingStatus === "picked_up") return legProgress;
    if (trackingStatus === "reached_center" || trackingStatus === "session_in_progress" || trackingStatus === "grooming_processes") return 1;
    if (trackingStatus === "returning") return 1 - legProgress;
    if (trackingStatus === "delivered") return 0;
    return 0;
  })();

  const activeGroomingMapState = activeGroomingBooking && activeMapMeta ? getGroomingMapState(activeGroomingBooking, activeMapMeta, groomingMarkerProgress) : null;

  const renderRealRouteMap = ({
    className,
    embedUrl,
    sourcePosition,
    destinationPosition,
    currentPosition,
    sourceLabel,
    destinationLabel,
    routeText,
    footerText,
  }) => {
    if (!embedUrl || !sourcePosition || !destinationPosition || !currentPosition) return null;
    const pulseScale = 1.18 + Math.sin(clock / 350) * 0.14;

    return (
      <div className={className}>
        <iframe
          title={routeText}
          src={embedUrl}
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.22))]" />
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
          <line x1={sourcePosition.left} y1={sourcePosition.top} x2={destinationPosition.left} y2={destinationPosition.top} stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.82" />
          <line x1={sourcePosition.left} y1={sourcePosition.top} x2={destinationPosition.left} y2={destinationPosition.top} stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="7 5" opacity="0.9" />
        </svg>
        <div className="absolute h-4 w-4 rounded-full border-4 border-white bg-[#ef4444] shadow-lg" style={{ left: `${sourcePosition.left}%`, top: `${sourcePosition.top}%`, transform: "translate(-50%, -50%)" }} />
        <div className="absolute h-4 w-4 rounded-full border-4 border-white bg-[#16a34a] shadow-lg" style={{ left: `${destinationPosition.left}%`, top: `${destinationPosition.top}%`, transform: "translate(-50%, -50%)" }} />
        <div className="absolute rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow" style={{ left: `${Math.max(4, sourcePosition.left - 4)}%`, top: `${Math.max(4, sourcePosition.top - 10)}%` }}>{sourceLabel}</div>
        <div className="absolute rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow" style={{ left: `${Math.max(4, destinationPosition.left - 4)}%`, top: `${Math.max(4, destinationPosition.top - 10)}%` }}>{destinationLabel}</div>
        <div className="absolute rounded-full bg-[#16a34a]/15" style={{ left: `${currentPosition.left}%`, top: `${currentPosition.top}%`, width: 34, height: 34, transform: `translate(-50%, -50%) scale(${pulseScale})`, transition: "transform 0.2s linear" }} />
        <div className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_16px_32px_rgba(15,23,42,0.18)]" style={{ left: `${currentPosition.left}%`, top: `${currentPosition.top}%`, transform: "translate(-50%, -50%)" }}>
          <div className="relative h-5 w-7">
            <div className="absolute left-0 top-1 h-3 w-5 rounded-[4px] bg-[#ff5a36]" />
            <div className="absolute right-0 top-0 h-4 w-3 rounded-[3px] bg-[#ff7d59]" />
            <div className="absolute bottom-0 left-1 h-2 w-2 rounded-full bg-[#1f2937]" />
            <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#1f2937]" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
            {routeText}
          </div>
        </div>
        <div className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
          {footerText}
        </div>
      </div>
    );
  };
  const enhancedNotifications = (() => {
    let fallbackOrderIndex = 0;
    const seenOrderStages = new Set();

    return notifications
      .filter((item) => item.title !== "New message")
      .map((item) => {
        const linkedOrderId = item.orderId || item.linkedOrderId;
        const isOrderNotification = session.role === "user" && (linkedOrderId || item.title === "Order placed");
        if (!isOrderNotification) {
          if (item.title === "Doctor accepted") {
            return {
              ...item,
              title: "Consultation confirmed",
              description: item.description?.replace(" Chat is now enabled.", "") || "Your consultation request has been accepted.",
            };
          }
          return item;
        }

        const linkedOrder = linkedOrderId
          ? allUserOrders.find((order) => order.id === linkedOrderId)
          : allUserOrders[fallbackOrderIndex++];
        if (!linkedOrder) return item;

        const stage = linkedOrder.trackingStage || linkedOrder.liveStatus || item.title;
        return {
          ...item,
          title: stage,
          description: getOrderNotificationDescription(stage),
          dismissible: stage === "Delivered",
          isOrderTracking: true,
          orderStage: stage,
          orderId: linkedOrder.id,
        };
      })
      .filter((item) => {
        if (!item.isOrderTracking) return true;
        const key = `${item.orderId || item.linkedOrderId || "unknown"}:${item.orderStage || item.title}`;
        if (seenOrderStages.has(key)) return false;
        seenOrderStages.add(key);
        return true;
      });
  })();

  const handleDismissNotification = (notificationId) => {
    setClearingNotifications((prev) => [...new Set([...prev, notificationId])]);
    window.setTimeout(() => {
      dismissNotification(notificationId);
      setClearingNotifications((prev) => prev.filter((id) => id !== notificationId));
    }, 280);
  };

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-slate-900">
      <Navbar />
      <AnimatePresence>
        {liveToast && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            onClick={() => {
              if (liveToast.bookingId) {
                setActiveGroomingBookingId(liveToast.bookingId);
              } else {
                dismissNotification(liveToast.id);
                setLiveToast(null);
              }
            }}
            className="fixed right-5 top-24 z-[80] w-[340px] rounded-[1.4rem] border border-[#cfe8d6] bg-white p-4 text-left shadow-2xl transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(0,0,0,0.16)]"
          >
            <div className="text-sm font-semibold text-[#1c4a2e]">{liveToast.title}</div>
            <div className="mt-1 text-sm text-slate-600">{liveToast.description}</div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#946206]">Open live chat</div>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeOrder && (() => {
          const activeOrderMapState = getOrderMapState(activeOrder, activeOrder.mapMeta);

          return (
            <motion.div
              className="fixed inset-0 z-[85] flex items-start justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveOrderId("")}
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-[#f7fcf8] shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#dcebdc] bg-white/95 px-6 py-4 backdrop-blur">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-[#946206]">Live order tracking</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">Order {activeOrder.id}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveOrderId("")}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Close tracker
                  </button>
                </div>
                <div className="p-6">
                  <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                    <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f6fbf8_100%)] px-5 py-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Delivery tracking</div>
                          <div className="mt-2 text-[2rem] font-semibold leading-none text-slate-900">{activeOrder.liveStatus}</div>
                          <p className="mt-2 text-sm text-slate-600">{getOrderNotificationDescription(activeOrder.trackingStage)}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#eaf7ef] px-4 py-2 text-sm font-semibold text-[#166534]">{activeOrder.etaLabel}</span>
                            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{(Array.isArray(activeOrder?.items) ? activeOrder.items.length : 0)} items</span>
                            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Rs. {activeOrder.pricing.total}</span>
                          </div>
                        </div>
                        <div className="rounded-full bg-[#1c4a2e] px-4 py-2 text-sm font-semibold text-white shadow-sm">{activeOrder.trackingStage}</div>
                      </div>
                    </div>
                    <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.18fr_0.82fr]">
                      <div className="space-y-5">
                        {renderRealRouteMap({
                          className: "relative min-h-[340px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#d9d5ce]",
                          embedUrl: activeOrderMapState?.embedUrl,
                          sourcePosition: activeOrderMapState?.hubPosition,
                          destinationPosition: activeOrderMapState?.destinationPosition,
                          currentPosition: activeOrderMapState?.currentPosition,
                          sourceLabel: activeOrder.mapMeta.hub,
                          destinationLabel: activeOrder.mapMeta.destination,
                          routeText: activeOrder.mapMeta.routeText,
                          footerText: `Updated ${new Date(clock).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                        })}
                        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ordered items</div>
                            <div className="mt-4 space-y-3">
                              {(Array.isArray(activeOrder?.items) ? activeOrder.items : []).map((item) => (
                                <div key={`${activeOrder.id}-${item.id}`} className="flex items-start justify-between gap-3 rounded-[1rem] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                                  <div>
                                    <div className="font-semibold text-slate-900">{item.name}</div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">Qty {item.quantity || 1}</div>
                                  </div>
                                  <div className="text-sm font-semibold text-slate-900">Rs. {item.price * (item.quantity || 1)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bill summary</div>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                              <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-semibold text-slate-900">Rs. {activeOrder.pricing.subtotal}</span></div>
                              <div className="flex items-center justify-between"><span>GST</span><span className="font-semibold text-slate-900">Rs. {activeOrder.pricing.gstAmount}</span></div>
                              <div className="flex items-center justify-between"><span>Delivery fee</span><span className={`font-semibold ${activeOrder.pricing.deliveryFee === 0 ? "text-[#166534]" : "text-slate-900"}`}>{activeOrder.pricing.deliveryFee === 0 ? "Free" : `Rs. ${activeOrder.pricing.deliveryFee}`}</span></div>
                              <div className="h-px bg-slate-200" />
                              <div className="flex items-center justify-between text-base font-semibold text-slate-900"><span>Total paid</span><span>Rs. {activeOrder.pricing.total}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Delivery timeline</div>
                        <div className="mt-5 space-y-5">
                          {orderStages.map((stage, index) => {
                            const currentIndex = orderStages.indexOf(activeOrder.trackingStage);
                            const isCompleted = index < currentIndex;
                            const isCurrent = stage === activeOrder.trackingStage;
                            return (
                              <div key={stage} className="relative pl-12">
                                {index < orderStages.length - 1 && <div className={`absolute left-[15px] top-8 h-[calc(100%+12px)] w-[2px] ${index < currentIndex ? "bg-[#16a34a]" : "bg-slate-200"}`} />}
                                <div className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isCurrent ? "bg-[#16a34a] text-white shadow-[0_10px_24px_rgba(22,163,74,0.28)]" : isCompleted ? "bg-[#dcfce7] text-[#166534]" : "bg-slate-100 text-slate-500"}`}>{isCompleted ? "OK" : index + 1}</div>
                                <div className={`rounded-[1.1rem] border px-4 py-3 ${isCurrent ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-slate-200 bg-white"}`}>
                                  <div className="font-semibold text-slate-900">{stage}</div>
                                  <div className="mt-1 text-xs text-slate-500">{isCurrent ? "Current live status" : isCompleted ? "Completed" : "Waiting for update"}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      <AnimatePresence>
        {showInvoices && (
          <motion.div
            className="fixed inset-0 z-[82] flex items-start justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInvoices(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#946206]">Invoices</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">Transaction invoices</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInvoices(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Close invoices
                </button>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {userReceipts.length === 0 ? (
                    <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">No invoices available yet.</p>
                  ) : (
                    userReceipts.map((receipt) => (
                      <div key={receipt.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{receipt.title}</div>
                            <div className="mt-1 text-sm text-slate-500">{getReceiptKindLabel(receipt.kind)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total paid</div>
                            <div className="mt-1 text-2xl font-semibold text-[#1c4a2e]">Rs. {getReceiptDisplayData(receipt).amount}</div>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Invoice no.</div>
                            <div className="mt-1 font-semibold text-slate-900">{receipt.receiptNumber}</div>
                          </div>
                          <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Transaction</div>
                            <div className="mt-1 font-semibold text-slate-900">{receipt.transactionNumber}</div>
                          </div>
                          <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Reference</div>
                            <div className="mt-1 font-semibold text-slate-900">{getReceiptDisplayData(receipt).reference}</div>
                          </div>
                          <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Paid on</div>
                            <div className="mt-1 font-semibold text-slate-900">{formatReceiptDate(receipt.createdAt)}</div>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                          <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Services / items</div>
                            <div className="mt-3 space-y-3">
                              {(getReceiptDisplayData(receipt).lineItems || []).length === 0 ? (
                                <div className="text-sm text-slate-500">No invoice line items recorded.</div>
                              ) : (
                                getReceiptDisplayData(receipt).lineItems.map((item, index) => (
                                  <div key={`${receipt.id}-${index}`} className="flex items-start justify-between gap-3 rounded-[1rem] bg-white px-4 py-3">
                                    <div>
                                      <div className="font-medium text-slate-900">{item.label}</div>
                                      <div className="mt-1 text-xs text-slate-500">{item.meta || (item.quantity ? `Qty ${item.quantity}` : 'Included')}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900">{typeof item.amount === 'number' ? `Rs. ${item.amount}` : 'Included'}</div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Payment summary</div>
                            <div className="mt-3 space-y-3 text-sm text-slate-600">
                              <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-semibold text-slate-900">Rs. {getReceiptDisplayData(receipt).subtotal}</span></div>
                              <div className="flex items-center justify-between"><span>GST</span><span className="font-semibold text-slate-900">Rs. {getReceiptDisplayData(receipt).gstAmount}</span></div>
                              <div className="flex items-center justify-between"><span>Delivery fee</span><span className="font-semibold text-slate-900">{getReceiptDisplayData(receipt).deliveryFee ? `Rs. ${getReceiptDisplayData(receipt).deliveryFee}` : 'Free'}</span></div>
                              <div className="flex items-center justify-between"><span>Payment method</span><span className="font-semibold text-slate-900">{receipt.paymentMethod}</span></div>
                              <div className="h-px bg-slate-200" />
                              <div className="flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span className="text-[#1c4a2e]">Rs. {getReceiptDisplayData(receipt).amount}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="pt-28">
        <div className="container mx-auto px-6 py-10">
          <div className="relative mb-8 overflow-hidden rounded-[2.4rem] border border-white/60 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.96)_0%,rgba(255,248,231,0.94)_28%,rgba(242,248,242,0.96)_54%,rgba(255,255,255,0.98)_100%)] p-8 shadow-[0_30px_80px_rgba(28,74,46,0.12)]">
            <div className="absolute -left-10 top-[-28px] h-48 w-48 rounded-full bg-[#ffe39a]/45 blur-3xl" />
            <div className="absolute right-[-24px] top-[-8px] h-52 w-52 rounded-full bg-[#cce9d6]/75 blur-3xl" />
            <div className="absolute bottom-[-52px] left-[24%] h-36 w-56 rounded-full bg-[#d7f1ff]/45 blur-3xl" />
            <div className="absolute inset-x-12 top-0 h-20 bg-gradient-to-b from-white/80 to-transparent blur-xl" />
            <div
              className="absolute inset-y-[-8%] left-[14%] w-14 rotate-[18deg] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-80 blur-[2px]"
              style={{
                transform: `translateX(${Math.sin(clock / 900) * 16}px) rotate(18deg)`,
                transition: "transform 0.2s linear",
              }}
            />
            <div className="relative flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#efd69b] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#946206] shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#1c4a2e] shadow-[0_0_12px_rgba(28,74,46,0.65)]" />
                  {session.role} dashboard
                </div>
                <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                  Welcome, <span className="bg-[linear-gradient(120deg,#0f2d1c_0%,#1c4a2e_42%,#c8880a_100%)] bg-clip-text text-transparent">{session.name}</span>
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-slate-600">
                  Your live control center for bookings, grooming journeys, product deliveries, premium perks, and real-time updates.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-[1.8rem] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_18px_34px_rgba(28,74,46,0.08)] backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Live alerts</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">{notifications.length}</div>
                </div>
                {session.role === "user" && currentUser?.subscription !== "premium" && (
                  <button onClick={handlePremiumUpgrade} className="rounded-full bg-[linear-gradient(135deg,#c8880a,#e3a317)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(200,136,10,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(200,136,10,0.36)]">
                    Upgrade to premium
                  </button>
                )}
                <button onClick={handleResetDemoData} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900">
                  Reset demo data
                </button>
              </div>
            </div>
          </div>

          {session.role === "user" && (
            <div className="grid gap-8">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#f6fbf7_100%)] p-6 shadow-[0_22px_48px_rgba(28,74,46,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(28,74,46,0.14)]"><div className="absolute right-[-28px] top-[-28px] h-24 w-24 rounded-full bg-[#d7efe0] blur-2xl" /><div className="relative"><div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Vet bookings</div><div className="mt-3 text-5xl font-bold text-slate-900">{userVetBookings.length}</div><div className="mt-3 text-sm text-[#1c4a2e]">Consultations ready to monitor</div></div></div>
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#f7fbff_100%)] p-6 shadow-[0_22px_48px_rgba(44,109,230,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(44,109,230,0.14)]"><div className="absolute right-[-24px] top-[-24px] h-24 w-24 rounded-full bg-[#d9e8ff] blur-2xl" /><div className="relative"><div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Grooming bookings</div><div className="mt-3 text-5xl font-bold text-slate-900">{userGroomingBookings.length}</div><div className="mt-3 text-sm text-[#2d6de6]">Live pet-care journeys active</div></div></div>
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#fffaf2_100%)] p-6 shadow-[0_22px_48px_rgba(200,136,10,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(200,136,10,0.16)]"><div className="absolute right-[-22px] top-[-22px] h-24 w-24 rounded-full bg-[#ffe7bc] blur-2xl" /><div className="relative"><div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Orders</div><div className="mt-3 text-5xl font-bold text-slate-900">{userOrders.length}</div><div className="mt-3 text-sm text-[#b77904]">Deliveries and invoices in one place</div></div></div>
                {currentUser?.subscription === "premium" ? (
                  <div className="group relative overflow-hidden rounded-[2rem] border border-[#efc85b] bg-[radial-gradient(circle_at_76%_18%,rgba(255,219,87,0.98)_0%,rgba(255,236,160,0.82)_16%,rgba(255,248,221,0.92)_35%,#fffdf6_58%,#ffffff_100%)] p-6 shadow-[0_22px_50px_rgba(170,124,19,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(170,124,19,0.26)]">
                    <div className="absolute inset-x-8 top-0 h-12 bg-gradient-to-b from-white/80 to-transparent blur-md" />
                    <div className="absolute -right-4 -top-6 h-32 w-32 rounded-full bg-[#ffd24d]/45 blur-3xl" />
                    <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-[#ffef9f]/55 blur-2xl" />
                    <div className="absolute -bottom-12 left-4 h-24 w-24 rounded-full bg-[#ffe282]/40 blur-3xl" />
                    <div className="absolute inset-y-0 right-[34%] w-20 bg-gradient-to-r from-transparent via-[#ffe58f]/35 to-transparent blur-xl opacity-90" style={{ transform: `translateX(${Math.sin(clock / 1100) * 14}px)`, transition: "transform 0.2s linear" }} />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-500">Subscription</div>
                        <div className="mt-2 text-2xl font-bold capitalize text-slate-900">{currentUser?.subscription || "premium"}</div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#b77904]">VIP pet care access</div>
                      </div>
                      <div className="relative mr-2 mt-1 flex h-16 w-16 items-center justify-center">
                        <div className="absolute h-16 w-16 rounded-full bg-[#ffd34e]/50 blur-md" style={{ transform: `scale(${1.03 + Math.sin(clock / 420) * 0.14})`, transition: "transform 0.2s linear" }} />
                        <div className="absolute h-20 w-20 rounded-full border border-[#ffe79f]/70" style={{ transform: `scale(${1.02 + Math.sin(clock / 520) * 0.08})`, opacity: 0.45, transition: "transform 0.2s linear" }} />
                        <div className="absolute h-24 w-24 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,214,82,0.22) 0%, rgba(255,214,82,0.08) 38%, transparent 68%)", transform: `scale(${1.08 + Math.sin(clock / 760) * 0.1})`, transition: "transform 0.2s linear" }} />
                        <div className="relative" style={{ transform: `translateY(${Math.sin(clock / 480) * -4}px) rotate(${Math.sin(clock / 650) * 5}deg) scale(${1 + Math.sin(clock / 820) * 0.03})`, transition: "transform 0.2s linear", filter: "drop-shadow(0 14px 18px rgba(178, 119, 4, 0.36))" }}>
                          <div className="relative h-11 w-12">
                            <div className="absolute left-[2px] top-[15px] h-5 w-10 rounded-b-[14px] rounded-t-[8px] bg-gradient-to-b from-[#fff0b8] via-[#ffd451] to-[#bf7d00]" />
                            <div className="absolute bottom-[2px] left-[5px] h-[5px] w-8 rounded-full bg-[#8f5d03]/30 blur-[1px]" />
                            <div className="absolute left-[4px] top-[14px] h-[2px] w-8 rounded-full bg-white/75" />
                            <div className="absolute left-0 top-[8px] h-0 w-0 border-b-[12px] border-l-[6px] border-r-[6px] border-b-[#ffca37] border-l-transparent border-r-transparent" />
                            <div className="absolute left-[14px] top-0 h-0 w-0 border-b-[16px] border-l-[7px] border-r-[7px] border-b-[#ffe27b] border-l-transparent border-r-transparent" />
                            <div className="absolute right-0 top-[8px] h-0 w-0 border-b-[12px] border-l-[6px] border-r-[6px] border-b-[#ffca37] border-l-transparent border-r-transparent" />
                            <div className="absolute left-[3px] top-[7px] h-[6px] w-[6px] rounded-full bg-[#ff7aa2] shadow-[0_0_10px_rgba(255,122,162,0.8)]" />
                            <div className="absolute left-[18px] top-[2px] h-[7px] w-[7px] rounded-full bg-[#7dd3fc] shadow-[0_0_12px_rgba(125,211,252,0.95)]" />
                            <div className="absolute right-[3px] top-[7px] h-[6px] w-[6px] rounded-full bg-[#86efac] shadow-[0_0_10px_rgba(134,239,172,0.85)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group relative overflow-hidden rounded-[2rem] border border-[#bfe8db] bg-[linear-gradient(145deg,#ffffff_0%,#f4fdf9_45%,#eef8ff_100%)] p-6 shadow-[0_22px_48px_rgba(17,119,110,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(17,119,110,0.18)]">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8fe5d8]/28 blur-3xl" />
                    <div className="absolute left-[-14px] bottom-[-30px] h-24 w-24 rounded-full bg-[#b7d9ff]/22 blur-3xl" />
                    <div className="relative">
                      <div className="text-sm text-slate-500">Subscription</div>
                      <div className="mt-2 text-2xl font-bold capitalize text-slate-900">Basic</div>
                      <div className="mt-3 text-sm text-slate-600">Unlock delivery waivers, premium booking value, and cleaner member pricing at checkout.</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {premiumBenefits.slice(0, 3).map((perk) => (
                          <span key={perk} className="rounded-full border border-[#d5eee7] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#0f766e] shadow-sm">{perk}</span>
                        ))}
                      </div>
                      <button onClick={handlePremiumUpgrade} className="mt-5 rounded-full bg-[linear-gradient(135deg,#0f766e,#12958b)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(15,118,110,0.28)]">
                        Activate premium for Rs. {premiumUpgradeAmount}
                      </button>
                      <button onClick={handleResetDemoData} className="mt-3 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900">
                        Reset demo data
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Invoices</h2>
                    <p className="mt-1 text-sm text-slate-500">All transaction invoices are saved here with services and totals.</p>
                  </div>
                  <span className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">{userReceipts.length} invoices</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.4rem] bg-slate-50 px-5 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Latest invoice</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{userReceipts[0]?.receiptNumber || 'No invoices yet'}</div>
                    <div className="mt-1 text-sm text-slate-500">{userReceipts[0]?.title || 'Complete a transaction to generate one.'}</div>
                  </div>
                  <div className="rounded-[1.4rem] bg-slate-50 px-5 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total invoices</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{userReceipts.length}</div>
                    <div className="mt-1 text-sm text-slate-500">Products, vet, grooming, and premium payments.</div>
                  </div>
                  <div className="rounded-[1.4rem] bg-slate-50 px-5 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Latest total</div>
                    <div className="mt-2 text-lg font-semibold text-[#1c4a2e]">{latestReceiptDisplay ? `Rs. ${latestReceiptDisplay.amount}` : 'Rs. 0'}</div>
                    <div className="mt-1 text-sm text-slate-500">Includes subtotal, GST, and delivery charges.</div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowInvoices(true)}
                    className="rounded-full bg-[#1c4a2e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#163923]"
                  >
                    Open invoices
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#fbfcfe_100%)] p-8 shadow-[0_26px_60px_rgba(28,74,46,0.08)]">
                <div className="absolute right-[-28px] top-[-30px] h-32 w-32 rounded-full bg-[#d8e8ff]/55 blur-3xl" />
                <div className="absolute left-[-18px] bottom-[-36px] h-28 w-36 rounded-full bg-[#ffe9b6]/40 blur-3xl" />
                <div className="relative mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
                  <span className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">{notifications.length} alerts</span>
                </div>
                <div className="grid gap-4">
                  {enhancedNotifications.length === 0 ? (
                    <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">No notifications yet.</p>
                  ) : (
                    <AnimatePresence initial={false}>
                      {enhancedNotifications
                        .filter((item) => !clearingNotifications.includes(item.id))
                        .map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(4px)" }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="rounded-[1.5rem] border border-slate-200 p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                              <div className="flex items-center gap-3">
                                {item.isOrderTracking && item.orderId && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveOrderId(item.orderId)}
                                    className="rounded-full bg-[#1c4a2e] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#163923]"
                                  >
                                    Track live
                                  </button>
                                )}
                                {isDismissibleNotification(item) ? (
                                  <button
                                    onClick={() => handleDismissNotification(item.id)}
                                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:border-[#1c4a2e] hover:text-[#1c4a2e]"
                                  >
                                    Clear
                                  </button>
                                ) : (
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${item.isOrderTracking ? "bg-[#e6f2ea] text-[#1c4a2e]" : "bg-[#fff6dd] text-[#b77904]"}`}>
                                    {item.isOrderTracking ? item.title : "Pending"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-900">My product orders</h2>
                  <Link href="/cart" className="text-sm font-semibold text-[#1c4a2e]">Go to cart</Link>
                </div>
                <div className="grid gap-4">
                  {userOrders.length === 0 ? (
                    <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">No orders placed yet.</p>
                  ) : (
                    userOrders.map((order) => (
                      <div key={order.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                        {(() => {
                          const routeProgress = order.routeProgress;
                          const pulse = 1 + Math.sin(clock / 450) * 0.08;

                        {(() => {
                          const orderMapState = getOrderMapState(order, order.mapMeta);

                          return (
                            <div className="text-sm text-slate-500">{(Array.isArray(order.items) ? order.items.length : 0)} items - Total Rs. {order.total}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-[#e6f2ea] px-4 py-2 text-sm text-[#1c4a2e]">{order.liveStatus}</span>
                            <button
                              type="button"
                              onClick={() => setActiveOrderId(order.id)}
                              className="rounded-full bg-[#1c4a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163923]"
                            >
                              Track live
                            </button>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                          <div className="rounded-[1.5rem] border border-[#ede3c4] bg-[linear-gradient(135deg,#fffdf8_0%,#fff8e5_50%,#ffffff_100%)] p-5 shadow-[0_18px_36px_rgba(180,140,30,0.08)]">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b77904]">Ordered items</div>
                            <div className="mt-4 space-y-3">
                              {(Array.isArray(order.items) ? order.items : []).map((item) => (
                                <div key={`${order.id}-${item.id}`} className="flex items-start justify-between gap-3 rounded-[1rem] border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
                                  <div>
                                    <div className="font-semibold text-slate-900">{item.name}</div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">Qty {item.quantity || 1}</div>
                                  </div>
                                  <div className="text-sm font-semibold text-[#1c4a2e]">Rs. {item.price * (item.quantity || 1)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[1.5rem] border border-[#f0d98e] bg-white p-5 shadow-[0_18px_36px_rgba(180,140,30,0.1)]">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b77904]">Price details</div>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                              <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-semibold text-slate-900">Rs. {order.pricing.subtotal}</span></div>
                              <div className="flex items-center justify-between"><span>GST (18%)</span><span className="font-semibold text-slate-900">Rs. {order.pricing.gstAmount}</span></div>
                              <div className="flex items-center justify-between"><span>Delivery fee</span><span className={`font-semibold ${order.pricing.deliveryFee === 0 ? "text-[#1c4a2e]" : "text-slate-900"}`}>{order.pricing.deliveryFee === 0 ? "Free" : `Rs. ${order.pricing.deliveryFee}`}</span></div>
                              <div className="h-px bg-[#f1e3b4]" />
                              <div className="flex items-center justify-between text-base font-semibold text-slate-900"><span>Total paid</span><span className="text-[#1c4a2e]">Rs. {order.pricing.total}</span></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-[#dcebdc] bg-[#f7fcf8]">
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1ea34a] px-5 py-4 text-white">
                            <div>
                              <div className="text-xs uppercase tracking-[0.22em] text-white/80">Track your order</div>
                              <div className="mt-1 text-2xl font-semibold">
                                {order.liveStatus === "Delivered" ? "Order delivered" : order.liveStatus === "Out for delivery" ? "Order is on the way" : `Order ${order.liveStatus.toLowerCase()}`}
                              </div>
                        <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_38px_rgba(15,23,42,0.06)]">
                          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f6fbf8_100%)] px-5 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Delivery tracking</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">{order.liveStatus}</div>
                                <div className="mt-2 text-sm text-slate-600">{getOrderNotificationDescription(order.trackingStage)}</div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#eaf7ef] px-4 py-2 text-sm font-semibold text-[#166534]">{order.etaLabel}</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveOrderId(order.id)}
                                  className="rounded-full bg-[#1c4a2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163923]"
                                >
                                  Track live
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
                            {renderRealRouteMap({
                              className: "relative min-h-[280px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#d9d5ce]",
                              embedUrl: orderMapState?.embedUrl,
                              sourcePosition: orderMapState?.hubPosition,
                              destinationPosition: orderMapState?.destinationPosition,
                              currentPosition: orderMapState?.currentPosition,
                              sourceLabel: order.mapMeta.hub,
                              destinationLabel: order.mapMeta.destination,
                              routeText: order.mapMeta.routeText,
                              footerText: `Updated ${new Date(clock).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                            })}
                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 p-4">
                              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Order progress</div>
                              <div className="mt-4 space-y-4">
                                {orderStages.map((stage, index) => {
                                  const currentIndex = orderStages.indexOf(order.trackingStage);
                                  const isCompleted = index < currentIndex;
                                  const isCurrent = stage === order.trackingStage;
                                  return (
                                    <div key={stage} className="relative pl-11">
                                      {index < orderStages.length - 1 && <div className={`absolute left-[13px] top-7 h-[calc(100%+10px)] w-[2px] ${index < currentIndex ? "bg-[#16a34a]" : "bg-slate-200"}`} />}
                                      <div className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${isCurrent ? "bg-[#16a34a] text-white" : isCompleted ? "bg-[#dcfce7] text-[#166534]" : "bg-slate-100 text-slate-500"}`}>{isCompleted ? "OK" : index + 1}</div>
                                      <div>
                                        <div className="font-semibold text-slate-900">{stage}</div>
                                        <div className="mt-1 text-xs text-slate-500">{isCurrent ? "Current live status" : isCompleted ? "Completed" : "Waiting"}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-900">My grooming services</h2>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">{userGroomingBookings.length} bookings</span>
                </div>
                <div className="grid gap-4">
                  {userGroomingBookings.length === 0 ? (
                    <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">No grooming sessions booked yet.</p>
                  ) : (
                    userGroomingBookings.map((booking) => (
                      <div key={booking.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{booking.groomerName}</div>
                            <div className="text-sm text-slate-500">{booking.petType} - {formatBookingServiceNames(booking)}</div>
                            <div className="mt-1 text-sm text-slate-500">Time slot: {booking.timeSlot || "Not selected"}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-4 py-2 text-sm ${booking.status === "accepted" ? "bg-[#e6f2ea] text-[#1c4a2e]" : "bg-amber-100 text-amber-700"}`}>
                              {booking.status === "accepted" ? booking.stage : booking.status}
                            </span>
                            {booking.status === "accepted" && (
                              <button
                                onClick={() => { setLiveToast(null); setActiveGroomingBookingId(booking.id); }}
                                className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white"
                              >
                                Track live
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-900">Confirmed consultations</h2>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                    {userVetBookings.filter((booking) => booking.status === "accepted").length} confirmed
                  </span>
                </div>
                <div className="grid gap-4">
                  {userVetBookings.filter((booking) => booking.status === "accepted").length === 0 ? (
                    <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">Accepted consultations will appear here after the clinic confirms your paid request.</p>
                  ) : (
                    userVetBookings
                      .filter((booking) => booking.status === "accepted")
                      .map((booking) => (
                        <div key={booking.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <div className="text-lg font-semibold text-slate-900">{booking.doctorName}</div>
                              <div className="mt-1 text-sm text-slate-500">{booking.serviceName}</div>
                            </div>
                            <div className="rounded-full bg-[#e6f2ea] px-4 py-2 text-sm font-semibold text-[#1c4a2e]">
                              Appointment confirmed
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {session.role === "doctor" && (
            <div className="grid gap-8">
              <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                <h2 className="mb-6 text-2xl font-semibold text-slate-900">Incoming consultation requests</h2>
                <div className="grid gap-4">
                  {doctorBookings.length === 0 ? (
                    <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">No consultation requests yet.</p>
                  ) : (
                    doctorBookings.map((booking) => (
                      <div key={booking.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{booking.userName}</div>
                            <div className="text-sm text-slate-500">{booking.serviceName} - Paid Rs. {booking.amountPaid}</div>
                          </div>
                          {booking.status === "pending" ? (
                            <button onClick={() => approveBooking(booking.id)} className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white">
                              Accept booking
                            </button>
                          ) : (
                            <span className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">accepted</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-900">Confirmed appointments</h2>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                    {doctorBookings.filter((booking) => booking.status === "accepted").length} accepted
                  </span>
                </div>
                <div className="grid gap-4">
                  {doctorBookings.filter((booking) => booking.status === "accepted").length === 0 ? (
                    <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">Accepted appointments will appear here after you confirm them.</p>
                  ) : (
                    doctorBookings
                      .filter((booking) => booking.status === "accepted")
                      .map((booking) => (
                        <div key={booking.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <div className="text-lg font-semibold text-slate-900">{booking.userName}</div>
                              <div className="mt-1 text-sm text-slate-500">{booking.serviceName} - Paid Rs. {booking.amountPaid}</div>
                            </div>
                            <div className="rounded-full bg-[#e6f2ea] px-4 py-2 text-sm font-semibold text-[#1c4a2e]">
                              Appointment confirmed
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {session.role === "groomer" && (
            <div className="rounded-[2rem] bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-semibold text-slate-900">Live grooming jobs</h2>
              <div className="grid gap-4">
                {groomerJobs.length === 0 ? (
                  <p className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-500">No grooming jobs yet.</p>
                ) : (
                  groomerJobs.map((booking) => (
                    <div key={booking.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold text-slate-900">{booking.userName}</div>
                          <div className="mt-1 text-sm text-slate-500">{booking.status === "accepted" ? "Accepted slot" : "Requested slot"}: {booking.timeSlot || "Not selected"}</div>
                          <div className="text-sm text-slate-500">{booking.petType} - {formatBookingServiceNames(booking)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-4 py-2 text-sm ${booking.status === "accepted" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>
                            {booking.status === "accepted" ? booking.stage : "pending"}
                          </span>
                          {booking.status === "pending" ? (
                            <button onClick={() => approveGrooming(booking.id)} className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white">
                              Accept slot
                            </button>
                          ) : (
                            <>
                              <button onClick={() => { setLiveToast(null); setActiveGroomingBookingId(booking.id); }} className="rounded-full border border-[#1c4a2e] px-5 py-3 text-sm font-semibold text-[#1c4a2e] transition hover:bg-[#eef8f1]">
                                {["picked_up", "reached_center", "session_in_progress", "grooming_processes", "returning", "delivered"].includes(getGroomingTrackingStatus(booking)) ? "Open live chat" : "Open tracker"}
                              </button>
                              {canAdvanceGroomingService(booking) && (
                                <button onClick={() => advanceGroomingStage(booking.id)} className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white">
                                  {getAdvanceGroomingLabel(booking)}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <AnimatePresence>
            {activeGroomingBooking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveGroomingBookingId("")}
                className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/45 px-4 py-6 sm:px-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  onClick={(event) => event.stopPropagation()}
                className="mx-auto flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2.25rem] bg-[#fbfcfa] shadow-[0_40px_110px_rgba(15,23,42,0.28)]"
              >
                  <div className="z-10 shrink-0 border-b border-slate-200/80 bg-white/98 px-4 py-3 backdrop-blur md:px-6 md:py-4">
                    <div className="rounded-[1.4rem] border border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbf8_45%,#eef8f3_100%)] px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:px-5 md:py-4">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-[0.32em] text-[#946206]">Live grooming journey</p>
                          <h2 className="mt-2 text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-900 md:text-[2.2rem]">
                            {activeGroomingBooking.groomerName}
                          </h2>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                            {activeGroomingBooking.petType} grooming booking with {formatBookingServiceNames(activeGroomingBooking)}.
                          </p>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-3 xl:w-[520px]">
                          <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 shadow-sm">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Current stage</div>
                            <div className="mt-1 text-sm font-semibold text-emerald-800 md:text-base">{activeGroomingStageLabel}</div>
                          </div>

                          <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Time slot</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900 md:text-base">{activeGroomingBooking.timeSlot}</div>
                          </div>

                          <button
                            onClick={() => setActiveGroomingBookingId("")}
                            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
                          >
                            Close tracker
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-5 md:px-6 md:pb-6">
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_390px]">
                    <div className="space-y-5">
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.08)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 bg-[linear-gradient(135deg,#159947_0%,#22b455_55%,#46c56f_100%)] px-6 py-5 text-white">
                          <div>
                            <div className="text-xs uppercase tracking-[0.26em] text-white/80">Live pickup route</div>
                            <h3 className="mt-2 text-[2rem] font-semibold leading-none">{getTrackingStatusText(activeGroomingBooking)}</h3>
                            <p className="mt-2 max-w-xl text-sm text-white/85">
                              Doorstep pickup to spa tracking with live progress
                            </p>
                          </div>
                          <div className="rounded-full border border-white/20 bg-white/12 px-5 py-3 text-sm font-semibold shadow-inner">
                            Slot: {activeGroomingBooking.timeSlot}
                          </div>
                        </div>

                        <div className="p-5 md:p-6">
                        {!showLiveRoute ? (
                          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500">
                            Live tracking starts once the groomer begins pickup.
                          </div>
                        ) : (
                          <>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              {renderRealRouteMap({
                                className: "relative h-[360px] overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[#d9d7d0] shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] sm:h-[430px]",
                                embedUrl: activeGroomingMapState?.embedUrl,
                                sourcePosition: activeGroomingMapState?.pickupPosition,
                                destinationPosition: activeGroomingMapState?.spaPosition,
                                currentPosition: activeGroomingMapState?.currentPosition,
                                sourceBadge: "PICK",
                                sourceLabel: activeMapMeta.pickupTag,
                                destinationBadge: "SPA",
                                destinationLabel: activeMapMeta.destinationTag,
                                routeText: activeMapMeta.routeText,
                                footerText: activeMapMeta.helperText,
                              })}
                            </motion.div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Pickup</div>
                              <div className="mt-1 text-sm font-semibold text-slate-800">Doorstep pickup</div>
                            </div>
                            <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Destination</div>
                              <div className="mt-1 text-sm font-semibold text-slate-800">Lakshmi's Pet Studio</div>
                            </div>
                            <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Route state</div>
                              <div className="mt-1 text-sm font-semibold text-slate-800">Live route between pickup and spa</div>
                            </div>
                          </div>
                          </>
                        )}
                        </div>
                      </motion.div>

                      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Services in this booking</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {getBookingServiceNames(activeGroomingBooking).map((service) => (
                              <span key={service} className="rounded-full border border-amber-200 bg-[#fff6dd] px-3 py-2 text-sm font-medium text-[#946206] shadow-[0_10px_20px_rgba(148,98,6,0.08)]">
                                {service}
                              </span>
                            ))}
                          </div>
                          {canAdvanceGroomingService(activeGroomingBooking) && (
                            <button
                              onClick={() => advanceGroomingStage(activeGroomingBooking.id)}
                              className="mt-4 rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white"
                            >
                              {getAdvanceGroomingLabel(activeGroomingBooking)}
                            </button>
                          )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live chat with your groomer</div>
                            {groomingChatUnlocked && (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                Live
                              </span>
                            )}
                          </div>
                          {!groomingChatUnlocked ? (
                            <p className="text-sm text-slate-500">Chat unlocks after your pet has been picked up.</p>
                          ) : (
                            <>
                              <div className="mb-4 max-h-72 space-y-3 overflow-y-auto rounded-[1.4rem] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-4">
                                {activeGroomingMessages.length === 0 ? (
                                  <p className="text-sm text-slate-500">No grooming messages yet.</p>
                                ) : (
                                  activeGroomingMessages.map((message) => (
                                    <div key={message.id} className={`rounded-[1.8rem] p-4 shadow-sm ${message.senderId === session.id ? "ml-auto max-w-[80%] bg-[#1c4a2e] text-white" : "max-w-[80%] bg-white text-slate-900"}`}>
                                      <div className="text-xs opacity-70">{message.senderName}</div>
                                      <div>{message.text}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="flex gap-3">
                                <input value={groomingChatInput} onChange={(e) => setGroomingChatInput(e.target.value)} placeholder={session.role === "groomer" ? "Send update to the pet parent..." : "Message your groomer..."} className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3" />
                                <button
                                  onClick={() => {
                                    const result = sendGroomingMessage({ bookingId: activeGroomingBooking.id, text: groomingChatInput, toUserId: session.role === "groomer" ? activeGroomingBooking.userId : activeGroomingBooking.groomerId });
                                    if (result.ok) setGroomingChatInput("");
                                  }}
                                  className="rounded-full bg-[#1c4a2e] px-5 py-3 text-sm font-semibold text-white"
                                >
                                  Send
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Journey progress</div>
                          <div className="mt-1 text-lg font-semibold text-slate-900">Stage-by-stage timeline</div>
                        </div>
                        <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {activeGroomingStageIndex + 1}/{activeGroomingTimeline.length}
                        </div>
                      </div>
                    <div className="space-y-3">
                      {activeGroomingTimeline.map((stage, index) => {
                        const currentIndex = activeGroomingStageIndex;
                        const isCompleted = index <= currentIndex;
                        const isCurrent = stage === activeGroomingStageLabel;
                        return (
                          <div key={stage} className={`rounded-[1.35rem] border px-4 py-3.5 ${isCurrent ? "border-[#1ea34a] bg-[#e9f8ee] shadow-[0_12px_28px_rgba(30,163,74,0.12)]" : isCompleted ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isCompleted ? "bg-[#1ea34a] text-white" : "bg-slate-200 text-slate-500"}`}>
                                {isCompleted ? "OK" : index + 1}
                              </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{getDisplayedGroomingStage(stage, activeGroomingBooking)}</div>
                                  <div className="text-xs text-slate-500">
                                    {getDisplayedGroomingStageDescription(stage, activeGroomingBooking, isCurrent, isCompleted)}
                                  </div>
                                </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </motion.div>
                  </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}












































