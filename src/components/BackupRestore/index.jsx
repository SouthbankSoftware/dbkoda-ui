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
import {action, computed, reaction} from 'mobx';
import DatabaseExport from './DatabaseExport';
import {BackupRestoreActions, DrawerPanes} from '../common/Constants';
import {featherClient} from '../../helpers/feathers';

@observer
@inject('store')
export class BackupRestore extends React.Component {

  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.state = {editorId: undefined, commandExecuting: false};
    reaction(
      () => this.props.store.treeActionPanel.treeActionEditorId,
      () => {
        this.setState({editorId: this.props.store.treeActionPanel.treeActionEditorId});
      });
  }

  @action
  close() {
    this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.store.treeActionPanel.treeActionEditorId) {
      this.setState({editorId: nextProps.store.treeActionPanel.treeActionEditorId});
    }
  }

  componentDidMount() {
    if (this.props.store.treeActionPanel.treeActionEditorId) {
      const editorId = this.props.store.treeActionPanel.treeActionEditorId;
      this.setState({editorId});
      featherClient().service('/os-execution').on('os-command-finish', () => {
        this.setState({commandExecuting: false});
      });
    }
  }

  @action.bound
  runEditorScript() {
    this.setState({commandExecuting: true});
    this.props.store.runEditorScript();
  }

  @computed get getAction() {
    const {store} = this.props;
    const treeAction = store.treeActionPanel.treeAction;
    const treeNode = store.treeActionPanel.treeNode;
    const selectedProfile = this.props.store.profileList.selectedProfile;

    const treeEditors = this.props.store.treeActionPanel.editors.entries();
    let treeEditor;
    for (const editor of treeEditors) {
      if (editor[1].id == this.state.editorId) {
        treeEditor = editor[1];
        break;
      }
    }
    console.log('tree node:', treeNode);
    if (treeAction === BackupRestoreActions.EXPORT_DATABASE) {
      return (<DatabaseExport treeAction={treeAction} treeNode={treeNode} close={this.close} profile={selectedProfile}
        isActiveExecuting={this.state.commandExecuting}
        treeEditor={treeEditor} action={treeAction} runEditorScript={this.runEditorScript} />);
    } else if (treeAction === BackupRestoreActions.EXPORT_COLLECTION) {
      return (<DatabaseExport treeAction={treeAction} treeNode={treeNode} close={this.close} profile={selectedProfile}
        isActiveExecuting={this.state.commandExecuting}
        treeEditor={treeEditor} action={treeAction} runEditorScript={this.runEditorScript} />);
    }
    return null;
  }

  render() {
    return (<div className="backup-restore-panel">{this.getAction}</div>);
  }
}
