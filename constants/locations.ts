// Popular Dhaka locations for quick selection
export interface Location {
  id: string;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  area: string;
}

export const POPULAR_LOCATIONS: Location[] = [
  // Universities
  {
    id: 'nsu',
    name: 'NSU Campus, Bashundhara',
    shortName: 'NSU',
    latitude: 23.8103,
    longitude: 90.4125,
    area: 'Bashundhara',
  },
  {
    id: 'iub',
    name: 'IUB Campus, Bashundhara',
    shortName: 'IUB',
    latitude: 23.8136,
    longitude: 90.4243,
    area: 'Bashundhara',
  },
  {
    id: 'brac-u',
    name: 'BRAC University, Mohakhali',
    shortName: 'BRAC U',
    latitude: 23.7806,
    longitude: 90.4069,
    area: 'Mohakhali',
  },
  {
    id: 'du',
    name: 'Dhaka University',
    shortName: 'DU',
    latitude: 23.7339,
    longitude: 90.3926,
    area: 'Shahbagh',
  },
  {
    id: 'buet',
    name: 'BUET Campus',
    shortName: 'BUET',
    latitude: 23.7266,
    longitude: 90.3925,
    area: 'Palashi',
  },

  // Gulshan Area
  {
    id: 'gulshan-1',
    name: 'Gulshan 1 Circle',
    shortName: 'Gulshan 1',
    latitude: 23.7809,
    longitude: 90.4168,
    area: 'Gulshan',
  },
  {
    id: 'gulshan-2',
    name: 'Gulshan 2 Circle',
    shortName: 'Gulshan 2',
    latitude: 23.7937,
    longitude: 90.4143,
    area: 'Gulshan',
  },
  {
    id: 'banani',
    name: 'Banani 11 No.',
    shortName: 'Banani',
    latitude: 23.7936,
    longitude: 90.4023,
    area: 'Banani',
  },

  // Uttara
  {
    id: 'uttara-sector-7',
    name: 'Uttara Sector 7',
    shortName: 'Uttara 7',
    latitude: 23.8644,
    longitude: 90.3967,
    area: 'Uttara',
  },
  {
    id: 'uttara-sector-10',
    name: 'Uttara Sector 10',
    shortName: 'Uttara 10',
    latitude: 23.8746,
    longitude: 90.3898,
    area: 'Uttara',
  },
  {
    id: 'uttara-sector-13',
    name: 'Uttara Sector 13',
    shortName: 'Uttara 13',
    latitude: 23.8827,
    longitude: 90.3996,
    area: 'Uttara',
  },
  {
    id: 'abdullahpur',
    name: 'Abdullahpur Bus Stand',
    shortName: 'Abdullahpur',
    latitude: 23.8782,
    longitude: 90.3992,
    area: 'Uttara',
  },

  // Dhanmondi
  {
    id: 'dhanmondi-27',
    name: 'Dhanmondi 27',
    shortName: 'Dhanmondi 27',
    latitude: 23.7509,
    longitude: 90.3746,
    area: 'Dhanmondi',
  },
  {
    id: 'dhanmondi-lake',
    name: 'Dhanmondi Lake',
    shortName: 'Dhanmondi Lake',
    latitude: 23.7465,
    longitude: 90.3762,
    area: 'Dhanmondi',
  },
  {
    id: 'jigatola',
    name: 'Jigatola Bus Stand',
    shortName: 'Jigatola',
    latitude: 23.7392,
    longitude: 90.3753,
    area: 'Dhanmondi',
  },

  // Mirpur
  {
    id: 'mirpur-1',
    name: 'Mirpur 1',
    shortName: 'Mirpur 1',
    latitude: 23.7956,
    longitude: 90.3523,
    area: 'Mirpur',
  },
  {
    id: 'mirpur-10',
    name: 'Mirpur 10 Circle',
    shortName: 'Mirpur 10',
    latitude: 23.8069,
    longitude: 90.3687,
    area: 'Mirpur',
  },
  {
    id: 'mirpur-12',
    name: 'Mirpur 12',
    shortName: 'Mirpur 12',
    latitude: 23.8214,
    longitude: 90.3654,
    area: 'Mirpur',
  },

  // Mohammadpur
  {
    id: 'mohammadpur',
    name: 'Mohammadpur Bus Stand',
    shortName: 'Mohammadpur',
    latitude: 23.7654,
    longitude: 90.3587,
    area: 'Mohammadpur',
  },
  {
    id: 'shyamoli',
    name: 'Shyamoli Square',
    shortName: 'Shyamoli',
    latitude: 23.7743,
    longitude: 90.3654,
    area: 'Mohammadpur',
  },

  // Central Dhaka
  {
    id: 'motijheel',
    name: 'Motijheel',
    shortName: 'Motijheel',
    latitude: 23.7289,
    longitude: 90.4193,
    area: 'Motijheel',
  },
  {
    id: 'farmgate',
    name: 'Farmgate',
    shortName: 'Farmgate',
    latitude: 23.7587,
    longitude: 90.3876,
    area: 'Farmgate',
  },
  {
    id: 'shahbagh',
    name: 'Shahbagh',
    shortName: 'Shahbagh',
    latitude: 23.7392,
    longitude: 90.3956,
    area: 'Shahbagh',
  },
  {
    id: 'karwan-bazar',
    name: 'Karwan Bazar',
    shortName: 'Karwan Bazar',
    latitude: 23.7512,
    longitude: 90.3932,
    area: 'Tejgaon',
  },

  // Shopping/Transit Hubs
  {
    id: 'bashundhara-city',
    name: 'Bashundhara City Mall',
    shortName: 'Bashundhara City',
    latitude: 23.7506,
    longitude: 90.3912,
    area: 'Panthapath',
  },
  {
    id: 'jamuna-future-park',
    name: 'Jamuna Future Park',
    shortName: 'JFP',
    latitude: 23.8136,
    longitude: 90.4232,
    area: 'Kuril',
  },

  // Airport
  {
    id: 'airport',
    name: 'Hazrat Shahjalal Airport',
    shortName: 'Airport',
    latitude: 23.8512,
    longitude: 90.4078,
    area: 'Airport',
  },

  // Old Dhaka
  {
    id: 'sadarghat',
    name: 'Sadarghat Launch Terminal',
    shortName: 'Sadarghat',
    latitude: 23.7080,
    longitude: 90.4070,
    area: 'Old Dhaka',
  },
  {
    id: 'new-market',
    name: 'New Market',
    shortName: 'New Market',
    latitude: 23.7334,
    longitude: 90.3854,
    area: 'Nilkhet',
  },
];

// Group locations by area
export const LOCATIONS_BY_AREA = POPULAR_LOCATIONS.reduce((acc, loc) => {
  if (!acc[loc.area]) {
    acc[loc.area] = [];
  }
  acc[loc.area].push(loc);
  return acc;
}, {} as Record<string, Location[]>);

// Get location by ID
export const getLocationById = (id: string): Location | undefined => {
  return POPULAR_LOCATIONS.find(loc => loc.id === id);
};

// Default location (NSU)
export const DEFAULT_LOCATION = POPULAR_LOCATIONS[0];

// Search locations by name
export const searchLocations = (query: string): Location[] => {
  const q = query.toLowerCase();
  return POPULAR_LOCATIONS.filter(
    loc =>
      loc.name.toLowerCase().includes(q) ||
      loc.shortName.toLowerCase().includes(q) ||
      loc.area.toLowerCase().includes(q)
  );
};
