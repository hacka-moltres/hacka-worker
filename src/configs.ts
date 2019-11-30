import * as dotenv from 'dotenv';

dotenv.config();

export const RABBIT_DSN = process.env.RABBIT_DSN;
export const RABBIT_EXCHANGE = process.env.RABBIT_EXCHANGE;
export const RABBIT_QUEUE = process.env.RABBIT_QUEUE;
export const RABBIT_TOPIC = process.env.RABBIT_TOPIC;