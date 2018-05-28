/**
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-27T11:01:26+11:00
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
  SHELL_OUTPUT_AVAILABLE: 'output-panel-control',
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
  createAggregatorResultReceived: editorId => `aggregator::result-received::${editorId}`,
  SHELL_RECONNECT: 'controller::shell::reconnect',
  createShellReconnectEvent: (id, shellId) => {
    return 'controller::shell::reconnect::' + id + '::' + shellId;
  },
  AGGREGATE_UPDATE: id => {
    return 'aggregate-builder::update::' + id;
  },
  APP_READY: 'appReady',
  SWAP_SHELL_CONNECTION: 'swap::shell::connection',
  APP_RENDERED: 'appRendered',
  APP_CRASHED: 'appCrashed',
  FEEDBACK: 'feedback',
  FEATURE_USE: 'feature::use',
  CONTROLLER_ACTIVITY: 'controller::activity',
  PING_HOME: 'telemetry::ping::home',
  TABLE_VIEW_RESULT: editorId => `table-view::result-recieved::${editorId}`,
  TERMINAL_DATA: id => `terminal::data::${id}`,
  TERMINAL_ATTACHING: id => `terminal::attaching::${id}`,
  TERMINAL_ERROR: id => `terminal::error::${id}`,
  STATS_DATA: profileId => `stats::data::${profileId}`,
  STATS_ERROR: profileId => `stats::error::${profileId}`,
  MASTER_PASSWORD_REQUIRED: 'master-pass::password-required',
  PASSWORD_STORE_RESET: 'master-pass::store-reset',
  WINDOW_REFRESHING: 'window-refreshing',
  WINDOW_CLOSING: 'window-closing',
  TOP_CONNECTIONS_DATA: 'top-connections-data',
  TOP_CONNECTIONS_ERROR: 'top-connections-error',
  PROFILING_DATA: 'profiling-data',
  PROFILING_DATABASES_DATA: 'profiling-databases-data',
  PROFILING_ERROR: 'profiling-error'
};
