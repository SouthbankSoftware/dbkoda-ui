/**
 * Created by joey on 15/5/17.
 */

import uuidV1 from 'uuid';
import React from 'react';
import {shallow, mount} from 'enzyme';
import {Provider} from 'mobx-react';
import {expect} from 'chai';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {useStrict, observable} from 'mobx';
import Store from '../../../stores/global';
import {EditorPanel, EditorToolbar} from '../index.js';

describe('Editor State Tests', () => {
  beforeAll(() => {
    useStrict(true);
  });

  test('checked tabs with editors in store', () => {
    const store = new Store();
    const editorId1 = uuidV1();
    store.editors.set(editorId1, observable({
      id: editorId1,
      alias: 'alias-1',
      profileId: uuidV1(),
      shellId: uuidV1(),
      currentProfile: uuidV1(),
      visible: true,
      executing: false,
      initialMsg: '',
      code: '',
      path: null
    }));
    const editorId2 = uuidV1();
    store.editors.set(editorId2, observable({
      id: editorId2,
      alias: 'alias-2',
      profileId: uuidV1(),
      shellId: uuidV1(),
      currentProfile: uuidV1(),
      visible: true,
      executing: false,
      initialMsg: '',
      code: '',
      path: null
    }));
    const editor = shallow(<EditorPanel.wrappedComponent store={store} />);
    expect(editor.find('.editorPanel')).to.have.length(1);
    expect(editor.find('.editorPanel .editorTab')).to.have.length(2);
    const tabs = editor.find('.editorPanel .editorTab');
    expect(tabs).to.have.length(2);
  });
});


