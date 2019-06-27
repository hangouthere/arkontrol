import { Button, MenuItem } from '@blueprintjs/core';
import { IMultiSelectProps, ItemPredicate, ItemRenderer, MultiSelect } from '@blueprintjs/select';
import React from 'react';
import { AreItemsEqual, HilightText, ITagItemPredicate } from './DropDownUtil';

export interface ITagSelectItem {
  key: string;
  label: string;
  text: string;
  tag: string;
}

interface IProps extends Partial<IMultiSelectProps<ITagSelectItem>> {
  items: Array<ITagSelectItem>;
  selectedItem?: ITagSelectItem;
  selectedItems?: Array<ITagSelectItem>;
  onChange?: (selItems: Array<ITagSelectItem>) => void;
}

interface IState {
  items: Array<ITagSelectItem>;
  selectedItems: Array<ITagSelectItem>;
}

function escapeRegExpChars(text: string) {
  return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

class MultiSelectorDropdown extends React.PureComponent<IProps, IState> {
  static defaultProps: IProps = {
    items: []
  };

  state: IState = {
    selectedItems: [],
    items: []
  };

  private _SelectorComponent = MultiSelect.ofType<ITagSelectItem>();

  private _getSelectedItemIndex = (item: ITagSelectItem) => this.state.selectedItems.findIndex(i => i.key === item.key);
  private _isItemSelected = (item: ITagSelectItem) => this._getSelectedItemIndex(item) !== -1;

  _updateItemsIfNecessary(inProps: IProps) {
    if (inProps.items !== this.props.items) {
      this.setState({ items: this.props.items });
    }

    if (inProps.selectedItems !== this.props.selectedItems) {
      this.setState({ selectedItems: this.props.selectedItems! });
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
        icon={this._isItemSelected(item) ? 'tick' : 'blank'}
        key={item.key}
        text={HilightText(item.text, query)}
        label={item.label}
        onClick={handleClick}
        shouldDismissPopover={false}
      />
    );
  };

  _toggleItem(item: ITagSelectItem, toggleVal: boolean = false) {
    let selectedItems = [...this.state.selectedItems];
    const foundIdx = this._getSelectedItemIndex(item);

    // Was found, but needs removal
    if (-1 !== foundIdx && false === toggleVal) {
      selectedItems = [...selectedItems.slice(0, foundIdx), ...selectedItems.slice(foundIdx + 1)];
    } else if (-1 === foundIdx && true === toggleVal) {
      selectedItems.push(item);
    }

    this.setState({
      selectedItems
    });

    if (this.props.onChange) {
      this.props.onChange(selectedItems);
    }
  }

  onItemSelect = (item: ITagSelectItem) => {
    this._toggleItem(item, !this._isItemSelected(item));
  };

  _onTagRemove = (key: string) => {
    this._toggleItem({ key } as any, false);
  };

  _onClearTags = () => {
    this.setState({
      selectedItems: []
    });
  };

  _itemPredicate: ItemPredicate<ITagSelectItem> = (query, item, _index, exactMatch) => {
    const normalizedTitle = item.text.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    if (exactMatch) {
      return normalizedTitle === normalizedQuery;
    } else {
      return `${normalizedTitle} ${item.key} ${item.label} ${item.tag}`.toLowerCase().indexOf(normalizedQuery) >= 0;
    }
  };

  render() {
    const clearButton =
      this.state.selectedItems.length > 0 ? (
        <Button icon="cross" minimal={true} onClick={this._onClearTags} />
      ) : (
        undefined
      );

    const SelectorComponent = this._SelectorComponent;

    return (
      <SelectorComponent
        className="selector"
        tagRenderer={this.props.tagRenderer || this.renderTag}
        itemRenderer={this.props.itemRenderer || this.renderItem}
        onItemSelect={this.props.onItemSelect || this.onItemSelect}
        items={this.props.items}
        selectedItems={this.state.selectedItems}
        tagInputProps={{ onRemove: this._onTagRemove, rightElement: clearButton }}
        itemsEqual={AreItemsEqual}
        itemPredicate={ITagItemPredicate}
      />
    );
  }
}

export default MultiSelectorDropdown;
