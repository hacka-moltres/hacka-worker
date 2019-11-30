import { ConsumeMessage } from 'amqplib';

import * as configs from './configs';
import { rabbitCallBack } from './interfaces/rabbitCallBack';
import { listen } from './queue';

const processData: rabbitCallBack = async (msg: ConsumeMessage): Promise<any> => {
  const payload = Number(msg.content);
  console.info(msg.fields.deliveryTag, 'deliveryTag');
  console.info(payload, 'VALUE payload');
};

try {
  console.clear();
  console.table(configs);
  listen(
    processData
  );
} catch (e) {
  console.error(e);
}