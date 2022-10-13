export class Grid {
  constructor() {
    this._dict = new Map();
  }

  get(x, y) {
    return this._dict.get(`${x},${y}`);
  }
  set(x, y, a) {
    this._dict.set(`${x},${y}`, a);
  }
  delete(x, y) {
    this._dict.delete(`${x},${y}`);
  }
  
  has(x, y) {
    return this._dict.has(`${x},${y}`);
  }

  size() {
    return this._dict.size; 
  }

  copy() {
    const newGrid = new Grid();
    newGrid._dict = new Map(this._dict);
    return newGrid;
  }

  [Symbol.iterator]() {
    let iterator = this._dict[Symbol.iterator]();
    return {
      next: () => {
        const result = iterator.next();
        if (result.done) return result;
        const [xy, v] = result.value;
        return {
          value: [...xy.split(",").map((x) => parseInt(x)), v],
          done: false,
        };
      },
    };
  }

  entries() {
    return this;
  }
}
