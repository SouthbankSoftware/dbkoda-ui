/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-04-10T14:34:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-10T16:29:54+10:00
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
 import { inject, observer } from 'mobx-react';
 import { action } from 'mobx';
 import { Cell, Column, SelectionModes, Table } from '@blueprintjs/table';

 @inject(allStores => ({
   store: allStores.store,
   api: allStores.store.api
 }))
 @observer
 export default class ConnectionsView extends React.Component<Props> {
   constructor() {
     super();
     this.state = {
       lastSelectRegion: null
     };
   }
   @action
   onSelection(region) {
     console.log('region:', region);
     if (region.length == 0) {
       return;
     }
     this.setState({ lastSelectRegion: region });
   }
   render() {
     const {store} = this.props;
     const {topConnectionsPanel} = store;
     const connections = topConnectionsPanel.payload;

     const renderCell = (rowIndex: number, columnIndex: number) => {
       let columnName = '';
       switch (columnIndex) {
         case 0:
          columnName = 'connectionId';
         break;
         case 1:
          columnName = 'appName';
         break;
         case 2:
          columnName = 'client';
         break;
         case 3:
          columnName = 'lastNs';
         break;
         case 4:
          columnName = 'lastOp';
         break;
         case 5:
          columnName = 'lastCommand';
         break;
         case 6:
          columnName = 'us';
         break;
         default:
         columnName = 'connectionId';
         break;
       }
       return (
         <Cell>
           <p>{connections[rowIndex][columnName]}</p>
         </Cell>
       );
     };
     return (
       <div>
         {connections && connections.length && (
           <Table
             enableMultipleSelection={false}
             numRows={connections.length}
             enableRowHeader={false}
             selectionModes={SelectionModes.ROWS_ONLY}
             enableColumnResizing={false}
             bodyContextMenuRenderer={this.renderBodyContextMenu}
             enableRowResizing={false}
             defaultColumnWidth={100}
             defaultRowHeight={60}
             onSelection={region => this.onSelection(region)}
             selectedRegions={this.state.lastSelectRegion}
           >
             <Column name="Connection Id" cellRenderer={renderCell} />
             <Column name="appName" cellRenderer={renderCell} />
             <Column name="client" cellRenderer={renderCell} />
             <Column name="lastNs" cellRenderer={renderCell} />
             <Column name="lastOp" cellRenderer={renderCell} />
             <Column name="lastCommand" cellRenderer={renderCell} />
             <Column name="Sampled μs" cellRenderer={renderCell} />
           </Table>
         )}
       </div>
     );
   }
 }
