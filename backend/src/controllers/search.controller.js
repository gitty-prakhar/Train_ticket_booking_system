import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Station } from "../models/station.model.js";
import { Route } from "../models/route.model.js";
import { Schedule } from "../models/schedule.model.js";
import { Coach } from "../models/coach.model.js";
import { calculateFare } from "../utils/fareCalculator.js";
import { getDistanceBetweenStops } from "../utils/fareCalculator.js";

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Convert "HH:MM" departure time string to total minutes since midnight.
 * Returns null if the string is invalid.
 */
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
}

/**
 * Build the coaches availability map grouped by coachType for a given scheduleId.
 * Computes fare per person based on distanceKm.
 */
async function buildClassMap(scheduleId, distanceKm) {
    const coaches = await Coach.find({ scheduleId });
    const classMap = {};
    for (const coach of coaches) {
        if (!classMap[coach.coachType]) {
            classMap[coach.coachType] = {
                coachType:      coach.coachType,
                availableSeats: 0,
                totalSeats:     0,
                farePerPerson:  distanceKm ? calculateFare(distanceKm, coach.coachType) : 0,
            };
        }
        classMap[coach.coachType].availableSeats += coach.availableSeats;
        classMap[coach.coachType].totalSeats      += coach.totalSeats;
    }
    return Object.values(classMap);
}

/**
 * Fetch all routes + schedules for a given date that pass through a source station
 * and whose trains run *onward* past it.
 *
 * @returns array of { route, schedule, stop }
 */
async function getRouteSchedulesByStation(stationId, date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const routes = await Route.find({ "stops.stationId": stationId }).populate("stops.stationId", "name code");

    const trainIds    = routes.map((r) => r.trainId);
    const schedules   = await Schedule.find({
        trainId:     { $in: trainIds },
        journeyDate: { $gte: date, $lt: nextDay },
        status:      { $ne: "Cancelled" },
    }).populate("trainId", "trainNumber trainName trainType");

    // Index schedules by trainId for fast lookup
    const scheduleMap = {};
    for (const s of schedules) scheduleMap[s.trainId._id.toString()] = s;

    return routes
        .map((route) => ({
            route,
            schedule: scheduleMap[route.trainId.toString()],
        }))
        .filter((r) => r.schedule); // only routes that have a schedule on this date
}

// ─── CONNECTING TRAINS ALGORITHM ────────────────────────────────────────────

/**
 * Find 1-stop connecting routes:  A ──Train1──> X ──Train2──> B
 *
 * Rules:
 *  - Trains must run in the correct direction (stopNumber of X > stopNumber of A, etc.)
 *  - Train 1 must ARRIVE at X BEFORE Train 2 DEPARTS from X.
 *  - Minimum layover at X = 60 minutes, maximum = 12 hours.
 */
async function findConnectingRoutes(fromStation, toStation, date) {
    const journeyDate = new Date(date);

    // Leg 1: all trains that depart from `fromStation`
    const leg1Candidates = await getRouteSchedulesByStation(fromStation._id, journeyDate);

    // Leg 2: all trains that arrive at `toStation`
    const leg2Candidates = await getRouteSchedulesByStation(toStation._id, journeyDate);

    const connectingResults = [];

    for (const { route: r1, schedule: s1 } of leg1Candidates) {
        // Find the stop object for fromStation on this route
        const fromStop = r1.stops.find((s) => s.stationId._id.toString() === fromStation._id.toString());
        if (!fromStop) continue;

        // All stations that Train 1 visits AFTER the source (potential hubs)
        const potentialHubs = r1.stops.filter((s) => s.stopNumber > fromStop.stopNumber);

        for (const hubStop of potentialHubs) {
            const hubStationId = hubStop.stationId._id.toString();

            // Skip if the hub IS the final destination (that's a direct route, not connecting)
            if (hubStationId === toStation._id.toString()) continue;

            // Find leg-2 trains that pass through this hub AND then reach toStation
            for (const { route: r2, schedule: s2 } of leg2Candidates) {
                // Must be a *different* train
                if (s1._id.toString() === s2._id.toString()) continue;

                const hubStopOnR2 = r2.stops.find((s) => s.stationId._id.toString() === hubStationId);
                const toStop      = r2.stops.find((s) => s.stationId._id.toString() === toStation._id.toString());

                if (!hubStopOnR2 || !toStop) continue;

                // Direction check: hub must come BEFORE toStation on Train 2
                if (hubStopOnR2.stopNumber >= toStop.stopNumber) continue;

                // ── Time validation ──────────────────────────────────────
                const arrivalAtHub   = timeToMinutes(hubStop.arrivalTime);       // Train 1 arrives at hub
                const departureFromHub = timeToMinutes(hubStopOnR2.departureTime); // Train 2 departs hub

                if (arrivalAtHub === null || departureFromHub === null) continue;

                const layoverMinutes = departureFromHub - arrivalAtHub;

                // Must have between 60 min and 720 min layover
                if (layoverMinutes < 60 || layoverMinutes > 720) continue;

                // ── Fare calculation for both legs ──────────────────────
                let leg1Distance = 0;
                let leg2Distance = 0;
                try {
                    leg1Distance = getDistanceBetweenStops(r1.stops, fromStation._id, hubStop.stationId._id);
                } catch (_) {}
                try {
                    leg2Distance = getDistanceBetweenStops(r2.stops, hubStop.stationId._id, toStation._id);
                } catch (_) {}

                const leg1Classes = await buildClassMap(s1._id, leg1Distance);
                const leg2Classes = await buildClassMap(s2._id, leg2Distance);

                const layoverHours   = Math.floor(layoverMinutes / 60);
                const layoverMinsRem = layoverMinutes % 60;
                const layoverLabel   = `${layoverHours}h ${layoverMinsRem}m`;

                connectingResults.push({
                    type:          "connecting",
                    totalDistance: leg1Distance + leg2Distance,
                    hub: {
                        name: hubStop.stationId.name,
                        code: hubStop.stationId.code,
                        layover: layoverLabel,
                        layoverMinutes,
                    },
                    leg1: {
                        scheduleId:  s1._id,
                        train:       s1.trainId,
                        journeyDate: s1.journeyDate,
                        fromStation: {
                            name:          fromStation.name,
                            code:          fromStation.code,
                            departureTime: fromStop.departureTime,
                        },
                        toStation: {
                            name:        hubStop.stationId.name,
                            code:        hubStop.stationId.code,
                            arrivalTime: hubStop.arrivalTime,
                        },
                        distanceKm: leg1Distance,
                        classes:    leg1Classes,
                    },
                    leg2: {
                        scheduleId:  s2._id,
                        train:       s2.trainId,
                        journeyDate: s2.journeyDate,
                        fromStation: {
                            name:          hubStop.stationId.name,
                            code:          hubStop.stationId.code,
                            departureTime: hubStopOnR2.departureTime,
                        },
                        toStation: {
                            name:        toStation.name,
                            code:        toStation.code,
                            arrivalTime: toStop.arrivalTime,
                        },
                        distanceKm: leg2Distance,
                        classes:    leg2Classes,
                    },
                });
            }
        }
    }

    return connectingResults;
}

