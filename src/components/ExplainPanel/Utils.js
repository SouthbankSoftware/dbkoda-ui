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

export const generateColorValueByTime = (stage, number, max, min) => {
  console.log('generate ', stage, number, max, min);
  const yellow = '#f0c419';
  const red = '#24a26e';
  const green = '#8a4148';
  const greenValue = parseInt(green.substr(1, green.length - 1), 16);
  const redValue = parseInt(red.substr(1, green.length - 1), 16);
  const stageTime = getStageElapseTime(stage);
  const defaultColor = '#516E72';
  if (stage.stage === 'COLLSCAN') {
    if (stage.docsExamined > stage.nReturned * 2) {
      return red;
    }
  }
  if (stageTime === max && stageTime > min) {
    return yellow;
  }
  if (stage.stage === 'COLLSCAN' || stage.stage === 'SORT') {
    return yellow;
  }

  // const best = 0x8a4148;
  // const worst = 0x24a26e;
  if (max === min) {
    return defaultColor;
  }
  const value = parseInt((((getStageElapseTime(stage) - min) * (greenValue - redValue)) / (max - min)) + redValue, 10);
  console.log('min=', min, ',max=', max, ', red=', redValue + ',green=', greenValue);
  console.log('stage color calculation:', getStageElapseTime(stage), value);
  console.log(`#${value.toString(16)}`);
  return `#${value.toString(16)}`;
};
