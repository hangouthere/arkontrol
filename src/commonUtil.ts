export const PromiseDelay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const PromiseDelayCancellable = (ms: number) => {
  let cancel: Function;

  const promise = new Promise((resolve, reject) => {
    const cancelId = setTimeout(resolve, ms);
    cancel = () => {
      clearTimeout(cancelId);
      reject(new Error('Cancelled Promise'));
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

export function hasAnyRole(reqRoles: Array<string>, userRoles: Array<string>) {
  return reqRoles.some(r => userRoles.includes(r));
}

export function hasRole(role: string, userRoles: Array<string>) {
  return hasAnyRole([role], userRoles);
}
