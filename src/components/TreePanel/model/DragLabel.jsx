/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-15T10:54:51+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T12:41:45+11:00
*/

import React from 'react';
import { DragSource } from 'react-dnd';
import { DragItemTypes } from '#/common/Constants.js';

const labelSource = {
  beginDrag(props) {
    return { label: props.label };
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

class DragLabel extends React.Component {
  render() {
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <span
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
        }}
      >{this.props.label}</span>,
    );
  }
}

DragLabel.propTypes = {
  label: React.PropTypes.string.isRequired,
  connectDragSource: React.PropTypes.func.isRequired,
  isDragging: React.PropTypes.bool.isRequired,
};

export default DragSource(DragItemTypes.LABEL, labelSource, collect)(DragLabel);
