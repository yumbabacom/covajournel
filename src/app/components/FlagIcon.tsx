// Flag component using CSS-based flag icons
export const FlagIcon = ({ countryCode, className = "w-6 h-4" }: { countryCode?: string; className?: string }) => {
  // Fallback for special cases
  if (!countryCode || countryCode === 'world') {
    return (
      <div className={`rounded-sm overflow-hidden ${className}`}>
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  if (countryCode === 'un') {
    return <span className={`${className} bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center text-white text-xs font-bold`}>🌐</span>;
  }

  const flagStyle = {
    backgroundImage: `url(https://flagcdn.com/w40/${countryCode.toLowerCase()}.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'inline-block',
    borderRadius: '2px',
    border: '1px solid rgba(0,0,0,0.1)'
  };

  return (
    <span
      className={className}
      style={flagStyle}
      title={countryCode.toUpperCase()}
    />
  );
};
