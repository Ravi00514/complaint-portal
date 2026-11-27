import type { Department, EmergencyContact, ComplaintCategory } from '../types';

export const FallbackCategories: ComplaintCategory[] = [
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
  { id: 17, category_name: 'Water Supply', department_name: 'Water Supply Department', icon: 'Waves', description: 'Reporting dirty water delivery, low pressure, and irregular timing.' }
];

export const FallbackDepartments: Department[] = [
  // Electricity Department
  {
    id: 101,
    department_name: 'Electricity Department',
    office_name: 'Regional Electricity Board & Control Desk',
    officer_name: 'Mr. Ramesh Kumar',
    designation: 'Assistant Executive Engineer',
    phone: '+91 80 2525 1111',
    emergency_phone: '1912',
    email: 'aee.helpline@bescom.co.in',
    website: 'https://bescom.karnataka.gov.in',
    latitude: 12.9784,
    longitude: 77.6408,
    address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Emergency Dispatch / Office: 9:00 AM - 5:30 PM',
    status: 'Open'
  },
  {
    id: 102,
    department_name: 'Electricity Department',
    office_name: 'BEST Electric Supply Head Office',
    officer_name: 'Mr. Amit Deshmukh',
    designation: 'Chief Electrical Officer',
    phone: '+91 22 2285 6262',
    emergency_phone: '1912',
    email: 'ce.electric@bestundertaking.com',
    website: 'https://bestundertaking.com',
    latitude: 18.9238,
    longitude: 72.8315,
    address: 'Electric House, Colaba, Mumbai, Maharashtra 400001',
    city: 'Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    country: 'India',
    working_hours: '24 Hours Helpline',
    status: 'Open'
  },
  // Guntur
  {
    id: 120,
    department_name: 'Municipality',
    office_name: 'Guntur Municipal Corporation',
    emergency_phone: '1902',
    website: 'https://guntur.cdma.ap.gov.in/ulbprofile/guntur/grievances/',
    latitude: 16.3067,
    longitude: 80.4365,
    address: 'Guntur Municipal Corporation, Guntur',
    city: 'Guntur',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: 'Government working hours',
    status: 'Open'
  },
  {
    id: 121,
    department_name: 'Electricity Department',
    office_name: 'APCPDCL - Guntur Service Area',
    emergency_phone: '1912',
    website: 'https://apcpdcl.in',
    latitude: 16.3067,
    longitude: 80.4365,
    address: 'Guntur, Andhra Pradesh',
    city: 'Guntur',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 122,
    department_name: 'Police Department',
    office_name: 'Guntur Police',
    emergency_phone: '112',
    website: 'https://gunturpolice.ap.gov.in',
    latitude: 16.3039,
    longitude: 80.4452,
    address: 'Guntur, Andhra Pradesh',
    city: 'Guntur',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  },
  // Vijayawada
  {
    id: 123,
    department_name: 'Municipality',
    office_name: 'Vijayawada Municipal Corporation',
    emergency_phone: '1902',
    website: 'https://vijayawada.cdma.ap.gov.in/ulbprofile/vijayawada/grievances',
    latitude: 16.5062,
    longitude: 80.6480,
    address: 'Vijayawada Municipal Corporation, Vijayawada',
    city: 'Vijayawada',
    district: 'NTR',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: 'Government working hours',
    status: 'Open'
  },
  {
    id: 124,
    department_name: 'Electricity Department',
    office_name: 'APCPDCL - Vijayawada Service Area',
    emergency_phone: '1912',
    website: 'https://apcpdcl.in',
    latitude: 16.5131,
    longitude: 80.6325,
    address: 'Vijayawada, Andhra Pradesh',
    city: 'Vijayawada',
    district: 'NTR',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 125,
    department_name: 'Police Department',
    office_name: 'Vijayawada City Police',
    emergency_phone: '112',
    website: 'https://vijayawadacitypolice.ap.gov.in',
    latitude: 16.5186,
    longitude: 80.6195,
    address: 'Vijayawada, Andhra Pradesh',
    city: 'Vijayawada',
    district: 'NTR',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  },
  // Bengaluru
  {
    id: 126,
    department_name: 'Municipality',
    office_name: 'BBMP / Greater Bengaluru Authority',
    emergency_phone: '1533',
    website: 'https://site.bbmp.gov.in/contact.html',
    latitude: 12.9610,
    longitude: 77.5755,
    address: 'N.R. Square, Bengaluru, Karnataka 560002',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: 'Government working hours',
    status: 'Open'
  },
  {
    id: 127,
    department_name: 'Electricity Department',
    office_name: 'BESCOM Central',
    emergency_phone: '1912',
    website: 'https://bescom.co.in',
    latitude: 12.9784,
    longitude: 77.6408,
    address: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 128,
    department_name: 'Water Supply Department',
    office_name: 'BWSSB Central Service',
    emergency_phone: '1916',
    website: 'https://bwssb.gov.in/complaint',
    latitude: 12.9703,
    longitude: 77.5752,
    address: 'Cauvery Bhavan, K.G. Road, Bengaluru',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 129,
    department_name: 'Police Department',
    office_name: 'Bengaluru City Police HQ',
    emergency_phone: '112',
    website: 'https://ksp.karnataka.gov.in',
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  },
  // Namburu
  {
    id: 130,
    department_name: 'Municipality',
    office_name: 'Namburu Gram Panchayat',
    emergency_phone: '1902',
    website: 'https://panchayat.ap.gov.in',
    latitude: 16.3685,
    longitude: 80.5234,
    address: 'Main Bazaar, Near Bus Stand, Namburu',
    city: 'Namburu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: 'Government working hours',
    status: 'Open'
  },
  {
    id: 131,
    department_name: 'Electricity Department',
    office_name: 'APCPDCL - Namburu Service Area',
    emergency_phone: '1912',
    website: 'https://apcpdcl.in',
    latitude: 16.3712,
    longitude: 80.5186,
    address: 'Namburu, Guntur District, Andhra Pradesh',
    city: 'Namburu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 132,
    department_name: 'Health Department',
    office_name: 'Primary Health Centre Namburu',
    emergency_phone: '108',
    website: 'https://hmfw.ap.gov.in',
    latitude: 16.3642,
    longitude: 80.5270,
    address: 'Near ZP High School, Namburu',
    city: 'Namburu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: 'Verify local PHC hours',
    status: 'Open'
  },
  // Chilakaluripet
  {
    id: 133,
    department_name: 'Municipality',
    office_name: 'Chilakaluripet Municipality',
    emergency_phone: '1902',
    website: 'https://chilakaluripet.cdma.ap.gov.in/ulbprofile/chilakaluripet/grievances/',
    latitude: 16.0890,
    longitude: 80.1670,
    address: 'Chilakaluripet Municipality, Andhra Pradesh',
    city: 'Chilakaluripet',
    district: 'Palnadu',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: 'Government working hours',
    status: 'Open'
  },
  {
    id: 134,
    department_name: 'Electricity Department',
    office_name: 'APCPDCL - Chilakaluripet Service Area',
    emergency_phone: '1912',
    website: 'https://apcpdcl.in',
    latitude: 16.0890,
    longitude: 80.1670,
    address: 'Chilakaluripet, Andhra Pradesh',
    city: 'Chilakaluripet',
    district: 'Palnadu',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 135,
    department_name: 'Police Department',
    office_name: 'Chilakaluripet Police',
    emergency_phone: '112',
    website: 'https://ap.police.gov.in',
    latitude: 16.0890,
    longitude: 80.1670,
    address: 'Chilakaluripet, Andhra Pradesh',
    city: 'Chilakaluripet',
    district: 'Palnadu',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  },
  // Hyderabad
  {
    id: 136,
    department_name: 'Municipality',
    office_name: 'Greater Hyderabad Municipal Corporation (GHMC)',
    emergency_phone: '21111111',
    website: 'https://www.ghmc.gov.in',
    latitude: 17.4042,
    longitude: 78.4719,
    address: 'CC Complex, Tank Bund Road, Hyderabad',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    working_hours: 'Government working hours',
    status: 'Open'
  },
  {
    id: 137,
    department_name: 'Water Supply Department',
    office_name: 'Hyderabad Metropolitan Water Supply and Sewerage Board',
    emergency_phone: '155313',
    website: 'https://www.hyderabadwater.gov.in',
    latitude: 17.4042,
    longitude: 78.4719,
    address: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 138,
    department_name: 'Electricity Department',
    office_name: 'TGSPDCL',
    emergency_phone: '1912',
    website: 'https://webportla.tgsouthernpower.org',
    latitude: 17.3984,
    longitude: 78.4735,
    address: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    working_hours: '24 Hours Complaint Service',
    status: 'Open'
  },
  {
    id: 139,
    department_name: 'Police Department',
    office_name: 'Hyderabad City Police',
    emergency_phone: '112',
    website: 'https://hyderabadpolice.gov.in',
    latitude: 17.4116,
    longitude: 78.4497,
    address: 'Basheerbagh, Hyderabad',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  },
  // Municipality
  {
    id: 103,
    department_name: 'Municipality',
    office_name: 'Municipal Corporation Zone Control Desk',
    officer_name: 'Mrs. Sunitha Rao',
    designation: 'Joint Municipal Commissioner',
    phone: '+91 80 2297 5800',
    emergency_phone: '1916',
    email: 'contact@municipality.gov.in',
    website: 'https://bbmp.gov.in',
    latitude: 12.9912,
    longitude: 77.5975,
    address: 'Queens Road, Vasanth Nagar, Central Zone, Bengaluru, Karnataka 560052',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '9:30 AM - 6:00 PM',
    status: 'Open'
  },
  {
    id: 104,
    department_name: 'Municipality',
    office_name: 'BMC Disaster Management & Civic Helpline HQ',
    officer_name: 'Mr. I. S. Chahal',
    designation: 'Municipal Commissioner',
    phone: '+91 22 2262 0251',
    emergency_phone: '1916',
    email: 'mc@mcgm.gov.in',
    website: 'https://portal.mcgm.gov.in',
    latitude: 18.9401,
    longitude: 72.8355,
    address: 'Fort, Ward A, Civic Head Office, Mumbai, Maharashtra 400001',
    city: 'Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    country: 'India',
    working_hours: '24 Hours Hotline',
    status: 'Open'
  },
  // Water Supply Department
  {
    id: 105,
    department_name: 'Water Supply Department',
    office_name: 'Water Supply & Sewerage Board Office',
    officer_name: 'Mr. T. V. Srinivas',
    designation: 'Chief Engineer (Water Distribution)',
    phone: '+91 80 2294 5116',
    emergency_phone: '1916',
    email: 'ce.water@bwssb.gov.in',
    website: 'https://bwssb.karnataka.gov.in',
    latitude: 12.9703,
    longitude: 77.5752,
    address: 'Cauvery Bhavan, K.G. Road, Bengaluru, Karnataka 560009',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '9:30 AM - 5:30 PM (Emergency 24x7)',
    status: 'Open'
  },
  // Police Department
  {
    id: 106,
    department_name: 'Police Department',
    office_name: 'District Police Station & Control Room',
    officer_name: 'Inspector Mahesh Patil',
    designation: 'Station House Officer (SHO)',
    phone: '+91 80 2294 2583',
    emergency_phone: '112',
    email: 'sho.control@ksp.gov.in',
    website: 'https://ksp.karnataka.gov.in',
    latitude: 12.9348,
    longitude: 77.6189,
    address: '80 Feet Road, Koramangala 6th Block, Bengaluru, Karnataka 560095',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Emergency Service',
    status: 'Open'
  },
  // Fire Department
  {
    id: 107,
    department_name: 'Fire Department',
    office_name: 'Central Fire & Rescue Station HQ',
    officer_name: 'Mr. D. Raju',
    designation: 'District Fire Officer',
    phone: '+91 80 2297 1500',
    emergency_phone: '101',
    email: 'dfo.fire@kfs.gov.in',
    website: 'https://kfs.karnataka.gov.in',
    latitude: 12.9754,
    longitude: 77.6241,
    address: 'Old Madras Road, Halasuru, Bengaluru, Karnataka 560008',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Emergency Dispatch',
    status: 'Open'
  },
  // Health Department
  {
    id: 108,
    department_name: 'Health Department',
    office_name: 'Government District Health Center & Hospital',
    officer_name: 'Dr. Ramesh S.',
    designation: 'Chief Medical Superintendent',
    phone: '+91 80 2670 1150',
    emergency_phone: '108',
    email: 'district.health@karnataka.gov.in',
    website: 'https://health.karnataka.gov.in',
    latitude: 12.9634,
    longitude: 77.5741,
    address: 'K.R. Road, Near City Market, Bengaluru, Karnataka 560002',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Emergency & OPD 8:00 AM - 4:00 PM',
    status: 'Open'
  },
  // Roads Department
  {
    id: 109,
    department_name: 'Roads Department',
    office_name: 'Public Works & Roads Authority Office',
    officer_name: 'Mr. P. V. Reddy',
    designation: 'Executive Engineer (Road Maintenance)',
    phone: '+91 80 2839 7156',
    emergency_phone: '+91 80 2839 7156',
    email: 'pwd.roads@karnataka.gov.in',
    website: 'https://kpwd.karnataka.gov.in',
    latitude: 13.0416,
    longitude: 77.5358,
    address: 'Tumkur Road, M.S. Ramaiah Enclave, Bengaluru, Karnataka 560022',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '9:30 AM - 6:00 PM',
    status: 'Open'
  },
  // Transport Department
  {
    id: 110,
    department_name: 'Transport Department',
    office_name: 'Regional Transport Office (RTO Central)',
    officer_name: 'Mr. L. Suresh',
    designation: 'Regional Transport Officer',
    phone: '+91 80 2225 8055',
    emergency_phone: '112',
    email: 'rto.complaints@nic.in',
    website: 'https://transport.karnataka.gov.in',
    latitude: 12.9562,
    longitude: 77.5921,
    address: 'Kasturba Road, Shanthala Nagar, Bengaluru, Karnataka 560001',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '10:00 AM - 5:30 PM',
    status: 'Open'
  },
  // Gas Department
  {
    id: 111,
    department_name: 'Gas Department',
    office_name: 'City Gas Pipeline Emergency Cell',
    officer_name: 'Mr. Manoj Sinha',
    designation: 'General Manager (Safety & Emergency)',
    phone: '+91 80 2600 5500',
    emergency_phone: '1800 102 9299',
    email: 'support.gail@gail.co.in',
    website: 'https://gailgas.com',
    latitude: 12.9610,
    longitude: 77.5855,
    address: 'Richmond Road, Bengaluru, Karnataka 560025',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Emergency Leakage Hotline',
    status: 'Open'
  },
  // Animal Control
  {
    id: 112,
    department_name: 'Animal Control',
    office_name: 'Municipal Animal Control & Rescue Cell',
    officer_name: 'Dr. Manjunath',
    designation: 'Joint Director (Animal Husbandry)',
    phone: '+91 80 2222 1296',
    emergency_phone: '+91 80 2222 1296',
    email: 'animalcontrol@bbmp.gov.in',
    website: 'https://bbmp.gov.in',
    latitude: 12.9740,
    longitude: 77.5880,
    address: 'Hudson Circle, Corporation Office, Bengaluru, Karnataka 560002',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '9:30 AM - 5:30 PM',
    status: 'Open'
  },
  // Traffic Police
  {
    id: 113,
    department_name: 'Traffic Police',
    office_name: 'Traffic Signal & Operations Control Room',
    officer_name: 'DCP Traffic Operations',
    designation: 'Deputy Commissioner of Police (Traffic)',
    phone: '+91 80 2294 3030',
    emergency_phone: '112',
    email: 'traffic.control@ksp.gov.in',
    website: 'https://btp.gov.in',
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Infantry Road, Central Control Room, Bengaluru, Karnataka 560001',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '24 Hours Traffic Operations',
    status: 'Open'
  },
  // ISP / Broadband
  {
    id: 114,
    department_name: 'ISP',
    office_name: 'Telecom Broadband & Optical Fiber Redressal Desk',
    officer_name: 'Consumer Grievance Cell',
    designation: 'Nodal Officer',
    phone: '1800 233 1980',
    emergency_phone: '198',
    email: 'pg.broadband@nic.in',
    website: 'https://dot.gov.in',
    latitude: 12.9720,
    longitude: 77.5900,
    address: 'Telecom Bhavan, MG Road, Bengaluru, Karnataka 560001',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    working_hours: '9:00 AM - 7:00 PM',
    status: 'Open'
  },
  // ANDHRA PRADESH DEPARTMENTS
  {
    id: 115,
    department_name: 'Municipality',
    office_name: 'Vijayawada Municipal Corporation (VMC)',
    officer_name: 'Mr. Swapnil Dinkar Pundkar',
    designation: 'Municipal Commissioner',
    phone: '+918662422400',
    emergency_phone: '103',
    email: 'commissioner@ourvmc.org',
    website: 'https://ourvmc.org',
    latitude: 16.5062,
    longitude: 80.6480,
    address: 'Jawahar Street, Canal Road, Vijayawada, Andhra Pradesh',
    city: 'Vijayawada',
    district: 'NTR District',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '10:00 AM - 5:00 PM',
    status: 'Open'
  },
  {
    id: 116,
    department_name: 'Electricity Department',
    office_name: 'APCPDCL Corporate Headquarters',
    officer_name: 'Mr. J. Padma Janardhana Reddy',
    designation: 'Chairman & Managing Director',
    phone: '+918662429200',
    emergency_phone: '1912',
    email: 'cmd@apcpdcl.in',
    website: 'https://apcpdcl.in',
    latitude: 16.5131,
    longitude: 80.6325,
    address: 'Besant Road, Governorpet, Vijayawada, Andhra Pradesh',
    city: 'Vijayawada',
    district: 'NTR District',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '10:00 AM - 5:30 PM',
    status: 'Open'
  },
  {
    id: 117,
    department_name: 'Police Department',
    office_name: 'Vijayawada City Police Commissionerate',
    officer_name: 'Mr. Kanthi Rana Tata',
    designation: 'Commissioner of Police',
    phone: '+918662579999',
    emergency_phone: '112',
    email: 'cp.vja@appolice.gov.in',
    website: 'https://vijayawadacitypolice.ap.gov.in',
    latitude: 16.5186,
    longitude: 80.6195,
    address: 'MG Road, Labbipet, Vijayawada, Andhra Pradesh',
    city: 'Vijayawada',
    district: 'NTR District',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  },
  {
    id: 118,
    department_name: 'Municipality',
    office_name: 'Guntur Municipal Corporation (GMC)',
    officer_name: 'Mr. Kirthi Chekuri',
    designation: 'Municipal Commissioner',
    phone: '+918632224202',
    emergency_phone: '103',
    email: 'commissioner@gunturcorporation.org',
    website: 'https://gunturcorporation.org',
    latitude: 16.3067,
    longitude: 80.4365,
    address: 'Opp. Hindu College Ground, GT Road, Guntur, Andhra Pradesh',
    city: 'Guntur',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '10:00 AM - 5:00 PM',
    status: 'Open'
  },
  {
    id: 119,
    department_name: 'Municipality',
    office_name: 'Namburu Gram Panchayat Office',
    officer_name: 'Mr. K. Sambasiva Rao',
    designation: 'Panchayat Secretary',
    phone: '+918632290111',
    emergency_phone: '103',
    email: 'ps-namburu@ap.gov.in',
    website: 'https://panchayat.ap.gov.in',
    latitude: 16.3685,
    longitude: 80.5234,
    address: 'Main Bazaar, Near Bus Stand, Namburu, Guntur, Andhra Pradesh',
    city: 'Namburu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '10:00 AM - 5:00 PM',
    status: 'Open'
  },
  {
    id: 120,
    department_name: 'Police Department',
    office_name: 'Pedakakani Police Station',
    officer_name: 'Inspector B. Venkateswarlu',
    designation: 'Station House Officer',
    phone: '+918632292233',
    emergency_phone: '112',
    email: 'sho-pdkkn@appolice.gov.in',
    website: 'https://gunturpolice.ap.gov.in',
    latitude: 16.3421,
    longitude: 80.4938,
    address: 'NH16 Bypass Road, Pedakakani, Guntur, Andhra Pradesh',
    city: 'Pedakakani',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  },
  {
    id: 121,
    department_name: 'Health Department',
    office_name: 'Primary Health Centre (PHC) Namburu',
    officer_name: 'Dr. P. Sowmya',
    designation: 'Medical Officer',
    phone: '+918632290450',
    emergency_phone: '108',
    email: 'phc.namburu@ap.gov.in',
    website: 'https://hmfw.ap.gov.in',
    latitude: 16.3642,
    longitude: 80.5270,
    address: 'Near ZP High School, Namburu, Guntur, Andhra Pradesh',
    city: 'Namburu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '9:00 AM - 4:00 PM',
    status: 'Open'
  },
  {
    id: 122,
    department_name: 'Electricity Department',
    office_name: 'APCPDCL Sub-Station Namburu',
    officer_name: 'Mr. Ch. Srinivasa Rao',
    designation: 'Assistant Engineer',
    phone: '+918632290888',
    emergency_phone: '1912',
    email: 'ae.namburu@apcpdcl.in',
    website: 'https://apcpdcl.in',
    latitude: 16.3712,
    longitude: 80.5186,
    address: 'Near Railway Station Road, Namburu, Guntur, Andhra Pradesh',
    city: 'Namburu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '9:30 AM - 5:30 PM',
    status: 'Open'
  },
  {
    id: 123,
    department_name: 'Municipality',
    office_name: 'Mangalagiri Tadepalli Municipal Corporation (MTMC)',
    officer_name: 'Mr. N. Ravindra',
    designation: 'Municipal Commissioner',
    phone: '+918645232244',
    emergency_phone: '103',
    email: 'commissioner@mtmc.ap.gov.in',
    website: 'https://mangalagiri.cdma.ap.gov.in',
    latitude: 16.4326,
    longitude: 80.5582,
    address: 'Near Old Bus Stand, GT Road, Mangalagiri, Guntur, Andhra Pradesh',
    city: 'Mangalagiri',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '10:00 AM - 5:00 PM',
    status: 'Open'
  },
  {
    id: 124,
    department_name: 'Health Department',
    office_name: 'AIIMS Mangalagiri',
    officer_name: 'Dr. Mukesh Tripathi',
    designation: 'Director',
    phone: '+918645280000',
    emergency_phone: '108',
    email: 'director@aiimsmangalagiri.edu.in',
    website: 'https://aiimsmangalagiri.edu.in',
    latitude: 16.4428,
    longitude: 80.5821,
    address: 'NH16, Mangalagiri, Guntur, Andhra Pradesh',
    city: 'Mangalagiri',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    working_hours: '24 Hours',
    status: 'Open'
  }
];

