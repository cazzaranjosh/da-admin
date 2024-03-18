/* eslint-env mocha */
import assert from 'assert';

import { getDaCtx } from '../../src/utils/daCtx.js';
import formatList from '../../src/storage/utils/list.js';

const MOCK = {
  CommonPrefixes: [
    { Prefix: 'blog/' },
    { Prefix: 'da-aem-boilerplate/' },
    { Prefix: 'da/' },
    { Prefix: 'dac/' },
    { Prefix: 'milo/' },
    { Prefix: 'dark-alley.jpg/' },
  ],
  Contents: [
    {
      Key: 'blog.props',
    },
    {
      Key: 'da.props',
    },
    {
      Key: 'folder-only.props',
    },
    {
      Key: 'test.html',
    },
    {
      Key: 'dark-alley.jpg.props',
    },
    {
      Key: 'dark-alley.jpg',
    }
  ],
};

const daCtx = getDaCtx('/source/adobecom');

describe('Format object list', () => {
  const list = formatList(MOCK, daCtx);

  it('should return a true folder / common prefix', () => {
    assert.strictEqual(list[0].name, 'blog');
  });

  it('should return a contents-based folder', () => {
    const folderOnly = list.find((item) => { return item.name === 'folder-only' });
    assert.strictEqual(folderOnly.name, 'folder-only');
  });

  it('should not return a props file of same folder name', () => {
    const found = list.reduce((acc, item) => {
      if (item.name === 'blog') acc.push(item);
      return acc;
    },[]);

    assert.strictEqual(found.length, 1);
  });

  it('should not have a filename props file in the list', () => {
    const propsSidecar = list.find((item) => { return item.name === 'dark-alley.jpg.props' });
    assert.strictEqual(propsSidecar, undefined);
  });
});
