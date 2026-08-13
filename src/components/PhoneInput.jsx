import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export const COUNTRIES = [
  { name: 'Afghanistan', iso: 'AF', code: '93' },
  { name: 'Albania', iso: 'AL', code: '355' },
  { name: 'Algeria', iso: 'DZ', code: '213' },
  { name: 'American Samoa', iso: 'AS', code: '1684' },
  { name: 'Andorra', iso: 'AD', code: '376' },
  { name: 'Angola', iso: 'AO', code: '244' },
  { name: 'Anguilla', iso: 'AI', code: '1264' },
  { name: 'Antarctica', iso: 'AQ', code: '672' },
  { name: 'Antigua and Barbuda', iso: 'AG', code: '1268' },
  { name: 'Argentina', iso: 'AR', code: '54' },
  { name: 'Armenia', iso: 'AM', code: '374' },
  { name: 'Aruba', iso: 'AW', code: '297' },
  { name: 'Ascension Island', iso: 'AC', code: '247' },
  { name: 'Australia', iso: 'AU', code: '61' },
  { name: 'Austria', iso: 'AT', code: '43' },
  { name: 'Azerbaijan', iso: 'AZ', code: '994' },
  { name: 'Bahamas', iso: 'BS', code: '1242' },
  { name: 'Bahrain', iso: 'BH', code: '973' },
  { name: 'Bangladesh', iso: 'BD', code: '880' },
  { name: 'Barbados', iso: 'BB', code: '1246' },
  { name: 'Belarus', iso: 'BY', code: '375' },
  { name: 'Belgium', iso: 'BE', code: '32' },
  { name: 'Belize', iso: 'BZ', code: '501' },
  { name: 'Benin', iso: 'BJ', code: '229' },
  { name: 'Bermuda', iso: 'BM', code: '1441' },
  { name: 'Bhutan', iso: 'BT', code: '975' },
  { name: 'Bolivia', iso: 'BO', code: '591' },
  { name: 'Bosnia and Herzegovina', iso: 'BA', code: '387' },
  { name: 'Botswana', iso: 'BW', code: '267' },
  { name: 'Brazil', iso: 'BR', code: '55' },
  { name: 'British Virgin Islands', iso: 'VG', code: '1284' },
  { name: 'Brunei', iso: 'BN', code: '673' },
  { name: 'Bulgaria', iso: 'BG', code: '359' },
  { name: 'Burkina Faso', iso: 'BF', code: '226' },
  { name: 'Burma (Myanmar)', iso: 'MM', code: '95' },
  { name: 'Burundi', iso: 'BI', code: '257' },
  { name: 'Cambodia', iso: 'KH', code: '855' },
  { name: 'Cameroon', iso: 'CM', code: '237' },
  { name: 'Canada', iso: 'CA', code: '1' },
  { name: 'Cape Verde', iso: 'CV', code: '238' },
  { name: 'Cayman Islands', iso: 'KY', code: '1345' },
  { name: 'Central African Republic', iso: 'CF', code: '236' },
  { name: 'Chad', iso: 'TD', code: '235' },
  { name: 'Chile', iso: 'CL', code: '56' },
  { name: 'China', iso: 'CN', code: '86' },
  { name: 'Colombia', iso: 'CO', code: '57' },
  { name: 'Comoros', iso: 'KM', code: '269' },
  { name: 'Congo', iso: 'CG', code: '242' },
  { name: 'Congo (DRC)', iso: 'CD', code: '243' },
  { name: 'Cook Islands', iso: 'CK', code: '682' },
  { name: 'Costa Rica', iso: 'CR', code: '506' },
  { name: 'Croatia', iso: 'HR', code: '385' },
  { name: 'Cuba', iso: 'CU', code: '53' },
  { name: 'Cyprus', iso: 'CY', code: '357' },
  { name: 'Czech Republic', iso: 'CZ', code: '420' },
  { name: 'Denmark', iso: 'DK', code: '45' },
  { name: 'Djibouti', iso: 'DJ', code: '253' },
  { name: 'Dominica', iso: 'DM', code: '1767' },
  { name: 'Dominican Republic', iso: 'DO', code: '1809' },
  { name: 'Ecuador', iso: 'EC', code: '593' },
  { name: 'Egypt', iso: 'EG', code: '20' },
  { name: 'El Salvador', iso: 'SV', code: '503' },
  { name: 'Equatorial Guinea', iso: 'GQ', code: '240' },
  { name: 'Eritrea', iso: 'ER', code: '291' },
  { name: 'Estonia', iso: 'EE', code: '372' },
  { name: 'Ethiopia', iso: 'ET', code: '251' },
  { name: 'Falkland Islands', iso: 'FK', code: '500' },
  { name: 'Faroe Islands', iso: 'FO', code: '298' },
  { name: 'Fiji', iso: 'FJ', code: '679' },
  { name: 'Finland', iso: 'FI', code: '358' },
  { name: 'France', iso: 'FR', code: '33' },
  { name: 'French Guiana', iso: 'GF', code: '594' },
  { name: 'French Polynesia', iso: 'PF', code: '689' },
  { name: 'Gabon', iso: 'GA', code: '241' },
  { name: 'Gambia', iso: 'GM', code: '220' },
  { name: 'Georgia', iso: 'GE', code: '995' },
  { name: 'Germany', iso: 'DE', code: '49' },
  { name: 'Ghana', iso: 'GH', code: '233' },
  { name: 'Gibraltar', iso: 'GI', code: '350' },
  { name: 'Greece', iso: 'GR', code: '30' },
  { name: 'Greenland', iso: 'GL', code: '299' },
  { name: 'Grenada', iso: 'GD', code: '1473' },
  { name: 'Guadeloupe', iso: 'GP', code: '590' },
  { name: 'Guam', iso: 'GU', code: '1671' },
  { name: 'Guatemala', iso: 'GT', code: '502' },
  { name: 'Guinea', iso: 'GN', code: '224' },
  { name: 'Guinea-Bissau', iso: 'GW', code: '245' },
  { name: 'Guyana', iso: 'GY', code: '592' },
  { name: 'Haiti', iso: 'HT', code: '509' },
  { name: 'Honduras', iso: 'HN', code: '504' },
  { name: 'Hong Kong', iso: 'HK', code: '852' },
  { name: 'Hungary', iso: 'HU', code: '36' },
  { name: 'Iceland', iso: 'IS', code: '354' },
  { name: 'India', iso: 'IN', code: '91' },
  { name: 'Indonesia', iso: 'ID', code: '62' },
  { name: 'Iran', iso: 'IR', code: '98' },
  { name: 'Iraq', iso: 'IQ', code: '964' },
  { name: 'Ireland', iso: 'IE', code: '353' },
  { name: 'Israel', iso: 'IL', code: '972' },
  { name: 'Italy', iso: 'IT', code: '39' },
  { name: 'Ivory Coast', iso: 'CI', code: '225' },
  { name: 'Jamaica', iso: 'JM', code: '1876' },
  { name: 'Japan', iso: 'JP', code: '81' },
  { name: 'Jordan', iso: 'JO', code: '962' },
  { name: 'Kazakhstan', iso: 'KZ', code: '7' },
  { name: 'Kenya', iso: 'KE', code: '254' },
  { name: 'Kiribati', iso: 'KI', code: '686' },
  { name: 'Kuwait', iso: 'KW', code: '965' },
  { name: 'Kyrgyzstan', iso: 'KG', code: '996' },
  { name: 'Laos', iso: 'LA', code: '856' },
  { name: 'Latvia', iso: 'LV', code: '371' },
  { name: 'Lebanon', iso: 'LB', code: '961' },
  { name: 'Lesotho', iso: 'LS', code: '266' },
  { name: 'Liberia', iso: 'LR', code: '231' },
  { name: 'Libya', iso: 'LY', code: '218' },
  { name: 'Liechtenstein', iso: 'LI', code: '423' },
  { name: 'Lithuania', iso: 'LT', code: '370' },
  { name: 'Luxembourg', iso: 'LU', code: '352' },
  { name: 'Macau', iso: 'MO', code: '853' },
  { name: 'Macedonia', iso: 'MK', code: '389' },
  { name: 'Madagascar', iso: 'MG', code: '261' },
  { name: 'Malawi', iso: 'MW', code: '265' },
  { name: 'Malaysia', iso: 'MY', code: '60' },
  { name: 'Maldives', iso: 'MV', code: '960' },
  { name: 'Mali', iso: 'ML', code: '223' },
  { name: 'Malta', iso: 'MT', code: '356' },
  { name: 'Marshall Islands', iso: 'MH', code: '692' },
  { name: 'Martinique', iso: 'MQ', code: '596' },
  { name: 'Mauritania', iso: 'MR', code: '222' },
  { name: 'Mauritius', iso: 'MU', code: '230' },
  { name: 'Mexico', iso: 'MX', code: '52' },
  { name: 'Micronesia', iso: 'FM', code: '691' },
  { name: 'Moldova', iso: 'MD', code: '373' },
  { name: 'Monaco', iso: 'MC', code: '377' },
  { name: 'Mongolia', iso: 'MN', code: '976' },
  { name: 'Montenegro', iso: 'ME', code: '382' },
  { name: 'Montserrat', iso: 'MS', code: '1664' },
  { name: 'Morocco', iso: 'MA', code: '212' },
  { name: 'Mozambique', iso: 'MZ', code: '258' },
  { name: 'Namibia', iso: 'NA', code: '264' },
  { name: 'Nauru', iso: 'NR', code: '674' },
  { name: 'Nepal', iso: 'NP', code: '977' },
  { name: 'Netherlands', iso: 'NL', code: '31' },
  { name: 'New Caledonia', iso: 'NC', code: '687' },
  { name: 'New Zealand', iso: 'NZ', code: '64' },
  { name: 'Nicaragua', iso: 'NI', code: '505' },
  { name: 'Niger', iso: 'NE', code: '227' },
  { name: 'Nigeria', iso: 'NG', code: '234' },
  { name: 'Niue', iso: 'NU', code: '683' },
  { name: 'North Korea', iso: 'KP', code: '850' },
  { name: 'Norway', iso: 'NO', code: '47' },
  { name: 'Oman', iso: 'OM', code: '968' },
  { name: 'Pakistan', iso: 'PK', code: '92' },
  { name: 'Palau', iso: 'PW', code: '680' },
  { name: 'Palestine', iso: 'PS', code: '970' },
  { name: 'Panama', iso: 'PA', code: '507' },
  { name: 'Papua New Guinea', iso: 'PG', code: '675' },
  { name: 'Paraguay', iso: 'PY', code: '595' },
  { name: 'Peru', iso: 'PE', code: '51' },
  { name: 'Philippines', iso: 'PH', code: '63' },
  { name: 'Poland', iso: 'PL', code: '48' },
  { name: 'Portugal', iso: 'PT', code: '351' },
  { name: 'Puerto Rico', iso: 'PR', code: '1787' },
  { name: 'Qatar', iso: 'QA', code: '974' },
  { name: 'Reunion', iso: 'RE', code: '262' },
  { name: 'Romania', iso: 'RO', code: '40' },
  { name: 'Russia', iso: 'RU', code: '7' },
  { name: 'Rwanda', iso: 'RW', code: '250' },
  { name: 'Saint Kitts and Nevis', iso: 'KN', code: '1869' },
  { name: 'Saint Lucia', iso: 'LC', code: '1758' },
  { name: 'Saint Vincent', iso: 'VC', code: '1784' },
  { name: 'Samoa', iso: 'WS', code: '685' },
  { name: 'San Marino', iso: 'SM', code: '378' },
  { name: 'Saudi Arabia', iso: 'SA', code: '966' },
  { name: 'Senegal', iso: 'SN', code: '221' },
  { name: 'Serbia', iso: 'RS', code: '381' },
  { name: 'Seychelles', iso: 'SC', code: '248' },
  { name: 'Sierra Leone', iso: 'SL', code: '232' },
  { name: 'Singapore', iso: 'SG', code: '65' },
  { name: 'Slovakia', iso: 'SK', code: '421' },
  { name: 'Slovenia', iso: 'SI', code: '386' },
  { name: 'Solomon Islands', iso: 'SB', code: '677' },
  { name: 'Somalia', iso: 'SO', code: '252' },
  { name: 'South Africa', iso: 'ZA', code: '27' },
  { name: 'South Korea', iso: 'KR', code: '82' },
  { name: 'South Sudan', iso: 'SS', code: '211' },
  { name: 'Spain', iso: 'ES', code: '34' },
  { name: 'Sri Lanka', iso: 'LK', code: '94' },
  { name: 'Sudan', iso: 'SD', code: '249' },
  { name: 'Suriname', iso: 'SR', code: '597' },
  { name: 'Swaziland', iso: 'SZ', code: '268' },
  { name: 'Sweden', iso: 'SE', code: '46' },
  { name: 'Switzerland', iso: 'CH', code: '41' },
  { name: 'Syria', iso: 'SY', code: '963' },
  { name: 'Taiwan', iso: 'TW', code: '886' },
  { name: 'Tajikistan', iso: 'TJ', code: '992' },
  { name: 'Tanzania', iso: 'TZ', code: '255' },
  { name: 'Thailand', iso: 'TH', code: '66' },
  { name: 'Timor-Leste', iso: 'TL', code: '670' },
  { name: 'Togo', iso: 'TG', code: '228' },
  { name: 'Tonga', iso: 'TO', code: '676' },
  { name: 'Trinidad and Tobago', iso: 'TT', code: '1868' },
  { name: 'Tunisia', iso: 'TN', code: '216' },
  { name: 'Turkey', iso: 'TR', code: '90' },
  { name: 'Turkmenistan', iso: 'TM', code: '993' },
  { name: 'Turks and Caicos', iso: 'TC', code: '1649' },
  { name: 'Tuvalu', iso: 'TV', code: '688' },
  { name: 'Uganda', iso: 'UG', code: '256' },
  { name: 'Ukraine', iso: 'UA', code: '380' },
  { name: 'United Arab Emirates', iso: 'AE', code: '971' },
  { name: 'United Kingdom', iso: 'GB', code: '44' },
  { name: 'United States', iso: 'US', code: '1' },
  { name: 'Uruguay', iso: 'UY', code: '598' },
  { name: 'Uzbekistan', iso: 'UZ', code: '998' },
  { name: 'Vanuatu', iso: 'VU', code: '678' },
  { name: 'Vatican City', iso: 'VA', code: '379' },
  { name: 'Venezuela', iso: 'VE', code: '58' },
  { name: 'Vietnam', iso: 'VN', code: '84' },
  { name: 'Virgin Islands (US)', iso: 'VI', code: '1340' },
  { name: 'Yemen', iso: 'YE', code: '967' },
  { name: 'Zambia', iso: 'ZM', code: '260' },
  { name: 'Zimbabwe', iso: 'ZW', code: '263' },
];

