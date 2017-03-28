/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-15T10:54:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-28T12:32:56+11:00
*/

import React from 'react';
import { observer, inject } from 'mobx-react';
import { computed } from 'mobx';
import { DragSource } from 'react-dnd';
import { DragItemTypes } from '#/common/Constants.js';

const labelSource = {
  beginDrag(props) {
    return { label: props.label, type: props.type, id: props.id, refParent: props.refParent };
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

/**
 * Defines the label of tree component which is dragable using react-dnd
 */
@inject('treeState')
@observer
class DragLabel extends React.Component {
  get ServerName() {
    const serverName = this.props.label;
    let newServerName = serverName;
    const dotPos = serverName.indexOf('.');
    const colonPos = serverName.indexOf(':');
    if (colonPos + dotPos > 1) {
      newServerName = serverName.substr(0, dotPos) + serverName.substr(colonPos);
    }
    return newServerName;
  }
  @computed get FilteredTextLabel() {
    const filterText = this.props.treeState.filter;
    const strText = this.props.label;
    const matchStart = strText.toLowerCase().indexOf(filterText.toLowerCase());
    if (filterText != '' && matchStart >= 0) {
      const matchEnd = matchStart + (filterText.length - 1);
      const beforeMatch = strText.slice(0, matchStart);
      const matchText = strText.slice(matchStart, matchEnd + 1);
      const afterMatch = strText.slice(matchEnd + 1);
      return <span>{beforeMatch}<mark>{matchText}</mark>{afterMatch}</span>;
    }
    if (this.props.type == 'shard' || this.props.type == 'config') {
      return this.ServerName;
    }
    return strText;
  }
  render() {
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <span
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
        }}
      >{this.FilteredTextLabel}</span>,
    );
  }
}

DragLabel.propTypes = {
  label: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  connectDragSource: React.PropTypes.func.isRequired,
  isDragging: React.PropTypes.bool.isRequired,
};

export default DragSource(DragItemTypes.LABEL, labelSource, collect)(DragLabel);
