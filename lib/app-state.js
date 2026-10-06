import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { demoUsers, demoDoctors, demoGroomers, products as catalogProducts, clinicServices, groomingServices as catalogGroomingServices, groomingTimeSlots as catalogGroomingTimeSlots, ORDER_STATUSES, GROOMING_STAGES, locationOptions } from "./animal-data";

const AppContext = createContext(null);

const STORAGE_KEYS = {
  SESSION: "animal_park_session",
  USERS: "animal_park_users",
  DOCTORS: "animal_park_doctors",
  GROOMERS: "animal_park_groomers",
  BOOKINGS: "animal_park_bookings",
  GROOMING: "animal_park_grooming_bookings",
  CART: "animal_park_cart",
  ORDERS: "animal_park_orders",
  NOTIFICATIONS: "animal_park_notifications",
  MESSAGES: "animal_park_messages",
  GROOMING_MESSAGES: "animal_park_grooming_messages",
  CHECKOUT: "animal_park_checkout_draft",
  RECEIPTS: "animal_park_receipts",
};

const PREMIUM_PLAN = {
  title: "Animal Park Premium",
  subtitle: "VIP pet care access",
  subtotal: 999,
  gstAmount: 180,
  deliveryFee: 0,
  total: 1179,
  benefits: [
    "Free delivery on product orders",
    "Priority grooming discounts",
    "Premium consultation savings",
    "Member-only tracking and perks",
  ],
};

function createTransactionNumber(prefix = "TRX") {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function createReceiptRecord({
  kind,
  userId,
  title,
  amount,
  subtotal,
  gstAmount,
  deliveryFee,
  paymentMethod,
  relatedId,
  lineItems = [],
}) {
  const createdAt = new Date().toISOString();
  const receiptNumber = `APR-${Date.now().toString().slice(-8)}`;
  const transactionNumber = createTransactionNumber("PAY");

  return {
    id: `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    receiptNumber,
    transactionNumber,
    kind,
    userId,
    title,
    relatedId,
    paymentMethod,
    lineItems,
    subtotal,
    gstAmount,
    deliveryFee,
    amount,
    createdAt,
  };
}

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        setState(JSON.parse(storedValue));
      }
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}"`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event) => {
      if (event.storageArea !== window.localStorage || event.key !== key) return;
      try {
        setState(event.newValue ? JSON.parse(event.newValue) : initialValue);
      } catch (error) {
        console.warn(`Failed to sync localStorage key "${key}"`, error);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialValue, key]);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to write localStorage key "${key}"`, error);
    }
  }, [isHydrated, key, state]);

  return [state, setState, isHydrated];
}

function useSessionStorageState(key, initialValue) {
  const [state, setState] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedValue = window.sessionStorage.getItem(key);
      if (storedValue) {
        setState(JSON.parse(storedValue));
      }
    } catch (error) {
      console.warn(`Failed to read sessionStorage key "${key}"`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event) => {
      if (event.storageArea !== window.sessionStorage || event.key !== key) return;
      try {
        setState(event.newValue ? JSON.parse(event.newValue) : initialValue);
      } catch (error) {
        console.warn(`Failed to sync sessionStorage key "${key}"`, error);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialValue, key]);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to write sessionStorage key "${key}"`, error);
    }
  }, [isHydrated, key, state]);

  return [state, setState, isHydrated];
}

