import redis from "ioredis";

// this is basic connection to redis code
const redis=new Redis({
    host:process.env.REDIS_HOST||"127.0.0.1",
    port: process.env.REDIS_PORT||6379,
    maxRetriesPerRequest:null,
});


const LOCK_TIME=600;

const lockSeat=async(seatId,userId)=>{
    const result = await redis.set(`seat:lock${seatId}`,userId.toString(),"EX",LOCK_TIME,"NX");
    //redis.set(key, value, "EX", seconds, "NX")
    //this means store the data temporarily if it does not exist into the redis for 10 minutes that is 600 seconds
    // it returns either "YES" or "null"

    return result==="OK";
}

//returns the userId who has the lock or null if no lock
const getSeatLockOwner=async(seatId)=>{
    return await redis.get(`seat:lock:${seatId}`);
};

//delete the lock so that seat becomes free again
const releaseSeatLock=async(seatId)=>{
    await redis.del(`seat:lock:${seatId}`);
};

//returns how many seconds are left on the lock
const getLockTTL=async(seatId)=>{
    return await redis.ttl(`seat:lock:${seatId}`);
};

export {lockSeat,getSeatLockOwner,releaseSeatLock,getLockTTL};