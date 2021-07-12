let toEachAnimation = (animations: Animation[], cb: Function) => {
  animations.forEach((a) => cb(a));
};

export default toEachAnimation;
