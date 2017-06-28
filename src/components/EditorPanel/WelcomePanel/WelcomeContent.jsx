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
* @Author: Michael Harrison <mike>
* @Date:   2017-04-10 14:32:37
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-16T15:58:39+10:00
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/sort-comp */
import React from 'react';
import {action} from 'mobx';
import {inject, observer} from 'mobx-react';
import {AnchorButton} from '@blueprintjs/core';
import TwitterIcon from '../../../styles/icons/twitter-icon.svg';
import GithubIcon from '../../../styles/icons/github-icon.svg';
import DocumentIcon from '../../../styles/icons/document-icon.svg';
import KodaIcon from '../../../styles/icons/dbkoda-logo.svg';

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
    this.state = {
    };
  }

  @action.bound
  onClickMongoDocumentation() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('https://docs.mongodb.com/');
    }
  }
  @action.bound
  onClickReleaseNotes() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('www.google.com');
    }
  }
  @action.bound
  onClickNeedHelp() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('www.google.com');
    }
  }
  @action.bound
  onClickLodgeABug() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('www.google.com');
    }
  }
  @action.bound
  onClickTwitter() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('https://twitter.com');
    }
  }
  @action.bound
  onClickGithub() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('https://github.com/SouthbankSoftware/dbkoda');
    }
  }
  @action.bound
  onClickKoda() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('http://www.dbkoda.com/');
    }
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
                <AnchorButton className="docsIcon" onClick={this.onClickMongoDocumentation}>
                  <DocumentIcon width={30} height={30} />
                </AnchorButton>
              </span>
              <p>MongoDB Documentation</p>
            </div>
            <div className="documentationLinkWrapper">
              <span className="iconWrapper">
                <AnchorButton className="docsIcon" onClick={this.onClickReleaseNotes}>
                  <DocumentIcon width={30} height={30} />
                </AnchorButton>
              </span>
              <p>dbKoda Release Notes</p>
            </div>
            <div className="documentationLinkWrapper">
              <span className="iconWrapper">
                <AnchorButton className="docsIcon" onClick={this.onClickNeedHelp}>
                  <DocumentIcon width={30} height={30} />
                </AnchorButton>
              </span>
              <p>Get help on the forum.</p>
            </div>
            <div className="documentationLinkWrapper">
              <span className="iconWrapper">
                <AnchorButton className="docsIcon" onClick={this.onClickLodgeABug}>
                  <DocumentIcon width={30} height={30} />
                </AnchorButton>
              </span>
              <p>Found a bug? Let us know!</p>
            </div>
          </div>
          <h2>Links</h2>
          <div className="linksList">
            <div className="linkWrapper">
              <AnchorButton className="twitterIcon" onClick={this.onClickTwitter}>
                <TwitterIcon width={50} height={50} />
              </AnchorButton>
              <p>Twitter</p>
            </div>
            <div className="linkWrapper">
              <AnchorButton className="gitHubIcon" onClick={this.onClickGithub}>
                <GithubIcon width={50} height={50} />
              </AnchorButton>
              <p>Github</p>
            </div>
            <div className="linkWrapper">
              <AnchorButton className="kodaIcon" onClick={this.onClickKoda}>
                <KodaIcon width={50} height={50} />
              </AnchorButton>
              <p>dbKoda</p>
            </div>
          </div>
        </div>
        <div className="welcomePageContentRight">
          <h2>
            News and Updates
          </h2>
        </div>
      </div>
    );
  }
}
