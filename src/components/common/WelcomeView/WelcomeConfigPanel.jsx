/**
 * @Author: Michael Harrison <mike>, Guan Gui <guiguan>
 * @Date:   2018-07-11T14:18:05+10:00
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-12T23:16:00+10:00
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

import _ from 'lodash';
import * as React from 'react';
import autobind from 'autobind-decorator';
import xml2js from 'xml2js';
import { inject } from 'mobx-react';
import { AnchorButton } from '@blueprintjs/core';
import moment from 'moment';
import LoadingView from '#/common/LoadingView';
import { NavPanes } from '#/common/Constants';
import TwitterIcon from '~/styles/icons/twitter-icon.svg';
import GithubIcon from '~/styles/icons/github-icon.svg';
import DocumentIcon from '~/styles/icons/document-solid-icon.svg';
import KodaIcon from '~/styles/icons/dbkoda-logo.svg';
import MediumIcon from '~/styles/icons/medium-logo.svg';
import GettingStartedBlog from '~/styles/icons/color/blog-guide-icon.svg';
import GettingStartedVideo from '~/styles/icons/color/video-icon.svg';
import NewProfileIcon from '~/styles/icons/color/create-profile-icon.svg';
import './WelcomeConfigPanel.scss';

const FEED_URL = 'https://cors-anywhere.herokuapp.com/https://medium.com/feed/dbkoda';
const CONTENT_SUMMARY_RE = /<p>.*?<\/p>/;

@inject(allStores => ({
  store: allStores.store,
  drawer: allStores.store.drawer
}))
export default class WelcomeConfigPanel extends React.Component<*> {
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

  @autobind
  onClickBlog(number) {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal(this.state.newsJSX[number].link);
    }
  }

  @autobind
  onClickMongoDocumentation() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://docs.mongodb.com/');
    }
  }
  @autobind
  onClickReleaseNotes() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal(
          'https://github.com/SouthbankSoftware/dbkoda/blob/master/releaseNotes.md'
        );
    }
  }
  @autobind
  onClickNeedHelp() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://dbkoda.useresponse.com/');
    }
  }
  @autobind
  onClickLodgeABug() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://dbkoda.useresponse.com/topic/add');
    }
  }
  @autobind
  onClickGettingStarted() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal(
          'https://medium.com/dbkoda/getting-started-with-mongodb-and-dbkoda-816da494005'
        );
    }
  }

  @autobind
  onClickTwitter() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://twitter.com/db_Koda');
    }
  }
  @autobind
  onClickGithub() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://github.com/SouthbankSoftware/dbkoda');
    }
  }

  @autobind
  onClickKoda() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('http://southbanksoftware.github.io/');
    }
  }

  @autobind
  onClickMedium() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://medium.com/dbkoda');
    }
  }

  @autobind
  _onClickGettingStartedBlog() {
    if (IS_ELECTRON) {
      window
        .require('electron')
        .shell.openExternal('https://medium.com/dbkoda/a-beginners-guide-to-dbkoda-50c2c2897108');
    }
  }

  @autobind
  _onClickGettingStartedVideo() {
    if (IS_ELECTRON) {
      window.require('electron').shell.openExternal('https://youtu.be/9_jRnWUlSR4');
    }
  }

  @autobind
  _onClickNewConnection() {
    this.props.store.setActiveNavPane(NavPanes.PROFILE);
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
      <div className="WelcomeConfigPanel">
        <div className="welcomeText">
          <span className="welcomeText">{globalString('editor/home/welcome')}</span>
        </div>
        <div className="welcomePageContentWrapper">
          <div className="welcomePageGetStarted">
            <h2 className="getStartedText"> {globalString('editor/home/gettingStartedTitle')} </h2>
            <div className="linksList">
              <div className="iconWrapper">
                <AnchorButton
                  className="gettingStartedBlogIcon blog"
                  onClick={this._onClickGettingStartedBlog}
                >
                  <GettingStartedBlog width={65} height={65} />
                </AnchorButton>
                <span className="iconText">
                  {globalString('editor/home/gettingStartedBlogText')}
                </span>
              </div>
              <div className="iconWrapper">
                <AnchorButton
                  className="gettingStartedVideoIcon video"
                  onClick={this._onClickGettingStartedVideo}
                >
                  <GettingStartedVideo width={75} height={75} />
                </AnchorButton>
                <span className="iconText">
                  {globalString('editor/home/gettingStartedVideoText')}
                </span>
              </div>
              <div className="iconWrapper">
                <AnchorButton className="newProfileButton new" onClick={this._onClickNewConnection}>
                  <NewProfileIcon width={75} height={75} />
                </AnchorButton>
                <span className="iconText">{globalString('editor/home/gettingStartedNew')}</span>
              </div>
            </div>
          </div>
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
                      // eslint-disable-next-line react/no-danger
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
                      // eslint-disable-next-line react/no-danger
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
                      // eslint-disable-next-line react/no-danger
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
      </div>
    );
  }
}
