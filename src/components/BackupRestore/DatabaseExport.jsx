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
import {Button} from '@blueprintjs/core';

import {ButtonPanel} from './ButtonPanel';
import './DatabaseExport.scss';
import CollectionList from './CollectionList';
import {BackupRestoreActions} from '../common/Constants';
import {ExportDBOptions, DumpOptions, AllCollectionOption} from './Options';
import {getCommandObject, generateCode} from './CodeGenerator';

const { dialog, BrowserWindow } = IS_ELECTRON
  ? window.require('electron').remote
  : {};

export default class DatabaseExport extends React.Component {

  constructor(props) {
    super(props);
    this.selectCollection = this.selectCollection.bind(this);
    this.unSelectCollection = this.unSelectCollection.bind(this);
    this.executing = this.executing.bind(this);
    this.state = {collections: [], ssl: false, allCollections: true, selectedCollections: [], exportType:{selected:'json', options:['json', 'csv']},
      directoryPath: '', jsonArray: false, pretty: false, db:'', collection: '', numParallelCollections: 4};
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
    const {treeAction, db, collection, treeEditor, treeNode} = this.props;
    this.setState({db, collection, treeAction, editor: treeEditor});
    if (treeAction === BackupRestoreActions.EXPORT_COLLECTION || treeAction === BackupRestoreActions.DUMP_COLLECTION) {
      const collection = treeNode.text;
      const sc = this.state.selectedCollections;
      sc.push(collection);
      this.setState({selectedCollections: sc, allCollections: false});
    }
  }

  updateEditorCode() {
    if (this.state.editor && this.state.editor.doc.cm) {
      const generatedCode = generateCode({treeNode: this.props.treeNode, profile: this.props.profile, state: this.state, action: this.props.treeAction});
      const currentCode = this.state.editor.doc.cm.getValue();
      if (currentCode !== generatedCode) {
        this.state.editor.doc.cm.setValue(generatedCode);
      }
    }
  }

  openFile() {
    dialog.showOpenDialog(
      BrowserWindow.getFocusedWindow(),
      {
        properties: ['openDirectory'],
      },
      (fileNames) => {
        if (!fileNames || fileNames.length == 0) {
          return;
        }
        this.setState({directoryPath: fileNames[0]});
      },
    );
  }

