import { Grid } from "./Grid";

export class Model {
  constructor() {
    this.state = new Grid();
    this.stateCounter = 0;
  }

  bindGridChanged(callback) {
    this.onGridChanged = callback;
  }

  _getNeighbors = (x, y) => [
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

  toggle(x, y) {
    if (this.state.get(x, y) === 1) {
      this._kill(this.state, x, y);
    } else {
      this._activate(this.state, x, y);
    }
    this.onGridChanged(this.state);
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
    this.onGridChanged(this.state);
  }
}
