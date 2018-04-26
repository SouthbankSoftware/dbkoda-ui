/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-10T14:34:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-17T14:30:02+10:00
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
import { Button, Intent, Position, Tooltip } from '@blueprintjs/core';

import TextSortableColumn from '../Components/TextSortableColumn';
import ProgressBarColumn from '../Components/ProgressBarColumn';

const columnsWidthsPercent = [10, 15, 15, 10, 10, 15, 10, 15];

@observer
export default class ConnectionsView extends React.Component<Props> {
  constructor(props) {
    super(props);
    const columnsWidths = columnsWidthsPercent.map(width => width * this.props.tableWidth / 100);
    this.state = {
      lastSelectRegion: null,
      sortedIndexMap: [],
      data: null,
      highWaterMark: null,
      columns: [
        new TextSortableColumn('Connection Id', 0),
        new TextSortableColumn('appName', 1),
        new TextSortableColumn('client', 2),
        new TextSortableColumn('lastNs', 3),
        new TextSortableColumn('lastOp', 4),
        new TextSortableColumn('lastCommand', 5),
        new TextSortableColumn('Sampled μs', 6),
        new ProgressBarColumn('', 'us', 7)
      ],
      columnsWidths
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.connections) {
      this.setState({ data: nextProps.connections });
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
        cellValue = this.state.data[rowIndex].connectionId;
        break;
      case 1:
        cellValue = this.state.data[rowIndex].appName;
        break;
      case 2:
        cellValue = this.state.data[rowIndex].client;
        break;
      case 3:
        cellValue = this.state.data[rowIndex].lastNs;
        break;
      case 4:
        cellValue = this.state.data[rowIndex].lastOp;
        break;
      case 5:
        cellValue = this.state.data[rowIndex].lastCommand;
        break;
      case 6:
        cellValue = this.state.data[rowIndex].us;
        break;
      case 7:
        cellValue = _.pick(this.state.data[rowIndex], 'us');
        if (this.state.highWaterMark) {
          cellValue.highWaterMark = this.state.highWaterMark.us;
        }
        break;
      default:
        cellValue = this.state.data[rowIndex].connectionId;
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
    if (regionObj && regionObj.rows) {
      let rowIndex = regionObj.rows[0];
      const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
      if (sortedRowIndex != null) {
        rowIndex = sortedRowIndex;
      }
      if (this.props.onSelect) {
        this.props.onSelect(this.state.data[rowIndex]);
      }
    }
  }

  render() {
    const { connections, showPerformancePanel } = this.props;

    const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));

    const loadingOptions = [];
    let numRows = 10;
    if (connections && connections.length) {
      numRows = connections.length;
    } else {
      loadingOptions.push(TableLoadingOption.CELLS);
    }
    return (
      <div style={{ height: '100%' }}>
        <nav className="pt-navbar connectionsToolbar">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">Connections</div>
          </div>
          <div className="pt-navbar-group pt-align-right">
            <Tooltip
              className="ResetButton pt-tooltip-indicator pt-tooltip-indicator-form"
              content="Show Performance Panel"
              hoverOpenDelay={1000}
              inline
              intent={Intent.PRIMARY}
              position={Position.BOTTOM}
            >
              <Button
                className="reset-button pt-button pt-intent-primary"
                text="Performance"
                onClick={showPerformancePanel}
              />
            </Tooltip>
          </div>
        </nav>
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
