import { Queue } from "bullmq";
import Redis from "ioredis";

//this creates a redis connection instance
const redisConnection=process.env.REDIS_URL?new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:null}): new Redis({host:"127.0.0.1",port:6379,maxRetriesPerRequest:null});

//waitlistQueue is a queue that is used to handle waitlisted bookings
//it is initialized with the name waitlistQueue and the redis connection
export const waitlistQueue=new Queue("waitlistQueue",{connection:redisConnection});
