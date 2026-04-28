import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          <span className="text-xl font-bold text-gray-900">Kart Finder</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/auth/signup" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          ✨ One app for all your wishlists
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Save products from<br />
          <span className="text-brand-500">any shopping app</span> in one place
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Amazon, Flipkart, Meesho — save with one click, track prices, get alerts when they drop, and share wishlists with anyone.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup" className="btn-primary text-base px-6 py-3">
            Start for free →
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base px-6 py-3">
            Sign in
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Free forever. No credit card needed.</p>
      </section>

      {/* Platform logos */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest font-medium">Works with</p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {[
              { name: 'Amazon', emoji: '📦', color: 'text-amber-600' },
              { name: 'Flipkart', emoji: '🛒', color: 'text-blue-600' },
              { name: 'Meesho', emoji: '🎀', color: 'text-red-500' },
              { name: 'Any store', emoji: '🌐', color: 'text-gray-500' },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <span className={`font-semibold text-lg ${p.color}`}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">Everything in one place</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '⚡',
              title: 'One-click save',
              desc: 'Install our Chrome extension. Browse Amazon or Flipkart. Click once to save any product — without leaving the page.',
            },
            {
              icon: '📉',
              title: 'Price drop alerts',
              desc: 'Set your target price. We check daily and send you an email the moment the price drops below it.',
            },
            {
              icon: '🔗',
              title: 'Share wishlists',
              desc: 'Create a public wishlist and share the link. Perfect for birthdays, festivals, and gift planning.',
            },
            {
              icon: '📊',
              title: 'Price history',
              desc: 'See how the price has changed over time with a chart. Know if it\'s actually a good deal.',
            },
            {
              icon: '🗂️',
              title: 'Multiple wishlists',
              desc: 'Organize by category — Electronics, Home, Fashion. Keep everything tidy.',
            },
            {
              icon: '💰',
              title: 'Total tracker',
              desc: 'See your total wishlist value across all platforms. Know your potential spend at a glance.',
            },
          ].map(f => (
            <div key={f.title} className="card p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-500 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to track smarter?</h2>
        <p className="text-brand-100 mb-8">Join thousands of smart shoppers saving money with Kart Finder.</p>
        <Link href="/auth/signup" className="bg-white text-brand-600 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors">
          Create free account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400">
        <p>© 2025 Kart Finder. Built for smart shoppers.</p>
      </footer>
    </main>
  )
}
