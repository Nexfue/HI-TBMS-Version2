import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Plane,
  PlaneTakeoff,
  Hotel as HotelIcon,
  Compass,
  Car,
  Plus,
  Download,
  Printer,
} from 'lucide-react';
import {
  resetTravel,
  selectNights,
  selectPax,
  selectFlightCost,
  selectHotelCost,
  selectActivitiesCost,
  selectTransportCost,
  selectTotalCost,
} from '../../Store/slices/travelSlice'

const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(n ?? 0);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// Small reusable pieces so the JSX below stays close to the original markup
const OverviewItem = ({ label, value }) => (
  <div className="px-5 py-3.5 border-r border-b border-slate-800">
    <span className="block text-[0.72rem] font-semibold uppercase tracking-wide text-slate-400 mb-1">
      {label}
    </span>
    <span className="block text-sm font-semibold text-slate-100">{value}</span>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex gap-3 px-5 py-3 border-b border-slate-800 items-baseline">
    <span className="min-w-[80px] text-[0.78rem] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="text-sm text-slate-100">{value}</span>
  </div>
);

const CardHeader = ({ icon, title, cost }) => (
  <div className="flex items-center gap-2.5 px-5 py-4 bg-cyan-400/5 border-b border-slate-800">
    {icon}
    <h3 className="flex-1 text-base font-bold text-slate-100">{title}</h3>
    {cost !== undefined && (
      <span className="text-base font-bold text-cyan-400">₹{formatNumber(cost)}</span>
    )}
  </div>
);

