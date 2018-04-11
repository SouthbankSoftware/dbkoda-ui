/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-10T14:34:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-11T15:16:32+10:00
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
import { Menu, MenuItem } from '@blueprintjs/core';
import {
  Cell,
  Column,
  ColumnHeaderCell,
  SelectionModes,
  Table,
  Utils
} from '@blueprintjs/table';

export type ICellLookup = (rowIndex: number, columnIndex: number) => any;
export type ISortCallback = (
  columnIndex: number,
  comparator: (a: any, b: any) => number
) => void;

class TextSortableColumn {
  constructor(name: string, index: number) {
    this.name = name;
    this.index = index;
  }

  getColumn(getCellData: ICellLookup, sortColumn: ISortCallback) {
    const cellRenderer = (rowIndex: number, columnIndex: number) => (
      <Cell>{getCellData(rowIndex, columnIndex)}</Cell>
    );
    const menuRenderer = this.renderMenu.bind(this, sortColumn);
    const columnHeaderCellRenderer = () => ( <ColumnHeaderCell name={this.name} menuRenderer={menuRenderer} /> ); // eslint-disable-line
    return (
      <Column
        cellRenderer={cellRenderer}
        columnHeaderCellRenderer={columnHeaderCellRenderer}
        key={this.index}
        name={this.name}
      />
    );
  }

  renderMenu(sortColumn: ISortCallback) {
    const sortAsc = () => sortColumn(this.index, (a, b) => this.compare(a, b));
    const sortDesc = () => sortColumn(this.index, (a, b) => this.compare(b, a));
    return (
      <Menu>
        <MenuItem icon="sort-asc" onClick={sortAsc} text="Sort Asc" />
        <MenuItem icon="sort-desc" onClick={sortDesc} text="Sort Desc" />
      </Menu>
    );
  }

  compare(a: any, b: any) {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return a.toString().localeCompare(b.toString(), { numeric: true });
  }
}

@observer
export default class ConnectionsView extends React.Component<Props> {
  constructor() {
    super();
    this.state = {
      lastSelectRegion: null,
      sortedIndexMap: [],
      data: null,
      columns: [
            new TextSortableColumn('Connection Id', 0),
            new TextSortableColumn('appName', 1),
            new TextSortableColumn('client', 2),
            new TextSortableColumn('lastNs', 3),
            new TextSortableColumn('lastOp', 4),
            new TextSortableColumn('lastCommand', 5),
            new TextSortableColumn('Sampled μs', 6)
          ]
    };
  }
  componentWillReceiveProps(nextProps) {
    console.log('nextProps:', nextProps);
    if (nextProps && nextProps.connections) {
      this.setState({data: nextProps.connections});
    }
  }
  getDerivedStateFromProps(nextProps, prevState) {
    console.log('nextProps:', nextProps);
    console.log('prevState:', prevState);

    if (nextProps && nextProps.connections) {
      this.setState({data: nextProps.connections});
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
    let columnValue = '';
    switch (columnIndex) {
      case 0:
        columnValue = this.state.data[rowIndex].connectionId;
        break;
      case 1:
        columnValue = this.state.data[rowIndex].appName;
        break;
      case 2:
        columnValue = this.state.data[rowIndex].client;
        break;
      case 3:
        columnValue = this.state.data[rowIndex].lastNs;
        break;
      case 4:
        columnValue = this.state.data[rowIndex].lastOp;
        break;
      case 5:
        columnValue = this.state.data[rowIndex].lastCommand;
        break;
      case 6:
        columnValue = this.state.data[rowIndex].us;
        break;
      default:
        columnValue = this.state.data[rowIndex].connectionId;
        break;
    }
    if (typeof columnValue === 'object') {
      columnValue = JSON.stringify(columnValue);
    }
    return columnValue;
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
    console.log('region:', region);
    if (region.length == 0) {
      return;
    }
    let regionObj = region[0];
    regionObj = _.pick(regionObj, 'rows');

    this.setState({ lastSelectRegion: [regionObj] });
  }

  render() {
    const { connections } = this.props;

    const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));
    const columnsWidthsPercent = [10, 15, 15, 15, 15, 15, 15];
    const columnsWidths = columnsWidthsPercent.map(width => (width * window.innerWidth / 100));

    return (
      <div style={{ height: '100%' }}>
        {connections &&
          connections.length && (
            <Table
              enableMultipleSelection={false}
              numRows={connections.length}
              enableRowHeader={false}
              selectionModes={SelectionModes.FULL_ROWS}
              bodyContextMenuRenderer={this.renderBodyContextMenu}
              enableRowResizing={false}
              enableColumnResizing={false}
              defaultRowHeight={60}
              onSelection={region => this.onSelection(region)}
              selectedRegions={this.state.lastSelectRegion}
              columnWidths={columnsWidths}
            >
              {columns}
            </Table>
          )}
      </div>
    );
  }
}
