/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-22T15:52:04+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-09T16:41:57+11:00
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

import * as React from 'react';
import { AnchorButton, Intent, Position, Tooltip } from '@blueprintjs/core';
import { inject } from 'mobx-react';
// $FlowFixMe
import { NewToaster } from '#/common/Toaster';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import _ from 'lodash';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
import './GenerateChartButton.scss';
import ChartIcon from '../../styles/icons/chart-icon.svg';

type Store = {
  doc: {
    getValue: () => string,
  },
};

type Props = {
  store: Store,
  api: {},
  connectionId: string,
  editorId: string,
};

type State = {};

// $FlowIssue
@inject(({ api, store }, props) => {
  const { doc } = store.editors.get(props.editorId);

  return {
    store: {
      doc,
    },
    api,
  };
})
export default class GenerateChartButton extends React.PureComponent<
  Props,
  State,
> {
  parserRegex = /use\s+(\S+)\s*;[^]*db\.(\S+)\.aggregate\(\s*(\[[^]*\])\s*,\s*({[^]*})\s*\)\s*;/;
  commentStripperRegex = /\/\*[^]*\*\//g;

  constructor(props: Props) {
    super(props);

    Broker.on(
      EventType.createAggregatorResultReceived(props.editorId),
      this._onAggregatorResultReceived,
    );
  }

  componentWillUnmount() {
    Broker.off(
      EventType.createAggregatorResultReceived(this.props.editorId),
      this._onAggregatorResultReceived,
    );
  }

  _stripComment = (comment: string) => {
    return comment.replace(this.commentStripperRegex, '');
  };

  _strToJson = (code: string) => {
    return eval(`(() => (${code}))()`); // eslint-disable-line no-eval
  };

  _handleError = (error) => {
    console.error(error);
    NewToaster.show({
      message: error.message,
      className: 'danger',
      iconName: 'pt-icon-thumbs-down',
    });

    const { api } = this.props;

    // $FlowFixMe
    api.outputApi.showChartPanel(
      this.props.editorId,
      {},
      'error',
      error.message,
    );
  };

  _onAggregatorResultReceived = (result) => {
    if (typeof result === 'string') {
      this._handleError(new Error(result));
    } else {
      const { api } = this.props;

      // $FlowFixMe
      api.outputApi.showChartPanel(this.props.editorId, result, 'loaded');
    }
  };

  _generateChart = () => {
    const { doc } = this.props.store;
    const code = doc.getValue();
    const matches = code.match(this.parserRegex);

    if (matches && matches.length === 5) {
      const { connectionId } = this.props;
      const database = matches[1];
      const collection = matches[2];
      const pipeline = this._strToJson(this._stripComment(matches[3]));
      const options = this._strToJson(matches[4]);

      if (!_.isArray(pipeline) || !_.isObject(options)) {
        this._handleError(
          new Error(globalString('aggregate_builder/invalid_aggregation_code')),
        );
        return;
      }

      const { editorId, api } = this.props;

      // $FlowFixMe
      api.outputApi.showChartPanel(editorId, {}, 'loading');
      featherClient()
        .service('aggregators')
        .create({
          editorId,
          connectionId,
          database,
          collection,
          pipeline,
          options,
        })
        .catch(this._handleError);
    } else {
      this._handleError(
        new Error(globalString('aggregate_builder/invalid_aggregation_code')),
      );
    }
  };

  render() {
    return (
      <Tooltip
        intent={Intent.PRIMARY}
        hoverOpenDelay={1000}
        inline
        content={globalString('aggregate_builder/generate_chart_button')}
        tooltipClassName="pt-dark generateChartTooltip"
        position={Position.BOTTOM}
      >
        <AnchorButton
          className="GenerateChartButton"
          intent={Intent.SUCCESS}
          onClick={this._generateChart}
        >
          <ChartIcon className="dbKodaSVG" width={20} height={20} />
        </AnchorButton>
      </Tooltip>
    );
  }
}
