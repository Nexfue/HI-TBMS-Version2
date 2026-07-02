import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Ticket, Camera, Sparkles, AlertCircle, RefreshCw,
  Star, Clock, CheckCircle2, PlusCircle, Compass,
  Mountain, Waves, UtensilsCrossed, ShoppingBag, Flower2, Leaf, Wine, Bike,
  Landmark, Palette, Building2, MountainSnow, Image, FerrisWheel,
} from 'lucide-react';

import { selectTravelDetails, selectSelectedActivities, setSelectedActivities } from '../../Store/slices/travelSlice';
import { getActivities } from '../../Service/apiService';
// Swap the import above for './apiService.mock' to develop against fake
// data before the real /api/activities endpoint exists.

const TABS = ['All', 'Adventure', 'Cultural', 'Relaxation', 'Food & Dining', 'Shopping'];

const ACTIVITY_OPTIONS = [
  { label: 'Adventure & Trekking', icon: Mountain },
  { label: 'Beach & Water Sports', icon: Waves },
  { label: 'Food & Dining', icon: UtensilsCrossed },
  { label: 'Shopping', icon: ShoppingBag },
  { label: 'Relaxation & Spa', icon: Flower2 },
  { label: 'Wildlife & Nature', icon: Leaf },
  { label: 'Nightlife & Entertainment', icon: Wine },
  { label: 'Cycling & Sports', icon: Bike },
];

const SIGHTSEEING_OPTIONS = [
  { label: 'Historical Monuments', icon: Landmark },
  { label: 'Museums & Art Galleries', icon: Palette },
  { label: 'City Tours', icon: Building2 },
  { label: 'Natural Wonders', icon: MountainSnow },
  { label: 'Religious & Sacred Sites', icon: Landmark },
  { label: 'Scenic Viewpoints', icon: Image },
  { label: 'Theme Parks & Attractions', icon: FerrisWheel },
  { label: 'Photography Spots', icon: Camera },
];

const PREF_TO_TYPE = {
  'Adventure & Trekking': 'Adventure',
  'Beach & Water Sports': 'Adventure',
  'Wildlife & Nature': 'Adventure',
  'Cycling & Sports': 'Adventure',
  'Theme Parks & Attractions': 'Adventure',
  'Natural Wonders': 'Adventure',
  'Food & Dining': 'Food & Dining',
  Shopping: 'Shopping',
  'Relaxation & Spa': 'Relaxation',
  'Scenic Viewpoints': 'Relaxation',
  'Nightlife & Entertainment': 'Cultural',
  'Historical Monuments': 'Cultural',
  'Museums & Art Galleries': 'Cultural',
  'City Tours': 'Cultural',
  'Religious & Sacred Sites': 'Cultural',
  'Photography Spots': 'Cultural',
};

const TYPE_COLORS = {
  Adventure: '#e53935',
  Cultural: '#1565C0',
  Relaxation: '#2e7d32',
  'Food & Dining': '#f57c00',
  Shopping: '#7b1fa2',
};

const TYPE_GRADIENTS = {
  Adventure: 'linear-gradient(135deg, #b71c1c 0%, #e53935 50%, #bf360c 100%)',
  Cultural: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #283593 100%)',
  Relaxation: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 50%, #004d40 100%)',
  'Food & Dining': 'linear-gradient(135deg, #e65100 0%, #f57c00 50%, #bf360c 100%)',
  Shopping: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #311b92 100%)',
};

function typeColor(type) {
  return TYPE_COLORS[type] ?? '#003ec7';
}

function typeGradient(type) {
  return TYPE_GRADIENTS[type] ?? 'linear-gradient(135deg, #003ec7 0%, #0052ff 100%)';
}

function formatInr(value) {
  return value.toLocaleString('en-IN');
}

