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
* @Author: Michael Harrison
* @Date:   2017-08-08 17:04:16
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-08-08 17:04:26
*/



export const AggregateCommands = {
  NEW_AGG_BUILDER: (db, coll) => {
    return 'dbk_agg.newAggBuilder(\'' + db + '\',\'' + coll + '\')';
  },
  ADD_STEP: (id, stepJSON) => {
    return 'dbk_agg.addStep(\'' + id + '\',' + JSON.stringify(stepJSON) + ')';
  },
  GET_ATTRIBUTES: (id, stepIndex) => {
    return 'dbk_agg.getAttributes(\'' + id + '\',\'' + stepIndex + '\')';
  },
};
