/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-15T10:54:51+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-19T16:22:04+10:00
*/

import React from 'react';
import { observer, inject } from 'mobx-react';
import { computed } from 'mobx';
import { DragSource } from 'react-dnd';
import { DragItemTypes } from '#/common/Constants.js';

const labelSource = {
  /**
   * drag call back function with attached the props with the element being dragged
   * @param  {object} props props of this element from which the drag process is being initiated
   * @return {object}       returns the props to be passed on to drop target
   */
  beginDrag(props) {
    return { label: props.label, type: props.type, id: props.id, refParent: props.refParent };
  },
};
/**
 * Collect the information required by the connector and inject it into the react component as props
 * @param {} connect - connectors let you assign one of the predefined roles (a drag source, a drag preview, or a drop target) to the DOM nodes
 * @param {} monitor - keeps the state of drag process, e.g object which is being dragged
 * @return {object} props object for component
 */
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
  /**
   * Get the trimmed server name in case of server config/shard treeNode
   */
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
  /**
   * Returns the text of the label to render with filtered text highlighted
   * @return {string} - HTML text
   */
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
    if (
      this.props.type == 'shard' ||
      this.props.type == 'config' ||
      this.props.type == 'mongos' ||
      this.props.type == 'replica_member' ||
      this.props.type == 'primary' ||
      this.props.type == 'secondary' ||
      this.props.type == 'arbiter'
    ) {
      return this.ServerName;
    }
    return strText;
  }
  /**
   * Main Render method of this React Component
   * @return {connectDragSource} - returns the react component with the dragDrop api wrapper.
   */
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
