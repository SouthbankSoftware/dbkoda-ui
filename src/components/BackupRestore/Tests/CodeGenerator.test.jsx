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

import chai from 'chai';

import chaiEnzyme from 'chai-enzyme';
// import {mount} from 'enzyme';
import globalizeInit from '../../tests/helpers/globalize.js';

// import {generateCode} from '../CodeGenerator';
// import {BackupRestoreActions} from '../../common/Constants';

const hbs = require('handlebars');

const jsonHelper = require('../../../helpers/handlebars/json.js');
const nodotsHelper = require('../../../helpers/handlebars/nodots.js');

hbs.registerHelper('json', jsonHelper);
hbs.registerHelper('nodots', nodotsHelper);

chai.use(chaiEnzyme());


// TODO: How to load hbs in unit tests

describe('test backup restore generator view', () => {
  beforeAll(() => {
    globalizeInit();
  });

  test('test mongoexport generator', () => {
    // const profile = {host:'localhost', port: 27017, username: 'user', sha: false, database: 'test', hostRadio: true};
    // const state = {directoryPath: '/tmp', allCollections: true, collections: ['col1', 'col2'], selectedCollections: []};
    // const gc = generateCode({treeNode:{text:'db1'}, action: BackupRestoreActions.EXPORT_DATABASE, profile, state});
    // console.log(gc);

  });
});
