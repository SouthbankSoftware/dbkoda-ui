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
 * Created by joey on 19/3/18.
 */

export const ErrorCodes = {
  PERFORMANCE_LIMIT_MONGOS: 'performance/errors/mongos_error',
  PERFORMANCE_LIMIT_ENGINE: 'performance/errors/not_supported_storage_engine',
  MONGO_CONNECTION_CLOSED: 'performance/errors/driver_connection_closed',
  MONGO_RECONNECTING: 'performance/errors/mongo_reconnecting',
  SSH_CONNECTION_CLOSED: 'performance/errors/ssh_connection_closed',
  SSH_RECONNECTING: 'performance/errors/ssh_reconnecting',
  SSH_NOT_ENABLED: 'performance/errors/ssh_not_enabled',
  SSH_RECONNECTION_SUCCESS: 'performance/errors/ssh_reconnect_success',
  MONGO_RECONNECT_SUCCESS: 'performance/errors/mongo_reconnect_success',
  UNSUPPORTED_STATS_OS: 'performance/errors/ssh_unsupported_os'
};

