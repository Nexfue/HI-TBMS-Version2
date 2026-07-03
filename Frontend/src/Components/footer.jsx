export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 py-20 border-t border-slate-200">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/4">
          <span className="inline-block px-6 py-2 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600">About Us</span>
        </div>
        <div className="md:w-3/4">
          <h3 className="text-2xl font-bold mb-10 leading-tight">
            Our Goal Is To Provide Seamless Flight Booking, Unbeatable Deals, And A Hassle-Free
            <br />
            Experience. Let Us Handle The Details While You Focus On Creating Unforgettable Memories.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-slate-500 leading-relaxed">
            <p>
              We believe travel should be simple, affordable, and stress-free. Our mission is to connect
              travelers with the best flight deals and seamless booking experiences. Whether you're planning
              a quick getaway or a long adventure, we're here to make your journey effortless.
            </p>
            <p>
              We are dedicated to making air travel more accessible and convenient for everyone. With our
              user-friendly platform, you can easily find and book flights that suit your schedule and
              budget. Let us handle the details while you focus on exploring new destinations and creating
              unforgettable memories.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-20 pt-10 flex flex-col md:flex-row items-center justify-between">
        <div className="text-blue-600 text-2xl">&#10022;</div>
        <div className="mt-8 md:mt-0 flex space-x-4">
          <div className="w-24 h-8 bg-slate-50 rounded-full" />
        </div>
      </div>
    </footer>
  );
}