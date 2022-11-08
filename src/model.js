class Grid {
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

export class Model {
  constructor() {
    this.startingState = new Grid(); 
    this.state = this.startingState.copy(); 
    this.stateCounter = 0;
  }

  _getNeighbors = (x, y) =>
    [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ].map(([offsetX, offsetY]) => [offsetX + x, offsetY + y]);

  _activate(state, x, y) {
    // mark cell as alive
    state.set(x, y, 1);

    // add neighbors to the map
    for (const [x2, y2] of this._getNeighbors(x, y)) {
      if (!state.has(x2, y2)) {
        state.set(x2, y2, 0);
      }
    }
  }

  _kill(state, x, y) {
    state.set(x, y, 0);
  }

  bindGameStateUpdated(callback) {
    this.render = callback;
  }

  toggle(x, y) {
    if (this.state.get(x, y) === 1) {
      this._kill(this.state, x, y);
    } else {
      this._activate(this.state, x, y);
    }
    this.startingState = this.state.copy(); 
    this.stateCounter = 0; 
  }

  update() {
    const newState = this.state.copy();

    // loop through all cells
    for (const [x, y, v] of this.state.entries()) {
      // count neighbors
      const count = this._getNeighbors(x, y)
        .map(([x, y]) => this.state.get(x, y))
        .filter(Boolean)
        .reduce((sum, a) => sum + a, 0);

      if (count === 0) {
        newState.delete(x, y);

        // apply game's rules
      } else if (v === 1 && (count < 2 || count > 3)) {
        this._kill(newState, x, y);
      } else if (v === 0 && count === 3) {
        this._activate(newState, x, y);
      }
    }

    this.state = newState;
    this.stateCounter += 1;
    this.render(this.state, this.stateCounter); 
  }
}
