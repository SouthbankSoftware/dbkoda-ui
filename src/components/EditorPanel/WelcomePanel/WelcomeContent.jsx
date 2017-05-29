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
import {action, runInAction} from 'mobx';
import {inject, observer} from 'mobx-react';
import {AnchorButton} from '@blueprintjs/core';
import {featherClient} from '~/helpers/feathers';
import TwitterIcon from '../../../styles/icons/twitter-icon.svg';
import GithubIcon from '../../../styles/icons/github-icon.svg';
import DocumentIcon from '../../../styles/icons/document-icon.svg';
import WorldIcon from '../../../styles/icons/world-icon.svg';
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
                  <AnchorButton className="docsIcon">
                    <DocumentIcon width={30} height={30} />
                  </AnchorButton>
                </span>
                <p>MongoDB Documentation</p>
              </div>
              <div className="documentationLinkWrapper">
                <span className="iconWrapper">
                  <AnchorButton className="docsIcon">
                    <DocumentIcon width={30} height={30} />
                  </AnchorButton>
                </span>
                <p>dbCoda Release Notes</p>
              </div>
            </div>
            <h2>Links</h2>
            <div className="linksList">
              <div className="linkWrapper">
                <AnchorButton className="twitterIcon">
                  <TwitterIcon width={50} height={50} />
                </AnchorButton>
                <p>Twitter</p>
              </div>
              <div className="linkWrapper">
                <AnchorButton className="gitHubIcon">
                  <GithubIcon width={50} height={50} />
                </AnchorButton>
                <p>Github</p>
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
                <AnchorButton className="icon pt-minimal pt-icon-large pt-icon-document" />
              </span>
              <p>MongoDB Documentation</p>
            </div>
            <div className="documentationLinkWrapper">
              <span className="iconWrapper">
                <AnchorButton className="icon pt-minimal pt-icon-large pt-icon-document" />
              </span>
              <p>dbCoda Release Notes</p>
            </div>
          </div>
          <h2>Links</h2>
          <div className="linksList">
            <div className="linkWrapper">
              <AnchorButton className="icon twitterIcon" />
              <p>Twitter</p>
            </div>
            <div className="linkWrapper">
              <AnchorButton className="icon gitHubIcon" />
              <p>Github</p>
            </div>
          </div>
        </div>
        <div className="welcomePageContentRight">
          <h2>
            News and Updates
          </h2>
          <div className="feedList" />
        </div>
      </div>
    );
  }
}
