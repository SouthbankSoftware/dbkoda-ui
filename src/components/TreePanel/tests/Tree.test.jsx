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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-24T16:13:16+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T09:12:49+10:00
 */

import React from 'react';
import {mount} from 'enzyme';
import {useStrict} from 'mobx';
import {Provider} from 'mobx-react';
import {DragDropContext} from 'react-dnd';
import Store from '~/stores/global';
import HTML5Backend from 'react-dnd-html5-backend';
import TempTopology from '~/stores/TempTopology.js';
import TreeState from '#/TreePanel/model/TreeState';
import {TreeView, TreeToolbar} from '../index.js';

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
    useStrict(true);
  });

  test('set a filter in toolbar', () => {
    const view = mount(<DDCTreeView treeState={treeState} store={store} />);
    view
      .find('input')
      .simulate('change', {
        target: {
          value: 'south'
        }
      });
    expect(treeState.filter).toEqual('south');
  });

  /**
   * @TODO - These tests are no longer valid as the actions they incur are dependant on other components, these test cases should be covered in UAT.
   *
  test('expand/collapse a tree node', () => {
    const view = mount(<DDCTreeView treeState={treeState} />);
    const node = view.find('.pt-tree-node-caret').first();
    const nodeState = node.hasClass('pt-tree-node-caret-closed'); // get the initial state
    view.find('.pt-tree-node-caret').first().simulate('click');
    expect(node.hasClass('pt-tree-node-caret-closed')).toEqual(!nodeState); // after click the state should change to the opposite state
    view.find('.pt-tree-node-caret').first().simulate('click');
    expect(node.hasClass('pt-tree-node-caret-closed')).toEqual(nodeState); // after another click the state should revert back to initial state
  });

  test('select a tree node', () => {
    const view = mount(<DDCTreeView treeState={treeState} />);
    const node = view.find('.pt-tree-node-content').first();
    const initState = treeState.nodes[0].isSelected;
    node.simulate('click');
    expect(treeState.nodes[0].isSelected).toEqual(!initState);
  });
  */
});
