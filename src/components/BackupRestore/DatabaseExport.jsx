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
import os from 'os';
import {Button} from '@blueprintjs/core';

import {ButtonPanel} from './ButtonPanel';
import './DatabaseExport.scss';
import CollectionList from './CollectionList';
import {BackupRestoreActions} from '../common/Constants';
import {AllCollectionOption, DumpOptions, ExportDBOptions, ImportOptions, RestoreOptions, } from './Options';
import {generateCode, getCommandObject} from './CodeGenerator';
import {getDialogProperites, isImportAction, isRestoreAction} from './Utils';

const {dialog, BrowserWindow} = IS_ELECTRON
  ? window.require('electron').remote
  : {};

export default class DatabaseExport extends React.Component {
  constructor(props) {
    super(props);
    this.selectCollection = this.selectCollection.bind(this);
    this.unSelectCollection = this.unSelectCollection.bind(this);
    this.executing = this.executing.bind(this);
    this.state = {
      collections: [],
      allCollections: true,
      selectedCollections: [],
      exportType: {selected: 'json', options: ['json', 'csv']},
      directoryPath: '',
      jsonArray: false,
      gzip: false,
      pretty: false,
      db: '',
      collection: '',
      numParallelCollections: 4,
      mode: {selected: 'insert', options: ['insert', 'upsert', 'merge']},
      parseGrace: {
        selected: 'stop',
        options: ['autoCast', 'skipField', 'skipRow', 'stop'],
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.editor || this.state.collections.length === 0) {
      const collections = nextProps.collections ? nextProps.collections : [];
      this.setState({collections, editor: nextProps.treeEditor});
    }
    if (nextProps.db && !this.state.db) {
      this.setState({db: nextProps.db});
    }
  }

  componentDidMount() {
    const {
      treeAction,
      db,
      collection,
      treeEditor,
      treeNode,
      profile,
    } = this.props;
    this.setState({
      db,
      collection,
      treeAction,
      editor: treeEditor,
      ssl: profile.ssl,
    });
    if (
      treeAction === BackupRestoreActions.EXPORT_COLLECTION ||
      treeAction === BackupRestoreActions.DUMP_COLLECTION ||
      treeAction === BackupRestoreActions.IMPORT_COLLECTION
    ) {
      const collection = treeNode.text;
      const sc = this.state.selectedCollections;
      sc.push(collection);
      this.setState({selectedCollections: sc, allCollections: false});
    }
    if (
      treeAction === BackupRestoreActions.RESTORE_COLLECTION ||
      treeAction === BackupRestoreActions.IMPORT_COLLECTION
    ) {
      this.setState({collection: treeNode.text});
    }
  }

  updateEditorCode() {
    if (this.state.editor && this.state.editor.doc.cm) {
      const generatedCode = generateCode({
        treeNode: this.props.treeNode,
        profile: this.props.profile,
        state: this.state,
        action: this.props.treeAction,
      });
      const currentCode = this.state.editor.doc.cm.getValue();
      if (currentCode !== generatedCode) {
        this.state.editor.doc.cm.setValue(generatedCode);
      }
    }
  }

  openFile(action) {
    const properties = getDialogProperites(action);
    dialog.showOpenDialog(
      BrowserWindow.getFocusedWindow(),
      {
        properties,
      },
      (fileNames) => {
        if (!fileNames || fileNames.length == 0) {
          return;
        }
        const f = fileNames[0];
        this.setPathValue(f, action);
      },
    );
  }

  setPathValue(f, action) {
    if (action === BackupRestoreActions.DUMP_COLLECTION || action === BackupRestoreActions.DUMP_DATABASE
      || action === BackupRestoreActions.DUMP_SERVER || action === BackupRestoreActions.EXPORT_COLLECTION
      || action === BackupRestoreActions.EXPORT_DATABASE) {
      console.log('platform ', os.release());
      f = os.release().indexOf('Windows') >= 0 ? f + '\\dump' : f + '/dump';
    }

    this.setState({directoryPath: f});
  }

  selectCollection(collection, i) {
    if (collection === globalString('backuprestore/selectCollection')) {
      this.unSelectCollection(i);
      return;
    }
    const selected = this.state.selectedCollections;
    if (i < 0) {
      selected.push(collection);
    } else {
      selected.splice(i, 1, collection);
    }
    this.setState({selectedCollections: selected});
  }

  unSelectCollection(collection) {
    const selected = this.state.selectedCollections;
    selected.splice(selected.indexOf(collection), 1);
    this.setState({selectedCollections: selected});
  }

  /**
   * whether the execute button can be clicked
   *
   * @returns {*}
   */
  isExecutable() {
    if (isRestoreAction(this.props.treeAction)) {
      return this.state.directoryPath;
    }
    const commandObject = getCommandObject({
      treeNode: this.props.treeNode,
      profile: this.props.profile,
      state: this.state,
      action: this.props.treeAction,
    });
    return commandObject.length > 0 && this.state.directoryPath;
  }

  executing() {
    this.props.runEditorScript();
  }

  getOptions() {
    const {treeAction} = this.props;
    switch (treeAction) {
      case BackupRestoreActions.EXPORT_DATABASE:
      case BackupRestoreActions.EXPORT_COLLECTION:
        return (
          <ExportDBOptions
            ssl={this.state.ssl}
            allCollections={this.state.allCollections}
            pretty={this.state.pretty}
            jsonArray={this.state.jsonArray}
            changeSSL={() => this.setState({ssl: !this.state.ssl})}
            changePretty={() => this.setState({pretty: !this.state.pretty})}
            changeJsonArray={() =>
              this.setState({jsonArray: !this.state.jsonArray})}
            changeAllCollections={() =>
              this.setState({allCollections: !this.state.allCollections})}
            changeNoHeaderLine={() =>
              this.setState({noHeaderLine: !this.state.noHeaderLine})}
            noHeaderLine={this.state.noHeaderLine}
            changeExportType={(e) => {
              const {exportType} = this.state;
              exportType.selected = e;
              this.setState({exportType});
            }}
            exportType={this.state.exportType}
            outputFields={this.state.outputFields}
            changeOutputFields={e => this.setState({outputFields: e})}
            query={this.state.query}
            changeQuery={e => this.setState({query: e})}
            readPreference={this.state.readPreference}
            changeReadPreference={e => this.setState({readPreference: e})}
            forceTableScan={this.state.forceTableScan}
            changeForceTableScan={() =>
              this.setState({forceTableScan: !this.state.forceTableScan})}
            limit={this.state.limit}
            changeLimit={e => this.setState({limit: e})}
            exportSort={this.state.exportSort}
            changeExportSort={e => this.setState({exportSort: e})}
            skip={this.state.skip}
            changeSkip={e => this.setState({skip: e})}
            assertExists={this.state.assertExists}
            changeAssertExists={() =>
              this.setState({assertExists: !this.state.assertExists})}
          />
        );
      case BackupRestoreActions.DUMP_DATABASE:
      case BackupRestoreActions.DUMP_COLLECTION:
      case BackupRestoreActions.DUMP_SERVER:
        return (
          <DumpOptions
            ssl={this.state.ssl}
            allCollections={this.state.allCollections}
            gzip={this.state.gzip}
            changeSSL={() => this.setState({ssl: !this.state.ssl})}
            changeGZip={() => this.setState({gzip: !this.state.gzip})}
            repair={this.state.repair}
            changeRepair={() => this.setState({repair: !this.state.repair})}
            dumpDbUsersAndRoles={this.state.dumpDbUsersAndRoles}
            changeViewsAsCollections={() =>
              this.setState({
                viewsAsCollections: !this.state.viewsAsCollections,
              })}
            viewsAsCollections={this.state.viewsAsCollections}
            changeDumpDbUsersAndRoles={() => {
              if (!this.state.dumpDbUsersAndRoles) {
                // when turn on viewsAsCollections, unselect all collection
                this.setState({allCollections: false});
              }
              this.setState({
                dumpDbUsersAndRoles: !this.state.dumpDbUsersAndRoles,
              });
            }}
            changeAllCollections={() => {
              if (!this.state.allCollections) {
                // when turn on all collections, unselect viewsAsCollections
                this.setState({dumpDbUsersAndRoles: false});
              }
              this.setState({allCollections: !this.state.allCollections});
            }}
            numParallelCollections={this.state.numParallelCollections}
            changeNumParallelCollections={e =>
              this.setState({numParallelCollections: e})}
            readPreference={this.state.readPreference}
            changeReadPreference={e => this.setState({readPreference: e})}
            forceTableScan={this.state.forceTableScan}
            changeForceTableScan={() =>
              this.setState({forceTableScan: !this.state.forceTableScan})}
            query={this.state.query}
            changeQuery={e => this.setState({query: e})}
          />
        );
      case BackupRestoreActions.RESTORE_SERVER:
      case BackupRestoreActions.RESTORE_DATABASE:
      case BackupRestoreActions.RESTORE_COLLECTION:
        return (
          <RestoreOptions
            ssl={this.state.ssl}
            changeSSL={() => this.setState({ssl: !this.state.ssl})}
            drop={this.state.drop}
            changeDrop={() => this.setState({drop: !this.state.drop})}
            dryRun={this.state.dryRun}
            changeDryRun={() => this.setState({dryRun: !this.state.dryRun})}
            writeConcern={this.state.writeConcern}
            changeWriteConcern={e => this.setState({writeConcern: e})}
            noIndexRestore={this.state.noIndexRestore}
            changeNoIndexRestore={() =>
              this.setState({noIndexRestore: !this.state.noIndexRestore})}
            noOptionsRestore={this.state.noOptionsRestore}
            changeNoOptionsRestore={() =>
              this.setState({noOptionsRestore: !this.state.noOptionsRestore})}
            keepIndexVersion={this.state.keepIndexVersion}
            changeKeepIndexVersion={() =>
              this.setState({keepIndexVersion: !this.state.keepIndexVersion})}
            maintainInsertionOrder={this.state.maintainInsertionOrder}
            changeMaintainInsertionOrder={() =>
              this.setState({
                maintainInsertionOrder: !this.state.maintainInsertionOrder,
              })}
            numParallelCollections={this.state.numParallelCollections}
            changeNumParallelCollections={e =>
              this.setState({numParallelCollections: e})}
            numInsertionWorkersPerCollection={
              this.state.numInsertionWorkersPerCollection
            }
            changeNumInsertionWorkersPerCollection={e =>
              this.setState({numInsertionWorkersPerCollection: e})}
            stopOnError={this.state.stopOnError}
            changeStopOnError={() =>
              this.setState({stopOnError: !this.state.stopOnError})}
            bypassDocumentValidation={this.state.bypassDocumentValidation}
            changeBypassDocumentValidation={() =>
              this.setState({
                bypassDocumentValidation: !this.state.bypassDocumentValidation,
              })}
            objcheck={this.state.objcheck}
            changeObjcheck={() =>
              this.setState({objcheck: !this.state.objcheck})}
            oplogReplay={this.state.oplogReplay}
            changeOplogReplay={() =>
              this.setState({oplogReplay: !this.state.oplogReplay})}
            oplogLimit={this.state.oplogLimit}
            changeOplogLimit={e => this.setState({oplogLimit: e})}
            restoreDbUsersAndRoles={this.state.restoreDbUsersAndRoles}
            changeRestoreDbUsersAndRoles={() =>
              this.setState({
                restoreDbUsersAndRoles: !this.state.restoreDbUsersAndRoles,
              })}
            gzip={this.state.gzip}
            changeGzip={() => this.setState({gzip: !this.state.gzip})}
          />
        );
      case BackupRestoreActions.IMPORT_COLLECTION:
      case BackupRestoreActions.IMPORT_DATABASE:
        return (
          <ImportOptions
            outputFields={this.state.outputFields}
            changeOutputFields={e => this.setState({outputFields: e})}
            headerLine={this.state.headerLine}
            changeHeaderLine={() =>
              this.setState({headerLine: !this.state.headerLine})}
            jsonArray={this.state.jsonArray}
            changeJsonArray={() =>
              this.setState({jsonArray: !this.state.jsonArray})}
            parseGrace={this.state.parseGrace}
            changeParseGrace={(e) => {
              const {parseGrace} = this.state;
              parseGrace.selected = e;
              this.setState({parseGrace});
            }}
            exportType={this.state.exportType}
            changeExportType={(e) => {
              const {exportType} = this.state;
              exportType.selected = e;
              this.setState({exportType});
            }}
            columnsHaveTypes={this.state.columnsHaveTypes}
            changeColumnsHaveTypes={e => this.setState({columnsHaveTypes: e})}
            drop={this.state.drop}
            changeDrop={() => this.setState({drop: !this.state.drop})}
            ignoreBlanks={this.state.ignoreBlanks}
            changeIgnoreBlanks={() =>
              this.setState({ignoreBlanks: !this.state.ignoreBlanks})}
            maintainInsertionOrder={this.state.maintainInsertionOrder}
            changeMaintainInsertionOrder={() =>
              this.setState({
                maintainInsertionOrder: !this.state.maintainInsertionOrder,
              })}
            numInsertionWorkers={this.state.numInsertionWorkers}
            changeNumInsertionWorkers={() =>
              this.setState({
                numInsertionWorkers: !this.state.numInsertionWorkers,
              })}
            stopOnError={this.state.stopOnError}
            changeStopOnError={() =>
              this.setState({stopOnError: !this.state.stopOnError})}
            mode={this.state.mode}
            changeMode={(e) => {
              const {mode} = this.state;
              mode.selected = e;
              this.setState({mode});
            }}
            upsertFields={this.state.upsertFields}
            changeUpsertFields={e => this.setState({upsertFields: e})}
            changeWriteConcern={e => this.setState({writeConcern: e})}
            writeConcern={this.state.writeConcern}
            bypassDocumentValidation={this.state.bypassDocumentValidation}
            changeBypassDocumentValidation={() =>
              this.setState({
                bypassDocumentValidation: !this.state.bypassDocumentValidation,
              })}
          />
        );
      default:
        return null;
    }
  }

  getComponentTitle() {
    switch (this.props.treeAction) {
      case BackupRestoreActions.EXPORT_DATABASE:
      case BackupRestoreActions.EXPORT_COLLECTION:
      case BackupRestoreActions.EXPORT_SERVER:
        return globalString('backuprestore/mongoExport');
      case BackupRestoreActions.DUMP_COLLECTION:
      case BackupRestoreActions.DUMP_DATABASE:
      case BackupRestoreActions.DUMP_SERVER:
        return globalString('backuprestore/mongoDump');
      case BackupRestoreActions.RESTORE_SERVER:
      case BackupRestoreActions.RESTORE_COLLECTION:
      case BackupRestoreActions.RESTORE_DATABASE:
        return globalString('backuprestore/mongoRestore');
      case BackupRestoreActions.IMPORT_DATABASE:
      case BackupRestoreActions.IMPORT_COLLECTION:
        return globalString('backuprestore/mongoImport');
      default:
        return '';
    }
  }

  getDatabaseFieldComponent() {
    const {db} = this.props;
    if (
      this.props.treeAction === BackupRestoreActions.DUMP_COLLECTION ||
      this.props.treeAction === BackupRestoreActions.DUMP_DATABASE ||
      this.props.treeAction === BackupRestoreActions.EXPORT_COLLECTION ||
      this.props.treeAction === BackupRestoreActions.RESTORE_SERVER ||
      this.props.treeAction === BackupRestoreActions.RESTORE_DATABASE ||
      this.props.treeAction === BackupRestoreActions.RESTORE_COLLECTION ||
      this.props.treeAction === BackupRestoreActions.IMPORT_DATABASE ||
      this.props.treeAction === BackupRestoreActions.IMPORT_COLLECTION ||
      this.props.treeAction === BackupRestoreActions.EXPORT_DATABASE
    ) {
      let readOnly = true;
      if (this.props.treeAction === BackupRestoreActions.RESTORE_SERVER) {
        readOnly = false;
      }
      return (
        <div>
          <label className="pt-label database" htmlFor="database">
            {globalString('backuprestore/parameters/db/label')}
          </label>
          <div className="pt-form-content">
            <input
              className="pt-input db-backup-input db-backup-database-input"
              readOnly={readOnly}
              type="text"
              dir="auto"
              value={db}
              onChange={e => this.setState({db: e.target.value})}
            />
          </div>
        </div>
      );
    }
  }

  /**
   * get the save file path label for different actions
   */
  getFilePathLabel(action) {
    if (isRestoreAction(action) || isImportAction(action)) {
      return globalString('backuprestore/openFilePath');
    }
    return globalString('backuprestore/filePath');
  }

  render() {
    const {treeAction} = this.props;
    this.updateEditorCode();
    return (
      <div className="database-export-panel">
        <h3 className="form-title">
          {this.getComponentTitle()}
        </h3>
        <div className="pt-form-group">
          {this.getDatabaseFieldComponent()}
          {(treeAction === BackupRestoreActions.RESTORE_DATABASE ||
            treeAction === BackupRestoreActions.RESTORE_COLLECTION ||
            treeAction === BackupRestoreActions.IMPORT_COLLECTION ||
            treeAction === BackupRestoreActions.IMPORT_DATABASE) &&
            <div style={{marginBottom: 20}}>
              <label className="pt-label database" htmlFor="database">
                {globalString('backuprestore/collection')}
              </label>
              <div className="pt-form-content">
                <input
                  className="pt-input db-backup-collection-input"
                  type="text"
                  dir="auto"
                  readOnly={
                  treeAction === BackupRestoreActions.RESTORE_COLLECTION
                }
                  value={this.state.collection}
                  onChange={e => this.setState({collection: e.target.value})}
              />
              </div>
            </div>}
          <label className="pt-label database" htmlFor="database">
            {this.getFilePathLabel(treeAction)}
          </label>
          <div className="pt-form-content">
            <input
              className="pt-input path-input db-backup-path-input"
              type="text"
              onChange={e => this.setState({'directoryPath': e.target.value})}
              value={this.state.directoryPath}
            />
            <Button
              className="browse-directory"
              onClick={() => this.openFile(treeAction)}
            >
              {globalString('backuprestore/chooseDirectory')}
            </Button>
          </div>
          <label
            className={this.state.directoryPath ? 'hide' : 'warning'}
            htmlFor="database"
          >
            {globalString('backuprestore/requiredWarning')}
          </label>
        </div>
        <div style={{overflowY: 'auto'}}>
          {treeAction !== BackupRestoreActions.EXPORT_COLLECTION &&
          treeAction !== BackupRestoreActions.DUMP_COLLECTION &&
          treeAction !== BackupRestoreActions.RESTORE_COLLECTION &&
          treeAction !== BackupRestoreActions.RESTORE_DATABASE &&
          treeAction !== BackupRestoreActions.RESTORE_SERVER &&
          treeAction !== BackupRestoreActions.IMPORT_COLLECTION &&
          <AllCollectionOption
            allCollections={this.state.allCollections}
            action={treeAction}
            changeAllCollections={() => {
              if (!this.state.allCollections) {
                // when turn on all collections, unselect viewsAsCollections
                this.setState({dumpDbUsersAndRoles: false});
              }
              this.setState({allCollections: !this.state.allCollections});
            }}
          />}
          {!this.state.allCollections &&
          !this.state.dumpDbUsersAndRoles &&
          treeAction !== BackupRestoreActions.IMPORT_COLLECTION &&
          treeAction !== BackupRestoreActions.IMPORT_DATABASE
            ? <CollectionList
              collections={this.state.collections}
              readOnly={
                treeAction === BackupRestoreActions.EXPORT_COLLECTION ||
                treeAction === BackupRestoreActions.DUMP_COLLECTION ||
                treeAction === BackupRestoreActions.IMPORT_COLLECTION ||
                treeAction === BackupRestoreActions.IMPORT_DATABASE
              }
              target={
                treeAction === BackupRestoreActions.DUMP_SERVER
                  ? 'server'
                  : 'database'
              }
              selectCollection={this.selectCollection}
              unSelectCollection={this.unSelectCollection}
              selectedCollections={this.state.selectedCollections}
            />
            : null}
          {this.getOptions()}
        </div>
        <ButtonPanel
          close={this.props.close}
          enableConfirm={this.isExecutable()}
          executing={this.executing}
        />
      </div>
    );
  }
}