export default function Confirmation() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const td = useSelector((s) => s.travel.travelDetails);
  const dep = useSelector((s) => s.travel.departureFlight);
  const ret = useSelector((s) => s.travel.returnFlight);
  const hot = useSelector((s) => s.travel.hotel);
  const room = useSelector((s) => s.travel.selectedRoom);
  const acts = useSelector((s) => s.travel.selectedActivities);
  const trn = useSelector((s) => s.travel.transport);
  const selectedSeat = useSelector((s) => s.travel.selectedSeat);
  const pdfBase64 = useSelector((s) => s.travel.pdfBase64);

  const nights = useSelector(selectNights);
  const pax = useSelector(selectPax);
  const flightCost = useSelector(selectFlightCost);
  const hotelCost = useSelector(selectHotelCost);
  const activitiesCost = useSelector(selectActivitiesCost);
  const transportCost = useSelector(selectTransportCost);
  const totalCost = useSelector(selectTotalCost);

  const hasPdf = !!pdfBase64;

  const downloadPdf = () => {
    if (!pdfBase64) return;
    const binary = atob(pdfBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TravelItinerary_${td?.to ?? 'Trip'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startNewTrip = () => {
    dispatch(resetTravel());
    navigate('/step1');
  };

  return (
    <div className="min-h-screen bg-[#0a1420] pb-16">
      {/* ── Success Banner ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden text-center px-5 pt-10 pb-8 border-b border-slate-800 bg-gradient-to-br from-[#0a1628] via-[#0d2240] to-[#051525]">
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(0,212,232,0.08)_0%,transparent_70%)]" />
        <img
          src="/assets/images/heroes/celebrate.svg"
          alt="Celebration"
          className="mx-auto w-16 h-16 mb-3 animate-bounce"
        />
        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Itinerary Confirmed!</h1>
        <p className="text-base text-slate-400">
          Your trip has been planned. Here&apos;s your complete itinerary summary.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-7">
        {/* ── Trip Overview ──────────────────────────────────────────── */}
        {td && (
          <div className="bg-[#0d1b2e] border border-slate-800 rounded-xl shadow-lg mb-5 overflow-hidden">
            <CardHeader icon={<Plane className="text-cyan-400 w-5 h-5" />} title="Trip Overview" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 py-1">
              <OverviewItem label="Traveller" value={td.name} />
              <OverviewItem label="Email" value={td.email} />
              <OverviewItem label="Route" value={`${td.from} → ${td.to}`} />
              <OverviewItem label="Departure" value={formatDate(td.departureDate)} />
              {td.returnDate && <OverviewItem label="Return" value={formatDate(td.returnDate)} />}
              <OverviewItem label="Duration" value={`${nights} night${nights !== 1 ? 's' : ''}`} />
              <OverviewItem label="Travelers" value={`${td.travelers} Traveler${td.travelers !== 1 ? 's' : ''}`} />
              <OverviewItem label="Class" value={td.travelClass?.charAt(0).toUpperCase() + td.travelClass?.slice(1)} />
              {selectedSeat && (
                <OverviewItem
                  label="Seat Pref."
                  value={selectedSeat.charAt(0).toUpperCase() + selectedSeat.slice(1)}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Flights ────────────────────────────────────────────────── */}
        {dep && (
          <div className="bg-[#0d1b2e] border border-slate-800 rounded-xl shadow-lg mb-5 overflow-hidden">
            <CardHeader icon={<PlaneTakeoff className="text-cyan-400 w-5 h-5" />} title="Flights" cost={flightCost} />

            <div className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-b border-slate-800">
              <div className="min-w-[72px] text-[0.78rem] font-semibold text-slate-400">Departure</div>
              <div className="flex-1">
                <strong className="block text-sm text-slate-100">{dep.airline} {dep.flightNo}</strong>
                <span className="text-[0.8rem] text-slate-400">{dep.departure} → {dep.arrival} · {dep.duration}</span>
              </div>
              <div className="text-sm font-semibold text-cyan-400">₹{formatNumber(dep.price)} × {pax}</div>
            </div>

            {ret && (
              <div className="flex flex-wrap items-center gap-4 px-5 py-3.5 border-b border-slate-800">
                <div className="min-w-[72px] text-[0.78rem] font-semibold text-slate-400">Return</div>
                <div className="flex-1">
                  <strong className="block text-sm text-slate-100">{ret.airline} {ret.flightNo}</strong>
                  <span className="text-[0.8rem] text-slate-400">{ret.departure} → {ret.arrival} · {ret.duration}</span>
                </div>
                <div className="text-sm font-semibold text-cyan-400">₹{formatNumber(ret.price)} × {pax}</div>
              </div>
            )}
          </div>
        )}

        {/* ── Hotel ──────────────────────────────────────────────────── */}
        {hot && (
          <div className="bg-[#0d1b2e] border border-slate-800 rounded-xl shadow-lg mb-5 overflow-hidden">
            <CardHeader icon={<HotelIcon className="text-cyan-400 w-5 h-5" />} title="Hotel" cost={hotelCost} />
            <DetailRow label="Hotel" value={`${hot.name}, ${hot.location}`} />
            <DetailRow label="Room" value={`${room?.name} — ${room?.description}`} />
            <DetailRow
              label="Stay"
              value={`${nights} night${nights !== 1 ? 's' : ''} × ₹${formatNumber(hot.pricePerNight + (room?.extraCharge ?? 0))}`}
            />
            <DetailRow label="Rating" value={`★ ${hot.rating} (${hot.reviewCount} reviews)`} />
          </div>
        )}

        {/* ── Activities ─────────────────────────────────────────────── */}
        <div className="bg-[#0d1b2e] border border-slate-800 rounded-xl shadow-lg mb-5 overflow-hidden">
          <CardHeader icon={<Compass className="text-cyan-400 w-5 h-5" />} title="Activities" cost={activitiesCost} />

          {acts.length > 0 ? (
            acts.map((act, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-slate-800">
                <img src={act.icon} alt={act.name} className="w-8 h-8 flex-shrink-0" />
                <div className="flex-1">
                  <strong className="block text-sm text-slate-100">{act.name}</strong>
                  <span className="text-[0.78rem] text-slate-400">{act.type} · {act.duration}</span>
                </div>
                <span className="text-sm font-semibold text-cyan-400">
                  {act.price > 0 ? `₹${formatNumber(act.price)}` : 'Free'}
                </span>
              </div>
            ))
          ) : (
            <p className="px-5 py-4 text-sm text-slate-400">No activities selected</p>
          )}
        </div>

        {/* ── Transport ──────────────────────────────────────────────── */}
        {trn && (
          <div className="bg-[#0d1b2e] border border-slate-800 rounded-xl shadow-lg mb-5 overflow-hidden">
            <CardHeader icon={<Car className="text-cyan-400 w-5 h-5" />} title="Transport" cost={transportCost} />
            <DetailRow
              label="Vehicle"
              value={
                <span className="inline-flex items-center gap-2">
                  <img src={trn.icon} alt={trn.name} className="w-6 h-6" />
                  {trn.name} ({trn.vehicleType})
                </span>
              }
            />
            <DetailRow label="Category" value={trn.category} />
            <DetailRow
              label="Duration"
              value={`${nights} day${nights !== 1 ? 's' : ''} × ₹${formatNumber(trn.pricePerDay)}`}
            />
          </div>
        )}

        {/* ── Cost Summary ───────────────────────────────────────────── */}
        <div className="bg-[#0d1b2e] border border-slate-800 rounded-xl shadow-lg p-5 mb-7">
          <h3 className="text-base font-bold text-slate-100 mb-4">Cost Breakdown</h3>

          {dep && (
            <div className="flex justify-between py-2 text-[0.92rem] text-slate-400 border-b border-dashed border-slate-800">
              <span className="inline-flex items-center gap-2">
                <img src="/assets/images/heroes/flights.svg" alt="" className="w-4 h-4" /> Flights
              </span>
              <span>₹{formatNumber(flightCost)}</span>
            </div>
          )}
          {hot && (
            <div className="flex justify-between py-2 text-[0.92rem] text-slate-400 border-b border-dashed border-slate-800">
              <span className="inline-flex items-center gap-2">
                <img src="/assets/images/heroes/hotels.svg" alt="" className="w-4 h-4" /> Hotel ({nights} nights)
              </span>
              <span>₹{formatNumber(hotelCost)}</span>
            </div>
          )}
          {acts.length > 0 && (
            <div className="flex justify-between py-2 text-[0.92rem] text-slate-400 border-b border-dashed border-slate-800">
              <span className="inline-flex items-center gap-2">
                <img src="/assets/images/heroes/activities.svg" alt="" className="w-4 h-4" /> Activities ({acts.length})
              </span>
              <span>₹{formatNumber(activitiesCost)}</span>
            </div>
          )}
          {trn && (
            <div className="flex justify-between py-2 text-[0.92rem] text-slate-400 border-b border-dashed border-slate-800">
              <span className="inline-flex items-center gap-2">
                <img src="/assets/images/heroes/transport.svg" alt="" className="w-4 h-4" /> Transport ({nights} days)
              </span>
              <span>₹{formatNumber(transportCost)}</span>
            </div>
          )}

          <div className="flex justify-between pt-3 mt-2 text-[1.05rem] font-bold text-slate-100">
            <span>Grand Total</span>
            <span className="text-2xl text-cyan-400">₹{formatNumber(totalCost)}</span>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-4 justify-center print:hidden">
          <button
            onClick={startNewTrip}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-semibold border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            <Plus className="w-4 h-4" /> Plan Another Trip
          </button>

          {hasPdf && (
            <button
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-semibold bg-amber-400 text-slate-900 hover:bg-amber-300 transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-semibold bg-cyan-400 text-slate-900 hover:bg-cyan-300 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
