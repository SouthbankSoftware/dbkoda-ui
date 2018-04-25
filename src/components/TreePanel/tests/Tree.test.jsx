/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-24T16:13:16+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T20:31:23+11:00
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

import React from 'react';
import '~/helpers/configEnzyme';
import { mount } from 'enzyme';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { DragDropContext } from 'react-dnd';
import Store from '~/stores/global';
import HTML5Backend from 'react-dnd-html5-backend';
import TempTopology from '~/stores/TempTopology.js';
import TreeState from '#/TreePanel/model/TreeState';
import globalizeInit from '#/tests/helpers/globalize.js';
import { TreeView, TreeToolbar } from '../index.js';

describe('Tree View and Toolbar', () => {
  class TreeViewTest extends React.Component {
    render() {
      return (
        <Provider treeState={this.props.treeState} store={this.props.store}>
          <div>
            <TreeToolbar />
            <TreeView />
          </div>
        </Provider>
      );
    }
  }

  const DDCTreeView = DragDropContext(HTML5Backend)(TreeViewTest);
  const topology = JSON.parse(TempTopology.data);
  const treeState = new TreeState();
  const store = new Store();
  treeState.parseJson(topology);

  beforeAll(() => {
    configure({ enforceActions: true });
    globalizeInit();
  });

  test('set a filter in toolbar', () => {
    const view = mount(<DDCTreeView treeState={treeState} store={store} />);
    view.find('input').simulate('change', {
      target: {
        value: 'south'
      }
    });
    expect(treeState.filter).toEqual('south');
  });
});
