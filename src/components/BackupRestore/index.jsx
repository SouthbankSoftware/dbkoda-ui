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
import { inject, observer } from 'mobx-react';
import { action, computed, reaction } from 'mobx';
// import {Intent} from '@blueprintjs/core';
// import { NewToaster } from '../common/Toaster';
import DatabaseExport from './DatabaseExport';
import { BackupRestoreActions, DrawerPanes } from '../common/Constants';
import { featherClient } from '../../helpers/feathers';
import { isCollectionAction, isDatabaseAction } from './Utils';

@observer
@inject('store')
export class BackupRestore extends React.Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.state = { editorId: undefined, commandExecuting: false };
    reaction(
      () => this.props.store.treeActionPanel.treeActionEditorId,
      () => {
        const editorId = this.props.store.treeActionPanel.treeActionEditorId;
        const editor = this.getEditorById(editorId);
        this.fetchCollectionlist(editor);
        this.setState({ editorId });
      },
    );
  }

  @action
  close() {
    this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
  }

  componentWillReceiveProps(nextProps) {
    const { store } = this.props;
    const treeAction = store.treeActionPanel.treeAction;
    if (nextProps.store.treeActionPanel.treeActionEditorId) {
      if (
        !this.state.editorId ||
        ((treeAction === BackupRestoreActions.DUMP_DATABASE ||
          treeAction === BackupRestoreActions.EXPORT_DATABASE) &&
          !this.state.collections)
      ) {
        this.setState({
          editorId: nextProps.store.treeActionPanel.treeActionEditorId,
        });
        const editor = this.getEditorById(
          nextProps.store.treeActionPanel.treeActionEditorId,
        );
        this.fetchCollectionlist(editor);
      }
    }
  }

  componentDidMount() {
    if (
      this.props.store.treeActionPanel.treeActionEditorId &&
      !this.state.editorId
    ) {
      const editorId = this.props.store.treeActionPanel.treeActionEditorId;
      this.setState({ editorId });
      const editor = this.getEditorById(editorId);
      this.fetchCollectionlist(editor);
      featherClient()
        .service('/os-execution')
        .on('os-command-finish', (output) => {
          this.setState({ commandExecuting: false });
          console.log('get backup command ', output);
          // if (output.code !== 0) {
          //   NewToaster.show({
          //             message: globalString('backuprestore/executionOSScriptFailed'),
          //             intent: Intent.DANGER,
          //             iconName: 'pt-icon-thumbs-down'
          //           });
          // }
        });
    }
  }

  @action.bound
  runEditorScript() {
    this.setState({ commandExecuting: true });
    this.props.store.runEditorScript();
  }

  getSelectedDatabase() {
    const { store } = this.props;
    const treeAction = store.treeActionPanel.treeAction;
    const treeNode = store.treeActionPanel.treeNode;
    let db;
    let collection = null;
    if (isCollectionAction(treeAction)) {
      db = treeNode.refParent.text;
      collection = treeNode.text;
    } else if (isDatabaseAction(treeAction)) {
      db = treeNode.text;
    }
    return { db, collection };
  }

  fetchCollectionlist(editor) {
    const action = this.props.store.treeActionPanel.treeAction;
    const selectedProfile = this.props.store.profileList.selectedProfile;
    if (editor && !this.state.collections) {
      this.setState({ editor });
      if (
        action === BackupRestoreActions.DUMP_COLLECTION ||
        action === BackupRestoreActions.DUMP_DATABASE ||
        action === BackupRestoreActions.EXPORT_DATABASE
      ) {
        const db = this.getSelectedDatabase().db;
        featherClient()
          .service('/mongo-sync-execution')
          .update(selectedProfile.id, {
            shellId: editor.shellId,
            commands: `db.getSiblingDB("${db}").getCollectionNames()`,
          })
          .then((res) => {
            console.log('get collection res ', res);
            this.setState({ collections: JSON.parse(res) });
          });
      }
      if (action === BackupRestoreActions.DUMP_SERVER) {
        featherClient()
          .service('/mongo-sync-execution')
          .update(selectedProfile.id, {
            shellId: editor.shellId,
            commands: 'db.adminCommand({listDatabases: 1})',
          })
          .then((res) => {
            console.log('get collection res ', res);
            const dbs = JSON.parse(res).databases;
            const dbNames = dbs.map((db) => {
              return db.name;
            });
            this.setState({ collections: dbNames });
          });
      }
    }
  }

  getEditorById(editorId) {
    const treeEditors = this.props.store.treeActionPanel.editors.entries();
    let treeEditor;
    for (const editor of treeEditors) {
      if (editor[1].id == editorId) {
        treeEditor = editor[1];
        break;
      }
    }
    return treeEditor;
  }

  @computed
  get getAction() {
    const { store } = this.props;
    const treeAction = store.treeActionPanel.treeAction;
    const treeNode = store.treeActionPanel.treeNode;
    const selectedProfile = this.props.store.profileList.selectedProfile;
    const treeEditor = this.getEditorById(this.state.editorId);
    const { db, collection } = this.getSelectedDatabase();
    // if (treeAction === BackupRestoreActions.EXPORT_DATABASE || treeAction === BackupRestoreActions.EXPORT_COLLECTION
    //   || treeAction === BackupRestoreActions.DUMP_DATABASE || treeAction === BackupRestoreActions.DUMP_COLLECTION
    //   || treeAction === BackupRestoreActions.DUMP_SERVER || treeAction === BackupRestoreActions.EXPORT_SERVER) {
    return (
      <DatabaseExport
        treeAction={treeAction}
        treeNode={treeNode}
        close={this.close}
        profile={selectedProfile}
        isActiveExecuting={this.state.commandExecuting}
        db={db}
        collections={this.state.collections}
        colection={collection}
        treeEditor={treeEditor}
        action={treeAction}
        runEditorScript={this.runEditorScript}
      />
    );
    // }
    // return null;
  }

  render() {
    return (
      <div className="backup-restore-panel">
        {this.getAction}
      </div>
    );
  }
}
