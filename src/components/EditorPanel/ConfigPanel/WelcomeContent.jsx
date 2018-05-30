/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-04-10 14:32:37
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-22T11:43:42+10:00
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

/* eslint-disable react/no-danger */

import _ from 'lodash';
import React from 'react';
import xml2js from 'xml2js';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { AnchorButton } from '@blueprintjs/core';
import moment from 'moment';
import LoadingView from '#/common/LoadingView';
import TwitterIcon from '~/styles/icons/twitter-icon.svg';
import GithubIcon from '~/styles/icons/github-icon.svg';
import DocumentIcon from '~/styles/icons/document-solid-icon.svg';
import KodaIcon from '~/styles/icons/dbkoda-logo.svg';
import MediumIcon from '~/styles/icons/medium-logo.svg';

const FEED_URL = 'https://cors-anywhere.herokuapp.com/https://medium.com/feed/dbkoda';
const CONTENT_SUMMARY_RE = /<p>.*?<\/p>/;

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
      operatingSystem: 'unknown',
      newsJSX: null
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

  componentWillMount() {
    const url = FEED_URL + '?rnd=' + new Date().getTime();
    fetch(url)
      .then(res => {
        return res.text();
      })
      .then(body => {
        xml2js.parseString(body, (err, result) => {
          // Create new array of objects from results.
          if (err) {
            l.error('Error parsing News: ' + err);
          }
          const newsPosts = [{}, {}, {}];
          for (let i = 0; i < 3; i += 1) {
            const item = _.get(result, ['rss', 'channel', 0, 'item', i]);
            const content = _.get(item, 'content:encoded[0]');
            const summary = content.match(CONTENT_SUMMARY_RE);
            const pubDate = moment(_.get(item, 'pubDate[0]')).format('LLL');
            const link = _.get(item, 'link[0]');

            newsPosts[i].title = _.get(item, 'title[0]');
            newsPosts[i].summary = summary;
            newsPosts[i].pubDate = pubDate;
            newsPosts[i].link = link;
          }
          this.setState({ newsJSX: newsPosts });
        });
      })
      .catch(error => {
        l.error('Error fetching news: ' + error);
      });
  }

  @action.bound
  onClickBlog(number) {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal(this.state.newsJSX[number].link);
    }
  }

  @action.bound
  onClickMongoDocumentation() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://docs.mongodb.com/');
    }
  }
  @action.bound
  onClickReleaseNotes() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal(
          'https://github.com/SouthbankSoftware/dbkoda/blob/master/releaseNotes.md'
        );
    }
  }
  @action.bound
  onClickNeedHelp() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://dbkoda.useresponse.com/');
    }
  }
  @action.bound
  onClickLodgeABug() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://dbkoda.useresponse.com/topic/add');
    }
  }
  @action.bound
  onClickGettingStarted() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://dbkoda.useresponse.com/topic/add');
    }
  }

  @action.bound
  onClickTwitter() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://twitter.com/db_Koda');
    }
  }
  @action.bound
  onClickGithub() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://github.com/SouthbankSoftware/dbkoda');
    }
  }

  @action.bound
  onClickKoda() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('http://southbanksoftware.github.io/');
    }
  }

  @action.bound
  onClickMedium() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://medium.com/dbkoda');
    }
  }

  _captureAndOpenHrefExternally = e => {
    e.preventDefault();

    const { href } = e.target;

    if (IS_ELECTRON && href) {
      window.require('electron').shell.openExternal(href);
    }
  };

  render() {
    return (
      <div className="welcomePageContentWrapper">
        <div className="welcomePageContentLeft">
          <h2>Documentation</h2>
          <div className="docsContent">
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
                  <AnchorButton className="docsIcon" onClick={this.onClickGettingStarted}>
                    <DocumentIcon width={30} height={30} />
                  </AnchorButton>
                </span>
                <p>Need help getting started?</p>
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
            <div className="linksWrapper">
              <h2>Links</h2>
              <div className="linksList">
                <div className="linkWrapper">
                  <AnchorButton className="twitterIcon" onClick={this.onClickTwitter}>
                    <TwitterIcon width={50} height={50} />
                  </AnchorButton>
                </div>
                <div className="linkWrapper">
                  <AnchorButton className="gitHubIcon" onClick={this.onClickGithub}>
                    <GithubIcon width={50} height={50} />
                  </AnchorButton>
                </div>
                <div className="linkWrapper">
                  <AnchorButton className="kodaIcon" onClick={this.onClickKoda}>
                    <KodaIcon width={50} height={50} />
                  </AnchorButton>
                </div>
                <div className="linkWrapper">
                  <AnchorButton className="mediumIcon" onClick={this.onClickMedium}>
                    <MediumIcon width={50} height={50} />
                  </AnchorButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="welcomePageContentRight">
          <h2>News</h2>
          {!this.state.newsJSX && <LoadingView />}
          {this.state.newsJSX && (
            <div className="newsListWrapper">
              <div className="newsItemWrapper">
                <div className="newsContentWrapper">
                  <h2 className="newsTitle">{this.state.newsJSX[0].title}</h2>
                  <p
                    className="newsContent"
                    dangerouslySetInnerHTML={{
                      __html: this.state.newsJSX[0].summary
                    }}
                    onClick={this._captureAndOpenHrefExternally}
                  />
                  <p className="datePublished">{this.state.newsJSX[0].pubDate}</p>
                  <AnchorButton className="svgWrapper" onClick={() => this.onClickBlog(0)}>
                    Read More...
                  </AnchorButton>
                </div>
              </div>
              <div className="newsItemWrapper">
                <div className="newsContentWrapper">
                  <h2 className="newsTitle">{this.state.newsJSX[1].title}</h2>
                  <p
                    className="newsContent"
                    dangerouslySetInnerHTML={{
                      __html: this.state.newsJSX[1].summary
                    }}
                    onClick={this._captureAndOpenHrefExternally}
                  />
                  <p className="datePublished">{this.state.newsJSX[1].pubDate}</p>
                  <AnchorButton className="svgWrapper" onClick={() => this.onClickBlog(1)}>
                    Read More...
                  </AnchorButton>
                </div>
              </div>
              <div className="newsItemWrapper">
                <div className="newsContentWrapper">
                  <h2 className="newsTitle">{this.state.newsJSX[2].title}</h2>
                  <p
                    className="newsContent"
                    dangerouslySetInnerHTML={{
                      __html: this.state.newsJSX[2].summary
                    }}
                    onClick={this._captureAndOpenHrefExternally}
                  />
                  <p className="datePublished">{this.state.newsJSX[2].pubDate}</p>
                  <AnchorButton className="svgWrapper" onClick={() => this.onClickBlog(2)}>
                    Read More...
                  </AnchorButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
