import React from 'react';
import {Button, Tab2, Tabs2, Text} from '@blueprintjs/core';
import {Table, Cell, Column} from '@blueprintjs/table';
import './style.scss';

const ExplainView = ({explains}) => {
  if (!explains.output) {
    return null;
  }
  console.log('explains:', explains);
  const output = JSON.parse(explains.output);
  console.log('output:', output);
  return (<div className="explain-view-panel">

    <div>Namespace: {output.queryPlanner.namespace}</div>
    <div>Query: {explains.command}</div>
    <table className="pt-table">
      <tr>
        <td>Document Returned:</td>
      </tr>
      <tr>
        <td>Index Keys Examined:</td>
      </tr>
      <tr>
        <td>Technologies:</td>
      </tr>
    </table>
  </div>);
};

ExplainView.propTypes = {
  explains: React.PropTypes.object.isRequired,
};

ExplainView.defaultProps = {
  explains: {},
};


export default ExplainView;
