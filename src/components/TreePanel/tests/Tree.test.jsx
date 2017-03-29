/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-24T16:13:16+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-29T09:53:47+11:00
 */

import React from 'react';
import { mount } from 'enzyme';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TempTopology from '~/stores/TempTopology.js';
import TreeState from '#/TreePanel/model/TreeState';
import { TreeView, TreeToolbar } from '../index.js';

describe('Tree View and Toolbar', () => {
  class TreeViewTest extends React.Component {
    render() {
      return (
        <Provider treeState={this.props.treeState}>
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
  treeState.parseJson(topology);

  beforeAll(() => {
    useStrict(true);
  });

  test('set a filter in toolbar', () => {
    const view = mount(<DDCTreeView treeState={treeState} />);
    view.find('input').simulate('change', { target: { value: 'south' } });
    expect(treeState.filter).toEqual('south');
  });

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
});
