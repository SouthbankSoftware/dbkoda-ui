/**
 * @flow
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-11T15:31:22+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-30T14:20:03+10:00
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

import _ from 'lodash';
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { action } from 'mobx';
import { SelectionModes, Table, Utils, TableLoadingOption } from '@blueprintjs/table';
import { AnchorButton, Intent, Dialog } from '@blueprintjs/core';
import autobind from 'autobind-decorator';

import TextSortableColumn from '../Components/TextSortableColumn';
import ActionsColumn from '../Components/ActionsColumn';

const columnsWidthsPercent: Array<number> = [15, 20, 20, 15, 20, 10];

type Props = {
  tableWidth: number,
  onSelect: Function,
  operations: Object,
  api: *
};

type State = {
  data: Array<Object>,
  lastSelectRegion: Array<Object>,
  lastSortedIndex: number,
  sortedIndexMap: Array<number>,
  operations: Object,
  columns: Array<Object>,
  columnsWidths: Array<number>,
  removeOperationAlert: boolean
};

@inject(({ store }) => {
  const {
    topConnectionsPanel: { operations }
  } = store;
  return {
    api: store.api,
    operations
  };
})
@observer
export default class OperationsView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const columnsWidths = columnsWidthsPercent.map(width => width * this.props.tableWidth / 100);
    this.state = {
      lastSelectRegion: [
        {
          rows: [0, 0]
        }
      ],
      sortedIndexMap: [],
      lastSortedIndex: -1,
      data: [],
      operations: {},
      columns: [
        new TextSortableColumn('OpId', 0),
        new TextSortableColumn('Namespace', 1),
        new TextSortableColumn('Operation', 2),
        new TextSortableColumn('Sampled μs', 3),
        new TextSortableColumn('Plan Summary', 4),
        new ActionsColumn('', 5, this.killProcessAction)
      ],
      columnsWidths,
      removeOperationAlert: false
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps && nextProps.operations && this.state.operations !== nextProps.operations) {
      const operations = [];
      for (const opId in nextProps.operations) {
        if (nextProps.operations.hasOwnProperty(opId)) {
          const opObj = nextProps.operations[opId];
          operations.push({ opId, ...opObj });
        }
      }
      this.setState({
        data: operations,
        operations: nextProps.operations,
        lastSelectRegion: [
          {
            rows: [0, 0]
          }
        ]
      });
      if (this.state.lastSortedIndex >= 0 && this.state.columns) {
        const col = this.state.columns[this.state.lastSortedIndex];
        if (col && col.sortColumn) {
          this.sortColumn(this.state.lastSortedIndex, col.getSortFunction(), operations);
        }
      }
    } else {
      this.setState({ data: [] });
    }
    if (nextProps && nextProps.tableWidth) {
      const columnsWidths = columnsWidthsPercent.map(width => width * nextProps.tableWidth / 100);
      this.setState({ columnsWidths });
    }
  }

  @autobind
  killProcessAction() {
    l.info('kill operation action ');
    this.setState({
      removeOperationAlert: true
    });
  }

  getCellData = (
    ogRowIndex: number,
    columnIndex: number,
    bUseIndex: boolean = true,
    dataToSort: any = null
  ) => {
    const data = dataToSort == null ? this.state.data : dataToSort;
    let rowIndex = ogRowIndex;
    if (bUseIndex) {
      const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
      if (sortedRowIndex != null) {
        rowIndex = sortedRowIndex;
      }
    }

    let cellValue = '';
    if (data && data.length > 0) {
      const rowData = data[rowIndex];
      switch (columnIndex) {
        case 0:
          cellValue = rowData.hasOwnProperty('opId') ? rowData.opId : '';
          break;
        case 1:
          cellValue = rowData.hasOwnProperty('ns') ? rowData.ns : '';
          break;
        case 2:
          cellValue = rowData.hasOwnProperty('op') ? rowData.op : '';
          break;
        case 3:
          cellValue = rowData.hasOwnProperty('us') ? rowData.us : '';
          break;
        case 4:
          cellValue = rowData.hasOwnProperty('planSummary') ? rowData.planSummary : '';
          break;
        case 5:
          cellValue = {
            opId: rowData.hasOwnProperty('opId') ? rowData.opId : '',
            bDelete:
              this.state.lastSelectRegion &&
              this.state.lastSelectRegion[0].rows &&
              this.state.lastSelectRegion[0].rows[0] === ogRowIndex
          };
          break;
        default:
          cellValue = '';
          break;
      }
    }
    if (typeof cellValue === 'object') {
      cellValue = JSON.stringify(cellValue);
    }
    return cellValue;
  };

  sortColumn = (
    columnIndex: number,
    comparator: (a: any, b: any) => number,
    dataToSort: any = null
  ) => {
    const data = dataToSort == null ? this.state.data : dataToSort;
    const sortedIndexMap = Utils.times(data.length, (i: number) => i);
    sortedIndexMap.sort((a: number, b: number) => {
      return comparator(
        this.getCellData(a, columnIndex, false, dataToSort),
        this.getCellData(b, columnIndex, false, dataToSort)
      );
    });
    this.setState({ sortedIndexMap, lastSortedIndex: columnIndex });
  };

  @action
  onSelection(region: Array<Object>) {
    if (region.length == 0) {
      return;
    }
    let [regionObj] = region;
    regionObj = _.pick(regionObj, 'rows');

    this.setState({ lastSelectRegion: [regionObj] });

    this.setSelection(regionObj);
  }

  @autobind
  setSelection(regionObj: Object) {
    if (regionObj && regionObj.rows) {
      let [rowIndex] = regionObj.rows;
      const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
      if (sortedRowIndex != null) {
        rowIndex = sortedRowIndex;
      }
      if (this.props.onSelect && this.state.data && this.state.data[rowIndex]) {
        this.props.onSelect(this.state.data[rowIndex]);
      }
    }
  }

  @autobind
  hideRemoveOperationAlert() {
    this.setState({ removeOperationAlert: false });
  }

  @autobind
  removeOperation() {
    this.props.api.killSelectedOperation();
    this.setState({ sortedIndexMap: [] }); // TODO: Remove this line and do sort on the column again to update sortedIndexMap
    this.hideRemoveOperationAlert();
  }

  render() {
    const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));
    if (this.state.lastSelectRegion && this.state.lastSelectRegion.length > 0) {
      this.setSelection(this.state.lastSelectRegion[0]);
    }
    const loadingOptions = [];
    let numRows = 10;
    if (this.state.data && this.state.data.length) {
      numRows = this.state.data.length;
    } else {
      loadingOptions.push(TableLoadingOption.CELLS);
    }
    return (
      <div style={{ height: '100%' }}>
        <nav className="pt-navbar connectionsToolbar">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading pt-navbar-subheading">Operations</div>
          </div>
        </nav>
        <div style={{ height: 'calc(100% - 50px)' }}>
          <Table
            enableMultipleSelection={false}
            numRows={numRows}
            loadingOptions={loadingOptions}
            enableRowHeader={false}
            selectionModes={SelectionModes.FULL_ROWS}
            enableRowResizing={false}
            enableColumnResizing={false}
            defaultRowHeight={30}
            onSelection={region => this.onSelection(region)}
            selectedRegions={this.state.lastSelectRegion}
            columnWidths={this.state.columnsWidths}
          >
            {columns}
          </Table>
        </div>
        <Dialog
          className="pt-dark remove-profile-alert-dialog"
          intent={Intent.PRIMARY}
          isOpen={this.state.removeOperationAlert}
        >
          <div className="dialogContent">
            <p>{globalString('topConnections/operations/removeAlert/prompt')}</p>
          </div>
          <div className="dialogButtons">
            <AnchorButton
              className="submitButton"
              type="submit"
              intent={Intent.SUCCESS}
              onClick={this.removeOperation}
              text={globalString('general/confirmYes')}
            />
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              onClick={this.hideRemoveOperationAlert}
              text={globalString('general/cancel')}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}