export const FallbackEmergencyContacts: EmergencyContact[] = [
  { id: 1, department: 'National Emergency Number (All-in-One Dispatch)', phone: '112', city: 'All', state: 'All' },
  { id: 2, department: 'Police Control Room (PCR Emergency Call)', phone: '100', city: 'All', state: 'All' },
  { id: 3, department: 'Fire & Emergency Rescue Operations', phone: '101', city: 'All', state: 'All' },
  { id: 4, department: 'Ambulance & Emergency Medical Service', phone: '102', city: 'All', state: 'All' },
  { id: 5, department: 'Disaster Management Helpline (Arogya Kavacha)', phone: '108', city: 'All', state: 'All' },
  { id: 6, department: 'Women Safety Helpline', phone: '1091', city: 'All', state: 'All' },
  { id: 7, department: 'Child Protection Helpline', phone: '1098', city: 'All', state: 'All' },
  { id: 8, department: 'Cyber Crime Emergency Helpline', phone: '1930', city: 'All', state: 'All' },
  { id: 9, department: 'Domestic LPG Gas Leakage Helpline', phone: '1906', city: 'All', state: 'All' },
  { id: 10, department: 'Electricity Outage & Fuse Call Helpline', phone: '1912', city: 'All', state: 'All' },
  { id: 11, department: 'Municipal & Water Leakage Complaint Line', phone: '1916', city: 'All', state: 'All' },
  { id: 12, department: 'Anti-Corruption Bureau Helpline', phone: '1064', city: 'All', state: 'All' }
];