// All component styles live here instead of a separate .css file.
const STYLES = `
.page-wrapper {
  --primary: #003ec7;
  --primary-container: #0052ff;
  --info-sky: #0ea5e9;
  --on-surface: #191c1e;
  --on-surface-var: #434656;
  --outline-variant: #c3c5d9;
  --surface: #f7f9fb;
  --surface-container: #eceef0;
  --white: #ffffff;
  --success: #10b981;
  --font-headline: 'Hanken Grotesk', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  min-height: 100vh;
  background: var(--surface);
  color: var(--on-surface);
  font-family: var(--font-headline);
  padding-bottom: 80px;
}

.hero-banner { position: relative; height: 500px; border-radius: 16px; overflow: hidden; margin-bottom: 48px; }
.hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(10, 15, 30, 0.75) 0%, rgba(10, 15, 30, 0.55) 45%, transparent 75%);
  display: flex;
  align-items: center;
  padding: 48px;
}

.hero-content { max-width: 520px; }

.hero-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--info-sky);
  margin-bottom: 16px;
}

.hero-title { font-size: 42px; line-height: 50px; font-weight: 700; letter-spacing: -0.02em; color: var(--white); margin: 0 0 16px; }
.hero-sub { font-size: 16px; line-height: 26px; color: rgba(255, 255, 255, 0.78); margin: 0 0 28px; max-width: 440px; }

.btn-explore {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--info-sky);
  color: var(--white);
  border: none;
  padding: 13px 28px;
  border-radius: 10px;
  font-family: var(--font-headline);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-explore:hover { opacity: 0.88; }

.hero-stats {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--white);
  max-width: 300px;
}

.stats-avatars { display: flex; flex-shrink: 0; }
.stats-avatars .avatar { width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--white); object-fit: cover; }
.stats-avatars .avatar:not(:first-child) { margin-left: -10px; }

.stats-bold { font-size: 14px; font-weight: 700; color: var(--white); margin: 0 0 3px; }
.stats-tagline { font-size: 12px; color: rgba(255, 255, 255, 0.75); margin: 0; }

.main-content { max-width: 1280px; margin: 0 auto; padding: 40px 40px 32px; }

.pref-panel {
  background: var(--white);
  border: 1px solid rgba(195, 197, 217, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.pref-section { display: flex; flex-direction: column; gap: 10px; }

.pref-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--on-surface-var);
  margin: 0;
}
.pref-label svg { color: var(--primary); }

.optional-tag {
  font-size: 10px;
  font-weight: 400;
  background: var(--surface-container);
  border-radius: 8px;
  padding: 1px 7px;
  color: var(--on-surface-var);
  font-family: var(--font-headline);
  letter-spacing: 0;
  text-transform: none;
}

.chips-row { display: flex; flex-wrap: wrap; gap: 8px; }

.chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid rgba(195, 197, 217, 0.7);
  background: transparent;
  color: var(--on-surface-var);
  font-family: var(--font-headline);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.chip-btn:hover { border-color: var(--primary); color: var(--primary); background: rgba(0, 62, 199, 0.05); }
.chip-btn--active { border-color: var(--primary); background: rgba(0, 62, 199, 0.1); color: var(--primary); font-weight: 700; }

.pref-hint { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--primary); font-weight: 500; }

.filter-section { padding: 28px 0 24px; border-bottom: 1px solid rgba(195, 197, 217, 0.3); margin-bottom: 28px; }
.filter-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
.filter-title { font-size: 28px; font-weight: 600; letter-spacing: -0.01em; color: var(--on-surface); margin: 0 0 4px; }
.filter-sub { font-size: 14px; color: var(--on-surface-var); margin: 0; }

.tab-group { display: flex; flex-wrap: wrap; gap: 8px; }

.tab-btn {
  position: relative;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: var(--surface-container);
  color: var(--on-surface);
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.tab-btn:hover { background: #e0e2e5; }
.tab-btn--active { background: var(--primary); color: var(--white); font-weight: 700; }
.tab-btn--active:hover { opacity: 0.9; }

.tab-dot { position: absolute; top: 7px; right: 7px; width: 6px; height: 6px; border-radius: 50%; background: var(--info-sky); }

.status-row { display: flex; align-items: center; gap: 10px; padding: 0 0 20px; font-size: 14px; color: var(--on-surface-var); }
.status-row--warn { color: #b45309; }

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(14, 165, 233, 0.25);
  border-top-color: var(--info-sky);
  border-radius: 50%;
  animation: step4-spin 0.7s linear infinite;
}
@keyframes step4-spin { to { transform: rotate(360deg); } }

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-retry:hover { opacity: 0.75; }

.activities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

.activity-card {
  background: var(--white);
  border: 1px solid rgba(195, 197, 217, 0.45);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
}
.activity-card:hover { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
.activity-card--selected { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary), 0 6px 24px rgba(0, 62, 199, 0.12); }
.activity-card--recommended { border-color: rgba(14, 165, 233, 0.5); }

.ac-image { height: 200px; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.ac-image:hover { filter: brightness(1.06); }

.ac-initial { font-size: 80px; font-weight: 800; color: rgba(255, 255, 255, 0.12); user-select: none; letter-spacing: -0.03em; }

.ac-rating {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--info-sky);
  color: var(--white);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 3px;
}

.ac-rec-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ac-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 10px; }
.ac-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.ac-name { font-size: 18px; font-weight: 600; color: var(--on-surface); margin: 0; flex: 1; }
.ac-price { font-size: 20px; font-weight: 700; color: var(--info-sky); white-space: nowrap; flex-shrink: 0; }

.ac-free {
  font-size: 13px;
  font-weight: 700;
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 2px 10px;
  border-radius: 12px;
  flex-shrink: 0;
}

.ac-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ac-type-chip { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 12px; }
.ac-meta-item { display: flex; align-items: center; gap: 3px; font-size: 13px; color: var(--on-surface-var); }

.ac-desc {
  font-size: 14px;
  line-height: 22px;
  color: var(--on-surface-var);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  border: 1.5px solid var(--primary);
  background: transparent;
  color: var(--primary);
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  margin-top: 4px;
}
.btn-add:hover { background: var(--primary); color: var(--white); }
.btn-add--active { background: var(--primary); color: var(--white); }
.btn-add--active:hover { background: #002fa0; }

.empty-state { text-align: center; padding: 64px 24px; }
.empty-state .empty-icon { width: 56px; height: 56px; color: rgba(195, 197, 217, 0.7); display: block; margin: 0 auto 16px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: var(--on-surface); margin: 0 0 8px; }
.empty-state p { font-size: 14px; color: var(--on-surface-var); margin: 0; }

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  border-top: 1px solid rgba(195, 197, 217, 0.4);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  padding: 12px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 40;
}

.bar-summary { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: var(--on-surface); }
.bar-summary svg { color: var(--success); }

.bar-hint { font-size: 14px; font-weight: 400; color: var(--on-surface-var); }
.bar-price { font-weight: 700; color: var(--primary); font-size: 17px; }

.bar-actions { display: flex; gap: 12px; align-items: center; }

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid rgba(195, 197, 217, 0.7);
  background: transparent;
  color: var(--on-surface-var);
  padding: 9px 20px;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.btn-back:hover { border-color: var(--on-surface-var); color: var(--on-surface); }

.btn-continue {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-container);
  color: var(--white);
  border: none;
  padding: 10px 28px;
  border-radius: 8px;
  font-family: var(--font-headline);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-continue:hover { opacity: 0.88; }

@media (max-width: 1024px) {
  .activities-grid { grid-template-columns: repeat(2, 1fr); }
  .filter-header { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 768px) {
  .hero-banner { height: 380px; border-radius: 10px; }
  .hero-overlay { padding: 28px 24px; }
  .hero-title { font-size: 28px; line-height: 36px; }
  .hero-stats { display: none; }
  .main-content { padding: 20px 16px 24px; }
  .activities-grid { grid-template-columns: 1fr; }
  .bottom-bar { padding: 12px 16px; }
}
`;

