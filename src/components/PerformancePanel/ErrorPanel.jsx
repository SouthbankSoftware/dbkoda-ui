/*
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
/**
 * Created by joey on 27/3/18.
 */

import React from 'react';
import Status from './Status';

const styles = {
  position: 'absolute',
  zIndex: 10,
  opacity: 0.6,
  pointerEvents: 'none',
};


export const ErrorPanel = ({mongoStatus, sshStatus}) => {
  const newStyle = {...styles};
  if (mongoStatus === Status.NORMAL && sshStatus === Status.NORMAL) {
    return null;
  }
  let mongoPanel = null;
  if (mongoStatus === Status.CONNECTION_BROKEN) {
    mongoPanel = <div className="item-status-panel mongo-status-panel"><p className="status-text">{globalString('performance/errors/driver_connection_closed')}</p></div>;
  }
  let sshPanel = null;
  switch (sshStatus) {
    case Status.CONNECTION_BROKEN:
      sshPanel = <div className="item-status-panel ssh-status-panel"><p className="status-text">{globalString('performance/errors/ssh_connection_closed')}</p></div>;
      break;
    case Status.NOT_ENABLED:
      sshPanel = <div className="item-status-panel ssh-status-panel"><p className="status-text">{globalString('performance/errors/ssh_not_enabled')}</p></div>;
      break;
    case Status.UNSUPPORTED_STATS_OS:
      sshPanel = <div className="item-status-panel ssh-status-panel"><p className="status-text">{globalString('performance/errors/ssh_unsupported_os')}</p></div>;
      break;
    default:
      break;
  }
  return <div className="performance-status-panel" style={newStyle}>{sshPanel}{mongoPanel}</div>;
};
