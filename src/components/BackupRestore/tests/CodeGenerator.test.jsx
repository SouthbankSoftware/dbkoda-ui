/**
 * Created by joey on 25/7/17.
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-17T13:31:34+11:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

import chai, { assert } from 'chai';

import chaiEnzyme from 'chai-enzyme';
import globalizeInit from '../../tests/helpers/globalize.js';

import { generateCode } from '../CodeGenerator';
import { BackupRestoreActions } from '../../common/Constants';

chai.use(chaiEnzyme());

describe('test backup restore generator view', () => {
  beforeAll(() => {
    globalizeInit();
  });

  test('test mongoexport database generator common', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      exportType: { selected: 'json' },
      selectedCollections: [],
      db: 'testdb'
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.EXPORT_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(
      code[0],
      'mongoexport --host "localhost" --port "27017" --db "testdb" --collection "col1" --type "json" -o "/tmp/col1.json" '
    );
    assert.equal(
      code[1],
      'mongoexport --host "localhost" --port "27017" --db "testdb" --collection "col2" --type "json" -o "/tmp/col2.json" '
    );
  });

  test('test mongoexport database generator selected collections', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: false,
      collections: ['col1', 'col2'],
      selectedCollections: ['col1'],
      exportType: {},
      jsonArray: true,
      db: 'testdb'
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.EXPORT_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongoexport --host "localhost" --port "27017" --db "testdb" --collection "col1" --jsonArray --type "" -o "/tmp/col1.json" '
    );
  });

  test('test mongoexport database generator with options', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: false,
      collections: ['col1', 'col2'],
      selectedCollections: ['col1'],
      exportType: {},
      jsonArray: true,
      pretty: true,
      noHeaderLine: true,
      type: 'json',
      db: 'testdb'
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.EXPORT_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongoexport --host "localhost" --port "27017" --db "testdb" --collection "col1" --pretty --jsonArray --noHeaderLine --type "" -o "/tmp/col1.json" '
    );
  });

  test('test mongoexport database generator with output options', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      jsonArray: true,
      pretty: true,
      noHeaderLine: true,
      type: 'json',
      db: 'testdb'
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.EXPORT_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(
      code[0],
      'mongoexport --host "localhost" --port "27017" --db "testdb" --collection "col1" --pretty --jsonArray --noHeaderLine --type "" -q "{a:a}" -o "/tmp/col1.json" '
    );
  });

  test('test mongoexport database generator with querying options', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      jsonArray: true,
      pretty: true,
      noHeaderLine: true,
      type: 'json',
      forceTableScan: true,
      skip: 10,
      limit: 20,
      sort: '{b:1}',
      assertExists: true,
      db: 'testdb'
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.EXPORT_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(
      code[0],
      'mongoexport --host "localhost" --port "27017" --db "testdb" --collection "col1" --pretty --jsonArray --noHeaderLine --type "" -q "{a:a}" --forceTableScan --skip "10" --limit "20" --assertExists -o "/tmp/col1.json" '
    );
  });

  test('test mongodump database generator general', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      db: 'testdb',
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "testdb" -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump database generator with selected collection', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: false,
      collections: ['col1', 'col2'],
      selectedCollections: ['col2'],
      query: '{a:a}',
      exportType: {},
      db: 'testdb',
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "testdb" --collection "col2" -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump database generator with dumpDbUsersAndRoles', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: false,
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: true,
      db: 'testdb',
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "testdb" --dumpDbUsersAndRoles -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump database generator with credential', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user',
      sha: true,
      password: '123456',
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      db: 'testdb',
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: true,
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "testdb" -u "user" -p ****** --authenticationDatabase "test" --dumpDbUsersAndRoles -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump database generator with credential and url', () => {
    const profile = {
      url: 'mongodb://user:123456@localhost:27017',
      database: 'test',
      hostRadio: false
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: true,
      db: 'testdb',
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "testdb" -u "user" -p ****** --authenticationDatabase "test" --dumpDbUsersAndRoles -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump database generator for profile ssl', () => {
    const profile = {
      url: 'mongodb://user:123456@localhost:27017',
      database: 'test',
      ssl: true,
      hostRadio: false
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: true,
      ssl: false,
      db: 'testdb',
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "testdb" -u "user" -p ****** --ssl --authenticationDatabase "test" --dumpDbUsersAndRoles -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump all databases for a server', () => {
    const profile = {
      url: 'mongodb://user:123456@localhost:27017',
      database: 'test',
      ssl: true,
      hostRadio: false
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: false,
      ssl: false,
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_SERVER,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" -u "user" -p ****** --ssl --authenticationDatabase "test" -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump selected databases for a server', () => {
    const profile = {
      url: 'mongodb://user:123456@localhost:27017',
      database: 'test',
      ssl: true,
      hostRadio: false
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: false,
      collections: ['col1', 'col2'],
      selectedCollections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: false,
      ssl: false,
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_SERVER,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "col1" -u "user" -p ****** --ssl --authenticationDatabase "test" -q "{a:a}" --forceTableScan -o "/tmp" '
    );
    assert.equal(
      code[1],
      'mongodump --host "localhost" --port "27017" --db "col2" -u "user" -p ****** --ssl --authenticationDatabase "test" -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump all databases for a server with dumpDbUsersAndRoles turn on', () => {
    const profile = {
      url: 'mongodb://user:123456@localhost:27017',
      database: 'test',
      ssl: true,
      hostRadio: false
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      query: '{a:a}',
      exportType: {},
      ssl: false,
      dumpDbUsersAndRoles: true,
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_SERVER,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" -u "user" -p ****** --ssl --authenticationDatabase "test" --dumpDbUsersAndRoles -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test mongodump selected databases for a server with dumpDbUsersAndRoles turn on', () => {
    const profile = {
      url: 'mongodb://user:123456@localhost:27017',
      database: 'test',
      ssl: true,
      hostRadio: false
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: false,
      collections: ['col1', 'col2'],
      selectedCollections: ['col1'],
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: true,
      ssl: false,
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_SERVER,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" -u "user" -p ****** --ssl --authenticationDatabase "test" --dumpDbUsersAndRoles -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });

  test('test export mongodb with query including quotes', () => {
    const profile = {
      url: 'mongodb://user:123456@localhost:27017',
      database: 'test',
      ssl: true,
      hostRadio: false
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: false,
      collections: ['col1'],
      selectedCollections: ['col1'],
      query: '{a:"a"}',
      exportType: {},
      dumpDbUsersAndRoles: true,
      ssl: false,
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_SERVER,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" -u "user" -p ****** --ssl --authenticationDatabase "test" --dumpDbUsersAndRoles -q "{a:\\"a\\"}" --forceTableScan -o "/tmp" '
    );
  });

  test('Double quotes inside double-quoted params should be escaped with slashes', () => {
    const profile = {
      host: 'localhost',
      port: 27017,
      username: 'user "test"',
      sha: true,
      password: '123456',
      database: 'test',
      hostRadio: true
    };
    const state = {
      directoryPath: '/tmp',
      allCollections: true,
      collections: ['col1', 'col2'],
      db: 'testdb',
      query: '{a:a}',
      exportType: {},
      dumpDbUsersAndRoles: true,
      forceTableScan: true
    };
    const gc = generateCode({
      treeNode: { text: 'db1' },
      action: BackupRestoreActions.DUMP_DATABASE,
      profile,
      state
    });
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(
      code[0],
      'mongodump --host "localhost" --port "27017" --db "testdb" -u "user \\"test\\"" -p ****** --authenticationDatabase "test" --dumpDbUsersAndRoles -q "{a:a}" --forceTableScan -o "/tmp" '
    );
  });
});
