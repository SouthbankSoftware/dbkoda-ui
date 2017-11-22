/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-04-10 14:32:37
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-22T16:41:16+11:00
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

/* eslint-disable react/no-string-refs, react/sort-comp */

import React from 'react';
import xml2js from 'xml2js';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { AnchorButton } from '@blueprintjs/core';
import TwitterIcon from '../../../styles/icons/twitter-icon.svg';
import GithubIcon from '../../../styles/icons/github-icon.svg';
import DocumentIcon from '../../../styles/icons/document-icon.svg';
import KodaIcon from '../../../styles/icons/dbkoda-logo.svg';

const FEED_URL = 'https://www.dbkoda.com/feed.xml';
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
      newsJSX: null,
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
    const url = FEED_URL + '?rnd=' + (new Date()).getTime();
    fetch(url)
      .then((res) => {
        return res.text();
      })
      .then((body) => {
        xml2js.parseString(body, (err, result) => {
          // Create new array of objects from results.
          if (err) {
            console.error('Error parsing News: ' + err);
          }
          const newsPosts = [{}, {}, {}];
          for (let i = 0; i < 3; i += 1) {
            newsPosts[i].title = result.feed.entry[i].title[0]._;
            newsPosts[i].summary = result.feed.entry[i].summary[0]._;
            newsPosts[i].published = {
              day: result.feed.entry[i].published[0].substring(8, 10),
              month: result.feed.entry[i].published[0].substring(5, 7),
              year: result.feed.entry[i].published[0].substring(0, 4),
            };
            switch (parseInt(newsPosts[i].published.month, 10)) {
              case 1:
                newsPosts[i].published.month = 'January';
                break;
              case 2:
                newsPosts[i].published.month = 'February';
                break;
              case 3:
                newsPosts[i].published.month = 'March';
                break;
              case 4:
                newsPosts[i].published.month = 'April';
                break;
              case 5:
                newsPosts[i].published.month = 'May';
                break;
              case 6:
                newsPosts[i].published.month = 'June';
                break;
              case 7:
                newsPosts[i].published.month = 'July';
                break;
              case 8:
                newsPosts[i].published.month = 'August';
                break;
              case 9:
                newsPosts[i].published.month = 'September';
                break;
              case 10:
                newsPosts[i].published.month = 'October';
                break;
              case 11:
                newsPosts[i].published.month = 'November';
                break;
              case 12:
                newsPosts[i].published.month = 'December';
                break;
              default:
                newsPosts[i].published.month = 'Unknown';
                break;
            }
            // Parse date into readable format.
            newsPosts[i].link = result.feed.entry[i].link[0].$.href;
          }
          this.setState({ newsJSX: newsPosts });
        });
      })
      .catch((error) => {
        console.error('Error fetching news: ' + error);
      });
  }

  @action.bound
  onClickBlog(number) {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal(this.state.newsJSX[number].link);
    }
  }

  @action.bound
  onClickMongoDocumentation() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('https://docs.mongodb.com/');
    }
  }
  @action.bound
  onClickReleaseNotes() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal(
          'https://github.com/SouthbankSoftware/dbkoda/blob/master/releaseNotes.md',
        );
    }
  }
  @action.bound
  onClickNeedHelp() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('https://dbkoda.useresponse.com/');
    }
  }
  @action.bound
  onClickLodgeABug() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('https://dbkoda.useresponse.com/topic/add');
    }
  }

  @action.bound
  onClickTwitter() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('https://twitter.com/db_Koda');
    }
  }
  @action.bound
  onClickGithub() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('https://github.com/SouthbankSoftware/dbkoda');
    }
  }

  @action.bound
  onClickKoda() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('http://southbanksoftware.github.io/');
    }
  }

  render() {
    return (
      <div className="welcomePageContentWrapper">
        <div className="welcomePageContentLeft">
          <h2>Documentation</h2>
          <div className="docsContent">
            <div className="docsList">
              <div className="documentationLinkWrapper">
                <span className="iconWrapper">
                  <AnchorButton
                    className="docsIcon"
                    onClick={this.onClickMongoDocumentation}
                  >
                    <DocumentIcon width={30} height={30} />
                  </AnchorButton>
                </span>
                <p>MongoDB Documentation</p>
              </div>
              <div className="documentationLinkWrapper">
                <span className="iconWrapper">
                  <AnchorButton
                    className="docsIcon"
                    onClick={this.onClickReleaseNotes}
                  >
                    <DocumentIcon width={30} height={30} />
                  </AnchorButton>
                </span>
                <p>dbKoda Release Notes</p>
              </div>
              <div className="documentationLinkWrapper">
                <span className="iconWrapper">
                  <AnchorButton
                    className="docsIcon"
                    onClick={this.onClickNeedHelp}
                  >
                    <DocumentIcon width={30} height={30} />
                  </AnchorButton>
                </span>
                <p>Get help on the forum.</p>
              </div>
              <div className="documentationLinkWrapper">
                <span className="iconWrapper">
                  <AnchorButton
                    className="docsIcon"
                    onClick={this.onClickLodgeABug}
                  >
                    <DocumentIcon width={30} height={30} />
                  </AnchorButton>
                </span>
                <p>Found a bug? Let us know!</p>
              </div>
            </div>
            <h2>Links</h2>
            <div className="linksList">
              <div className="linkWrapper">
                <AnchorButton
                  className="twitterIcon"
                  onClick={this.onClickTwitter}
                >
                  <TwitterIcon width={50} height={50} />
                </AnchorButton>
                <p>Twitter</p>
              </div>
              <div className="linkWrapper">
                <AnchorButton
                  className="gitHubIcon"
                  onClick={this.onClickGithub}
                >
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
        </div>
        <div className="welcomePageContentRight">
          <h2>News</h2>
          {this.state.newsJSX &&
            <div className="newsListWrapper">
              <div className="newsItemWrapper">
                <div className="newsIconWrapper">
                  <AnchorButton
                    className="svgWrapper"
                    onClick={() => this.onClickBlog(0)}
                  >
                    <KodaIcon width={40} height={40} />
                  </AnchorButton>
                </div>
                <div className="newsContentWrapper">
                  <h2 className="newsTitle">
                    {this.state.newsJSX[0].title}
                  </h2>
                  <p className="newsContent">
                    {this.state.newsJSX[0].summary}
                  </p>
                  <p className="datePublished">
                    {this.state.newsJSX[0].published.month +
                      ' ' +
                      this.state.newsJSX[0].published.day +
                      ' ' +
                      this.state.newsJSX[0].published.year}
                  </p>
                </div>
              </div>
              <div className="newsItemWrapper">
                <div className="newsIconWrapper">
                  <AnchorButton
                    className="svgWrapper"
                    onClick={() => this.onClickBlog(1)}
                  >
                    <KodaIcon width={40} height={40} />
                  </AnchorButton>
                </div>
                <div className="newsContentWrapper">
                  <h2 className="newsTitle">
                    {this.state.newsJSX[1].title}
                  </h2>
                  <p className="newsContent">
                    {this.state.newsJSX[1].summary}
                  </p>
                  <p className="datePublished">
                    {this.state.newsJSX[1].published.month +
                      ' ' +
                      this.state.newsJSX[1].published.day +
                      ' ' +
                      this.state.newsJSX[1].published.year}
                  </p>
                </div>
              </div>
              <div className="newsItemWrapper">
                <div className="newsIconWrapper">
                  <AnchorButton
                    className="svgWrapper"
                    onClick={() => this.onClickBlog(2)}
                  >
                    <KodaIcon width={40} height={40} />
                  </AnchorButton>
                </div>
                <div className="newsContentWrapper">
                  <h2 className="newsTitle">
                    {this.state.newsJSX[2].title}
                  </h2>
                  <p className="newsContent">
                    {this.state.newsJSX[2].summary}
                  </p>
                  <p className="datePublished">
                    {this.state.newsJSX[2].published.month +
                      ' ' +
                      this.state.newsJSX[2].published.day +
                      ' ' +
                      this.state.newsJSX[2].published.year}
                  </p>
                </div>
              </div>
            </div>}
        </div>
      </div>
    );
  }
}
