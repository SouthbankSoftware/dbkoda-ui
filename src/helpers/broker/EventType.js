export default {
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
  PROFILE_CLOSED: 'controller::connection-closed',
  /**
   * when a connection is removed
   */
  PROFILE_REMOVED: 'controller::connection-removed',
}