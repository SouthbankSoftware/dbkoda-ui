/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-22T17:09:32+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-24T12:30:47+11:00
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
    type: 'shard',
    filter: '',
  };
  const props1 = {
    id: 'root_databases_DBEnvyLoad',
    label: 'DBEnvyLoad',
    type: 'database',
    filter: ''
  };

  class DragLabelTest extends React.Component {
    render() {
      return (
        <DragLabel id={this.props.id} label={this.props.label} type={this.props.type} filter={this.props.filter} />
      );
    }
  }

  const DDCDragLabel = DragDropContext(HTML5Backend)(DragLabelTest);

  beforeAll(() => {
    useStrict(true);
  });

  test('check label text', () => {
    const label = mount(
      <DDCDragLabel id={props.id} label={props.label} type={props.type} filter={props.filter} />,
    );
    expect(label.find('span').text()).toEqual('ec2-13-54-17-227:37017');
  });

  test('matches snapshot', () => {
    const testLabel = renderer.create(
      <DDCDragLabel id={props.id} label={props.label} type={props.type} filter={props.filter} />,
    );

    expect(testLabel).toMatchSnapshot();
  });

  test('check label text with filter', () => {
    props.filter = 'south';
    const label = mount(
      <DDCDragLabel id={props.id} label={props.label} type={props.type} filter={props.filter} />,
    );

    expect(label.find('mark').text()).toEqual(
      props.filter,
    );
  });

  test('check label text with filter', () => {
    const label1 = mount(
      <DDCDragLabel id={props1.id} label={props1.label} type={props1.type} filter={props1.filter} />,
    );

    expect(label1.find('span').text()).toEqual(props1.label);
  });
});
