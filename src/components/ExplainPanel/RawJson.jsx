/**
 * Show explain raw json
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
import { toJS } from 'mobx';
import JSONTree from 'react-json-tree';
import { theme } from './JsonTreeTheme';

const RawJson = ({ explains }) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  return (
    <div className="explain-json-raw-panel">
      <JSONTree
        data={output}
        invertTheme={false}
        theme={theme}
        hideRoot
        shouldExpandNode={(keyName, data, level) => {
          return level <= 2;
        }}
      />
    </div>
  );
};

export default RawJson;
