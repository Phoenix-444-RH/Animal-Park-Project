export const PET_TYPES = ["Dog", "Cat"];

export const GROOMING_TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:30 AM - 01:30 PM",
  "02:00 PM - 04:00 PM",
  "04:30 PM - 06:30 PM",
];

export const GROOMING_SERVICES = [
  { id: "svc1", name: "Bathing", basePrice: 399, petTypes: ["Dog", "Cat"] },
  { id: "svc2", name: "Pet Spa", basePrice: 699, petTypes: ["Dog", "Cat"] },
  { id: "svc3", name: "Haircut & Styling", basePrice: 549, petTypes: ["Dog"] },
  { id: "svc4", name: "Nail Trim", basePrice: 199, petTypes: ["Dog", "Cat"] },
  { id: "svc5", name: "Tick & Flea Cleanup", basePrice: 449, petTypes: ["Dog", "Cat"] },
  { id: "svc6", name: "Teeth Cleaning", basePrice: 299, petTypes: ["Dog", "Cat"] },
  { id: "svc7", name: "Paw Massage", basePrice: 249, petTypes: ["Dog"] },
  { id: "svc8", name: "Coat De-shedding", basePrice: 499, petTypes: ["Dog", "Cat"] },
];

export const CLINIC_SERVICES = [
  { id: "c1", name: "General Checkup", price: 699 },
  { id: "c2", name: "Vaccination", price: 999 },
  { id: "c3", name: "Dermatology Review", price: 1299 },
  { id: "c4", name: "Dental Cleaning", price: 1599 },
  { id: "c5", name: "Surgery Consultation", price: 1899 },
  { id: "c6", name: "Nutrition Planning", price: 899 },
  { id: "c7", name: "Emergency Consultation", price: 2199 },
];

export const demoUsers = [
  { id: "u1", role: "user", name: "Priya Sharma", email: "priya@email.com", password: "pass123", location: "Chennai", petType: "Cat", subscription: "premium" },
  { id: "u2", role: "user", name: "Arjun Kumar", email: "arjun@email.com", password: "pass123", location: "Bangalore", petType: "Dog", subscription: "basic" },
  { id: "u3", role: "user", name: "Ishita Rao", email: "ishita@email.com", password: "pass123", location: "Chennai", petType: "Dog", subscription: "basic" },
  { id: "u4", role: "user", name: "Rohan Das", email: "rohan@email.com", password: "pass123", location: "Bangalore", petType: "Cat", subscription: "premium" },
  { id: "u5", role: "user", name: "Neha Iyer", email: "neha@email.com", password: "pass123", location: "Chennai", petType: "Cat", subscription: "basic" },
  { id: "u6", role: "user", name: "Varun Menon", email: "varun@email.com", password: "pass123", location: "Bangalore", petType: "Dog", subscription: "basic" },
];

