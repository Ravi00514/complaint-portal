import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const useSsl = process.env.DB_SSL === 'true';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'civicconnect',
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      }
);

let useFallback = false;

// Seed Data for Fallback Engine
const mockCategories = [
  { id: 1, category_name: 'Power Cut', department_name: 'Electricity Department', icon: 'Zap', description: 'Reporting power outages, transformer sparks, and wire snaps.' },
  { id: 2, category_name: 'Street Light', department_name: 'Municipality', icon: 'Lightbulb', description: 'Repairing broken street lamps and dark corridors.' },
  { id: 3, category_name: 'Garbage Collection', department_name: 'Municipality', icon: 'Trash2', description: 'Clearing solid waste piles, regular collection delay, and dead animals.' },
  { id: 4, category_name: 'Road Damage', department_name: 'Roads Department', icon: 'Construction', description: 'Reporting potholes, cracked pavements, and road blockages.' },
  { id: 5, category_name: 'Water Leakage', department_name: 'Water Supply Department', icon: 'Droplet', description: 'Reporting pipeline bursts, water waste, and main line leakage.' },
  { id: 6, category_name: 'Drainage', department_name: 'Municipality', icon: 'Filter', description: 'Cleaning clogged sewer lines and overflow on streets.' },
  { id: 7, category_name: 'Tree Fallen', department_name: 'Municipality', icon: 'Trees', description: 'Clearing fallen tree trunks and hanging branches obstructing roads.' },
  { id: 8, category_name: 'Traffic Signal', department_name: 'Traffic Police', icon: 'TrafficCone', description: 'Reporting malfunctioning signals and traffic congestion hotspots.' },
  { id: 9, category_name: 'Police', department_name: 'Police Department', icon: 'Shield', description: 'Emergency policing, theft, security threats, and patrolling requests.' },
  { id: 10, category_name: 'Fire', department_name: 'Fire Department', icon: 'Flame', description: 'Reporting structural fire outbreaks, gas leaks, and rescue situations.' },
  { id: 11, category_name: 'Hospital', department_name: 'Health Department', icon: 'Activity', description: 'Accessing community health centers and government hospitals.' },
  { id: 12, category_name: 'Gas Leakage', department_name: 'Gas Department', icon: 'Wind', description: 'Reporting domestic gas pipelines and commercial cylinder leakages.' },
  { id: 13, category_name: 'Internet', department_name: 'ISP', icon: 'Wifi', description: 'Reporting optical fiber cuts, broadband issues, and speed degradation.' },
  { id: 14, category_name: 'Animal Issue', department_name: 'Animal Control', icon: 'Dog', description: 'Stray dog control, cattle removal, and animal rescue.' },
  { id: 15, category_name: 'Public Transport', department_name: 'Transport Department', icon: 'Bus', description: 'Reporting bus delays, rude staff conduct, or bus stand complaints.' },
  { id: 16, category_name: 'Sewage', department_name: 'Municipality', icon: 'Droplets', description: 'Reporting toxic sewage discharges and residential sewer chokeups.' },
  { id: 17, category_name: 'Water Supply', department_name: 'Water Supply Department', icon: 'Waves', description: 'Reporting dirty water delivery, low pressure, and irregular timing.' },
  { id: 18, category_name: 'Municipality', department_name: 'Municipality', icon: 'Building', description: 'General municipal queries, trade licenses, property tax, and sanitation.' },
];

const mockUsers: any[] = [
  {
    id: 1,
    name: 'System Administrator',
    phone: '+919999999999',
    email: 'admin@civicconnect.gov.in',
    password: '$2a$10$EKbkXj44Na7UIth16K4MfudA403EkAOAOuDKipz3/vNvCllh9tlN.', // admin123
    role: 'admin',
    created_at: new Date(),
  },
  {
    id: 2,
    name: 'Rajesh Rao (Citizen)',
    phone: '+919876543210',
    email: 'citizen@civicconnect.gov.in',
    password: '$2a$10$EKbkXj44Na7UIth16K4MfudA403EkAOAOuDKipz3/vNvCllh9tlN.', // citizen123 (uses same bcrypt salt or password check)
    plain_password: 'citizen123',
    role: 'citizen',
    created_at: new Date(),
  },
];

