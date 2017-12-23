export default class Direction {

  value: number;

  static TWO_PI = 2 * Math.PI;

  constructor(value: number) {
    this.set(value);
  }
  
  set(value: number) {
    this.value = value;
    this.normalize();
  }

  normalize() {
    this.value = this.value % Direction.TWO_PI;
    if (this.value < 0) this.value += Direction.TWO_PI;
  }

  add(x: number) {
    this.value += x;
    this.normalize();
  }

  sub(x: number) {
    this.add(-x);
  }
};