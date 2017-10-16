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
 * @Author: mike
 * @Date:   2017-03-28 16:13:50
 * @Last modified by:   mike
 * @Last modified time: 2017-03-28 16:14:04
 */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {observer, inject} from 'mobx-react';
import {action} from 'mobx';
import {Intent, Dialog, AnchorButton} from '@blueprintjs/core';

const React = require('react');
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 */
@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout,
  config: allStores.config,
}))
@observer
export default class TelemetryConsent extends React.Component {
  @action.bound
  openPrivacyPolicy() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('https://southbanksoftware.github.io/privacy-policy');
    }
  }

  @action.bound
  closeDialog() {
    this.props.config.settings.telemetryEnabled = false;
    this.props.layout.optInVisible = false;
  }

  @action.bound
  acceptDialog() {
    this.props.config.settings.telemetryEnabled = true;
    this.props.layout.optInVisible = false;
  }

  render() {
    return (
      <Dialog
        className="pt-dark optInDialog"
        intent={Intent.PRIMARY}
        iconName="pt-icon-chart"
        isOpen={this.props.layout.optInVisible}>
        <h1>{globalString('telemetry_dialog/header')} </h1>
        <p> {globalString('telemetry_dialog/content_first')} </p>
        <p> {globalString('telemetry_dialog/content_second')} </p>
        <p> {globalString('telemetry_dialog/content_third')}
          <a onClick={this.openPrivacyPolicy}>{globalString('telemetry_dialog/privacy_link')}</a>
        </p>
        <div className="dialogButtons">
          <AnchorButton
            className="submitButton"
            type="submit"
            intent={Intent.SUCCESS}
            onClick={this.acceptDialog}
            text={globalString('telemetry_dialog/button_yes')} />
          <AnchorButton
            className="cancelButton"
            intent={Intent.DANGER}
            onClick={this.closeDialog}
            text={globalString('telemetry_dialog/button_no')} />
        </div>

      </Dialog>
    );
  }
}
