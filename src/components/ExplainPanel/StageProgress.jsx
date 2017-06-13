/**
 * Created by joey on 6/6/17.
 */

import React from 'react';
import './style.scss';

export const Stage = ({stage, maxNumChildren, head, shardName = '', adjustMarginTop = 0}) => {
  const style = {};
  let className = head ? 'explain-stage explain-stage-array' : 'explain-stage';
  className = !stage ? 'explain-stage empty-explain-stage' : className;
  if (maxNumChildren > 1) {
    const factor = maxNumChildren % 2 === 0 ? 35.5 : 32.5;
    style.marginTop = (maxNumChildren - 1) * factor;
  }
  if (adjustMarginTop) {
    style.marginTop += adjustMarginTop;
  }
  const shardStyle = {};
  if (shardName) {
    shardStyle.maxWidth = 200;
  }
  const stageName = stage ? stage.stage : '';
  return (<div className="explain-stage-wrapper" style={shardStyle}>
    <span className="explain-stage-shard-name">{shardName}</span>
    <div className={className} style={style}>
      {stageName}
    </div>
  </div>);
};

export default ({stages, shardNames}) => {
  let maxNumChildren = 1;
  let innerMaxLength = 1;
  let hasInnerBranch = false;
  const columnHasBranch = []; // whether the column has branch stages
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
          }
        }
      });
    }
  });
  return (<div className="explain-stage-progress">
    {
      stages.map((stage, i) => {
        const id = i;
        if (stage.constructor === Array) {
          const style = {};
          if (i === 0 && shardNames && shardNames.length > 0) {
            style.maxWidth = 200;
          }
          return (
            <div style={style} className="explain-stage-tree-root" key={`${id}`}>
              {
                stage.map((s, j) => {
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
                    return (<div style={{display: 'flex'}}>
                      <span style={{alignSelf: 'center', color: '#BFBEC0'}}>{shardName}</span>
                      <div style={{flex: 1}}>{s.map((inner, iid) => {
                        const innerId = `${sid}-${iid}`;
                        return (
                          <Stage stage={inner} key={`${s && s.stage} - ${innerId}`} maxNumChildren={1} head={false}
                          />);
                      })}</div>
                    </div>);
                  }
                  if (hasInnerBranch) {
                    const length = columnHasBranch[i] ? 1 : innerMaxLength;
                    return (<Stage stage={s} key={`${s && s.stage} - ${sid}`} maxNumChildren={length} head={false}
                      shardName={shardName} />);
                  }
                  return (<Stage stage={s} key={`${s && s.stage} - ${sid}`} maxNumChildren={1} head={false}
                    shardName={shardName} />);
                })
              }
            </div>);
        }
        let shardName = '';
        if (i === 0 && shardNames && shardNames.length > 0) {
          shardName = shardNames[0];
        }
        let length = maxNumChildren;
        let marginTop = 0;
        if (hasInnerBranch) {
          length = (maxNumChildren * innerMaxLength) - 1;
          marginTop = 15;
        }
        return (<Stage stage={stage} key={`${stage.stage} - ${id}`} maxNumChildren={length}
          head={i === 0} adjustMarginTop={marginTop}
          shardName={shardName} />);
      })
    }
  </div>);
};
