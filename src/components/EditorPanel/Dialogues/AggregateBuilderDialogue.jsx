/**
 * Defines the Dialogue for the quick simple query action.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
// $FlowFixMe
import { AnchorButton, Dialog, Intent, MenuItem, Classes, Button } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { featherClient } from '~/helpers/feathers';
import { ProfileStatus } from '#/common/Constants';
import autobind from 'autobind-decorator';

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  profileStore: allStores.profileStore
}))
@observer
export default class AggregateBuilderDialogue extends React.Component {
  constructor() {
    super();
    this.state = {
      isOpen: false,
      profileId: null,
      databaseList: [],
      collectionList: [],
      selectedDatabase: null,
      selectedCollection: null
    };
  }

  componentWillMount() {}

  componentWillReceiveProps(nextProps) {
    this.setState({ isOpen: nextProps.isOpen });
    if (nextProps.profile && nextProps.profile.status === ProfileStatus.OPEN) {
      this.state.profileId = nextProps.profile.id;
      const service = featherClient().service('profile');
      service.timeout = 30000;
      service
        .get(nextProps.profile.id, {
          query: {
            op: 'configuration'
          }
        })
        .then(res => {
          this.state.databaseList = [];
          res.forEach(databaseEntry => {
            this.state.databaseList.push({ name: Object.keys(databaseEntry)[0] });
            this.forceUpdate();
          });
        })
        .catch(err => {
          l.error(err);
        });
    }
  }

  @autobind
  _onDBSelect(database) {
    this.setState({ selectedDatabase: database.name });
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);

    // Fetch collections for DB.
    const service = featherClient().service('mongo-sync-execution');
    service.timeout = 30000;
    service
      .update(this.state.profileId, {
        shellId: editor.shellId,
        commands: `db.getSiblingDB("${database.name}").getCollectionNames();`
      })
      .then(res => {
        let collectionArray = res.slice(1, -1);
        collectionArray = collectionArray.split(',');
        this.state.collectionList = [];
        const arrayLength = collectionArray.length;
        for (let i = 0; i < arrayLength; i += 1) {
          this.state.collectionList.push({ name: collectionArray[i].replace(/['"]+/g, '') });
          if (i === arrayLength - 1) {
            this.forceUpdate();
          }
        }
      })
      .catch(err => {
        l.error(err);
      });
  }

  @autobind
  _onCollectionSelect(collection) {
    // Enable the Accept Button
    this.setState({ selectedCollection: collection.name });
  }

  render() {
    const renderItem = (item, { handleClick, modifiers }) => {
      return (
        <MenuItem
          className={modifiers.active ? Classes.ACTIVE : ''}
          key={item.name}
          label={item.name}
          onClick={handleClick}
          text={item.name}
        />
      );
    };

    return (
      <Dialog className="newFeaturesDialog" isOpen={this.state.isOpen}>
        <div className="dialogContent">
          <div className="header">
            <span className="title">New Aggregate Builder</span>
            <p className="versionNumber">Fill in the below form and click Okay</p>
          </div>
          <div className="body">
            <span>Please select a database</span>
            <Select
              filterable={false}
              items={this.state.databaseList}
              itemRenderer={renderItem}
              noResults={<MenuItem disabled text="Fetching DB List..." />}
              onItemSelect={this._onDBSelect}
            >
              <Button
                className="select-button"
                text={this.state.selectedDatabase || 'Select DB'}
                rightIcon="double-caret-vertical"
              />
            </Select>
            <span>Please select a collection</span>
            <Select
              filterable={false}
              disabled={!this.state.selectedDatabase}
              items={this.state.collectionList}
              itemRenderer={renderItem}
              noResults={<MenuItem disabled text="Please select a database first." />}
              onItemSelect={this._onCollectionSelect}
            >
              <Button
                className="select-button"
                disabled={!this.state.selectedDatabase}
                text={this.state.selectedCollection || 'Select Collection'}
                rightIcon="double-caret-vertical"
              />
            </Select>
          </div>
        </div>
        <div className="dialogButtons">
          <AnchorButton
            className="acceptButton"
            disabled={!this.state.selectedDatabase}
            intent={Intent.SUCESS}
            text={globalString('general/confirm')}
            onClick={() => {
              this.props.acceptCallBack(this.state.selectedDatabase, this.state.selectedCollection);
            }}
          />
          <AnchorButton
            className="closeButton"
            intent={Intent.DANGER}
            text={globalString('general/close')}
            onClick={this.props.closeCallBack}
          />
        </div>
      </Dialog>
    );
  }
}
