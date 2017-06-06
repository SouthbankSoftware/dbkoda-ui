/**
 * Created by joey on 6/6/17.
 */



import React from 'react';
import './style.scss';

/**
 * common statistic view panel
 */
export default ({explains}) => {
  const {executionStats} = explains;
  return (<div className="explain-statistic-view">
    <div className="header">
      <div>{globalString('explain/view/statisticHeader')}</div>
      <div>Value</div>
    </div>
    <div className="row">
      <div>{globalString('explain/view/docsReturned')}</div>
      <div>{executionStats.nReturned}</div>
    </div>
    <div className="row">
      <div>{globalString('explain/view/keysExamined')}</div>
      <div>{executionStats.totalKeysExamined}</div>
    </div>
    <div className="row">
      <div>{globalString('explain/view/docsExamined')}</div>
      <div>{executionStats.totalDocsExamined}</div>
    </div>
  </div>);
};
