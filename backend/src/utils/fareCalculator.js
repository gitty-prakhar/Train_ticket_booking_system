import { ApiError } from "./apiError.js";

const FARE_RATES={
    "1A":4.5,
    "2A":2.8,
    "3A":1.9,
    "SL":0.9,
    "CC":1.5,
    "GEN":0.4,
};//all these prices are per km

export const calculateFare=(distanceKm,coachType,isTatkal=false,age=25)=>{
    if(age<5){
        return 0;
    }
    let fare=distanceKm*FARE_RATES[coachType];

    if(isTatkal){
        fare=fare*1.30; //30 percent extra for tatkal
    }

    if(age>=5 && age <=12){
        fare=fare/2;
    }

    return Math.max(Math.round(fare),30); // base fare 30 rupees
}

//total fare for all passengers 
export const calculateTotalFare=(distanceKm,coachType,isTatkal=false,passengers=[])=>{
    let total=0;
    for(const p of passengers){
        total+=calculateFare(distanceKm,coachType,isTatkal,p.age);
    }
    return total;
}


//get distance between two stations from the route stops array

export const getDistanceBetweenStops=(stops,boardingStationId,destinationStationId)=>{
    let boardingStop=null;
    let destinationStop=null;

    for(let i=0; i<stops.length;i++){
        if(stops[i].stationId.toString()===boardingStationId.toString()) {
            boardingStop=stops[i];
        }

        if(stops[i].stationId.toString()===destinationStationId.toString()) {
            destinationStop=stops[i];
        }
    }
    if(boardingStop===null || destinationStop===null){
        throw new ApiError("Station not found on this route");
    }
    if(boardingStop.stopNumbe>=destinationStop.stopNumber) {
        throw new ApiError("Boarding station must come before destination station");
    }

    const distance=destinationStop.distanceFromOrigin-boardingStop.distanceFromOrigin;

    return distance;
}