/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-11T15:31:22+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-16T13:57:13+10:00
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
import { observer } from 'mobx-react';
import { action } from 'mobx';
import {
  SelectionModes,
  Table,
  Utils,
  TableLoadingOption
} from '@blueprintjs/table';

import TextSortableColumn from '../Components/TextSortableColumn';

const columnsWidthsPercent = [20, 20, 20, 20, 20];

@observer
export default class OperationsView extends React.Component<Props> {
  constructor(props) {
    super(props);
    const columnsWidths = columnsWidthsPercent.map(width => (width * this.props.tableWidth / 100));
    this.state = {
      lastSelectRegion: null,
      sortedIndexMap: [],
      data: null,
      columns: [
            new TextSortableColumn('OpId', 0),
            new TextSortableColumn('Namespace', 1),
            new TextSortableColumn('Operation', 2),
            new TextSortableColumn('Sampled μs', 3),
            new TextSortableColumn('Plan Summary', 4)
          ],
      columnsWidths
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.operations) {
      const operations = [];
      for (const opId in nextProps.operations) {
        if (nextProps.operations.hasOwnProperty(opId)) {
          const opObj = nextProps.operations[opId];
          operations.push({opId, ...opObj});
        }
      }
      this.setState({data: operations});
    }
    if (nextProps && nextProps.tableWidth) {
      const columnsWidths = columnsWidthsPercent.map(width => (width * nextProps.tableWidth / 100));
      this.setState({columnsWidths});
    }
  }

  getCellData = (rowIndex: number, columnIndex: number, bUseIndex: boolen = true) => {
    if (bUseIndex) {
      const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
      if (sortedRowIndex != null) {
        rowIndex = sortedRowIndex;
      }
    }

    if (!this.state.data) {
      return '';
    }
    let cellValue = '';
    switch (columnIndex) {
      case 0:
        cellValue = this.state.data[rowIndex].opId;
        break;
      case 1:
        cellValue = this.state.data[rowIndex].ns;
        break;
      case 2:
        cellValue = this.state.data[rowIndex].op;
        break;
      case 3:
        cellValue = this.state.data[rowIndex].us;
        break;
      case 4:
        cellValue = this.state.data[rowIndex].palnSummary;
        break;
      default:
        cellValue = this.state.data[rowIndex].opId;
        break;
    }
    if (typeof cellValue === 'object') {
      cellValue = JSON.stringify(cellValue);
    }
    return cellValue;
  };

  sortColumn = (
    columnIndex: number,
    comparator: (a: any, b: any) => number
  ) => {
    const { data } = this.state;
    const sortedIndexMap = Utils.times(data.length, (i: number) => i);
    sortedIndexMap.sort((a: number, b: number) => {
      return comparator(this.getCellData(a, columnIndex, false), this.getCellData(b, columnIndex, false));
    });
    this.setState({ sortedIndexMap });
  };

  @action
  onSelection(region) {
    if (region.length == 0) {
      return;
    }
    let regionObj = region[0];
    regionObj = _.pick(regionObj, 'rows');

    this.setState({ lastSelectRegion: [regionObj] });

    let rowIndex = regionObj.rows[0];
    const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
    if (sortedRowIndex != null) {
      rowIndex = sortedRowIndex;
    }
    if (this.props.onSelect) {
      this.props.onSelect(this.state.data[rowIndex]);
    }
  }

  render() {
    const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));
     // TODO: replace 0.6 with left bottom panel percent width
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
            <div className="pt-navbar-heading">
              Operations
            </div>
          </div>
        </nav>
        <div style={{ height: '100%' }}>
          <Table
            enableMultipleSelection={false}
            numRows={numRows}
            loadingOptions={loadingOptions}
            enableRowHeader={false}
            selectionModes={SelectionModes.FULL_ROWS}
            bodyContextMenuRenderer={this.renderBodyContextMenu}
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
      </div>
    );
  }
}
