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
import {action, runInAction} from 'mobx';
import {inject, observer} from 'mobx-react';
import {AnchorButton} from '@blueprintjs/core';
import {featherClient} from '~/helpers/feathers';
import TwitterIcon from '../../../styles/icons/twitter-icon.svg';
import GithubIcon from '../../../styles/icons/github-icon.svg';
import DocumentIcon from '../../../styles/icons/document-icon.svg';
import WorldIcon from '../../../styles/icons/world-icon.svg';
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
      isFetchingBlogs: false
    };
  }

  @action.bound
  renderFeed() {
    if (!this.state.isFetchingBlogs && this.props.store.editorPanel.activeEditorId == 'Default') {
      this.state.isFetchingBlogs = true;
      setTimeout(() => {
        const service = featherClient().service('blog');
        service.timeout = 30000;
        service
          .get(0, {
          query: {
            number: 3, // eslint-disable-line
            options: {}
          }
        })
          .then((result) => {
            const entries = result.feed.entries;
            entries.forEach((val, index) => {
              runInAction(() => {
                this.props.store.welcomePage.newsFeed[index] = {
                  title: val.title,
                  content: val.content,
                  pubDate: val.pubDate
                };
              });
            });
            this.state.isFetchingBlogs = false;
            this.render();
          });
      }, 3000);
    }
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
      const os = require('os').type();
      console.log(os);
      window
        .require('electron')
        .shell
        .openExternal('https://github.com/SouthbankSoftware/dbkoda-mac/releases');
    }
  }
  @action.bound
  onClickNeedHelp() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('https://dbkoda.useresponse.com/');
    }
  }
  @action.bound
  onClickLodgeABug() {
    if (IS_ELECTRON) {
      const os = require('os').type();
      console.log(os);
      window
        .require('electron')
        .shell
        .openExternal('https://github.com/SouthbankSoftware/dbkoda-mac/issues');
    }
  }
  @action.bound
  onClickTwitter() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('https://twitter.com/db_Koda');
    }
  }
  @action.bound
  onClickGithub() {
    if (IS_ELECTRON) {
      const os = require('os').type();
      console.log(os);
      window
        .require('electron')
        .shell
        .openExternal('https://github.com/SouthbankSoftware/dbkoda-mac');
    }
  }
  @action.bound
  onClickKoda() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell
        .openExternal('http://southbanksoftware.github.io/');
    }
  }

  render() {
    this.renderFeed();
    if (this.props.store.welcomePage.newsFeed[2]) {
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
            <div className="feedList">
              <div className="feedItem firstItem">
                <div className="pt-icon-large pt-icon- feedIconWrapper">
                  <AnchorButton className="gitHubIcon">
                    <WorldIcon width={50} height={50} />
                  </AnchorButton>
                </div>
                <div className="feedItemContent">
                  <p className="feedItemTitle">{this.props.store.welcomePage.newsFeed[0].title}</p>
                  <p
                    className="feedItemContent"
                    dangerouslySetInnerHTML={{
                    __html: this.props.store.welcomePage.newsFeed[0].content
                  }} />
                  <p className="feedItemPubDate">{this.props.store.welcomePage.newsFeed[0].pubDate}</p>
                </div>
              </div>
              <div className="feedItem secondItem">
                <div className="pt-icon-large pt-icon- feedIconWrapper">
                  <AnchorButton className="gitHubIcon">
                    <WorldIcon width={50} height={50} />
                  </AnchorButton>
                </div>
                <div className="feedItemContent">
                  <p className="feedItemTitle">{this.props.store.welcomePage.newsFeed[1].title}</p>
                  <p
                    className="feedItemContent"
                    dangerouslySetInnerHTML={{
                    __html: this.props.store.welcomePage.newsFeed[1].content
                  }} />
                  <p className="feedItemPubDate">{this.props.store.welcomePage.newsFeed[1].pubDate}</p>
                </div>
              </div>
              <div className="feedItem thirdItem">
                <div className="pt-icon-large pt-icon- feedIconWrapper">
                  <AnchorButton className="gitHubIcon">
                    <WorldIcon width={50} height={50} />
                  </AnchorButton>
                </div>
                <div className="feedItemContent">
                  <p className="feedItemTitle">{this.props.store.welcomePage.newsFeed[2].title}</p>
                  <p
                    className="feedItemContent"
                    dangerouslySetInnerHTML={{
                    __html: this.props.store.welcomePage.newsFeed[2].content
                  }} />
                  <p className="feedItemPubDate">{this.props.store.welcomePage.newsFeed[2].pubDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
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
