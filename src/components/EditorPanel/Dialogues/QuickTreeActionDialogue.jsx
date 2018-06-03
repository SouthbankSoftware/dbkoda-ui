/**
 * Defines the Dialogue for the quick simple query action.
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
// $FlowFixMe
import {
  AnchorButton,
  Dialog,
  Intent,
  MenuItem,
  Classes,
  Button,
  Position
} from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { featherClient } from '~/helpers/feathers';
import { ProfileStatus } from '#/common/Constants';
import autobind from 'autobind-decorator';
import './Dialogue.scss';

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  profileStore: allStores.profileStore
}))
@observer
export default class QuickTreeActionDialogue extends React.Component {
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
        // When a string was returned.
        // let collectionArray = res.slice(1, -1);
        // collectionArray = collectionArray.split(',');
        // this.state.collectionList = [];
        // const arrayLength = collectionArray.length;

        res = JSON.parse(res);
        this.state.collectionList = [];
        for (let i = 0; i < res.length; i += 1) {
          this.state.collectionList.push({
            name: res[i].replace(/['"]+/g, '').trim()
          });
          if (i === res.length - 1) {
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
          onClick={handleClick}
          text={item.name}
        />
      );
    };

    return (
      <Dialog className="newFeaturesDialog" isOpen={this.state.isOpen}>
        <div className="dialogContent">
          <div className="header">
            <span className="title">{this.props.title}</span>
            <p className="versionNumber">{this.props.subtitle}</p>
          </div>
          <div className="body">
            <div className="dbSelectWrapper">
              <span>Database: </span>
              <Select
                filterable={false}
                items={this.state.databaseList}
                itemRenderer={renderItem}
                popoverProps={{ className: 'dbPopover', minimal: true, position: Position.BOTTOM }}
                noResults={<MenuItem disabled text="Fetching DB List..." />}
                onItemSelect={this._onDBSelect}
              >
                <Button
                  className="select-button"
                  text={
                    (this.state.selectedDatabase && this.state.selectedDatabase.substring(0, 30)) ||
                    'Select DB'
                  }
                  rightIcon="double-caret-vertical"
                />
              </Select>
            </div>
            {this.state.selectedDatabase && (
              <div className="collectionSelectWrapper">
                <span>Collection: </span>
                <Select
                  filterable={false}
                  disabled={!this.state.selectedDatabase}
                  items={this.state.collectionList}
                  itemRenderer={renderItem}
                  popoverProps={{
                    className: 'collectionPopover',
                    minimal: true,
                    position: Position.BOTTOM
                  }}
                  noResults={<MenuItem disabled text="Please select a database first." />}
                  onItemSelect={this._onCollectionSelect}
                >
                  <Button
                    className="select-button"
                    disabled={!this.state.selectedDatabase}
                    text={
                      (this.state.selectedCollection &&
                        this.state.selectedCollection.substring(0, 30)) ||
                      'Select Collection'
                    }
                    rightIcon="double-caret-vertical"
                  />
                </Select>{' '}
              </div>
            )}
          </div>
        </div>
        <div className="dialogButtons">
          <AnchorButton
            className="acceptButton"
            disabled={!this.state.selectedDatabase}
            intent={Intent.SUCCESS}
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
