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
 *
 *
 * @Author: mike
 * @Date:   2017-09-20 10:35:04
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-15T13:33:13+11:00
 */

/* eslint no-prototype-builtins:warn */
/* eslint jsx-a11y/no-static-element-interactions: 0 */

import React from 'react';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import { AnchorButton, Intent, Alert, EditableText } from '@blueprintjs/core';
import { Broker, EventType } from '~/helpers/broker';
import { NewToaster } from '#/common/Toaster';
import LoadingView from '#/common/LoadingView';
import HappyIcon from '../../styles/icons/happy.svg';
import NeutralIcon from '../../styles/icons/neutral.svg';
import SadIcon from '../../styles/icons/sad.svg';
import BugIcon from '../../styles/icons/error.svg';
import './style.scss';

const FeedbackTypes = {
  POSITIVE: 'PositiveFeedback',
  NEUTRAL: 'NeutralFeedback',
  NEGATIVE: 'NegativeFeedback',
};

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
}))
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLodgeBugAlertOpen: false,
      isLodgeBugPending: false,
      isFeedbackAlertOpen: false,
      isSupportBundleReady: false,
      os: false,
      feedbackComments: '',
      feedbackType: '',
      debug: true, // Enable for additional logging comments during development.
      updateStatusMsg: '',
      isUpdateAvailable: false,
      isUpdateDownloaded: false,
      isUpdateDownloading: false,
    };
    const os = require('os').release();
    if (os.match(/Mac/gi)) {
      this.state.os = 'mac';
    } else if (os.match(/Win/gi)) {
      this.state.os = 'win';
    } else if (os.match(/Lin/gi)) {
      this.state.os = 'linux';
    }
  }

  componentDidMount() {
    if (IS_ELECTRON) {
      const electron = window.require('electron');
      electron.ipcRenderer.on('updateStatus', this.handleAutoupdaterCommand);
    }
  }

  handleAutoupdaterCommand = (event, message) => {
    if (message === 'CHECKING') {
      this.setState({ updateStatusMsg: 'Checking for Updates...' });
    } else if (message === 'AVAILABLE') {
      this.setState({
        updateStatusMsg: 'Update Available.',
        isUpdateAvailable: true,
      });
    } else if (message === 'NOT_AVAILABLE') {
      this.setState({ updateStatusMsg: 'No Updates Available.' });
    } else if (message === 'ERROR') {
      this.setState({ updateStatusMsg: 'Error checking for Updates.' });
    } else if (message === 'DOWNLOADED') {
      this.setState({
        updateStatusMsg: 'Update Downloaded.',
        isUpdateDownloaded: true,
        isUpdateDownloading: false,
      });
    } else if (message.indexOf('DOWNLOADING') >= 0) {
      this.setState({
        updateStatusMsg: 'Downloading update ' + message.split(' ')[1],
        isUpdateDownloading: true,
      });
    }
  };

  @action.bound
  onClickUpdateBtn() {
    const { remote } = window.require('electron');
    if (this.state.isUpdateDownloaded) {
      const installUpdate = remote.getGlobal('InstallUpdate');
      installUpdate()
        .then((result) => {
          if (result) {
            this.setState({ isUpdateDownloaded: false });
          }
        })
        .catch(reason => console.log('user click no:', reason));
    } else if (this.state.isUpdateAvailable) {
      const downloadUpdate = remote.getGlobal('DownloadUpdate');
      downloadUpdate()
        .then((result) => {
          if (result) {
            this.setState({ isUpdateAvailable: false });
          }
        })
        .catch(reason => console.log('user click no:', reason));
    }
  }

  @action.bound
  onClickBugForum() {
    const subject = globalString(
      'status_bar/support_bundle/forum/default_subject',
    );
    const url = 'https://dbkoda.useresponse.com/topic/add?title=' + subject;
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal(url);
    }
  }

  @action.bound
  onClickBugEmail() {
    const subject = globalString(
      'status_bar/support_bundle/email/default_subject',
    );
    const body = globalString('status_bar/support_bundle/email/default_body');
    const mailToString =
      'mailto:support@southbanksoftware.com?subject=' +
      subject +
      '&body=' +
      body +
      '&attachment%3D%22~%2F.dbKoda%2FsupportBundle%22';
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal(mailToString);
    }
  }

  @action.bound
  onClickFeedback() {
    this.setState({ isFeedbackAlertOpen: true });
  }

  @action.bound
  onConfirmFeedback() {
    Broker.emit(EventType.FEEDBACK, {
      type: this.state.feedbackType,
      comments: this.state.feedbackComments,
    });
    NewToaster.show({
      message: globalString('status_bar/feedback/toaster_confirm'),
      className: 'success',
      icon: 'pt-icon-thumbs-up',
    });
    this.setState({ isFeedbackAlertOpen: false });
  }

  @action.bound
  onCancelFeedback() {
    this.setState({ isFeedbackAlertOpen: false });
    this.state.feedbackType = '';
    this.state.feedbackComments = '';
  }

  @action.bound
  onClickSupportBundle() {
    this.setState({ isLodgeBugAlertOpen: true });
  }

  @action.bound
  onCancelLodgeBug() {
    this.setState({ isLodgeBugPending: false });
    this.setState({ isLodgeBugAlertOpen: false });
    this.setState({ isSupportBundleReady: false });
  }

  @action.bound
  onConfirmLodgeBug() {
    if (this.state.isSupportBundleReady) {
      // Close dialogue.
      this.setState({ isSupportBundleReady: false });
      this.setState({ isLodgeBugAlertOpen: false });
    } else {
      this.setState({ isLodgeBugPending: true });
      this.getSupportBundle()
        .then((filePath) => {
          if (IS_ELECTRON) {
            if (!filePath) {
              filePath = '/Users/mike/.dbKoda/';
              console.error('Did not recieve a file path back from controller');
              logToMain('error', 'Did not recieve a file path back from controller');
            }
            window.require('electron').shell.showItemInFolder(filePath);
          }
          this.setState({ isLodgeBugPending: false });
          this.setState({ isSupportBundleReady: true });
        })
        .catch((err) => {
          this.setState({ isLodgeBugPending: false });
          this.setState({ isSupportBundleReady: false });
          NewToaster.show({
            message: (
              <span
                dangerouslySetInnerHTML={{ __html: 'Error: ' + err.message }}
              />
            ),
            className: 'danger',
            icon: 'pt-icon-thumbs-up',
          });
        });
    }
  }

  @action.bound
  onClickFeedbackDetractor() {
    this.setState({ feedbackType: FeedbackTypes.NEGATIVE });
  }

  @action.bound
  onClickFeedbackPassive() {
    this.setState({ feedbackType: FeedbackTypes.NEUTRAL });
  }

  @action.bound
  onClickFeedbackAdvocate() {
    this.setState({ feedbackType: FeedbackTypes.POSITIVE });
  }

  @action.bound
  openDirectoryFAQ() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal(
          'https://dbkoda.useresponse.com/knowledge-base/article/how-do-i-generate-a-support-bundle',
        );
    }
  }

  @action.bound
  updateFeedBack(string) {
    this.setState({ feedbackComments: string });
  }

  @action.bound
  getSupportBundle() {
    return new Promise((resolve, reject) => {
      // Send request to feathers supportBundle Service
      const service = featherClient().service('/supportBundle');
      service.timeout = 30000;
      service
        .get()
        .then((result) => {
          NewToaster.show({
            message: globalString('status_bar/support_bundle/toaster_confirm'),
            className: 'success',
            icon: 'pt-icon-thumbs-up',
          });
          resolve(result);
        })
        .catch((err) => {
          console.error(err);
          logToMain('error', 'Failed to create support bundle: ' + err);
          reject(err);
        });
    });
  }

  @action.bound
  renderAlerts() {
    return (
      <div className="SupportBundleAlerts">
        <Alert
          className="lodgeBugAlert"
          isOpen={this.state.isLodgeBugAlertOpen}
          confirmButtonText={globalString('general/confirm')}
          onConfirm={this.onConfirmLodgeBug}
          cancelButtonText={globalString('general/cancel')}
          onCancel={this.onCancelLodgeBug}
        >
          {this.state.isSupportBundleReady ? (
            <div className="supportBundleFinished">
              <p className="supportBundleFinishedText">
                {globalString(
                  'status_bar/support_bundle/finished_text_default_one',
                )}
              </p>
              <p className="supportBundleFinishedText">
                {globalString(
                  'status_bar/support_bundle/finished_text_default_two',
                )}
                <br />
                {globalString(
                  'status_bar/support_bundle/finished_text_default_three',
                )}
              </p>
              <p className="supportBundleFinishedText">
                {globalString(
                  'status_bar/support_bundle/finished_text_default_four',
                )}
                <b className="directoryFAQLink" onClick={this.openDirectoryFAQ}>
                  {globalString('status_bar/support_bundle/directory_faq_link')}
                </b>
                {globalString(
                  'status_bar/support_bundle/finished_text_default_five',
                )}
              </p>
              <AnchorButton
                className="forumButton"
                intent={Intent.NONE}
                text={globalString('status_bar/support_bundle/forum/button')}
                onClick={this.onClickBugForum}
              />
              <AnchorButton
                className="emailButton"
                intent={Intent.NONE}
                text={globalString('status_bar/support_bundle/email/button')}
                onClick={this.onClickBugEmail}
              />
            </div>
          ) : (
            <p>{globalString('status_bar/support_bundle/alert_text')}</p>
          )}
          {this.state.isLodgeBugPending && (
            <div className="loaderWrapper">
              <div className="loader" />
            </div>
          )}
        </Alert>
        <Alert
          className="feedbackAlert"
          isOpen={this.state.isFeedbackAlertOpen}
          confirmButtonText={globalString('general/send')}
          onConfirm={this.onConfirmFeedback}
          cancelButtonText={globalString('general/cancel')}
          onCancel={this.onCancelFeedback}
        >
          <p>{globalString('status_bar/feedback/alert_text')}</p>
          <p>{globalString('status_bar/feedback/additional_comments_label')}</p>
          <EditableText
            multiline
            minLines={4}
            maxLines={4}
            maxLength={256}
            value={this.state.feedbackComments}
            onChange={this.updateFeedBack}
            intent={Intent.NONE}
            placeholder="Please place any additional comments here and select the icon below that represents your feelings on the product."
            className="additionalComments"
          />
          <div className="npsButtons">
            <div
              className={
                this.state.feedbackType === FeedbackTypes.NEGATIVE
                  ? 'active'
                  : 'inactive'
              }
              onClick={this.onClickFeedbackDetractor}
            >
              <SadIcon width={20} height={20} />
            </div>
            <div
              className={
                this.state.feedbackType === FeedbackTypes.NEUTRAL
                  ? 'active'
                  : 'inactive'
              }
              onClick={this.onClickFeedbackPassive}
            >
              <NeutralIcon width={20} height={20} />
            </div>
            <div
              className={
                this.state.feedbackType === FeedbackTypes.POSITIVE
                  ? 'active'
                  : 'inactive'
              }
              onClick={this.onClickFeedbackAdvocate}
            >
              <HappyIcon width={20} height={20} />
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  render() {
    let updateBtnClassNames = 'updateButton';
    if (this.state.isUpdateAvailable || this.state.isUpdateDownloaded) {
      updateBtnClassNames += ' updateGreen';
    }
    return (
      <div className="statusPanel">
        {this.renderAlerts()}
        <div className="float_left">
          <span className="productVersion">
            {'dbKoda: v' + this.props.store.version}
          </span>
          {(this.state.isUpdateAvailable ||
            this.state.isUpdateDownloaded ||
            this.state.isUpdateDownloading) && (
            <div
              className={updateBtnClassNames}
              onClick={this.onClickUpdateBtn}
            >
              <span>{this.state.updateStatusMsg}</span>
            </div>
          )}
          {this.props.store.treePanel.downloadingDrill && (
            <div className="drillDownload">
              {this.props.store.treePanel.showDrillStatus && (
                <div className="dialogContent">
                  <p>{this.props.store.treePanel.drillStatusMsg}</p>
                  {this.props.store.treePanel.drillDownloadProgress && (
                    <p style={{ textAlign: 'center' }}>
                      {Math.round(
                        this.props.store.treePanel.drillDownloadProgress * 100,
                      ) + '% complete'}
                    </p>
                  )}
                </div>
              )}
              {!this.props.store.treePanel.showDrillStatus && (
                <div className="dialogContent">
                  <LoadingView />
                  <p>Starting Apache Drill...</p>
                </div>
              )}
            </div>
          )}
          {/* <Dialog
            className="pt-dark open-profile-alert-dialog"
            intent={Intent.PRIMARY}
            isOpen={this.props.store.treePanel.downloadingDrill}
            inline
          >
            {this.props.store.treePanel.showDrillStatus && (
              <div className="dialogContent">
                <p>{this.props.store.treePanel.drillStatusMsg}</p>
                <ProgressBar
                  intent={Intent.PRIMARY}
                  value={this.props.store.treePanel.drillDownloadProgress}
                />
                {this.props.store.treePanel.drillDownloadProgress && (
                  <p style={{ textAlign: 'center' }}>
                    {Math.round(
                      this.props.store.treePanel.drillDownloadProgress * 100,
                    ) + '% complete'}
                  </p>
                )}
              </div>
            )}

            {!this.props.store.treePanel.showDrillStatus && (
              <div className="dialogContent" style={{ height: '40px' }}>
                <p>Starting Apache Drill...</p>
                <LoadingView />
                <br />
                <br />
                <p>
                  Note: This process might take almost 2 minutes on first start.
                </p>
              </div>
            )}
          </Dialog> */}
        </div>
        <div className="float_right">
          <div className="configButton" onClick={this.props.api.openConfigTab}>
            <span className="pt-icon-cog" />
          </div>
          <div className="feedbackButton" onClick={this.onClickFeedback}>
            <HappyIcon width={10} height={10} />
          </div>
          <div className="lodgeBugButton" onClick={this.onClickSupportBundle}>
            <BugIcon width={10} height={10} />
          </div>
        </div>
      </div>
    );
  }
}