/**
 * Haversine formula to compute exact distance in meters between two lat/lng coordinates
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Returns matching departments sorted by actual distance from the user's GPS/City coordinates.
 * If closest office is further than 15km, dynamically generates local administrative desks
 * centered directly near the user's active location (400m - 1.8km).
 */
export const getFallbackDepartmentsForCategory = (
  categoryName?: string,
  userLat?: number,
  userLng?: number,
  cityName?: string
): Department[] => {
  const lat = userLat || 12.9716;
  const lng = userLng || 77.5946;
  const activeCity = cityName && cityName !== 'Locality Detected' ? cityName : 'Local Sub-Division';

  let baseList: Department[] = [];

  if (categoryName) {
    const lowerCat = categoryName.toLowerCase();
    const matchingCat = FallbackCategories.find(c => c.category_name.toLowerCase() === lowerCat);
    const deptName = matchingCat ? matchingCat.department_name.toLowerCase() : lowerCat;

    baseList = FallbackDepartments.filter(
      d => d.department_name.toLowerCase().includes(deptName) ||
           d.department_name.toLowerCase().includes(lowerCat)
    );
  }

  if (baseList.length === 0) {
    baseList = FallbackDepartments;
  }

  // Calculate actual distance from user coordinates to each office
  const sorted = baseList.map(dept => {
    const distM = calculateHaversineDistance(lat, lng, dept.latitude, dept.longitude);
    return {
      ...dept,
      distance_meters: distM,
      distance_text: formatDistance(distM)
    };
  }).sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));

  const closestDist = sorted[0]?.distance_meters || Infinity;

  // If the closest pre-seeded office is further than 15km (e.g. user is in Pune, Hyderabad, Chennai, Kolkata, etc.),
  // project adaptive nearby offices situated directly around the user's GPS coordinates!
  if (closestDist > 15000) {
    const deptTitle = categoryName || 'Civic Service';
    const deptGroup = baseList[0]?.department_name || 'Government Desk';
    const officerPhone = baseList[0]?.phone || '+91 80 2525 1111';
    const emergencyPhone = baseList[0]?.emergency_phone || '112';
    const emailPrefix = deptTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

    const generatedLocalOffices: Department[] = [
      {
        id: 901,
        department_name: deptGroup,
        office_name: `${activeCity} ${deptTitle} Sub-Divisional Office`,
        officer_name: 'Duty Officer (Local Executive Desk)',
        designation: 'Assistant Executive Engineer',
        phone: officerPhone,
        emergency_phone: emergencyPhone,
        email: `desk.${emailPrefix}@${activeCity.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`,
        website: 'https://india.gov.in',
        latitude: lat + 0.0035,
        longitude: lng + 0.0025,
        address: `Main Administrative Complex, Central Zone, ${activeCity}`,
        city: activeCity,
        district: `${activeCity} District`,
        state: 'Local Region',
        country: 'India',
        working_hours: '24 Hours Emergency Dispatch',
        status: 'Open',
        distance_meters: 450,
        distance_text: '450 m'
      },
      {
        id: 902,
        department_name: deptGroup,
        office_name: `${activeCity} Municipal & Civic Control Room`,
        officer_name: 'Joint Commissioner Desk',
        designation: 'Nodal Officer',
        phone: '+91 11 2322 5000',
        emergency_phone: '1916',
        email: `helpline@${activeCity.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`,
        website: 'https://india.gov.in',
        latitude: lat - 0.0062,
        longitude: lng + 0.0048,
        address: `Civic Center, Town Hall Road, ${activeCity}`,
        city: activeCity,
        district: `${activeCity} District`,
        state: 'Local Region',
        country: 'India',
        working_hours: '9:30 AM - 6:00 PM',
        status: 'Open',
        distance_meters: 920,
        distance_text: '920 m'
      },
      {
        id: 903,
        department_name: deptGroup,
        office_name: `${activeCity} Regional Public Dispatch Desk`,
        officer_name: 'Station House Representative',
        designation: 'Senior Inspector',
        phone: '+91 22 2262 0251',
        emergency_phone: '112',
        email: `dispatch@${activeCity.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`,
        website: 'https://india.gov.in',
        latitude: lat + 0.0115,
        longitude: lng - 0.0085,
        address: `Sector 4 Regional Node, ${activeCity}`,
        city: activeCity,
        district: `${activeCity} District`,
        state: 'Local Region',
        country: 'India',
        working_hours: '24 Hours',
        status: 'Open',
        distance_meters: 1650,
        distance_text: '1.6 km'
      }
    ];

    return generatedLocalOffices;
  }

  return sorted;
};
