/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-24T16:13:16+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-27T12:34:20+11:00
 */

import React from 'react';
import { mount } from 'enzyme';
import { useStrict } from 'mobx';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Store from '~/stores/global';
import TreeState from '#/TreePanel/model/TreeState';
import { TreeView, TreeToolbar } from '../index.js';

describe('Tree View and Toolbar', () => {
  const store = new Store();
  const treeState = new TreeState();

  class TreeViewTest extends React.Component {
    render() {
      return (
        <div>
          <TreeToolbar treeState={this.props.treeState} />
          <TreeView treeState={this.props.treeState} />
        </div>
      );
    }
  }

  const DDCTreeView = DragDropContext(HTML5Backend)(TreeViewTest);

  beforeAll(() => {
    useStrict(true);
    treeState.parseJson(store.topology);
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
