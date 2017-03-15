/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-15 13:40:45
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:40:42
*/

/* eslint-disable react/prop-types */
import {inject} from 'mobx-react';

const React = require('react');

@inject('store')
export default class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="editorView">
        <h3>Profile List</h3>
      </div>
    );
  }
}
