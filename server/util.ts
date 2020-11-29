export const delay = function(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};