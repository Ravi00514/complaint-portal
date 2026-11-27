import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

// Helper: distance between two coordinates in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Regional centers for auto geocoding fallback
const REGIONS = [
  { name: 'Vijayawada', district: 'NTR District', state: 'Andhra Pradesh', country: 'India', pincode: '520001', lat: 16.5062, lng: 80.6480 },
  { name: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', pincode: '522002', lat: 16.3067, lng: 80.4365 },
  { name: 'Namburu', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', pincode: '522508', lat: 16.3685, lng: 80.5234 },
  { name: 'Pedakakani', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', pincode: '522509', lat: 16.3421, lng: 80.4938 },
  { name: 'Mangalagiri', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', pincode: '522503', lat: 16.4326, lng: 80.5582 },
  { name: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', pincode: '530001', lat: 17.7231, lng: 83.3013 },
  { name: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', country: 'India', pincode: '517501', lat: 13.6288, lng: 79.4192 },
  { name: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', country: 'India', pincode: '518001', lat: 15.8281, lng: 78.0373 },
  { name: 'Rajahmundry', district: 'East Godavari', state: 'Andhra Pradesh', country: 'India', pincode: '533101', lat: 17.0005, lng: 81.7800 },
  { name: 'Nellore', district: 'SPSR Nellore', state: 'Andhra Pradesh', country: 'India', pincode: '524001', lat: 14.4426, lng: 79.9865 },
  { name: 'Kakinada', district: 'Kakinada', state: 'Andhra Pradesh', country: 'India', pincode: '533001', lat: 16.9890, lng: 82.2475 },
  { name: 'Anantapur', district: 'Ananthapuramu', state: 'Andhra Pradesh', country: 'India', pincode: '515001', lat: 14.6819, lng: 77.6006 },
  { name: 'Kadapa', district: 'YSR Kadapa', state: 'Andhra Pradesh', country: 'India', pincode: '516001', lat: 14.4674, lng: 78.8242 },
  { name: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', pincode: '560001', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', pincode: '400001', lat: 18.9750, lng: 72.8258 },
  { name: 'Delhi', district: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110001', lat: 28.6139, lng: 77.2090 },
  { name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600001', lat: 13.0827, lng: 80.2707 },
  { name: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India', pincode: '380001', lat: 23.0225, lng: 72.5714 },
];

export const getLocationDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return next(new AppError('Please provide latitude and longitude coordinates.', 400));
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    if (isNaN(lat) || isNaN(lng)) {
      return next(new AppError('Invalid coordinates format.', 400));
    }

    // Attempt to reverse geocode using public OSM Nominatim
    let locationData = null;

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: { 'User-Agent': 'CivicConnect-Citizen-Complaint-Locator/1.0' },
          signal: controller.signal
        }
      );
      
      clearTimeout(id);

      if (response.ok) {
        const body = (await response.json()) as any;
        if (body && body.address) {
          const addr = body.address;
          const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || 'Local Region';
          const detectedDistrict = addr.state_district || addr.county || addr.district || addr.suburb || detectedCity;
          const detectedState = addr.state || 'India';

          locationData = {
            city: detectedCity,
            district: detectedDistrict,
            state: detectedState,
            country: addr.country || 'India',
            pincode: addr.postcode || '500000',
            latitude: lat,
            longitude: lng,
            formatted_address: body.display_name || `${detectedCity}, ${detectedDistrict}, ${detectedState}`,
          };
        }
      }
    } catch (fetchError) {
      console.log('[Location Controller] OSM reverse geocoding failed or timed out, using closest region mapping.');
    }

    // Fallback logic: find closest matching pre-seeded city
    if (!locationData) {
      let closestRegion = REGIONS[0];
      let minDistance = getDistance(lat, lng, REGIONS[0].lat, REGIONS[0].lng);

      for (let i = 1; i < REGIONS.length; i++) {
        const dist = getDistance(lat, lng, REGIONS[i].lat, REGIONS[i].lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestRegion = REGIONS[i];
        }
      }

      locationData = {
        city: closestRegion.name,
        district: closestRegion.district,
        state: closestRegion.state,
        country: closestRegion.country,
        pincode: closestRegion.pincode,
        latitude: lat,
        longitude: lng,
        formatted_address: `${closestRegion.name}, ${closestRegion.district}, ${closestRegion.state}, ${closestRegion.country}`,
      };
    }

    res.status(200).json({
      success: true,
      message: 'Location details retrieved successfully.',
      data: locationData,
    });
  } catch (error) {
    next(error);
  }
};

