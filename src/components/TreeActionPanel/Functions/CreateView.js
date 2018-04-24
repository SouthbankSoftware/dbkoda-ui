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
 *
 * @Author: chris
 * @Date:   2018-03-28T15:00:46+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2018-03-28T15:00:46+10:00
 */

export const CreateView = {
  // Prefill function for create role
  dbkoda_CreateViewPreFill: params => {
    const data = {};
    data.Database = params.Database;
    data.Collection = params.Collection;
    data.ViewName = `${data.Collection}_View`;
    return data;
  },
  dbkoda_validateView: inputDoc => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'Collection')) {
      throw new Error('dbkoda: Create View requires a collection to be selected');
    }
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'ViewName')) {
      throw new Error('dbkoda: Create View requires a View Name');
    }
    return true;
  }
};
