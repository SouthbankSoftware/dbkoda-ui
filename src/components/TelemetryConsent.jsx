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
@inject(allStores => ({store: allStores.store, layout: allStores.store.layout}))
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
    this.props.store.userPreferences.telemetryEnabled = false;
    this.props.layout.optInVisible = false;
  }

  @action.bound
  acceptDialog() {
    this.props.store.userPreferences.telemetryEnabled = true;
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
            onClick={this.closeDialog}
            text={globalString('telemetry_dialog/button_yes')} />
          <AnchorButton
            className="cancelButton"
            intent={Intent.DANGER}
            onClick={this.acceptDialog}
            text={globalString('telemetry_dialog/button_no')} />
        </div>

      </Dialog>
    );
  }
}