// ─── MAIN SEARCH HANDLER ─────────────────────────────────────────────────────

const searchTrains = asyncHandler(async (req, res) => {
    const { from, to, date } = req.query;
    if (!from || !to || !date) throw new ApiError(400, "from, to, and date are required");
    if (from.toUpperCase() === to.toUpperCase()) throw new ApiError(400, "Source and destination cannot be the same");

    const fromStation = await Station.findOne({ code: from.toUpperCase() });
    const toStation   = await Station.findOne({ code: to.toUpperCase() });

    if (!fromStation) throw new ApiError(404, `Station ${from.toUpperCase()} not found`);
    if (!toStation)   throw new ApiError(404, `Station ${to.toUpperCase()} not found`);

    // ── 1. Direct trains ────────────────────────────────────────────────────
    const routes = await Route.find({
        "stops.stationId": { $all: [fromStation._id, toStation._id] },
    }).populate("stops.stationId", "name code");

    const journeyDate = new Date(date);
    const nextDay     = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const validRoutes = routes.filter((route) => {
        const fromStop = route.stops.find((s) => s.stationId._id.toString() === fromStation._id.toString());
        const toStop   = route.stops.find((s) => s.stationId._id.toString() === toStation._id.toString());
        return fromStop && toStop && fromStop.stopNumber < toStop.stopNumber;
    });

    const trainIds = validRoutes.map((r) => r.trainId);
    const schedules = await Schedule.find({
        trainId:     { $in: trainIds },
        journeyDate: { $gte: journeyDate, $lt: nextDay },
        status:      { $ne: "Cancelled" },
    }).populate("trainId", "trainNumber trainName trainType");

    const directResults = [];
    for (const schedule of schedules) {
        const route = validRoutes.find((r) => r.trainId.toString() === schedule.trainId._id.toString());
        let distanceKm = 0;
        try {
            distanceKm = getDistanceBetweenStops(route.stops, fromStation._id, toStation._id);
        } catch (_) {}

        const fromStop = route.stops.find((s) => s.stationId._id.toString() === fromStation._id.toString());
        const toStop   = route.stops.find((s) => s.stationId._id.toString() === toStation._id.toString());
        const classes  = await buildClassMap(schedule._id, distanceKm);

        directResults.push({
            type:        "direct",
            scheduleId:  schedule._id,
            train:       schedule.trainId,
            journeyDate: schedule.journeyDate,
            status:      schedule.status,
            fromStation: { name: fromStation.name, code: fromStation.code, departureTime: fromStop.departureTime },
            toStation:   { name: toStation.name,   code: toStation.code,   arrivalTime:   toStop.arrivalTime },
            distanceKm,
            classes,
        });
    }

    // ── 2. Connecting trains (only if no direct found) ───────────────────────
    let connectingResults = [];
    if (directResults.length === 0) {
        connectingResults = await findConnectingRoutes(fromStation, toStation, journeyDate);
    }

    const allResults = [...directResults, ...connectingResults];
    const totalCount = allResults.length;
    const directCount = directResults.length;
    const connectingCount = connectingResults.length;

    if (totalCount === 0) {
        return res.status(200).json(new APIResponse(200, [], `No trains found between ${from} and ${to} on ${date}`));
    }

    return res.status(200).json(
        new APIResponse(200, allResults, `${directCount} direct + ${connectingCount} connecting train(s) found`)
    );
});

export { searchTrains };