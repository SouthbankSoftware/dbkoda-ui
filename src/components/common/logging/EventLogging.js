/**
 * @Author: mike
 * @Date:   2017-03-28 16:13:50
 * @Last modified by:   mike
 * @Last modified time: 2017-03-28 16:14:04
 */

export default {
  /**
   * Getter method for the Event Type Fragments enum,
   * @return {Object} An object containing the different Event Types.
   */
  getTypeEnum() {
    return {
      EVENT: {
        EVENT: 'EVENT',
        APP: {
          OPEN: 'EVENT_APP_OPEN',
          CLOSE: 'EVENT_APP_CLOSE'
        },
        USER_PREFERENCES: {
          TELEMETRY: {
            ENABLED: 'EVENT_USER_PREFERENCES_TELEMTRY_ENABLED',
            DISABLED: 'EVENT_USER_PREFERENCES_TELEMTRY_DISABLED'
          }
        },
        CONNECTION_PANEL: {
          NEW_PROFILE: {
            OPEN_DIALOG: 'EVENT_CONNECTION_NEW_PROFILE_OPEN_DIALOG',
            START: 'EVENT_CONNECTIONS_NEW_PROFILE_START',
            FINISH: 'EVENT_CONNECTIONS_NEW_PROFILE_FINISH'
          },
          EDIT_PROFILE: {
            OPEN_DIALOG: 'EVENT_CONNECTION_EDIT_PROFILE_OPEN_DIALOG',
            START: 'EVENT_CONNECTIONS_EDIT_PROFILE_START',
            FINISH: 'EVENT_CONNECTIONS_EDIT_PROFILE_FINISH'
          },
          REMOVE_PROFILE: 'EVENT_CONNECTIONS_REMOVE_PROFILE',
          CLOSE_PROFILE: 'EVENT_CONNECTIONS_CLOSE_PROFILE'
        },
        EDITOR_PANEL: {
          NEW_EDITOR: {
            START: 'EVENT_EDITOR_NEW_EDITOR_START',
            FINISH: 'EVENT_EDITOR_NEW_EDITOR_FINISH'
          },
          CLOSE_EDITOR: 'EVENT_EDITOR_CLOSE_EDITOR',
          CHANGE_DROPDOWN: 'EVENT_EDITOR_CHANGE_DROPDOWN',
          CHANGE_ACTIVE_EDITOR: 'EVENT_EDITOR_CHANGE_ACTIVE',
          CHANGE_FILTER: 'EVENT_EDITOR_CHANGE_FILTER',
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

  /**
   * Getter method for the UI Fragments enum,
   * @return {Object} An object containing the different UIFragments.
   */
  getFragmentEnum() {
    return {
      EDITORS: 'EDITORS',
      PROFILES: 'PROFILES',
      EDITOR_PANEL: 'EDITOR_PANEL',
      OUTPUT: 'OUTPUTS',
      TREE: 'TREE',
      PREFERENCES: 'PREFERENCES'
    };
  },

  /**
   * Action recording an event generated from another component.
   * @param {String} eventType - The type of event based on the enum described above.
   * @param {String} eventFragment - The UI fragment the event is associated with.
   * @param {String} eventMessage - The Message associated with the event.
   */
  recordManualEvent(eventType, eventFragment, eventMessage) {
    const currentDate = new Date();
    let offset = (currentDate.getTimezoneOffset() / 60);
    if (offset > 0) {
      offset = 'UTC -' + Math.abs(offset);
    } else {
      offset = 'UTC +' + Math.abs(offset);
    }
    const dateTime = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' @ ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds() + ':' + currentDate.getMilliseconds() + ' ' + offset;
    const data = {
      type: eventType,
      fragment: eventFragment,
      message: eventMessage,
      timestamp: dateTime
    };
    // Placeholder until file API is complete.
    console.log(data);
  },

  /**
   * Action recording an event from a MobX observer.
   * @param {String} eventType - The type of event based on the enum described above.
   * @param {String} eventFragment - The UI fragment the event is associated with.
   * @param {String} eventMessage - The Message associated with the event.
   * @param {Object} eventChange - The Change event generated by MobX.
   */
  recordEvent(eventType, eventFragment, eventMessage, eventChange) {
    const currentDate = new Date();
    let offset = (currentDate.getTimezoneOffset() / 60);
    if (offset > 0) {
      offset = 'UTC-' + Math.abs(offset);
    } else {
      offset = 'UTC+' + Math.abs(offset);
    }
    const dateTime = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' @ ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds() + ':' + currentDate.getMilliseconds() + ' ' + offset;
    const data = {
      type: eventType,
      fragment: eventFragment,
      message: eventMessage,
      change: eventChange,
      timestamp: dateTime
    };
    // Placeholder until file API is complete.
    console.log(data);
  },

  createTimedEvent(eventType, eventFragment, eventMessage, eventChange) {
    const currentDate = new Date();
    let offset = (currentDate.getTimezoneOffset() / 60);
    if (offset > 0) {
      offset = 'UTC-' + Math.abs(offset);
    } else {
      offset = 'UTC+' + Math.abs(offset);
    }
    const dateTime = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' @ ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds() + ':' + currentDate.getMilliseconds() + ' ' + offset;
    const data = {
      type: eventType,
      fragment: eventFragment,
      message: eventMessage,
      change: eventChange,
      startTimestamp: dateTime,
      endTimestamp: null
    };
    // Placeholder until file API is complete.
    return data;
  },

  recordTimedEvent(event) {
    const currentDate = new Date();
    let offset = (currentDate.getTimezoneOffset() / 60);
    if (offset > 0) {
      offset = 'UTC-' + Math.abs(offset);
    } else {
      offset = 'UTC+' + Math.abs(offset);
    }
    const dateTime = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' @ ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds() + ':' + currentDate.getMilliseconds() + ' ' + offset;
    event.endTimestamp = dateTime;
    // Placeholder until file API is complete.
    console.log(event);
  }
};
