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
import {inject, observer} from 'mobx-react';
import React from 'react';

import DonutWidget from './DonutWidget';

/**
 * Created by joey on 20/2/18.
 */

const DonutContainer = (params) => {
  return (<DonutWidget {...params} />);
};

export default inject(({store, api}, {widget}) => {
  return {
    store,
    api,
    widget
  };
})(observer(DonutContainer));
