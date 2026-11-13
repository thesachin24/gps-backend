import { MESSAGE_CONSTANTS } from '../constants';
import { getDeviceTripsByDeviceAndDateRange } from '../dao';

const EARTH_RADIUS_KM = 6371;
const DEFAULT_STOP_THRESHOLD_MINUTES = 15;
const DEFAULT_DAYS = 30;
const MOVING_SPEED_KMH = 3;
const TIME_ZONE = 'Asia/Kolkata';


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

  const locations = await getDeviceTripsByDeviceAndDateRange(id, from, to);

  if (!locations || !locations.length) {
    return {
      message: MESSAGE_CONSTANTS.SUCCESS,
      data: {
        trips: [],
        total_trips: 0,
        total_distance_km: 0,
        total_duration: '0s'
      }
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

  // Skip trips with distance < 0.01 km (10 meters)
  const filteredTrips = trips.filter(trip => trip.distance_km >= 0.01);

  const totalDistanceKm = filteredTrips.reduce(
    (sum, trip) => sum + trip.distance_km,
    0
  );

  const totalDurationMs = filteredTrips.reduce(
    (sum, trip) => sum + trip.duration_ms,
    0
  );

  filteredTrips.reverse();

  filteredTrips.forEach((trip, i) => {
    trip.trip_number = i + 1;
  });

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      trips: filteredTrips,
      total_trips: filteredTrips.length,
      total_distance_km: Math.round(totalDistanceKm * 100) / 100,
      total_duration: formatDuration(totalDurationMs)
    }
  };
};



const getDateKey = date => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const getSpeed = location => {
  const speed = Number(
    location.speed_kmh ?? location.speed
  );

  return Number.isFinite(speed) && speed >= 0
    ? speed
    : null;
};


const createDailyBucket = date => ({
  date,
  distance_km: 0,
  max_speed_kmh: null,
  min_speed_kmh: null,
  speed_sum: 0,
  speed_count: 0,
  runtime_ms: 0,
  total_trips: 0
});

const round = value =>
  Math.round(value * 100) / 100;


