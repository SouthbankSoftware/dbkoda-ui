/**
* @Author: Michael Harrison <mike>
* @Date:   2017-04-11 13:24:35
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-04-11 13:24:39
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import {inject, observer} from 'mobx-react';

/**
 * Panel for wrapping the News List.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class News extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {
      news: [
        {
          key: 1,
          title: 'Some News Update',
          icon: 'pt-icon-comment',
          content: 'This is some content, placeholder, this could contain images and or links.'
        }, {
          key: 2,
          title: 'Another News Update!',
          icon: 'pt-icon-endorsed',
          content: 'This is some more content, placeholder, this could contain images and or links.'
        }
      ]
    };
  }

  render() {
    return (
      <div className="pt-dark newsPanel">
        <h3>News</h3>
        <div className="newsArticles">
          {this
            .state
            .news
            .map((item) => {
              return (
                <div key={item.key} className="newsItem">
                  <div className="newsHeader">
                    <i className={item.icon + ' newsIcon'} />
                    <h4>{item.title}</h4>
                  </div>
                  <p>
                    {item.content}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
