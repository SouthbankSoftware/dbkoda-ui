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
 * @Author: chris
 * @Date:   2017-06-20T15:09:51+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-27T13:52:32+10:00
 */
import React from 'react';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import ReactGA from 'react-ga';
import { analytics, protocol } from '../../env';
import { AnalyticsEvents } from './Events';
import { Broker, EventType } from '../../helpers/broker';

@inject(allStores => ({
  store: allStores.store,
  config: allStores.config,
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
        titleCase: false,
      });
    }
    ReactGA.set({ page: siteUrl });

    const appVersion = this.props.store.version;

    if (this.props.config.settings.telemetryEnabled) {
      // TODO Get App Version
      this._sendEvent(AnalyticsEvents.APP_OPEN, 'App', appVersion);
    }

    /**
     * Reaction function for when a change occurs on the telemetryEnabled state
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    reaction(
      () => this.props.config.settings.telemetryEnabled,
      (telemetryEnabled) => {
        if (telemetryEnabled) {
          this._sendEvent(AnalyticsEvents.OPT_IN, 'App');
        } else {
          this._sendEvent(AnalyticsEvents.OPT_OUT, 'App');
        }
      },
      { name: 'analyticsReactionToTelemetryChange' },
    );

    this._sendEvent = this._sendEvent.bind(this);
    this.newProfileCreated = this.newProfileCreated.bind(this);
    this.feedbackEvent = this.feedbackEvent.bind(this);
    this.keyFeatureEvent = this.keyFeatureEvent.bind(this);
    this.controllerActivity = this.controllerActivity.bind(this);
  }

  componentDidMount() {
    Broker.on(EventType.NEW_PROFILE_CREATED, this.newProfileCreated);
    Broker.on(EventType.FEEDBACK, this.feedbackEvent);
    Broker.on(EventType.FEATURE_USE, this.keyFeatureEvent);
    Broker.on(EventType.CONTROLLER_ACTIVITY, this.controllerActivity);
  }

  componentWillUnmount() {
    Broker.off(EventType.NEW_PROFILE_CREATED, this.newProfileCreated);
    Broker.off(EventType.FEEDBACK, this.feedbackEvent);
    Broker.off(EventType.FEATURE_USE, this.keyFeatureEvent);
    Broker.off(EventType.CONTROLLER_ACTIVITY, this.controllerActivity);
  }

  /**
   *  Function to be called after a new profile event has been received
   *  @param {Object} profile - An object that represents the newly created profile
   */
  newProfileCreated(profile) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      console.log(profile);
      let mongoInfo =
        '{ dbVersion: ' +
        profile.dbVersion +
        ', shellVersion: ' +
        profile.shellVersion +
        ', authorization: ' +
        profile.authorization;
      if (profile.hostRadio) {
        mongoInfo += ', connectionType: hostname';
      } else {
        mongoInfo += ', connectionType: url';
      }
      mongoInfo += ', ssl: ' + profile.ssl + ', ssh: ' + profile.ssh + '}';
      this._sendEvent(AnalyticsEvents.NEW_PROFILE, 'Profiles', mongoInfo);
    }
  }

  /**
   * 
   * function to be called when activity goes to the controller.
   * @param {String} service - The service type that has been called.
   */
  controllerActivity(service) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      this._sendEvent(AnalyticsEvents.CONTROLLER_ACTIVITY, 'Service', service);
    }
  }

  keyFeatureEvent(feature) {
    if (this.props.store.userPreferences.telemetryEnabled) {
      this._sendEvent(AnalyticsEvents.KEY_FEATURE_USED, 'FeatureUsed', feature);
    }
  }

  /**
   * function to be called when feedback is recieved
   * @param {String} comments - Any additional comments to be sent with the feedback.
   */
  feedbackEvent(feedback) {
    let type;
    switch (feedback.type) {
      case 'PositiveFeedback':
        type = AnalyticsEvents.FEEDBACK_POSITIVE;
        break;
      case 'NegativeFeedback':
        type = AnalyticsEvents.FEEDBACK_NEGATIVE;
        break;
      case 'NeutralFeedback':
        type = AnalyticsEvents.FEEDBACK_NEUTRAL;
        break;
      default:
        break;
    }
    this._sendEvent(type, 'Feedback', feedback.comments);
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
      category: eventCategory,
      action: eventType,
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
    return <div className="analytics" />;
  }
}
