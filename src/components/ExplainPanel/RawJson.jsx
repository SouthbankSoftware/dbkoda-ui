/**
 * show explain raw json
 *
 */
import React from 'react';
import {action} from 'mobx';
import JSONTree from 'react-json-tree';


const RawJson = ({explains}) => {
  if (!explains.output) {
    return null;
  }
  const output = JSON.parse(explains.output);
  return (<div className="explain-json-raw-panel">
    <JSONTree data={output} />
  </div>);
};


RawJson.propTypes = {
  explains: React.PropTypes.object.isRequired,
};

RawJson.defaultProps = {
  explains: {},
};

export default RawJson;
