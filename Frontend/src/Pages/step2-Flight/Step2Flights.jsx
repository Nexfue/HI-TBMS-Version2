import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectFlights } from "../../Store/slices/travelSlice";
import {
  Info,
  ChevronDown,
  Heart,
  SlidersHorizontal,
  Plane,
  Hotel,
  Car,
  Leaf,
} from "lucide-react";





/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                             */
/* ------------------------------------------------------------------ */

function DualRangeSlider({ min, max, values, onChange, formatLabel }) {
  const [low, high] = values;

  const handleLow = (e) => {
    const val = Math.min(Number(e.target.value), high - 1);
    onChange([val, high]);
  };
  const handleHigh = (e) => {
    const val = Math.max(Number(e.target.value), low + 1);
    onChange([low, val]);
  };

  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;


  return (
    <div className="pt-1">
      <div className="relative h-1.5">
        <div className="absolute inset-0 rounded-full bg-slate-200" />
        <div
          className="absolute h-1.5 rounded-full bg-teal-600"
          style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          onChange={handleLow}
          className="range-thumb absolute inset-0 h-1.5 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          onChange={handleHigh}
          className="range-thumb absolute inset-0 h-1.5 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{formatLabel(low)}</span>
        <span>{formatLabel(high)}</span>
      </div>
    </div>
  );
}

function Checkbox({ label, sublabel, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 py-1.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
      />
      <span className="text-slate-700">
        {label}
        {sublabel && (
          <span className="block text-xs text-slate-400">{sublabel}</span>
        )}
      </span>
    </label>
  );
}

