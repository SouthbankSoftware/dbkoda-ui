/**
 * @flow
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-10T14:34:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-30T14:16:58+10:00
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
import { Tooltip, Intent, Position, AnchorButton, Button } from '@blueprintjs/core';
import { SelectionModes, Table, Utils, TableLoadingOption } from '@blueprintjs/table';
import { Switch, NumericInput } from '@blueprintjs/core';
import autobind from 'autobind-decorator';
import RefreshIcon from '~/styles/icons/refresh-icon.svg';

import TextSortableColumn from '../Components/TextSortableColumn';
import ProgressBarColumn from '../Components/ProgressBarColumn';

const columnsWidthsPercent: Array<number> = [10, 15, 15, 10, 10, 15, 10, 15];

type Props = {
  tableWidth: number,
  onSelect: Function,
  connections: Array<Object>,
  highWaterMark: number,
  bLoading: boolean,
  autoRefreshTimeout: number,
  onAutoRefreshTimeoutChange: Function,
  onAutoRefreshCheckboxToggle: Function,
  api: *
};

type State = {
  data: Array<Object>,
  lastSelectRegion: Array<Object>,
  lastSortedIndex: number,
  sortedIndexMap: Array<number>,
  highWaterMark: number,
  columns: Array<Object>,
  columnsWidths: Array<number>
};

@inject(({ store }) => {
  const { topConnectionsPanel } = store;

  return {
    api: store.api,
    connections: topConnectionsPanel.payload,
    highWaterMark: topConnectionsPanel.highWaterMark,
    bLoading: topConnectionsPanel.bLoading
  };
})
@observer
export default class ConnectionsView extends React.Component<Props, State> {
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
      highWaterMark: 1,
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
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps && nextProps.connections && this.state.data !== nextProps.connections) {
      this.setState({
        data: nextProps.connections,
        lastSelectRegion: [
          {
            rows: [0, 0]
          }
        ]
      });
      if (this.state.lastSortedIndex >= 0 && this.state.columns) {
        const col = this.state.columns[this.state.lastSortedIndex];
        if (col && col.sortColumn) {
          this.sortColumn(this.state.lastSortedIndex, col.getSortFunction(), nextProps.connections);
        }
      }
    }
    if (
      nextProps &&
      nextProps.highWaterMark &&
      this.state.highWaterMark !== nextProps.highWaterMark
    ) {
      this.setState({ highWaterMark: nextProps.highWaterMark });
    }
    if (nextProps && nextProps.tableWidth) {
      const columnsWidths = columnsWidthsPercent.map(width => width * nextProps.tableWidth / 100);
      this.setState({ columnsWidths });
    }
  }

  getCellData = (
    rowIndex: number,
    columnIndex: number,
    bUseIndex: boolean = true,
    dataToSort: any = null
  ) => {
    const data = dataToSort == null ? this.state.data : dataToSort;
    if (bUseIndex) {
      const sortedRowIndex = this.state.sortedIndexMap[rowIndex];
      if (sortedRowIndex != null) {
        rowIndex = sortedRowIndex;
      }
    }
    let cellValue: any;
    if (data && data.length > 0) {
      const rowData = data[rowIndex];
      if (rowData) {
        switch (columnIndex) {
          case 0:
            cellValue = rowData.hasOwnProperty('connectionId') ? rowData.connectionId : '';
            break;
          case 1:
            cellValue = rowData.hasOwnProperty('appName') ? rowData.appName : '';
            break;
          case 2:
            cellValue = rowData.hasOwnProperty('client') ? rowData.client : '';
            break;
          case 3:
            cellValue = rowData.hasOwnProperty('lastNs') ? rowData.lastNs : '';
            break;
          case 4:
            cellValue = rowData.hasOwnProperty('lastOp') ? rowData.lastOp : '';
            break;
          case 5:
            cellValue = rowData.hasOwnProperty('lastCommand') ? rowData.lastCommand : '';
            break;
          case 6:
            cellValue = rowData.hasOwnProperty('us') ? rowData.us : '';
            break;
          case 7:
            cellValue = rowData.hasOwnProperty('us')
              ? _.pick(rowData, 'us')
              : { us: 0, highWaterMark: 1 };
            if (this.state.highWaterMark) {
              cellValue.highWaterMark = this.state.highWaterMark;
            }
            break;
          default:
            cellValue = '';
            break;
        }
      }
    }
    if (typeof cellValue === 'object') {
      cellValue = JSON.stringify(cellValue);
    }
    return cellValue;
  };

  @autobind
  sortColumn(columnIndex: number, comparator: (a: any, b: any) => number, dataToSort: any = null) {
    const data = dataToSort == null ? this.state.data : dataToSort;
    const sortedIndexMap = Utils.times(data.length, (i: number) => i);
    sortedIndexMap.sort((a: number, b: number) => {
      return comparator(
        this.getCellData(a, columnIndex, false, dataToSort),
        this.getCellData(b, columnIndex, false, dataToSort)
      );
    });
    this.setState({ sortedIndexMap, lastSortedIndex: columnIndex });
  }

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

  render() {
    const { connections } = this.props;

    const columns = this.state.columns.map(col => col.getColumn(this.getCellData, this.sortColumn));

    if (this.state.lastSelectRegion && this.state.lastSelectRegion.length > 0) {
      this.setSelection(this.state.lastSelectRegion[0]);
    }

    const loadingOptions = [];
    let numRows = 10;
    if (connections && connections.length > 0) {
      numRows = connections.length;
    } else {
      loadingOptions.push(TableLoadingOption.CELLS);
    }
    return (
      <div style={{ height: '100%' }}>
        <nav className="pt-navbar connectionsToolbar">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">Top Connections</div>
          </div>
          <div className="pt-navbar-group pt-align-right">
            <Tooltip
              className="btnTooltip pt-tooltip-indicator pt-tooltip-indicator-form"
              content="Reset High Water Mark"
              hoverOpenDelay={1000}
              inline
              intent={Intent.PRIMARY}
              position={Position.BOTTOM}
            >
              <Button
                className="reset-button pt-button pt-intent-primary"
                text="Reset HWM"
                onClick={this.props.api.resetTopConnectionsHWM}
              />
            </Tooltip>
            <Tooltip
              className="btnTooltip pt-tooltip-indicator pt-tooltip-indicator-form"
              content="Refresh Top Connections"
              hoverOpenDelay={1000}
              inline
              intent={Intent.PRIMARY}
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="refreshButton"
                loading={this.props.bLoading}
                onClick={this.props.api.getTopConnections}
              >
                <RefreshIcon width={50} height={50} className="dbKodaSVG" />
              </AnchorButton>
            </Tooltip>
          </div>
        </nav>
        <nav className="pt-navbar connectionsSubToolbar">
          <div className="pt-navbar-group pt-align-left">
            <label htmlFor="lblTCAuto">Refresh Top Connections</label>
            <div className="Switch">
              <Switch
                type="text"
                id="autoRefreshTopCon"
                defaultChecked={false}
                onChange={this.props.onAutoRefreshCheckboxToggle}
              />
            </div>
            <label htmlFor="lblTCPreTime">every</label>
            <NumericInput
              className="NumericInput"
              min={5}
              max={300}
              value={this.props.autoRefreshTimeout}
              onValueChange={this.props.onAutoRefreshTimeoutChange}
            />
            <label className="lblTCPostTime" htmlFor="lblTCPostTime">
              seconds
            </label>
          </div>
        </nav>
        <div style={{ height: 'calc(100% - 90px)' }}>
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
      </div>
    );
  }
}
