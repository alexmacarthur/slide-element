const afterNextRepaint = (
  callback: (resolve: Function) => any
): Promise<any> => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        callback(resolve);
      });
    });
  });
};

export default afterNextRepaint;
