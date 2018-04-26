/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-17T11:41:04+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-17T15:32:20+10:00
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

import * as React from 'react';
// import { Menu, MenuItem } from '@blueprintjs/core';
import { Cell, Column, ColumnHeaderCell } from '@blueprintjs/table';
import { AnchorButton, Intent, Position, Tooltip } from '@blueprintjs/core';
import RemoveProfileIcon from '~/styles/icons/remove-profile-icon.svg';

export type ICellLookup = (rowIndex: number, columnIndex: number) => any;
export type ISortCallback = (columnIndex: number, comparator: (a: any, b: any) => number) => void;

export default class ActionsColumn {
  constructor(name: string, index: number, killAction: Function) {
    this.name = name;
    this.index = index;
    this.killAction = killAction; // should be a function with pId as param
  }

  getColumn(getCellData: ICellLookup) {
    const that = this;
    const cellRenderer = (rowIndex: number, columnIndex: number) => {
      const dataJson = getCellData(rowIndex, columnIndex);
      if (!dataJson) {
        return <Cell />;
      }
      const actionData = JSON.parse(dataJson);
      if (actionData.opId) {
        this.opId = actionData.opId;
      }
      if (!actionData.bDelete) {
        return <Cell />;
      }
      return (
        <Cell className="actionsColumnCell">
          <div className="actionToolbar">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('topConnections/operations/actionsColumn/deleteButtonTooltip')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton className="deleteButton" onClick={() => that.killAction(this.opId)}>
                <RemoveProfileIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
          </div>
        </Cell>
      );
    };
    const columnHeaderCellRenderer = () => <ColumnHeaderCell name={this.name} />;
    return (
      <Column
        cellRenderer={cellRenderer}
        columnHeaderCellRenderer={columnHeaderCellRenderer}
        key={this.index}
        name={this.name}
      />
    );
  }
}
