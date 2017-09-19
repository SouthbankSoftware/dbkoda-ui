/**
 * Simple Component for wrapping a row with a context menu.
 */
import React from 'react';

export default class RowWrapper extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.debug = false;
  }

  render() {
    const classes = 'rowWrapper ' + this.props.rowNumber;
    return <tr className={classes} />;
  }
}
