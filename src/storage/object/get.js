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
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

import getS3Config from '../utils/config.js';

function buildInput({ org, key }) {
  const Bucket = `${org}-content`;
  return { Bucket, Key: key };
}

export default async function getObject(env, { org, key, head }) {
  const config = getS3Config(env);
  const client = new S3Client(config);

  const input = buildInput({ org, key });
  const command = head ? new HeadObjectCommand(input) : new GetObjectCommand(input);

  try {
    const resp = await client.send(command);
    return {
      body: resp.Body,
      status: resp.$metadata.httpStatusCode,
      contentType: resp.ContentType,
      contentLength: resp.ContentLength,
    };
  } catch (e) {
    return { body: '', status: 404, contentLength: 0 };
  }
}
