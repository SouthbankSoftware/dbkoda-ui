/**
 * Created by joey on 6/6/17.
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import './style.scss';
import { getStageElapseTime, generateColorValueByTime } from './Utils';

export const Stage = ({
  stage,
  maxNumChildren,
  head,
  shardName = '',
  adjustMarginTop = 0,
  minElapseTime,
  maxElapseTime,
  stageNumber,
  hasInnerBranch,
  innerMaxLength,
}) => {
  const style = {};
  let className = head ? 'explain-stage explain-stage-array' : 'explain-stage';
  className = !stage ? 'explain-stage empty-explain-stage' : className;
  if (maxNumChildren > 1) {
    if (hasInnerBranch) {
      const f = innerMaxLength % 2 === 0 ? 32.5 : 30;
      const factor = maxNumChildren % 2 === 0 ? 35.5 : f;
      style.marginTop = (maxNumChildren - 1) * factor;
    } else {
      const factor = maxNumChildren % 2 === 0 ? 35.5 : 32.5;
      style.marginTop = (maxNumChildren - 1) * factor;
    }
  }
  if (adjustMarginTop) {
    if (!style.marginTop) {
      style.marginTop = adjustMarginTop;
    } else {
      style.marginTop += adjustMarginTop;
    }
  }
  const shardStyle = {};
  if (shardName) {
    shardStyle.maxWidth = 200;
  }
  const stageName = stage ? stage.stage : '';
  const color = generateColorValueByTime(stage, stageNumber, maxElapseTime, minElapseTime);
  return (
    <div className="explain-stage-wrapper" style={shardStyle}>
      <span className="explain-stage-shard-name">{shardName}</span>
      <div className={className} style={{ ...style, backgroundColor: color }}>
        <div className="stage-label">{stageName}</div>
        <div className="after" style={{ borderLeftColor: color }} />
      </div>
    </div>
  );
};

const getMinMaxElapseTime = (stage, minTime, maxTime) => {
  let minElapseTime = minTime;
  let maxElapseTime = maxTime;
  if (minElapseTime === null) {
    minElapseTime = getStageElapseTime(stage);
  }
  if (maxElapseTime == null) {
    maxElapseTime = getStageElapseTime(stage);
  }
  if (minElapseTime > getStageElapseTime(stage)) {
    minElapseTime = getStageElapseTime(stage);
  }
  if (maxElapseTime < getStageElapseTime(stage)) {
    maxElapseTime = getStageElapseTime(stage);
  }
  return { minElapseTime, maxElapseTime };
};

export default ({ stages, shardNames, shardNumber }) => {
  let maxNumChildren = 1;
  let innerMaxLength = 1;
  let hasInnerBranch = false;
  const columnHasBranch = []; // whether the column has branch stages
  let stageNumber = 0; // the number of all stages
  let minElapseTime = null;
  let maxElapseTime = null;
  stages.map((stage, i) => {
    columnHasBranch[i] = false;
    if (stage.constructor === Array && maxNumChildren < stage.length) {
      maxNumChildren = stage.length;
      stage.map((inner) => {
        if (inner) {
          if (inner.constructor === Array && innerMaxLength < inner.length) {
            columnHasBranch[i] = true;
            innerMaxLength = inner.length;
            hasInnerBranch = true;
            stageNumber += inner.length;
            inner.map((s) => {
              minElapseTime = getMinMaxElapseTime(s, minElapseTime, maxElapseTime).minElapseTime;
              maxElapseTime = getMinMaxElapseTime(s, minElapseTime, maxElapseTime).maxElapseTime;
            });
          } else {
            minElapseTime = getMinMaxElapseTime(inner, minElapseTime, maxElapseTime).minElapseTime;
            maxElapseTime = getMinMaxElapseTime(inner, minElapseTime, maxElapseTime).maxElapseTime;
            stageNumber += 1;
          }
        }
      });
    } else {
      stageNumber += 1;
      minElapseTime = getMinMaxElapseTime(stage, minElapseTime, maxElapseTime).minElapseTime;
      maxElapseTime = getMinMaxElapseTime(stage, minElapseTime, maxElapseTime).maxElapseTime;
    }
  });
  return (
    <div className="explain-stage-progress">
      {stages.map((stage, i) => {
        const id = i;
        if (stage.constructor === Array) {
          const style = {};
          if (i === 0 && shardNames && shardNames.length > 0) {
            style.maxWidth = 200;
          }
          return (
            <div style={style} className="explain-stage-tree-root" key={`${id}`}>
              {stage.map((s, j) => {
                let shardName = '';
                if (i === 0 && s) {
                  shardName = s.shardName;
                }
                const sid = j;
                if (s && s.constructor === Array) {
                  if (i === 0) {
                    if (s[0]) {
                      shardName = s[0].shardName;
                    } else if (stages[stages.length - 2] && stages[stages.length - 2][j]) {
                      // if the element is null, find the second last column at the same position on j
                      shardName = stages[stages.length - 2][j].shardName;
                    }
                  }
                  return (
                    <div style={{ display: 'flex' }}>
                      <span style={{ alignSelf: 'center', color: '#BFBEC0' }}>{shardName}</span>
                      <div style={{ flex: 1 }}>
                        {s.map((inner, iid) => {
                          const innerId = `${sid}-${iid}`;
                          return (
                            <Stage
                              stage={inner}
                              key={`${s && s.stage} - ${innerId}`}
                              maxNumChildren={1}
                              head={false}
                              minElapseTime={minElapseTime}
                              maxElapseTime={maxElapseTime}
                              stageNumber={stageNumber}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                if (hasInnerBranch) {
                  const length = columnHasBranch[i] ? 1 : innerMaxLength;
                  return (
                    <Stage
                      stage={s}
                      key={`${s && s.stage} - ${sid}`}
                      maxNumChildren={length}
                      head={false}
                      minElapseTime={minElapseTime}
                      maxElapseTime={maxElapseTime}
                      stageNumber={stageNumber}
                      shardName={shardName}
                      hasInnerBranch={hasInnerBranch}
                    />
                  );
                }
                return (
                  <Stage
                    stage={s}
                    key={`${s && s.stage} - ${sid}`}
                    maxNumChildren={1}
                    head={false}
                    minElapseTime={minElapseTime}
                    maxElapseTime={maxElapseTime}
                    stageNumber={stageNumber}
                    shardName={shardName}
                    hasInnerBranch={hasInnerBranch}
                  />
                );
              })}
            </div>
          );
        }
        let shardName = '';
        if (i === 0 && shardNames && shardNames.length > 0) {
          shardName = shardNames[0];
        }
        let marginTop = 0;
        if (shardNumber > 1) {
          marginTop = 10;
          if (shardNumber % 2 !== 0) {
            let numBefore = shardNumber / 2;
            numBefore = parseInt(numBefore, 10);
            let shardMarginTop = innerMaxLength * 45;
            if (innerMaxLength > 1) {
              shardMarginTop += (innerMaxLength + 1) * 5;
            } else {
              shardMarginTop += 5;
            }
            if (innerMaxLength % 2 !== 0) {
              marginTop = numBefore * shardMarginTop + parseInt(innerMaxLength / 2, 10) * 45 + 15;
            } else {
              marginTop = numBefore * shardMarginTop + parseInt(innerMaxLength / 2, 10) * 35;
            }
          } else {
            const numBefore = parseInt(shardNumber / 2, 10);
            const shardMarginTop = innerMaxLength * 45 + (innerMaxLength + 1) * 5;
            marginTop += shardMarginTop * numBefore - 25;
          }
          maxNumChildren = 1;
        }
        return (
          <Stage
            stage={stage}
            key={`${stage.stage} - ${id}`}
            maxNumChildren={maxNumChildren}
            minElapseTime={minElapseTime}
            maxElapseTime={maxElapseTime}
            stageNumber={stageNumber}
            head={i === 0}
            adjustMarginTop={marginTop}
            innerMaxLength={innerMaxLength}
            shardName={shardName}
            hasInnerBranch={hasInnerBranch}
          />
        );
      })}
    </div>
  );
};
