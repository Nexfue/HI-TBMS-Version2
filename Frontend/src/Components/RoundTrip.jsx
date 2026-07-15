import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectFlights , selectTravelDetails } from "../Store/slices/travelSlice";





const SORTS = [
  { key: "popular", label: "Popular" },
  { key: "nonstop", label: "Non stop first" },
  { key: "cheapest", label: "Cheapest" },
];

const currency = (n) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

function stopsLabel(leg) {
  if (leg.stops === 0) return "Non stop";
  const via = leg.via?.length ? ` • ${leg.via.join(",")}` : "";
  return `${leg.stops} stop${leg.stops > 1 ? "s" : ""}${via}`;
}

function durationMinutes(flight) {
  return (
    (flight.onward?.duration || 0) +
    (flight.return?.duration || 0)
  );
}

function durationLabel(flight) {
  const mins = durationMinutes(flight);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function sortFlights(flights, key) {
  const copy = [...flights];
  switch (key) {
    case "cheapest":
      return copy.sort((a, b) => a.price - b.price);
    case "nonstop":
      return copy.sort((a, b) => {
        const stopsA = a.onward.stops + a.return.stops;
        const stopsB = b.onward.stops + b.return.stops;
        if (stopsA !== stopsB) return stopsA - stopsB;
        return durationMinutes(a) - durationMinutes(b);
      });
    case "popular":
    default:
      return copy;
  }
}



function AirlineLogo({ airline, logo }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={airline}
        className="h-8 w-8 rounded-md object-contain bg-white ring-1 ring-slate-200"
      />
    );
  }
  const initials = airline
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-8 w-8 rounded-md bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center">
      {initials}
    </div>
  );
}

function FlightLegRow({ label, leg }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-14 shrink-0 text-xs font-medium text-slate-400">
        {label}
      </div>
      <AirlineLogo airline={leg.airline} logo={leg.logo} />
      <div className="w-36 shrink-0">
        <div className="text-sm font-semibold text-slate-800">
          {leg.airline}
        </div>
        <div className="text-xs text-slate-400">{leg.flightNumber}</div>
      </div>

      <div className="flex flex-1 items-center gap-3">
        <div className="text-right">
          <div className="text-base font-bold text-slate-900 tabular-nums">
            {leg.departTime}
          </div>
          <div className="text-xs text-slate-400">{leg.departCode}</div>
        </div>

        <div className="flex-1 flex flex-col items-center px-2">
          <span className="text-[11px] text-slate-400">{leg.duration}</span>
          <div className="w-full h-px bg-slate-200 relative my-1">
            <span className="absolute -right-0.5 -top-[3px] h-[7px] w-[7px] rounded-full bg-slate-300" />
          </div>
          <span
            className={`text-[11px] font-medium ${
              leg.stops === 0 ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {stopsLabel(leg)}
          </span>
        </div>

        <div>
          <div className="text-base font-bold text-slate-900 tabular-nums">
            {leg.arriveTime}
            {leg.nextDay && (
              <sup className="ml-0.5 text-[10px] font-semibold text-amber-600">
                +1
              </sup>
            )}
          </div>
          <div className="text-xs text-slate-400">{leg.arriveCode}</div>
        </div>
      </div>
    </div>
  );
}

function FlightCard({ flight, onLock }) {
  const [expanded, setExpanded] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleLock = () => {
    setLocked(true);
    onLock?.(flight);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="px-4 sm:px-5 pt-3 divide-y divide-slate-100">
        <FlightLegRow label="Onward" leg={flight.onward} />
        <FlightLegRow label="Return" leg={flight.return} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-3.5 w-3.5 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="currentColor"
            >
              <path
                d="M5.5 7.5l4.5 4.5 4.5-4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Flight details
          </button>

          {flight.amenities?.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              {flight.amenities.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 border border-slate-100"
                >
                  {a}
                </span>
              ))}
              {flight.amenities.length > 3 && (
                <span className="text-[11px]">
                  +{flight.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {currency(flight.price)}
            </div>
            {flight.offerBadge && (
              <div className="text-[11px] font-medium text-emerald-600">
                {flight.offerBadge}
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            View prices
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 sm:px-5 py-4 text-sm text-slate-600 rounded-b-xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-slate-700 mb-1">Onward</div>
              <p>
                {flight.onward.airline} {flight.onward.flightNumber} ·{" "}
                {flight.onward.departCode} → {flight.onward.arriveCode} ·{" "}
                {flight.onward.duration}
              </p>
            </div>
            <div>
              <div className="font-semibold text-slate-700 mb-1">Return</div>
              <p>
                {flight.return.airline} {flight.return.flightNumber} ·{" "}
                {flight.return.departCode} → {flight.return.arriveCode} ·{" "}
                {flight.return.duration}
              </p>
            </div>
          </div>
          {flight.amenities?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flight.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 border border-slate-200"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end px-4 sm:px-5 pb-4">
        <button
          type="button"
          onClick={handleLock}
          disabled={locked}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            locked
              ? "bg-emerald-50 text-emerald-600 cursor-default"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          }`}
        >
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M5 8V6a5 5 0 0110 0v2h.5A1.5 1.5 0 0117 9.5v7A1.5 1.5 0 0115.5 18h-11A1.5 1.5 0 013 16.5v-7A1.5 1.5 0 014.5 8H5zm2 0h6V6a3 3 0 00-6 0v2z" />
          </svg>
          {locked
            ? "Price locked"
            : `Lock this price @ ${currency(flight.lockPrice)}`}
        </button>
      </div>
    </div>
  );
}

