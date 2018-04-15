/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-13T15:54:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-13T16:39:15+10:00
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
 import { Menu, MenuItem } from '@blueprintjs/core';
 import { Cell, Column, ColumnHeaderCell } from '@blueprintjs/table';

 import ProgressBar from './ProgressBar';

 export type ICellLookup = (rowIndex: number, columnIndex: number) => any;
 export type ISortCallback = (
   columnIndex: number,
   comparator: (a: any, b: any) => number
 ) => void;

 export default class ProgressBarColumn {
   constructor(name: string, key: string, index: number) {
     this.name = name;
     this.key = key;
     this.index = index;
   }

   getColumn(getCellData: ICellLookup, sortColumn: ISortCallback) {
     const cellRenderer = (rowIndex: number, columnIndex: number) => {
       const dataJson = getCellData(rowIndex, columnIndex);
       if (!dataJson) {
         return <Cell />;
       }
       let data = JSON.parse(dataJson);
       const waterMark = data.highWaterMark;
       data = _.pick(data, this.key);
       return <Cell className="progressBarCell"><ProgressBar waterMark={waterMark} value={data} unit={this.key} /></Cell>;
     };
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
