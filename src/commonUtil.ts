export const PromiseDelay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const PromiseDelayCancellable = (ms: number) => {
  let cancel: Function;

  const promise = new Promise((r, c) => {
    const cancelId = setTimeout(r, ms);
    cancel = () => {
      clearTimeout(cancelId);
      c('cancelled');
    };
  });

  return [promise, () => cancel()];
};

export const debounce = (func: Function, delay: number, ctx?: Function) => {
  let debounceTimer: NodeJS.Timeout;

  return (...args: Array<any>) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => func.apply(ctx, args), delay);

    return () => clearTimeout(debounceTimer);
  };
};