function normalizePetType(value) {
  if (!value) return "Dog";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

const ORDER_TRACKING_STEPS = ["Order placed", "Order confirmed", "Order dispatched", "Out for delivery", "Delivered"];

const ORDER_TRACKING_STATUS_LABELS = {
  placed: "Order placed",
  confirmed: "Order confirmed",
  dispatched: "Order dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

const ORDER_DEMO_CONFIG = {
  confirmDelayMs: 15000,
  dispatchDelayMs: 15000,
  outForDeliveryDelayMs: 15000,
  deliveryTravelMs: 10000,
};
const GROOMING_DEMO_CONFIG = {
  toPickupMs: 10000,
  toStudioMs: 10000,
  perServiceMs: 10000,
  returnHomeMs: 10000,
};

const GROOMING_STAGE_LABELS = {
  accepted: "Booking accepted",
  picked_up: "Pet picked up",
  reached_center: "Reached grooming center",
  session_in_progress: "Grooming session in progress",
  returning: "Returning home",
  delivered: "Delivered back",
};
const GROOMING_TRAVEL_STATUSES = ["accepted", "picked_up", "returning"];

function appendCompletedStages(existingStages, nextStages = []) {
  const stageSet = new Set(Array.isArray(existingStages) ? existingStages.filter(Boolean) : []);
  nextStages.filter(Boolean).forEach((stage) => stageSet.add(stage));
  return Array.from(stageSet);
}

function getGroomingTravelDuration(status) {
  if (status === "accepted") return GROOMING_DEMO_CONFIG.toPickupMs;
  if (status === "picked_up") return GROOMING_DEMO_CONFIG.toStudioMs;
  if (status === "returning") return GROOMING_DEMO_CONFIG.returnHomeMs;
  return null;
}

function getGroomingTravelLeg(status) {
  if (status === "accepted") return "to_pickup";
  if (status === "picked_up") return "to_center";
  if (status === "returning") return "to_home";
  return null;
}

function getTrackingStageStatusFromBooking(booking = {}) {
  const stage = booking?.stage;
  const serviceNames = getSafeServiceNames(booking);

  if (serviceNames.includes(stage)) return "grooming_processes";
  if (stage === GROOMING_STAGE_LABELS.session_in_progress) return "session_in_progress";
  if (stage === GROOMING_STAGE_LABELS.reached_center) return "reached_center";
  if (stage === GROOMING_STAGE_LABELS.picked_up) return "picked_up";
  if (stage === GROOMING_STAGE_LABELS.accepted) return "accepted";
  if (stage === GROOMING_STAGE_LABELS.returning) return "returning";
  if (stage === GROOMING_STAGE_LABELS.delivered) return "delivered";
  return booking?.status || "pending";
}

function getGroomingTrackingStageIndex(status, booking = {}, currentProcess = null) {
  const serviceNames = getSafeServiceNames(booking);

  if (status === "accepted") return 1;
  if (status === "picked_up") return 2;
  if (status === "reached_center") return 3;
  if (status === "session_in_progress") return 4;
  if (status === "grooming_processes") {
    const processIndex = Math.max(0, serviceNames.indexOf(currentProcess));
    return 5 + processIndex;
  }
  if (status === "returning") return serviceNames.length + 5;
  if (status === "delivered") return serviceNames.length + 6;
  return 0;
}

function getDerivedCompletedStages(booking = {}, status, currentProcess = null) {
  const serviceNames = getSafeServiceNames(booking);
  const completedStages = [];

  if (status !== "pending") completedStages.push(GROOMING_STAGE_LABELS.accepted);
  if (["picked_up", "reached_center", "session_in_progress", "grooming_processes", "returning", "delivered"].includes(status)) {
    completedStages.push(GROOMING_STAGE_LABELS.picked_up);
  }
  if (["reached_center", "session_in_progress", "grooming_processes", "returning", "delivered"].includes(status)) {
    completedStages.push(GROOMING_STAGE_LABELS.reached_center);
  }
  if (["session_in_progress", "grooming_processes", "returning", "delivered"].includes(status)) {
    completedStages.push(GROOMING_STAGE_LABELS.session_in_progress);
  }
  if (status === "grooming_processes") {
    const processIndex = Math.max(0, serviceNames.indexOf(currentProcess));
    completedStages.push(...serviceNames.slice(0, processIndex));
  }
  if (["returning", "delivered"].includes(status)) {
    completedStages.push(...serviceNames);
  }
  if (status === "delivered") {
    completedStages.push(GROOMING_STAGE_LABELS.returning, GROOMING_STAGE_LABELS.delivered);
  }

  return completedStages;
}

function normalizeGroomingTracking(booking = {}) {
  const tracking = booking?.tracking || {};
  const stageStatus = getTrackingStageStatusFromBooking(booking);
  const stageCurrentProcess = stageStatus === "grooming_processes" ? booking?.stage || null : null;
  const stageIndex = getGroomingTrackingStageIndex(stageStatus, booking, stageCurrentProcess);
  const trackingCurrentProcess = tracking.currentProcess || stageCurrentProcess;
  const trackingStatus = tracking.status || stageStatus;
  const trackingIndex = getGroomingTrackingStageIndex(trackingStatus, booking, trackingCurrentProcess);
  const resolvedStatus = stageIndex > trackingIndex ? stageStatus : trackingStatus;
  const resolvedCurrentProcess = resolvedStatus === "grooming_processes"
    ? (stageIndex > trackingIndex ? stageCurrentProcess : trackingCurrentProcess)
    : resolvedStatus === "session_in_progress"
      ? (trackingCurrentProcess || getSafeServiceNames(booking)[0] || null)
      : null;
  const resolvedStageIndex = Math.max(
    typeof tracking.currentStage === "number" ? tracking.currentStage : 0,
    getGroomingTrackingStageIndex(resolvedStatus, booking, resolvedCurrentProcess)
  );
  const resolvedTravelLeg = tracking.travelLeg || getGroomingTravelLeg(resolvedStatus);
  const resolvedTravelDurationMs = Number(tracking.travelDurationMs) || getGroomingTravelDuration(resolvedStatus);
  const resolvedTravelStartedAt = tracking.travelStartedAt || (resolvedTravelLeg ? (tracking.startedAt || booking?.acceptedAt || booking?.createdAt || null) : null);

  return {
    status: resolvedStatus,
    currentStage: resolvedStageIndex,
    currentProcess: resolvedCurrentProcess,
    completedStages: appendCompletedStages(tracking.completedStages, getDerivedCompletedStages(booking, resolvedStatus, resolvedCurrentProcess)),
    isActive: typeof tracking.isActive === "boolean" ? tracking.isActive : (resolvedStatus !== "pending" && resolvedStatus !== "delivered"),
    startedAt: tracking.startedAt || resolvedTravelStartedAt || booking?.acceptedAt || booking?.createdAt || null,
    travelLeg: resolvedTravelLeg,
    travelStartedAt: resolvedTravelStartedAt,
    travelDurationMs: resolvedTravelDurationMs,
  };
}

function getRemainingGroomingTravelMs(tracking = {}, now = Date.now()) {
  if (!tracking?.travelLeg || !tracking?.travelStartedAt || !tracking?.travelDurationMs) return null;
  return Math.max(0, Number(tracking.travelDurationMs) - (now - Number(tracking.travelStartedAt)));
}

function ensureNotificationKeyList(value) {
  return Array.isArray(value) ? value : [];
}

function getSafeServices(booking = {}) {
  return Array.isArray(booking?.services) ? booking.services.filter(Boolean) : [];
}

function getSafeServiceNames(booking = {}) {
  if (Array.isArray(booking?.serviceNames) && booking.serviceNames.length) {
    return booking.serviceNames.filter(Boolean);
  }

  const derived = getSafeServices(booking)
    .map((service) => service?.name)
    .filter(Boolean);

  return derived;
}

function getOrderTrackingStageIndex(status) {
  return ({
    placed: 1,
    confirmed: 2,
    dispatched: 3,
    out_for_delivery: 4,
    delivered: 5,
  }[status] || 1);
}

function getOrderTrackingStageLabel(status) {
  return ORDER_TRACKING_STATUS_LABELS[status] || ORDER_TRACKING_STEPS[0];
}

function getOrderStageDuration(status) {
  if (status === "placed") return ORDER_DEMO_CONFIG.confirmDelayMs;
  if (status === "confirmed") return ORDER_DEMO_CONFIG.dispatchDelayMs;
  if (status === "dispatched") return ORDER_DEMO_CONFIG.outForDeliveryDelayMs;
  if (status === "out_for_delivery") return ORDER_DEMO_CONFIG.deliveryTravelMs;
  return null;
}

function getRemainingOrderStageMs(tracking, now = Date.now()) {
  if (!tracking || tracking.status === "delivered") return null;
  const durationMs = getOrderStageDuration(tracking.status);
  if (!durationMs) return null;
  const startedAt = tracking.status === "out_for_delivery"
    ? Number(tracking.travelStartedAt || tracking.stageStartedAt || tracking.startedAt || now)
    : Number(tracking.stageStartedAt || tracking.startedAt || now);
  return Math.max(0, durationMs - (now - startedAt));
}

function buildOrderTrackingState(order, now = Date.now()) {
  const tracking = order?.tracking || {};
  const createdAtMs = order?.createdAt ? new Date(order.createdAt).getTime() : now;
  const startedAt = Number(tracking.startedAt || createdAtMs || now);
  let status = tracking.status;
  let stageStartedAt = Number(tracking.stageStartedAt || 0);
  let travelStartedAt = tracking.travelStartedAt ? Number(tracking.travelStartedAt) : null;
  let travelDurationMs = tracking.travelDurationMs ? Number(tracking.travelDurationMs) : null;

  if (!status) {
    const elapsed = Math.max(0, now - startedAt);
    const confirmAt = ORDER_DEMO_CONFIG.confirmDelayMs;
    const dispatchAt = confirmAt + ORDER_DEMO_CONFIG.dispatchDelayMs;
    const outForDeliveryAt = dispatchAt + ORDER_DEMO_CONFIG.outForDeliveryDelayMs;
    const deliveredAt = outForDeliveryAt + ORDER_DEMO_CONFIG.deliveryTravelMs;

    if (elapsed >= deliveredAt) {
      status = "delivered";
      stageStartedAt = startedAt + deliveredAt;
    } else if (elapsed >= outForDeliveryAt) {
      status = "out_for_delivery";
      stageStartedAt = startedAt + outForDeliveryAt;
      travelStartedAt = stageStartedAt;
      travelDurationMs = ORDER_DEMO_CONFIG.deliveryTravelMs;
    } else if (elapsed >= dispatchAt) {
      status = "dispatched";
      stageStartedAt = startedAt + dispatchAt;
    } else if (elapsed >= confirmAt) {
      status = "confirmed";
      stageStartedAt = startedAt + confirmAt;
    } else {
      status = "placed";
      stageStartedAt = startedAt;
    }
  }

  if (!stageStartedAt) {
    stageStartedAt = startedAt;
  }

  if (status === "out_for_delivery") {
    travelStartedAt = travelStartedAt || stageStartedAt;
    travelDurationMs = travelDurationMs || ORDER_DEMO_CONFIG.deliveryTravelMs;
  } else {
    travelStartedAt = null;
    travelDurationMs = null;
  }

  const travelElapsed = travelStartedAt && travelDurationMs ? Math.max(0, now - travelStartedAt) : 0;
  const remainingMs = getRemainingOrderStageMs({ status, stageStartedAt, startedAt, travelStartedAt, travelDurationMs }, now);

  return {
    status,
    currentStage: getOrderTrackingStageIndex(status),
    currentTrackingStep: getOrderTrackingStageLabel(status),
    isActive: status !== "delivered",
    startedAt,
    stageStartedAt,
    travelStartedAt,
    travelDurationMs,
    routeMode: status === "out_for_delivery" ? "to_destination" : status === "delivered" ? "complete" : "idle",
    routeProgress: status === "out_for_delivery" && travelDurationMs ? Math.min(1, travelElapsed / travelDurationMs) : status === "delivered" ? 1 : 0,
    estimatedArrivalSeconds: remainingMs === null ? 0 : Math.max(0, Math.ceil(remainingMs / 1000)),
    lastUpdatedAt: new Date(now).toISOString(),
    notifiedTrackingEvents: ensureNotificationKeyList(tracking.notifiedTrackingEvents || order?.notifiedTrackingEvents),
  };
}

function buildGroomingTrackingState(booking, now = Date.now()) {
  const processQueue = getSafeServiceNames(booking);
  const timelineSteps = [
    GROOMING_STAGE_LABELS.accepted,
    GROOMING_STAGE_LABELS.picked_up,
    GROOMING_STAGE_LABELS.reached_center,
    GROOMING_STAGE_LABELS.session_in_progress,
    ...processQueue,
    GROOMING_STAGE_LABELS.returning,
    GROOMING_STAGE_LABELS.delivered,
  ];
  const tracking = normalizeGroomingTracking(booking);
  const trackingStatus = tracking.status;
  const currentTrackingStep = trackingStatus === "grooming_processes"
    ? tracking.currentProcess || booking?.stage || "Grooming in progress"
    : booking?.stage || GROOMING_STAGE_LABELS[trackingStatus] || "Awaiting acceptance";
  const travelStartedAt = Number(tracking.travelStartedAt || tracking.startedAt || now);
  const travelDurationMs = Number(tracking.travelDurationMs || getGroomingTravelDuration(trackingStatus) || 0);
  const elapsed = Math.max(0, now - travelStartedAt);

  let routeMode = "idle";
  let routeProgress = 0;
  let estimatedArrivalMinutes = null;

  if (trackingStatus === "accepted") {
    routeMode = "to_pickup";
    routeProgress = travelDurationMs ? Math.min(1, elapsed / travelDurationMs) : 0;
    estimatedArrivalMinutes = Math.max(1, Math.ceil(((travelDurationMs || GROOMING_DEMO_CONFIG.toPickupMs) - elapsed) / 1000));
  } else if (trackingStatus === "picked_up") {
    routeMode = "to_studio";
    routeProgress = travelDurationMs ? Math.min(1, elapsed / travelDurationMs) : 0;
    estimatedArrivalMinutes = Math.max(1, Math.ceil(((travelDurationMs || GROOMING_DEMO_CONFIG.toStudioMs) - elapsed) / 1000));
  } else if (trackingStatus === "reached_center" || trackingStatus === "session_in_progress" || trackingStatus === "grooming_processes") {
    routeMode = "at_studio";
    routeProgress = 1;
  } else if (trackingStatus === "returning") {
    routeMode = "to_home";
    routeProgress = travelDurationMs ? Math.min(1, elapsed / travelDurationMs) : 0;
    estimatedArrivalMinutes = Math.max(1, Math.ceil(((travelDurationMs || GROOMING_DEMO_CONFIG.returnHomeMs) - elapsed) / 1000));
  } else if (trackingStatus === "delivered") {
    routeMode = "complete";
    routeProgress = 1;
    estimatedArrivalMinutes = 0;
  }

  return {
    trackingEnabled: true,
    trackingStartedAt: tracking.startedAt,
    currentTrackingStep,
    trackingStatus,
    stage: currentTrackingStep,
    routeMode,
    routeProgress,
    estimatedArrivalMinutes,
    processQueue,
    timelineSteps,
    lastUpdatedAt: new Date(now).toISOString(),
    notifiedTrackingEvents: ensureNotificationKeyList(booking?.notifiedTrackingEvents),
  };
}

export function AppProvider({ children }) {
  const [session, setSession, sessionHydrated] = useSessionStorageState(STORAGE_KEYS.SESSION, null);
  const [users, setUsers, usersHydrated] = useLocalStorageState(STORAGE_KEYS.USERS, demoUsers);
  const [doctors, setDoctors, doctorsHydrated] = useLocalStorageState(STORAGE_KEYS.DOCTORS, demoDoctors);
  const [groomers, setGroomers, groomersHydrated] = useLocalStorageState(STORAGE_KEYS.GROOMERS, demoGroomers);
  const [bookings, setBookings, bookingsHydrated] = useLocalStorageState(STORAGE_KEYS.BOOKINGS, []);
  const [groomingBookings, setGroomingBookings, groomingHydrated] = useLocalStorageState(STORAGE_KEYS.GROOMING, []);
  const [cart, setCart, cartHydrated] = useLocalStorageState(STORAGE_KEYS.CART, []);
  const [orders, setOrders, ordersHydrated] = useLocalStorageState(STORAGE_KEYS.ORDERS, []);
  const [notifications, setNotifications, notificationsHydrated] = useLocalStorageState(STORAGE_KEYS.NOTIFICATIONS, []);
  const [messages, setMessages, messagesHydrated] = useLocalStorageState(STORAGE_KEYS.MESSAGES, {});
  const [groomingMessages, setGroomingMessages, groomingMessagesHydrated] = useLocalStorageState(STORAGE_KEYS.GROOMING_MESSAGES, {});
  const [checkoutDraft, setCheckoutDraft, checkoutHydrated] = useLocalStorageState(STORAGE_KEYS.CHECKOUT, null);
  const [receipts, setReceipts, receiptsHydrated] = useLocalStorageState(STORAGE_KEYS.RECEIPTS, []);
  const orderTrackingTimersRef = useRef({});
  const ordersRef = useRef([]);
  const groomingTrackingTimersRef = useRef({});
  const groomingBookingsRef = useRef([]);

  const isHydrated =
    sessionHydrated &&
    usersHydrated &&
    doctorsHydrated &&
    groomersHydrated &&
    bookingsHydrated &&
    groomingHydrated &&
    cartHydrated &&
    ordersHydrated &&
    notificationsHydrated &&
    messagesHydrated &&
    groomingMessagesHydrated &&
    checkoutHydrated &&
    receiptsHydrated;

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    groomingBookingsRef.current = groomingBookings;
  }, [groomingBookings]);

  const persistOrdersSnapshot = useCallback((nextOrders) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));
    } catch (error) {
      console.warn(`Failed to persist localStorage key "${STORAGE_KEYS.ORDERS}"`, error);
    }
  }, []);

  useEffect(() => {
    if (!ordersHydrated) return;

    setOrders((prev) => {
      let changed = false;
      const nextOrders = prev.map((order) => {
        const normalizedTracking = buildOrderTrackingState(order);
        const nextStatus = getOrderTrackingStageLabel(normalizedTracking.status);
        const hasChanged = JSON.stringify(order.tracking || {}) !== JSON.stringify(normalizedTracking) || order.status !== nextStatus;

        if (!hasChanged) return order;
        changed = true;
        return {
          ...order,
          status: nextStatus,
          tracking: normalizedTracking,
        };
      });

      if (!changed) return prev;
      ordersRef.current = nextOrders;
      persistOrdersSnapshot(nextOrders);
      return nextOrders;
    });
  }, [ordersHydrated, persistOrdersSnapshot, setOrders]);

  const persistGroomingBookingsSnapshot = useCallback((nextBookings) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.GROOMING, JSON.stringify(nextBookings));
    } catch (error) {
      console.warn(`Failed to persist localStorage key "${STORAGE_KEYS.GROOMING}"`, error);
    }
  }, []);

  useEffect(() => {
    if (!groomingHydrated) return;

    setGroomingBookings((prev) => {
      let changed = false;
      const nextBookings = prev.map((booking) => {
        const normalizedTracking = normalizeGroomingTracking(booking);
        const normalizedStage = booking.stage && booking.stage !== "Awaiting acceptance"
          ? booking.stage
          : normalizedTracking.status === "grooming_processes"
            ? (normalizedTracking.currentProcess || booking.stage || "Grooming in progress")
            : (GROOMING_STAGE_LABELS[normalizedTracking.status] || booking.stage || "Awaiting acceptance");
        const hasChanged = JSON.stringify(booking.tracking || {}) !== JSON.stringify(normalizedTracking) || booking.stage !== normalizedStage;

        if (!hasChanged) return booking;
        changed = true;
        return {
          ...booking,
          stage: normalizedStage,
          tracking: normalizedTracking,
        };
      });

      if (!changed) return prev;
      persistGroomingBookingsSnapshot(nextBookings);
      return nextBookings;
    });
  }, [groomingHydrated, persistGroomingBookingsSnapshot, setGroomingBookings]);

  const currentUser = useMemo(() => {
    if (!session) return null;
    if (session.role === "user") return users.find((item) => item.id === session.id) || null;
    if (session.role === "doctor") return doctors.find((item) => item.id === session.id) || null;
    if (session.role === "groomer") return groomers.find((item) => item.id === session.id) || null;
    return null;
  }, [session, users, doctors, groomers]);

  const pushNotification = useCallback((notification) => {
    const nextNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      dismissible: true,
      ...notification,
      message: notification.message || notification.description || "",
      description: notification.description || notification.message || "",
    };

    setNotifications((prev) => [nextNotification, ...prev].slice(0, 50));
    return nextNotification;
  }, [setNotifications]);

  const pushMessage = useCallback((bookingId, payload) => {
    const nextMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };

    setMessages((prev) => ({
      ...prev,
      [bookingId]: [...(prev[bookingId] || []), nextMessage],
    }));
  }, [setMessages]);

  const pushGroomingMessage = useCallback((bookingId, payload) => {
    const nextMessage = {
      id: `gmsg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };

    setGroomingMessages((prev) => ({
      ...prev,
      [bookingId]: [...(prev[bookingId] || []), nextMessage],
    }));
  }, [setGroomingMessages]);

  const clearOrderTrackingTimer = useCallback((orderId) => {
    const timerId = orderTrackingTimersRef.current[orderId];
    if (timerId) {
      window.clearTimeout(timerId);
    }
    delete orderTrackingTimersRef.current[orderId];
  }, []);

  const queueOrderTrackingTimer = useCallback((orderId, callback, delay) => {
    clearOrderTrackingTimer(orderId);
    const timerId = window.setTimeout(() => {
      delete orderTrackingTimersRef.current[orderId];
      callback();
    }, delay);
    orderTrackingTimersRef.current[orderId] = timerId;
    return timerId;
  }, [clearOrderTrackingTimer]);

  const updateOrderState = useCallback((orderId, updater) => {
    let nextOrder = null;
    const nextOrders = ordersRef.current.map((order) => {
      if (order.id !== orderId) return order;
      nextOrder = typeof updater === "function" ? updater(order) : { ...order, ...updater };
      return nextOrder;
    });

    ordersRef.current = nextOrders;
    setOrders(nextOrders);
    persistOrdersSnapshot(nextOrders);
    return nextOrder;
  }, [persistOrdersSnapshot, setOrders]);

  const createOrderTrackingNotification = useCallback((order, title, message, eventKey) => {
    if (!order) return;
    const notificationKey = eventKey || order?.tracking?.status || title;
    const notifiedTrackingEvents = ensureNotificationKeyList(order?.tracking?.notifiedTrackingEvents || order?.notifiedTrackingEvents);
    if (notifiedTrackingEvents.includes(notificationKey)) return;

    updateOrderState(order.id, (currentOrder) => ({
      ...currentOrder,
      tracking: {
        ...(currentOrder.tracking || {}),
        notifiedTrackingEvents: [...ensureNotificationKeyList(currentOrder?.tracking?.notifiedTrackingEvents), notificationKey],
      },
    }));

    pushNotification({
      title,
      message,
      audienceRole: "user",
      audienceId: order.userId,
      orderId: order.id,
      linkedOrderId: order.id,
      notificationKind: "order",
    });
  }, [pushNotification, updateOrderState]);

  const clearGroomingTrackingTimer = useCallback((bookingId) => {
    const timerId = groomingTrackingTimersRef.current[bookingId];
    if (timerId) {
      window.clearTimeout(timerId);
    }
    delete groomingTrackingTimersRef.current[bookingId];
  }, []);

  const queueGroomingTrackingTimer = useCallback((bookingId, callback, delay) => {
    clearGroomingTrackingTimer(bookingId);
    const timerId = window.setTimeout(() => {
      delete groomingTrackingTimersRef.current[bookingId];
      callback();
    }, delay);
    groomingTrackingTimersRef.current[bookingId] = timerId;
    return timerId;
  }, [clearGroomingTrackingTimer]);

  const updateGroomingBookingState = useCallback((bookingId, updater) => {
    let nextBooking = null;
    const nextBookings = groomingBookingsRef.current.map((booking) => {
      if (booking.id !== bookingId) return booking;
      nextBooking = typeof updater === "function" ? updater(booking) : { ...booking, ...updater };
      return nextBooking;
    });

    groomingBookingsRef.current = nextBookings;
    setGroomingBookings(nextBookings);
    persistGroomingBookingsSnapshot(nextBookings);
    return nextBooking;
  }, [persistGroomingBookingsSnapshot, setGroomingBookings]);

  const createTrackingNotification = useCallback((booking, title, message) => {
    if (!booking) return;
    pushNotification({
      title,
      message,
      audienceRole: "user",
      audienceId: booking.userId,
      bookingId: booking.id,
      notificationKind: "grooming_tracking",
    });
  }, [pushNotification]);

  const completeGroomingDelivery = useCallback((bookingId) => {
    const booking = groomingBookingsRef.current.find((item) => item.id === bookingId);
    if (!booking || booking.tracking?.status === "delivered") return booking || null;

    const totalStages = getSafeServiceNames(booking).length + 6;
    const nextBooking = updateGroomingBookingState(bookingId, (currentBooking) => ({
      ...currentBooking,
      stage: GROOMING_STAGE_LABELS.delivered,
      tracking: {
        status: "delivered",
        currentStage: totalStages,
        currentProcess: null,
        completedStages: appendCompletedStages(currentBooking.tracking?.completedStages, [GROOMING_STAGE_LABELS.returning, GROOMING_STAGE_LABELS.delivered]),
        isActive: false,
        startedAt: Date.now(),
        travelLeg: null,
        travelStartedAt: null,
        travelDurationMs: null,
      },
    }));

    clearGroomingTrackingTimer(bookingId);
    createTrackingNotification(nextBooking, "Pet delivered back safely", `${nextBooking?.groomerName || "Your groomer"} has completed the return journey.`);
    return nextBooking;
  }, [clearGroomingTrackingTimer, createTrackingNotification, updateGroomingBookingState]);

  const startReturnJourney = useCallback((bookingId) => {
    const booking = groomingBookingsRef.current.find((item) => item.id === bookingId);
    if (!booking) return null;

    const nextBooking = updateGroomingBookingState(bookingId, (currentBooking) => ({
      ...currentBooking,
      stage: GROOMING_STAGE_LABELS.returning,
      tracking: {
        status: "returning",
        currentStage: getSafeServiceNames(currentBooking).length + 5,
        currentProcess: null,
        completedStages: appendCompletedStages(currentBooking.tracking?.completedStages, getSafeServiceNames(currentBooking)),
        isActive: true,
        startedAt: Date.now(),
        travelLeg: "to_home",
        travelStartedAt: Date.now(),
        travelDurationMs: GROOMING_DEMO_CONFIG.returnHomeMs,
      },
    }));

    createTrackingNotification(nextBooking, "Pet is on the way back", "All grooming services are complete. Your pet is on the way home.");
    queueGroomingTrackingTimer(bookingId, () => completeGroomingDelivery(bookingId), GROOMING_DEMO_CONFIG.returnHomeMs);
    return nextBooking;
  }, [completeGroomingDelivery, createTrackingNotification, queueGroomingTrackingTimer, updateGroomingBookingState]);

  const completeCurrentGroomingService = useCallback((bookingId) => {
    const booking = groomingBookingsRef.current.find((item) => item.id === bookingId);
    if (!booking || booking.status !== "accepted") return { ok: false };

    const serviceNames = getSafeServiceNames(booking);
    if (!serviceNames.length) {
      return { ok: true, booking: startReturnJourney(bookingId) };
    }

    if (booking.tracking?.status === "reached_center") {
      const firstService = serviceNames[0] || null;
      const nextBooking = updateGroomingBookingState(bookingId, (currentBooking) => ({
        ...currentBooking,
        stage: GROOMING_STAGE_LABELS.session_in_progress,
        tracking: {
          status: "session_in_progress",
          currentStage: 4,
          currentProcess: firstService,
          completedStages: appendCompletedStages(currentBooking.tracking?.completedStages, [GROOMING_STAGE_LABELS.session_in_progress]),
          isActive: true,
          startedAt: currentBooking.tracking?.startedAt || Date.now(),
          travelLeg: null,
          travelStartedAt: null,
          travelDurationMs: null,
        },
      }));

      createTrackingNotification(nextBooking, "Grooming session in progress", firstService ? `${firstService} is now active for your pet.` : "Your pet is settled at the grooming center and the grooming session is ready to begin.");
      return { ok: true, booking: nextBooking };
    }

    if (booking.tracking?.status === "session_in_progress") {
      const currentService = booking.tracking?.currentProcess || serviceNames[0] || null;
      if (!currentService) {
        return { ok: true, booking: startReturnJourney(bookingId) };
      }

      const currentIndex = Math.max(0, serviceNames.indexOf(currentService));
      const nextBooking = updateGroomingBookingState(bookingId, (currentBooking) => ({
        ...currentBooking,
        stage: currentService,
        tracking: {
          status: "grooming_processes",
          currentStage: 5 + currentIndex,
          currentProcess: currentService,
          completedStages: currentBooking.tracking?.completedStages || [],
          isActive: true,
          startedAt: Date.now(),
          travelLeg: null,
          travelStartedAt: null,
          travelDurationMs: null,
        },
      }));

      createTrackingNotification(nextBooking, `${currentService} started`, `${currentService} is now in progress for your pet.`);
      return { ok: true, booking: nextBooking };
    }

    const currentProcess = booking.tracking?.currentProcess;
    const currentIndex = Math.max(0, serviceNames.indexOf(currentProcess));
    const completedService = serviceNames[currentIndex];
    const nextIndex = currentIndex + 1;

    if (nextIndex < serviceNames.length) {
      const nextService = serviceNames[nextIndex];
      const nextBooking = updateGroomingBookingState(bookingId, (currentBooking) => ({
        ...currentBooking,
        stage: nextService,
        tracking: {
          status: "grooming_processes",
          currentStage: 5 + nextIndex,
          currentProcess: nextService,
          completedStages: appendCompletedStages(currentBooking.tracking?.completedStages, [completedService]),
          isActive: true,
          startedAt: Date.now(),
          travelLeg: null,
          travelStartedAt: null,
          travelDurationMs: null,
        },
      }));

      createTrackingNotification(nextBooking, `${completedService} completed`, `${completedService} is complete. ${nextService} has now started.`);
      return { ok: true, booking: nextBooking };
    }

    createTrackingNotification(booking, `${completedService} completed`, `${completedService} is complete. Your pet is now heading home.`);
    return { ok: true, booking: startReturnJourney(bookingId) };
  }, [createTrackingNotification, startReturnJourney, updateGroomingBookingState]);
  const createUserSession = useCallback((entity, role) => ({
    id: entity.id,
    role,
    name: entity.name,
    email: entity.email,
    subscription: entity.subscription || "basic",
  }), []);

  const login = useCallback(({ role, email, password }) => {
    const pool = role === "doctor" ? doctors : role === "groomer" ? groomers : users;
    const match = pool.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);

    if (!match) {
      return { ok: false, error: "Invalid credentials. Please try again." };
    }

    setSession(createUserSession(match, role));
    return { ok: true, user: match };
  }, [createUserSession, doctors, groomers, users, setSession]);

  const registerAccount = useCallback(({ role, form }) => {
    if (role === "user") {
      const nextUser = {
        id: `user_${Date.now()}`,
        type: "user",
        name: form.name,
        email: form.email,
        password: form.password,
        petType: normalizePetType(form.petType),
        location: form.location || locationOptions[0],
        subscription: form.subscription || "basic",
      };
      setUsers((prev) => [nextUser, ...prev]);
      setSession(createUserSession(nextUser, "user"));
      pushNotification({
        title: form.subscription === "premium" ? "Premium activated" : "Account created",
        message: form.subscription === "premium"
          ? "Your premium membership is active. Delivery waivers and member pricing are now unlocked."
          : "Your Animal Park account is ready.",
        audienceRole: "user",
        audienceId: nextUser.id,
      });
      return { ok: true, user: nextUser };
    }

    if (role === "doctor") {
      const nextDoctor = {
        id: `doctor_${Date.now()}`,
        type: "doctor",
        name: form.name,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
        clinic: form.clinic,
        experience: Number(form.experience || 1),
        certifications: form.certifications || "Registered veterinarian",
        location: form.location || locationOptions[0],
      };
      setDoctors((prev) => [nextDoctor, ...prev]);
      setSession(createUserSession(nextDoctor, "doctor"));
      return { ok: true, user: nextDoctor };
    }

    const nextGroomer = {
      id: `groomer_${Date.now()}`,
      type: "groomer",
      name: form.name,
      email: form.email,
      password: form.password,
      studio: form.studio,
      experience: Number(form.experience || 1),
      specialty: form.specialty,
      pickupVehicle: form.pickupVehicle || "Bike",
      location: form.location || locationOptions[0],
    };
    setGroomers((prev) => [nextGroomer, ...prev]);
    setSession(createUserSession(nextGroomer, "groomer"));
    return { ok: true, user: nextGroomer };
  }, [createUserSession, pushNotification, setDoctors, setGroomers, setSession, setUsers]);

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);


  const resetDemoData = useCallback(() => {
    Object.keys(groomingTrackingTimersRef.current).forEach((bookingId) => {
      clearGroomingTrackingTimer(bookingId);
    });
    groomingTrackingTimersRef.current = {};
    groomingBookingsRef.current = [];

    setSession(null);
    setUsers(demoUsers);
    setDoctors(demoDoctors);
    setGroomers(demoGroomers);
    setBookings([]);
    setGroomingBookings([]);
    setCart([]);
    setOrders([]);
    setNotifications([]);
    setMessages({});
    setGroomingMessages({});
    setCheckoutDraft(null);
    setReceipts([]);

    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      });
    }
  }, [clearGroomingTrackingTimer, setBookings, setCart, setCheckoutDraft, setDoctors, setGroomers, setGroomingBookings, setGroomingMessages, setMessages, setNotifications, setOrders, setReceipts, setSession, setUsers]);

  const addToCart = useCallback((product) => {
    if (!session || session.role !== "user") {
      return { ok: false, error: "Please log in as a user to add products to cart.", redirectTo: "/login" };
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });

    return { ok: true };
  }, [session, setCart]);

  const updateCartQuantity = useCallback((productId, nextQty) => {
    setCart((prev) => {
      if (nextQty <= 0) return prev.filter((item) => item.id !== productId);
      return prev.map((item) => (item.id === productId ? { ...item, qty: nextQty } : item));
    });
  }, [setCart]);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, [setCart]);

  const clearCart = useCallback(() => setCart([]), [setCart]);

  const startCheckout = useCallback((draft) => {
    setCheckoutDraft({
      id: `checkout_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...draft,
    });
  }, [setCheckoutDraft]);

  const clearCheckoutDraft = useCallback(() => setCheckoutDraft(null), [setCheckoutDraft]);

  const completeCheckout = useCallback((paymentMeta = {}) => {
    if (!checkoutDraft) {
      return { ok: false, error: "Checkout session expired.", redirectTo: "/dashboard" };
    }

    const paymentMethod = paymentMeta.method || "Card";

    if (checkoutDraft.kind === "premium_signup") {
      const signupData = checkoutDraft.signupData;
      if (!signupData) {
        return { ok: false, error: "Missing premium signup details.", redirectTo: "/login" };
      }

      const registration = registerAccount({
        role: "user",
        form: {
          ...signupData,
          subscription: "premium",
        },
      });

      if (!registration.ok) {
        return { ok: false, error: "Could not activate premium signup.", redirectTo: "/login" };
      }

      const createdUser = registration.user;
      const receipt = createReceiptRecord({
        kind: "premium_signup",
        userId: createdUser.id,
        title: PREMIUM_PLAN.title,
        relatedId: createdUser.id,
        paymentMethod,
        subtotal: PREMIUM_PLAN.subtotal,
        gstAmount: PREMIUM_PLAN.gstAmount,
        deliveryFee: PREMIUM_PLAN.deliveryFee,
        amount: PREMIUM_PLAN.total,
        lineItems: PREMIUM_PLAN.benefits.map((benefit) => ({
          label: benefit,
          amount: null,
          meta: "Included with membership",
        })),
      });

      setReceipts((prev) => [receipt, ...prev]);
      clearCheckoutDraft();
      return { ok: true, redirectTo: "/dashboard" };
    }

    if (!session || session.role !== "user") {
      return { ok: false, error: "Please log in as a user to complete payment.", redirectTo: "/login" };
    }

    if (checkoutDraft.kind === "premium_upgrade") {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === session.id
            ? { ...user, subscription: "premium" }
            : user
        )
      );

      setSession((prev) => (prev ? { ...prev, subscription: "premium" } : prev));

      const receipt = createReceiptRecord({
        kind: "premium_upgrade",
        userId: session.id,
        title: PREMIUM_PLAN.title,
        relatedId: session.id,
        paymentMethod,
        subtotal: checkoutDraft.subtotal,
        gstAmount: checkoutDraft.gstAmount,
        deliveryFee: checkoutDraft.deliveryFee || 0,
        amount: checkoutDraft.total,
        lineItems: (checkoutDraft.benefits || PREMIUM_PLAN.benefits).map((benefit) => ({
          label: benefit,
          amount: null,
          meta: "Premium membership benefit",
        })),
      });

      setReceipts((prev) => [receipt, ...prev]);
      pushNotification({
        title: "Premium activated",
        message: "Your premium membership is now active. Enjoy waived delivery and priority pricing.",
        audienceRole: "user",
        audienceId: session.id,
      });
      clearCheckoutDraft();
      return { ok: true, redirectTo: "/dashboard" };
    }

    if (checkoutDraft.kind === "order") {
      const orderId = `ord_${Date.now()}`;
      const orderStartedAt = Date.now();
      const orderItems = Array.isArray(checkoutDraft.items) ? checkoutDraft.items : [];
      const nextOrder = {
        id: orderId,
        userId: session.id,
        items: orderItems,
        subtotal: checkoutDraft.subtotal,
        gstAmount: checkoutDraft.gstAmount,
        deliveryFee: checkoutDraft.deliveryFee,
        total: checkoutDraft.total ?? checkoutDraft.amount ?? 0,
        status: ORDER_TRACKING_STEPS[0],
        createdAt: new Date(orderStartedAt).toISOString(),
        tracking: {
          status: "placed",
          currentStage: 1,
          currentTrackingStep: ORDER_TRACKING_STEPS[0],
          isActive: true,
          startedAt: orderStartedAt,
          stageStartedAt: orderStartedAt,
          travelStartedAt: null,
          travelDurationMs: null,
          routeMode: "idle",
          routeProgress: 0,
          estimatedArrivalSeconds: Math.ceil(ORDER_DEMO_CONFIG.confirmDelayMs / 1000),
          notifiedTrackingEvents: [],
        },
      };

      const nextOrders = [nextOrder, ...ordersRef.current];
      ordersRef.current = nextOrders;
      setOrders(nextOrders);
      persistOrdersSnapshot(nextOrders);
      const receipt = createReceiptRecord({
        kind: "order",
        userId: session.id,
        title: `Product order ${orderId}`,
        relatedId: orderId,
        paymentMethod,
        subtotal: checkoutDraft.subtotal,
        gstAmount: checkoutDraft.gstAmount,
        deliveryFee: checkoutDraft.deliveryFee,
        amount: checkoutDraft.total ?? checkoutDraft.amount ?? 0,
        lineItems: orderItems.map((item) => ({
          label: item.name,
          quantity: item.qty,
          amount: item.price * item.qty,
        })),
      });

      setReceipts((prev) => [receipt, ...prev]);
      clearCart();
      createOrderTrackingNotification(nextOrder, ORDER_TRACKING_STEPS[0], "Your order has been placed successfully.", "placed");
      queueOrderTrackingTimer(orderId, () => advanceOrderStatus(orderId), ORDER_DEMO_CONFIG.confirmDelayMs);
      clearCheckoutDraft();
      return { ok: true, redirectTo: "/dashboard" };
    }

    if (checkoutDraft.kind === "vet") {
      const bookingId = `vet_${Date.now()}`;
      const nextBooking = {
        id: bookingId,
        userId: session.id,
        doctorId: checkoutDraft.doctorId,
        doctorName: checkoutDraft.doctorName,
        clinic: checkoutDraft.clinic,
        serviceName: checkoutDraft.serviceName,
        fee: checkoutDraft.total,
        status: "paid-requested",
        createdAt: new Date().toISOString(),
      };

      setBookings((prev) => [nextBooking, ...prev]);

      const receipt = createReceiptRecord({
        kind: "vet",
        userId: session.id,
        title: `Vet consultation ${bookingId}`,
        relatedId: bookingId,
        paymentMethod,
        subtotal: checkoutDraft.subtotal,
        gstAmount: checkoutDraft.gstAmount || 0,
        deliveryFee: checkoutDraft.deliveryFee || 0,
        amount: checkoutDraft.total,
        lineItems: [
          {
            label: checkoutDraft.serviceName,
            amount: checkoutDraft.total,
            meta: checkoutDraft.doctorName,
          },
        ],
      });

      setReceipts((prev) => [receipt, ...prev]);
      pushNotification({
        title: "Consultation requested",
        message: `${checkoutDraft.doctorName} received your paid request for ${checkoutDraft.serviceName}.`,
        audienceRole: "user",
        audienceId: session.id,
        dismissible: false,
      });
      pushNotification({
        title: "New consultation request",
        message: `${session.name} paid for ${checkoutDraft.serviceName}. Please review the request.`,
        audienceRole: "doctor",
        audienceId: checkoutDraft.doctorId,
      });
      clearCheckoutDraft();
      return { ok: true, redirectTo: "/dashboard" };
    }

    if (checkoutDraft.kind === "grooming") {
      const groomingId = `groom_${Date.now()}`;
      const safeServices = Array.isArray(checkoutDraft.services) ? checkoutDraft.services.filter(Boolean) : [];
      const safeServiceNames = Array.isArray(checkoutDraft.serviceNames) && checkoutDraft.serviceNames.length
        ? checkoutDraft.serviceNames.filter(Boolean)
        : safeServices.map((service) => service?.name).filter(Boolean);
      const nextBooking = {
        id: groomingId,
        userId: session.id,
        groomerId: checkoutDraft.groomerId,
        groomerName: checkoutDraft.groomerName,
        petType: checkoutDraft.petType,
        timeSlot: checkoutDraft.timeSlot,
        status: "pending",
        stage: "Awaiting acceptance",
        services: safeServices,
        serviceNames: safeServiceNames,
        total: checkoutDraft.total,
        createdAt: new Date().toISOString(),
        tracking: {
          status: "pending",
          currentStage: 0,
          currentProcess: null,
          completedStages: [],
          isActive: false,
          startedAt: null,
          travelLeg: null,
          travelStartedAt: null,
          travelDurationMs: null,
        },
      };

      setGroomingBookings((prev) => [nextBooking, ...prev]);

      const receipt = createReceiptRecord({
        kind: "grooming",
        userId: session.id,
        title: `Grooming booking ${groomingId}`,
        relatedId: groomingId,
        paymentMethod,
        subtotal: checkoutDraft.subtotal,
        gstAmount: checkoutDraft.gstAmount || 0,
        deliveryFee: checkoutDraft.deliveryFee || 0,
        amount: checkoutDraft.total,
        lineItems: safeServiceNames.map((serviceName, index) => ({
          label: serviceName,
          amount: safeServices[index]?.price || null,
          meta: checkoutDraft.groomerName,
        })),
      });

      setReceipts((prev) => [receipt, ...prev]);
      pushNotification({
        title: "Grooming request sent",
        message: `${checkoutDraft.groomerName} received your request for ${checkoutDraft.timeSlot}. The slot will lock after groomer acceptance.`,
        audienceRole: "user",
        audienceId: session.id,
        dismissible: false,
      });
      pushNotification({
        title: "New grooming request",
        message: `${session.name} booked ${(safeServiceNames.length ? safeServiceNames.join(", ") : "a grooming service")} for ${checkoutDraft.timeSlot}.`,
        audienceRole: "groomer",
        audienceId: checkoutDraft.groomerId,
      });
      clearCheckoutDraft();
      return { ok: true, redirectTo: "/dashboard" };
    }

    return { ok: false, error: "Unsupported checkout type.", redirectTo: "/dashboard" };
  }, [
    checkoutDraft,
    clearCart,
    clearCheckoutDraft,
    pushNotification,
    registerAccount,
    session,
    setBookings,
    setGroomingBookings,
    setOrders,
    setReceipts,
    setSession,
    setUsers,
  ]);

  const approveBooking = useCallback((bookingId) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking || booking.status === "accepted") return { ok: false };

    setBookings((prev) =>
      prev.map((item) => (item.id === bookingId ? { ...item, status: "accepted" } : item))
    );

    pushNotification({
      title: "Consultation confirmed",
      message: `${booking.doctorName} confirmed your appointment for ${booking.serviceName}.`,
      audienceRole: "user",
      audienceId: booking.userId,
      linkedBookingId: booking.id,
      notificationKind: "vet",
    });

    return { ok: true, bookingId };
  }, [bookings, pushNotification, setBookings]);

  const approveGrooming = useCallback((groomingId) => {
    const booking = groomingBookingsRef.current.find((item) => item.id === groomingId);
    if (!booking) return { ok: false };
    if (booking.status === "accepted" && booking.tracking?.isActive) {
      return { ok: true, booking };
    }

    const startedAt = Date.now();
    const nextBooking = updateGroomingBookingState(groomingId, (currentBooking) => ({
      ...currentBooking,
      status: "accepted",
      stage: GROOMING_STAGE_LABELS.accepted,
      acceptedAt: startedAt,
      tracking: {
        status: "accepted",
        currentStage: 1,
        currentProcess: null,
        completedStages: [GROOMING_STAGE_LABELS.accepted],
        isActive: true,
        startedAt,
        travelLeg: "to_pickup",
        travelStartedAt: startedAt,
        travelDurationMs: GROOMING_DEMO_CONFIG.toPickupMs,
      },
    }));

    createTrackingNotification(nextBooking, "Grooming request accepted", `${nextBooking?.groomerName || "Your groomer"} accepted your slot and is now on the way.`);
    queueGroomingTrackingTimer(groomingId, () => advanceGroomingStage(groomingId), GROOMING_DEMO_CONFIG.toPickupMs);
    return { ok: true, booking: nextBooking };
  }, [createTrackingNotification, queueGroomingTrackingTimer, updateGroomingBookingState]);

  const completeOrderDelivery = useCallback((orderId) => {
    const nextOrder = updateOrderState(orderId, (currentOrder) => ({
      ...currentOrder,
      status: ORDER_TRACKING_STEPS[4],
      tracking: {
        ...buildOrderTrackingState(currentOrder),
        status: "delivered",
        currentStage: 5,
        currentTrackingStep: ORDER_TRACKING_STEPS[4],
        isActive: false,
        stageStartedAt: Date.now(),
        travelStartedAt: null,
        travelDurationMs: null,
        routeMode: "complete",
        routeProgress: 1,
        estimatedArrivalSeconds: 0,
      },
    }));

    clearOrderTrackingTimer(orderId);
    createOrderTrackingNotification(nextOrder, ORDER_TRACKING_STEPS[4], "Your order was delivered successfully.", "delivered");
    return { ok: true, order: nextOrder };
  }, [clearOrderTrackingTimer, createOrderTrackingNotification, updateOrderState]);

  const advanceOrderStatus = useCallback((orderId) => {
    const order = ordersRef.current.find((item) => item.id === orderId);
    if (!order) return { ok: false };

    const tracking = buildOrderTrackingState(order);

    if (tracking.status === "placed") {
      const nextOrder = updateOrderState(orderId, (currentOrder) => ({
        ...currentOrder,
        status: ORDER_TRACKING_STEPS[1],
        tracking: {
          ...buildOrderTrackingState(currentOrder),
          status: "confirmed",
          currentStage: 2,
          currentTrackingStep: ORDER_TRACKING_STEPS[1],
          isActive: true,
          stageStartedAt: Date.now(),
          travelStartedAt: null,
          travelDurationMs: null,
          routeMode: "idle",
          routeProgress: 0,
          estimatedArrivalSeconds: Math.ceil(ORDER_DEMO_CONFIG.dispatchDelayMs / 1000),
        },
      }));

      createOrderTrackingNotification(nextOrder, ORDER_TRACKING_STEPS[1], "Your order has been confirmed.", "confirmed");
      queueOrderTrackingTimer(orderId, () => advanceOrderStatus(orderId), ORDER_DEMO_CONFIG.dispatchDelayMs);
      return { ok: true, order: nextOrder };
    }

    if (tracking.status === "confirmed") {
      const nextOrder = updateOrderState(orderId, (currentOrder) => ({
        ...currentOrder,
        status: ORDER_TRACKING_STEPS[2],
        tracking: {
          ...buildOrderTrackingState(currentOrder),
          status: "dispatched",
          currentStage: 3,
          currentTrackingStep: ORDER_TRACKING_STEPS[2],
          isActive: true,
          stageStartedAt: Date.now(),
          travelStartedAt: null,
          travelDurationMs: null,
          routeMode: "idle",
          routeProgress: 0,
          estimatedArrivalSeconds: Math.ceil(ORDER_DEMO_CONFIG.outForDeliveryDelayMs / 1000),
        },
      }));

      createOrderTrackingNotification(nextOrder, ORDER_TRACKING_STEPS[2], "Your order has been dispatched from the store.", "dispatched");
      queueOrderTrackingTimer(orderId, () => advanceOrderStatus(orderId), ORDER_DEMO_CONFIG.outForDeliveryDelayMs);
      return { ok: true, order: nextOrder };
    }

    if (tracking.status === "dispatched") {
      const startedAt = Date.now();
      const nextOrder = updateOrderState(orderId, (currentOrder) => ({
        ...currentOrder,
        status: ORDER_TRACKING_STEPS[3],
        tracking: {
          ...buildOrderTrackingState(currentOrder),
          status: "out_for_delivery",
          currentStage: 4,
          currentTrackingStep: ORDER_TRACKING_STEPS[3],
          isActive: true,
          stageStartedAt: startedAt,
          travelStartedAt: startedAt,
          travelDurationMs: ORDER_DEMO_CONFIG.deliveryTravelMs,
          routeMode: "to_destination",
          routeProgress: 0,
          estimatedArrivalSeconds: Math.ceil(ORDER_DEMO_CONFIG.deliveryTravelMs / 1000),
        },
      }));

      createOrderTrackingNotification(nextOrder, ORDER_TRACKING_STEPS[3], "Your delivery partner is now on the way.", "out_for_delivery");
      queueOrderTrackingTimer(orderId, () => completeOrderDelivery(orderId), ORDER_DEMO_CONFIG.deliveryTravelMs);
      return { ok: true, order: nextOrder };
    }

    if (tracking.status === "out_for_delivery") {
      return completeOrderDelivery(orderId);
    }

    return { ok: true, order };
  }, [completeOrderDelivery, createOrderTrackingNotification, queueOrderTrackingTimer, updateOrderState]);

  const advanceGroomingStage = useCallback((groomingId) => {
    const booking = groomingBookingsRef.current.find((item) => item.id === groomingId);
    if (!booking || booking.status !== "accepted") return { ok: false };

    const trackingStatus = booking.tracking?.status || "accepted";

    if (trackingStatus === "accepted") {
      const nextBooking = updateGroomingBookingState(groomingId, (currentBooking) => ({
        ...currentBooking,
        stage: GROOMING_STAGE_LABELS.picked_up,
        tracking: {
          status: "picked_up",
          currentStage: 2,
          currentProcess: null,
          completedStages: appendCompletedStages(currentBooking.tracking?.completedStages, [GROOMING_STAGE_LABELS.accepted, GROOMING_STAGE_LABELS.picked_up]),
          isActive: true,
          startedAt: Date.now(),
          travelLeg: "to_center",
          travelStartedAt: Date.now(),
          travelDurationMs: GROOMING_DEMO_CONFIG.toStudioMs,
        },
      }));

      createTrackingNotification(nextBooking, "Pet picked up", "Your pet has been picked up and is heading to the grooming center.");
      queueGroomingTrackingTimer(groomingId, () => advanceGroomingStage(groomingId), GROOMING_DEMO_CONFIG.toStudioMs);
      return { ok: true, booking: nextBooking };
    }

    if (trackingStatus === "picked_up") {
      const nextBooking = updateGroomingBookingState(groomingId, (currentBooking) => ({
        ...currentBooking,
        stage: GROOMING_STAGE_LABELS.reached_center,
        tracking: {
          status: "reached_center",
          currentStage: 3,
          currentProcess: null,
          completedStages: appendCompletedStages(currentBooking.tracking?.completedStages, [GROOMING_STAGE_LABELS.reached_center]),
          isActive: true,
          startedAt: Date.now(),
          travelLeg: null,
          travelStartedAt: null,
          travelDurationMs: null,
        },
      }));

      createTrackingNotification(nextBooking, "Pet reached grooming center", `${nextBooking?.groomerName || "Your groomer"} has reached the grooming center.`);
      clearGroomingTrackingTimer(groomingId);
      return { ok: true, booking: nextBooking };
    }

    if (trackingStatus === "reached_center" || trackingStatus === "session_in_progress" || trackingStatus === "grooming_processes") {
      return completeCurrentGroomingService(groomingId);
    }

    if (trackingStatus === "returning") {
      return { ok: true, booking: completeGroomingDelivery(groomingId) };
    }

    return { ok: true, booking };
  }, [clearGroomingTrackingTimer, completeCurrentGroomingService, completeGroomingDelivery, createTrackingNotification, queueGroomingTrackingTimer, updateGroomingBookingState]);

  const sendMessage = useCallback(({ bookingId, text, toUserId }) => {
    if (!session || !text.trim()) return { ok: false };
    const senderName = session.name;
    pushMessage(bookingId, {
      senderId: session.id,
      senderName,
      text: text.trim(),
      toUserId,
    });
    return { ok: true };
  }, [pushMessage, session]);

  const sendGroomingMessage = useCallback(({ bookingId, text, toUserId }) => {
    if (!session || !text.trim()) return { ok: false };
    const trimmedText = text.trim();
    pushGroomingMessage(bookingId, {
      senderId: session.id,
      senderName: session.name,
      text: trimmedText,
      toUserId,
    });
    pushNotification({
      title: "Grooming message",
      message: `${session.name} sent a grooming update.`,
      description: trimmedText,
      audienceId: toUserId,
      audienceRole: session.role === "groomer" ? "user" : "groomer",
      bookingId,
      notificationKind: "grooming_message",
      dismissible: false,
    });
    return { ok: true };
  }, [pushGroomingMessage, pushNotification, session]);

  const upgradeToPremium = useCallback(() => {
    if (!session || session.role !== "user") return { ok: false, redirectTo: "/login" };
    startCheckout({
      kind: "premium_upgrade",
      title: PREMIUM_PLAN.title,
      subtitle: PREMIUM_PLAN.subtitle,
      subtotal: PREMIUM_PLAN.subtotal,
      gstAmount: PREMIUM_PLAN.gstAmount,
      deliveryFee: PREMIUM_PLAN.deliveryFee,
      total: PREMIUM_PLAN.total,
      benefits: PREMIUM_PLAN.benefits,
    });
    return { ok: true, redirectTo: "/payment" };
  }, [session, startCheckout]);

  const dismissNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  }, [setNotifications]);

  useEffect(() => {
    if (!isHydrated) return;

    orders.forEach((order) => {
      const tracking = buildOrderTrackingState(order);

      if (!tracking.isActive) {
        clearOrderTrackingTimer(order.id);
        return;
      }

      if (orderTrackingTimersRef.current[order.id]) return;

      const remainingMs = getRemainingOrderStageMs(tracking);
      const nextStep = tracking.status === "out_for_delivery"
        ? () => completeOrderDelivery(order.id)
        : () => advanceOrderStatus(order.id);

      if (remainingMs !== null && remainingMs <= 0) {
        nextStep();
        return;
      }

      queueOrderTrackingTimer(order.id, nextStep, remainingMs ?? getOrderStageDuration(tracking.status) ?? 0);
    });
  }, [advanceOrderStatus, clearOrderTrackingTimer, completeOrderDelivery, isHydrated, orders, queueOrderTrackingTimer]);

  useEffect(() => {
    if (!isHydrated) return;

    groomingBookings.forEach((booking) => {
      const tracking = normalizeGroomingTracking(booking);

      if (booking.status !== "accepted" || !tracking.isActive) {
        clearGroomingTrackingTimer(booking.id);
        return;
      }

      if (groomingTrackingTimersRef.current[booking.id]) return;

      if (GROOMING_TRAVEL_STATUSES.includes(tracking.status)) {
        const nextStep = tracking.status === "returning"
          ? () => completeGroomingDelivery(booking.id)
          : () => advanceGroomingStage(booking.id);
        const remainingMs = getRemainingGroomingTravelMs(tracking);

        if (remainingMs !== null && remainingMs <= 0) {
          nextStep();
          return;
        }

        queueGroomingTrackingTimer(
          booking.id,
          nextStep,
          remainingMs ?? getGroomingTravelDuration(tracking.status) ?? 0
        );
      }
    });
  }, [advanceGroomingStage, clearGroomingTrackingTimer, completeGroomingDelivery, groomingBookings, isHydrated, queueGroomingTrackingTimer]);

  useEffect(() => () => {
    Object.keys(orderTrackingTimersRef.current).forEach((orderId) => {
      clearOrderTrackingTimer(orderId);
    });
    Object.keys(groomingTrackingTimersRef.current).forEach((bookingId) => {
      clearGroomingTrackingTimer(bookingId);
    });
  }, [clearGroomingTrackingTimer, clearOrderTrackingTimer]);

  const value = useMemo(() => ({
    isHydrated,
    session,
    currentUser,
    users,
    doctors,
    groomers,
    products: catalogProducts,
    clinicServices,
    bookings,
    groomingBookings,
    cart,
    orders,
    notifications,
    messages,
    groomingMessages,
    checkoutDraft,
    receipts, premiumPlan: PREMIUM_PLAN, groomingServices: catalogGroomingServices, groomingTimeSlots: catalogGroomingTimeSlots,
    groomingServices: catalogGroomingServices,
    groomingTimeSlots: catalogGroomingTimeSlots,
    login,
    registerAccount,
    logout,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    startCheckout,
    clearCheckoutDraft,
    completeCheckout,
    approveBooking,
    approveGrooming,
    advanceOrderStatus,
    advanceGroomingStage,
    sendMessage,
    sendGroomingMessage,
    upgradeToPremium,
    dismissNotification,
    resetDemoData,
  }), [
    isHydrated,
    session,
    currentUser,
    users,
    doctors,
    groomers,
    bookings,
    groomingBookings,
    cart,
    orders,
    notifications,
    messages,
    groomingMessages,
    checkoutDraft,
    receipts,
    login,
    registerAccount,
    logout,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    startCheckout,
    clearCheckoutDraft,
    completeCheckout,
    approveBooking,
    approveGrooming,
    advanceOrderStatus,
    advanceGroomingStage,
    sendMessage,
    sendGroomingMessage,
    upgradeToPremium,
    dismissNotification,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
}


