export const demoDoctors = [
  { id: "d1", role: "doctor", name: "Dr. Meera Nair", email: "meera@vet.com", password: "doc123", specialization: "General Veterinary", rating: 4.9, reviews: 288, price: 1200, location: "Chennai", experience: 12, clinicName: "Meera Pet Care", certifications: ["BVSc", "MVSc"], licenseId: "TN-VET-2211", description: "Expert in preventive pet care with premium follow-up consultations.", approved: true, services: ["c1", "c2", "c6"] },
  { id: "d2", role: "doctor", name: "Dr. Ravi Patel", email: "ravi@vet.com", password: "doc123", specialization: "Dermatology", rating: 4.8, reviews: 210, price: 1400, location: "Bangalore", experience: 10, clinicName: "Paw Skin Clinic", certifications: ["BVSc", "Dermatology Fellowship"], licenseId: "KA-VET-3391", description: "Skin, allergy, and coat health specialist for dogs and cats.", approved: true, services: ["c1", "c3", "c6"] },
  { id: "d3", role: "doctor", name: "Dr. Sunita Reddy", email: "sunita@vet.com", password: "doc123", specialization: "Surgery", rating: 4.7, reviews: 198, price: 2100, location: "Chennai", experience: 14, clinicName: "Advanced Pet Surgery Hub", certifications: ["BVSc", "MS Surgery"], licenseId: "TN-VET-8744", description: "Orthopedic and surgical expert for emergency and advanced cases.", approved: true, services: ["c1", "c5", "c7"] },
  { id: "d4", role: "doctor", name: "Dr. Kavya Bose", email: "kavya@vet.com", password: "doc123", specialization: "Nutrition", rating: 4.6, reviews: 154, price: 950, location: "Bangalore", experience: 8, clinicName: "Balanced Pets Nutrition", certifications: ["BVSc", "Nutrition Certification"], licenseId: "KA-VET-1208", description: "Food plans, obesity care, and digestive health programs.", approved: true, services: ["c1", "c2", "c6"] },
  { id: "d5", role: "doctor", name: "Dr. Hari Krishnan", email: "hari@vet.com", password: "doc123", specialization: "Dental", rating: 4.7, reviews: 132, price: 1600, location: "Chennai", experience: 11, clinicName: "Smiles for Paws", certifications: ["BVSc", "Dental Practice Certification"], licenseId: "TN-VET-5601", description: "Dental scaling, oral care, and pain management for pets.", approved: true, services: ["c1", "c4", "c7"] },
  { id: "d6", role: "doctor", name: "Dr. Aditi Sen", email: "aditi@vet.com", password: "doc123", specialization: "General Veterinary", rating: 4.5, reviews: 104, price: 1050, location: "Bangalore", experience: 6, clinicName: "City Vet Point", certifications: ["BVSc"], licenseId: "KA-VET-9912", description: "Routine care and vaccination management with strong family follow-up.", approved: true, services: ["c1", "c2", "c6"] },
  { id: "d7", role: "doctor", name: "Dr. Naren Pillai", email: "naren@vet.com", password: "doc123", specialization: "Emergency", rating: 4.9, reviews: 321, price: 2400, location: "Chennai", experience: 15, clinicName: "24x7 Pet Emergency", certifications: ["BVSc", "Critical Care Fellowship"], licenseId: "TN-VET-1407", description: "Rapid emergency assessment and critical care support.", approved: true, services: ["c1", "c5", "c7"] },
  { id: "d8", role: "doctor", name: "Dr. Sneha Kapoor", email: "sneha@vet.com", password: "doc123", specialization: "Dermatology", rating: 4.4, reviews: 96, price: 1300, location: "Bangalore", experience: 7, clinicName: "Urban Fur Clinic", certifications: ["BVSc", "Skin Care Residency"], licenseId: "KA-VET-7784", description: "Focused care for recurring rashes, coat dullness, and allergies.", approved: true, services: ["c1", "c3", "c6"] },
];

export const demoGroomers = [
  { id: "g1", role: "groomer", name: "Lakshmi's Pet Studio", email: "lakshmi@groom.com", password: "groom123", rating: 4.8, experience: 8, location: "Chennai", vehicleType: "Van", petSpecialties: ["Dog", "Cat"], certifications: ["Pet Grooming Pro"], available: true, salonName: "Lakshmi Pet Studio" },
  { id: "g2", role: "groomer", name: "Pet Perfect Care", email: "ramesh@groom.com", password: "groom123", rating: 4.6, experience: 6, location: "Bangalore", vehicleType: "Bike", petSpecialties: ["Dog"], certifications: ["Home Grooming Certified"], available: true, salonName: "Pet Perfect Care" },
  { id: "g3", role: "groomer", name: "Elite Pet Spa", email: "vijay@groom.com", password: "groom123", rating: 4.7, experience: 9, location: "Chennai", vehicleType: "Van", petSpecialties: ["Dog", "Cat"], certifications: ["Pet Spa Specialist"], available: true, salonName: "Elite Pet Spa" },
  { id: "g4", role: "groomer", name: "Soft Paws Lounge", email: "softpaws@groom.com", password: "groom123", rating: 4.4, experience: 4, location: "Bangalore", vehicleType: "Car", petSpecialties: ["Cat"], certifications: ["Cat Groom Specialist"], available: true, salonName: "Soft Paws Lounge" },
  { id: "g5", role: "groomer", name: "Royal Fur Spa", email: "royalfur@groom.com", password: "groom123", rating: 4.9, experience: 11, location: "Chennai", vehicleType: "Van", petSpecialties: ["Dog"], certifications: ["Luxury Grooming Master"], available: true, salonName: "Royal Fur Spa" },
  { id: "g6", role: "groomer", name: "Happy Tails Grooming Co.", email: "happytails@groom.com", password: "groom123", rating: 4.5, experience: 5, location: "Bangalore", vehicleType: "Bike", petSpecialties: ["Dog", "Cat"], certifications: ["Pet Hygiene Certified"], available: true, salonName: "Happy Tails Grooming Co." },
  { id: "g7", role: "groomer", name: "Paw Palace Mobile Grooming", email: "pawpalace@groom.com", password: "groom123", rating: 4.8, experience: 7, location: "Chennai", vehicleType: "Van", petSpecialties: ["Dog", "Cat"], certifications: ["Mobile Grooming Expert"], available: true, salonName: "Paw Palace" },
  { id: "g8", role: "groomer", name: "Fresh Fur Express", email: "freshfur@groom.com", password: "groom123", rating: 4.3, experience: 3, location: "Bangalore", vehicleType: "Scooter", petSpecialties: ["Dog"], certifications: ["Basic Grooming Certified"], available: true, salonName: "Fresh Fur Express" },
  { id: "g9", role: "groomer", name: "Calm Cats Corner", email: "calmcats@groom.com", password: "groom123", rating: 4.7, experience: 6, location: "Chennai", vehicleType: "Car", petSpecialties: ["Cat"], certifications: ["Feline Comfort Grooming"], available: true, salonName: "Calm Cats Corner" },
  { id: "g10", role: "groomer", name: "Urban Groom Wagon", email: "urbangroom@groom.com", password: "groom123", rating: 4.6, experience: 5, location: "Bangalore", vehicleType: "Van", petSpecialties: ["Dog", "Cat"], certifications: ["Salon Operations Certified"], available: true, salonName: "Urban Groom Wagon" },
];

