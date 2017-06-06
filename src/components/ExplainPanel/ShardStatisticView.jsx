/**
 * Created by joey on 6/6/17.
 */


import React from 'react';
import './style.scss';


const getAllShardStatistics = (explains) => {
  const shards = explains.executionStats.executionStages.shards;
  const allShards = [];
  shards.map((shard) => {
    const oneShard = [];
    let cursor = shard.executionStages;
    while (cursor) {
      oneShard.push(cursor);
      cursor = cursor.inputStage;
    }
    // get the executionTimeMillisEstimate and nReturned from the first child, docsExamined from the deepest child
    oneShard[0].docsExamined = oneShard[oneShard.length - 1].docsExamined;
    oneShard[0].shardName = shard.shardName;
    allShards.push(oneShard);
  });
  return allShards;
};

export const getWorstShardStatistics = (explains) => {
  const allShards = getAllShardStatistics(explains);
  const worstShards = [];
  allShards.map((shards) => {
    worstShards.push(shards[0]);
  });
  return worstShards;
};

/**
 * shard statistic view panel
 */
export default ({explains}) => {
  const shardStatistics = getWorstShardStatistics(explains);
  return (<div className="explain-shards-statistic-view">
    <div className="header">
      <div className="column">{globalString('explain/statistics/shard')}</div>
      <div className="column">{globalString('explain/statistics/examined')}</div>
      <div className="column">{globalString('explain/statistics/returned')}</div>
      <div className="column">{globalString('explain/statistics/ms')}</div>
    </div>
    {
      shardStatistics.map((shard) => {
        return (<div className="row" key={shard.shardName}>
          <div className="cell">{shard.shardName}</div>
          <div className="cell">{shard.docsExamined}</div>
          <div className="cell">{shard.nReturned}</div>
          <div className="cell">{shard.executionTimeMillisEstimate}</div>
        </div>);
      })
    }
  </div>);
};
