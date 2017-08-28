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
 * Created by joey on 11/8/17.
 */

import {assert} from 'chai';

import {getDialogProperites} from '../Utils';
import {BackupRestoreActions} from '../../common/Constants';
import globalizeInit from '../../tests/helpers/globalize.js';

describe('test utils class', () => {
  beforeAll(() => {
    globalizeInit();
  });

  test('test get dialog properties', () => {
    const properties = getDialogProperites(BackupRestoreActions.IMPORT_COLLECTION);
    assert.equal(properties.length, 4);
    assert.equal(properties[0], 'openFile');
    assert.equal(properties[1], 'openDirectory');
    assert.equal(properties[2], 'createDirectory');
    assert.equal(properties[3], 'promptToCreate');
  });
});
