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
 * You shouldhave received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */
import * as common from '../../../TreeActionPanel/Functions/Common.js';

export const BucketAuto = {
  dbkodaListAttributes: common.dbkodaListAttributes,
  dbkodaListAttributesAgg: common.dbkodaListAttributesAgg,
  dbkodaListAttributes_parse: common.dbkodaListAttributes_parse,
  dbkodaListAttributesAgg_parse: common.dbkodaListAttributesAgg_parse,
  dbkodaAggOperators: common.dbkodaAggOperators,
  dbkodaAggOperators_parse: common.dbkodaAggOperators_parse,
  dbkodaGranularityLookup: (params) => {
    params.dontRun = true;
    return params;
  },
  dbkodaGranularityLookup_parse: (res) => {
    //eslint-disable-line
    const debug = false;
    if (debug) console.log(res);
    const granularities = ['R5',
      'R10',
      'R20',
      'R40',
      'R80',
      '1-2-5',
      'E6',
      'E12',
      'E24',
      'E48',
      'E96',
      'E192',
      'POWERSOF2'
    ];
    return granularities;
  }
};
