/**
 * Created by joey on 6/6/17.
 */

import React from 'react';
import './style.scss';

export const Stage = ({stage, maxNumChildren, head, shardName = ''}) => {
  const style = {};
  let className = head ? 'explain-stage explain-stage-array' : 'explain-stage';
  className = !stage ? 'explain-stage empty-explain-stage' : className;
  if (maxNumChildren > 1) {
    style.marginTop = (maxNumChildren - 1) * 35.5;
  }
  const shardStyle = {};
  if (shardName) {
    shardStyle.maxWidth = 260;
  }
  const stageName = stage ? stage.stage : '';
  return (<div className="explain-stage-wrapper" style={shardStyle}>
    <span className="explain-stage-shard-name" >{shardName}</span>
    <div className={className} style={style}>
      {stageName}
    </div></div>);
};

export default ({stages, shardNames}) => {
  let maxNumChildren = 1;
  stages.map((stage) => {
    if (stage.constructor === Array && maxNumChildren < stage.length) {
      maxNumChildren = stage.length;
    }
  });
  return (<div className="explain-stage-progress">
    {
      stages.map((stage, i) => {
        const id = i;
        if (stage.constructor === Array) {
          const style = {};
          if (i === 0 && shardNames && shardNames.length > 0) {
            style.maxWidth = 260;
          }
          return (
            <div style={style} className="explain-stage-tree-root" key={`${id}`}>
              {
                stage.map((s, j) => {
                  let shardName = '';
                  if (i === 0 && shardNames && shardNames.length > 0) {
                    shardName = shardNames[j];
                  }
                  const sid = j;
                  return <Stage stage={s} key={`${s && s.stage} - ${sid}`} maxNumChildren={1} head={false} shardName={shardName} />;
                })
              }
            </div>);
        }
        return (<Stage stage={stage} key={`${stage.stage} - ${id}`} maxNumChildren={maxNumChildren} head={i === 0} />);
      })
    }
  </div>);
};
