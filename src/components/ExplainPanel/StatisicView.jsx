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

/**
 * common statistic view panel
 */
export default ({ explains }) => {
  const { executionStats } = explains;
  return (
    <div className="explain-statistic-view">
      <div className="header">
        <div>{globalString('explain/view/statisticHeader')}</div>
        <div>Value</div>
      </div>
      <div className="row">
        <div>{globalString('explain/view/docsReturned')}</div>
        <div>{executionStats.nReturned}</div>
      </div>
      <div className="row">
        <div>{globalString('explain/view/keysExamined')}</div>
        <div>{executionStats.totalKeysExamined}</div>
      </div>
      <div className="row">
        <div>{globalString('explain/view/docsExamined')}</div>
        <div>{executionStats.totalDocsExamined}</div>
      </div>
    </div>
  );
};
