const fs = require('fs');
const path = 'C:/Users/Rohit/Desktop/engineering/WP project/Animal Park/animal-park-app/pages/dashboard.js';
let raw = fs.readFileSync(path, 'utf8');

function replaceSimple(oldStr, newStr, label) {
  if (!raw.includes(oldStr)) throw new Error(`Missing block: ${label}`);
  raw = raw.replace(oldStr, newStr);
}

function replaceBetween(startMarker, endMarker, replacement, label) {
  const start = raw.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing start marker: ${label}`);
  const end = raw.indexOf(endMarker, start);
  if (end === -1) throw new Error(`Missing end marker: ${label}`);
  raw = raw.slice(0, start) + replacement + '\n' + raw.slice(end);
}

replaceSimple(
  '  const getGroomingTrackingStatus = (booking) => booking?.tracking?.status || (booking?.status === "accepted" ? "accepted" : booking?.status || "pending");\n',
  `  const createMapBounds = (points, paddingFactor = 0.28) => {
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
    return https://www.openstreetmap.org/export/embed.html?bbox={bbox}&layer=mapnik;
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
`.replace(/\u007f/g,'`'),
  'insert map helpers'
);

replaceBetween(
  '  const getOrderMapMeta = () => ({',
  '  const allUserOrders = orders',
  `  const getOrderMapMeta = () => ({
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
    routeText: "JP Nagar Store to Customer Home",
    hubPoint: { lat: 12.9077, lng: 77.5850 },
    destinationPoint: { lat: 12.9719, lng: 77.6412 },
  });

  const getOrderMapState = (order, mapMeta = getOrderMapMeta()) => {
    const bounds = createMapBounds([mapMeta.hubPoint, mapMeta.destinationPoint], 0.35);
    const currentPoint = order.status === "out_for_delivery"
      ? interpolatePoint(mapMeta.hubPoint, mapMeta.destinationPoint, order.routeProgress || 0)
      : order.status === "delivered"
        ? mapMeta.destinationPoint
        : mapMeta.hubPoint;

    return {
      embedUrl: buildOpenStreetMapEmbedUrl(bounds),
      hubPosition: pointToPercent(mapMeta.hubPoint, bounds),
      destinationPosition: pointToPercent(mapMeta.destinationPoint, bounds),
      currentPosition: pointToPercent(currentPoint, bounds),
    };
  };
`,
  'order map section'
);

replaceBetween(
  '  const getGroomingMapMeta = (location, groomerName) => {',
  '  function getOrderPricing(order) {',
  `  const getGroomingMapMeta = (location, groomerName) => {
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
        routeText: T Nagar pickup to ${groomerName},
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
      routeText: JP Nagar pickup to ${groomerName},
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
`.replace(/\u007f/g,'`'),
  'grooming map section'
);

replaceSimple(
`        {activeOrder && (() => {
          const routeProgress = activeOrder.routeProgress;
          const pulse = 1 + Math.sin(clock / 450) * 0.08;


          return (
`,
`        {activeOrder && (() => {
          const activeOrderMapState = getOrderMapState(activeOrder, activeOrder.mapMeta);

          return (
`,
'active order vars'
);

replaceSimple(
'  const enhancedNotifications = (() => {\n',
`  const activeGroomingMapState = activeGroomingBooking && activeMapMeta ? getGroomingMapState(activeGroomingBooking, activeMapMeta, groomingMarkerProgress) : null;

  const renderRealRouteMap = ({
    className,
    embedUrl,
    sourcePosition,
    destinationPosition,
    currentPosition,
    sourceBadge,
    sourceLabel,
    destinationBadge,
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
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.22))]" />
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
          <line x1={sourcePosition.left} y1={sourcePosition.top} x2={destinationPosition.left} y2={destinationPosition.top} stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" opacity="0.82" />
          <line x1={sourcePosition.left} y1={sourcePosition.top} x2={destinationPosition.left} y2={destinationPosition.top} stroke="#2d6de6" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="6 5" opacity="0.92" />
        </svg>
        <div className="absolute flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#d64747] text-[10px] font-bold text-white shadow-lg" style={{ left: `${sourcePosition.left}%`, top: `${sourcePosition.top}%`, transform: "translate(-50%, -50%)" }}>{sourceBadge}</div>
        <div className="absolute rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow" style={{ left: `${Math.max(4, sourcePosition.left - 6)}%`, top: `${Math.max(3, sourcePosition.top - 9)}%` }}>{sourceLabel}</div>
        <div className="absolute flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#1c4a2e] text-[10px] font-bold text-white shadow-lg" style={{ left: `${destinationPosition.left}%`, top: `${destinationPosition.top}%`, transform: "translate(-50%, -50%)" }}>{destinationBadge}</div>
        <div className="absolute rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow" style={{ left: `${Math.max(4, destinationPosition.left - 7)}%`, top: `${Math.max(3, destinationPosition.top - 9)}%` }}>{destinationLabel}</div>
        <div className="absolute rounded-full bg-[#2b6ef2]/20" style={{ left: `${currentPosition.left}%`, top: `${currentPosition.top}%`, width: 34, height: 34, transform: `translate(-50%, -50%) scale(${pulseScale})`, transition: "transform 0.2s linear" }} />
        <div className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-xl transition-all duration-700" style={{ left: `${currentPosition.left}%`, top: `${currentPosition.top}%`, transform: "translate(-50%, -50%)" }}>
          <div className="relative h-5 w-7">
            <div className="absolute left-0 top-1 h-3 w-5 rounded-[4px] bg-[#ff5a36]" />
            <div className="absolute right-0 top-0 h-4 w-3 rounded-[3px] bg-[#ff7d59]" />
            <div className="absolute bottom-0 left-1 h-2 w-2 rounded-full bg-[#1f2937]" />
            <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#1f2937]" />
          </div>
        </div>
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
          Route: {routeText}
        </div>
        <div className="absolute bottom-4 left-4 rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
          {footerText}
        </div>
      </div>
    );
  };

  const enhancedNotifications = (() => {
`,
'insert render helper'
);

replaceBetween(
'                        <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#d9d5ce]">',
'                      <div className="grid gap-4 rounded-[1.5rem] border border-[#e8dfc1] bg-[linear-gradient(135deg,#fffdf8_0%,#fff7df_48%,#fffef9_100%)] p-5 shadow-[0_20px_40px_rgba(180,140,30,0.12)] sm:grid-cols-[1.15fr_0.85fr]">',
`                        {renderRealRouteMap({
                          className: "relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#d9d5ce]",
                          embedUrl: activeOrderMapState?.embedUrl,
                          sourcePosition: activeOrderMapState?.hubPosition,
                          destinationPosition: activeOrderMapState?.destinationPosition,
                          currentPosition: activeOrderMapState?.currentPosition,
                          sourceBadge: "SHOP",
                          sourceLabel: activeOrder.mapMeta.hub,
                          destinationBadge: "HOME",
                          destinationLabel: activeOrder.mapMeta.destination,
                          routeText: activeOrder.mapMeta.routeText,
                          footerText: Live route - Updated ${new Date(clock).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},
                        })}`.replace(/\u007f/g,'`'),
'active order map block'
);

replaceBetween(
`                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative h-[360px] overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[#d9d7d0] shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] sm:h-[430px]"
                            >`,
'                          <div className="mt-4 grid gap-3 sm:grid-cols-3">',
`                            <motion.div
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
                            </motion.div>`,
'grooming active map block'
);

fs.writeFileSync(path, raw);
console.log('PATCHED');
