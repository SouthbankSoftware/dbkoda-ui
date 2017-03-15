/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-15T10:54:51+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T11:32:43+11:00
*/



import React from 'react';

export default class DragLabel extends React.Component {
  render() {
    return <span>{this.props.label}</span>;
  }
}

DragLabel.propTypes = {
  label: React.PropTypes.string.isRequired
};
