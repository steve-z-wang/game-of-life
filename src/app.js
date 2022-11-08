class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindOnStateChanged(this.onStateChanged);
    this.view.bindHandleToggleCell(this.handleToggleCell);
    this.view.bindHandlePause(this.handlePause);
    this.view.bindHandleUpdate(this.update);
    this.view.bindHandleClearReset(this.handleClearReset);
    this.view.bindHandleUpdateIntervalChange(this.handleUpdateIntervalChange);

    this.updateInterval = 100;
    this.isPaused = true;

    // load initial pattern
    const pattern = [
      [-2, -1],
      [-1, 0],
      [0, -2],
      [0, -1],
      [0, 0],
    ];

    this.model.setState(pattern);
    this.view.setCount(0);
  }

  onStateChanged = (state) => {
    this.view.render(state);
  };

  startGameCycle(interval) {
    return setInterval(() => {
      this.update();
    }, interval);
  }

  handlePause = () => {
    // start
    if (this.isPaused) {
      this.update();
      this.updateIntervalId = this.startGameCycle(this.updateInterval);
      this.isPaused = false;
    }
    // stop
    else {
      clearInterval(this.updateIntervalId);
      this.isPaused = true;
    }
    return this.isPaused;
  };

  handleClearReset = () => {
    // reset
    if (this.model.getCount() > 0) {
      this.model.reset();
      this.view.setCount(0);
    }
    // clear
    else {
      this.model.clear();
    }
  };

  handleUpdateIntervalChange = (newInterval) => {
    clearInterval(this.updateIntervalId);
    this.updateInterval = newInterval;

    if (!this.isPaused) {
      this.update();
      this.updateIntervalId = this.startGameCycle(this.updateInterval);
    }
  };

  handleToggleCell = (x, y) => {
    this.model.toggle(x, y);
    this.view.setCount(0);
  };

  update = () => {
    this.model.update();
    this.view.update();
    this.view.setCount(this.model.getCount());
  };
}

class View {
  constructor() {
    this.gridSize = 20;
    this.lineWidth = 0.5;
    this.colors = { grid: "green", cell: "red" };

    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.offset = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

    this.startStopBtn = document.getElementById("start-stop-btn");
    this.startStopBtn.innerHTML = "start";

    this.nextBtn = document.getElementById("next-btn");

    this.clearResetBtn = document.getElementById("clear-reset-btn");
    this.clearResetBtn.innerHTML = "clear";

    this.updateIntervalSlider = document.getElementById(
      "update-interval-slider"
    );
    this.updateIntervalSlider.value = 50;

    this.gridSizeSlider = document.getElementById("grid-size-slider");
    this.gridSizeSlider.value = this.gridSize;

    this.generationCounter = document.getElementById("generation-counter");
    this.generationCounter.value = 0;

    // this.centerBtn = document.getElementById("center");
    // this.centerBtn.innerHTML = "center cells"
    // this.isCentered = false;

    this._addLocalListeners();
  }

  setCount(count) {
    this.generationCounter.value = count;
  }

  bindHandleToggleCell(callback) {
    this.toggleCell = callback;
  }

  bindHandlePause(handler) {
    this.startStopBtn.addEventListener("click", () => {
      const isPaused = handler();

      this.startStopBtn.innerHTML = isPaused ? "start" : "stop";
    });
  }

  bindHandleClearReset(handler) {
    this.clearResetBtn.addEventListener("click", () => {
      handler();
      this.clearResetBtn.innerHTML = "clear";
    });
  }

  bindHandleUpdate(handler) {
    this.nextBtn.addEventListener("click", () => {
      handler();
    });
  }

  bindHandleUpdateIntervalChange(handler) {
    this.updateIntervalSlider.addEventListener("change", () => {
      const value = parseInt(this.updateIntervalSlider.value);
      const interval = Math.floor(Math.pow(10, ((99 - value) / 99) * 2 + 1));
      handler(interval);
    });
  }

