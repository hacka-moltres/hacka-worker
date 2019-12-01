import { ConsumeMessage } from 'amqplib';

import {
  checkIndicesExist,
  findByEmailOrPhone,
  findByFingerPrint,
  insertTags,
  insertUser,
  updateTagsByIds,
  updateTagsBySessionId,
} from './elastic';
import { rabbitCallBack } from './interfaces/rabbitCallBack';
import { ISession } from './interfaces/session';
import { ITags } from './interfaces/tags';
import { IUser } from './interfaces/user';
import { listen } from './queue';

// import * as configs from './configs';

const processData: rabbitCallBack = async (msg: ConsumeMessage): Promise<any> => {
  const payload: ISession = JSON.parse(msg.content.toString());
  // console.log(payload);
  const userDocument = await getUserIndice(payload);

  console.log({ userDocument });
};

async function getUserIndice(payload: ISession): Promise<string | null> {
  const userBaseData = !!payload.email || !!payload.phone;
  console.log(`userBaseData: ${userBaseData}`);

  const resultEmail = userBaseData && await findByEmailOrPhone(payload.email, payload.phone);
  const tags: ITags = {
    userIndex: null,
    tags: payload.tags,
    sessionId: payload.sessionId,
    dateTime: payload.dateTime,
    date: payload.date,
  };

  if (resultEmail && resultEmail.total && resultEmail.total > 0) {
    tags.userIndex = resultEmail.hits[0]._id;
    const update = await updateTagsBySessionId(tags, payload.sessionId);
    console.log({ update });
    if (!update) {
      console.log('inseriu tag com usuario');
      insertTags(tags).catch(err => console.error(err));
    }

    console.log('achou usuario');
    return resultEmail.hits[0]._id;
  }

  console.log('nao achou email ou telefone');

  const fingerPrint = payload.tags.find(key => key.toLocaleLowerCase().startsWith('fingerprint:'));
  const resultFingerPrint = fingerPrint && await findByFingerPrint(fingerPrint);

  if (resultFingerPrint && resultFingerPrint.hits.userIndex) {
    return resultFingerPrint.document.userIndex;
  }

  console.log('nao achou fingerPrint atrelado ao usuario');

  let userIndex = null;
  if (userBaseData) {
    userIndex = await insertUser({
      email: payload.email,
      phone: payload.phone,
    } as IUser);
    console.log('criou usuario');
    userIndex = userIndex.body._id;
  }

  const fingerPrintHits: boolean = (resultFingerPrint.total > 0);

  if (userIndex && resultFingerPrint && fingerPrintHits && !resultFingerPrint.hits[0].userIndex) {
    const tracks: string[] = resultFingerPrint.hits
      .filter((key: ISession) => key.sessionId === payload.sessionId)
      .map((key: { _ids: string; }) => key._ids);

    updateTagsByIds({
      userIndex,
    }, tracks).catch(err => console.error(err));

    console.log('atualizo fingerPrint e atrelo o usuario');
    return userIndex;
  }

  if (fingerPrintHits) {
    console.log('tem fingerPrin, mas nao atualizo porque nao tem usuario');
    return;
  }

  insertTags({
    userIndex,
    tags: payload.tags,
    sessionId: payload.sessionId,
    dateTime: payload.dateTime,
    date: payload.date,
  } as ITags).catch(err => console.error(err));

  console.log('só criou as tags');
}

console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
// console.table(configs);
checkIndicesExist().catch(err => console.error(err));

listen(
  processData
).catch(err => console.error(err));