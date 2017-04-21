export const EventType = {
  /**
   * used when a new connection profile is created
   */
  NEW_PROFILE_CREATED: 'controller::new-connection-created',
  /**
   * event type for shell output message
   */
  SHELL_OUTPUT: 'controller::shell::output',
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
  createExplainExeuctionEvent: (id, shellId) => {
    return 'executing::explain::' + id + '::' + shellId;
  },
  FEATHER_CLIENT_LOADED: 'feather::client::loaded',
};
