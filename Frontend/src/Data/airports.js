// Airport metadata + city list used by the flight search form.
// Extracted verbatim from the Angular LandingComponent's `airportMap`.

export const AIRPORT_MAP = {
  Mumbai: { code: 'BOM', name: 'Chhatrapati Shivaji International Airport', country: 'India' },
  Delhi: { code: 'DEL', name: 'Indira Gandhi International Airport', country: 'India' },
  Bangalore: { code: 'BLR', name: 'Bengaluru International Airport', country: 'India' },
  Chennai: { code: 'MAA', name: 'Chennai International Airport', country: 'India' },
  Kolkata: { code: 'CCU', name: 'Netaji Subhas Chandra Bose Intl Airport', country: 'India' },
  Hyderabad: { code: 'HYD', name: 'Rajiv Gandhi International Airport', country: 'India' },
  Pune: { code: 'PNQ', name: 'Pune Airport', country: 'India' },
  Ahmedabad: { code: 'AMD', name: 'Sardar Vallabhbhai Patel Intl Airport', country: 'India' },
  Jaipur: { code: 'JAI', name: 'Jaipur International Airport', country: 'India' },
  Goa: { code: 'GOI', name: 'Goa International Airport', country: 'India' },
  Kochi: { code: 'COK', name: 'Cochin International Airport', country: 'India' },
  Chandigarh: { code: 'IXC', name: 'Chandigarh International Airport', country: 'India' },
  Lucknow: { code: 'LKO', name: 'Chaudhary Charan Singh International Airport', country: 'India' },
  Bhopal: { code: 'BHO', name: 'Raja Bhoj Airport', country: 'India' },
  Indore: { code: 'IDR', name: 'Devi Ahilya Bai Holkar Airport', country: 'India' },
  Nagpur: { code: 'NAG', name: 'Dr. Babasaheb Ambedkar International Airport', country: 'India' },
  Surat: { code: 'STV', name: 'Surat Airport', country: 'India' },
  Vadodara: { code: 'BDQ', name: 'Vadodara Airport', country: 'India' },
  Coimbatore: { code: 'CJB', name: 'Coimbatore International Airport', country: 'India' },
  Visakhapatnam: { code: 'VTZ', name: 'Visakhapatnam Airport', country: 'India' },
  Patna: { code: 'PAT', name: 'Jay Prakash Narayan International Airport', country: 'India' },
  Ranchi: { code: 'IXR', name: 'Birsa Munda Airport', country: 'India' },
  Bhubaneswar: { code: 'BBI', name: 'Biju Patnaik International Airport', country: 'India' },
  Thiruvananthapuram: { code: 'TRV', name: 'Trivandrum International Airport', country: 'India' },
  Varanasi: { code: 'VNS', name: 'Lal Bahadur Shastri International Airport', country: 'India' },
  Amritsar: { code: 'ATQ', name: 'Sri Guru Ram Dass Jee International Airport', country: 'India' },
  Dehradun: { code: 'DED', name: 'Jolly Grant Airport', country: 'India' },
  Udaipur: { code: 'UDR', name: 'Maharana Pratap Airport', country: 'India' },
  Jodhpur: { code: 'JDH', name: 'Jodhpur Airport', country: 'India' },
  Mysore: { code: 'MYQ', name: 'Mysore Airport', country: 'India' },
  Srinagar: { code: 'SXR', name: 'Sheikh ul-Alam International Airport', country: 'India' },
  Leh: { code: 'IXL', name: 'Kushok Bakula Rimpochee Airport', country: 'India' },
  Madurai: { code: 'IXM', name: 'Madurai Airport', country: 'India' },
  Trichy: { code: 'TRZ', name: 'Tiruchirappalli International Airport', country: 'India' },
  Mangalore: { code: 'IXE', name: 'Mangaluru International Airport', country: 'India' },
  Hubli: { code: 'HBX', name: 'Hubli Airport', country: 'India' },
  Guwahati: { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi Intl Airport', country: 'India' },
  London: { code: 'LHR', name: 'Heathrow Airport', country: 'UK' },
  Paris: { code: 'CDG', name: 'Charles de Gaulle Airport', country: 'France' },
  'New York': { code: 'JFK', name: 'John F. Kennedy International Airport', country: 'USA' },
  Dubai: { code: 'DXB', name: 'Dubai International Airport', country: 'UAE' },
  Singapore: { code: 'SIN', name: 'Singapore Changi Airport', country: 'Singapore' },
  Bangkok: { code: 'BKK', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  Tokyo: { code: 'NRT', name: 'Narita International Airport', country: 'Japan' },
  Sydney: { code: 'SYD', name: 'Kingsford Smith Airport', country: 'Australia' },
  Toronto: { code: 'YYZ', name: 'Toronto Pearson International Airport', country: 'Canada' },
  Amsterdam: { code: 'AMS', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  Rome: { code: 'FCO', name: 'Leonardo da Vinci International Airport', country: 'Italy' },
  Barcelona: { code: 'BCN', name: 'Barcelona El Prat Airport', country: 'Spain' },
  Istanbul: { code: 'IST', name: 'Istanbul Airport', country: 'Turkey' },
  'Kuala Lumpur': { code: 'KUL', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  'Hong Kong': { code: 'HKG', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  Seoul: { code: 'ICN', name: 'Incheon International Airport', country: 'South Korea' },
  Beijing: { code: 'PEK', name: 'Beijing Capital International Airport', country: 'China' },
  Shanghai: { code: 'PVG', name: 'Pudong International Airport', country: 'China' },
  'Los Angeles': { code: 'LAX', name: 'Los Angeles International Airport', country: 'USA' },
  Chicago: { code: 'ORD', name: "O'Hare International Airport", country: 'USA' },
  Berlin: { code: 'BER', name: 'Berlin Brandenburg Airport', country: 'Germany' },
  Vienna: { code: 'VIE', name: 'Vienna International Airport', country: 'Austria' },
  Zurich: { code: 'ZRH', name: 'Zurich Airport', country: 'Switzerland' },
  Prague: { code: 'PRG', name: 'Václav Havel Airport Prague', country: 'Czech Republic' },
  Budapest: { code: 'BUD', name: 'Budapest Ferenc Liszt International Airport', country: 'Hungary' },
  Lisbon: { code: 'LIS', name: 'Humberto Delgado Airport', country: 'Portugal' },
  Madrid: { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', country: 'Spain' },
  Moscow: { code: 'SVO', name: 'Sheremetyevo International Airport', country: 'Russia' },
  Cairo: { code: 'CAI', name: 'Cairo International Airport', country: 'Egypt' },
  'Cape Town': { code: 'CPT', name: 'Cape Town International Airport', country: 'South Africa' },
  Nairobi: { code: 'NBO', name: 'Jomo Kenyatta International Airport', country: 'Kenya' },
  Bali: { code: 'DPS', name: 'Ngurah Rai International Airport', country: 'Indonesia' },
  Phuket: { code: 'HKT', name: 'Phuket International Airport', country: 'Thailand' },
  Osaka: { code: 'KIX', name: 'Kansai International Airport', country: 'Japan' },
  Doha: { code: 'DOH', name: 'Hamad International Airport', country: 'Qatar' },
  'Abu Dhabi': { code: 'AUH', name: 'Abu Dhabi International Airport', country: 'UAE' },
  Riyadh: { code: 'RUH', name: 'King Khalid International Airport', country: 'Saudi Arabia' },
  Colombo: { code: 'CMB', name: 'Bandaranaike International Airport', country: 'Sri Lanka' },
  Kathmandu: { code: 'KTM', name: 'Tribhuvan International Airport', country: 'Nepal' },
  Dhaka: { code: 'DAC', name: 'Hazrat Shahjalal International Airport', country: 'Bangladesh' },
  Male: { code: 'MLE', name: 'Velana International Airport', country: 'Maldives' },
  Hanoi: { code: 'HAN', name: 'Noi Bai International Airport', country: 'Vietnam' },
  'Ho Chi Minh City': { code: 'SGN', name: 'Tan Son Nhat International Airport', country: 'Vietnam' },
  Manila: { code: 'MNL', name: 'Ninoy Aquino International Airport', country: 'Philippines' },
  Jakarta: { code: 'CGK', name: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
};

export const LOCATIONS = Object.keys(AIRPORT_MAP);

export const CLASS_OPTIONS = [
  { value: 'economy', label: 'Economy / Premium Economy' },
  { value: 'business', label: 'Business Class' },
  { value: 'first', label: 'First Class' },
];

export function getAirportCode(city) {
  return AIRPORT_MAP[city]?.code || city.slice(0, 3).toUpperCase();
}

export function getCityCountry(city) {
  const info = AIRPORT_MAP[city];
  if (!info) return city;
  const label = city === 'Delhi' ? 'New Delhi' : city;
  return info.country ? `${label}, ${info.country}` : label;
}

export function getAirportDisplayName(city) {
  return AIRPORT_MAP[city]?.name || city;
}

export function getAirportSubtext(city) {
  if (!city) return '';
  const info = AIRPORT_MAP[city];
  if (!info) return city;
  return `${info.code}, ${info.name}`;
}

export function getFilteredLocations(search) {
  if (!search) return LOCATIONS.slice(0, 20);
  const q = search.toLowerCase();
  return LOCATIONS.filter((loc) => {
    const info = AIRPORT_MAP[loc];
    return (
      loc.toLowerCase().includes(q) ||
      info?.code.toLowerCase().startsWith(q) ||
      info?.name.toLowerCase().includes(q) ||
      info?.country.toLowerCase().includes(q)
    );
  }).slice(0, 15);
}

export function getFilteredLocationsBySection(search) {
  const all = getFilteredLocations(search);
  return {
    international: all.filter((c) => AIRPORT_MAP[c]?.country !== 'India'),
    domestic: all.filter((c) => AIRPORT_MAP[c]?.country === 'India'),
  };
}
