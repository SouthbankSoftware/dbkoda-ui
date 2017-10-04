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
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-11T15:01:31+10:00
 */

export default {
  /**
   * used when a new connection profile is created
   */
  NEW_PROFILE_CREATED: 'controller::new-connection-created',
  /**
   * used when a new connection profile is created
   */
  RECONNECT_PROFILE_CREATED: 'controller::re-connection-created',
  /**
   * event type for shell output message
   */
  SHELL_OUTPUT_AVAILABLE: 'controller::shell::output::available',
  createShellOutputEvent: (id, shellId) => {
    return 'controller::shell::output::' + id + '::' + shellId;
  },
  /**
   * when a connection got closed
   */
  PROFILE_CLOSED: 'controller::connection::closed',
  /**
   * when a connection is removed
   */
  PROFILE_REMOVED: 'controller::connection::removed',
  /**
   * shell command execution finished.
   */
  COMMAND_EXECUTION_FINISHED: 'controller::command::execute::finished',
  createShellExecutionFinishEvent: (id, shellId) => {
    return 'controller::command::execute::finished::' + id + '::' + shellId;
  },
  createExplainExecutionFinishedEvent: (id, shellId) => {
    return 'finish::executing::explain::' + id + '::' + shellId;
  },
  EXPLAIN_OUTPUT_AVAILABLE: 'explain::output::available',
  EXPLAIN_OUTPUT_PARSED: 'explain::output::parsed',
  EXECUTION_EXPLAIN_EVENT: 'executing::explain',
  FEATHER_CLIENT_LOADED: 'feather::client::loaded',
  createFileChangedEvent(id) {
    return `fileChanged::${id}`;
  },
  SHELL_RECONNECT: 'controller::shell::reconnect',
  createShellReconnectEvent: (id, shellId) => {
    return 'controller::shell::reconnect::' + id + '::' + shellId;
  },
  APP_READY: 'appReady',
  SWAP_SHELL_CONNECTION: 'swap::shell::connection',
  APP_RENDERED: 'appRendered',
  APP_CRASHED: 'appCrashed',
  FEATURE_USE: 'feature::use',
  CONTROLLER_ACTIVITY: 'controller::activity',
};
