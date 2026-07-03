// ── Small shared icon (used only inside Hero's floating card) ──────────────
const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

/**
 * Header + Hero section, reusable across pages.
 *
 * Usage:
 *   <HeaderHero onBookClick={scrollToBooking} />
 *
 * `onBookClick` is called when either the header "Book Trip" button
 * or the hero's "Book A Trip Now" button is clicked — typically used
 * to scroll to a booking form section further down the page.
 */
export default function HeaderHero({ onBookClick }) {
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter uppercase">Holiday Infinite</div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-wide">
          <a className="hover:text-blue-600 transition-colors" href="#">Package</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Contact</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Home</a>
          <a className="hover:text-blue-600 transition-colors" href="#">Tour</a>
          <a className="hover:text-blue-600 transition-colors" href="#">About</a>
        </nav>
        <button
          type="button"
          onClick={onBookClick}
          className="bg-zinc-900 text-white px-8 py-3 rounded-full text-sm font-bold uppercase hover:bg-zinc-800 transition-all"
        >
          Book Trip
        </button>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <div
          className="relative w-full h-[600px] rounded-[4rem] overflow-hidden bg-cover bg-center flex items-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbB27YDmP37x3lveHV65AWVsXma1AraFGuf63ZoPqVnck1AI0QE2i6HK_ZCORzjcq44vKdaRGG2SJJEnXkARSWsmUniQbDzO1lNn5SF36otXugUn-wKsAsUZAdnQpgEy-bJdNln4qAZhL4pqfRNLNmFlujnFBfBSSmZyOsg4uh0j3ifSpclA5a-UfBbu5yRewXKs0bxy0tw01UmfdyWrp0JqJ4G2BAKSmgDvbBW2YA517QExNRRLQPfaACwHwJ02dfqgbwG0qasjRZ')",
            backgroundPosition: 'center center',
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 px-12 lg:px-24 w-full">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-slate-700">
                Elevet Your Travel Journy
              </p>
              <h1
                className="mb-8"
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 900,
                  fontSize: '42px',
                  color: '#0A1633',
                  lineHeight: 0.95,
                  letterSpacing: '-1px',
                  maxWidth: '420px',
                }}
              >
                Experience<br />The Magic Of<br />Flight !
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={onBookClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                >
                  Book A Trip Now
                </button>
                <button type="button" className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-blue-600 border-b-[8px] border-b-transparent ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold shadow-sm border border-slate-200">1</div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-300">2</div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold shadow-sm border border-slate-300">3</div>
          </div>

          {/* Floating stats card */}
          <div className="absolute right-12 bottom-12 bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-xl flex items-center space-x-6">
            <div className="flex items-center -space-x-4">
              <img alt="Destination 1" className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA3LweAKfcM9FgSn82QSFyT3dsqTkrOPL15OTBmVUGVjoo7ilrMcxUEV3nQEagtUI6sEUJAv3gRT-EZOf1q8Fv-CBJQtT-p_60vflX1m76Axc6A15kHgvx_AfEavweRSWWzpK9JOy8h6dfZHY_A77uS8axk7QMKkLccPaZ-Fz3fPmkkGDsl67nalpGUXPf4Sl0HHp1aNYMYP_3nK1Hmu6QlazuZUF3ewNkY6JBdKasqlBFjU1yqBd1spl08vB6nWAqI3axyvVRYg" />
              <img alt="Destination 2" className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZhNFfOeCnyTnjbR5GGWfNdO7ljKaAdxIOw9miu_indhg0MufbbdxoTc7qsKn_bkgyaRR6mrb1FrP4GxJZ2NUI3h2RLyTAkXbVsEREDOzs2oNGOafuxZOaLpSA7x3AEvu1grNTTqCAPQ96FX-z0SOe6tqtKC9PRQN_bp7MCFGl-WQ8_ICpUvrkDaSz369J8xAvrE59zlWbw2SZwz9H1hcuVXZdMvOu3cr6-vCaUYdJv9S2G1UN-57eD1snfVVQSTbQ4ryLwUP3JQ" />
              <img alt="Destination 3" className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALP5kteIZXtfMu99hfOPSGsbHpA1dc1LSadp6bIq11kfAsKQwYUusgTE-CAEiJjStVtNY9c1Zs-Ha0R7zyIPiEcU31nUMvnOfjsZiA5WxWMhIERHBcOcj7rvdfDLd8p2tjxEPw85TA-TbYnX2ylF3VoTXYcHz3I2Hcssm5P79HSpIDeYVFm9Ty64TbUKZM0Z7aeUSkHF6YjkaJQrAh_P9fPPein0vqYw6oBDJBPRnOrNzug9uU032-ycc4uutS-_FKN4qpleMNJA" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Awesome Places</h4>
              <p className="text-[10px] text-slate-500">Discover The World One<br />Adventure At A Time</p>
            </div>
            <div className="bg-zinc-100 px-4 py-3 rounded-2xl flex items-center space-x-2">
              <span className="text-sm font-bold">Know More</span>
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}