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
 * Created by joey on 19/7/17.
 */

import React from 'react';
import './Buttonpanel.scss';

export const ButtonPanel = ({close, enableConfirm, executing}) => (
  <div className="form-button-panel">
    <button className="pt-button pt-intent-success right-button" disabled={!enableConfirm} onClick={() => executing()}>{globalString('tree/executeButton')}</button>
    <button className="pt-button pt-intent-primary right-button" onClick={() => close()}>{globalString('tree/closeButton')}</button>
  </div>
);