  selectCollection(collection, i) {
    if (collection === globalString('backup/database/selectCollection')) {
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

  isExecutable() {
    const commandObject = getCommandObject({treeNode: this.props.treeNode, profile: this.props.profile, state: this.state, action: this.props.treeAction});
    return commandObject.length > 0 && this.state.directoryPath && !this.props.isActiveExecuting;
  }

  executing() {
    this.props.runEditorScript();
  }

  getOptions() {
    const {treeAction} = this.props;
    switch (treeAction) {
      case BackupRestoreActions.EXPORT_DATABASE:
      case BackupRestoreActions.EXPORT_COLLECTION:
        return (<ExportDBOptions ssl={this.state.ssl} allCollections={this.state.allCollections} pretty={this.state.pretty} jsonArray={this.state.jsonArray}
          changeSSL={() => this.setState({ssl: !this.state.ssl})}
          changePretty={() => this.setState({pretty: !this.state.pretty})}
          changeJsonArray={() => this.setState({jsonArray: !this.state.jsonArray})}
          changeAllCollections={() => this.setState({allCollections: !this.state.allCollections})}
          changeNoHeaderLine={() => this.setState({noHeaderLine: !this.state.noHeaderLine})}
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
          changeForceTableScan={() => this.setState({forceTableScan: !this.state.forceTableScan})}
          limit={this.state.limit}
          changeLimit={e => this.setState({limit: e})}
          exportSort={this.state.exportSort}
          changeExportSort={e => this.setState({exportSort: e})}
          skip={this.state.skip}
          changeSkip={e => this.setState({skip: e})}
          assertExists={this.state.assertExists}
          changeAssertExists={() => this.setState({assertExists: !this.state.assertExists})}
         />);
      // case BackupRestoreActions.EXPORT_COLLECTION:
      //   return (<ExportCollectionOptions ssl={this.state.ssl} pretty={this.state.pretty} jsonArray={this.state.jsonArray}
      //     changeSSL={() => this.setState({ssl: !this.state.ssl})}
      //     changePretty={() => this.setState({pretty: !this.state.pretty})}
      //     changeJsonArray={() => this.setState({jsonArray: !this.state.jsonArray})}
      //   />);
      case BackupRestoreActions.DUMP_DATABASE:
      case BackupRestoreActions.DUMP_COLLECTION:
        return (<DumpOptions ssl={this.state.ssl}
          allCollections={this.state.allCollections}
          gzip={this.state.gzip}
          changeSSL={() => this.setState({ssl: !this.state.ssl})}
          changeGZip={() => this.setState({gzip: !this.state.gzip})}
          repair={this.state.repair}
          changeRepair={() => this.setState({repair: !this.state.repair})}
          dumpDbUsersAndRoles={this.state.dumpDbUsersAndRoles}
          changeViewsAsCollections={() => this.setState({viewsAsCollections: !this.state.viewsAsCollections})}
          viewsAsCollections={this.state.viewsAsCollections}
          changeDumpDbUsersAndRoles={() => {
            if (!this.state.dumpDbUsersAndRoles) {
              // when turn on viewsAsCollections, unselect all collection
              this.setState({allCollections: false});
            }
            this.setState({dumpDbUsersAndRoles: !this.state.dumpDbUsersAndRoles});
          }}
          changeAllCollections={() => {
            if (!this.state.allCollections) {
              // when turn on all collections, unselect viewsAsCollections
              this.setState({dumpDbUsersAndRoles: false});
            }
            this.setState({allCollections: !this.state.allCollections});
          }}
          numParallelCollections={this.state.numParallelCollections}
          changeNumParallelCollections={e => this.setState({numParallelCollections: e})}
          readPreference={this.state.readPreference}
          changeReadPreference={e => this.setState({readPreference: e})}
          forceTableScan={this.state.forceTableScan}
          changeForceTableScan={() => this.setState({forceTableScan: !this.state.forceTableScan})}
          query={this.state.query}
          changeQuery={e => this.setState({query: e})}
        />);
      default:
        return null;
    }
  }

  getComponentTitle() {
    switch (this.props.treeAction) {
      case BackupRestoreActions.EXPORT_DATABASE:
      case BackupRestoreActions.EXPORT_COLLECTION:
        return globalString('backup/database/mongoExport');
      case BackupRestoreActions.DUMP_COLLECTION:
      case BackupRestoreActions.DUMP_DATABASE:
        return globalString('backup/database/mongoDump');
      default:
        return '';
    }
  }

  render() {
    const {db} = this.props;
    const {treeAction} = this.props;
    this.updateEditorCode();
    return (<div className="database-export-panel">
      <h3 className="form-title">{this.getComponentTitle()}</h3>
      <div className="pt-form-group">
        <label className="pt-label database" htmlFor="database">
          {globalString('backup/database/db')}
        </label>
        <div className="pt-form-content">
          <input className="pt-input" readOnly type="text" dir="auto" value={db} />
        </div>
        <label className="pt-label database" htmlFor="database">
          {globalString('backup/database/filePath')}
        </label>
        <div className="pt-form-content">
          <input className="pt-input path-input" type="text" readOnly onClick={e => this.setState({directoryPath: e.target.value})} value={this.state.directoryPath} />
          <Button className="browse-directory" onClick={() => this.openFile()}>{globalString('backup/database/chooseDirectory')}</Button>
        </div>
        <label className={this.state.directoryPath ? 'hide' : 'warning'} htmlFor="database">{globalString('backup/database/requiredWarning')}</label>
      </div>
      <div style={{overflowY: 'auto'}}>
        {treeAction !== BackupRestoreActions.EXPORT_COLLECTION
        && treeAction !== BackupRestoreActions.DUMP_COLLECTION
        && <AllCollectionOption allCollections={this.state.allCollections}
          changeAllCollections={() => {
                                if (!this.state.allCollections) {
                                  // when turn on all collections, unselect viewsAsCollections
                                  this.setState({dumpDbUsersAndRoles: false});
                                }
                                this.setState({allCollections: !this.state.allCollections});
                              }} />
        }
        {
          !this.state.allCollections && !this.state.dumpDbUsersAndRoles ? <CollectionList collections={this.state.collections}
            readOnly={treeAction === BackupRestoreActions.EXPORT_COLLECTION || treeAction === BackupRestoreActions.DUMP_COLLECTION}
            selectCollection={this.selectCollection}
            unSelectCollection={this.unSelectCollection}
            selectedCollections={this.state.selectedCollections} /> : null
        }
        {
          this.getOptions()
        }
      </div>
      <ButtonPanel close={this.props.close} enableConfirm={this.isExecutable()} executing={this.executing} />
    </div>);
  }

}