export const getDeviceDailyAnalytics = async payload => {
  const {
    id,
    days = DEFAULT_DAYS,
    stop_duration = DEFAULT_STOP_THRESHOLD_MINUTES
  } = payload;

  const numberOfDays = Math.min(
    365,
    Math.max(1, Number(days) || DEFAULT_DAYS)
  );

  const stopThresholdMs =
    (Number(stop_duration) || DEFAULT_STOP_THRESHOLD_MINUTES) *
    60 * 1000;

  const now = new Date();

  // Current date in Asia/Kolkata.
  const todayKey = getDateKey(now);
  const [year, month, day] = todayKey.split('-').map(Number);

  const today = new Date(Date.UTC(year, month - 1, day));

  const dailyData = {};

  // Generate daily buckets.
  for (let i = numberOfDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);

    const dateKey = date.toISOString().slice(0, 10);
    dailyData[dateKey] = createDailyBucket(dateKey);
  }

  // Pass date strings because the existing DAO appends time.
  const firstDate = new Date(today);

  firstDate.setUTCDate(
    firstDate.getUTCDate() - (numberOfDays - 1)
  );

  const from = firstDate.toISOString().slice(0, 10);
  const to = todayKey;

  // console.log('Analytics date range:', { from, to });

  const locations = await getDeviceTripsByDeviceAndDateRange(
    id,
    from,
    to
  );

  const sortedLocations = (locations || [])
    .filter(location => {
      const time = new Date(location.recorded_at);

      return (
        !Number.isNaN(time.getTime()) &&
        Number.isFinite(Number(location.latitude)) &&
        Number.isFinite(Number(location.longitude))
      );
    })
    .sort(
      (a, b) =>
        new Date(a.recorded_at) - new Date(b.recorded_at)
    );

  const tripsByDate = {};
  let previous = null;

  for (const location of sortedLocations) {
    const currentTime = new Date(location.recorded_at);
    const currentTimeMs = currentTime.getTime();
    const currentDate = getDateKey(currentTime);
    const bucket = dailyData[currentDate];

    const currentSpeed = getSpeed(location);

    // Speed statistics: ignore stationary readings.
    if (
      bucket &&
      currentSpeed !== null &&
      currentSpeed > MOVING_SPEED_KMH
    ) {
      bucket.max_speed_kmh =
        bucket.max_speed_kmh === null
          ? currentSpeed
          : Math.max(bucket.max_speed_kmh, currentSpeed);

      bucket.min_speed_kmh =
        bucket.min_speed_kmh === null
          ? currentSpeed
          : Math.min(bucket.min_speed_kmh, currentSpeed);

      bucket.speed_sum += currentSpeed;
      bucket.speed_count++;
    }

    if (previous) {
      const previousTimeMs = new Date(
        previous.recorded_at
      ).getTime();

      const gap = currentTimeMs - previousTimeMs;

      if (gap > 0 && gap <= stopThresholdMs) {
        const previousSpeed = getSpeed(previous);

        const isMoving =
          (currentSpeed !== null &&
            currentSpeed > MOVING_SPEED_KMH) ||
          (previousSpeed !== null &&
            previousSpeed > MOVING_SPEED_KMH);

        const distance = haversineDistance(
          Number(previous.latitude),
          Number(previous.longitude),
          Number(location.latitude),
          Number(location.longitude)
        );

        // Distribute distance/runtime across calendar days.
        let cursor = previousTimeMs;

        while (cursor < currentTimeMs) {
          const localDate = new Date(
            cursor + 5.5 * 60 * 60 * 1000
          );

          const dateKey = localDate.toISOString().slice(0, 10);

          const nextLocalMidnight =
            Date.UTC(
              localDate.getUTCFullYear(),
              localDate.getUTCMonth(),
              localDate.getUTCDate() + 1
            ) - 5.5 * 60 * 60 * 1000;

          const segmentEnd = Math.min(
            currentTimeMs,
            nextLocalMidnight
          );

          const segmentDuration = segmentEnd - cursor;
          const fraction = segmentDuration / gap;

          const dayBucket = dailyData[dateKey];

          if (dayBucket) {
            dayBucket.distance_km += distance * fraction;

            if (isMoving) {
              dayBucket.runtime_ms += segmentDuration;
            }
          }

          cursor = segmentEnd;
        }
      }
    }

    // Count trips by starting date.
    if (
      !previous ||
      currentTimeMs -
        new Date(previous.recorded_at).getTime() >
        stopThresholdMs
    ) {
      if (bucket) {
        tripsByDate[currentDate] =
          (tripsByDate[currentDate] || 0) + 1;
      }
    }

    previous = location;
  }

  // Build chart response.
  const dates = Object.keys(dailyData);

  const chart = dates.map(date => {
    const bucket = dailyData[date];

    return {
      date,
      distance_km: round(bucket.distance_km),

      max_speed_kmh:
        bucket.max_speed_kmh === null
          ? 0
          : round(bucket.max_speed_kmh),

      min_speed_kmh:
        bucket.min_speed_kmh === null
          ? 0
          : round(bucket.min_speed_kmh),

      avg_speed_kmh:
        bucket.speed_count
          ? round(bucket.speed_sum / bucket.speed_count)
          : 0,

      runtime_minutes: Math.round(
        bucket.runtime_ms / 60000
      ),

      runtime: formatDuration(bucket.runtime_ms),

      total_trips: tripsByDate[date] || 0
    };
  });

  // Calculate summary.
  const summary = chart.reduce(
    (result, item) => {
      result.total_distance_km += item.distance_km;
      result.total_runtime_minutes += item.runtime_minutes;
      result.total_trips += item.total_trips;

      result.max_speed_kmh = Math.max(
        result.max_speed_kmh,
        item.max_speed_kmh
      );

      return result;
    },
    {
      total_distance_km: 0,
      total_runtime_minutes: 0,
      total_trips: 0,
      max_speed_kmh: 0
    }
  );

  return {
    message: MESSAGE_CONSTANTS.SUCCESS,
    data: {
      days: numberOfDays,

      summary: {
        ...summary,
        total_distance_km: round(
          summary.total_distance_km
        ),
        total_runtime: formatDuration(
          summary.total_runtime_minutes * 60000
        )
      },

      chart
    }
  };
};