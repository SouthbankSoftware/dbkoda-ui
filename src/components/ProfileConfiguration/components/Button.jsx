import React from 'react';
import {Button, Tooltip, Intent, Position} from '@blueprintjs/core';
import './button.scss';

export default ({onClick, text, className, toolTipClassName}) => (
  <Tooltip
    className={`${toolTipClassName} pt-tooltip-indicator pt-tooltip-indicator-form`}
    content=""
    hoverOpenDelay={1000}
    inline
    intent={Intent.PRIMARY}
    position={Position.BOTTOM}
  >
    <Button
      className={`${className} profile-config-button pt-button pt-intent-primary`}
      text={text}
      onClick={onClick}
    />
  </Tooltip>
);
