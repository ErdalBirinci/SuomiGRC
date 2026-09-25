import React from 'react';

interface PlatformLogoProps {
  platformId?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
  xl: 'w-11 h-11',
  '2xl': 'w-14 h-14',
};

/**
 * SuomiGRC Brand Logo Mark (Nordic Shield + Faceted S-Curve & Core Beacon)
 */
export const SuomiGrcLogoMark: React.FC<{
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}> = ({ className = '', size = 'md' }) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} ${className} shrink-0`}
      aria-label="suomiGRC Logo"
    >
      <defs>
        <linearGradient id="suomiShieldBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="50%" stopColor="#002F6C" />
          <stop offset="100%" stopColor="#0052CC" />
        </linearGradient>
        <linearGradient id="suomiAurora" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="suomiFacet" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>
      </defs>

      {/* Outer Rounded Container */}
      <rect width="40" height="40" rx="10" fill="url(#suomiShieldBg)" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="#38BDF8" strokeOpacity="0.3" strokeWidth="1" />

      {/* Nordic Security Shield Outline */}
      <path
        d="M20 7L29 11.8V19.5C29 26.5 25 31 20 33C15 31 11 26.5 11 19.5V11.8L20 7Z"
        stroke="url(#suomiAurora)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="#080E1E"
        fillOpacity="0.7"
      />

      {/* Stylized Interlocking Geometric 'S' Path */}
      <path
        d="M25 14C25 14 22.8 11.8 19.5 11.8C16 11.8 14.5 14 14.5 16.5C14.5 19.5 18 20.8 21.2 22C24.5 23.2 26 25 26 28C26 31 23.2 33 19.5 33C15.5 33 13.5 30 13.5 30"
        stroke="url(#suomiFacet)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Verification Beacon */}
      <circle cx="20" cy="22" r="2.2" fill="#00D2FF" />
      <circle cx="20" cy="22" r="0.9" fill="#FFFFFF" />
    </svg>
  );
};

/**
 * SuomiGRC Full Wordmark & Brand Badge
 */
export const SuomiGrcWordmark: React.FC<{
  className?: string;
  textClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}> = ({
  className = '',
  textClassName = 'text-slate-900',
  size = 'md',
  showSubtitle = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <SuomiGrcLogoMark size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-base font-sans ${textClassName}`}>
            suomi
          </span>
          <span className="bg-gradient-to-r from-[#0052CC] to-[#0284C7] text-white font-mono font-extrabold text-[11px] px-1.5 py-0.5 rounded tracking-wider shadow-2xs">
            GRC
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-medium text-slate-400 tracking-wide mt-0.5 uppercase">
            Continuous Assurance
          </span>
        )}
      </div>
    </div>
  );
};

// Aliases for backward compatibility
export const VantaLogoMark = SuomiGrcLogoMark;
export const VantaWordmark = SuomiGrcWordmark;

