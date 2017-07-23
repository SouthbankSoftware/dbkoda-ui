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
import mongodbUri from 'mongodb-uri';

import {featherClient} from '../../helpers/feathers';

import {ButtonPanel} from './ButtonPanel';
import './DatabaseExport.scss';
import CollectionList from './CollectionList';
import {BackupRestoreActions} from '../common/Constants';
import Options from './Options';

const { dialog, BrowserWindow } = IS_ELECTRON
  ? window.require('electron').remote
  : {};

export default class DatabaseExport extends React.Component {

  constructor(props) {
    super(props);
    this.selectCollection = this.selectCollection.bind(this);
    this.unSelectCollection = this.unSelectCollection.bind(this);
    this.executing = this.executing.bind(this);
    this.state = {collections: [], ssl: false, allCollections: true, selectedCollections: [], directoryPath: '', jsonArray: false, pretty: false};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.treeEditor) {
      this.fetchCollectionlist(nextProps.treeEditor);
    }
  }

  componentDidMount() {
    if (this.props.treeEditor) {
      this.fetchCollectionlist(this.props.editor);
    }
  }

  getCommandObject() {
    const db = this.props.treeNode.text;
    const {host, port, username, sha, hostRadio, url, database} = this.props.profile;
    console.log('profile=', this.props.profile);
    const {pretty, jsonArray, directoryPath} = this.state;
    let targetCols = [];
    if (this.state.allCollections) {
      targetCols = this.state.collections;
    } else {
      targetCols = this.state.selectedCollections;
    }
    const cols = [];
    targetCols.map((col) => {
      const items = {database: db, collection: col, ssl: this.state.ssl, username, password:sha, pretty, jsonArray, authDb: database};
      if (hostRadio) {
        items.host = host;
        items.port = port;
      } else {
        const uri = mongodbUri.parse(url);
        if (uri.hosts.length == 1) {
          items.host = uri.hosts[0].host;
          items.port = uri.hosts[0].port ? uri.hosts[0].port : '27017';
        } else if (uri.options && uri.options.replicaSet){
          // replica set
            let repH = uri.options.replicaSet + '/';
            uri.hosts.map((h, i) => {
              repH += h.host;
              const p = h.port ? h.port : 27017;
              repH += ':' + p;
              if (i != uri.hosts.length - 1) {
                repH += ',';
              }
            });
            items.host = repH;
        }
        if (!sha) {
          if (uri.username && uri.password) {
            items.username = uri.username;
            items.password = uri.password;
          }
        }
      }
      if (directoryPath) {
        items.output = directoryPath + '/' + col + '.json';
      }
      cols.push(items);
    });
    return cols;
  }

  generateCode() {
    const cols = this.getCommandObject();
    const values = {cols};
    const template = require('./Template/ExportDatabsae.hbs');
    return template(values);
  }

  updateEditorCode() {
    if (this.props.action === BackupRestoreActions.EXPORT_DATABASE && this.state.editor && this.state.editor.doc.cm) {
      const generatedCode = this.generateCode();
      this.state.editor.doc.cm.setValue(generatedCode);
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

  fetchCollectionlist(editor) {
    if (editor) {
      this.setState({editor});
    }
    if (this.props.action === BackupRestoreActions.EXPORT_DATABASE && editor.doc.cm) {
      const generatedCode = this.generateCode();
      editor.doc.cm.setValue(generatedCode);
    }
    featherClient()
      .service('/mongo-sync-execution')
      .update(this.props.profile.id, {
        shellId: editor.shellId,
        commands: `db.getSiblingDB("${this.props.treeNode.text}").getCollectionNames()`
      }).then((res) => {
      this.setState({collections: JSON.parse(res)});
    });
  }

  selectCollection(collection, i) {
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
    return this.getCommandObject().length > 0 && this.state.directoryPath && !this.props.isActiveExecuting;
  }

  executing() {
    this.props.runEditorScript();
     // const generatedCode = this.generateCode();
     // console.log('generated:', generatedCode);
     // featherClient()
     //  .service('/os-execution')
     //   .update(this.props.profile.id, {shellId: this.state.editor.shellId, commands: generatedCode})
     //   .then((res) => {
     //    console.log(res);
     //   });
  }

  render() {
    const db = this.props.treeNode.text;
    this.updateEditorCode();
    return (<div className="database-export-panel">
      <h3 className="form-title">{globalString('backup/database/title')}</h3>
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
      </div>
      <Options ssl={this.state.ssl} allCollections={this.state.allCollections} pretty={this.state.pretty} jsonArray={this.state.jsonArray}
        changeSSL={() => this.setState({ssl: !this.state.ssl})}
        changePretty={() => this.setState({pretty: !this.state.pretty})}
        changeJsonArray={() => this.setState({jsonArray: !this.state.jsonArray})}
        changeAllCollections={() => this.setState({allCollections: !this.state.allCollections})}
      />
      {
        !this.state.allCollections ? <CollectionList collections={this.state.collections}
          selectCollection={this.selectCollection}
          unSelectCollection={this.unSelectCollection}
          selectedCollections={this.state.selectedCollections} /> : null
      }
      <ButtonPanel close={this.props.close} enableConfirm={this.isExecutable()} executing={this.executing} />
    </div>);
  }

}
