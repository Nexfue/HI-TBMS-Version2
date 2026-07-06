// components/ServiceTabs.jsx
import { useNavigate, useLocation } from 'react-router-dom';

// ── Service icons ────────────────────────────────────────────────────────
const FlightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10.5 21l1.5-5-7-3.5V9l8 2V6a2 2 0 114 0v5l8-2v3.5l-7 3.5 1.5 5-3.5-1.5L10.5 21z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const HotelIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M3 21V7a1 1 0 011-1h6a1 1 0 011 1v14M3 21h18M11 21v-6a1 1 0 011-1h6a1 1 0 011 1v6M7 6V4a1 1 0 011-1h2a1 1 0 011 1v2M7 10h.01M7 14h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const HolidayIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 3a9 9 0 019 9c-4 0-9-1-9-9zm0 0a9 9 0 00-9 9c4 0 9-1 9-9zm0 0v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const VisaIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect height="16" rx="2" strokeWidth="1.5" width="12" x="6" y="4" />
    <path d="M12 8a2 2 0 100 4 2 2 0 000-4zm-4 8h8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const CruiseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M4 19l1.5-6h13L20 19M6 13V5h5l3 4M3 21c1.5 1 3.5 1 5 0s3.5-1 5 0 3.5 1 5 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

// ── Service definitions ──────────────────────────────────────────────────
export const SERVICE_OPTIONS = [
  { key: 'flights', label: 'Flights', Icon: FlightIcon, path: '/' },
  { key: 'hotels', label: 'Hotels', Icon: HotelIcon, path: 'hotel' },
  { key: 'holiday-packages', label: 'Holiday Packages', Icon: HolidayIcon, path: '/step4' },
  { key: 'visa', label: 'Visa', Icon: VisaIcon, path: '/step5' },
  { key: 'cruise', label: 'Cruise', Icon: CruiseIcon, path: '/step1' },
];

/**
 * Reusable service selector tabs (Flights / Hotels / Holiday Packages / Visa / Cruise).
 *
 * Usage:
 *   <ServiceTabs />                          // auto-detects active tab from current route
 *   <ServiceTabs activeService="hotels" />    // force a specific tab as active
 *   <ServiceTabs onSelect={(service) => ...}} // custom behavior instead of navigating
 */
export default function ServiceTabs({ activeService, onSelect, className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // If no activeService is explicitly passed, infer it from the current path
  const resolvedActive =
    activeService ??
    SERVICE_OPTIONS.find((s) => s.path === location.pathname)?.key ??
    'flights';

  const handleClick = (service) => {
    if (onSelect) {
      onSelect(service);
    } else {
      navigate(service.path);
    }
  };

  return (
    <div
      className={`flex items-center justify-center gap-10 bg-white border border-slate-100 rounded-full py-4 px-8 shadow-sm ${className}`}
    >
      {SERVICE_OPTIONS.map((service) => (
        <button
          key={service.key}
          type="button"
          onClick={() => handleClick(service)}
          className={`flex flex-col items-center gap-1.5 text-xs font-semibold transition-colors ${
            resolvedActive === service.key ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <service.Icon className="w-5 h-5" />
          <span>{service.label}</span>
          <span
            className={`h-0.5 w-full rounded-full ${
              resolvedActive === service.key ? 'bg-blue-600' : 'bg-transparent'
            }`}
          />
        </button>
      ))}
    </div>
  );
}