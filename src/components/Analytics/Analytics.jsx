/**
 * @Author: chris
 * @Date:   2017-06-20T15:09:51+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-26T14:08:25+10:00
 */
import React from 'react';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import ReactGA from 'react-ga';
import { analytics, protocol } from '../../env';
import { AnalyticsEvents } from './Events';
import {Broker, EventType} from '../../helpers/broker';

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
    } else if (process.env.NODE_ENV === 'production') {
      siteUrl = protocol + 'electron.dbkoda.com';
      ReactGA.initialize(gaCode.prod, {
        titleCase: false
      });
    }
    ReactGA.set({ page: siteUrl });

    if (this.props.store.userPreferences.telemetryEnabled) {
      this._sendEvent(AnalyticsEvents.APP_OPEN, 'App');
    }

    /**
     * Reaction function for when a change occurs on the telemetryEnabled state
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    reaction(() => this.props.store.userPreferences.telemetryEnabled,
      (telemetryEnabled) => {
        if (telemetryEnabled) {
          this._sendEvent(AnalyticsEvents.OPT_IN, 'App');
        } else {
          this._sendEvent(AnalyticsEvents.OPT_OUT, 'App');
        }
    }, {name: 'analyticsReactionToTelemetryChange'});

    this._sendEvent.bind(this);
  }

  componentDidMount() {
    // Setup reaction to NEW_PROFILE_CREATED event
    Broker.on(EventType.NEW_PROFILE_CREATED, (profile) => {
      this.newProfileCreated(profile);
    });
  }

  componentWillUnmount() {
    Broker.off(EventType.NEW_PROFILE_CREATED);
  }

  newProfileCreated(profile) {
    console.log(profile);
    const mongoVersion = profile.shellVersion;
    this._sendEvent(AnalyticsEvents.NEW_PROFILE, 'Profiles', mongoVersion);
  }

  /**
   *  Function to send an event to the analytics service
   *  @param {AnalyticsEvent} eventType - The AnalyticsEvent type that relates to this event
   *  @param {String} eventLabel - (Optional) The 'label' of the event (could be an item it relates to)
   *  @param {String} eventValue - (Optional) The 'value' of the event (could be the value of an item)
   *  @param {String} eventCategory - (Optional) The overarching category of the event type
   */
  _sendEvent(eventType, eventCategory, eventLabel, eventValue) {
    const event = {
      'category': eventCategory,
      'action': eventType
    };
    if (eventLabel) {
      event.label = eventLabel;
    }
    if (eventValue) {
      event.value = eventValue;
    }
    ReactGA.event(event);
  }

  render() {
    return (
      <div className="analytics" />
    );
  }
}
