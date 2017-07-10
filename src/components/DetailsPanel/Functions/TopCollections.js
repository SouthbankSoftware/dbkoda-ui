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
 * @Date:   2017-05-22T15:30:25+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-10T12:10:37+10:00
 */
// const Globalize = require('globalize');

export const TopCollections = {
  // Prefill function for alter user
  dbkoda_TopCollections: () => {
    return 'dbe.Top()';
  },
  dbkoda_TopCollections_parse: (data) => {
    // data.time = Globalize.formatNumber(data.time);
    // console.log(data.time);
    if (data && data.top.length == 1 && data.top[0].collection) {
      return {error: data.top[0].collection};
    }
    return data;
  }
};
