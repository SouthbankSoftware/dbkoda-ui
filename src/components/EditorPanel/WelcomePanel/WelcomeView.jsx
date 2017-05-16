/**
* @Author: Michael Harrison <mike>
* @Date:   2017-04-10 14:32:37
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-04-10 14:32:40
*/

/* eslint-disable react/no-string-refs */
import React from 'react';
import {inject, observer} from 'mobx-react';
import WelcomeMenu from './WelcomeMenu.jsx';
import WelcomeContent from './WelcomeContent.jsx';
import ChooseTheme from './ChooseTheme.jsx';
import LearnShortcuts from './LearnShortcuts.jsx';

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class WelcomeView extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderWelcomePage() {
    switch (this.props.store.welcomePage.currentContent) {
      case 'Welcome':
        return <WelcomeContent />;
      case 'Choose Theme':
        return <ChooseTheme />;
      case 'Keyboard Shortcuts':
        return <LearnShortcuts />;
      default:
        return <div>ERROR</div>;
    }
  }

  render() {
    return (
      <div className="welcomePanelTabWrapper">
        <div className="welcomePanelWrapper">
          <h1>
            Welcome To DBEnvy
          </h1>
          <div className="welcomeMiddleSection">
            <div className="welcomeMenuWrapper">
              <WelcomeMenu />
            </div>
            <div className="welcomeContentWrapper">
              {this.renderWelcomePage()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
