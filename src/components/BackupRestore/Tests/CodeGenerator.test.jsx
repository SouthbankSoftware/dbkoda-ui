/*
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
/**
 * Created by joey on 25/7/17.
 */

import chai, {assert} from 'chai';

import chaiEnzyme from 'chai-enzyme';
// import {mount} from 'enzyme';
import globalizeInit from '../../tests/helpers/globalize.js';

import {generateCode} from '../CodeGenerator';
import {BackupRestoreActions} from '../../common/Constants';

// const hbs = require('handlebars');

// const jsonHelper = require('../../../helpers/handlebars/json.js');
// const nodotsHelper = require('../../../helpers/handlebars/nodots.js');

// hbs.registerHelper('json', jsonHelper);
// hbs.registerHelper('nodots', nodotsHelper);

chai.use(chaiEnzyme());

describe('test backup restore generator view', () => {
  beforeAll(() => {
    globalizeInit();
  });

  test('test mongoexport database generator', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: true, collections: ['col1', 'col2'], selectedCollections: [], exportType: {} };
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.EXPORT_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(code[0], 'mongoexport --host localhost --port 27017 --db  -u user --collection col1 -o /tmp/col1.json ');
    assert.equal(code[1], 'mongoexport --host localhost --port 27017 --db  -u user --collection col2 -o /tmp/col2.json ');
  });

  test('test mongoexport database generator selected collections', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: false, collections: ['col1', 'col2'], selectedCollections: ['col1'], exportType: {}, jsonArray: true };
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.EXPORT_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(code[0], 'mongoexport --host localhost --port 27017 --db  -u user --collection col1 --jsonArray -o /tmp/col1.json ');
  });

  test('test mongoexport database generator with options', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: false, collections: ['col1', 'col2'],
      selectedCollections: ['col1'], exportType: {}, jsonArray: true, pretty: true, noHeaderLine: true, type: 'json' };
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.EXPORT_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(code[0], 'mongoexport --host localhost --port 27017 --db  -u user --collection col1 --pretty --jsonArray --noHeaderLine -o /tmp/col1.json ');
  });

  test('test mongoexport database generator with output options', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: true, collections: ['col1', 'col2'], query: '{a:a}', exportType: {}, jsonArray: true, pretty: true, noHeaderLine: true, type: 'json' };
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.EXPORT_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(code[0], 'mongoexport --host localhost --port 27017 --db  -u user --collection col1 --pretty --jsonArray --noHeaderLine -q {a:a} -o /tmp/col1.json ');
  });

  test('test mongoexport database generator with querying options', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: true, collections: ['col1', 'col2'],
      query: '{a:a}', exportType: {}, jsonArray: true, pretty: true, noHeaderLine: true, type: 'json',
      forceTableScan: true, skip: 10, limit: 20, sort: '{b:1}', assertExists: true };
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.EXPORT_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(code[0], 'mongoexport --host localhost --port 27017 --db  -u user --collection col1 --pretty --jsonArray --noHeaderLine -q {a:a} --forceTableScan --skip 10 --limit 20 --assertExists -o /tmp/col1.json ');
  });

  test('test mongodump database generator', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: true, collections: ['col1', 'col2'],
      query: '{a:a}', exportType: {},
      forceTableScan: true};
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.DUMP_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 3);
    assert.equal(code[0], 'mongodump --host localhost --port 27017 --db  -u user --collection col1 -q {a:a} --forceTableScan -o /tmp ');
    assert.equal(code[1], 'mongodump --host localhost --port 27017 --db  -u user --collection col2 -q {a:a} --forceTableScan -o /tmp ');
  });

  test('test mongodump database generator with selected collection', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: false, collections: ['col1', 'col2'], selectedCollections: ['col2'],
      query: '{a:a}', exportType: {},
      forceTableScan: true};
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.DUMP_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(code[0], 'mongodump --host localhost --port 27017 --db  -u user --collection col2 -q {a:a} --forceTableScan -o /tmp ');
  });

  test('test mongodump database generator with dumpDbUsersAndRoles', () => {
    const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    const state = {directoryPath: '/tmp', allCollections: true, collections: ['col1', 'col2'],
      query: '{a:a}', exportType: {}, dumpDbUsersAndRoles: true,
      forceTableScan: true};
    const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.DUMP_DATABASE, profile, state});
    const code = gc.split('\n');
    assert.equal(code.length, 2);
    assert.equal(code[0], 'mongodump --host localhost --port 27017 --db  -u user --dumpDbUsersAndRoles -q {a:a} --forceTableScan -o /tmp ');
  });
});