export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  platformId = '',
  name = '',
  className = '',
  size = 'md',
}) => {
  const normalizedKey = (platformId || name).toLowerCase().replace(/[^a-z0-9]/g, '');

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // 1. Amazon Web Services (AWS)
  if (normalizedKey.includes('aws') || normalizedKey.includes('amazon')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="AWS Logo"
      >
        <rect width="32" height="32" rx="6" fill="#232F3E" />
        {/* 'a' */}
        <path
          d="M9.8 17.6c-.6 0-1-.2-1.3-.5-.3-.3-.4-.8-.4-1.4 0-1.3.8-2.1 2.3-2.3l1.8-.2v-.4c0-.8-.4-1.2-1.2-1.2-.6 0-1.2.2-1.8.5l-.4-.9c.7-.4 1.5-.6 2.3-.6 1.4 0 2.2.8 2.2 2.1v4.3h-1.1v-1c-.5.8-1.3 1.1-2.1 1.1zm.2-.9c.5 0 .9-.2 1.2-.5.3-.4.5-.8.5-1.4v-.8l-1.6.2c-.9.1-1.3.6-1.3 1.4 0 .7.4 1.1 1.2 1.1z"
          fill="#FFFFFF"
        />
        {/* 'w' */}
        <path
          d="M15.5 17.5l-1.5-6.2h1.1l1 4.5.9-4.5h1.1l.9 4.5 1-4.5h1.1l-1.5 6.2h-1.1l-1-4.7-1 4.7h-1.1z"
          fill="#FFFFFF"
        />
        {/* 's' */}
        <path
          d="M23.3 17.6c-.8 0-1.5-.2-2-.6l.4-.9c.4.3 1 .5 1.6.5.7 0 1.1-.3 1.1-.7 0-.2-.1-.4-.3-.5-.1-.1-.4-.2-.8-.3-.8-.2-1.3-.5-1.6-.8-.3-.3-.4-.7-.4-1.2 0-.6.2-1 .6-1.4.4-.4 1-.6 1.7-.6.6 0 1.2.1 1.7.4l-.4.9c-.4-.2-.8-.4-1.3-.4-.6 0-1 .2-1 .6 0 .2.1.4.3.5.2.1.4.2.8.3.8.2 1.3.4 1.6.8.3.3.5.8.5 1.3 0 .6-.2 1.1-.6 1.5-.5.4-1.1.7-1.8.7z"
          fill="#FFFFFF"
        />
        {/* AWS Smile Arrow */}
        <path
          d="M25.4 20.8c-2.8 2.1-6.8 3.2-10.3 3.2-4.9 0-9.2-1.9-12.1-5.1-.2-.2 0-.5.3-.3 3.1 1.8 7 2.9 11.2 2.9 3.5 0 7.3-.9 10.6-2.9.4-.2.7.2.3.5z"
          fill="#FF9900"
        />
        <path
          d="M26.2 19.5c-.4-.5-2.4-.2-3.3 0-.3 0-.3-.3 0-.5 1.8-1.2 3.8-.9 4.2-.4.4.5 0 2.5-1.7 3.9-.3.2-.5.1-.4-.2.4-.8 1.4-2.4 1.2-2.8z"
          fill="#FF9900"
        />
      </svg>
    );
  }

  // 2. Google Cloud Platform (GCP)
  if (normalizedKey.includes('gcp') || normalizedKey.includes('googlecloud')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Google Cloud Logo"
      >
        <rect width="32" height="32" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <path
          d="M19.7 11.4c-.6 0-1.2.1-1.8.4-.7-1.4-2.1-2.3-3.7-2.3-2 0-3.7 1.4-4.2 3.3-.4-.1-.8-.2-1.2-.2-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8h10.9c2 0 3.6-1.6 3.6-3.6 0-1.9-1.5-3.5-3.4-3.6-.1-.9-.7-1.6-1.4-1.6z"
          fill="#4285F4"
        />
        <path
          d="M8.8 16.4c0-.2 0-.4.1-.6l-2.4-1.4c-.3.6-.5 1.3-.5 2 0 1.9 1.4 3.5 3.2 3.8l.5-2.7c-.5-.2-.9-.6-.9-1.1z"
          fill="#EA4335"
        />
        <path
          d="M14.2 9.5c-.8 0-1.5.2-2.1.6l1.4 2.4c.2-.1.5-.2.7-.2 1.3 0 2.3.9 2.5 2.1l2.7-.4c-.4-2.6-2.6-4.5-5.2-4.5z"
          fill="#FBBC04"
        />
        <path
          d="M19.7 20.2H8.8c.2.8.9 1.4 1.8 1.4h9.1c1.5 0 2.7-1.2 2.7-2.7 0-.5-.1-.9-.4-1.3l-2.2 1.5c-.1.7-.6 1.1-.1 1.1z"
          fill="#34A853"
        />
      </svg>
    );
  }

  // 3. Okta Identity Cloud
  if (normalizedKey.includes('okta')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Okta Logo"
      >
        <rect width="32" height="32" rx="6" fill="#00297A" />
        <circle cx="16" cy="16" r="8.5" fill="#007DC1" />
        <circle cx="16" cy="16" r="4.8" fill="#00297A" />
      </svg>
    );
  }

  // 4. Google Workspace
  if (
    normalizedKey.includes('googleworkspace') ||
    normalizedKey.includes('workspace') ||
    normalizedKey.includes('gsuite')
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Google Workspace Logo"
      >
        <rect width="32" height="32" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        {/* Google Workspace Multi-color W mark */}
        <path d="M7 11.5l3.5 9h3l-3-8h-3.5z" fill="#4285F4" />
        <path d="M10.5 20.5l4-10.5h3.5l-4 10.5h-3.5z" fill="#EA4335" />
        <path d="M14.5 20.5l4-10.5h3.5l-4 10.5h-3.5z" fill="#FBBC04" />
        <path d="M18.5 11.5l3.5 9h3l-3-8h-3.5z" fill="#34A853" />
      </svg>
    );
  }

  // 5. GitHub
  if (normalizedKey.includes('github')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="GitHub Logo"
      >
        <rect width="32" height="32" rx="6" fill="#181717" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 7c-4.97 0-9 4.03-9 9 0 3.98 2.58 7.35 6.16 8.54.45.08.62-.2.62-.43v-1.52c-2.51.55-3.04-1.21-3.04-1.21-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.38 2.11.98 2.63.75.08-.58.31-.98.57-1.21-2-.23-4.11-1-4.11-4.46 0-.98.35-1.79.93-2.42-.09-.23-.4-1.15.09-2.39 0 0 .76-.24 2.48.93.72-.2 1.49-.3 2.26-.3.77 0 1.54.1 2.26.3 1.72-1.17 2.48-.93 2.48-.93.49 1.24.18 2.16.09 2.39.58.63.93 1.44.93 2.42 0 3.47-2.11 4.23-4.12 4.45.32.28.61.83.61 1.67v2.48c0 .24.16.52.62.43C22.42 23.35 25 19.98 25 16c0-4.97-4.03-9-9-9z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 6. Jamf Pro / Apple MDM
  if (normalizedKey.includes('jamf')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Jamf Logo"
      >
        <rect width="32" height="32" rx="6" fill="#1E232A" />
        {/* Jamf Iconic Diamond / Prism Flame */}
        <path d="M16 6.5l5.5 5.5-5.5 5.5-5.5-5.5L16 6.5z" fill="#EB5B39" />
        <path d="M21.5 12l4 4-5.5 5.5-4-4 5.5-5.5z" fill="#ED4659" />
        <path d="M10.5 12l4 4-5.5 5.5-4-4 5.5-5.5z" fill="#F27A23" />
        <path d="M16 17.5l5.5 5.5-5.5 5.5-5.5-5.5L16 17.5z" fill="#D83042" />
      </svg>
    );
  }

  // 7. CrowdStrike Falcon
  if (normalizedKey.includes('crowdstrike') || normalizedKey.includes('falcon')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="CrowdStrike Falcon Logo"
      >
        <rect width="32" height="32" rx="6" fill="#0D0D0D" />
        {/* CrowdStrike Soaring Falcon Silhouette in Brand Red */}
        <path
          d="M25 8.5c-3.2.8-7.8 3.5-10.2 6.5-1.9 2.4-3 5.4-3.8 8.5-.2.8.8 1.4 1.4.8 2.4-2.5 5.2-4.6 8.5-5.8 1.8-.7 3.9-1.2 5.1-2.8.8-1 1-3.8-1-7.2z"
          fill="#E01A22"
        />
        <path
          d="M17.5 10.5c-2.4 1-5.5 3.5-6.8 5.8-1.5 2.5-2.2 5.5-2.5 8.4-.1.7.8 1.1 1.2.6 1.8-2.2 4-4 6.5-5.2 1.4-.7 3-1.2 3.8-2.6.7-1.1.2-4-2.2-7z"
          fill="#FF333A"
        />
        <path
          d="M12.5 13.5c-1.8 1-3.8 3-4.5 4.8-.9 2.2-1.2 4.6-1.2 7 0 .6.7.9 1 .5 1.2-1.7 2.8-3.1 4.5-4.1.9-.5 2-.9 2.4-2 .4-.9 0-3.2-2.2-6.2z"
          fill="#B51219"
        />
      </svg>
    );
  }

  // 8. Datadog
  if (normalizedKey.includes('datadog')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Datadog Logo"
      >
        <rect width="32" height="32" rx="6" fill="#632CA6" />
        {/* Datadog Mascot 'Bits' Face Silhouette */}
        <path
          d="M10 11.5c.3-1.6 1.5-2.8 3.2-2.8 1.1 0 1.9.5 2.8 1.2.9-.7 1.7-1.2 2.8-1.2 1.7 0 2.9 1.2 3.2 2.8.4 2.2-.8 4.2-2.2 5.2.2.7.2 1.5.2 2.3 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-.8.1-1.6.2-2.3-1.4-1-2.6-3-2.3-5.2z"
          fill="#FFFFFF"
        />
        <circle cx="13.5" cy="14.5" r="1.2" fill="#632CA6" />
        <circle cx="18.5" cy="14.5" r="1.2" fill="#632CA6" />
        <ellipse cx="16" cy="17.5" rx="1.5" ry="1" fill="#632CA6" />
      </svg>
    );
  }

  // 9. Cloudflare
  if (normalizedKey.includes('cloudflare')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Cloudflare Logo"
      >
        <rect width="32" height="32" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        {/* Cloudflare signature clouds */}
        <path
          d="M20.2 13.8c-.4-.9-1.2-1.6-2.2-1.8-.4-.1-.8-.1-1.2 0-.8-1.5-2.3-2.5-4.1-2.5-2.3 0-4.2 1.7-4.6 3.9-.3-.1-.7-.1-1-.1-2.3 0-4.1 1.9-4.1 4.2 0 .4.1.8.2 1.2h17.2c1.7 0 3-1.3 3-3 0-1.5-1.2-2.8-2.8-2.9z"
          fill="#F38020"
        />
        <path
          d="M23.5 15.6c-.2-.1-.5-.2-.7-.2-.3 0-.6.1-.9.2.1.4.1.7.1 1.1 0 1.9-1.5 3.5-3.5 3.5H9.5c.5 1.4 1.8 2.3 3.3 2.3h10.7c2.5 0 4.5-2 4.5-4.5 0-1.2-.5-2.3-1.4-3.1-.9-.8-2-1.2-3.1-1.1z"
          fill="#FAAE40"
        />
      </svg>
    );
  }

  // 10. Jira / Atlassian
  if (normalizedKey.includes('jira') || normalizedKey.includes('atlassian')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Atlassian Jira Logo"
      >
        <rect width="32" height="32" rx="6" fill="#0052CC" />
        {/* Jira dual origami folding diamond mark */}
        <path
          d="M16 6.5a8.5 8.5 0 0 0-8.5 8.5c0 4.7 3.8 8.5 8.5 8.5h1V15h-1a4.5 4.5 0 0 1-4.5-4.5c0-2.5 2-4.5 4.5-4.5v.5z"
          fill="#2684FF"
        />
        <path
          d="M16 11a5.5 5.5 0 0 0-5.5 5.5c0 3 2.5 5.5 5.5 5.5h1V16h-1a2.5 2.5 0 0 1-2.5-2.5c0-1.4 1.1-2.5 2.5-2.5z"
          fill="#FFFFFF"
        />
        <path
          d="M16 15.5a4 4 0 0 0-4 4c0 2.2 1.8 4 4 4h8.5c0-4.7-3.8-8.5-8.5-8.5v.5z"
          fill="#2684FF"
        />
      </svg>
    );
  }

  // 11. Microsoft Azure
  if (normalizedKey.includes('azure') || normalizedKey.includes('microsoftazure')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Microsoft Azure Logo"
      >
        <rect width="32" height="32" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        {/* Modern Azure Geometric A Fold */}
        <path
          d="M13.2 7h6.6l-5.6 17.5h-6.2L13.2 7z"
          fill="#0078D4"
        />
        <path
          d="M19.8 7l4.4 12.8-5 4.7h-5.4l6-17.5z"
          fill="#0089D6"
        />
        <path
          d="M13.8 24.5l5.4-4.7h-6.8l-4.4 4.7h5.8z"
          fill="#005BA1"
        />
      </svg>
    );
  }

  // 12. Slack
  if (normalizedKey.includes('slack')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Slack Logo"
      >
        <rect width="32" height="32" rx="6" fill="#4A154B" />
        {/* Slack 4-Color Hash geometry */}
        {/* Top/Blue */}
        <path d="M12.5 7.5a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-3 0V9a1.5 1.5 0 0 1 1.5-1.5z" fill="#36C5F0" />
        <path d="M9 12.5a1.5 1.5 0 0 1 1.5-1.5H14a1.5 1.5 0 0 1 0 3h-3.5A1.5 1.5 0 0 1 9 12.5z" fill="#36C5F0" />
        {/* Right/Green */}
        <path d="M24.5 12.5a1.5 1.5 0 0 1-1.5 1.5h-3.5a1.5 1.5 0 0 1 0-3H23a1.5 1.5 0 0 1 1.5 1.5z" fill="#2EB67D" />
        <path d="M19.5 9a1.5 1.5 0 0 1 1.5 1.5V14a1.5 1.5 0 0 1-3 0v-3.5A1.5 1.5 0 0 1 19.5 9z" fill="#2EB67D" />
        {/* Bottom/Yellow */}
        <path d="M19.5 24.5a1.5 1.5 0 0 1-1.5-1.5v-3.5a1.5 1.5 0 0 1 3 0V23a1.5 1.5 0 0 1-1.5 1.5z" fill="#ECB22E" />
        <path d="M23 19.5a1.5 1.5 0 0 1-1.5 1.5H18a1.5 1.5 0 0 1 0-3h3.5a1.5 1.5 0 0 1 1.5 1.5z" fill="#ECB22E" />
        {/* Left/Red */}
        <path d="M7.5 19.5a1.5 1.5 0 0 1 1.5-1.5h3.5a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 1-1.5-1.5z" fill="#E01E5A" />
        <path d="M12.5 23a1.5 1.5 0 0 1-1.5-1.5V18a1.5 1.5 0 0 1 3 0v3.5a1.5 1.5 0 0 1-1.5 1.5z" fill="#E01E5A" />
      </svg>
    );
  }

  // 13. Microsoft Teams
  if (normalizedKey.includes('teams')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} ${className} shrink-0`}
        aria-label="Microsoft Teams Logo"
      >
        <rect width="32" height="32" rx="6" fill="#464EB8" />
        <path
          d="M19 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm3 2h-4c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1z"
          fill="#7B83EB"
        />
        <path
          d="M13.5 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm4.5 3h-8c-.8 0-1.5.7-1.5 1.5v6.5c0 .6.4 1 1 1h9c.6 0 1-.4 1-1v-6.5c0-.8-.7-1.5-1.5-1.5z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Default fallback badge
  const initial = (name || platformId || 'P').charAt(0).toUpperCase();
  return (
    <div
      className={`${sizeClass} ${className} rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0 font-mono`}
    >
      {initial}
    </div>
  );
};
