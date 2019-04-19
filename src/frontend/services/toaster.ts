import { IToastProps, Toaster } from '@blueprintjs/core';

export const ToasterActionTypes = {
  SHOW_TOASTER: 'SHOW_TOASTER'
};

const toaster = Toaster.create({
  className: 'global-toaster',
  position: 'bottom-right'
});

export const ShowToaster = (input: IToastProps) => {
  toaster.show(input);
};
