import React from 'react';
import { MultiSelect, ItemRenderer, IMultiSelectProps, ItemPredicate } from '@blueprintjs/select';
import { MenuItem, Button } from '@blueprintjs/core';

export interface ITagSelectItem {
  key: string;
  label: string;
  text: string;
  tag: string;
}

interface IProps extends Partial<IMultiSelectProps<ITagSelectItem>> {
  items: Array<ITagSelectItem>;
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

const TagSelectorComponent = MultiSelect.ofType<ITagSelectItem>();

class TagSelector extends React.PureComponent<IProps, IState> {
  state: IState = {
    selectedItems: [],
    items: []
  };

  private _getSelectedItemIndex = (item: ITagSelectItem) => this.state.selectedItems.findIndex(i => i.key === item.key);
  private _isItemSelected = (item: ITagSelectItem) => this._getSelectedItemIndex(item) !== -1;
  private _areItemsEqual = (a: ITagSelectItem, b: ITagSelectItem) => a.key === b.key;

  componentDidMount() {
    if (this.state.items !== this.props.items) {
      this.setState({ items: this.props.items });
    }

    if (this.state.selectedItems !== this.props.selectedItems) {
      this.setState({ selectedItems: this.props.selectedItems! });
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.items !== this.props.items) {
      this.setState({ items: this.props.items });
    }

    if (prevProps.selectedItems !== this.props.selectedItems) {
      this.setState({ selectedItems: this.props.selectedItems! });
    }
  }

  _highlightText(text: string, query: string) {
    let lastIndex = 0;
    const words = query
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(escapeRegExpChars);

    if (words.length === 0) {
      return [text];
    }

    const regexp = new RegExp(words.join('|'), 'gi');
    const tokens: React.ReactNode[] = [];

    while (true) {
      const match = regexp.exec(text);

      if (!match) {
        break;
      }

      const length = match[0].length;
      const before = text.slice(lastIndex, regexp.lastIndex - length);

      if (before.length > 0) {
        tokens.push(before);
      }

      lastIndex = regexp.lastIndex;

      tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
    }

    const rest = text.slice(lastIndex);

    if (rest.length > 0) {
      tokens.push(rest);
    }

    return tokens;
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
        text={this._highlightText(item.text, query)}
        label={item.label}
        onClick={handleClick}
        shouldDismissPopover={false}
      />
    );
  }

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
  }

  _onTagRemove = (key: string) => {
    this._toggleItem({ key } as any, false);
  }

  _onClearTags = () => {
    this.setState({
      selectedItems: []
    });
  }

  _itemPredicate: ItemPredicate<ITagSelectItem> = (query, item, _index, exactMatch) => {
    const normalizedTitle = item.text.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    if (exactMatch) {
      return normalizedTitle === normalizedQuery;
    } else {
      return `${normalizedTitle} ${item.key} ${item.label} ${item.tag}`.toLowerCase().indexOf(normalizedQuery) >= 0;
    }
  }

  render() {
    const clearButton =
      this.state.selectedItems.length > 0 ? (
        <Button icon="cross" minimal={true} onClick={this._onClearTags} />
      ) : (
        undefined
      );

    return (
      <TagSelectorComponent
        className="TagSelector"
        tagRenderer={this.props.tagRenderer || this.renderTag}
        itemRenderer={this.props.itemRenderer || this.renderItem}
        onItemSelect={this.props.onItemSelect || this.onItemSelect}
        items={this.props.items}
        selectedItems={this.state.selectedItems}
        itemsEqual={this._areItemsEqual}
        tagInputProps={{ onRemove: this._onTagRemove, rightElement: clearButton }}
        itemPredicate={this._itemPredicate}
      />
    );
  }
}

export default TagSelector;
