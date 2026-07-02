/**
 * Ported from TravelDataService.locations (Angular). Reference data for
 * origin/destination pickers — not part of Redux state since it's static
 * and never changes at runtime.
 */
export const LOCATIONS = [
  // ── Indian Cities (with airports) ────────────────────────────────────
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Kochi', 'Chandigarh',
  'Lucknow', 'Bhopal', 'Indore', 'Nagpur', 'Surat', 'Vadodara',
  'Coimbatore', 'Visakhapatnam', 'Patna', 'Ranchi', 'Bhubaneswar',
  'Thiruvananthapuram', 'Varanasi', 'Amritsar', 'Dehradun',
  'Udaipur', 'Jodhpur', 'Mysore', 'Srinagar', 'Leh',
  'Madurai', 'Trichy', 'Mangalore', 'Hubli', 'Guwahati',

  // ── International Cities ─────────────────────────────────────────────
  'London', 'Paris', 'New York', 'Dubai', 'Singapore', 'Bangkok',
  'Tokyo', 'Sydney', 'Toronto', 'Amsterdam', 'Rome', 'Barcelona',
  'Istanbul', 'Kuala Lumpur', 'Hong Kong', 'Seoul', 'Beijing',
  'Shanghai', 'Los Angeles', 'Chicago', 'Berlin', 'Vienna', 'Zurich',
  'Prague', 'Budapest', 'Lisbon', 'Madrid', 'Moscow', 'Cairo',
  'Cape Town', 'Nairobi', 'Bali', 'Phuket', 'Osaka',
  'Doha', 'Abu Dhabi', 'Riyadh', 'Colombo', 'Kathmandu', 'Dhaka',
  'Male', 'Hanoi', 'Ho Chi Minh City', 'Manila', 'Jakarta',
];
