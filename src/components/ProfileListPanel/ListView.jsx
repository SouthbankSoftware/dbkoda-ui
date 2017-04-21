/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-15 13:40:45
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:40:42
 */
/* eslint-disable react/prop-types */
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {Cell, Column, SelectionModes, Table} from '@blueprintjs/table';

const React = require('react');

@inject('store')
@observer
export default class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @action
  onSelection(region) {
    if (region.length == 0) {
      this.props.store.profileList.selectedProfile = null;
      return;
    }
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    const profile = profiles[(region[0].rows[0])][1];
    this.props.store.profileList.selectedProfile = profile;
  }

  render() {
    const profiles = this
      .props
      .store
      .profiles
      .entries();
    profiles.map(p => console.log('profile status:', p[1].status));
    const renderCell = (rowIndex : number) => {
      return <Cell>{profiles[rowIndex][1].alias}</Cell>;
    };
    return (
      <div className="profileList">
        <Table
          allowMultipleSelection={false}
          numRows={this.props.store.profiles.size}
          isRowHeaderShown={false}
          selectionModes={SelectionModes.ROWS_AND_CELLS}
          isColumnResizable={false}
          isRowResizable={false}
          defaultColumnWidth={1024}
          onSelection={region => this.onSelection(region)}>
          <Column name="Connection Profiles" renderCell={renderCell} />
        </Table>
      </div>
    );
  }
}
