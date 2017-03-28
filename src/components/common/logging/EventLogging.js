export default {

  getTypeEnum() {
    return {
      EVENT: {
        EVENT: 'EVENT',
        EDITOR_PANEL: {
          NEW_EDITOR: {
            START: 'EVENT_EDITOR_NEW_EDITOR_START',
            FINISH: 'EVENT_EDITOR_NEW_EDITOR_FINISH'
          },
          CLOSE_EDITOR: 'EVENT_EDITOR_CLOSE_EDITOR',
          CHANGE_DROPDOWN: 'EVENT_EDITOR_CHANGE_DROPDOWN',
          CHANGE_ACTIVE_EDITOR: 'EVENT_EDITOR_CHANGE_ACTIVE',
          TOOLBAR: {
            EXECUTE_ALL: {
              START: 'EVENT_EDITOR_TOOLBAR_EXECUTE_ALL_START',
              FINISH: 'EVENT_EDITOR_TOOLBAR_EXECUTE_ALL_FINISH'
            },
            EXECUTE_LINE: {
              START: 'EVENT_EDITOR_TOOLBAR_EXECUTE_LINE_START',
              FINISH: 'EVENT_EDITOR_TOOLBAR_EXECUTE_LINE_FINISH'
            },
            CHANGE_FILTER: 'EVENT_EDITOR_TOOLBAR_CHANGE_FILTER'
          }
        }
      },
      INFO: 'INFO',
      WARNING: 'WARNING',
      ERROR: 'ERROR',
      CRASH: 'CRASH'
    };
  },

  getFragmentEnum() {
    return {EDITORS: 'EDITORS', PROFILES: 'PROFILES', EDITOR_PANEL: 'EDITOR_PANEL', OUTPUT: 'OUTPUTS', TREE: 'TREE'};
  },

  recordManualEvent(eventType, eventFragment, eventMessage) {
    const currentDate = new Date();
    const dateTime = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' @ ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();
    const data = {
      type: eventType,
      fragment: eventFragment,
      message: eventMessage,
      timestamp: dateTime
    };
    console.log(data);
  }
};

