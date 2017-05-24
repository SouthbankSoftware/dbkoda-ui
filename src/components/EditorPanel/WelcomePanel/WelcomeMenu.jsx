/**
* @Author: Michael Harrison <mike>
* @Date:   2017-04-10 14:32:37
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-04-10 14:32:40
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/sort-comp */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';
import {AnchorButton, Checkbox} from '@blueprintjs/core';

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  @action.bound
  openConnection() {
    if (this.props.store.userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.NEW_PROFILE.OPEN_DIALOG, EventLogging.getFragmentEnum().PROFILES, 'User opened the New Connection Profile drawer.');
    }
    this.props.store.profileList.selectedProfile = null;
    this
      .props
      .store
      .showConnectionPane();
  }

  @action.bound
  showAtLaunchChanged(event) {
    console.log(event.target.value);
    if (this.props.store.userPreferences.showWelcomePageAtStart) {
      this.props.store.userPreferences.showWelcomePageAtStart = false;
    } else {
      this.props.store.userPreferences.showWelcomePageAtStart = true;
    }
  }

  @action.bound
  chooseTheme() {
    this.props.store.welcomePage.currentContent = 'Choose Theme';
  }

  @action.bound
  welcomePage() {
    this.props.store.welcomePage.currentContent = 'Welcome';
  }

  @action.bound
  learnKeyboardShortcuts() {
    this.props.store.welcomePage.currentContent = 'Keyboard Shortcuts';
  }

  render() {
    return (
      <div className="welcomeMenu">
        <h2>
          Get to know DBEnvy!
        </h2>
        <div className="welcomeButtons">
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton openConnectionButton"
              onClick={this.openConnection}>Open Connection</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.welcomePage}>Welcome Page</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton learnKeyboardShortcutsButton"
              onClick={this.learnKeyboardShortcuts}>Learn Keyboard Shortcuts</AnchorButton>
          </div>
        </div>
        <div className="welcomeMenuOptOut">
          <Checkbox checked={this.props.store.userPreferences.showWelcomePageAtStart} onChange={this.showAtLaunchChanged} />
          <p>Show welcome Screen when opening DBEnvy</p>
        </div>
      </div>
    );
  }
}
