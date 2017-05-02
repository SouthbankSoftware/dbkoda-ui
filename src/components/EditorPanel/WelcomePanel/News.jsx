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
          title: 'Bug Fix Update 1.2.43',
          icon: 'pt-icon-build',
          content: (<p>New release should have fixed a number of bugs with the editor, see the full list <a href="https://github.com/SouthbankSoftware/dbenvy/releases"> here </a>.<ul><li> - We broke everything.</li><li> - Then we fixed everything again.</li> <li> - We <b>think</b>...</li></ul></p>)
        }, {
          key: 2,
          title: 'DBEnvy will be at MongoWorld',
          icon: 'pt-icon-endorsed',
          content: (<p>We are pleased to announce the <b className="optInBoldDBEnvy">DBenvy</b> team will not be at <a href="https://www.mongodb.com/world17">Mongoworld</a>, please dont look for us!</p>)
        },
        {
          key: 3,
          title: 'CIEnvy 2.0 released',
          icon: 'pt-icon-automatic-updates',
          content: <p><b className="optInBoldDBEnvy">CIEnvy</b> is the worlds greatest CI platform, check it out <a href="https://github.com/SouthbankSoftware/dbenvy/releases">here </a>.</p>
        }
      ]
    };
  }

  render() {
    return (
      <div className="pt-dark newsPanel">
        <h3 className="optInBoldDBEnvy">News</h3>
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
