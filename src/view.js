export class View {
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
