/**
 * show explain raw json
 *
 */
import React from 'react';
import {action, toJS} from 'mobx';
import JSONTree from 'react-json-tree';
import {theme} from './JsonTreeTheme';

const RawJson = ({explains}) => {
  if (!explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  return (<div className="explain-json-raw-panel">
    <JSONTree data={output} invertTheme={false}  theme={theme}/>
  </div>);
};


RawJson.propTypes = {
  explains: React.PropTypes.object.isRequired,
};

RawJson.defaultProps = {
  explains: {},
};

export default RawJson;