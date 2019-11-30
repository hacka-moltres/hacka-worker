import { Client } from '@elastic/elasticsearch';

import { ELASTIC_API } from './configs';
import { enIndex } from './interfaces/enIndex';
import { ITags } from './interfaces/tags';
import { IUser } from './interfaces/user';

const elastic = new Client({ node: ELASTIC_API });

export async function findByEmail(emailUser: string): Promise<any> {
  try {
    const data = {
      index: enIndex.user,
      type: 'document',
      body: {
        query: {
          match: {
            email: emailUser.toString(),
          },
        },
      },
    };

    const result = await elastic.search(data);
    return result.body.hits;
  } catch (e) {
    return null;
  }
}

export async function findByPhone(phoneUser: string): Promise<any> {
  try {
    const data = {
      index: enIndex.user,
      type: 'document',
      body: {
        query: {
          match: {
            phone: phoneUser.toString(),
          },
        },
      },
    };

    const result = await elastic.search(data);
    return result.body.hits;
  } catch (e) {
    return null;
  }
}

export async function findByFingerPrint(fingerPrint: string): Promise<any> {
  try {
    const data = {
      index: enIndex.tags,
      type: 'document',
      body: {
        query: {
          match: {
            tags: fingerPrint.toString(),
          },
        },
      },
    };

    const result = await elastic.search(data);
    return result.body.hits;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function insertTags(tags: ITags): Promise<any> {
  try {
    const data = {
      index: enIndex.tags,
      type: 'document',
      body: tags,
    };

    const result = await elastic.index(data);
    return result;
  } catch (e) {
    return null;
  }
}

export async function updateTagsByIds(tags: ITags | any, ids: string[]): Promise<any> {
  try {
    const data = {
      index: enIndex.tags,
      type: 'document',
      body: {
        tags,
        query: { match: { _id: ids } },
      },
    };

    const result = await elastic.updateByQuery(data);
    return result;
  } catch (e) {
    return null;
  }
}

export async function updateTagsBySessionId(tags: ITags | any, ids: string[]): Promise<any> {
  try {
    const data = {
      index: enIndex.tags,
      type: 'document',
      body: {
        tags,
        query: {
          match: {
            _source: {
              sessionId: ids
            }
          }
        },
      },
    };

    const result = await elastic.updateByQuery(data);
    return result;
  } catch (e) {
    return null;
  }
}

export async function updateOrInsert(tags: ITags, ids: string[]): Promise<any> {
  try {
    const data = {
      index: enIndex.tags,
      type: 'document',
      body: {
        tags,
        query: {
          match: {
            _source: {
              sessionId: ids
            }
          }
        },
      },
    };

    const result = await elastic.updateByQuery(data);
    return result;
  } catch (e) {
    return null;
  }
}

export async function insertUser(user: IUser): Promise<any> {
  try {
    const data = {
      index: enIndex.user,
      type: 'document',
      body: user,
    };

    const result = await elastic.index(data);
    return result;
  } catch (e) {
    return null;
  }
}

export async function checkIndicesExist(): Promise<void> {
  const { body: bodyTags } = await elastic.indices.exists({ index: enIndex.tags });
  const { body: bodyUser } = await elastic.indices.exists({ index: enIndex.user });

  if (!bodyTags) {
    await elastic.indices.create({ index: enIndex.tags });
  }

  if (!bodyUser) {
    await elastic.indices.create({ index: enIndex.user });
  }
}

export default elastic;