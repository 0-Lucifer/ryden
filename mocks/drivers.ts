export interface Driver {
    id: string;
name: string;
rating: number;
vehicleType: string;
vehicleModel: string;
eta: number;
fare: number;
avatar: string;
licensePlate: string;
gender: 'male' | 'female';
}

export const mockDrivers: Driver[] = [
{
id: '1',
name: 'Karim Ahmed',
rating: 4.9,
vehicleType: 'Sedan',
vehicleModel: 'Toyota Corolla',
eta: 3,
fare: 70,
avatar: 'https://i.pravatar.cc/150?img=12',
licensePlate: 'DHK-GA-1234',
gender: 'male',
},
{
id: '2',
name: 'Ayesha Rahman',
rating: 4.8,
vehicleType: 'Sedan',
vehicleModel: 'Honda Civic',
eta: 5,
fare: 100,
avatar: 'https://i.pravatar.cc/150?img=13',
licensePlate: 'DHK-GA-5678',
gender: 'female',
},
{
id: '3',
name: 'Zahir Rahman',
rating: 4.7,
vehicleType: 'SUV',
vehicleModel: 'Toyota Allion',
eta: 7,
fare: 890,
avatar: 'https://i.pravatar.cc/150?img=33',
licensePlate: 'DHK-GA-9012',
gender: 'male',
},
{
id: '4',
name: 'Fatima Begum',
rating: 4.9,
vehicleType: 'Sedan',
vehicleModel: 'Toyota Premio',
eta: 4,
fare: 110,
avatar: 'https://i.pravatar.cc/150?img=14',
licensePlate: 'DHK-GA-3456',
gender: 'female',
},
{
id: '5',
name: 'Sabbir Ali',
rating: 4.6,
vehicleType: 'Sedan',
vehicleModel: 'Honda City',
eta: 8,
fare: 70,
avatar: 'https://i.pravatar.cc/150?img=51',
licensePlate: 'DHK-GA-7890',
gender: 'male',
},
];
