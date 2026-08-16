import { Queue } from "bullmq";
import Redis from "ioredis";

//this creates a redis connection instance
const redisConnection=process.env.REDIS_URL?new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:null}): new Redis({host:"127.0.0.1",port:6379,maxRetriesPerRequest:null});

//emailQueue is a queue that is used to send emails to users
//it is initialized with the name emailQueue and the redis connection
export const emailQueue=new Queue("emailQueue",{connection:redisConnection});
