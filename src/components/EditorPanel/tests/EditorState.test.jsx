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
 * @Author: joey
 * @Date:   2017-05-15T16:33:48+10:00
 * @Email:  joey@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-01T13:22:02+11:00
 */

import uuidV1 from 'uuid';
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { observable, useStrict } from 'mobx';
import globalizeInit from '#/tests/helpers/globalize.js';
import { EditorTypes } from '#/common/Constants';
import DataCenter from '~/api/DataCenter';
import Store from '../../../stores/global';
import { EditorPanel } from '../index.js';

describe('Editor State Tests', () => {
  beforeAll(() => {
    useStrict(true);
    globalizeInit();
  });

  test('checked tabs with editors in store', () => {
    const store = new Store();
    const api = new DataCenter(store);

    const editorId1 = uuidV1();
    store.editors.set(
      editorId1,
      observable({
        id: editorId1,
        alias: 'alias-1',
        profileId: uuidV1(),
        shellId: uuidV1(),
        currentProfile: uuidV1(),
        visible: true,
        executing: false,
        initialMsg: '',
        code: '',
        path: null,
        type: EditorTypes.DEFAULT,
      }),
    );
    const editorId2 = uuidV1();
    store.editors.set(
      editorId2,
      observable({
        id: editorId2,
        alias: 'alias-2',
        profileId: uuidV1(),
        shellId: uuidV1(),
        currentProfile: uuidV1(),
        visible: true,
        executing: false,
        initialMsg: '',
        code: '',
        path: null,
        type: EditorTypes.DEFAULT,
      }),
    );
    const editor = shallow(<EditorPanel.wrappedComponent store={store} api={api} />);
    expect(editor.find('.editorPanel')).to.have.length(1);
    expect(editor.find('.editorPanel .editorTab')).to.have.length(2);
    const tabs = editor.find('.editorPanel .editorTab');
    expect(tabs).to.have.length(2);
  });
});
