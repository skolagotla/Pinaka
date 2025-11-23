/**
 * Custom Login Illustration Component
 * Professional property management themed illustration for Pinaka Admin
 * 
 * To use your own image instead:
 * 1. Place your image in /public/images/admin-login-illustration.svg (or .png, .jpg)
 * 2. Uncomment the <img> tag below and comment out the <svg> tag
 * 3. Update the src path to match your image location
 */

export default function LoginIllustration({ className = "", useCustomImage = false, imageSrc = "/images/admin-login-illustration.svg" }) {
  // Option 1: Use custom image (uncomment to use your own image)
  if (useCustomImage) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <img
          src={imageSrc}
          alt="Pinaka Admin Login"
          className="w-full h-auto max-w-2xl object-contain"
          onError={(e) => {
            // Fallback to SVG if image not found
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'block';
          }}
        />
        {/* Fallback SVG - hidden by default, shown if image fails to load */}
        <div style={{ display: 'none' }}>
          {renderSVG(className)}
        </div>
      </div>
    );
  }

  // Option 2: Use custom SVG illustration (default)
  return renderSVG(className);
}

function renderSVG(className = "") {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 1000 800"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Background shapes */}
        <rect width="1000" height="800" fill="url(#buildingGradient)" />
        
        {/* Modern building silhouette - Left */}
        <g opacity="0.25">
          <rect x="80" y="250" width="150" height="400" rx="10" fill="url(#primaryGradient)" />
          <rect x="105" y="310" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="150" y="310" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="195" y="310" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="105" y="360" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="150" y="360" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="195" y="360" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="105" y="410" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="150" y="410" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
          <rect x="195" y="410" width="30" height="30" rx="3" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Center building - Main focus */}
        <g>
          <rect x="350" y="200" width="220" height="450" rx="14" fill="url(#primaryGradient)" />
          <rect x="375" y="260" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="430" y="260" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="485" y="260" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="375" y="320" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="430" y="320" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="485" y="320" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="375" y="380" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="430" y="380" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="485" y="380" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="375" y="440" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="430" y="440" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="485" y="440" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="375" y="500" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="430" y="500" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          <rect x="485" y="500" width="40" height="40" rx="5" fill="#ffffff" opacity="0.75" />
          
          {/* Building entrance */}
          <rect x="420" y="580" width="80" height="70" rx="8" fill="#1e40af" />
          <rect x="440" y="600" width="40" height="50" rx="3" fill="#ffffff" opacity="0.95" />
        </g>

        {/* Right building */}
        <g opacity="0.3">
          <rect x="700" y="230" width="180" height="420" rx="12" fill="url(#accentGradient)" />
          <rect x="730" y="290" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="780" y="290" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="830" y="290" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="730" y="350" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="780" y="350" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="830" y="350" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="730" y="410" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="780" y="410" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="830" y="410" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="730" y="470" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="780" y="470" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
          <rect x="830" y="470" width="35" height="35" rx="4" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Property management icon - Floating above center */}
        <g transform="translate(500, 100)">
          <circle cx="0" cy="0" r="65" fill="url(#primaryGradient)" opacity="0.95" />
          <g transform="translate(-30, -30)">
            {/* Key icon representing property management */}
            <path
              d="M30 12C30 5.373 24.627 0 18 0C11.373 0 6 5.373 6 12C6 15 8 17.5 10.5 18.5L10.5 30L14 30L14 18.5C16.5 17.5 18.5 15 18.5 12C18.5 9.019 16.181 6.5 13.5 6.5C10.819 6.5 8.5 9.019 8.5 12C8.5 13.656 9.344 15 10.5 15C11.656 15 12.5 13.656 12.5 12C12.5 10.344 11.656 9 10.5 9C9.344 9 8.5 10.344 8.5 12"
              fill="#ffffff"
              transform="scale(1.8) translate(10, 10)"
            />
            <rect x="22" y="18" width="16" height="10" rx="2" fill="#ffffff" />
            <circle cx="30" cy="23" r="2.5" fill="#3b82f6" />
          </g>
        </g>

        {/* Decorative elements - Data visualization */}
        <g opacity="0.15">
          {/* Chart bars */}
          <rect x="120" y="580" width="25" height="100" rx="5" fill="#3b82f6" />
          <rect x="160" y="540" width="25" height="140" rx="5" fill="#60a5fa" />
          <rect x="200" y="560" width="25" height="120" rx="5" fill="#3b82f6" />
          
          {/* Growth arrow */}
          <path
            d="M800 580 L840 540 L880 580 L860 580 L860 620 L820 620 L820 580 Z"
            fill="#10b981"
            opacity="0.7"
          />
        </g>

        {/* Professional badge/shield - Top left */}
        <g transform="translate(200, 150)">
          <circle cx="0" cy="0" r="45" fill="url(#primaryGradient)" opacity="0.85" />
          <path
            d="M-18 -12 L0 -24 L18 -12 L18 12 L0 24 L-18 12 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>

        {/* Analytics icon - Top right */}
        <g transform="translate(850, 120)">
          <circle cx="0" cy="0" r="40" fill="url(#accentGradient)" opacity="0.8" />
          <g transform="translate(-15, -15)">
            <rect x="10" y="20" width="4" height="8" rx="1" fill="#ffffff" />
            <rect x="16" y="16" width="4" height="12" rx="1" fill="#ffffff" />
            <rect x="22" y="12" width="4" height="16" rx="1" fill="#ffffff" />
          </g>
        </g>
      </svg>
    </div>
  );
}

