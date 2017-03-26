/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-24T16:13:16+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-24T17:09:12+11:00
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
  });

  test('set a filter in toolbar', () => {
    treeState.parseJson(store.topology);
    const view = mount(<DDCTreeView treeState={treeState} />);
    view.find('input').simulate('change', { target: { value: 'south' } });
    expect(treeState.filter).toEqual('south');
  });
});
