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
