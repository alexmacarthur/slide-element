const afterNextRepaint = (callback: () => any) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

export default afterNextRepaint;
