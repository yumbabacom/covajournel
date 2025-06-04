'use client';

import { useState, useEffect, useRef } from 'react';

// Flag component using CSS-based flag icons
const FlagIcon = ({ countryCode, className = "w-6 h-4" }: { countryCode?: string; className?: string }) => {
  // Fallback for special cases
  if (!countryCode || countryCode === 'world') {
    return <span className={`${className} bg-gradient-to-br from-blue-500 to-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold`}>🌍</span>;
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

// Comprehensive timezone data
const timezones = [
  {
    id: 'local',
    name: 'Local Time',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    countryCode: 'world',
    country: 'Local',
    category: 'Local'
  },
  {
    id: 'utc',
    name: 'UTC',
    timezone: 'UTC',
    countryCode: 'un',
    country: 'Universal',
    category: 'Universal'
  },
  // Americas - North America
  {
    id: 'new_york',
    name: 'New York',
    timezone: 'America/New_York',
    countryCode: 'us',
    country: 'United States',
    category: 'Americas'
  },
  {
    id: 'chicago',
    name: 'Chicago',
    timezone: 'America/Chicago',
    countryCode: 'us',
    country: 'United States',
    category: 'Americas'
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    timezone: 'America/Los_Angeles',
    countryCode: 'us',
    country: 'United States',
    category: 'Americas'
  },
  {
    id: 'denver',
    name: 'Denver',
    timezone: 'America/Denver',
    countryCode: 'us',
    country: 'United States',
    category: 'Americas'
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    timezone: 'America/Phoenix',
    countryCode: 'us',
    country: 'United States',
    category: 'Americas'
  },
  {
    id: 'anchorage',
    name: 'Anchorage',
    timezone: 'America/Anchorage',
    countryCode: 'us',
    country: 'United States',
    category: 'Americas'
  },
  {
    id: 'honolulu',
    name: 'Honolulu',
    timezone: 'Pacific/Honolulu',
    countryCode: 'us',
    country: 'United States',
    category: 'Americas'
  },
  {
    id: 'toronto',
    name: 'Toronto',
    timezone: 'America/Toronto',
    countryCode: 'ca',
    country: 'Canada',
    category: 'Americas'
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    timezone: 'America/Vancouver',
    countryCode: 'ca',
    country: 'Canada',
    category: 'Americas'
  },
  {
    id: 'montreal',
    name: 'Montreal',
    timezone: 'America/Montreal',
    countryCode: 'ca',
    country: 'Canada',
    category: 'Americas'
  },
  {
    id: 'mexico_city',
    name: 'Mexico City',
    timezone: 'America/Mexico_City',
    countryCode: 'mx',
    country: 'Mexico',
    category: 'Americas'
  },
  // Americas - Central & South America
  {
    id: 'guatemala',
    name: 'Guatemala City',
    timezone: 'America/Guatemala',
    countryCode: 'gt',
    country: 'Guatemala',
    category: 'Americas'
  },
  {
    id: 'panama',
    name: 'Panama City',
    timezone: 'America/Panama',
    countryCode: 'pa',
    country: 'Panama',
    category: 'Americas'
  },
  {
    id: 'bogota',
    name: 'Bogotá',
    timezone: 'America/Bogota',
    countryCode: 'co',
    country: 'Colombia',
    category: 'Americas'
  },
  {
    id: 'caracas',
    name: 'Caracas',
    timezone: 'America/Caracas',
    countryCode: 've',
    country: 'Venezuela',
    category: 'Americas'
  },
  {
    id: 'lima',
    name: 'Lima',
    timezone: 'America/Lima',
    countryCode: 'pe',
    country: 'Peru',
    category: 'Americas'
  },
  {
    id: 'sao_paulo',
    name: 'São Paulo',
    timezone: 'America/Sao_Paulo',
    countryCode: 'br',
    country: 'Brazil',
    category: 'Americas'
  },
  {
    id: 'rio_de_janeiro',
    name: 'Rio de Janeiro',
    timezone: 'America/Sao_Paulo',
    countryCode: 'br',
    country: 'Brazil',
    category: 'Americas'
  },
  {
    id: 'buenos_aires',
    name: 'Buenos Aires',
    timezone: 'America/Argentina/Buenos_Aires',
    countryCode: 'ar',
    country: 'Argentina',
    category: 'Americas'
  },
  {
    id: 'santiago',
    name: 'Santiago',
    timezone: 'America/Santiago',
    countryCode: 'cl',
    country: 'Chile',
    category: 'Americas'
  },
  // Europe - Western Europe
  {
    id: 'london',
    name: 'London',
    timezone: 'Europe/London',
    countryCode: 'gb',
    country: 'United Kingdom',
    category: 'Europe'
  },
  {
    id: 'dublin',
    name: 'Dublin',
    timezone: 'Europe/Dublin',
    countryCode: 'ie',
    country: 'Ireland',
    category: 'Europe'
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    timezone: 'Europe/Lisbon',
    countryCode: 'pt',
    country: 'Portugal',
    category: 'Europe'
  },
  {
    id: 'madrid',
    name: 'Madrid',
    timezone: 'Europe/Madrid',
    countryCode: 'es',
    country: 'Spain',
    category: 'Europe'
  },
  {
    id: 'paris',
    name: 'Paris',
    timezone: 'Europe/Paris',
    countryCode: 'fr',
    country: 'France',
    category: 'Europe'
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    timezone: 'Europe/Amsterdam',
    countryCode: 'nl',
    country: 'Netherlands',
    category: 'Europe'
  },
  {
    id: 'brussels',
    name: 'Brussels',
    timezone: 'Europe/Brussels',
    countryCode: 'be',
    country: 'Belgium',
    category: 'Europe'
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    timezone: 'Europe/Berlin',
    countryCode: 'de',
    country: 'Germany',
    category: 'Europe'
  },
  {
    id: 'berlin',
    name: 'Berlin',
    timezone: 'Europe/Berlin',
    countryCode: 'de',
    country: 'Germany',
    category: 'Europe'
  },
  {
    id: 'zurich',
    name: 'Zurich',
    timezone: 'Europe/Zurich',
    countryCode: 'ch',
    country: 'Switzerland',
    category: 'Europe'
  },
  {
    id: 'vienna',
    name: 'Vienna',
    timezone: 'Europe/Vienna',
    countryCode: 'at',
    country: 'Austria',
    category: 'Europe'
  },
  {
    id: 'milan',
    name: 'Milan',
    timezone: 'Europe/Rome',
    countryCode: 'it',
    country: 'Italy',
    category: 'Europe'
  },
  {
    id: 'rome',
    name: 'Rome',
    timezone: 'Europe/Rome',
    countryCode: 'it',
    country: 'Italy',
    category: 'Europe'
  },
  {
    id: 'moscow',
    name: 'Moscow',
    timezone: 'Europe/Moscow',
    countryCode: 'ru',
    country: 'Russia',
    category: 'Europe'
  },
  // Asia-Pacific
  {
    id: 'tokyo',
    name: 'Tokyo',
    timezone: 'Asia/Tokyo',
    countryCode: 'jp',
    country: 'Japan',
    category: 'Asia-Pacific'
  },
  {
    id: 'sydney',
    name: 'Sydney',
    timezone: 'Australia/Sydney',
    countryCode: 'au',
    country: 'Australia',
    category: 'Asia-Pacific'
  },
  {
    id: 'hong_kong',
    name: 'Hong Kong',
    timezone: 'Asia/Hong_Kong',
    countryCode: 'hk',
    country: 'Hong Kong',
    category: 'Asia-Pacific'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    timezone: 'Asia/Singapore',
    countryCode: 'sg',
    country: 'Singapore',
    category: 'Asia-Pacific'
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    timezone: 'Asia/Shanghai',
    countryCode: 'cn',
    country: 'China',
    category: 'Asia-Pacific'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    timezone: 'Asia/Kolkata',
    countryCode: 'in',
    country: 'India',
    category: 'Asia-Pacific'
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    timezone: 'Asia/Kolkata',
    countryCode: 'in',
    country: 'India',
    category: 'Asia-Pacific'
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    timezone: 'Asia/Bangkok',
    countryCode: 'th',
    country: 'Thailand',
    category: 'Asia-Pacific'
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    timezone: 'Asia/Jakarta',
    countryCode: 'id',
    country: 'Indonesia',
    category: 'Asia-Pacific'
  },
  {
    id: 'kuala_lumpur',
    name: 'Kuala Lumpur',
    timezone: 'Asia/Kuala_Lumpur',
    countryCode: 'my',
    country: 'Malaysia',
    category: 'Asia-Pacific'
  },
  {
    id: 'manila',
    name: 'Manila',
    timezone: 'Asia/Manila',
    countryCode: 'ph',
    country: 'Philippines',
    category: 'Asia-Pacific'
  },
  {
    id: 'seoul',
    name: 'Seoul',
    timezone: 'Asia/Seoul',
    countryCode: 'kr',
    country: 'South Korea',
    category: 'Asia-Pacific'
  },
  {
    id: 'taipei',
    name: 'Taipei',
    timezone: 'Asia/Taipei',
    countryCode: 'tw',
    country: 'Taiwan',
    category: 'Asia-Pacific'
  },
  {
    id: 'beijing',
    name: 'Beijing',
    timezone: 'Asia/Shanghai',
    countryCode: 'cn',
    country: 'China',
    category: 'Asia-Pacific'
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    timezone: 'Australia/Melbourne',
    countryCode: 'au',
    country: 'Australia',
    category: 'Asia-Pacific'
  },
  {
    id: 'perth',
    name: 'Perth',
    timezone: 'Australia/Perth',
    countryCode: 'au',
    country: 'Australia',
    category: 'Asia-Pacific'
  },
  {
    id: 'auckland',
    name: 'Auckland',
    timezone: 'Pacific/Auckland',
    countryCode: 'nz',
    country: 'New Zealand',
    category: 'Asia-Pacific'
  },
  {
    id: 'wellington',
    name: 'Wellington',
    timezone: 'Pacific/Auckland',
    countryCode: 'nz',
    country: 'New Zealand',
    category: 'Asia-Pacific'
  },
  // Europe - Eastern Europe
  {
    id: 'stockholm',
    name: 'Stockholm',
    timezone: 'Europe/Stockholm',
    countryCode: 'se',
    country: 'Sweden',
    category: 'Europe'
  },
  {
    id: 'oslo',
    name: 'Oslo',
    timezone: 'Europe/Oslo',
    countryCode: 'no',
    country: 'Norway',
    category: 'Europe'
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    timezone: 'Europe/Copenhagen',
    countryCode: 'dk',
    country: 'Denmark',
    category: 'Europe'
  },
  {
    id: 'helsinki',
    name: 'Helsinki',
    timezone: 'Europe/Helsinki',
    countryCode: 'fi',
    country: 'Finland',
    category: 'Europe'
  },
  {
    id: 'warsaw',
    name: 'Warsaw',
    timezone: 'Europe/Warsaw',
    countryCode: 'pl',
    country: 'Poland',
    category: 'Europe'
  },
  {
    id: 'prague',
    name: 'Prague',
    timezone: 'Europe/Prague',
    countryCode: 'cz',
    country: 'Czech Republic',
    category: 'Europe'
  },
  {
    id: 'budapest',
    name: 'Budapest',
    timezone: 'Europe/Budapest',
    countryCode: 'hu',
    country: 'Hungary',
    category: 'Europe'
  },
  {
    id: 'bucharest',
    name: 'Bucharest',
    timezone: 'Europe/Bucharest',
    countryCode: 'ro',
    country: 'Romania',
    category: 'Europe'
  },
  {
    id: 'athens',
    name: 'Athens',
    timezone: 'Europe/Athens',
    countryCode: 'gr',
    country: 'Greece',
    category: 'Europe'
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    timezone: 'Europe/Istanbul',
    countryCode: 'tr',
    country: 'Turkey',
    category: 'Europe'
  },
  {
    id: 'kiev',
    name: 'Kyiv',
    timezone: 'Europe/Kiev',
    countryCode: 'ua',
    country: 'Ukraine',
    category: 'Europe'
  },
  // Middle East & Africa
  {
    id: 'dubai',
    name: 'Dubai',
    timezone: 'Asia/Dubai',
    countryCode: 'ae',
    country: 'UAE',
    category: 'Middle East & Africa'
  },
  {
    id: 'abu_dhabi',
    name: 'Abu Dhabi',
    timezone: 'Asia/Dubai',
    countryCode: 'ae',
    country: 'UAE',
    category: 'Middle East & Africa'
  },
  {
    id: 'doha',
    name: 'Doha',
    timezone: 'Asia/Qatar',
    countryCode: 'qa',
    country: 'Qatar',
    category: 'Middle East & Africa'
  },
  {
    id: 'kuwait',
    name: 'Kuwait City',
    timezone: 'Asia/Kuwait',
    countryCode: 'kw',
    country: 'Kuwait',
    category: 'Middle East & Africa'
  },
  {
    id: 'riyadh',
    name: 'Riyadh',
    timezone: 'Asia/Riyadh',
    countryCode: 'sa',
    country: 'Saudi Arabia',
    category: 'Middle East & Africa'
  },
  {
    id: 'bahrain',
    name: 'Manama',
    timezone: 'Asia/Bahrain',
    countryCode: 'bh',
    country: 'Bahrain',
    category: 'Middle East & Africa'
  },
  {
    id: 'tel_aviv',
    name: 'Tel Aviv',
    timezone: 'Asia/Jerusalem',
    countryCode: 'il',
    country: 'Israel',
    category: 'Middle East & Africa'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    timezone: 'Africa/Cairo',
    countryCode: 'eg',
    country: 'Egypt',
    category: 'Middle East & Africa'
  },
  {
    id: 'johannesburg',
    name: 'Johannesburg',
    timezone: 'Africa/Johannesburg',
    countryCode: 'za',
    country: 'South Africa',
    category: 'Middle East & Africa'
  },
  {
    id: 'cape_town',
    name: 'Cape Town',
    timezone: 'Africa/Johannesburg',
    countryCode: 'za',
    country: 'South Africa',
    category: 'Middle East & Africa'
  },
  {
    id: 'lagos',
    name: 'Lagos',
    timezone: 'Africa/Lagos',
    countryCode: 'ng',
    country: 'Nigeria',
    category: 'Middle East & Africa'
  },
  {
    id: 'nairobi',
    name: 'Nairobi',
    timezone: 'Africa/Nairobi',
    countryCode: 'ke',
    country: 'Kenya',
    category: 'Middle East & Africa'
  },
  {
    id: 'casablanca',
    name: 'Casablanca',
    timezone: 'Africa/Casablanca',
    countryCode: 'ma',
    country: 'Morocco',
    category: 'Middle East & Africa'
  },
  // Additional Americas
  {
    id: 'havana',
    name: 'Havana',
    timezone: 'America/Havana',
    countryCode: 'cu',
    country: 'Cuba',
    category: 'Americas'
  },
  {
    id: 'kingston',
    name: 'Kingston',
    timezone: 'America/Jamaica',
    countryCode: 'jm',
    country: 'Jamaica',
    category: 'Americas'
  },
  {
    id: 'san_jose',
    name: 'San José',
    timezone: 'America/Costa_Rica',
    countryCode: 'cr',
    country: 'Costa Rica',
    category: 'Americas'
  },
  {
    id: 'managua',
    name: 'Managua',
    timezone: 'America/Managua',
    countryCode: 'ni',
    country: 'Nicaragua',
    category: 'Americas'
  },
  {
    id: 'tegucigalpa',
    name: 'Tegucigalpa',
    timezone: 'America/Tegucigalpa',
    countryCode: 'hn',
    country: 'Honduras',
    category: 'Americas'
  },
  {
    id: 'belize_city',
    name: 'Belize City',
    timezone: 'America/Belize',
    countryCode: 'bz',
    country: 'Belize',
    category: 'Americas'
  },
  {
    id: 'san_salvador',
    name: 'San Salvador',
    timezone: 'America/El_Salvador',
    countryCode: 'sv',
    country: 'El Salvador',
    category: 'Americas'
  },
  {
    id: 'quito',
    name: 'Quito',
    timezone: 'America/Guayaquil',
    countryCode: 'ec',
    country: 'Ecuador',
    category: 'Americas'
  },
  {
    id: 'la_paz',
    name: 'La Paz',
    timezone: 'America/La_Paz',
    countryCode: 'bo',
    country: 'Bolivia',
    category: 'Americas'
  },
  {
    id: 'asuncion',
    name: 'Asunción',
    timezone: 'America/Asuncion',
    countryCode: 'py',
    country: 'Paraguay',
    category: 'Americas'
  },
  {
    id: 'montevideo',
    name: 'Montevideo',
    timezone: 'America/Montevideo',
    countryCode: 'uy',
    country: 'Uruguay',
    category: 'Americas'
  },
  {
    id: 'georgetown',
    name: 'Georgetown',
    timezone: 'America/Guyana',
    countryCode: 'gy',
    country: 'Guyana',
    category: 'Americas'
  },
  {
    id: 'paramaribo',
    name: 'Paramaribo',
    timezone: 'America/Paramaribo',
    countryCode: 'sr',
    country: 'Suriname',
    category: 'Americas'
  },
  // Additional Europe
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    timezone: 'Atlantic/Reykjavik',
    countryCode: 'is',
    country: 'Iceland',
    category: 'Europe'
  },
  {
    id: 'luxembourg',
    name: 'Luxembourg',
    timezone: 'Europe/Luxembourg',
    countryCode: 'lu',
    country: 'Luxembourg',
    category: 'Europe'
  },
  {
    id: 'monaco',
    name: 'Monaco',
    timezone: 'Europe/Monaco',
    countryCode: 'mc',
    country: 'Monaco',
    category: 'Europe'
  },
  {
    id: 'andorra',
    name: 'Andorra la Vella',
    timezone: 'Europe/Andorra',
    countryCode: 'ad',
    country: 'Andorra',
    category: 'Europe'
  },
  {
    id: 'san_marino',
    name: 'San Marino',
    timezone: 'Europe/San_Marino',
    countryCode: 'sm',
    country: 'San Marino',
    category: 'Europe'
  },
  {
    id: 'vatican',
    name: 'Vatican City',
    timezone: 'Europe/Vatican',
    countryCode: 'va',
    country: 'Vatican City',
    category: 'Europe'
  },
  {
    id: 'malta',
    name: 'Valletta',
    timezone: 'Europe/Malta',
    countryCode: 'mt',
    country: 'Malta',
    category: 'Europe'
  },
  {
    id: 'cyprus',
    name: 'Nicosia',
    timezone: 'Asia/Nicosia',
    countryCode: 'cy',
    country: 'Cyprus',
    category: 'Europe'
  },
  {
    id: 'zagreb',
    name: 'Zagreb',
    timezone: 'Europe/Zagreb',
    countryCode: 'hr',
    country: 'Croatia',
    category: 'Europe'
  },
  {
    id: 'ljubljana',
    name: 'Ljubljana',
    timezone: 'Europe/Ljubljana',
    countryCode: 'si',
    country: 'Slovenia',
    category: 'Europe'
  },
  {
    id: 'sarajevo',
    name: 'Sarajevo',
    timezone: 'Europe/Sarajevo',
    countryCode: 'ba',
    country: 'Bosnia and Herzegovina',
    category: 'Europe'
  },
  {
    id: 'belgrade',
    name: 'Belgrade',
    timezone: 'Europe/Belgrade',
    countryCode: 'rs',
    country: 'Serbia',
    category: 'Europe'
  },
  {
    id: 'podgorica',
    name: 'Podgorica',
    timezone: 'Europe/Podgorica',
    countryCode: 'me',
    country: 'Montenegro',
    category: 'Europe'
  },
  {
    id: 'skopje',
    name: 'Skopje',
    timezone: 'Europe/Skopje',
    countryCode: 'mk',
    country: 'North Macedonia',
    category: 'Europe'
  },
  {
    id: 'tirana',
    name: 'Tirana',
    timezone: 'Europe/Tirane',
    countryCode: 'al',
    country: 'Albania',
    category: 'Europe'
  },
  {
    id: 'sofia',
    name: 'Sofia',
    timezone: 'Europe/Sofia',
    countryCode: 'bg',
    country: 'Bulgaria',
    category: 'Europe'
  },
  {
    id: 'chisinau',
    name: 'Chișinău',
    timezone: 'Europe/Chisinau',
    countryCode: 'md',
    country: 'Moldova',
    category: 'Europe'
  },
  {
    id: 'riga',
    name: 'Riga',
    timezone: 'Europe/Riga',
    countryCode: 'lv',
    country: 'Latvia',
    category: 'Europe'
  },
  {
    id: 'vilnius',
    name: 'Vilnius',
    timezone: 'Europe/Vilnius',
    countryCode: 'lt',
    country: 'Lithuania',
    category: 'Europe'
  },
  {
    id: 'tallinn',
    name: 'Tallinn',
    timezone: 'Europe/Tallinn',
    countryCode: 'ee',
    country: 'Estonia',
    category: 'Europe'
  },
  {
    id: 'bratislava',
    name: 'Bratislava',
    timezone: 'Europe/Bratislava',
    countryCode: 'sk',
    country: 'Slovakia',
    category: 'Europe'
  },
  // Additional Asia-Pacific
  {
    id: 'colombo',
    name: 'Colombo',
    timezone: 'Asia/Colombo',
    countryCode: 'lk',
    country: 'Sri Lanka',
    category: 'Asia-Pacific'
  },
  {
    id: 'dhaka',
    name: 'Dhaka',
    timezone: 'Asia/Dhaka',
    countryCode: 'bd',
    country: 'Bangladesh',
    category: 'Asia-Pacific'
  },
  {
    id: 'kathmandu',
    name: 'Kathmandu',
    timezone: 'Asia/Kathmandu',
    countryCode: 'np',
    country: 'Nepal',
    category: 'Asia-Pacific'
  },
  {
    id: 'thimphu',
    name: 'Thimphu',
    timezone: 'Asia/Thimphu',
    countryCode: 'bt',
    country: 'Bhutan',
    category: 'Asia-Pacific'
  },
  {
    id: 'yangon',
    name: 'Yangon',
    timezone: 'Asia/Yangon',
    countryCode: 'mm',
    country: 'Myanmar',
    category: 'Asia-Pacific'
  },
  {
    id: 'phnom_penh',
    name: 'Phnom Penh',
    timezone: 'Asia/Phnom_Penh',
    countryCode: 'kh',
    country: 'Cambodia',
    category: 'Asia-Pacific'
  },
  {
    id: 'vientiane',
    name: 'Vientiane',
    timezone: 'Asia/Vientiane',
    countryCode: 'la',
    country: 'Laos',
    category: 'Asia-Pacific'
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    timezone: 'Asia/Ho_Chi_Minh',
    countryCode: 'vn',
    country: 'Vietnam',
    category: 'Asia-Pacific'
  },
  {
    id: 'ho_chi_minh',
    name: 'Ho Chi Minh City',
    timezone: 'Asia/Ho_Chi_Minh',
    countryCode: 'vn',
    country: 'Vietnam',
    category: 'Asia-Pacific'
  },
  {
    id: 'bandar_seri_begawan',
    name: 'Bandar Seri Begawan',
    timezone: 'Asia/Brunei',
    countryCode: 'bn',
    country: 'Brunei',
    category: 'Asia-Pacific'
  },
  {
    id: 'dili',
    name: 'Dili',
    timezone: 'Asia/Dili',
    countryCode: 'tl',
    country: 'East Timor',
    category: 'Asia-Pacific'
  },
  {
    id: 'ulaanbaatar',
    name: 'Ulaanbaatar',
    timezone: 'Asia/Ulaanbaatar',
    countryCode: 'mn',
    country: 'Mongolia',
    category: 'Asia-Pacific'
  },
  {
    id: 'almaty',
    name: 'Almaty',
    timezone: 'Asia/Almaty',
    countryCode: 'kz',
    country: 'Kazakhstan',
    category: 'Asia-Pacific'
  },
  {
    id: 'tashkent',
    name: 'Tashkent',
    timezone: 'Asia/Tashkent',
    countryCode: 'uz',
    country: 'Uzbekistan',
    category: 'Asia-Pacific'
  },
  {
    id: 'bishkek',
    name: 'Bishkek',
    timezone: 'Asia/Bishkek',
    countryCode: 'kg',
    country: 'Kyrgyzstan',
    category: 'Asia-Pacific'
  },
  {
    id: 'dushanbe',
    name: 'Dushanbe',
    timezone: 'Asia/Dushanbe',
    countryCode: 'tj',
    country: 'Tajikistan',
    category: 'Asia-Pacific'
  },
  {
    id: 'ashgabat',
    name: 'Ashgabat',
    timezone: 'Asia/Ashgabat',
    countryCode: 'tm',
    country: 'Turkmenistan',
    category: 'Asia-Pacific'
  },
  {
    id: 'kabul',
    name: 'Kabul',
    timezone: 'Asia/Kabul',
    countryCode: 'af',
    country: 'Afghanistan',
    category: 'Asia-Pacific'
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    timezone: 'Asia/Karachi',
    countryCode: 'pk',
    country: 'Pakistan',
    category: 'Asia-Pacific'
  },
  {
    id: 'karachi',
    name: 'Karachi',
    timezone: 'Asia/Karachi',
    countryCode: 'pk',
    country: 'Pakistan',
    category: 'Asia-Pacific'
  },
  {
    id: 'male',
    name: 'Malé',
    timezone: 'Indian/Maldives',
    countryCode: 'mv',
    country: 'Maldives',
    category: 'Asia-Pacific'
  },
  {
    id: 'port_louis',
    name: 'Port Louis',
    timezone: 'Indian/Mauritius',
    countryCode: 'mu',
    country: 'Mauritius',
    category: 'Asia-Pacific'
  },
  {
    id: 'seychelles',
    name: 'Victoria',
    timezone: 'Indian/Mahe',
    countryCode: 'sc',
    country: 'Seychelles',
    category: 'Asia-Pacific'
  },
  {
    id: 'brisbane',
    name: 'Brisbane',
    timezone: 'Australia/Brisbane',
    countryCode: 'au',
    country: 'Australia',
    category: 'Asia-Pacific'
  },
  {
    id: 'adelaide',
    name: 'Adelaide',
    timezone: 'Australia/Adelaide',
    countryCode: 'au',
    country: 'Australia',
    category: 'Asia-Pacific'
  },
  {
    id: 'darwin',
    name: 'Darwin',
    timezone: 'Australia/Darwin',
    countryCode: 'au',
    country: 'Australia',
    category: 'Asia-Pacific'
  },
  {
    id: 'hobart',
    name: 'Hobart',
    timezone: 'Australia/Hobart',
    countryCode: 'au',
    country: 'Australia',
    category: 'Asia-Pacific'
  },
  {
    id: 'port_moresby',
    name: 'Port Moresby',
    timezone: 'Pacific/Port_Moresby',
    countryCode: 'pg',
    country: 'Papua New Guinea',
    category: 'Asia-Pacific'
  },
  {
    id: 'suva',
    name: 'Suva',
    timezone: 'Pacific/Fiji',
    countryCode: 'fj',
    country: 'Fiji',
    category: 'Asia-Pacific'
  },
  {
    id: 'nuku_alofa',
    name: 'Nuku\'alofa',
    timezone: 'Pacific/Tongatapu',
    countryCode: 'to',
    country: 'Tonga',
    category: 'Asia-Pacific'
  },
  {
    id: 'apia',
    name: 'Apia',
    timezone: 'Pacific/Apia',
    countryCode: 'ws',
    country: 'Samoa',
    category: 'Asia-Pacific'
  },
  // Additional Middle East & Africa
  {
    id: 'tehran',
    name: 'Tehran',
    timezone: 'Asia/Tehran',
    countryCode: 'ir',
    country: 'Iran',
    category: 'Middle East & Africa'
  },
  {
    id: 'baghdad',
    name: 'Baghdad',
    timezone: 'Asia/Baghdad',
    countryCode: 'iq',
    country: 'Iraq',
    category: 'Middle East & Africa'
  },
  {
    id: 'damascus',
    name: 'Damascus',
    timezone: 'Asia/Damascus',
    countryCode: 'sy',
    country: 'Syria',
    category: 'Middle East & Africa'
  },
  {
    id: 'beirut',
    name: 'Beirut',
    timezone: 'Asia/Beirut',
    countryCode: 'lb',
    country: 'Lebanon',
    category: 'Middle East & Africa'
  },
  {
    id: 'amman',
    name: 'Amman',
    timezone: 'Asia/Amman',
    countryCode: 'jo',
    country: 'Jordan',
    category: 'Middle East & Africa'
  },
  {
    id: 'muscat',
    name: 'Muscat',
    timezone: 'Asia/Muscat',
    countryCode: 'om',
    country: 'Oman',
    category: 'Middle East & Africa'
  },
  {
    id: 'sanaa',
    name: 'Sanaa',
    timezone: 'Asia/Aden',
    countryCode: 'ye',
    country: 'Yemen',
    category: 'Middle East & Africa'
  },
  {
    id: 'yerevan',
    name: 'Yerevan',
    timezone: 'Asia/Yerevan',
    countryCode: 'am',
    country: 'Armenia',
    category: 'Middle East & Africa'
  },
  {
    id: 'baku',
    name: 'Baku',
    timezone: 'Asia/Baku',
    countryCode: 'az',
    country: 'Azerbaijan',
    category: 'Middle East & Africa'
  },
  {
    id: 'tbilisi',
    name: 'Tbilisi',
    timezone: 'Asia/Tbilisi',
    countryCode: 'ge',
    country: 'Georgia',
    category: 'Middle East & Africa'
  },
  {
    id: 'tunis',
    name: 'Tunis',
    timezone: 'Africa/Tunis',
    countryCode: 'tn',
    country: 'Tunisia',
    category: 'Middle East & Africa'
  },
  {
    id: 'algiers',
    name: 'Algiers',
    timezone: 'Africa/Algiers',
    countryCode: 'dz',
    country: 'Algeria',
    category: 'Middle East & Africa'
  },
  {
    id: 'tripoli',
    name: 'Tripoli',
    timezone: 'Africa/Tripoli',
    countryCode: 'ly',
    country: 'Libya',
    category: 'Middle East & Africa'
  },
  {
    id: 'khartoum',
    name: 'Khartoum',
    timezone: 'Africa/Khartoum',
    countryCode: 'sd',
    country: 'Sudan',
    category: 'Middle East & Africa'
  },
  {
    id: 'addis_ababa',
    name: 'Addis Ababa',
    timezone: 'Africa/Addis_Ababa',
    countryCode: 'et',
    country: 'Ethiopia',
    category: 'Middle East & Africa'
  },
  {
    id: 'kampala',
    name: 'Kampala',
    timezone: 'Africa/Kampala',
    countryCode: 'ug',
    country: 'Uganda',
    category: 'Middle East & Africa'
  },
  {
    id: 'kigali',
    name: 'Kigali',
    timezone: 'Africa/Kigali',
    countryCode: 'rw',
    country: 'Rwanda',
    category: 'Middle East & Africa'
  },
  {
    id: 'dar_es_salaam',
    name: 'Dar es Salaam',
    timezone: 'Africa/Dar_es_Salaam',
    countryCode: 'tz',
    country: 'Tanzania',
    category: 'Middle East & Africa'
  },
  {
    id: 'lusaka',
    name: 'Lusaka',
    timezone: 'Africa/Lusaka',
    countryCode: 'zm',
    country: 'Zambia',
    category: 'Middle East & Africa'
  },
  {
    id: 'harare',
    name: 'Harare',
    timezone: 'Africa/Harare',
    countryCode: 'zw',
    country: 'Zimbabwe',
    category: 'Middle East & Africa'
  },
  {
    id: 'maputo',
    name: 'Maputo',
    timezone: 'Africa/Maputo',
    countryCode: 'mz',
    country: 'Mozambique',
    category: 'Middle East & Africa'
  },
  {
    id: 'windhoek',
    name: 'Windhoek',
    timezone: 'Africa/Windhoek',
    countryCode: 'na',
    country: 'Namibia',
    category: 'Middle East & Africa'
  },
  {
    id: 'gaborone',
    name: 'Gaborone',
    timezone: 'Africa/Gaborone',
    countryCode: 'bw',
    country: 'Botswana',
    category: 'Middle East & Africa'
  },
  {
    id: 'maseru',
    name: 'Maseru',
    timezone: 'Africa/Maseru',
    countryCode: 'ls',
    country: 'Lesotho',
    category: 'Middle East & Africa'
  },
  {
    id: 'mbabane',
    name: 'Mbabane',
    timezone: 'Africa/Mbabane',
    countryCode: 'sz',
    country: 'Eswatini',
    category: 'Middle East & Africa'
  },
  {
    id: 'accra',
    name: 'Accra',
    timezone: 'Africa/Accra',
    countryCode: 'gh',
    country: 'Ghana',
    category: 'Middle East & Africa'
  },
  {
    id: 'abidjan',
    name: 'Abidjan',
    timezone: 'Africa/Abidjan',
    countryCode: 'ci',
    country: 'Ivory Coast',
    category: 'Middle East & Africa'
  },
  {
    id: 'dakar',
    name: 'Dakar',
    timezone: 'Africa/Dakar',
    countryCode: 'sn',
    country: 'Senegal',
    category: 'Middle East & Africa'
  },
  {
    id: 'bamako',
    name: 'Bamako',
    timezone: 'Africa/Bamako',
    countryCode: 'ml',
    country: 'Mali',
    category: 'Middle East & Africa'
  },
  {
    id: 'ouagadougou',
    name: 'Ouagadougou',
    timezone: 'Africa/Ouagadougou',
    countryCode: 'bf',
    country: 'Burkina Faso',
    category: 'Middle East & Africa'
  }
];

// Trading sessions
const tradingSessions = [
  {
    name: 'Sydney',
    city: 'Sydney',
    flag: '🇦🇺',
    countryCode: 'au',
    openTime: '22:00',
    closeTime: '07:00',
    color: 'blue',
    timezone: 'Australia/Sydney'
  },
  {
    name: 'Tokyo',
    city: 'Tokyo',
    flag: '🇯🇵',
    countryCode: 'jp',
    openTime: '00:00',
    closeTime: '09:00',
    color: 'red',
    timezone: 'Asia/Tokyo'
  },
  {
    name: 'London',
    city: 'London',
    flag: '🇬🇧',
    countryCode: 'gb',
    openTime: '08:00',
    closeTime: '17:00',
    color: 'green',
    timezone: 'Europe/London'
  },
  {
    name: 'New York',
    city: 'New York',
    flag: '🇺🇸',
    countryCode: 'us',
    openTime: '13:00',
    closeTime: '22:00',
    color: 'purple',
    timezone: 'America/New_York'
  }
];

export default function MarketHours() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('local');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTimezoneExpanded, setIsTimezoneExpanded] = useState(false);
  const timezoneContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle click outside to minimize timezone selector step by step
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timezoneContainerRef.current && !timezoneContainerRef.current.contains(event.target as Node)) {
        // Step-by-step minimization: first clear search, then collapse if expanded
        if (searchTerm) {
          setSearchTerm('');
        } else if (isTimezoneExpanded) {
          setIsTimezoneExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchTerm, isTimezoneExpanded]);

  const getSelectedTimezoneObj = () => {
    return timezones.find(tz => tz.id === selectedTimezone) || timezones[0];
  };

  const formatTimeToLocal = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setUTCHours(hours, minutes, 0, 0);

    const selectedTz = getSelectedTimezoneObj();

    if (selectedTz.id === 'local') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (selectedTz.id === 'utc') {
      return timeStr;
    } else {
      try {
        return date.toLocaleTimeString([], {
          timeZone: selectedTz.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (error) {
        return timeStr;
      }
    }
  };

  const getCurrentTimeInTimezone = () => {
    const selectedTz = getSelectedTimezoneObj();

    if (selectedTz.id === 'local') {
      return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } else if (selectedTz.id === 'utc') {
      return currentTime.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } else {
      try {
        return currentTime.toLocaleTimeString([], {
          timeZone: selectedTz.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } catch (error) {
        return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      }
    }
  };

  // Get current time in selected timezone for calculations
  const getCurrentTimeInSelectedTimezone = () => {
    const selectedTz = getSelectedTimezoneObj();

    if (selectedTz.id === 'local') {
      return currentTime;
    } else if (selectedTz.id === 'utc') {
      const utcTime = new Date(currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000));
      return utcTime;
    } else {
      try {
        // Get the time in the selected timezone
        const timeInTz = new Date(currentTime.toLocaleString('en-CA', {
          timeZone: selectedTz.timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }));
        return timeInTz;
      } catch (error) {
        return currentTime;
      }
    }
  };

  // Convert UTC time to selected timezone
  const convertUTCToSelectedTimezone = (utcHour: number, utcMinute: number = 0) => {
    const selectedTz = getSelectedTimezoneObj();

    // Create a UTC date for today with the specified hour and minute
    const utcDate = new Date();
    utcDate.setUTCHours(utcHour, utcMinute, 0, 0);

    if (selectedTz.id === 'local') {
      return {
        hour: utcDate.getHours(),
        minute: utcDate.getMinutes(),
        timeString: utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      };
    } else if (selectedTz.id === 'utc') {
      return {
        hour: utcHour,
        minute: utcMinute,
        timeString: `${utcHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')}`
      };
    } else {
      try {
        const timeString = utcDate.toLocaleTimeString('en-US', {
          timeZone: selectedTz.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const localDate = new Date(utcDate.toLocaleString('en-CA', {
          timeZone: selectedTz.timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }));

        return {
          hour: localDate.getHours(),
          minute: localDate.getMinutes(),
          timeString: timeString
        };
      } catch (error) {
        return {
          hour: utcDate.getHours(),
          minute: utcDate.getMinutes(),
          timeString: utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        };
      }
    }
  };

  const isSessionOpen = (session: any) => {
    // Get current time in selected timezone
    const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
    const currentHour = timeInSelectedTz.getHours();
    const currentMinute = timeInSelectedTz.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Convert session times to selected timezone
    const [openHourUTC, openMinUTC] = session.openTime.split(':').map(Number);
    const [closeHourUTC, closeMinUTC] = session.closeTime.split(':').map(Number);

    const openTimeConverted = convertUTCToSelectedTimezone(openHourUTC, openMinUTC);
    const closeTimeConverted = convertUTCToSelectedTimezone(closeHourUTC, closeMinUTC);

    const openTimeInMinutes = openTimeConverted.hour * 60 + openTimeConverted.minute;
    const closeTimeInMinutes = closeTimeConverted.hour * 60 + closeTimeConverted.minute;

    if (openTimeInMinutes <= closeTimeInMinutes) {
      // Session doesn't cross midnight in selected timezone
      return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes ? 'open' : 'closed';
    } else {
      // Session crosses midnight in selected timezone
      return (currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes) ? 'open' : 'closed';
    }
  };

  const filteredTimezones = timezones.filter(tz =>
    tz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(filteredTimezones.map(tz => tz.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/25 mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Forex Market Hours
              </span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Track global trading sessions and optimize your trading strategy with real-time market hours across all major financial centers.
            </p>
          </div>

          {/* Current Time Display */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <div className="text-center">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-center text-white text-xs font-bold mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Current Time</h3>
                </div>

                {/* Time Display */}
                <div className="mb-4">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-mono tracking-wide">
                    {getCurrentTimeInTimezone()}
                  </div>
                </div>

                {/* Timezone Info */}
                <div className="flex items-center justify-center space-x-3 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                  <FlagIcon countryCode={getSelectedTimezoneObj().countryCode} className="w-8 h-6" />
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-800">
                      {getSelectedTimezoneObj().name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getSelectedTimezoneObj().country}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600 uppercase">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Timezone Selector */}
          <div className="max-w-6xl mx-auto mb-12" ref={timezoneContainerRef}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/25 mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Market Timezone Selector</h2>
                <p className="text-lg text-gray-600">View market hours and sessions in your preferred timezone</p>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-semibold text-gray-900">Select Your Timezone</h3>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                    <span className="text-sm font-bold text-green-800 flex items-center space-x-2">
                      <span>Currently: {getSelectedTimezoneObj().name}</span>
                      <FlagIcon countryCode={getSelectedTimezoneObj().countryCode} className="w-5 h-3" />
                    </span>
                  </div>
                </div>

                {/* Search bar - always visible */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search timezones..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value && !isTimezoneExpanded) {
                        setIsTimezoneExpanded(true);
                      }
                    }}
                    className="w-80 px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium"
                  />

                  {/* Search Icon */}
                  <svg className="absolute right-12 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>

                  {/* Clear Button - only show when there's search text */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      aria-label="Clear search"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Major Financial Centers - Always Visible */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Major Financial Centers</span>
                  </h3>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => {
                      setIsTimezoneExpanded(!isTimezoneExpanded);
                      // Don't clear search when collapsing - let users keep their search
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 rounded-xl transition-all duration-300 text-blue-700 hover:text-blue-800 font-semibold"
                  >
                    <span>{isTimezoneExpanded ? 'Show Less' : 'Show All Timezones'}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isTimezoneExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {['local', 'new_york', 'london', 'tokyo', 'sydney', 'utc'].map(tzId => {
                    const tz = timezones.find(t => t.id === tzId);
                    if (!tz) return null;
                    return (
                      <button
                        key={tz.id}
                        onClick={() => {
                          setSelectedTimezone(tz.id);
                          // Clear search and collapse expanded view when timezone is selected
                          setSearchTerm('');
                          setIsTimezoneExpanded(false);
                        }}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all duration-300 ${
                          selectedTimezone === tz.id
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl scale-105'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 text-gray-700 hover:text-green-700 shadow-lg hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        <FlagIcon countryCode={tz.countryCode} className="w-10 h-7" />
                        <div className="text-center">
                          <div className="font-bold text-sm">{tz.name}</div>
                          <div className={`text-xs ${selectedTimezone === tz.id ? 'text-green-100' : 'text-gray-500'}`}>
                            {tz.country}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All Timezones by Category - Only show when expanded or searching */}
              {(isTimezoneExpanded || searchTerm) && (
                <div className="border-t border-gray-200 pt-6">
                  {searchTerm && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-blue-800 font-medium">
                        {filteredTimezones.length > 0
                          ? `Found ${filteredTimezones.length} timezone${filteredTimezones.length !== 1 ? 's' : ''} matching "${searchTerm}"`
                          : `No timezones found matching "${searchTerm}"`
                        }
                      </p>
                    </div>
                  )}

                  {categories.map(category => {
                    const categoryTimezones = filteredTimezones.filter(tz => tz.category === category);
                    if (categoryTimezones.length === 0) return null;

                    return (
                      <div key={category} className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                          <span>{category}</span>
                          <span className="text-sm text-gray-500 font-normal">({categoryTimezones.length} locations)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {categoryTimezones.map(tz => (
                            <button
                              key={tz.id}
                              onClick={() => {
                                setSelectedTimezone(tz.id);
                                // Clear search and collapse expanded view when timezone is selected
                                setSearchTerm('');
                                setIsTimezoneExpanded(false);
                              }}
                              className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                                selectedTimezone === tz.id
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                                  : 'bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-lg'
                              }`}
                            >
                              <FlagIcon countryCode={tz.countryCode} className="w-8 h-6" />
                              <div className="text-left flex-1">
                                <div className="font-semibold">{tz.name}</div>
                                <div className={`text-sm ${selectedTimezone === tz.id ? 'text-green-100' : 'text-gray-500'}`}>
                                  {tz.country}
                                </div>
                              </div>
                              {selectedTimezone === tz.id && (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced 24-Hour Market Timeline */}
          <div className="max-w-7xl mx-auto mb-16">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl shadow-indigo-500/30 mb-8">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Global Market Timeline
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Real-time visualization of worldwide trading sessions with live market activity indicators and precise timezone synchronization
                </p>
              </div>

              {/* Enhanced Time Display Integration */}
              <div className="mb-10">
                <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selected Timezone Time */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <FlagIcon countryCode={getSelectedTimezoneObj().countryCode} className="w-8 h-6 mr-3" />
                        <h3 className="text-lg font-bold text-gray-800">
                          {getSelectedTimezoneObj().name}
                        </h3>
                      </div>
                      <div className="text-4xl font-black text-indigo-700 mb-2 font-mono tracking-wider">
                        {getCurrentTimeInTimezone()}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {getSelectedTimezoneObj().country}
                      </div>
                    </div>

                    {/* UTC Reference Time */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-8 h-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-sm flex items-center justify-center text-white text-xs font-bold mr-3">🌐</div>
                        <h3 className="text-lg font-bold text-gray-800">UTC Time</h3>
                      </div>
                      <div className="text-4xl font-black text-blue-700 mb-2 font-mono tracking-wider">
                        {currentTime.toLocaleTimeString('en-GB', {
                          timeZone: 'UTC',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        })}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Coordinated Universal Time
                      </div>
                    </div>
                  </div>

                  {/* Live Indicator */}
                  <div className="flex items-center justify-center mt-4 pt-4 border-t border-blue-200/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="text-sm font-bold text-green-600 uppercase tracking-wider">Live Updates</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stunning Enhanced Timeline Container */}
              <div className="relative">
                {/* Outer glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-3xl blur-xl"></div>

                {/* Main timeline container with enhanced styling */}
                <div className="relative h-80 bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 via-purple-50 to-pink-50 rounded-3xl overflow-hidden border-2 border-white/50 shadow-2xl shadow-indigo-500/20 backdrop-blur-sm">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 animate-pulse" style={{
                      backgroundImage: `
                        linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
                        linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
                        radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 3px, transparent 3px),
                        radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 2px, transparent 2px)
                      `,
                      backgroundSize: '4% 25%, 100% 25%, 60px 60px, 40px 40px'
                    }}></div>
                  </div>

                  {/* Floating orbs for ambient effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-4 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
                  </div>

                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>



                  {/* Enhanced hour markers with detailed styling */}
                  {Array.from({ length: 25 }, (_, i) => {
                    const convertedTime = convertUTCToSelectedTimezone(i);
                    const isMajorHour = i % 6 === 0;
                    const isMinorHour = i % 3 === 0 && !isMajorHour;

                    return (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 flex flex-col justify-between group cursor-pointer"
                        style={{ left: `${(i / 24) * 100}%` }}
                        title={`${convertedTime.timeString} - ${getSelectedTimezoneObj().name}`}
                      >
                        {/* Enhanced marker lines with glow effects */}
                        <div className={`relative w-px h-full transition-all duration-700 group-hover:scale-x-200 ${
                          isMajorHour
                            ? 'bg-gradient-to-b from-indigo-400 via-purple-500 via-pink-500 to-rose-500 shadow-2xl shadow-indigo-500/40'
                            : isMinorHour
                              ? 'bg-gradient-to-b from-blue-400 via-indigo-400 via-purple-400 to-violet-400 shadow-xl shadow-blue-400/30'
                              : 'bg-gradient-to-b from-gray-300 via-slate-400 to-gray-500 group-hover:from-blue-300 group-hover:via-indigo-400 group-hover:to-purple-400 group-hover:shadow-lg group-hover:shadow-blue-400/30'
                        }`}>
                          {/* Inner glow effect */}
                          <div className={`absolute inset-0 ${
                            isMajorHour
                              ? 'bg-gradient-to-b from-white/40 via-white/20 to-transparent'
                              : isMinorHour
                                ? 'bg-gradient-to-b from-white/30 via-white/15 to-transparent'
                                : 'group-hover:bg-gradient-to-b group-hover:from-white/20 group-hover:to-transparent'
                          }`}></div>

                          {/* Outer glow for major hours */}
                          {isMajorHour && (
                            <div className="absolute -inset-1 bg-gradient-to-b from-indigo-400/30 via-purple-400/30 to-pink-400/30 blur-sm animate-pulse"></div>
                          )}
                        </div>

                        {/* Enhanced time labels - Always visible */}
                        <div className={`absolute -bottom-12 left-0 transform -translate-x-1/2 transition-all duration-300 group-hover:scale-110 ${
                          isMajorHour
                            ? 'text-indigo-800 font-black text-sm bg-white/95 px-3 py-2 rounded-xl shadow-xl border-2 border-indigo-300'
                            : isMinorHour
                              ? 'text-blue-700 font-bold text-xs bg-white/90 px-2 py-1 rounded-lg shadow-lg border border-blue-200'
                              : 'text-gray-700 font-semibold text-xs bg-white/80 px-1.5 py-1 rounded-md shadow-md border border-gray-200 group-hover:text-indigo-600 group-hover:font-bold group-hover:bg-white/95'
                        }`}>
                          {convertedTime.timeString}
                        </div>

                        {/* Additional timezone label for major hours */}
                        {isMajorHour && (
                          <div className="absolute -bottom-20 left-0 transform -translate-x-1/2 text-xs text-gray-500 font-medium bg-gray-100/90 px-2 py-1 rounded-lg shadow-sm border border-gray-200">
                            {getSelectedTimezoneObj().name}
                          </div>
                        )}

                        {/* Period labels for major hours */}
                        {isMajorHour && (
                          <div className="absolute -bottom-16 left-0 transform -translate-x-1/2 text-xs font-bold transition-all duration-300 group-hover:scale-110">
                            <span className={`px-2 py-1 rounded-full text-white shadow-lg ${
                              convertedTime.hour === 0 ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                              convertedTime.hour >= 6 && convertedTime.hour < 12 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              convertedTime.hour === 12 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                              convertedTime.hour >= 18 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            }`}>
                              {convertedTime.hour === 0 ? 'Midnight' :
                               convertedTime.hour >= 6 && convertedTime.hour < 12 ? 'Morning' :
                               convertedTime.hour === 12 ? 'Noon' :
                               convertedTime.hour >= 18 ? 'Evening' : 'Afternoon'}
                            </span>
                          </div>
                        )}

                        {/* Hover indicator */}
                        <div className="absolute top-0 w-6 h-6 bg-indigo-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-indigo-500/50 animate-pulse">
                          <div className="absolute inset-0 bg-white rounded-full scale-50"></div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Enhanced Trading Session Bars with Tooltips */}
                  {tradingSessions.map((session, index) => {
                    // Convert session times to selected timezone for accurate positioning
                    const openTimeConverted = convertUTCToSelectedTimezone(
                      parseInt(session.openTime.split(':')[0]),
                      parseInt(session.openTime.split(':')[1])
                    );
                    const closeTimeConverted = convertUTCToSelectedTimezone(
                      parseInt(session.closeTime.split(':')[0]),
                      parseInt(session.closeTime.split(':')[1])
                    );

                    let startPercent = (openTimeConverted.hour + openTimeConverted.minute / 60) / 24 * 100;
                    let widthPercent;

                    if (closeTimeConverted.hour < openTimeConverted.hour ||
                        (closeTimeConverted.hour === openTimeConverted.hour && closeTimeConverted.minute < openTimeConverted.minute)) {
                      // Session spans midnight in selected timezone
                      widthPercent = ((24 - (openTimeConverted.hour + openTimeConverted.minute / 60) +
                                     (closeTimeConverted.hour + closeTimeConverted.minute / 60)) / 24) * 100;
                    } else {
                      widthPercent = (((closeTimeConverted.hour + closeTimeConverted.minute / 60) -
                                     (openTimeConverted.hour + openTimeConverted.minute / 60)) / 24) * 100;
                    }

                    const isOpen = isSessionOpen(session) === 'open';
                    const colors = {
                      blue: {
                        gradient: 'from-blue-500 via-cyan-500 to-blue-600',
                        shadow: 'shadow-blue-500/50',
                        glow: 'shadow-blue-500/70',
                        border: 'border-blue-400',
                        text: 'text-blue-100'
                      },
                      red: {
                        gradient: 'from-red-500 via-pink-500 to-red-600',
                        shadow: 'shadow-red-500/50',
                        glow: 'shadow-red-500/70',
                        border: 'border-red-400',
                        text: 'text-red-100'
                      },
                      green: {
                        gradient: 'from-green-500 via-emerald-500 to-green-600',
                        shadow: 'shadow-green-500/50',
                        glow: 'shadow-green-500/70',
                        border: 'border-green-400',
                        text: 'text-green-100'
                      },
                      purple: {
                        gradient: 'from-purple-500 via-violet-500 to-purple-600',
                        shadow: 'shadow-purple-500/50',
                        glow: 'shadow-purple-500/70',
                        border: 'border-purple-400',
                        text: 'text-purple-100'
                      }
                    };

                    const sessionColor = colors[session.color as keyof typeof colors];

                    return (
                      <div key={session.name}>
                        {/* Stunning session bar with enhanced styling */}
                        <div
                          className={`absolute h-16 bg-gradient-to-r ${sessionColor.gradient} rounded-3xl transition-all duration-1000 transform hover:scale-110 hover:-translate-y-2 cursor-pointer group border-3 ${sessionColor.border} backdrop-blur-sm ${
                            isOpen
                              ? `opacity-100 ${sessionColor.glow} shadow-2xl animate-pulse`
                              : `opacity-85 ${sessionColor.shadow} shadow-xl hover:opacity-100`
                          }`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                            top: `${40 + index * 40}px`
                          }}
                          title={`${session.name} Session: ${openTimeConverted.timeString} - ${closeTimeConverted.timeString} (${getSelectedTimezoneObj().name})`}
                        >
                          {/* Multi-layer glow effects */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-white/20 rounded-3xl"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-3xl"></div>

                          {/* Animated border for active sessions */}
                          {isOpen && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-white/40 via-white/60 to-white/40 rounded-3xl animate-pulse blur-sm"></div>
                          )}

                          {/* Content */}
                          <div className="relative flex items-center justify-between h-full px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <FlagIcon countryCode={session.countryCode} className="w-6 h-4" />
                              </div>
                              <div>
                                <span className="text-white font-bold text-sm tracking-wide">{session.city}</span>
                                <div className="text-white/80 text-xs font-medium">{session.name}</div>
                              </div>
                            </div>

                            {/* Status indicators */}
                            <div className="flex items-center space-x-2">
                              {isOpen ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                                  <span className="text-white text-xs font-bold uppercase tracking-wider">LIVE</span>
                                </div>
                              ) : (
                                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                              )}
                            </div>
                          </div>

                          {/* Animated border for active sessions */}
                          {isOpen && (
                            <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-pulse"></div>
                          )}
                        </div>

                        {/* Handle midnight spanning sessions */}
                        {(closeTimeConverted.hour < openTimeConverted.hour ||
                         (closeTimeConverted.hour === openTimeConverted.hour && closeTimeConverted.minute < openTimeConverted.minute)) && (
                          <div
                            className={`absolute h-12 bg-gradient-to-r ${sessionColor.gradient} rounded-2xl transition-all duration-700 transform hover:scale-110 hover:-translate-y-1 cursor-pointer group border-2 ${sessionColor.border} ${
                              isOpen
                                ? `opacity-100 ${sessionColor.glow} shadow-2xl animate-pulse`
                                : `opacity-80 ${sessionColor.shadow} shadow-xl hover:opacity-95`
                            }`}
                            style={{
                              left: '0%',
                              width: `${((closeTimeConverted.hour + closeTimeConverted.minute / 60) / 24) * 100}%`,
                              top: `${30 + index * 32}px`
                            }}
                            title={`${session.name} Session: ${openTimeConverted.timeString} - ${closeTimeConverted.timeString} (${getSelectedTimezoneObj().name})`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 rounded-xl"></div>
                            <div className="relative flex items-center justify-between h-full px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                  <FlagIcon countryCode={session.countryCode} className="w-6 h-4" />
                                </div>
                                <div>
                                  <span className="text-white font-bold text-sm tracking-wide">{session.city}</span>
                                  <div className="text-white/80 text-xs font-medium">{session.name}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isOpen ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                                    <span className="text-white text-xs font-bold uppercase tracking-wider">LIVE</span>
                                  </div>
                                ) : (
                                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            {isOpen && (
                              <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-pulse"></div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Enhanced Current Time Indicator with Smooth Transitions */}
                  <div
                    className="absolute top-0 bottom-0 z-30 transition-all duration-1000 ease-in-out"
                    style={{
                      left: `${(() => {
                        const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
                        return ((timeInSelectedTz.getHours() + timeInSelectedTz.getMinutes() / 60) / 24) * 100;
                      })()}%`
                    }}
                  >
                    {/* Enhanced main indicator line */}
                    <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-300 via-orange-400 via-red-500 to-pink-600 shadow-2xl shadow-orange-500/60 rounded-full animate-pulse">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
                    </div>

                    {/* Enhanced top indicator */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full shadow-2xl shadow-orange-500/70 animate-pulse border-3 border-white">
                          <div className="absolute inset-1 bg-gradient-to-br from-white/50 to-transparent rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full animate-ping opacity-60"></div>
                        <div className="absolute inset-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-ping opacity-40 animation-delay-300"></div>
                      </div>
                    </div>

                    {/* Enhanced time label with better styling */}
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                      <div className="relative">
                        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap shadow-2xl shadow-red-500/50 border border-white/20">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                            <span className="tracking-wider">LIVE NOW</span>
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg animation-delay-500"></div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                        </div>
                        {/* Arrow pointer */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-orange-500"></div>
                      </div>
                    </div>

                    {/* Current time display */}
                    <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg border border-gray-200">
                        {getCurrentTimeInTimezone()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Legend */}
                <div className="mt-8 flex flex-wrap justify-center gap-6">
                  {tradingSessions.map((session) => {
                    const isOpen = isSessionOpen(session) === 'open';
                    const colors = {
                      blue: 'from-blue-500 to-blue-600',
                      red: 'from-red-500 to-red-600',
                      green: 'from-green-500 to-green-600',
                      purple: 'from-purple-500 to-purple-600'
                    };

                    return (
                      <div key={session.name} className="flex items-center space-x-3 group">
                        <div className={`w-4 h-4 bg-gradient-to-r ${colors[session.color as keyof typeof colors]} rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                          isOpen ? 'animate-pulse' : ''
                        }`}></div>
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{session.city}</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                            isOpen
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isOpen ? 'OPEN' : 'CLOSED'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced Time Scale Bar */}
                <div className="mt-12 relative">
                  <div className="bg-gradient-to-r from-slate-100 via-blue-100 via-indigo-100 to-purple-100 rounded-2xl p-4 border-2 border-white/50 shadow-xl backdrop-blur-sm">
                    <div className="relative h-16">
                      {/* Time scale background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl"></div>

                      {/* Major time markers (every 2 hours) */}
                      {Array.from({ length: 13 }, (_, i) => {
                        const hour = i * 2;
                        const convertedTime = convertUTCToSelectedTimezone(hour);
                        return (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 flex flex-col justify-between items-center group cursor-pointer"
                            style={{ left: `${(hour / 24) * 100}%` }}
                          >
                            {/* Marker line */}
                            <div className="w-1 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg group-hover:scale-x-150 transition-all duration-300"></div>

                            {/* Time label */}
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 px-3 py-1 rounded-xl shadow-lg border border-indigo-200 group-hover:scale-110 transition-all duration-300">
                              <div className="text-sm font-black text-indigo-800">{convertedTime.timeString}</div>
                            </div>

                            {/* Timezone indicator for key hours */}
                            {(hour === 0 || hour === 6 || hour === 12 || hour === 18) && (
                              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600 bg-gray-100/90 px-2 py-1 rounded-lg shadow-sm">
                                {getSelectedTimezoneObj().name}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Minor time markers (every hour) */}
                      {Array.from({ length: 24 }, (_, i) => {
                        if (i % 2 !== 0) { // Only odd hours (not covered by major markers)
                          const convertedTime = convertUTCToSelectedTimezone(i);
                          return (
                            <div
                              key={`minor-${i}`}
                              className="absolute top-2 bottom-2 flex items-center group"
                              style={{ left: `${(i / 24) * 100}%` }}
                            >
                              <div className="w-px h-full bg-gradient-to-b from-gray-400 to-gray-500 group-hover:bg-gradient-to-b group-hover:from-blue-400 group-hover:to-indigo-400 transition-all duration-300"></div>
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 px-1 py-0.5 rounded shadow-sm">
                                {convertedTime.timeString}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}

                      {/* Enhanced current time indicator */}
                      <div
                        className="absolute top-0 bottom-0 z-10 transition-all duration-1000 ease-in-out"
                        style={{
                          left: `${(() => {
                            const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
                            return ((timeInSelectedTz.getHours() + timeInSelectedTz.getMinutes() / 60) / 24) * 100;
                          })()}%`
                        }}
                      >
                        {/* Main indicator line */}
                        <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 via-red-500 to-pink-600 rounded-full shadow-2xl shadow-orange-500/60 animate-pulse"></div>

                        {/* Top indicator */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white shadow-xl animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-ping opacity-60"></div>
                          </div>
                        </div>

                        {/* Current time display */}
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap shadow-xl border border-white/20">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span>NOW: {getCurrentTimeInTimezone()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Global Trading Sessions */}
          <div className="max-w-7xl mx-auto mb-16">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/25 mb-8">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Global Trading Sessions
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Comprehensive overview of major forex trading sessions with real-time status, market characteristics, and optimal trading opportunities
                </p>
              </div>

              {/* Trading Sessions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {tradingSessions.map((session, index) => {
                  const isOpen = isSessionOpen(session) === 'open';
                  const openTime = (() => {
                    const [hour, minute] = session.openTime.split(':').map(Number);
                    return convertUTCToSelectedTimezone(hour, minute);
                  })();
                  const closeTime = (() => {
                    const [hour, minute] = session.closeTime.split(':').map(Number);
                    return convertUTCToSelectedTimezone(hour, minute);
                  })();

                  // Session-specific data
                  const sessionData = {
                    Sydney: {
                      volume: '7%',
                      pairs: ['AUD/USD', 'AUD/JPY', 'NZD/USD'],
                      characteristics: ['Low volatility', 'Thin liquidity', 'Gap trading'],
                      peakHours: '01:00 - 04:00 UTC',
                      description: 'Kicks off the trading week with moderate activity'
                    },
                    Tokyo: {
                      volume: '19%',
                      pairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
                      characteristics: ['Asian volatility', 'JPY strength', 'Range trading'],
                      peakHours: '01:00 - 06:00 UTC',
                      description: 'Major Asian session with significant JPY movement'
                    },
                    London: {
                      volume: '43%',
                      pairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP'],
                      characteristics: ['High volatility', 'Major trends', 'News impact'],
                      peakHours: '08:00 - 12:00 UTC',
                      description: 'Largest trading session with maximum liquidity'
                    },
                    'New York': {
                      volume: '31%',
                      pairs: ['USD/CAD', 'USD/CHF', 'EUR/USD'],
                      characteristics: ['USD strength', 'Economic data', 'Trend continuation'],
                      peakHours: '13:00 - 17:00 UTC',
                      description: 'Major USD session with strong institutional activity'
                    }
                  };

                  const data = sessionData[session.name as keyof typeof sessionData];

                  return (
                    <div key={session.name} className={`relative overflow-hidden rounded-3xl transition-all duration-500 transform hover:scale-[1.02] ${
                      isOpen
                        ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-2xl shadow-green-500/20'
                        : 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border border-gray-200 shadow-xl hover:shadow-2xl'
                    }`}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 20% 50%, ${isOpen ? '#10b981' : '#6b7280'} 2px, transparent 2px)`,
                          backgroundSize: '30px 30px'
                        }}></div>
                      </div>

                      {/* Content */}
                      <div className="relative p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
                              isOpen
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}>
                              <FlagIcon countryCode={session.countryCode} className="w-10 h-7" />
                            </div>
                            <div>
                              <h3 className={`text-2xl font-black mb-1 ${isOpen ? 'text-green-800' : 'text-gray-700'}`}>
                                {session.city}
                              </h3>
                              <p className={`text-sm font-semibold ${isOpen ? 'text-green-600' : 'text-gray-500'}`}>
                                {session.name} Trading Session
                              </p>
                              <p className={`text-xs ${isOpen ? 'text-green-500' : 'text-gray-400'}`}>
                                {data.description}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all duration-300 ${
                            isOpen
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 animate-pulse'
                              : 'bg-gray-300 text-gray-700'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></div>
                              <span>{isOpen ? 'LIVE NOW' : 'CLOSED'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Trading Hours */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className={`p-4 rounded-2xl ${isOpen ? 'bg-green-100/50' : 'bg-gray-100/50'}`}>
                            <div className="text-xs font-semibold text-gray-600 mb-1">OPENS</div>
                            <div className={`text-lg font-bold ${isOpen ? 'text-green-800' : 'text-gray-700'}`}>
                              {openTime.timeString}
                            </div>
                          </div>
                          <div className={`p-4 rounded-2xl ${isOpen ? 'bg-green-100/50' : 'bg-gray-100/50'}`}>
                            <div className="text-xs font-semibold text-gray-600 mb-1">CLOSES</div>
                            <div className={`text-lg font-bold ${isOpen ? 'text-green-800' : 'text-gray-700'}`}>
                              {closeTime.timeString}
                            </div>
                          </div>
                        </div>

                        {/* Market Volume */}
                        <div className={`p-4 rounded-2xl mb-6 ${isOpen ? 'bg-green-100/50' : 'bg-gray-100/50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-600">Daily Volume Share</span>
                            <span className={`text-2xl font-black ${isOpen ? 'text-green-700' : 'text-gray-700'}`}>
                              {data.volume}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                isOpen ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'
                              }`}
                              style={{ width: data.volume }}
                            ></div>
                          </div>
                        </div>

                        {/* Major Currency Pairs */}
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-3">MAJOR PAIRS</h4>
                          <div className="flex flex-wrap gap-2">
                            {data.pairs.map((pair, pairIndex) => (
                              <span
                                key={pairIndex}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-300 ${
                                  isOpen
                                    ? 'bg-green-200 text-green-800 hover:bg-green-300'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {pair}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Market Characteristics */}
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-3">CHARACTERISTICS</h4>
                          <div className="space-y-2">
                            {data.characteristics.map((char, charIndex) => (
                              <div key={charIndex} className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">{char}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Peak Hours */}
                        <div className={`p-4 rounded-2xl border-l-4 ${
                          isOpen
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-400'
                        }`}>
                          <div className="text-xs font-semibold text-gray-600 mb-1">PEAK ACTIVITY</div>
                          <div className={`text-sm font-bold ${isOpen ? 'text-green-700' : 'text-gray-700'}`}>
                            {data.peakHours}
                          </div>
                        </div>
                      </div>

                      {/* Animated Border for Active Sessions */}
                      {isOpen && (
                        <div className="absolute inset-0 rounded-3xl border-2 border-green-400 animate-pulse pointer-events-none"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Session Overlap Information */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-blue-200/50">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/25 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Overlaps</h3>
                  <p className="text-gray-600">Maximum trading opportunities occur during session overlaps</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex -space-x-2">
                        <FlagIcon countryCode="au" className="w-8 h-6 border-2 border-white rounded" />
                        <FlagIcon countryCode="jp" className="w-8 h-6 border-2 border-white rounded" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Sydney + Tokyo</h4>
                        <p className="text-sm text-gray-600">00:00 - 07:00 UTC</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Moderate activity with AUD/JPY focus</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex -space-x-2">
                        <FlagIcon countryCode="jp" className="w-8 h-6 border-2 border-white rounded" />
                        <FlagIcon countryCode="gb" className="w-8 h-6 border-2 border-white rounded" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Tokyo + London</h4>
                        <p className="text-sm text-gray-600">08:00 - 09:00 UTC</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">High volatility with EUR/JPY, GBP/JPY</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex -space-x-2">
                        <FlagIcon countryCode="gb" className="w-8 h-6 border-2 border-white rounded" />
                        <FlagIcon countryCode="us" className="w-8 h-6 border-2 border-white rounded" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">London + New York</h4>
                        <p className="text-sm text-gray-600">13:00 - 17:00 UTC</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Peak activity with EUR/USD, GBP/USD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Analysis Chart */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Trading Volume Analysis</h2>
                <p className="text-gray-600">24-hour volume intensity across different trading sessions</p>
              </div>

              {/* Volume Chart */}
              <div className="relative h-64 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl overflow-hidden border border-gray-200/50">
                <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {Array.from({ length: 25 }, (_, i) => (
                    <line
                      key={i}
                      x1={(i / 24) * 1000}
                      y1="0"
                      x2={(i / 24) * 1000}
                      y2="200"
                      stroke="rgba(156, 163, 175, 0.3)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Volume data points - Timezone Aware */}
                  {(() => {
                    const volumeData = Array.from({ length: 24 }, (_, hourInSelectedTz) => {
                      // Convert selected timezone hour back to UTC for session calculations
                      const utcHour = (() => {
                        // Create a date in the selected timezone
                        const now = new Date();
                        const selectedTzDate = new Date(now.toLocaleString("en-US", { timeZone: getSelectedTimezoneObj().timezone }));
                        const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
                        const offsetHours = (utcDate.getTime() - selectedTzDate.getTime()) / (1000 * 60 * 60);

                        let calculatedUtcHour = (hourInSelectedTz + offsetHours) % 24;
                        if (calculatedUtcHour < 0) calculatedUtcHour += 24;
                        return Math.floor(calculatedUtcHour);
                      })();

                      // Simulate volume based on session overlaps (using UTC hours for session logic)
                      let volume = 20; // Base volume

                      // Sydney session (22:00-07:00 UTC)
                      if ((utcHour >= 22) || (utcHour <= 7)) volume += 30;

                      // Tokyo session (00:00-09:00 UTC)
                      if (utcHour >= 0 && utcHour <= 9) volume += 40;

                      // London session (08:00-17:00 UTC)
                      if (utcHour >= 8 && utcHour <= 17) volume += 60;

                      // New York session (13:00-22:00 UTC)
                      if (utcHour >= 13 && utcHour <= 22) volume += 50;

                      // Add some randomness
                      volume += Math.random() * 20 - 10;

                      return Math.max(20, Math.min(100, volume));
                    });

                    const pathData = volumeData.map((volume, index) => {
                      const x = (index / 23) * 1000;
                      const y = 200 - (volume / 100) * 180;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ');

                    const areaData = `M 0 200 ${volumeData.map((volume, index) => {
                      const x = (index / 23) * 1000;
                      const y = 200 - (volume / 100) * 180;
                      return `L ${x} ${y}`;
                    }).join(' ')} L 1000 200 Z`;

                    return (
                      <>
                        {/* Area fill */}
                        <path
                          d={areaData}
                          fill="url(#volumeGradient)"
                          opacity="0.6"
                        />

                        {/* Volume line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="url(#volumeLineGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Current time indicator - Timezone Aware */}
                        <line
                          x1={(() => {
                            const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
                            return ((timeInSelectedTz.getHours() + timeInSelectedTz.getMinutes() / 60) / 24) * 1000;
                          })()}
                          y1="0"
                          x2={(() => {
                            const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
                            return ((timeInSelectedTz.getHours() + timeInSelectedTz.getMinutes() / 60) / 24) * 1000;
                          })()}
                          y2="200"
                          stroke="#f59e0b"
                          strokeWidth="3"
                          strokeDasharray="6,4"
                          className="animate-pulse"
                        />

                        {/* Current volume point - Enhanced */}
                        <circle
                          cx={(() => {
                            const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
                            return ((timeInSelectedTz.getHours() + timeInSelectedTz.getMinutes() / 60) / 24) * 1000;
                          })()}
                          cy={(() => {
                            const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
                            const currentHour = timeInSelectedTz.getHours();
                            return 200 - (volumeData[currentHour] / 100) * 180;
                          })()}
                          r="6"
                          fill="#f59e0b"
                          stroke="white"
                          strokeWidth="3"
                          className="animate-pulse"
                        />

                        {/* Current time label on volume chart */}
                        <text
                          x={(() => {
                            const timeInSelectedTz = getCurrentTimeInSelectedTimezone();
                            return ((timeInSelectedTz.getHours() + timeInSelectedTz.getMinutes() / 60) / 24) * 1000;
                          })()}
                          y="15"
                          textAnchor="middle"
                          className="text-xs font-bold fill-orange-600"
                        >
                          NOW
                        </text>
                      </>
                    );
                  })()}

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                      <stop offset="50%" stopColor="rgba(147, 51, 234, 0.3)" />
                      <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
                    </linearGradient>

                    <linearGradient id="volumeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="25%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="75%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Hour labels - Timezone Aware */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-xs">
                  {Array.from({ length: 13 }, (_, i) => {
                    const hour = i * 2;
                    const convertedTime = convertUTCToSelectedTimezone(hour);
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <span className="font-bold text-indigo-700">{convertedTime.timeString}</span>
                        <span className="text-gray-500 text-xs mt-1">{getSelectedTimezoneObj().name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volume Legend */}
              <div className="flex items-center justify-center space-x-8 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">High Volume</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Medium Volume</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Low Volume</span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-10 border border-blue-200/50 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/25 mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Market Hours Matter
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Understanding forex market hours is crucial for successful trading. Here's what you need to know:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Session Overlaps</h4>
                      <p className="text-gray-600">The highest volatility occurs when major sessions overlap, particularly London-New York (8 AM - 12 PM EST).</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Optimal Trading Times</h4>
                      <p className="text-gray-600">Plan your trades around high-activity periods for better liquidity and tighter spreads.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Weekend Closures</h4>
                      <p className="text-gray-600">Forex markets close Friday 5 PM EST and reopen Sunday 5 PM EST. Plan accordingly for gap risks.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Currency Strength</h4>
                      <p className="text-gray-600">Each session favors certain currency pairs based on regional economic activity and news releases.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
