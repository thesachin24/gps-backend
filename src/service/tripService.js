import { MESSAGE_CONSTANTS } from '../constants';
import { getDeviceTripsByDeviceAndDateRange } from '../dao';

const EARTH_RADIUS_KM = 6371;
const DEFAULT_STOP_THRESHOLD_MINUTES = 15;

const toRadians = deg => (deg * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDuration = ms => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || !parts.length) parts.push(`${seconds}s`);
  return parts.join(' ');
};

const buildTrip = (points, index) => {
  const first = points[0];
  const last = points[points.length - 1];

  let totalDistanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistanceKm += haversineDistance(
      Number(points[i - 1].latitude),
      Number(points[i - 1].longitude),
      Number(points[i].latitude),
      Number(points[i].longitude)
    );
  }

  const startTime = new Date(first.recorded_at);
  const endTime = new Date(last.recorded_at);
  const durationMs = endTime - startTime;
  const durationHours = durationMs / 3600000;

  return {
    trip_number: index + 1,
    start_time: startTime,
    end_time: endTime,
    duration_ms: durationMs,
    duration: formatDuration(durationMs),
    start_location: { latitude: Number(first.latitude), longitude: Number(first.longitude) },
    end_location: { latitude: Number(last.latitude), longitude: Number(last.longitude) },
    distance_km: Math.round(totalDistanceKm * 100) / 100,
    avg_speed_kmh: durationHours > 0
      ? Math.round((totalDistanceKm / durationHours) * 100) / 100
      : 0,
    point_count: points.length,
    locations: points
  };
};

export const getDeviceTripsData = async payload => {
  const { id, from, to, stop_duration } = payload;
  const stopThresholdMs =
    (Number(stop_duration) || DEFAULT_STOP_THRESHOLD_MINUTES) * 60 * 1000;

  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  const locations = await getDeviceTripsByDeviceAndDateRange(id, fromDate, toDate);

  if (!locations || !locations.length) {
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: { trips: [], total_trips: 0, total_distance_km: 0, total_duration: '0s' }
    };
  }

  const trips = [];
  let currentTripPoints = [locations[0]];

  for (let i = 1; i < locations.length; i++) {
    const prevTime = new Date(locations[i - 1].recorded_at).getTime();
    const currTime = new Date(locations[i].recorded_at).getTime();
    const gap = currTime - prevTime;

    if (gap > stopThresholdMs) {
      trips.push(buildTrip(currentTripPoints, trips.length));
      currentTripPoints = [locations[i]];
    } else {
      currentTripPoints.push(locations[i]);
    }
  }

  if (currentTripPoints.length) {
    trips.push(buildTrip(currentTripPoints, trips.length));
  }

  const totalDistanceKm = trips.reduce((sum, t) => sum + t.distance_km, 0);
  const totalDurationMs = trips.reduce((sum, t) => sum + t.duration_ms, 0);

  trips.reverse();
  trips.forEach((t, i) => { t.trip_number = i + 1; });

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      trips,
      total_trips: trips.length,
      total_distance_km: Math.round(totalDistanceKm * 100) / 100,
      total_duration: formatDuration(totalDurationMs)
    }
  };
};
