/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import getS3Config from '../utils/config.js';

function buildInput(org, key) {
  return {
    Bucket: `${org}-content`,
    Prefix: `${key}/`,
  };
}

async function deleteObject(client, org, Key) {
  try {
    const delCommand = new DeleteObjectCommand({ Bucket: `${org}-content`, Key });
    const url = await getSignedUrl(client, delCommand, { expiresIn: 3600 });
    await fetch(url, { method: 'DELETE' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

export default async function deleteObjects(env, daCtx) {
  const config = getS3Config(env);
  const client = new S3Client(config);
  const input = buildInput(daCtx.org, daCtx.key);

  let ContinuationToken;

  // The input prefix has a forward slash to prevent (drafts + drafts-new, etc.).
  // Which means the list will only pickup children. This adds to the initial list.
  const sourceKeys = [daCtx.key, `${daCtx.key}.props`];

  do {
    try {
      const command = new ListObjectsV2Command({ ...input, ContinuationToken });
      const resp = await client.send(command);

      const { Contents = [], NextContinuationToken } = resp;
      sourceKeys.push(...Contents.map(({ Key }) => Key));

      await Promise.all(
        new Array(1).fill(null).map(async () => {
          while (sourceKeys.length) {
            await deleteObject(client, daCtx.org, sourceKeys.pop());
          }
        }),
      );

      ContinuationToken = NextContinuationToken;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      return { body: '', status: 404 };
    }
  } while (ContinuationToken);

  return { body: '', status: 204 };
}
