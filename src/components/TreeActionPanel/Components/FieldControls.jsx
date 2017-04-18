/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T16:52:57+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-18T17:08:42+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';

const DataTip = observer(({ text, label, icon }) => (
  <i
    className={`pt-button pt-${icon}`}
    data-tip={!_.isInteger(_.parseInt(label)) ? `${text} ${label}` : text}
  />
));

export default observer(({ field, labels = true, controls = {} }) => (
  <span>

    {(!controls || controls.onAdd) &&
      <button className="transparent-btn" type="button" onClick={field.onAdd}>
        <DataTip label={field.label} text={'Add'} icon="icon-add" /> {labels && 'Add'}
      </button>}

    {(!controls || controls.onDel) &&
      <button className="transparent-btn" type="button" onClick={field.onDel}>
        <DataTip label={field.label} text={'Remove'} icon="icon-delete" /> {labels && 'Remove'}
      </button>}

    {(!controls || controls.onClear) &&
      <button className="transparent-btn" type="button" onClick={field.onClear}>
        <DataTip label={field.label} text={'Clear'} icon="icon-cross" />
        {labels && 'Clear'}
      </button>}

    {(!controls || controls.onReset) &&
      <button className="transparent-btn" type="button" onClick={field.onReset}>
        <DataTip label={field.label} text={'Reset'} icon="icon-refresh" />
        {labels && 'Reset'}
      </button>}

    <br />

    {(!controls || controls.onSubmit) &&
      <div className="ctrl">
        <button className="transparent-btn" type="button" onClick={field.onSubmit}>
          <i className="fa fa-dot-circle-o" /> Submit
        </button>
      </div>}
  </span>
));
