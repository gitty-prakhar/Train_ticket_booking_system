import { Queue } from "bullmq";
import { redisConnection } from "./index.js";

export const whatsappQueue = new Queue("whatsappQueue", {
    connection: redisConnection
});
