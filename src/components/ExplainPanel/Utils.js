/**
 * Created by joey on 6/6/17.
 */

export const getWorstStage = (stages) => {
  let max = 0;
  stages.map((stage) => {
    let time = stage.executionTimeMillisEstimate;
    if (time === undefined) {
      time = stage.executionTimeMillis;
    } else if (stage.executionTimeMillis !== undefined) {
      time = Math.max(time, stage.executionTimeMillis);
    }
    if (max < time) {
      max = time;
    }
  });
  return max;
};

export const getWorstShardStages = (shards) => {
  let max = -1;
  let worst = null;
  let shardName = null;
  shards.map((shard) => {
    if (shard && shard.stages && shard.stages.length > 0) {
      if (worst === null) {
        worst = shard.stages;
      }
      const worstStageTime = getWorstStage(shard.stages);
      if (max < worstStageTime) {
        max = worstStageTime;
        shardName = shard.shardName;
        worst = shard.stages;
      }
    }
  });
  return {shardName, worst};
};

export const getStageElapseTime = (stage) => {
  return stage && stage.executionTimeMillisEstimate !== undefined ? stage.executionTimeMillisEstimate : stage.executionTimeMillis;
};

const coloursTheme = ['#24a26e', '#29bc7f', '#43d698', '#6ddfaf', '#96e8c6', '#debabd', '#ce979c', '#be747c', '#ad525b', '#8a4148'];

export const generateColorValueByTime = (stage, number, max, min) => {
  const yellow = '#f0c419';
  const red = '#8a4148';
  const green = '#24a26e';
  const greenValue = 9;
  const redValue = 0;
  const defaultColor = green; // '#516E72';
  if (stage.stage === 'COLLSCAN') {
    if (stage.docsExamined > stage.nReturned * 1.1) {
      return red;
    }
  }
  // if (stageTime === max && stageTime > min && stage.stage !== 'SHARD_MERGE') {
  //   return yellow;
  // }
  if (stage.stage === 'COLLSCAN' || stage.stage === 'SORT') {
    return yellow;
  }

  // const best = 0x8a4148;
  // const worst = 0x24a26e;
  if (max === min) {
    return defaultColor;
  }
  const value = parseInt((((getStageElapseTime(stage) - min) * (greenValue - redValue)) / (max - min)) + redValue, 10);
  return coloursTheme[value];
};
