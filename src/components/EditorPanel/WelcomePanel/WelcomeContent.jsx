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
import {AnchorButton} from '@blueprintjs/core';
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class WelcomeContent extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderFeed() {
    return (
      <p />
    );
  }

  render() {
    return (
      <div className="welcomePageContentWrapper">
        <div className="welcomePageContentLeft">
          <h2>
            Documentation
          </h2>
          <div className="docsList">
            <div className="documentationLinkWrapper">
              <span className="iconWrapper">
                <AnchorButton className="icon pt-minimal pt-icon-large pt-icon-document" />
              </span>
              <p>MongoDB Documentation</p>
            </div>
            <div className="documentationLinkWrapper">
              <span className="iconWrapper">
                <AnchorButton className="icon pt-minimal pt-icon-large pt-icon-document" />
              </span>
              <p>DBEnvy Release Notes</p>
            </div>
          </div>
          <h2>Links</h2>
          <div className="linksList">
            <div className="linkWrapper">
              <AnchorButton className="icon pt-minimal pt-icon-large pt-icon-envelope" />
              <p>Twitter</p>
            </div>
            <div className="linkWrapper">
              <AnchorButton className="icon pt-minimal pt-icon-large pt-icon-code" />
              <p>Github</p>
            </div>
          </div>
        </div>
        <div className="welcomePageContentRight">
          <h2>
            News and Updates
          </h2>
          <div className="feedList">
            {this.renderFeed()}
          </div>
        </div>
      </div>
    );
  }
}
