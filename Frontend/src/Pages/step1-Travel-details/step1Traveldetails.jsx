import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowRight,
  ArrowLeftRight,
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  Users,
  Minus,
  Plus,
  MapPin,
  Star,
  ExternalLink,
  Quote,
} from 'lucide-react';

import StepProgress from '../../Components/stepProgress';
import { step1Schema } from '../../Schema/travelDetailsSchema';
import { setTravelDetails } from '../../Store/slices/travelSlice';
import { createTravelDetails } from '../../Models/travel.model';
import { LOCATIONS } from '../../constants/locations';
import { todayISO } from '../../utils/dateHelpers';

const CITIES_DATALIST_ID = 'holiday-infinite-cities';

const TRENDING_DESTINATIONS = [
  {
    name: 'Olhuveli Resort',
    place: 'Male, Maldives',
    rating: '4.9',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU75QCgiLdFiEEtu0Kf1ax1g_iHB_J0DDtu8ZhyO1aMQlc9pxd9hxM7XPru8tez38YRcXtOp8HvtgJ5ArQtdUAntePKzGMpukDqw3iXQ44mFnMgk4Kjpfwhma3i_MyO-5RKvMTcsAFI1vGGsOily25ftU_OVNcPWipGAP6AHy5a9Jk-EtqtwJqtfLITCmltTg_ouRmeyNvWmXWnHWjBEv8IKz5iLAmPBS_n7GhjPMNjd4Q60jJ1yU7V-Ac5yURiB_k3CMYPld7h3Ry',
  },
  {
    name: 'Sigiriya Rock',
    place: 'Matale, Sri Lanka',
    rating: '4.8',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-LntWtILCN4EZaj0k4P9zCriQywuqDFlTPwh7fa1eXF-KWHDmDVFOGc-VrV-kltJL9WOOnvJAcXvPF-2gMNbbkIjkVFtX9kmWZt_cL0N8Mv0V_inWEOIRF4113P15Imjdg2pZ6RdaH50Ad06dGWAeuWU0b0KdJXZLtMvkCqwIis1pytNBng6N3fUqqIz8LbYE3MbBiN0__5R660CpgW-5FIXxBZC_oodnfYR0_XEpceDo1E1jr5-adn16h-IyNGHvdKPX_6mKDhWl',
  },
  {
    name: 'Grand Canal',
    place: 'Venice, Italy',
    rating: '4.7',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2NUHdnG74OCIiekmVeXRQsSOnzMEFlVgCOeiUD9_dzYT7FiIG_v9QtI7NRzNgd5kSqZPw4THKprGVFaVfqwvAc6OsowATD4MS2oiV1DviqCR8xhpFFK1kA2mdtqfM5g_sDLxD-e3yXBFEjopPEmg_pV0ooPB2vJoFi-92iBN3N08-NJfF9kP7AZ1UxtteavRXeQ4HwYGvrdf7lsqpm_3xsmGsEyW5DRz7KY-MIynLfs8noX9uKnPyTfa6fVI-rCLsXdi3xvC2XIIe',
  },
];