function FavoriteButton({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Save flight"
      className="rounded-full p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-rose-500"
    >
      <Heart
        className={`h-5 w-5 ${active ? "fill-rose-500 text-rose-500" : ""}`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Flight leg / card                                                  */
/* ------------------------------------------------------------------ */

function Leg({ time, code, arrTime, arrCode, duration, stopLabel }) {
  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="w-14 text-right">
        <div className="text-sm font-semibold text-slate-800">{time}</div>
        <div className="text-xs text-slate-400">{code}</div>
      </div>
      <div className="flex flex-1 flex-col items-center px-1">

  <div className="text-[11px] text-slate-400">
    {duration}
  </div>

  <div className="flex items-center w-full my-1">

    <div className="flex-1 h-px bg-slate-300"></div>

    <Plane className="mx-2 h-4 w-4 text-slate-500 rotate-90" />

    <div className="flex-1 h-px bg-slate-300"></div>

  </div>

  <div className="text-[11px] font-medium text-rose-500">
    {stopLabel}
  </div>

</div>
      <div className="w-14">
        <div className="text-sm font-semibold text-slate-800">{arrTime}</div>
        <div className="text-xs text-slate-400">{arrCode}</div>
      </div>
    </div>
  );
}
const formatDuration = (minutes) => {
  if (!minutes) return "";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
};

function FlightCard({ flight, saved, onToggleSave }) {
  const departureTime = flight.departureTime?.split(" ")[1] || "";
  const arrivalTime = flight.arrivalTime?.split(" ")[1] || "";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      {/* Layover / CO2 */}
      {flight.layovers?.length > 0 && (
        <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
          <Leaf className="h-4 w-4" />
          {flight.stops} Stop
          {flight.layovers.map((layover, index) => (
            <span key={index}>
              • {layover.name} ({layover.duration} mins)
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">

        {/* Airline + Flight Details */}
        <div className="flex flex-1 items-center gap-4">

          <img
            src={flight.airlineLogo}
            alt={flight.airline}
            className="h-10 w-10 rounded-full object-contain"
          />

          <div className="flex flex-col">

            <h3 className="font-semibold text-slate-800">
              {flight.airline}
            </h3>

            <span className="text-sm text-slate-500">
              {flight.flightNumber}
            </span>

          </div>

        </div>

        {/* Journey */}
        <div className="flex flex-1 items-center justify-between">

          <div className="text-center">
            <h2 className="text-lg font-bold">
              {departureTime}
            </h2>

            <p className="text-sm text-slate-500">
              {flight.departureAirport}
            </p>
          </div>

         <div className="flex flex-col items-center flex-1 px-4">

  <span className="text-sm text-slate-500">
    {formatDuration(flight.duration)}
  </span>

  <div className="flex items-center w-full my-2">

    <div className="flex-1 h-px bg-slate-300"></div>

    <Plane className="mx-2 h-4 w-4 text-slate-500 rotate-90" />

    <div className="flex-1 h-px bg-slate-300"></div>

  </div>

  <span className="text-xs text-red-500">
    {flight.stops === 0
      ? "Direct"
      : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
  </span>

</div>

          <div className="text-center">
            <h2 className="text-lg font-bold">
              {arrivalTime}
            </h2>

            <p className="text-sm text-slate-500">
              {flight.arrivalAirport}
            </p>
          </div>

        </div>

        {/* Price */}
        <div className="flex w-full flex-col items-end gap-2 sm:w-44">

          <FavoriteButton
            active={saved}
            onToggle={onToggleSave}
          />

          <div className="text-2xl font-bold text-slate-900">
            ₹{flight.price.toLocaleString("en-IN")}
          </div>

          <button
            className="w-full rounded-lg bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
          >
            Select →
          </button>

        </div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const AIRLINE_LOGOS = {
  airfrance:
    "https://images.kiwi.com/airlines/64/AF.png",
  airtransat: "https://images.kiwi.com/airlines/64/TS.png",
  aircanada: "https://images.kiwi.com/airlines/64/AC.png",
  tap: "https://images.kiwi.com/airlines/64/TP.png",
};

// const FLIGHTS = [
//   {
//     id: "af",
//     airline: "AIR FRANCE",
//     logo: AIRLINE_LOGOS.airfrance,
//     sponsored: true,
//     headline: "A Rendez-Vous with Air France",
//     price: "₹1,03,300",
//     legs: [
//       {
//         time: "7:00 p.m.",
//         code: "YUL",
//         arrTime: "11:20 a.m.",
//         arrCode: "MAD",
//         duration: "10h 20\n1 stop CDG",
//         stopLabel: "1 stop CDG",
//       },
//       {
//         time: "10:05 a.m.",
//         code: "MAD",
//         arrTime: "3:00 p.m.",
//         arrCode: "YUL",
//         duration: "10h 55",
//         stopLabel: "1 stop CDG",
//       },
//     ],
//   },
//   {
//     id: "ts",
//     airline: "Air Transat",
//     logo: AIRLINE_LOGOS.airtransat,
//     co2Note: "This flight emits 19% less CO2e than a typical flight on this route",
//     price: "₹84,600",
//     dealsFrom: "6 deals from",
//     legs: [
//       {
//         time: "11:40 p.m.",
//         code: "YUL",
//         arrTime: "12:40 p.m.",
//         arrCode: "MAD",
//         duration: "7h",
//         stopLabel: "Direct",
//       },
//       {
//         time: "2:10 p.m.",
//         code: "MAD",
//         arrTime: "4:05 a.m.",
//         arrCode: "YUL",
//         duration: "7h 55",
//         stopLabel: "Direct +1",
//       },
//     ],
//   },
//   {
//     id: "ac",
//     airline: "Air Canada",
//     logo: AIRLINE_LOGOS.aircanada,
//     co2Note: "This flight emits 31% less CO2e than a typical flight on this route",
//     price: "₹86,300",
//     dealsFrom: "6 deals from",
//     legs: [
//       {
//         time: "5:35 p.m.",
//         code: "YUL",
//         arrTime: "6:40 a.m.",
//         arrCode: "MAD",
//         duration: "7h 05",
//         stopLabel: "Direct +1",
//       },
//       {
//         time: "12:45 p.m.",
//         code: "MAD",
//         arrTime: "2:55 p.m.",
//         arrCode: "YUL",
//         duration: "8h 10",
//         stopLabel: "Direct",
//       },
//     ],
//   },
//   {
//     id: "tp",
//     airline: "TAP Air Portugal",
//     logo: AIRLINE_LOGOS.tap,
//     price: "₹76,200",
//     dealsFrom: "11 deals from",
//     legs: [
//       {
//         time: "10:45 p.m.",
//         code: "YUL",
//         arrTime: "3:20 p.m.",
//         arrCode: "MAD",
//         duration: "10h 35\n1 stop LIS",
//         stopLabel: "1 stop LIS",
//       },
//       {
//         time: "4:20 p.m.",
//         code: "MAD",
//         arrTime: "9:10 p.m.",
//         arrCode: "YUL",
//         duration: "10h 50",
//         stopLabel: "1 stop LIS +1",
//       },
//     ],
//   },
// ];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function FlightBookingPage() {
  const [stops, setStops] = useState({ direct: true, oneStop: true, twoPlus: false });
  const [outboundRange, setOutboundRange] = useState([0, 1439]);
  const [returnRange, setReturnRange] = useState([0, 1439]);
  const [durationRange, setDurationRange] = useState([8 * 60, 34.5 * 60]);
  const [sortBy, setSortBy] = useState("best");
  const [saved, setSaved] = useState({});
  const flights = useSelector(selectFlights);
console.log(flights);

  const toggleStop = (key) =>
    setStops((s) => ({ ...s, [key]: !s[key] }));

  const toggleSave = (id) =>
    setSaved((s) => ({ ...s, [id]: !s[id] }));

  const formatMinutes = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    const period = h >= 12 ? "p.m." : "a.m.";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`
        .range-thumb::-webkit-slider-thumb {
          appearance: none;
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #0f766e;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
          margin-top: -1px;
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #0f766e;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        .range-thumb::-webkit-slider-runnable-track { background: transparent; }
        .range-thumb::-moz-range-track { background: transparent; }
      `}</style>

      {/* Top bar */}
      {/*  */}

      <main className="mx-auto max-w-7xl gap-6 px-4 py-6 lg:flex lg:items-start">
        {/* -------------------------------------------------- */}
        {/* Left filters sidebar */}
        {/* -------------------------------------------------- */}
        <aside className="mb-6 w-full shrink-0 space-y-6 lg:mb-0 lg:w-72">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              Prices are currently as expected
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Based on these results, ₹1,03,300 is within the typical range.
            </p>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold">
              <span className="rounded bg-slate-900 px-2 py-0.5 text-white">
                ₹1,03,300
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-teal-500 via-teal-300 to-rose-400" />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>₹96,900</span>
              <span>₹1,60,600</span>
            </div>
            <button className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-700 underline underline-offset-2">
              How we calculate this
            </button>
            <button className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Get Price Alerts
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              Stops <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <Checkbox
              label="Direct"
              sublabel="from ₹1,03,300"
              checked={stops.direct}
              onChange={() => toggleStop("direct")}
            />
            <Checkbox
              label="1 stop"
              sublabel="from ₹1,03,300"
              checked={stops.oneStop}
              onChange={() => toggleStop("oneStop")}
            />
            <Checkbox
              label="2+ stops"
              sublabel="from ₹1,04,900"
              checked={stops.twoPlus}
              onChange={() => toggleStop("twoPlus")}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              Departure times <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold text-slate-500">
                Outbound
              </p>
              <p className="mb-1 text-xs text-slate-400">
                12:00 a.m. – 11:59 p.m.
              </p>
              <DualRangeSlider
                min={0}
                max={1439}
                values={outboundRange}
                onChange={setOutboundRange}
                formatLabel={formatMinutes}
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">
                Return
              </p>
              <p className="mb-1 text-xs text-slate-400">
                12:00 a.m. – 11:59 p.m.
              </p>
              <DualRangeSlider
                min={0}
                max={1439}
                values={returnRange}
                onChange={setReturnRange}
                formatLabel={formatMinutes}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              Journey duration <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <p className="mb-1 text-xs text-slate-400">
              {formatDuration(durationRange[0])} – {formatDuration(durationRange[1])}
            </p>
            <DualRangeSlider
              min={8 * 60}
              max={34.5 * 60}
              values={durationRange}
              onChange={setDurationRange}
              formatLabel={formatDuration}
            />
          </div>
        </aside>

        {/* -------------------------------------------------- */}
        {/* Main results column */}
        {/* -------------------------------------------------- */}
        <section className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              1,043 results sorted by Best
              <Info className="h-3.5 w-3.5" />
            </div>
            <button className="text-sm font-semibold text-teal-700 underline underline-offset-2">
              Show whole month
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-2">
            {[
              { key: "best", label: "Best", price: "₹1,03,300", meta: "7h 28 avg" },
              { key: "cheapest", label: "Cheapest", price: "₹91,900", meta: "15h 03 avg" },
              { key: "fastest", label: "Fastest", price: "₹1,03,300", meta: "7h 28 avg" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSortBy(tab.key)}
                className={`rounded-lg px-3 py-2 text-left transition ${
                  sortBy === tab.key
                    ? "bg-teal-50 ring-2 ring-teal-600"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="text-xs font-semibold text-slate-500">
                  {tab.label}
                </div>
                <div className="text-base font-bold text-slate-900">
                  {tab.price}
                </div>
                <div className="text-xs text-slate-400">{tab.meta}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600">
              <SlidersHorizontal className="h-4 w-4" />
              Sort <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
       {flights.map((flight, index) => (
         <FlightCard
         key={flight.bookingToken || index}
          flight={flight}
          saved={!!saved[flight.bookingToken]}
         onToggleSave={() => toggleSave(flight.bookingToken)}
        />
     ))}
      </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* Right rail */}
        {/* -------------------------------------------------- */}
        <aside className="mt-6 w-full shrink-0 space-y-4 lg:mt-0 lg:w-72">
          <div className="overflow-hidden rounded-xl bg-slate-900 text-white">
            <div className="flex items-center gap-1 px-4 pt-3 text-[10px] uppercase tracking-wide text-slate-300">
              A Star Alliance member
            </div>
            <div className="px-4 pb-1 pt-2">
              <p className="text-xl font-semibold leading-snug">
                Fly to your next adventure.
              </p>
              <button className="mt-3 rounded bg-amber-400 px-4 py-1.5 text-sm font-bold text-slate-900">
                Book now
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80"
              alt="Airplane wing over clouds"
              className="h-40 w-full object-cover"
            />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-serif text-2xl italic">yes</span>
              <span className="text-sm font-semibold tracking-wide">
                Lufthansa
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Hotel className="h-5 w-5 text-teal-700" />
              <span className="text-sm font-bold text-slate-800">
                Found flights? Now find a hotel
              </span>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Get results from all the top hotel sites right here on
              Skyscanner.
            </p>
            <button className="w-full rounded-lg bg-teal-700 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">
              Explore hotels
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Fri, Sep 18 – Mon, Sep 28</span>
              <Car className="h-4 w-4 text-teal-700" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Car hire in Madrid
            </p>
            <p className="text-xs text-slate-500">
              Don't stop at flights — find deals on wheels.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
