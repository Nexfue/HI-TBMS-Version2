import { useNavigate } from 'react-router-dom';

const HotelIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      d="M3 21V7a1 1 0 011-1h6a1 1 0 011 1v14M3 21h18M11 21v-6a1 1 0 011-1h6a1 1 0 011 1v6M7 6V4a1 1 0 011-1h2a1 1 0 011 1v2M7 10h.01M7 14h.01"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export default function HotelNavButton({ className = 'w-6 h-6', label = 'Hotels' }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/step3')}
      className="flex flex-col items-center gap-1 text-[#434656] hover:text-[#003ec7] transition-colors"
    >
      <HotelIcon className={className} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
