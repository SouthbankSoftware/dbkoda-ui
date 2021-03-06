/**
 * @Author: mike
 * @Date:   2017-03-28 16:13:50
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-14T13:35:35+11:00
 *
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

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
import { observer, inject } from 'mobx-react';
import { action } from 'mobx';
import { Broker, EventType } from '~/helpers/broker';
import { Intent, Dialog, AnchorButton, Switch } from '@blueprintjs/core';

const React = require('react');
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 */
@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout,
  configStore: allStores.configStore
}))
@observer
export default class TelemetryConsent extends React.Component {
  constructor() {
    super();
    this.optIn = true;
  }

  @action.bound
  openPrivacyPolicy() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('https://southbanksoftware.github.io/privacy-policy');
    }
  }

  @action.bound
  hasOneDayPassed(previousDate, currentDate) {
    if (Date.parse(currentDate) - Date.parse(previousDate) >= 1) {
      return true;
    }
    return false;
  }

  @action.bound
  getToday() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // January is 0!
    const yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    today = mm + '/' + dd + '/' + yyyy;
    return today;
  }

  @action.bound
  handleSwitch() {
    if (this.props.configStore.config.telemetryEnabled === false) {
      this.props.configStore.patch({
        telemetryEnabled: true
      });
    } else {
      this.props.configStore.patch({
        telemetryEnabled: false
      });
      if (IS_ELECTRON) {
        window.require('electron').shell.beep();
      }
    }
  }

  @action.bound
  acceptDialog() {
    this.props.layout.optInVisible = false;
    if (
      this.props.store.dateLastPinged &&
      this.props.configStore.config.telemetryEnabled &&
      this.hasOneDayPassed(this.props.store.dateLastPinged, this.getToday())
    ) {
      this.props.store.dateLastPinged = this.getToday();
      this.props.store.firstPingDate = this.getToday();
      Broker.emit(EventType.PING_HOME);
    } else if (!this.props.store.dateLastPinged && this.props.configStore.config.telemetryEnabled) {
      this.props.store.dateLastPinged = this.getToday();
      this.props.store.firstPingDate = this.getToday();
      Broker.emit(EventType.PING_HOME);
    }
  }

  render() {
    return (
      <Dialog
        className="TelemetryConsent pt-dark optInDialog"
        intent={Intent.PRIMARY}
        isOpen={this.props.layout.optInVisible}
      >
        <div className="dialogContent">
          <h1>{globalString('telemetry_dialog/header')} </h1>
          <p> {globalString('telemetry_dialog/content_first')} </p>
          <p> {globalString('telemetry_dialog/content_second')} </p>
          <p>
            {' '}
            {globalString('telemetry_dialog/content_third')}
            <a onClick={this.openPrivacyPolicy}>{globalString('telemetry_dialog/privacy_link')}</a>
          </p>
        </div>
        <div className={'dialogButtons ' + this.props.configStore.config.telemetryEnabled}>
          <Switch
            checked={this.props.configStore.config.telemetryEnabled}
            label="Enable Telemetry"
            onChange={this.handleSwitch}
          />
          <AnchorButton
            className="submitButton"
            type="submit"
            intent={Intent.SUCCESS}
            onClick={this.acceptDialog}
            text={globalString('telemetry_dialog/button_yes')}
          />
        </div>
      </Dialog>
    );
  }
}
