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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T16:52:57+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T15:56:28+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';

import {
  AnchorButton,
  Intent,
  Position,
  Tooltip
} from '@blueprintjs/core';

const DataTip = observer(({ text, label, icon, onClick }) => (
  <Tooltip
    intent={Intent.PRIMARY}
    hoverOpenDelay={1000}
    content={!_.isInteger(_.parseInt(label)) ? `${text} ${label}` : text}
    tooltipClassName="pt-dark tooltip-btn"
    position={Position.BOTTOM}>
    <AnchorButton
      className={`pt-button pt-${icon} circleButton`}
      onClick={onClick} />
  </Tooltip>
));

export default observer(({ field, controls = {} }) => (
  <span>

    {(!controls || controls.onAdd) &&
      <DataTip label={field.label} text={'Add'} icon="icon-add" onClick={(e) => { field.onAdd(e); field.state.form.submit(); }} />}

    {(!controls || controls.onDel) &&
      <DataTip label={field.label} text={'Remove'} icon="icon-delete" onClick={(e) => { field.onDel(e); field.state.form.submit(); }} />}

    {(!controls || controls.onClear) &&
      <DataTip label={field.label} text={'Clear'} icon="icon-trash" onClick={(e) => { field.onClear(e); field.state.form.submit(); }} />}

    {(!controls || controls.onReset) &&
      <DataTip label={field.label} text={'Reset'} icon="icon-refresh" onClick={(e) => { field.onReset(e); field.state.form.submit(); }} />}

    <br />

    {(!controls || controls.onSubmit) &&
      <div className="ctrl">
        <button className="transparent-btn" type="button" onClick={field.onSubmit}>
          <i className="fa fa-dot-circle-o" /> {globalString('tree/submitButton')}
        </button>
      </div>}
  </span>
));
