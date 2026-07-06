import React, { useState } from "react";
import {
  Plane,
  MapPin,
  Calendar,
  Users,
  Search,
  Phone,
  User,
  ArrowRight,
  Hotel,
  Compass,
  Package,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = ["Home", "Destinations", "Tours", "Flights", "Hotels", "Blog", "About Us"];

const BOOKING_TABS = [
  { key: "flights", label: "Flights", icon: Plane , path:'/',  },
  { key: "hotels", label: "Hotels", icon: Hotel , path:'/hotel' ,},
  { key: "tours", label: "Tours", icon: Compass , path: '/step4',  },
  { key: "packages", label: "Packages", icon: Package , path:'/step' },
];

/* ------------------------------------------------------------------ */
/*  Header                                                              */
/* ------------------------------------------------------------------ */

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <a href="#" className="flex items-center gap-2">
        <Plane className="h-7 w-7 -rotate-45 text-blue-600" />
        <span>
          <span className="block font-serif text-xl font-bold italic text-slate-800">
            Wanderly
          </span>
          <span className="block text-[9px] font-semibold tracking-[0.2em] text-slate-400">
            TRAVEL THE WORLD
          </span>
        </span>
      </a>

      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
        {NAV_LINKS.map((link, i) => (
          <a
            key={link}
            href="#"
            className={`pb-1 transition hover:text-blue-600 ${
              i === 0 ? "border-b-2 border-blue-600 text-blue-600" : ""
            }`}
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-4 md:flex">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
            <Phone className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-xs text-slate-400">Need Help?</span>
            <span className="block font-semibold text-slate-700">
              +1 234 567 8900
            </span>
          </span>
        </div>
        <button
          aria-label="Account"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-600 hover:text-blue-600"
        >
          <User className="h-4 w-4" />
        </button>
      </div>

      <button
        className="text-slate-600 lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span className="block h-0.5 w-6 bg-current mb-1.5" />
        <span className="block h-0.5 w-6 bg-current mb-1.5" />
        <span className="block h-0.5 w-6 bg-current" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full flex flex-col gap-3 bg-white p-6 shadow-lg lg:hidden">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="text-sm font-medium text-slate-600">
              {link}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Booking widget (floating search card)                              */
/* ------------------------------------------------------------------ */

 

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

 export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-24 pt-6 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600">
            <Plane className="h-3.5 w-3.5" /> EXPLORE. DREAM. DISCOVER.
          </span>
          <h1 className="font-serif text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Discover Amazing
            <br />
            <span className="font-serif italic text-blue-600">
              Places with Us
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-500 sm:text-base">
            Find the best tours, hotels and flights: everything you need for
            the perfect trip.
          </p>
          <button className="mt-6 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
            Explore Now <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-64 overflow-hidden rounded-2xl shadow-xl sm:h-80 lg:h-96">
          <img
            src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80"
            alt="Santorini blue-domed churches over the sea"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

  
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Combined export                                                     */
/* ------------------------------------------------------------------ */

export default function headerHero() {
  return (
    <div className="bg-white">
      <Header />
      <Hero />
    </div>
  );
}