// Reused for both text-style inputs (name/email/from/to) so the outlined-input
// look defined in the SCSS (border, focus ring, error state) lives in one place.
function TextField({ label, required, optional, icon, error, ...inputProps }) {
  return (
    <div className="flex flex-col">
      <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-[#434656] mb-1">
        {icon}
        {label}
        {required && <span className="text-[#ef5350]">*</span>}
        {optional && (
          <span className="text-[10px] font-normal bg-[#eceef0] rounded-lg px-1.5 py-0.5 normal-case tracking-normal">
            Optional
          </span>
        )}
      </label>
      <input
        {...inputProps}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#191c1e] placeholder:text-[#434656]/60 outline-none transition-colors focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/15 ${
          error ? 'border-[#ba1a1a]' : 'border-[#c3c5d9]/70'
        }`}
      />
      {error && <span className="mt-1 text-xs text-[#ba1a1a]">{error.message}</span>}
    </div>
  );
}

export default function Step1TravelDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const today = todayISO();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      email: '',
      from: '',
      to: '',
      departureDate: '',
      returnDate: '',
      travelers: 1,
    },
  });

  const departureDate = watch('departureDate');
  const travelers = watch('travelers');
  const minReturnDate = departureDate || today;

  const increment = () => setValue('travelers', Math.min(20, Number(travelers) + 1), { shouldValidate: true });
  const decrement = () => setValue('travelers', Math.max(1, Number(travelers) - 1), { shouldValidate: true });

  const swapLocations = () => {
    const from = watch('from');
    const to = watch('to');
    setValue('from', to, { shouldValidate: true });
    setValue('to', from, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    const hasReturn = !!data.returnDate;
    dispatch(
      setTravelDetails(
        createTravelDetails({
          name: data.name,
          email: data.email,
          tripType: hasReturn ? 'round-trip' : 'one-way',
          from: data.from,
          to: data.to,
          departureDate: new Date(data.departureDate).toISOString(),
          returnDate: hasReturn ? new Date(data.returnDate).toISOString() : '',
          travelers: data.travelers,
          travelClass: 'economy',
        })
      )
    );
    navigate('/step2');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-['Hanken_Grotesk','Inter',sans-serif]">
      <StepProgress currentStep={1} />

      {/* Shared autocomplete source for origin/destination — see constants/locations.js */}
      <datalist id={CITIES_DATALIST_ID}>
        {LOCATIONS.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <main className="max-w-[1280px] mx-auto px-10 pt-12 pb-16">
        {/* ── Page Title ─────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-[32px] md:text-5xl leading-tight font-bold tracking-tight mb-2">
            Plan Your Next Adventure
          </h1>
          <p className="text-lg leading-7 text-[#434656] max-w-2xl">
            Complete the details below to begin your journey through the clouds. We&apos;ll handle the
            logistics while you prepare for the magic.
          </p>
        </div>

        {/* ── Split Card ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl overflow-hidden border border-[#c3c5d9]/40 shadow-sm mb-12">
          {/* Left: Form panel */}
          <div className="px-6 md:px-12 py-10 flex flex-col justify-center">
            <div className="mb-7">
              <span className="block font-mono text-xs font-medium tracking-widest uppercase text-[#003ec7] mb-1.5">
                Step 1 of 5
              </span>
              <h2 className="text-2xl font-semibold">Traveler Information</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label="Full Name" required placeholder="John Doe" error={errors.name} {...register('name')} />
                <TextField
                  label="Email Address"
                  required
                  type="email"
                  placeholder="john@example.com"
                  error={errors.email}
                  {...register('email')}
                />
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <TextField
                  label="Origin"
                  required
                  icon={<PlaneTakeoff className="w-[15px] h-[15px]" />}
                  placeholder="e.g. Mumbai"
                  list={CITIES_DATALIST_ID}
                  autoComplete="off"
                  error={errors.from}
                  {...register('from')}
                />
                <button
                  type="button"
                  onClick={swapLocations}
                  title="Swap"
                  className="self-start md:self-auto mt-0 md:mt-4 w-10 h-10 rounded-full border-[1.5px] border-[#c3c5d9] bg-white text-[#434656] flex items-center justify-center transition-colors hover:bg-[#003ec7] hover:text-white hover:border-[#003ec7]"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <TextField
                  label="Destination"
                  required
                  icon={<PlaneLanding className="w-[15px] h-[15px]" />}
                  placeholder="e.g. London"
                  list={CITIES_DATALIST_ID}
                  autoComplete="off"
                  error={errors.to}
                  {...register('to')}
                />
              </div>

              {/* Travel Date & Return Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Travel Date"
                  required
                  type="date"
                  min={today}
                  icon={<CalendarDays className="w-[15px] h-[15px]" />}
                  error={errors.departureDate}
                  {...register('departureDate')}
                />
                <TextField
                  label="Return Date"
                  optional
                  type="date"
                  min={minReturnDate}
                  icon={<CalendarDays className="w-[15px] h-[15px]" />}
                  error={errors.returnDate}
                  {...register('returnDate')}
                />
              </div>

              {/* Travelers stepper */}
              <div className="w-full">
                <label className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-[#434656] mb-1">
                  <Users className="w-[15px] h-[15px]" />
                  Number of Travelers <span className="text-[#ef5350]">*</span>
                </label>
                <div className="inline-flex items-center border border-[#c3c5d9]/60 rounded bg-white w-fit">
                  <button
                    type="button"
                    onClick={decrement}
                    className="px-4 py-2 border-r border-[#c3c5d9]/60 text-[#434656] hover:bg-[#eceef0] transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-12 text-base font-bold min-w-[56px] text-center">
                    {String(travelers).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={increment}
                    className="px-4 py-2 border-l border-[#c3c5d9]/60 text-[#434656] hover:bg-[#eceef0] transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {errors.travelers && <span className="mt-1 block text-xs text-[#ba1a1a]">{errors.travelers.message}</span>}
              </div>

              {/* Continue button */}
              <div className="mt-7">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-10 py-3 bg-[#0052ff] text-white rounded-lg text-base font-bold transition-opacity hover:opacity-90"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Right: Hero panel */}
          <div className="relative min-h-[300px] lg:min-h-[400px]">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8XfdvKjrb8RI00T8LEyIVd9g0di7RCxmC79pg6Y2ICpWjG56YhDUpZ8aXZzf6D0EpdtahsrjP37P6gujVH-weVGKLG7TmteYnbv9ql96mPP0i1hyn8ArPUFUF1dkX88w7m_OU-XnERvFXFXwQX2MHYCL6Lw-vOceIMVN9z_Ph8m4kXpzLOvDBUoVTcZLSatWZgkqI97NoDKfQ-QRT1Go6NhEynYpLZGnJzine189RT2u6rBNuozigtkAEdG4_BES8ysCON4A3eKZK"
              alt="Passenger jet flying above clouds at golden hour"
            />
            <div
              className="absolute inset-0 flex items-end p-8 lg:p-12"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,62,199,0.82) 0%, rgba(0,62,199,0.18) 55%, transparent 100%)',
              }}
            >
              <div className="max-w-[400px]">
                <Quote className="w-12 h-12 text-[#0ea5e9] mb-3" />
                <blockquote className="text-2xl leading-8 font-semibold italic text-white mb-3">
                  &ldquo;The world is a book and those who do not travel read only one page.&rdquo;
                </blockquote>
                <cite className="font-mono text-xs tracking-wide uppercase text-[#0ea5e9] not-italic">
                  — Saint Augustine
                </cite>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trending Destinations ────────────────────────────────────── */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-semibold mb-1">Trending Destinations</h3>
              <p className="text-sm text-[#434656]">Curated experiences from around the globe</p>
            </div>
            <button className="inline-flex items-center gap-1 text-[#003ec7] text-sm font-bold hover:underline">
              View all <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRENDING_DESTINATIONS.map((dest) => (
              <div
                key={dest.name}
                className="group bg-white border border-[#c3c5d9]/40 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={dest.img}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/92 backdrop-blur-sm px-2 py-1 rounded text-sm font-bold flex items-center gap-1 shadow">
                    <Star className="w-4 h-4 text-[#f59e0b]" fill="#f59e0b" />
                    {dest.rating}
                  </div>
                </div>
                <div className="px-4 pt-3 pb-4">
                  <h4 className="text-base font-bold mb-1.5">{dest.name}</h4>
                  <span className="flex items-center gap-1 text-sm text-[#434656]">
                    <MapPin className="w-4 h-4" />
                    {dest.place}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
