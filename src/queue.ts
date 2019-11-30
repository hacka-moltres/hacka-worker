import * as amqp from 'amqplib';

import { RABBIT_DSN, RABBIT_EXCHANGE, RABBIT_QUEUE, RABBIT_TOPIC } from './configs';
import { rabbitCallBack } from './interfaces/rabbitCallBack';

const topic = RABBIT_TOPIC;
const nackTopic = `${topic}.nack`;

const nackQueue = `${RABBIT_QUEUE}.nack`;

/**
 * Initialize and listen to the queue
 *
 * @param {*} callback
 */
export const listen = async (callback: rabbitCallBack) => {

  const conn = await amqp.connect(RABBIT_DSN);

  const ch = await conn.createChannel();

  process.on('SIGTERM', async () => {
    await ch.close();
    process.exit(0);
  });

  await ch.assertExchange(RABBIT_EXCHANGE, 'topic', { durable: true });
  await ch.prefetch(1);

  await ch.assertQueue(nackQueue, {
    durable: true, arguments: {
      'x-dead-letter-exchange': RABBIT_EXCHANGE,
      'x-dead-letter-routing-key': topic
    }
  });
  await ch.bindQueue(nackQueue, RABBIT_EXCHANGE, nackTopic);

  const q = await ch.assertQueue(RABBIT_QUEUE, {
    durable: true, arguments: {
      'x-dead-letter-exchange': RABBIT_EXCHANGE,
      'x-dead-letter-routing-key': nackTopic
    }
  });
  await ch.bindQueue(RABBIT_QUEUE, RABBIT_EXCHANGE, topic);

  await ch.consume(q.queue, async (msg) => {
    try {
      await callback(msg);
      ch.ack(msg);
    } catch (err) {
      console.log(err);
      ch.nack(msg, false, false);
    }
  }, { noAck: false });
};