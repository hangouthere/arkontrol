import {
  Boundary,
  Breadcrumb,
  Button,
  Classes,
  IBreadcrumbProps,
  IOverflowListProps,
  IPopoverProps,
  IProps,
  Menu,
  OverflowList,
  Popover,
  Position
} from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { NavMenuItem, NavMenuItemType } from '../../containers/common/NavMenuItem';

export interface IOverflowListingProps extends IProps {
  collapseFrom?: Boundary;
  reverseList?: boolean;
  currentItemRenderer?: (props: IBreadcrumbProps) => React.ReactNode;
  currentOverflowItemRenderer?: (props: IBreadcrumbProps) => React.ReactNode;
  itemRenderer?: (props: IBreadcrumbProps) => React.ReactNode;
  items: IBreadcrumbProps[];
  minVisibleItems?: number;
  overflowItemRenderer?: (props: IBreadcrumbProps) => React.ReactNode;
  overflowListProps?: Partial<IOverflowListProps<IBreadcrumbProps>>;
  popoverProps?: IPopoverProps;
}

class OverflowListing extends React.PureComponent<IOverflowListingProps> {
  static defaultProps: Partial<IOverflowListingProps> = {
    collapseFrom: Boundary.START,
    reverseList: false
  };

  render() {
    const { className, collapseFrom, items, minVisibleItems, overflowListProps = {} } = this.props;

    return (
      <OverflowList
        collapseFrom={collapseFrom}
        minVisibleItems={minVisibleItems}
        tagName="ul"
        {...overflowListProps}
        className={classNames(Classes.BREADCRUMBS, overflowListProps.className, className)}
        items={items}
        overflowRenderer={this.renderOverflow}
        visibleItemRenderer={this.renderBreadcrumbWrapper}
      />
    );
  }

  protected renderBreadcrumbWrapper = (props: IBreadcrumbProps, index: number) => {
    const isCurrent = this.props.items[this.props.items.length - 1] === props;
    return <li key={index}>{this.renderBreadcrumb(props, isCurrent)}</li>;
  };

  protected renderBreadcrumb(props: IBreadcrumbProps, isCurrent: boolean) {
    if (isCurrent && this.props.currentItemRenderer != null) {
      return this.props.currentItemRenderer(props);
    } else if (this.props.itemRenderer != null) {
      return this.props.itemRenderer(props);
    } else {
      return <Breadcrumb {...props} current={isCurrent} />;
    }
  }

  protected renderOverflow = (items: IBreadcrumbProps[]) => {
    const { collapseFrom, reverseList } = this.props;
    const position = collapseFrom === Boundary.END ? Position.BOTTOM_RIGHT : Position.BOTTOM_LEFT;
    let orderedItems = items;

    if (true === reverseList) {
      orderedItems = items.slice().reverse();
    }

    return (
      <li>
        <Popover position={position} {...this.props.popoverProps}>
          <Button icon="more" />
          <Menu>{orderedItems.map(this.renderOverflowBreadcrumb)}</Menu>
        </Popover>
      </li>
    );
  };

  protected renderOverflowBreadcrumb = (props: IBreadcrumbProps, index: number) => {
    const isCurrent = this.props.items[this.props.items.length - 1] === props;

    if (isCurrent && this.props.currentOverflowItemRenderer != null) {
      return this.props.currentOverflowItemRenderer(props);
    } else if (this.props.overflowItemRenderer != null) {
      return this.props.overflowItemRenderer(props);
    } else {
      return <NavMenuItem {...props as NavMenuItemType} text={props.text} key={index} />;
    }
  };
}

export default OverflowListing;
