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
 * Created by joey on 30/6/17.
 */

export const ErrorCodes = {
  BAD_VALUE: 2,
  UNKNOWN_ERROR: 8,
  NAMESPACE_NOT_FOUND: 26,
  EXCEEDED_TIME_LIMIT: 50,
  COMMAND_NOT_FOUND: 59,
  WRITE_CONCERN_ERROR: 64,
  NOT_MASTER: 10107,
  DUPLICATE_KEY: 11000,
  NOT_MASTER_NO_SLAVE_OK: 13435,
  NOT_MASTER_OR_SECONDARY: 13436,
  CANT_OPEN_DB_IN_READ_LOCK: 15927,
};
