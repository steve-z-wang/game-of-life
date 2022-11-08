export class Model {
  constructor() {
    this._state = new Map();
    this._state0 = new Map();
    this._count = 0;
  }

  _get(state, x, y) {
    return state.get(`${x},${y}`);
  }

  _set(state, x, y, a) {
    state.set(`${x},${y}`, a);
  }

  _delete(state, x, y) {
    state.delete(`${x},${y}`);
  }

  _has(state, x, y) {
    return state.has(`${x},${y}`);
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
    this._set(state, x, y, true);

    // add neighbors to the map
    for (const [x2, y2] of this._getNeighbors(x, y)) {
      if (!this._has(state, x2, y2)) {
        this._set(state, x2, y2, false);
      }
    }
  }

  _kill(state, x, y) {
    this._set(state, x, y, false);
  }

  bindOnStateChanged(callback) {
    this.render = callback;
  }

  getState() {
    return this._state;
  }

  _setState(state) {
    this._state = state;
    this._state0 = new Map(this._state);
    this._count = 0;
    this.render(this._state);
  }

  setState(pattern) {
    const state = new Map();

    for (const [x, y] of pattern) {
      this._activate(state, x, y);
    }

    this._state = state;
    this._state0 = new Map(this._state);
    this.render(this._state);
  }

  getCount() {
    return this._count;
  }

  toggle(x, y) {
    const isAlive = this._get(this._state, x, y);

    if (isAlive) {
      this._kill(this._state, x, y);
    } else {
      this._activate(this._state, x, y);
    }

    this._state0 = new Map(this._state);
    this._count = 0;

    this.render(this._state);
    return this._state;
  }

  update() {
    const newState = new Map(this._state);

    // loop through all cells
    for (const [xy, isAlive] of this._state.entries()) {
      const [x, y] = xy.split(",").map((x) => parseInt(x));

      // count neighbors
      const count = this._getNeighbors(x, y)
        .map(([x, y]) => this._get(this._state, x, y))
        .filter(Boolean)
        .reduce((sum, a) => sum + a, 0);

      if (count == 0) {
        this._delete(newState, x, y);

        // apply game's rules
      } else if (isAlive && (count < 2 || count > 3)) {
        this._kill(newState, x, y);
      } else if (!isAlive && count == 3) {
        this._activate(newState, x, y);
      }
    }

    this._count += 1;
    this._state = newState;
    this.render(this._state);
    return this._state;
  }

  reset() {
    this._setState(this._state0);
  }

  clear() {
    this._setState(new Map());
  }
}
