import { ConsumeMessage } from 'amqplib';

export type rabbitCallBack = (msg: ConsumeMessage) => void;