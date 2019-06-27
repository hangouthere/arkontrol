import { Button, MenuItem } from '@blueprintjs/core';
import { ISelectProps, ItemRenderer, Select } from '@blueprintjs/select';
import React from 'react';
import { AreItemsEqual, HilightText, ITagItemPredicate } from './DropDownUtil';
import { ITagSelectItem } from './MultiSelectDropdown';

interface IProps extends Partial<ISelectProps<ITagSelectItem>> {
  items: Array<ITagSelectItem>;
  selectedItem?: ITagSelectItem;
  onChange?: (selItem: ITagSelectItem) => void;
}

interface IState {
  items: Array<ITagSelectItem>;
  selectedItem?: ITagSelectItem;
}

class SelectorDropdown extends React.PureComponent<IProps, IState> {
  static defaultProps: IProps = {
    items: []
  };

  state: IState = {
    items: []
  };

  private _SelectorComponent = Select.ofType<ITagSelectItem>();

  _updateItemsIfNecessary(inProps: IProps) {
    if (inProps.items !== this.props.items) {
      this.setState({ items: this.props.items });
    }

    if (inProps.selectedItem !== this.props.selectedItem) {
      this.setState({ selectedItem: this.props.selectedItem! });
    }
  }

  componentDidMount() {
    this._updateItemsIfNecessary(this.state as IProps);
  }

  componentDidUpdate(prevProps: IProps) {
    this._updateItemsIfNecessary(prevProps);
  }

  renderTag = (item: ITagSelectItem) => item.tag;

  renderItem: ItemRenderer<ITagSelectItem> = (item, { modifiers, handleClick, query }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    return (
      <MenuItem
        active={modifiers.active}
        key={item.key}
        text={HilightText(item.text, query)}
        label={item.label}
        onClick={handleClick}
        shouldDismissPopover={false}
      />
    );
  };

  onItemSelect = (selectedItem: ITagSelectItem) => {
    this.setState({
      selectedItem
    });

    if (this.props.onChange) {
      this.props.onChange(selectedItem);
    }
  };

  render() {
    const SelectorComponent = this._SelectorComponent;
    const { selectedItem } = this.state;

    return (
      <SelectorComponent
        className="selector"
        itemRenderer={this.props.itemRenderer || this.renderItem}
        onItemSelect={this.props.onItemSelect || this.onItemSelect}
        items={this.props.items}
        itemsEqual={AreItemsEqual}
        itemPredicate={ITagItemPredicate}
        popoverProps={{ minimal: true }}
      >
        <Button icon="person" rightIcon="caret-down" text={selectedItem ? selectedItem.text : 'No selection'} />
      </SelectorComponent>
    );
  }
}

export default SelectorDropdown;