export const demoProducts = [
  { id: "p1", name: "Orthopedic Dog Bed", price: 1499, category: "dogs", subcategory: "Beds", image: "/images/dog-bed.svg", description: "Deep-cushion support bed for senior dogs and daily nap comfort." },
  { id: "p2", name: "Protein-Rich Cat Food", price: 699, category: "cats", subcategory: "Food", image: "/images/cat-food.svg", description: "Balanced nutrition blend for indoor cats and active kittens." },
  { id: "p3", name: "Luxury Grooming Kit", price: 1199, category: "cats", subcategory: "Grooming", image: "/images/grooming-kit.svg", description: "Premium brush, comb, trimmer, and coat-care essentials for long-haired cats." },
  { id: "p4", name: "Reflective Dog Harness", price: 899, category: "dogs", subcategory: "Walking", image: "/images/dog-harness.svg", description: "Comfort-fit harness with reflective straps for safer day and night walks." },
  { id: "p5", name: "Cat Tunnel Toy", price: 549, category: "cats", subcategory: "Toys", image: "/images/cat-tunnel-toy.svg", description: "Interactive foldable tunnel for chasing, hiding, and indoor play." },
  { id: "p6", name: "Travel Water Bottle", price: 399, category: "dogs", subcategory: "Travel", image: "/images/travel-water-bottle.svg", description: "Portable hydration bottle for park walks, road trips, and quick outdoor breaks." },
  { id: "p7", name: "Premium Litter Pack", price: 799, category: "cats", subcategory: "Hygiene", image: "/images/premium-litter-pack.svg", description: "Low-dust clumping litter with strong odor control and soft paw comfort." },
  { id: "p8", name: "Dental Chew Combo", price: 459, category: "dogs", subcategory: "Health", image: "/images/dental-chew-combo.svg", description: "Daily dental chews that support cleaner teeth and fresher breath." },
  { id: "p9", name: "Plush Rope Tug Set", price: 649, category: "dogs", subcategory: "Toys", image: "/images/plush-rope-tug-set.svg", description: "Durable rope and plush toy bundle for playful medium and large dogs." },
  { id: "p10", name: "Elevated Feeding Bowl", price: 999, category: "dogs", subcategory: "Feeding", image: "/images/elevated-feeding-bowl.svg", description: "Raised feeding station designed for improved posture and cleaner mealtimes." },
  { id: "p11", name: "Feather Chase Wand", price: 329, category: "cats", subcategory: "Toys", image: "/images/feather-chase-wand.svg", description: "Lightweight teaser wand to keep indoor cats active and engaged." },
  { id: "p12", name: "Soft Cat Carrier", price: 1399, category: "cats", subcategory: "Travel", image: "/images/soft-cat-carrier.svg", description: "Ventilated travel carrier with padded sides for calmer vet and city trips." },
  { id: "p13", name: "Waterproof Paw Raincoat", price: 899, category: "dogs", subcategory: "Clothing", image: "/images/waterproof-paw-raincoat.svg", description: "Lightweight rain jacket with belly coverage for wet-weather walks." },
  { id: "p14", name: "Cozy Window Perch", price: 1299, category: "cats", subcategory: "Furniture", image: "/images/cozy-window-perch.svg", description: "Sun-loving perch seat that gives cats a warm lookout spot by the window." },
];
export const GROOMING_STAGES = [
  "Order taken",
  "Pet picked up",
  "Grooming in progress",
  "Spa & bathing",
  "Returning home",
  "Delivered back",
];
export const ORDER_STATUSES = [
  "Order placed",
  "Packed",
  "Shipped",
  "Out for delivery",
  "Delivered",
];
export const locationOptions = ["Chennai", "Bangalore"];
export const products = demoProducts;
export const clinicServices = CLINIC_SERVICES;
export const groomingServices = GROOMING_SERVICES;
export const groomingTimeSlots = GROOMING_TIME_SLOTS;
