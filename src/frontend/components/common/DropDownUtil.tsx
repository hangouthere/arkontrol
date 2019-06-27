import { ItemPredicate } from '@blueprintjs/select';
import React from 'react';
import { ITagSelectItem } from './MultiSelectDropdown';

function escapeRegExpChars(text: string) {
  return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

export const AreItemsEqual = (a: ITagSelectItem, b: ITagSelectItem) => a.key === b.key;

export const HilightText = (text: string, query: string) => {
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
};

export const ITagItemPredicate: ItemPredicate<ITagSelectItem> = (query, item, _index, exactMatch) => {
  const normalizedTitle = item.text.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedTitle} ${item.key} ${item.label} ${item.tag}`.toLowerCase().indexOf(normalizedQuery) >= 0;
  }
};
