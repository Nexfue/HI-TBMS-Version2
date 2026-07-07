import React, { useState } from "react";
import {
  MapPin,
  Tag,
  Headphones,
  ShieldCheck,
  Award,
  Globe,
  ThumbsUp,
  CreditCard,
  Percent,
  Send,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Social icons (lucide-react no longer ships brand icons, so these   */
/*  are small inline SVGs to avoid an extra dependency)                */
/* ------------------------------------------------------------------ */

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.5c0-.87.24-1.46 1.5-1.46h1.6V4.35C16.3 4.24 15.4 4.15 14.35 4.15c-2.4 0-4.05 1.46-4.05 4.15V10.5H7.8v3h2.5V21h3.2Z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21 5.9c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.2 1.6-2.1-.7.4-1.6.8-2.4 1a3.8 3.8 0 0 0-6.5 3.5A10.8 10.8 0 0 1 3.9 4.9a3.8 3.8 0 0 0 1.2 5.1c-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.4 3.1 3.8-.6.2-1.2.2-1.8.1.5 1.5 2 2.7 3.7 2.7A7.6 7.6 0 0 1 2.9 18a10.8 10.8 0 0 0 5.8 1.7c7 0 10.8-5.8 10.8-10.8v-.5c.8-.5 1.4-1.2 1.9-2Z" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
    <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: Tag,
    title: "Best Price Guarantee",
    desc: "We ensure you get the best deals always.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    desc: "We're here to help you anytime, anywhere.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Bookings",
    desc: "Your data and payments are 100% safe with us.",
  },
  {
    icon: Award,
    title: "Handpicked Experiences",
    desc: "Curated tours and hotels for unforgettable trips.",
  },
];

const DESTINATIONS = [
  {
    name: "Thailand",
    place: "Phuket",
    price: "$699",
    tag: "Bestseller",
    tagColor: "bg-emerald-500",
    img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "France",
    place: "Paris",
    price: "$799",
    tag: "Popular",
    tagColor: "bg-rose-500",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Bali, Indonesia",
    place: "Ubud",
    price: "$599",
    tag: "Trending",
    tagColor: "bg-blue-500",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Dubai, UAE",
    place: "Dubai",
    price: "$899",
    tag: "Bestseller",
    tagColor: "bg-emerald-500",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=500&q=80",
  },
];

const WHY_CHOOSE = [
  {
    icon: Globe,
    title: "Wide Range of Choices",
    desc: "Choose from thousands of flights, hotels and tours worldwide.",
  },
  {
    icon: ThumbsUp,
    title: "Trusted by Travelers",
    desc: "Join millions of happy travelers around the world.",
  },
  {
    icon: CreditCard,
    title: "Flexible & Easy Booking",
    desc: "Book with ease and adjust your plans if needed.",
  },
  {
    icon: Percent,
    title: "Exclusive Deals",
    desc: "Get access to exclusive discounts and special offers.",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub components                                                      */
/* ------------------------------------------------------------------ */

function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-24">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PopularDestinations() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-serif text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Popular <span className="italic text-blue-600">Destinations</span>
        </h2>
        <button className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 sm:flex">
          View All Destinations <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DESTINATIONS.map((d) => (
          <div
            key={d.name}
            className="group relative aspect-[3/4] overflow-hidden rounded-xl"
          >
            <img
              src={d.img}
              alt={d.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span
              className={`absolute left-3 top-3 rounded-full ${d.tagColor} px-2.5 py-1 text-[10px] font-bold text-white`}
            >
              {d.tag}
            </span>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <p className="text-base font-bold">{d.name}</p>
                <p className="flex items-center gap-1 text-xs text-white/80">
                  <MapPin className="h-3 w-3" /> {d.place}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/70">From</p>
                <p className="text-lg font-extrabold">{d.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyChoose() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-8 font-serif text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Why Choose <span className="italic text-blue-600">Wanderly?</span>
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {WHY_CHOOSE.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {w.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">{w.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
            alt="Woman relaxing on a tropical beach"
            className="h-full min-h-[320px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/10 to-transparent" />
          <div className="absolute left-6 right-6 top-6 text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">
              Let's go!
            </span>
            <h3 className="mt-2 font-serif text-2xl font-extrabold leading-tight sm:text-3xl">
              Your Next Adventure Awaits!
            </h3>
            <p className="mt-3 max-w-xs text-sm text-white/85">
              Discover breathtaking places and create unforgettable memories.
            </p>
            <button className="mt-5 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
              Plan Your Trip <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <section className="px-6 pb-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-2xl bg-blue-700 px-8 py-8 text-white sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Send className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold">Subscribe to Our Newsletter</h3>
            <p className="text-xs text-blue-100">
              Get the latest travel deals and inspiration straight to your
              inbox.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-white p-1.5 sm:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full flex-1 rounded-full bg-transparent px-3 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button className="shrink-0 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
            Subscribe
          </button>
        </div>

        <div className="flex items-center gap-3">
          {[FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon].map(
            (Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
              >
                <Icon className="h-4 w-4" />
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                            */
/* ------------------------------------------------------------------ */

export default function TravelSections() {
  return (
    <div className="min-h-screen bg-white">
      <Features />
      <PopularDestinations />
      <WhyChoose />
      <Newsletter />
    </div>
  );
}
