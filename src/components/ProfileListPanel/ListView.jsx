/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-15 13:40:45
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:40:42
*/

/* eslint-disable react/prop-types */
import {observer, inject} from 'mobx-react';
import {action, reaction} from 'mobx';
import {Table, Column, Cell, SelectionModes, Regions} from '@blueprintjs/table';

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
    const renderCell = (rowIndex : number) => <Cell>{profiles[rowIndex][1].alias}</Cell>;
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
          onSelection={(region) => this.onSelection(region)}
        >
          <Column name="Connection Profiles" renderCell={renderCell} />
        </Table>
      </div>
    );
  }
}
