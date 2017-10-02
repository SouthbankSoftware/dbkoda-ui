/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-09-22T15:52:04+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-09-27T17:22:33+10:00
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
import { Checkbox } from '@blueprintjs/core';
import { reaction } from 'mobx';
import { inject } from 'mobx-react';
import _ from 'lodash';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
import './GenerateChartCheckbox.scss';

type Store = {
  treeActionPanel: {
    formValues: string,
  },
};

type Props = {
  store: Store,
  api: {},
  connectionId: string,
  editorId: string,
};

type State = {
  checked: boolean,
};

// $FlowIssue
@inject(({ api, store }) => {
  const { treeActionPanel } = store;

  return {
    store: {
      treeActionPanel,
    },
    api,
  };
})
export default class GenerateChartCheckbox extends React.PureComponent<Props, State> {
  reaction = null;
  parserRegex = /use\s+(\S+)\s*;[^]*db\.(\S+)\.aggregate\(\s*(\[[^]*\])\s*,\s*({[^]*})\s*\)\s*;/;
  commentStripperRegex = /\/\*[^]*\*\//g;

  constructor(props: Props) {
    super(props);

    this.state = {
      checked: false,
    };
  }

  componentWillUnmount() {
    if (this.reaction) {
      this.reaction();
    }
  }

  _stripComment = (comment: string) => {
    return comment.replace(this.commentStripperRegex, '');
  };

  _strToJson = (code: string) => {
    return eval(`(() => (${code}))()`); // eslint-disable-line no-eval
  };

  _handleError = (error) => {
    console.error(error);
  };

  _enableChartGeneration = () => {
    this.reaction = reaction(
      () => {
        return this.props.store.treeActionPanel.formValues;
      },
      (code) => {
        const matches = code.match(this.parserRegex);

        if (matches && matches.length === 5) {
          const { connectionId } = this.props;
          const database = matches[1];
          const collection = matches[2];
          const pipeline = this._strToJson(this._stripComment(matches[3]));
          const options = this._strToJson(matches[4]);

          if (!_.isArray(pipeline) || !_.isObject(options)) {
            this._handleError(new Error('Invalid aggregation code fed into GenerateChartCheckbox'));
            return;
          }

          const { editorId, api } = this.props;

          console.log(connectionId, database, collection, pipeline, options);
          // $FlowFixMe
          api.outputApi.showChartPanel(editorId, {}, true);
          featherClient()
            .service('aggregators')
            .create({
              connectionId,
              database,
              collection,
              pipeline,
              options,
            })
            .then((result) => {
              // $FlowFixMe
              api.outputApi.showChartPanel(editorId, result);
            })
            .catch(this._handleError);
        } else {
          this._handleError(new Error('Invalid aggregation code fed into GenerateChartCheckbox'));
        }
      },
      // $FlowFixMe
      {
        fireImmediately: true,
      },
    );
  };

  _disableChartGeneration = () => {
    if (this.reaction) {
      this.reaction();
      this.reaction = null;
    }
  };

  _onChange = () => {
    const { checked } = this.state;

    this.setState(
      {
        checked: !checked,
      },
      () => {
        const { checked } = this.state;
        if (checked) {
          this._enableChartGeneration();
        } else {
          this._disableChartGeneration();
        }
      },
    );
  };

  render() {
    const { checked } = this.state;

    return (
      <Checkbox
        checked={checked}
        className="GenerateChartCheckbox"
        label="Generate Chart"
        onChange={this._onChange}
      />
    );
  }
}
