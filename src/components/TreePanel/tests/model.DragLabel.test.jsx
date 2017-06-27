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
 * @Date:   2017-03-22T17:09:32+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-28T12:51:54+11:00
 */

import React from 'react';
import { mount } from 'enzyme';
import { useStrict } from 'mobx';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import renderer from 'react-test-renderer';

import DragLabel from '#/TreePanel/model/DragLabel';

describe('DragLabel', () => {
  const props = {
    id: 'root_shards_s0_ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37017',
    label: 'ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37017',
    type: 'shard'
  };
  const props1 = {
    id: 'root_databases_DBEnvyLoad',
    label: 'DBEnvyLoad',
    type: 'database'
  };

  const treeState = {
    filter: '',
    setFilter: (value) => {
      treeState.filter = value;
    }
  };

  class DragLabelTest extends React.Component {
    render() {
      return (
        <DragLabel id={this.props.id} label={this.props.label} type={this.props.type} treeState={this.props.treeState} />
      );
    }
  }

  const DDCDragLabel = DragDropContext(HTML5Backend)(DragLabelTest);

  beforeAll(() => {
    useStrict(true);
  });

  test('check label text', () => {
    const label = mount(
      <DDCDragLabel id={props.id} label={props.label} type={props.type} treeState={treeState} />,
    );
    expect(label.find('span').text()).toEqual('ec2-13-54-17-227:37017');
  });

  test('matches snapshot', () => {
    const testLabel = renderer.create(
      <DDCDragLabel id={props.id} label={props.label} type={props.type} treeState={treeState} />,
    );

    expect(testLabel).toMatchSnapshot();
  });

  test('check label text with filter', () => {
    treeState.setFilter('south');
    const label = mount(
      <DDCDragLabel id={props.id} label={props.label} type={props.type} treeState={treeState} />,
    );

    expect(label.find('mark').text()).toEqual(
      treeState.filter,
    );
  });

  test('check label text with filter', () => {
    const label1 = mount(
      <DDCDragLabel id={props1.id} label={props1.label} type={props1.type} treeState={treeState} />,
    );

    expect(label1.find('span').text()).toEqual(props1.label);
  });
});
