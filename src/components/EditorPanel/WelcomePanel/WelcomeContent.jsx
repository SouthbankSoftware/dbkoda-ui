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
    if (!this.state.isFetchingBlogs) {
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
          });
      }, 2000);
    }
  }

  render() {
    this.renderFeed();
    console.log('Feed List: ', this.props.store.welcomePage.newsFeed);
    const val1 = this.props.store.welcomePage.newsFeed[0];
    const val2 = this.props.store.welcomePage.newsFeed[1];
    const val3 = this.props.store.welcomePage.newsFeed[2];
    if (val3) {
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
              <div className="feedItem firstItem">
                <div className="pt-icon-large pt-icon- feedIconWrapper">
                  I
                </div>
                <div className="feedItemContent">
                  <p className="feedItemTitle">{val1.title}</p>
                  <p
                    className="feedItemContent"
                    dangerouslySetInnerHTML={{
                    __html: val1.content
                  }} />
                  <p className="feedItemPubDate">{val1.pubDate}</p>
                </div>
              </div>
              <div className="feedItem secondItem">
                <div className="pt-icon-large pt-icon- feedIconWrapper">
                  I
                </div>
                <div className="feedItemContent">
                  <p className="feedItemTitle">{val2.title}</p>
                  <p
                    className="feedItemContent"
                    dangerouslySetInnerHTML={{
                    __html: val2.content
                  }} />
                  <p className="feedItemPubDate">{val2.pubDate}</p>
                </div>
              </div>
              <div className="feedItem thirdItem">
                <div className="pt-icon-large pt-icon- feedIconWrapper">
                  I
                </div>
                <div className="feedItemContent">
                  <p className="feedItemTitle">{val3.title}</p>
                  <p
                    className="feedItemContent"
                    dangerouslySetInnerHTML={{
                    __html: val3.content
                  }} />
                  <p className="feedItemPubDate">{val3.pubDate}</p>
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
          <div className="feedList" />
        </div>
      </div>
    );
  }
}
