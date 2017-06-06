/**
 * Created by joey on 6/6/17.
 */

import React from 'react';
import './style.scss';

export const Stage = ({stage, maxNumChildren, head}) => {
  const style = {};
  const className = head ? 'explain-stage explain-stage-array' : 'explain-stage';
  if (maxNumChildren > 1) {
    style.marginTop = (maxNumChildren - 1) * 22.5;
  }
  if (!stage || !stage.stage) {
    return null;
  }
  return (<div className="explain-stage-wrapper">
    <div className={className} style={style}>
      {stage.stage}
    </div></div>);
};

export default ({stages}) => {
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
          return (
            <div className="explain-stage-tree-root" key={`${id}`}>
              {
                stage.map((s, j) => {
                  const sid = j;
                  return <Stage stage={s} key={`${s.stage} - ${sid}`} maxNumChildren={1} head={i === 0} />;
                })
              }
            </div>);
        }
        return (<Stage stage={stage} key={`${stage.stage} - ${id}`} maxNumChildren={maxNumChildren} head={i === 0} />);
      })
    }
  </div>);
};
