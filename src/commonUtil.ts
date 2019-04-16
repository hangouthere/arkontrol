export const PromiseDelay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const debounce = (func: Function, delay: number, ctx?: Function) => {
  let debounceTimer: NodeJS.Timeout;

  return (...args: Array<any>) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => func.apply(ctx, args), delay);

    return () => clearTimeout(debounceTimer);
  };
};
