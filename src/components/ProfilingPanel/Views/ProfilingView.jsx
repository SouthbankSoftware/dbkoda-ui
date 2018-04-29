/**
 * @Author: Michael Harrison
 * @Date:   2018-04-10T14:34:47+10:00
 * @Email:  Mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2018-04-17T16:19:47+10:00
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
import { SelectionModes, Table, Utils, TableLoadingOption } from '@blueprintjs/table';

import TextSortableColumn from '../Components/TextSortableColumn';
import ProgressBarColumn from '../Components/ProgressBarColumn';

const columnsWidthsPercent = [15, 13, 12, 35, 5, 5, 15];

@observer
export default class ProfilingView extends React.Component<Props> {
  constructor(props) {
    super(props);
    const columnsWidths = columnsWidthsPercent.map(width => width * this.props.tableWidth / 100);
    this.state = {
      lastSelectRegion: null,
      sortedIndexMap: [],
      data: this.props.ops || null,
      highWaterMark: null,
      columns: [
        new TextSortableColumn('Id', 0),
        new TextSortableColumn('ns', 1),
        new TextSortableColumn('Plan Summary', 2),
        new TextSortableColumn('Plan Stack', 3),
        new TextSortableColumn('#', 4),
        new TextSortableColumn('ms', 5),
        new ProgressBarColumn('', 'millis', 6)
      ],
      columnsWidths
    };
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (nextProps && nextProps.ops) {
      this.setState({ data: nextProps.ops });
    } else {
      this.setState({ data: null });
    }
    if (nextProps && nextProps.highWaterMark) {
      this.setState({ highWaterMark: nextProps.highWaterMark });
    }
    if (nextProps && nextProps.tableWidth) {
      const columnsWidths = columnsWidthsPercent.map(width => width * nextProps.tableWidth / 100);
      this.setState({ columnsWidths });
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
        cellValue = this.state.data[rowIndex].id;
        break;
      case 1:
        cellValue = this.state.data[rowIndex].ns;
        break;
      case 2:
        cellValue = this.state.data[rowIndex].plansSummary;
        break;
      case 3:
        cellValue = this.state.data[rowIndex].planQuery.join(', ');
        break;
      case 4:
        cellValue = this.state.data[rowIndex].count;
        break;
      case 5:
        cellValue = this.state.data[rowIndex].millis;
        break;
      case 6:
        cellValue = _.pick(this.state.data[rowIndex], 'millis');
        if (this.state.highWaterMark) {
          cellValue.highWaterMark = this.state.highWaterMark.millis;
        }
        break;
      default:
        cellValue = this.state.data[rowIndex].id;
        break;
    }
    if (typeof cellValue === 'object') {
      cellValue = JSON.stringify(cellValue);
    }
    return cellValue;
  };

  sortColumn = (columnIndex: number, comparator: (a: any, b: any) => number) => {
    const { data } = this.state;
    const sortedIndexMap = Utils.times(data.length, (i: number) => i);
    sortedIndexMap.sort((a: number, b: number) => {
      return comparator(
        this.getCellData(a, columnIndex, false),
        this.getCellData(b, columnIndex, false)
      );
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
    const { ops } = this.props;

    const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));

    const loadingOptions = [];
    let numRows = 10;
    if (ops && ops.length) {
      numRows = ops.length;
    } else {
      loadingOptions.push(TableLoadingOption.CELLS);
    }
    return (
      <div className="opsTableWrapper" style={{ height: '100%' }}>
        <div style={{ height: 'calc(100% - 50px)' }}>
          <Table
            enableMultipleSelection={false}
            numRows={numRows}
            loadingOptions={loadingOptions}
            enableRowHeader={false}
            selectionModes={SelectionModes.FULL_ROWS}
            bodyContextMenuRenderer={this.renderBodyContextMenu}
            enableRowResizing={false}
            enableColumnResizing={false}
            defaultRowHeight={20}
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