const mockDepartments: any[] = [
  { id: 1, department_name: 'Electricity Department', office_name: 'BESCOM Indiranagar', officer_name: 'Mr. Ramesh Kumar', designation: 'Assistant Executive Engineer', phone: '+918025251111', emergency_phone: '1912', email: 'aee.indiranagar@bescom.co.in', website: 'https://bescom.karnataka.gov.in', latitude: 12.9784, longitude: 77.6408, address: '100 Feet Rd, Indiranagar, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '9:00 AM - 5:30 PM', status: 'Open' },
  { id: 2, department_name: 'Municipality', office_name: 'BBMP East Zone Office', officer_name: 'Mrs. Sunitha Rao', designation: 'Joint Commissioner', phone: '+918022975800', emergency_phone: '112', email: 'jc.east@bbmp.gov.in', website: 'https://bbmp.gov.in', latitude: 12.9912, longitude: 77.5975, address: 'Queens Road, Vasanth Nagar, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '9:30 AM - 6:00 PM', status: 'Open' },
  { id: 3, department_name: 'Water Supply Department', office_name: 'BWSSB Central Office', officer_name: 'Mr. T. V. Srinivas', designation: 'Chief Engineer', phone: '+918022945116', emergency_phone: '1916', email: 'ce.water@bwssb.gov.in', website: 'https://bwssb.karnataka.gov.in', latitude: 12.9703, longitude: 77.5752, address: 'Cauvery Bhavan, K.G. Road, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '9:30 AM - 5:30 PM', status: 'Open' },
  { id: 4, department_name: 'Police Department', office_name: 'Koramangala Police Station', officer_name: 'Inspector Mahesh Patil', designation: 'Station House Officer', phone: '+918022942583', emergency_phone: '112', email: 'shokora.blr@ksp.gov.in', website: 'https://ksp.karnataka.gov.in', latitude: 12.9348, longitude: 77.6189, address: '80 Feet Road, Koramangala 6th Block, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 5, department_name: 'Fire Department', office_name: 'Halasuru Fire Station', officer_name: 'Mr. D. Raju', designation: 'District Fire Officer', phone: '+918022971500', emergency_phone: '101', email: 'dfo.halasuru@kfs.gov.in', website: 'https://kfs.karnataka.gov.in', latitude: 12.9754, longitude: 77.6241, address: 'Old Madras Road, Halasuru, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 6, department_name: 'Health Department', office_name: 'Victoria Hospital', officer_name: 'Dr. Ramesh S.', designation: 'Medical Superintendent', phone: '+918026701150', emergency_phone: '108', email: 'victoria.hospital@karnataka.gov.in', website: 'https://victoriahospital.co.in', latitude: 12.9634, longitude: 77.5741, address: 'K.R. Road, Near K.R. Market, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 7, department_name: 'Roads Department', office_name: 'NHAI Regional Office Bengaluru', officer_name: 'Mr. P. V. Reddy', designation: 'Project Director', phone: '+918028397156', emergency_phone: '+918028397156', email: 'ro.bangalore@nhai.org', website: 'https://nhai.gov.in', latitude: 13.0416, longitude: 77.5358, address: 'Tumkur Road, M.S. Ramaiah Enclave, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '9:30 AM - 6:00 PM', status: 'Open' },
  { id: 8, department_name: 'Transport Department', office_name: 'RTO Bangalore Central (KA-01)', officer_name: 'Mr. L. Suresh', designation: 'Regional Transport Officer', phone: '+918022258055', emergency_phone: '112', email: 'rtoindn-ka@nic.in', website: 'https://transport.karnataka.gov.in', latitude: 12.9562, longitude: 77.5921, address: 'Kasturba Road, Shanthala Nagar, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '10:00 AM - 5:30 PM', status: 'Open' },
  { id: 9, department_name: 'Gas Department', office_name: 'GAIL Gas Limited Bengaluru', officer_name: 'Mr. Manoj Sinha', designation: 'General Manager', phone: '+918026005500', emergency_phone: '18001029299', email: 'support.gail@gail.co.in', website: 'https://gailgas.com', latitude: 12.9610, longitude: 77.5855, address: 'Richmond Road, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '9:00 AM - 6:00 PM', status: 'Open' },
  { id: 10, department_name: 'Animal Control', office_name: 'BBMP Animal Husbandry Department', officer_name: 'Dr. Manjunath', designation: 'Joint Director', phone: '+918022221296', emergency_phone: '+918022221296', email: 'jd.ah@bbmp.gov.in', website: 'https://bbmp.gov.in', latitude: 12.9740, longitude: 77.5880, address: 'Hudson Circle, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '9:30 AM - 5:30 PM', status: 'Open' },
  { id: 11, department_name: 'Electricity Department', office_name: 'BEST Electric House', officer_name: 'Mr. Amit Deshmukh', designation: 'Chief Engineer', phone: '+912222856262', emergency_phone: '1912', email: 'ce.electric@bestundertaking.com', website: 'https://bestundertaking.com', latitude: 18.9238, longitude: 72.8315, address: 'Colaba, Mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', working_hours: '9:00 AM - 5:30 PM', status: 'Open' },
  { id: 12, department_name: 'Municipality', office_name: 'BMC Headquarters', officer_name: 'Mr. I. S. Chahal', designation: 'Municipal Commissioner', phone: '+912222620251', emergency_phone: '1916', email: 'mc@mcgm.gov.in', website: 'https://portal.mcgm.gov.in', latitude: 18.9401, longitude: 72.8355, address: 'Fort, Ward A, Mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', working_hours: '9:30 AM - 6:00 PM', status: 'Open' },
  { id: 13, department_name: 'Police Department', office_name: 'Colaba Police Station', officer_name: 'Inspector Vijay Salaskar', designation: 'Station House Officer', phone: '+912222851857', emergency_phone: '100', email: 'sp.colaba@mahapolice.gov.in', website: 'https://mumbaipolice.gov.in', latitude: 18.9150, longitude: 72.8277, address: 'Colaba Causeway, Mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 14, department_name: 'Fire Department', office_name: 'Byculla Fire Station HQ', officer_name: 'Mr. Hemant Parab', designation: 'Chief Fire Officer', phone: '+912223076111', emergency_phone: '101', email: 'cfo.mfs@mcgm.gov.in', website: 'https://mumbaifireservice.org', latitude: 18.9745, longitude: 72.8344, address: 'Byculla, Mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 15, department_name: 'Health Department', office_name: 'KEM Hospital Parel', officer_name: 'Dr. Sangeeta Rawat', designation: 'Dean', phone: '+912224107000', emergency_phone: '108', email: 'kemhospital@kem.edu', website: 'https://kem.edu', latitude: 19.0028, longitude: 72.8422, address: 'Parel, Mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 16, department_name: 'Electricity Department', office_name: 'BSES Rajdhani Power Ltd', officer_name: 'Mr. Rajesh Gupta', designation: 'General Manager', phone: '+911139999707', emergency_phone: '19123', email: 'brpl.customercare@relianceada.com', website: 'https://bsesdelhi.com', latitude: 28.5450, longitude: 77.2612, address: 'Nehru Place, New Delhi', city: 'Delhi', district: 'South Delhi', state: 'Delhi', country: 'India', working_hours: '9:00 AM - 5:30 PM', status: 'Open' },
  { id: 17, department_name: 'Municipality', office_name: 'MCD Civic Centre', officer_name: 'Mrs. Alka Sharma', designation: 'Commissioner', phone: '+911123225000', emergency_phone: '1266', email: 'commissioner@mcd.nic.in', website: 'https://mcdonline.nic.in', latitude: 28.6366, longitude: 77.2281, address: 'Minto Road, New Delhi', city: 'Delhi', district: 'Central Delhi', state: 'Delhi', country: 'India', working_hours: '9:30 AM - 6:00 PM', status: 'Open' },
  { id: 18, department_name: 'Police Department', office_name: 'Connaught Place Police Station', officer_name: 'Inspector Sanjay Dutt', designation: 'Station House Officer', phone: '+911123747100', emergency_phone: '112', email: 'sho-cp-dl@nic.in', website: 'https://delhipolice.gov.in', latitude: 28.6304, longitude: 77.2177, address: 'Connaught Place, New Delhi', city: 'Delhi', district: 'New Delhi', state: 'Delhi', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 19, department_name: 'Fire Department', office_name: 'Connaught Place Fire Station', officer_name: 'Mr. Atul Garg', designation: 'Director', phone: '+911123412222', emergency_phone: '101', email: 'director.dfs@nic.in', website: 'https://dfs.delhigovt.nic.in', latitude: 28.6291, longitude: 77.2215, address: 'Outer Circle, Connaught Place, New Delhi', city: 'Delhi', district: 'New Delhi', state: 'Delhi', country: 'India', working_hours: '24 Hours', status: 'Open' },
  { id: 20, department_name: 'Health Department', office_name: 'All India Institute of Medical Sciences (AIIMS)', officer_name: 'Dr. M. Srinivas', designation: 'Director', phone: '+911126588500', emergency_phone: '108', email: 'director@aiims.edu', website: 'https://aiims.edu', latitude: 28.5672, longitude: 77.2100, address: 'Ansari Nagar, New Delhi', city: 'Delhi', district: 'South Delhi', state: 'Delhi', country: 'India', working_hours: '24 Hours', status: 'Open' },
  // Guntur
  { id: 21, department_name: 'Municipality', office_name: 'Guntur Municipal Corporation', officer_name: null, designation: null, phone: null, emergency_phone: '1902', email: null, website: 'https://guntur.cdma.ap.gov.in/ulbprofile/guntur/grievances/', latitude: 16.3067, longitude: 80.4365, address: 'Guntur Municipal Corporation, Guntur', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', working_hours: 'Government working hours', status: 'Open' },
  { id: 22, department_name: 'Electricity Department', office_name: 'APCPDCL - Guntur Service Area', officer_name: null, designation: null, phone: null, emergency_phone: '1912', email: null, website: 'https://apcpdcl.in', latitude: 16.3067, longitude: 80.4365, address: 'Guntur, Andhra Pradesh', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 23, department_name: 'Police Department', office_name: 'Guntur Police', officer_name: null, designation: null, phone: null, emergency_phone: '112', email: null, website: 'https://gunturpolice.ap.gov.in', latitude: 16.3039, longitude: 80.4452, address: 'Guntur, Andhra Pradesh', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', working_hours: '24 Hours', status: 'Open' },
  // Vijayawada
  { id: 24, department_name: 'Municipality', office_name: 'Vijayawada Municipal Corporation', officer_name: null, designation: null, phone: null, emergency_phone: '1902', email: null, website: 'https://vijayawada.cdma.ap.gov.in/ulbprofile/vijayawada/grievances', latitude: 16.5062, longitude: 80.6480, address: 'Vijayawada Municipal Corporation, Vijayawada', city: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh', country: 'India', working_hours: 'Government working hours', status: 'Open' },
  { id: 25, department_name: 'Electricity Department', office_name: 'APCPDCL - Vijayawada Service Area', officer_name: null, designation: null, phone: null, emergency_phone: '1912', email: null, website: 'https://apcpdcl.in', latitude: 16.5131, longitude: 80.6325, address: 'Vijayawada, Andhra Pradesh', city: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 26, department_name: 'Police Department', office_name: 'Vijayawada City Police', officer_name: null, designation: null, phone: null, emergency_phone: '112', email: null, website: 'https://vijayawadacitypolice.ap.gov.in', latitude: 16.5186, longitude: 80.6195, address: 'Vijayawada, Andhra Pradesh', city: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh', country: 'India', working_hours: '24 Hours', status: 'Open' },
  // Bengaluru
  { id: 27, department_name: 'Municipality', office_name: 'BBMP / Greater Bengaluru Authority', officer_name: null, designation: null, phone: null, emergency_phone: '1533', email: null, website: 'https://site.bbmp.gov.in/contact.html', latitude: 12.9610, longitude: 77.5755, address: 'N.R. Square, Bengaluru, Karnataka 560002', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: 'Government working hours', status: 'Open' },
  { id: 28, department_name: 'Electricity Department', office_name: 'BESCOM', officer_name: null, designation: null, phone: null, emergency_phone: '1912', email: null, website: 'https://bescom.co.in', latitude: 12.9784, longitude: 77.6408, address: 'Bengaluru, Karnataka', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 29, department_name: 'Water Supply Department', office_name: 'BWSSB', officer_name: null, designation: null, phone: null, emergency_phone: '1916', email: null, website: 'https://bwssb.gov.in/complaint', latitude: 12.9703, longitude: 77.5752, address: 'Cauvery Bhavan, K.G. Road, Bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 30, department_name: 'Police Department', office_name: 'Bengaluru City Police', officer_name: null, designation: null, phone: null, emergency_phone: '112', email: null, website: 'https://ksp.karnataka.gov.in', latitude: 12.9716, longitude: 77.5946, address: 'Bengaluru, Karnataka', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', working_hours: '24 Hours', status: 'Open' },
  // Namburu
  { id: 31, department_name: 'Municipality', office_name: 'Namburu Gram Panchayat', officer_name: null, designation: null, phone: null, emergency_phone: '1902', email: null, website: 'https://panchayat.ap.gov.in', latitude: 16.3685, longitude: 80.5234, address: 'Main Bazaar, Near Bus Stand, Namburu', city: 'Namburu', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', working_hours: 'Government working hours', status: 'Open' },
  { id: 32, department_name: 'Electricity Department', office_name: 'APCPDCL - Namburu Service Area', officer_name: null, designation: null, phone: null, emergency_phone: '1912', email: null, website: 'https://apcpdcl.in', latitude: 16.3712, longitude: 80.5186, address: 'Namburu, Guntur District, Andhra Pradesh', city: 'Namburu', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 33, department_name: 'Health Department', office_name: 'Primary Health Centre Namburu', officer_name: null, designation: null, phone: null, emergency_phone: '108', email: null, website: 'https://hmfw.ap.gov.in', latitude: 16.3642, longitude: 80.5270, address: 'Near ZP High School, Namburu', city: 'Namburu', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', working_hours: 'Verify local PHC hours', status: 'Open' },
  // Chilakaluripet
  { id: 34, department_name: 'Municipality', office_name: 'Chilakaluripet Municipality', officer_name: null, designation: null, phone: null, emergency_phone: '1902', email: null, website: 'https://chilakaluripet.cdma.ap.gov.in/ulbprofile/chilakaluripet/grievances/', latitude: 16.0890, longitude: 80.1670, address: 'Chilakaluripet Municipality, Andhra Pradesh', city: 'Chilakaluripet', district: 'Palnadu', state: 'Andhra Pradesh', country: 'India', working_hours: 'Government working hours', status: 'Open' },
  { id: 35, department_name: 'Electricity Department', office_name: 'APCPDCL - Chilakaluripet Service Area', officer_name: null, designation: null, phone: null, emergency_phone: '1912', email: null, website: 'https://apcpdcl.in', latitude: 16.0890, longitude: 80.1670, address: 'Chilakaluripet, Andhra Pradesh', city: 'Chilakaluripet', district: 'Palnadu', state: 'Andhra Pradesh', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 36, department_name: 'Police Department', office_name: 'Chilakaluripet Police', officer_name: null, designation: null, phone: null, emergency_phone: '112', email: null, website: 'https://ap.police.gov.in', latitude: 16.0890, longitude: 80.1670, address: 'Chilakaluripet, Andhra Pradesh', city: 'Chilakaluripet', district: 'Palnadu', state: 'Andhra Pradesh', country: 'India', working_hours: '24 Hours', status: 'Open' },
  // Hyderabad
  { id: 37, department_name: 'Municipality', office_name: 'Greater Hyderabad Municipal Corporation (GHMC)', officer_name: null, designation: null, phone: null, emergency_phone: '21111111', email: null, website: 'https://www.ghmc.gov.in', latitude: 17.4042, longitude: 78.4719, address: 'CC Complex, Tank Bund Road, Hyderabad', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', working_hours: 'Government working hours', status: 'Open' },
  { id: 38, department_name: 'Water Supply Department', office_name: 'Hyderabad Metropolitan Water Supply and Sewerage Board', officer_name: null, designation: null, phone: null, emergency_phone: '155313', email: null, website: 'https://www.hyderabadwater.gov.in', latitude: 17.4042, longitude: 78.4719, address: 'Hyderabad, Telangana', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 39, department_name: 'Electricity Department', office_name: 'TGSPDCL', officer_name: null, designation: null, phone: null, emergency_phone: '1912', email: null, website: 'https://webportla.tgsouthernpower.org', latitude: 17.3984, longitude: 78.4735, address: 'Hyderabad, Telangana', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', working_hours: '24 Hours Complaint Service', status: 'Open' },
  { id: 40, department_name: 'Police Department', office_name: 'Hyderabad City Police', officer_name: null, designation: null, phone: null, emergency_phone: '112', email: null, website: 'https://hyderabadpolice.gov.in', latitude: 17.4116, longitude: 78.4497, address: 'Basheerbagh, Hyderabad', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', working_hours: '24 Hours', status: 'Open' },
];

const mockEmergencyContacts: any[] = [
  { id: 1, department: 'National Emergency Number', phone: '112', city: 'All', state: 'All' },
  { id: 2, department: 'Police Control Room', phone: '100', city: 'All', state: 'All' },
  { id: 3, department: 'Fire Station Control Room', phone: '101', city: 'All', state: 'All' },
  { id: 4, department: 'Ambulance / Medical Emergency', phone: '102', city: 'All', state: 'All' },
  { id: 5, department: 'Disaster Management', phone: '108', city: 'All', state: 'All' },
  { id: 6, department: 'Women Helpline', phone: '1091', city: 'All', state: 'All' },
  { id: 7, department: 'Child Helpline', phone: '1098', city: 'All', state: 'All' },
  { id: 8, department: 'Cyber Crime Helpline', phone: '1930', city: 'All', state: 'All' },
  { id: 9, department: 'LPG Leakage Helpline', phone: '1906', city: 'All', state: 'All' },
  { id: 10, department: 'Anti-Corruption Helpline', phone: '1064', city: 'All', state: 'All' },
  { id: 11, department: 'BBMP Emergency Control Room', phone: '+918022221188', city: 'Bengaluru', state: 'Karnataka' },
  { id: 12, department: 'BWSSB Water Emergency Room', phone: '1916', city: 'Bengaluru', state: 'Karnataka' },
  { id: 13, department: 'BESCOM Electricity Control Room', phone: '1912', city: 'Bengaluru', state: 'Karnataka' },
  { id: 14, department: 'BMC Disaster Management Room', phone: '1916', city: 'Mumbai', state: 'Maharashtra' },
  { id: 15, department: 'BEST Electric Leakage Room', phone: '+912222856262', city: 'Mumbai', state: 'Maharashtra' },
  { id: 16, department: 'MCD Central Control Room', phone: '1266', city: 'Delhi', state: 'Delhi' },
  { id: 17, department: 'BSES Rajdhani Gas/Fire Room', phone: '19123', city: 'Delhi', state: 'Delhi' },
];

const mockBookmarks: any[] = [];
const mockComplaints: any[] = [
  {
    id: 1,
    category_id: 1,
    department_id: 1,
    category_name: 'Power Cut',
    department_name: 'Electricity Department',
    office_name: 'BESCOM Indiranagar',
    user_id: 1,
    user_name: 'Citizen Rajesh Rao',
    user_phone: '+919876543210',
    status: 'In Progress',
    priority: 'High',
    location: '12th Main Road, 4th Cross, Indiranagar',
    description: 'Transformer sparked violently around 6:00 PM and whole street has been without power for 3 hours.',
    admin_reply: 'Field technician crew dispatched with replacement fuse and transformer assessment. Expected restoration by 9:30 PM.',
    replied_at: new Date(Date.now() - 3600000),
    created_at: new Date(Date.now() - 7200000),
  },
  {
    id: 2,
    category_id: 5,
    department_id: 3,
    category_name: 'Water Leakage',
    department_name: 'Water Supply Department',
    office_name: 'BWSSB Central Office',
    user_id: 1,
    user_name: 'Citizen Priya Sharma',
    user_phone: '+919812345678',
    status: 'Open',
    priority: 'Medium',
    location: 'Near Cauvery Bhavan, K.G. Road',
    description: 'Main underground pipeline leak causing fresh drinking water to spill on the sidewalk.',
    admin_reply: null,
    replied_at: null,
    created_at: new Date(Date.now() - 14400000),
  },
  {
    id: 3,
    category_id: 3,
    department_id: 2,
    category_name: 'Garbage Collection',
    department_name: 'Municipality',
    office_name: 'BBMP East Zone Office',
    user_id: 1,
    user_name: 'Citizen Anand V.',
    user_phone: '+919845012345',
    status: 'Open',
    priority: 'High',
    location: 'Queens Road, Vasanth Nagar',
    description: 'Solid waste pile accumulating for 4 days near community school, blocking pathway.',
    admin_reply: null,
    replied_at: null,
    created_at: new Date(Date.now() - 21600000),
  }
];

// Helper: Haversine distance in meters
function getHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-Memory Query Dispatcher
const fallbackQuery = async (text: string, params: any[] = []) => {
  const sql = text.trim();

  // Test query
  if (sql === 'SELECT 1') {
    return { rows: [{ '?column?': 1 }], rowCount: 1 };
  }

  // Complaint Categories Queries
  if (sql.includes('FROM complaint_categories')) {
    if (sql.startsWith('SELECT department_name FROM complaint_categories WHERE category_name')) {
      const cat = mockCategories.find((c) => c.category_name === params[0]);
      return { rows: cat ? [{ department_name: cat.department_name }] : [], rowCount: cat ? 1 : 0 };
    }
    if (sql.startsWith('SELECT id FROM complaint_categories WHERE category_name')) {
      const cat = mockCategories.find((c) => c.category_name === params[0]);
      return { rows: cat ? [{ id: cat.id }] : [], rowCount: cat ? 1 : 0 };
    }
    if (sql.startsWith('SELECT id FROM complaint_categories WHERE id')) {
      const cat = mockCategories.find((c) => c.id === parseInt(params[0]));
      return { rows: cat ? [{ id: cat.id }] : [], rowCount: cat ? 1 : 0 };
    }
    if (sql.startsWith('SELECT * FROM complaint_categories')) {
      const sorted = [...mockCategories].sort((a, b) => a.category_name.localeCompare(b.category_name));
      return { rows: sorted, rowCount: sorted.length };
    }
  }

  if (sql.startsWith('INSERT INTO complaint_categories')) {
    const newItem = {
      id: mockCategories.length + 1,
      category_name: params[0],
      department_name: params[1],
      icon: params[2] || 'HelpCircle',
      description: params[3] || '',
    };
    mockCategories.push(newItem);
    return { rows: [newItem], rowCount: 1 };
  }

  if (sql.startsWith('UPDATE complaint_categories')) {
    const targetId = parseInt(params[4]);
    const idx = mockCategories.findIndex((c) => c.id === targetId);
    if (idx !== -1) {
      mockCategories[idx] = {
        ...mockCategories[idx],
        category_name: params[0],
        department_name: params[1],
        icon: params[2],
        description: params[3],
      };
      return { rows: [mockCategories[idx]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (sql.startsWith('DELETE FROM complaint_categories')) {
    const targetId = parseInt(params[0]);
    const idx = mockCategories.findIndex((c) => c.id === targetId);
    if (idx !== -1) {
      mockCategories.splice(idx, 1);
    }
    return { rows: [], rowCount: 1 };
  }

  // Users Queries
  if (sql.includes('FROM users')) {
    if (sql.startsWith('SELECT id FROM users WHERE email') || sql.startsWith('SELECT * FROM users WHERE email')) {
      const u = mockUsers.find((user) => user.email.toLowerCase() === params[0].toLowerCase());
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }
  }

  if (sql.startsWith('INSERT INTO users')) {
    const newUser = {
      id: mockUsers.length + 1,
      name: params[0],
      phone: params[1],
      email: params[2],
      password: params[3],
      created_at: new Date(),
    };
    mockUsers.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // Departments Queries
  if (sql.includes('FROM departments')) {
    if (sql.startsWith('SELECT id FROM departments WHERE id')) {
      const dept = mockDepartments.find((d) => d.id === parseInt(params[0]));
      return { rows: dept ? [{ id: dept.id }] : [], rowCount: dept ? 1 : 0 };
    }

    // Nearest Departments Spatial Search
    if (sql.includes('ST_Distance') || sql.includes('ORDER BY location')) {
      // params can be [lng, lat, mappedDepartmentName, limitVal] or [lng, lat, limitVal]
      let lng: number, lat: number, mappedDept: string | null = null, limitVal: number;
      if (params.length === 4) {
        lng = parseFloat(params[0]);
        lat = parseFloat(params[1]);
        mappedDept = params[2];
        limitVal = parseInt(params[3]);
      } else {
        lng = parseFloat(params[0]);
        lat = parseFloat(params[1]);
        limitVal = parseInt(params[2]);
      }

      let filtered = mockDepartments;
      if (mappedDept) {
        filtered = mockDepartments.filter((d) => d.department_name.toLowerCase() === mappedDept!.toLowerCase());
      }

      const calculated = filtered.map((dept) => {
        const distMeters = getHaversineDistanceMeters(lat, lng, dept.latitude, dept.longitude);
        return {
          ...dept,
          distance_meters: distMeters,
        };
      });

      calculated.sort((a, b) => a.distance_meters - b.distance_meters);
      const sliced = calculated.slice(0, limitVal);
      return { rows: sliced, rowCount: sliced.length };
    }

    // Filtered departments list query
    let results = [...mockDepartments];
    let paramIdx = 0;
    if (sql.includes('AND department_name =')) {
      const deptName = params[paramIdx++];
      results = results.filter((d) => d.department_name === deptName);
    }
    if (sql.includes('AND city ILIKE')) {
      const cityVal = params[paramIdx++];
      results = results.filter((d) => d.city.toLowerCase().includes(cityVal.toLowerCase()));
    }
    if (sql.includes('AND district ILIKE')) {
      const distVal = params[paramIdx++];
      results = results.filter((d) => d.district.toLowerCase().includes(distVal.toLowerCase()));
    }
    if (sql.includes('AND (office_name ILIKE')) {
      const searchVal = params[paramIdx++].replace(/%/g, '').toLowerCase();
      results = results.filter(
        (d) =>
          d.office_name.toLowerCase().includes(searchVal) ||
          d.department_name.toLowerCase().includes(searchVal) ||
          d.address.toLowerCase().includes(searchVal) ||
          (d.officer_name && d.officer_name.toLowerCase().includes(searchVal))
      );
    }

    results.sort((a, b) => a.office_name.localeCompare(b.office_name));
    return { rows: results, rowCount: results.length };
  }

  if (sql.startsWith('INSERT INTO departments')) {
    const newDept = {
      id: mockDepartments.length + 1,
      department_name: params[0],
      office_name: params[1],
      officer_name: params[2],
      designation: params[3],
      phone: params[4],
      emergency_phone: params[5],
      email: params[6],
      website: params[7],
      latitude: parseFloat(params[8]),
      longitude: parseFloat(params[9]),
      address: params[10],
      city: params[11],
      district: params[12],
      state: params[13],
      country: params[14] || 'India',
      working_hours: params[15] || '9:00 AM - 5:00 PM',
      status: params[16] || 'Open',
    };
    mockDepartments.push(newDept);
    return { rows: [newDept], rowCount: 1 };
  }

  if (sql.startsWith('UPDATE departments')) {
    const targetId = parseInt(params[17]);
    const idx = mockDepartments.findIndex((d) => d.id === targetId);
    if (idx !== -1) {
      mockDepartments[idx] = {
        ...mockDepartments[idx],
        department_name: params[0],
        office_name: params[1],
        officer_name: params[2],
        designation: params[3],
        phone: params[4],
        emergency_phone: params[5],
        email: params[6],
        website: params[7],
        latitude: parseFloat(params[8]),
        longitude: parseFloat(params[9]),
        address: params[10],
        city: params[11],
        district: params[12],
        state: params[13],
        country: params[14],
        working_hours: params[15],
        status: params[16],
      };
      return { rows: [mockDepartments[idx]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (sql.startsWith('DELETE FROM departments')) {
    const targetId = parseInt(params[0]);
    const idx = mockDepartments.findIndex((d) => d.id === targetId);
    if (idx !== -1) {
      mockDepartments.splice(idx, 1);
    }
    return { rows: [], rowCount: 1 };
  }

  // Emergency Contacts Queries
  if (sql.includes('FROM emergency_contacts')) {
    if (sql.startsWith('SELECT id FROM emergency_contacts WHERE id')) {
      const contact = mockEmergencyContacts.find((c) => c.id === parseInt(params[0]));
      return { rows: contact ? [{ id: contact.id }] : [], rowCount: contact ? 1 : 0 };
    }

    let results = [...mockEmergencyContacts];
    let paramIdx = 0;
    if (sql.includes('city ILIKE')) {
      const cityVal = params[paramIdx++];
      results = results.filter((c) => c.city.toLowerCase() === cityVal.toLowerCase() || c.city === 'All');
    }
    if (sql.includes('state ILIKE')) {
      const stateVal = params[paramIdx++];
      results = results.filter((c) => c.state.toLowerCase() === stateVal.toLowerCase() || c.state === 'All');
    }

    results.sort((a, b) => a.id - b.id);
    return { rows: results, rowCount: results.length };
  }

  if (sql.startsWith('INSERT INTO emergency_contacts')) {
    const newContact = {
      id: mockEmergencyContacts.length + 1,
      department: params[0],
      phone: params[1],
      city: params[2] || 'All',
      state: params[3] || 'All',
    };
    mockEmergencyContacts.push(newContact);
    return { rows: [newContact], rowCount: 1 };
  }

  if (sql.startsWith('UPDATE emergency_contacts')) {
    const targetId = parseInt(params[4]);
    const idx = mockEmergencyContacts.findIndex((c) => c.id === targetId);
    if (idx !== -1) {
      mockEmergencyContacts[idx] = {
        ...mockEmergencyContacts[idx],
        department: params[0],
        phone: params[1],
        city: params[2] || 'All',
        state: params[3] || 'All',
      };
      return { rows: [mockEmergencyContacts[idx]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (sql.startsWith('DELETE FROM emergency_contacts')) {
    const targetId = parseInt(params[0]);
    const idx = mockEmergencyContacts.findIndex((c) => c.id === targetId);
    if (idx !== -1) {
      mockEmergencyContacts.splice(idx, 1);
    }
    return { rows: [], rowCount: 1 };
  }

  // Bookmarks Queries
  if (sql.includes('FROM bookmarks') || sql.includes('from bookmarks')) {
    if (sql.includes('JOIN departments') || sql.includes('join departments') || sql.includes('SELECT d.*')) {
      const userId = parseInt(params[0]);
      const userBookmarks = mockBookmarks.filter((b) => b.user_id === userId);
      const depts = userBookmarks
        .map((b) => mockDepartments.find((d) => d.id === b.department_id))
        .filter(Boolean);
      return { rows: depts, rowCount: depts.length };
    }

    if (sql.includes('WHERE user_id = $1 AND department_id = $2')) {
      const userId = parseInt(params[0]);
      const deptId = parseInt(params[1]);
      const bm = mockBookmarks.find((b) => b.user_id === userId && b.department_id === deptId);
      return { rows: bm ? [{ id: bm.id }] : [], rowCount: bm ? 1 : 0 };
    }
  }

  if (sql.startsWith('INSERT INTO bookmarks')) {
    const newBm = {
      id: mockBookmarks.length + 1,
      user_id: parseInt(params[0]),
      department_id: parseInt(params[1]),
      created_at: new Date(),
    };
    mockBookmarks.push(newBm);
    return { rows: [newBm], rowCount: 1 };
  }

  if (sql.startsWith('DELETE FROM bookmarks')) {
    const userId = parseInt(params[0]);
    const deptId = parseInt(params[1]);
    const idx = mockBookmarks.findIndex((b) => b.user_id === userId && b.department_id === deptId);
    if (idx !== -1) {
      mockBookmarks.splice(idx, 1);
    }
    return { rows: [], rowCount: 1 };
  }

  // Complaints Queries
  if (sql.includes('FROM complaints')) {
    if (sql.startsWith('SELECT * FROM complaints WHERE user_id')) {
      const userId = parseInt(params[0]);
      const userComplaints = mockComplaints.filter((c) => c.user_id === userId);
      userComplaints.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: userComplaints, rowCount: userComplaints.length };
    }
    if (sql.startsWith('SELECT * FROM complaints ORDER BY')) {
      const allComplaints = [...mockComplaints].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: allComplaints, rowCount: allComplaints.length };
    }
  }

  if (sql.startsWith('UPDATE complaints SET')) {
    const complaintId = parseInt(params[params.length - 1]);
    const complaint = mockComplaints.find((c) => c.id === complaintId);
    if (complaint) {
      if (sql.includes('admin_reply')) {
        // params: [reply, status, id] or [reply, id]
        complaint.admin_reply = params[0];
        if (params.length > 2) {
          complaint.status = params[1];
        }
        complaint.replied_at = new Date();
      } else if (sql.includes('status')) {
        complaint.status = params[0];
      }
      return { rows: [complaint], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (sql.startsWith('INSERT INTO complaints')) {
    const newComplaint = {
      id: mockComplaints.length + 1,
      category_id: parseInt(params[0]),
      department_id: parseInt(params[1]),
      category_name: params[2],
      department_name: params[3],
      office_name: params[4],
      user_id: parseInt(params[5]),
      user_name: params[6],
      user_phone: params[7],
      status: params[8],
      priority: params[9],
      location: params[10],
      description: params[11],
      created_at: new Date(params[12]),
    };
    mockComplaints.push(newComplaint);
    return { rows: [newComplaint], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  if (useFallback) {
    const res = await fallbackQuery(text, params);
    const duration = Date.now() - start;
    console.log(`[Database Fallback] Query executed in ${duration}ms:`, { text, rowsCount: res.rowCount });
    return res;
  }

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[Database PostgreSQL] Query executed in ${duration}ms:`, { text, rowsCount: res.rowCount });
    return res;
  } catch (error) {
    console.error(`[Database Error]`, error);
    console.warn(`[Database] PostgreSQL query/connection failed, switching to in-memory fallback store.`);
    useFallback = true;
    const res = await fallbackQuery(text, params);
    const duration = Date.now() - start;
    console.log(`[Database Fallback] Query executed in ${duration}ms:`, { text, rowsCount: res.rowCount });
    return res;
  }
};

export default {
  query,
};

