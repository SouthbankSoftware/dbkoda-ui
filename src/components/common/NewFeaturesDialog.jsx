/*
 * @flow
 *
 * @Author: Michael Harrison
 * @Date:   2018-04-10 16:16:38
 * @Last modified by:   Mike
 * @Last modified time: 2018-04-10 16:16:38
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

import React from 'react';
import { runInAction, action } from 'mobx';
import { inject, observer } from 'mobx-react';
// $FlowFixMe
import { AnchorButton, Dialog, Intent, Switch } from '@blueprintjs/core';
import './NewFeaturesDialog.scss';

type Props = {
  api: *,
  store: *,
  config: *,
  showDialog: boolean
};

type State = {};

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  config: allStores.config
}))
@observer
export default class NewFeaturesDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  @action.bound
  handleSwitch() {
    if (this.props.config.settings.showNewFeaturesDialogOnStart === false) {
      this.props.config.patch({
        showNewFeaturesDialogOnStart: true
      });
    } else {
      this.props.config.patch({
        showNewFeaturesDialogOnStart: false
      });
    }
  }

  render() {
    const numberOfFeatures = parseInt(
      globalString('general/newFeaturesDialog/numberOfNewFeatures'),
      10
    );
    const newFeatures = [];
    for (let count = 1; count <= numberOfFeatures; count += 1) {
      newFeatures.push({
        title: globalString('general/newFeaturesDialog/newFeature' + count + 'Title'),
        body: globalString('general/newFeaturesDialog/newFeature' + count + 'Body')
      });
    }

    return (
      <Dialog
        className="newFeaturesDialog"
        isOpen={this.props.store.editorPanel.showNewFeaturesDialog}
      >
        <div className="dialogContent">
          <div className="header">
            <span className="title">
              {globalString('general/newFeaturesDialog/title')}
              <p className="versionNumber">{this.props.store.version}</p>
            </span>
            <p className="subtitle">{globalString('general/newFeaturesDialog/subTitle')}</p>
          </div>
          <div className="body">
            {newFeatures.map(obj => {
              return (
                <div className="featureWrapper" key={obj.title}>
                  <p className="title">{obj.title}</p>
                  <p className="body">{obj.body}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="dialogButtons">
          <Switch
            checked={this.props.config.settings.showNewFeaturesDialogOnStart}
            label={globalString('general/newFeaturesDialog/openAtStart')}
            onChange={this.handleSwitch}
          />
          <AnchorButton
            className="closeButton"
            intent={Intent.DANGER}
            text={globalString('general/close')}
            onClick={() => {
              runInAction(() => {
                this.props.store.editorPanel.showNewFeaturesDialog = false;
                this.forceUpdate();
              });
            }}
          />
        </div>
      </Dialog>
    );
  }
}
