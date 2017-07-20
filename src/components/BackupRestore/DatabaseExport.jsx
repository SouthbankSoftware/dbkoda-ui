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
import {Checkbox, Intent, Position, Tooltip} from '@blueprintjs/core';

import {featherClient} from '../../helpers/feathers';

import {ButtonPanel} from './ButtonPanel';
import './DatabaseExport.scss';
import CollectionList from './CollectionList';

/**
 * the option panel for database export
 * @constructor
 */
const Options = ({ssl, allCollections, changeSSL, changeAllCollections}) => {
  return (
    <div className="options-panel">
      <div className="option-item-row">
        <Tooltip
          content=""
          hoverOpenDelay={1000}
          inline
          intent={Intent.PRIMARY}
          position={Position.TOP}
        >
          <Checkbox
            checked={ssl}
            label={globalString('backup/database/ssl')}
            onChange={() => changeSSL()}
          />
        </Tooltip>
      </div>
      <div className="option-item-row">
        <Tooltip
          content=""
          hoverOpenDelay={1000}
          inline
          intent={Intent.PRIMARY}
          position={Position.TOP}
        >
          <Checkbox
            checked={allCollections}
            label={globalString('backup/database/allCollections')}
            onChange={() => changeAllCollections()}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default class DatabaseExport extends React.Component {

  constructor(props) {
    super(props);
    this.selectCollection = this.selectCollection.bind(this);
    this.unSelectCollection = this.unSelectCollection.bind(this);
    this.state = {collections: [], ssl: false, allCollections: true, selectedCollections: []};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.treeEditor) {
      this.fetchCollectionlist(nextProps.treeEditor.shellId);
    }
  }

  componentDidMount() {
    if (this.props.treeEditor) {
      this.fetchCollectionlist(this.props.editor.shellId);
    }
  }

  fetchCollectionlist(shellId) {
    featherClient()
      .service('/mongo-sync-execution')
      .update(this.props.profile.id, {
        shellId,
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

  render() {
    const db = this.props.treeNode.text;
    return (<div className="database-export-panel">
      <h3 className="form-title">{globalString('backup/database/title')}</h3>
      <div className="pt-form-group">
        <label className="pt-label database" htmlFor="database">
          {globalString('backup/database/db')}
        </label>
        <div className="pt-form-content">
          <input id="example-form-group-input-a" className="pt-input" readOnly type="text" dir="auto" value={db} />
        </div>
      </div>
      <Options ssl={this.state.ssl} allCollections={this.state.allCollections}
        changeSSL={() => this.setState({ssl: !this.state.ssl})}
        changeAllCollections={() => this.setState({allCollections: !this.state.allCollections})}
      />
      {
        !this.state.allCollections ? <CollectionList collections={this.state.collections}
          selectCollection={this.selectCollection}
          unSelectCollection={this.unSelectCollection}
          selectedCollections={this.state.selectedCollections} /> : null
      }
      <ButtonPanel close={this.props.close} />
    </div>);
  }

}
