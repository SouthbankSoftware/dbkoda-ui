export default {
  NEW_PROFILE_CREATED: 'controller::new-connection-created',
  SHELL_OUTPUT: 'controller::shell::output',
  createShellOutputEvent: (id, shellId) => {
    return 'controller::shell::output::' + id + '::' + shellId;
  }
}