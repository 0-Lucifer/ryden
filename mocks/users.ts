export interface User {
    id: string;
name: string;
email: string;
phone: string;
photo: string;
university: string;
department: string;
batch: string;
studentId: string;
verified: boolean;
rating: number;
totalRides: number;
isDriver: boolean;
joinedDate: string;
emergencyContact?: string;
bio?: string;
}

export interface Vehicle {
id: string;
ownerId: string;
type: 'bike' | 'mini' | 'sedan' | 'premium';
name: string;
number: string;
color: string;
year: number;
verified: boolean;
}

export const mockVehicles: Vehicle[] = [
{
id: 'v1',
ownerId: '2',
type: 'bike',
name: 'Honda CB150R',
number: 'DHA-3456',
color: 'Red',
year: 2023,
verified: true,
},
{
id: 'v2',
ownerId: '3',
type: 'mini',
name: 'Toyota Vitz',
number: 'DHA-7890',
color: 'Silver',
year: 2022,
verified: true,
},
{
id: 'v3',
ownerId: '4',
type: 'sedan',
name: 'Toyota Corolla',
number: 'DHA-1234',
color: 'Black',
year: 2021,
verified: true,
},
{
id: 'v4',
ownerId: '5',
type: 'premium',
name: 'Honda Civic',
number: 'DHA-5678',
color: 'White',
year: 2024,
verified: true,
},
];

export const mockUsers: User[] = [
{
id: '1',
name: 'Jumma Rahman',
email: 'jumma.rahman@student.edu.bd',
phone: '+880 1712-345678',
photo: 'https://i.pravatar.cc/150?img=1',
university: 'University of Dhaka',
department: 'Computer Science',
batch: '2022',
studentId: 'DU-CSE-2022-001',
verified: true,
rating: 4.8,
totalRides: 45,
isDriver: false,
joinedDate: '2024-01-15',
emergencyContact: '+880 1812-555555',
bio: 'Love carpooling to save money and environment!',
},
{
id: '2',
name: 'Karim Ahmed',
email: 'karim.ahmed@student.edu.bd',
phone: '+880 1812-345679',
photo: 'https://i.pravatar.cc/150?img=12',
university: 'BUET',
department: 'Electrical Engineering',
batch: '2021',
studentId: 'BUET-EEE-2021-045',
verified: true,
rating: 4.9,
totalRides: 127,
isDriver: true,
joinedDate: '2023-09-10',
emergencyContact: '+880 1912-666666',
bio: 'Experienced driver. Safe and punctual rides.',
},
{
id: '3',
name: 'Nusrat Jahan',
email: 'nusrat.jahan@student.edu.bd',
phone: '+880 1912-345680',
photo: 'https://i.pravatar.cc/150?img=5',
university: 'University of Dhaka',
department: 'Business Administration',
batch: '2023',
studentId: 'DU-BBA-2023-112',
verified: true,
rating: 4.7,
totalRides: 89,
isDriver: true,
joinedDate: '2023-11-20',
emergencyContact: '+880 1712-777777',
bio: 'Friendly rides with great conversations!',
},
{
id: '4',
name: 'Rakib Hassan',
email: 'rakib.hassan@student.edu.bd',
phone: '+880 1612-345681',
photo: 'https://i.pravatar.cc/150?img=33',
university: 'BUET',
department: 'Mechanical Engineering',
batch: '2020',
studentId: 'BUET-ME-2020-023',
verified: true,
rating: 4.95,
totalRides: 215,
isDriver: true,
joinedDate: '2023-06-01',
emergencyContact: '+880 1512-888888',
bio: 'Professional driver with 200+ successful rides.',
},
{
id: '5',
name: 'Fatima Khan',
email: 'fatima.khan@student.edu.bd',
phone: '+880 1512-345682',
photo: 'https://i.pravatar.cc/150?img=9',
university: 'University of Dhaka',
department: 'Economics',
batch: '2021',
studentId: 'DU-ECO-2021-087',
verified: true,
rating: 4.85,
totalRides: 156,
isDriver: true,
joinedDate: '2023-08-15',
emergencyContact: '+880 1612-999999',
bio: 'Clean car, smooth rides, always on time!',
},
{
id: '6',
name: 'Tanvir Islam',
email: 'tanvir.islam@student.edu.bd',
phone: '+880 1312-345683',
photo: 'https://i.pravatar.cc/150?img=68',
university: 'BUET',
department: 'Civil Engineering',
batch: '2022',
studentId: 'BUET-CE-2022-056',
verified: true,
rating: 4.6,
totalRides: 34,
isDriver: false,
joinedDate: '2024-03-20',
emergencyContact: '+880 1412-111111',
},
];

export const currentUser: User = mockUsers[0];
