/*
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
/**
 * Created by joey on 19/7/17.
 */

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, computed} from 'mobx';
import DatabaseExport from './DatabaseExport';
import {BackupRestoreActions, DrawerPanes} from '../common/Constants';

@observer
@inject('store')
export class BackupRestore extends React.Component {

  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
  }

  @action
  close() {
    this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
  }

  @computed get getAction() {
    const {store} = this.props;
    const treeAction = store.treeActionPanel.treeAction;
    const treeNode = store.treeActionPanel.treeNode;
    console.log('tree action ', treeAction, treeNode);
    if (treeAction === BackupRestoreActions.EXPORT_DATABASE) {
      return (<DatabaseExport treeAction={treeAction} treeNode={treeNode} close={this.close} />);
    }
    return null;
  }

  render() {
    return (<div className="backup-restore-panel">{this.getAction}</div>);
  }
}
