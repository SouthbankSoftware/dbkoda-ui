/**
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-06T18:31:48+10:00
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

declare module '@blueprintjs/core' {
  declare export class ITreeNode {
    /**
     * Child tree nodes of this node.
     */
    childNodes?: ITreeNode[];

    /**
     * A space-delimited string of class names to apply to the node.
     */
    className?: string;

    /**
     * Whether the caret to expand/collapse a node should be shown.
     * If not specified, this will be true if the node has children and false otherwise.
     */
    hasCaret?: boolean;

    /**
     * The name of a Blueprint icon to display next to the node's label.
     */
    icon?: string;

    /**
     * A unique identifier for the node.
     */
    id: string | number;

    /**
     * Whether the children of this node are displayed.
     * @default false
     */
    isExpanded?: boolean;

    /**
     * Whether this node is selected.
     * @default false
     */
    isSelected?: boolean;

    /**
     * The main label for the node.
     */
    label: string | React.Element;

    /**
     * A secondary label/component that is displayed at the right side of the node.
     */
    secondaryLabel?: string | React.Element;
  }

  declare export class ContextMenu {
    static show(menu: React.Element, offset: { left: number, top: number }): void;
  }

  declare export var Tree;
  declare export var Menu;
  declare export var MenuItem;
  declare export var Checkbox;
  declare export var AnchorButton;
  declare export var Button;
  declare export var Intent;
  declare export var Position;
  declare export var Tooltip;
  declare export var MenuDivider;
  declare export var Dialog;
  declare export var Popover;
  declare export var PopoverInteractionKind;
  declare export var Icon;
  declare export var Switch;
  declare export var NumericInput;
  declare export default any;
}