export default function Step4Activities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const travelDetails = useSelector(selectTravelDetails);
  const storedSelectedActivities = useSelector(selectSelectedActivities);

  const [allActivities, setAllActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [selected, setSelected] = useState(() => new Set());

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  const [selectedActivityPrefs, setSelectedActivityPrefs] = useState(() => new Set());
  const [selectedSightseeingPrefs, setSelectedSightseeingPrefs] = useState(() => new Set());

  // ── Preferences ──────────────────────────────────────────────────────
  const allPrefs = useMemo(
    () => [...selectedActivityPrefs, ...selectedSightseeingPrefs],
    [selectedActivityPrefs, selectedSightseeingPrefs]
  );

  const recommendedTypes = useMemo(() => {
    const types = new Set();
    allPrefs.forEach((p) => {
      const t = PREF_TO_TYPE[p];
      if (t) types.add(t);
    });
    return types;
  }, [allPrefs]);

  const isRecommended = useCallback(
    (activity) => allPrefs.length > 0 && recommendedTypes.has(activity.type),
    [allPrefs, recommendedTypes]
  );

  const toggleActivityPref = useCallback((label) => {
    setSelectedActivityPrefs((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }, []);

  const toggleSightseeingPref = useCallback((label) => {
    setSelectedSightseeingPrefs((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }, []);

  // ── Activity list ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const list = activeTab === 'All' ? allActivities : allActivities.filter((a) => a.type === activeTab);
    if (allPrefs.length === 0) return list;
    return [...list.filter((a) => isRecommended(a)), ...list.filter((a) => !isRecommended(a))];
  }, [activeTab, allActivities, allPrefs, isRecommended]);

  const selectedActivitiesList = useMemo(
    () => allActivities.filter((a) => selected.has(a.id)),
    [allActivities, selected]
  );
  const selectedCount = selected.size;
  const totalActivitiesCost = useMemo(
    () => selectedActivitiesList.reduce((sum, a) => sum + a.price, 0),
    [selectedActivitiesList]
  );

  const isSelected = useCallback((id) => selected.has(id), [selected]);

  const toggle = useCallback((activity) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(activity.id) ? next.delete(activity.id) : next.add(activity.id);
      return next;
    });
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────
  const loadActivities = useCallback(async () => {
    const destination = travelDetails?.to;
    if (!destination) {
      navigate('/step1');
      return;
    }

    setLoading(true);
    setApiError(false);

    try {
      const activities = await getActivities(destination);
      setAllActivities(activities);
      setApiError(activities.length === 0);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, [travelDetails, navigate]);

  const retrySearch = useCallback(() => {
    loadActivities();
  }, [loadActivities]);

  // `continue` is a reserved word in JS, so the Angular method name
  // becomes `handleContinue` here.
  const handleContinue = useCallback(() => {
    dispatch(setSelectedActivities(selectedActivitiesList));
    navigate('/step5');
  }, [dispatch, selectedActivitiesList, navigate]);

  // ── Lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    setSelected(new Set(storedSelectedActivities.map((a) => a.id)));
    loadActivities();
    // Runs once on mount, mirroring Angular's ngOnInit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-wrapper">
      <style>{STYLES}</style>

      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-200 bg-white font-sans">
        <div className="text-2xl font-bold tracking-tighter uppercase">Holiday Infinite</div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-wide">
          <Link className="hover:text-blue-600 transition-colors" to="/">Package</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Contact</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Home</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">Tour</Link>
          <Link className="hover:text-blue-600 transition-colors" to="/">About</Link>
        </nav>
        <Link
          to="/"
          className="bg-zinc-900 text-white px-8 py-3 rounded-full text-sm font-bold uppercase hover:bg-zinc-800 transition-all"
        >
          Book Trip
        </Link>
      </header>

      <main className="main-content">
        {/* Hero Banner */}
        <section className="hero-banner">
          <img
            className="hero-img"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnC7jNwWTu5-pd_4GCFh_rbCwZDhOXMuHcOdj2D6tqFmxJ5x05rz9EcubncMN8Edoi7SKK_l67cmkE0ZY9E7F530LPkmYY-JZ3zakRj9VdSgr5rWDR3RMJnf4--KLX-1mU5Fk6YJ8XKeNsWfBhnZmOw7IBBRvr8dY0A5O9jExeqyrIYiAC9_h1Cpzd_kRDeXTc3aT1f8F3fIEOmxXysmiAYR2TETVTiubS3MiddvJHVmeyfpi9ANL3i1Mor9t1txUH-vIE_Y8__XPm"
            alt="Santorini Sunset"
          />
          <div className="hero-overlay">
            <div className="hero-content">
              <span className="hero-label">Elevate your travel journey</span>
              <h1 className="hero-title">Curated Experiences For The Global Traveler</h1>
              <p className="hero-sub">
                Discover hidden gems and world-class activities designed to create memories that last a lifetime.
                From deep-sea diving to cultural heritage tours.
              </p>
              <button className="btn-explore">
                Explore Now <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stats-avatars">
              <img className="avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG3iQa1VLbC-c-yRWivB_Ucu4Bg2RuAuDnml3Wy_3F7rTAwEPiP4wN32NXnNB-HPeaJjqt013XUogjr7p-DxDu444K3JuXr9e72t-39KyexDUrkJyUmJzdRQBc859BbOGapHSJtGV6Xc23UR3-Bre1mmPyM2NdMjpkTDGoApcUGgjgfeEv0YGUjc4UPBn3TcMwWzmnIu6CvFbV0s281OJIVOHKIs8XIyJVano87U3VzZxfZGncCshUGix25IA-_CRviGY3nHBD1I-i" alt="" />
              <img className="avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJkBnHNlVv0Tb-BWt2mp_5YW0s4zh9lZoJHtLrMEYo5thXx5r6hXLrZjGjd7f5Cx410sO-tFJY2BPWQ89QmapzVGWlOnZ2IYg3_VM8yichteD8W06MDWq-DiQMoC4zlO7kFakhrD9FDqylcFa-CtANSHngV0z5LkHNsRpcrz9LUkNdLFOfm3_ZBOrnHlLw-J159-ZJPtydgM3Ypa2V-uHxpalOpe7xpkEhLeGgbcv7QsR4fY0B8goL2b5znl_LeawQ71HAhqFmOniq" alt="" />
              <img className="avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE2NPCuzR1DaAZ1KKaS7ma9WvmQm9xHRpgw7ARb0Vd_prZ6Zzah0fdVPPyvqprKSE0JjKUwnE7qkKBPIyNDl_G_bfmrrE-QvmyVRhBTyrohWh8tEHoaYMRXLVMB6lILsBL9qCLHHYCAXhggnYR_iHPiCEaIOi_mUP3FcBk_CPpLcR3bKZQqa7W2zUhlWXYymg4bxKNm3tgO2lgjV7On7QtVND26r9mTHXAwpNk7etUIcN8lR2QyjGWWxeksyRdUUv610x6PLa8deTc" alt="" />
            </div>
            <div>
              <p className="stats-bold">12k+ Active Travelers</p>
              <p className="stats-tagline">Discover The World One Adventure At A Time</p>
            </div>
          </div>
        </section>

        {/* Preference Panel */}
        <div className="pref-panel">
          <div className="pref-section">
            <p className="pref-label">
              <Ticket size={15} />
              Preferred Activities
              <span className="optional-tag">Optional</span>
            </p>
            <div className="chips-row">
              {ACTIVITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.label}
                    className={`chip-btn ${selectedActivityPrefs.has(opt.label) ? 'chip-btn--active' : ''}`}
                    onClick={() => toggleActivityPref(opt.label)}
                  >
                    <Icon size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pref-section">
            <p className="pref-label">
              <Camera size={15} />
              Preferred Sightseeing
              <span className="optional-tag">Optional</span>
            </p>
            <div className="chips-row">
              {SIGHTSEEING_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.label}
                    className={`chip-btn ${selectedSightseeingPrefs.has(opt.label) ? 'chip-btn--active' : ''}`}
                    onClick={() => toggleSightseeingPref(opt.label)}
                  >
                    <Icon size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {allPrefs.length > 0 && (
            <div className="pref-hint">
              <Sparkles size={16} />
              Recommended activities are highlighted and sorted to the top below
            </div>
          )}
        </div>

        {/* Filter / Tab Section */}
        <div className="filter-section">
          <div className="filter-header">
            <div>
              <h2 className="filter-title">Find Your Perfect Vibe</h2>
              <p className="filter-sub">Filter experiences by your specific travel style</p>
            </div>
            <div className="tab-group">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {tab !== 'All' && recommendedTypes.has(tab) && <span className="tab-dot" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="status-row">
            <span className="spinner" aria-hidden="true" />
            <span>Loading available activities…</span>
          </div>
        )}
        {!loading && apiError && (
          <div className="status-row status-row--warn">
            <AlertCircle size={18} />
            <span>No activities found. The backend may still be starting up.</span>
            <button className="btn-retry" onClick={retrySearch}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {/* Activity Grid */}
        <div className="activities-grid">
          {filtered.map((activity) => (
            <div
              key={activity.id}
              className={`activity-card ${isSelected(activity.id) ? 'activity-card--selected' : ''} ${isRecommended(activity) ? 'activity-card--recommended' : ''}`}
              onClick={() => toggle(activity)}
            >
              <div className="ac-image" style={{ background: typeGradient(activity.type) }}>
                <div className="ac-initial">{activity.name.charAt(0)}</div>
                <div className="ac-rating">
                  <Star size={13} />
                  {activity.rating}
                </div>
                {isRecommended(activity) && (
                  <div className="ac-rec-badge">
                    <Sparkles size={13} /> Recommended
                  </div>
                )}
              </div>

              <div className="ac-body">
                <div className="ac-header">
                  <h3 className="ac-name">{activity.name}</h3>
                  {activity.price > 0 ? (
                    <span className="ac-price">₹{formatInr(activity.price)}</span>
                  ) : (
                    <span className="ac-free">Free</span>
                  )}
                </div>

                <div className="ac-meta">
                  <span className="ac-type-chip" style={{ background: `${typeColor(activity.type)}18`, color: typeColor(activity.type) }}>
                    {activity.type}
                  </span>
                  <span className="ac-meta-item">
                    <Clock size={14} /> {activity.duration}
                  </span>
                </div>

                <p className="ac-desc">{activity.description}</p>

                <button
                  className={`btn-add ${isSelected(activity.id) ? 'btn-add--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggle(activity); }}
                >
                  {isSelected(activity.id) ? <CheckCircle2 size={18} /> : <PlusCircle size={18} />}
                  {isSelected(activity.id) ? 'Added to Trip' : 'Add to Trip'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && !apiError && filtered.length === 0 && (
          <div className="empty-state">
            <Compass className="empty-icon" />
            <h3>No activities in this category</h3>
            <p>Try selecting a different tab</p>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="bottom-bar">
        <div className="bar-summary">
          {selectedCount > 0 ? (
            <>
              <CheckCircle2 size={18} />
              <span>{selectedCount} activit{selectedCount === 1 ? 'y' : 'ies'} selected</span>
              <span className="bar-price">₹{formatInr(totalActivitiesCost)}</span>
            </>
          ) : (
            <span className="bar-hint">Skip or select activities to enhance your trip</span>
          )}
        </div>
        <div className="bar-actions">
          <Link to="/step3" className="btn-back">
            <ArrowLeft size={18} /> Back
          </Link>
          <button className="btn-continue" onClick={handleContinue}>
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

