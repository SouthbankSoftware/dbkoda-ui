/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-10-28T16:11:22+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-28T23:49:04+11:00
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
import { Intent, Position, Tooltip } from '@blueprintjs/core';
import { branch } from 'recompose';

/**
 * Add a blueprint Tooltip to a component when tooltip message is not null
 *
 * @see https://github.com/SouthbankSoftware/dbkoda-ui/blob/master/src/components/EditorPanel/Panel.jsx#L717
 * @param tooltip - function to map component properties to tooltip message
 */
export default (tooltip: (props: Object) => ?string) =>
  branch(
    props => !!tooltip(props),
    BaseComponent => props => (
      <Tooltip
        intent={Intent.PRIMARY}
        hoverOpenDelay={1000}
        content={tooltip(props)}
        tooltipClassName="pt-dark"
        position={Position.BOTTOM}
      >
        <BaseComponent {...props} />
      </Tooltip>
    )
  );
