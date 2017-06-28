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
 * @Date:   2017-04-21T10:47:14+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-21T14:08:10+10:00
 */



/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import {Radio} from '@blueprintjs/core';
import './style.scss';

export default observer(({field, showLabel = false, onChange = null, }) => (

  <div className={field.name + '-input-content'}>
    <div className="pt-form-content">
      <Radio className={field.name + '-radio-input'} {...field.bind()} label={showLabel ? field.label : ''} checked={field.get('value')}
        onChange={onChange} />
    </div>
  </div>
));
