/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-06-25T19:16:06+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-06-25T19:20:03+10:00
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

declare type FeathersError = {
  // name - The error name (ie. "BadRequest", "ValidationError", etc.)
  name: string,
  // message - The error message string
  message: string,
  // code - The HTTP status code
  code: number,
  // className - A CSS class name that can be handy for styling errors based on the error type. (ie.
  // "bad-request" , etc.)
  className: string,
  // data - An object containing anything you passed to a Feathers error except for the errors
  // object.
  data: {},
  // errors - An object containing whatever was passed to a Feathers error inside errors. This is
  // typically validation errors or if you want to group multiple errors together.
  errors: {}
};
