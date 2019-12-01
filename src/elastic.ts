import { Client } from '@elastic/elasticsearch';

import { ELASTIC_API } from './configs';
import { enIndex } from './interfaces/enIndex';
import { ITags } from './interfaces/tags';
import { IUser } from './interfaces/user';

const elastic = new Client({ node: ELASTIC_API });

export async function findByEmailOrPhone(emailUser: string, phoneUser: string): Promise<any> {
  try {
    const data = {
      index: enIndex.user,
      type: 'document',
      body: {
        query: {
          bool: {
            must: [
              {
                // eslint-disable-next-line camelcase
                query_string: {
                  query: `email:"${emailUser}" | phone:"${phoneUser}"`,
                  // eslint-disable-next-line camelcase
                  analyze_wildcard: true,
                  // eslint-disable-next-line camelcase
                  default_field: '*'
                }
              }
            ]
          }
        }
      }
    };

    const result = await elastic.search(data);
    return result.body.hits;
  } catch (e) {
    console.error(e);
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

export async function updateTagsBySessionId(tags: ITags | any, id: string): Promise<any> {
  try {
    const data: any = {
      index: enIndex.tags,
      type: 'document',
      body: {
        query: {
          bool: {
            must: [
              {
                // eslint-disable-next-line camelcase
                match_phrase: {
                  sessionId: {
                    query: id.toString()
                  }
                }
              }
            ]
          }
        }
      }
    };

    let result: any = await elastic.search(data);
    result = result.body.hits;

    if (result.total === 0) {
      return;
    }

    const _ids: string[] = result.hits.map((key: { _id: string; }) => key._id);
    result = await Promise.all(_ids.map(async value => {
      await elastic.update({
        index: enIndex.tags,
        type: 'document',
        id: value,
        body: { doc: tags }
      } as any);
    }));

    return result.length;
  } catch (e) {
    console.error('deu ruim', e.meta.body);
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