function SortTabs({ active, onChange, flights }) {
  const summary = useMemo(() => {
    const cheapest = [...flights].sort((a, b) => a.price - b.price)[0];
    const fastest = [...flights].sort(
      (a, b) => durationMinutes(a) - durationMinutes(b)
    )[0];
    return {
      popular: flights[0],
      nonstop: fastest,
      cheapest,
    };
  }, [flights]);

  return (
    <div className="flex items-stretch bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {SORTS.map((s) => {
        const ref = summary[s.key];
        const isActive = active === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange(s.key)}
            className={`flex-1 px-4 py-3 text-left border-r last:border-r-0 border-slate-100 transition-colors ${
              isActive ? "bg-indigo-50" : "hover:bg-slate-50"
            }`}
          >
            <div
              className={`text-sm font-semibold ${
                isActive ? "text-indigo-700" : "text-slate-700"
              }`}
            >
              {s.label}
            </div>
            {ref && (
              <div className="text-xs text-slate-400 mt-0.5">
                {currency(ref.price)} | {durationLabel(ref)}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
      <div className="h-4 w-1/3 bg-slate-100 rounded" />
      <div className="h-4 w-2/3 bg-slate-100 rounded" />
      <div className="h-4 w-1/2 bg-slate-100 rounded" />
    </div>
  );
}

export default function RoundTripResults({
  searchData,
  onLockPrice,
}) {
  const dispatch = useDispatch();
  const flights = useSelector(selectFlights);
  const travelDetails = useSelector(selectTravelDetails);

 

  console.log("RoundTrip searchData:", searchData);
  console.log("Redux flights:", flights);


  const resolvedOrigin =
    searchData?.fromCity ||
    searchData?.from ||
    travelDetails?.from;

  const resolvedDestination =
    searchData?.toCity ||
    searchData?.to ||
    travelDetails?.to;

  const departureDate =
    searchData?.departureDate ||
    travelDetails?.departureDate;

  const returnDate =
    searchData?.returnDate ||
    travelDetails?.returnDate;

  const travelers =
    searchData?.adults ||
    travelDetails?.travelers ||
    1;

  const [sort, setSort] = useState("popular");
 const [status] = useState("succeeded");
  const [error, setError] = useState(null);
  



  const handleLock = useCallback(
    (flight) => {
      onLockPrice?.(flight);
    },
    [onLockPrice]
  );

  const sorted = useMemo(
  () => sortFlights(flights || [], sort),
  [flights, sort]
);


  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Flights from {resolvedOrigin || "—"} to {resolvedDestination || "—"}, and back
        </h1>
      </div>

      {status === "loading" && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Couldn't load flights. {error || "Try again."}
        </div>
      )}
      {status === "succeeded" && sorted.length > 0 && (
  <>
    <SortTabs
      active={sort}
      onChange={setSort}
      flights={sorted}
    />

    <div className="space-y-4 mt-5">
      {sorted.map((flight, index) => (
        <FlightCard
          key={flight.bookingToken || index}
          flight={flight}
          onLock={handleLock}
        />
      ))}
    </div>
  </>
)}
      
    </div>
    
  );
}