  centerCells() {
    let [sumX, sumY, count] = [0, 0, 0];

    for (const [xy, isAlive] of this.gameState.entries()) {
      const [x, y] = xy.split(",").map((x) => parseInt(x));
      const [x2, y2] = this._grid2canvas(x, y);

      if (isAlive) {
        sumX += x2;
        sumY += y2;
        count += 1;
      }
    }

    if (count > 0) {
      this.offset.x += this.canvas.width / 2 - sumX / count;
      this.offset.y += this.canvas.height / 2 - sumY / count;
    }
  }

  onWindowResize() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.render(this.gameState);
  }

  onMouseDown(event) {
    this.mouseDown = true;
    this.drag = {
      inMotion: false,
      startingPositionX: event.offsetX,
      startingPositionY: event.offsetY,
    };
  }

  onMouseMove(event) {
    if (this.mouseDown) {
      const [diffX, diffY] = [
        event.offsetX - this.drag.startingPositionX,
        event.offsetY - this.drag.startingPositionY,
      ];

      if (
        this.drag.inMotion ||
        // start dragging if the distance moved is greater than 5 pixels value
        Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) > 5
      ) {
        this.offset.x += diffX;
        this.offset.y += diffY;

        this.drag.inMotion = true;
        this.drag.startingPositionX = event.offsetX;
        this.drag.startingPositionY = event.offsetY;

        this.render(this.gameState);
      }
    }
  }

  onMouseUp(event) {
    // onClick
    if (this.mouseDown && !this.drag.inMotion) {
      const [x, y] = this._canvas2grid(event.offsetX, event.offsetY);
      this.toggleCell(x, y);
    }

    this.mouseDown = false;
    this.drag = null;
  }

  onMouseOut() {
    this.mouseDown = false;
    this.drag = null;
  }

  _addLocalListeners() {
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mouseout", this.onMouseOut.bind(this));

    window.addEventListener("resize", this.onWindowResize.bind(this));

    // this.centerBtn.addEventListener("click", () => {
    //   if (!this.isCentered) {
    //     this.centerCells();
    //     this.render(this.gameState);
    //     this.isCentered = true;
    //   } else {
    //     this.isCentered = false;
    //   }
    // });

    this.gridSizeSlider.addEventListener("input", () => {
      const newGridSize = parseInt(this.gridSizeSlider.value);

      const scale = newGridSize / this.gridSize - 1;

      this.offset.x += (this.offset.x - this.canvas.width / 2) * scale;
      this.offset.y += (this.offset.y - this.canvas.height / 2) * scale;
      this.gridSize = newGridSize;

      this.render(this.gameState);
    });
  }

  update() {
    this.clearResetBtn.innerHTML = "reset";
  }

  render(state) {
    this.gameState = state;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isCentered) {
      this.centerCells();
    }

    // grid
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = this.lineWidth;

    for (
      let x = (this.offset.x % this.gridSize) - this.lineWidth / 2;
      x < this.canvas.width + this.lineWidth / 2;
      x += this.gridSize
    ) {
      this._drawLine(x, 0, x, this.canvas.height);
    }

    for (
      let y = (this.offset.y % this.gridSize) - this.lineWidth / 2;
      y < this.canvas.height + this.lineWidth / 2;
      y += this.gridSize
    ) {
      this._drawLine(0, y, this.canvas.width, y);
    }

    // cell
    this.ctx.fillStyle = this.colors.cell;

    for (const [xy, isAlive] of state.entries()) {
      const [x, y] = xy.split(",").map((x) => parseInt(x));
      if (isAlive) {
        const [x2, y2] = this._grid2canvas(x, y);
        const size = this.gridSize - this.lineWidth;
        this.ctx.fillRect(x2, y2, size, size);
      }
    }
  }

  _drawLine(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  _grid2canvas = (x, y) => [
    this.offset.x + x * this.gridSize,
    this.offset.y + y * this.gridSize,
  ];

  _canvas2grid = (x, y) => [
    Math.floor((x - this.offset.x) / this.gridSize),
    Math.floor((y - this.offset.y) / this.gridSize),
  ];
}

class Model {
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

const app = new Controller(new Model(), new View());
