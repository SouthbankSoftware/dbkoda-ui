/**
 * @Author: chris
 * @Date:   2017-06-20T15:09:51+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-26T10:12:27+10:00
 */
import React from 'react';
import { action, reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import ReactGA from 'react-ga';
import { analytics, protocol } from '../../env';
import { AnalyticsEvents } from './Events';


@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class Analytics extends React.Component {
  constructor(props) {
    super(props);
    let siteUrl = '';
    const gaCode = analytics;
    if (process.env.NODE_ENV === 'development') {
      siteUrl = protocol + 'dev.dbkoda.com';
      ReactGA.initialize(gaCode.development, {
        debug: true,
        titleCase: false,
      });
    } else if (process.env.NODE_ENV === 'prod') {
      siteUrl = protocol + 'electron.dbkoda.com';
      ReactGA.initialize(gaCode.prod, {
        titleCase: false
      });
    }
    ReactGA.set({ page: siteUrl });
    console.log(`ReactGA page: ${siteUrl}, gaCode: ${gaCode}`);

    if (this.props.store.userPreferences.telemetryEnabled) {
      this._sendEvent(AnalyticsEvents.APP_OPEN, 'App', 'App Open', 1);
    }

    /**
     * Reaction function for when a change occurs on the telemetryEnabled state
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    reaction (() => this.props.store.userPreferences.telemetryEnabled,
      (telemetryEnabled) => {
        if (telemetryEnabled) {
          this._sendEvent(AnalyticsEvents.OPT_IN, 'App', 'Opt In', 1);
        } else {
          this._sendEvent(AnalyticsEvents.OPT_OUT, 'App', 'Opt Out', 1);
        }
    }, {name: 'analyticsReactionToTelemetryChange'});

    this._sendEvent.bind(this);
  }

  /**
   *  Function to send an event to the analytics service
   *  @param {AnalyticsEvent} eventType - The AnalyticsEvent type that relates to this event
   *  @param {String} eventLabel - (Optional) The 'label' of the event (could be an item it relates to)
   *  @param {String} eventValue - (Optional) The 'value' of the event (could be the value of an item)
   *  @param {String} eventCategory - (Optional) The overarching category of the event type
   */
  _sendEvent(eventType, eventCategory, eventLabel, eventValue) {
    console.log(`Send event ${eventType} ${eventLabel} ${eventValue} ${eventCategory}`);
    ReactGA.event({
      'action': eventType,
      'category': eventCategory,
      'label': eventLabel,
      'value': eventValue
    });
  }

  render() {
    return (
      <div className="analytics"></div>
    );
  }
}
