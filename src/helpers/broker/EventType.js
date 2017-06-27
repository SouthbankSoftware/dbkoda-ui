/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-30T16:49:27+10:00
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
  SWAP_SHELL_CONNECTION: 'swap::shell::connection'
};