// Stored format: "ISO:+dialCodenumber" e.g. "US:+11234567890"
export function parsePhone(value = '') {
  if (value.includes(':')) {
    const [iso, rest] = value.split(':');
    const country = COUNTRIES.find(c => c.iso === iso);
    if (country) return { iso, dialCode: country.code, number: rest.slice(country.code.length + 1) };
  }
  if (!value.startsWith('+')) return { iso: 'IN', dialCode: '91', number: value };
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  const match = sorted.find(c => value.startsWith(`+${c.code}`));
  if (match) return { iso: match.iso, dialCode: match.code, number: value.slice(match.code.length + 1) };
  return { iso: 'IN', dialCode: '91', number: value.slice(1) };
}

// Returns full value like "US:+11234567890"
export function formatPhone(dialCode, number, iso = '') {
  return `${iso}:+${dialCode}${number.replace(/\D/g, '')}`;
}

export function PhoneInput({ value = '', onChange, className = '', inputClassName = '', placeholder = 'Phone number', dark = false, allowedCountries = [] }) {
  const parsed = parsePhone(value);
  const [isoCode, setIsoCode] = useState(parsed.iso);
  const [number, setNumber] = useState(parsed.number);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const p = parsePhone(value);
    setIsoCode(p.iso);
    setNumber(p.number);
  }, [value]);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (c) => {
    setIsoCode(c.iso);
    setOpen(false);
    setSearch('');
    onChange(formatPhone(c.code, number, c.iso));
  };

  const selected = COUNTRIES.find(c => c.iso === isoCode) || COUNTRIES.find(c => c.iso === 'IN');
  const dialCode = selected.code;

  const handleNumber = (e) => {
    const n = e.target.value.replace(/\D/g, '');
    setNumber(n);
    onChange(formatPhone(dialCode, n, isoCode));
  };

  const displayCountries = allowedCountries.length > 0 
    ? COUNTRIES.filter(c => allowedCountries.includes(c.name))
    : COUNTRIES;

  const filtered = displayCountries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search) || c.iso.toLowerCase().includes(search.toLowerCase())
  );

  const base = dark
    ? 'border-white/10 bg-transparent text-white placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/50'
    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-gray-400';

  return (
    <div className={`flex gap-0 relative ${className}`} ref={dropdownRef}>
      {/* Dial code button */}
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-3 py-2.5 border rounded-l-xl text-sm font-semibold shrink-0 transition-all ${dark ? 'border-white/10 bg-transparent text-white hover:bg-white/5' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'} border-r-0`}>
        <span className="text-base leading-none">{selected?.iso ? String.fromCodePoint(...[...selected.iso].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))) : '🌐'}</span>
        <span>+{dialCode}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Number input */}
      <input
        type="tel"
        value={number}
        onChange={handleNumber}
        placeholder={placeholder}
        className={`flex-1 px-3 py-2.5 border rounded-r-xl text-sm focus:outline-none focus:ring-2 transition-shadow ${base} ${inputClassName}`}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[200] mt-11 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search country..." className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400" />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.map(c => (
              <li key={c.iso}>
                <button type="button" onClick={() => handleSelect(c)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${isoCode === c.iso ? 'bg-brand-gold/10 font-bold text-[#08183A]' : 'text-gray-700'}`}>
                  <span className="text-base shrink-0">{String.fromCodePoint(...[...c.iso].map(ch => 0x1F1E6 - 65 + ch.charCodeAt(0)))}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-gray-400 shrink-0">+{c.code}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-400">No results</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
