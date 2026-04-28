import Link from 'next/link'

export default function ExtensionPage() {
  const steps = [
    {
      num: '1',
      title: 'Download the extension',
      desc: 'Download the Kart Finder extension ZIP file below and unzip it to a folder on your computer.',
    },
    {
      num: '2',
      title: 'Open Chrome Extensions',
      desc: 'In Chrome, go to chrome://extensions or click the three-dot menu → Extensions → Manage Extensions.',
    },
    {
      num: '3',
      title: 'Enable Developer Mode',
      desc: 'Toggle "Developer mode" in the top right corner of the Extensions page.',
    },
    {
      num: '4',
      title: 'Load the extension',
      desc: 'Click "Load unpacked" and select the unzipped Kart Finder extension folder.',
    },
    {
      num: '5',
      title: 'Sign in',
      desc: 'Click the Kart Finder icon in your browser toolbar. Sign in with your Kart Finder account.',
    },
    {
      num: '6',
      title: 'Start saving!',
      desc: 'Go to any Amazon, Flipkart, or Meesho product page and click the Kart Finder icon to save instantly.',
    },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browser Extension</h1>
        <p className="text-gray-500 text-sm mt-1">Save products with one click while you browse Amazon, Flipkart & Meesho</p>
      </div>

      {/* Demo card */}
      <div className="card p-6 mb-8 bg-gradient-to-br from-brand-50 to-orange-50 border-brand-100">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🧩</div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">How it works</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Browse any product on Amazon, Flipkart, or Meesho. Click the Kart Finder icon in your browser.
              The extension automatically reads the product name, price, and image — you just pick a wishlist
              and click Save. Done in one second.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-8">
        {steps.map(step => (
          <div key={step.num} className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
              {step.num}
            </div>
            <div>
              <p className="font-medium text-gray-900">{step.title}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Download */}
      <div className="card p-5 text-center">
        <div className="text-3xl mb-2">📦</div>
        <p className="font-semibold text-gray-900 mb-1">Download Kart Finder Extension</p>
        <p className="text-sm text-gray-500 mb-4">Works on Chrome, Edge, and Brave</p>
        <a
          href="/kart-finder-extension.zip"
          download
          className="btn-primary inline-block px-6"
        >
          Download Extension ZIP
        </a>
        <p className="text-xs text-gray-400 mt-3">
          Chrome Web Store listing coming soon. For now, install manually using the steps above.
        </p>
      </div>

      <div className="mt-6 card p-4">
        <p className="text-sm font-medium text-gray-700 mb-1">⚠️ Note for developers</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Before using the extension, open <code className="bg-gray-100 px-1 rounded">extension/popup.js</code> and
          replace <code className="bg-gray-100 px-1 rounded">YOUR_SUPABASE_URL</code> and{' '}
          <code className="bg-gray-100 px-1 rounded">YOUR_SUPABASE_ANON_KEY</code> with your actual Supabase credentials.
          Also update <code className="bg-gray-100 px-1 rounded">APP_URL</code> to your deployed domain.
        </p>
      </div>
    </div>
  )
}
