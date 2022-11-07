export class View {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;

    this.startStopBtn = document.getElementById("start-stop");
    this.startStopBtn.innerHTML = "start";

    this.intervalSlider = document.getElementById("interval-slider");
    this.gridSizeSlider = document.getElementById("grid-size-slider");

    this.generationCounter = document.getElementById("generation-counter");
    this.generationCounter.value = 1;
    this.centerBtn = document.getElementById("center");

    this.gridSize = 20;
    this.lineWidth = 1;
    this.offset = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.isPaused = true;
    this.isCentered = false;
    this.colors = { grid: "green", cell: "red" };

    this.gridSizeSlider.value = this.gridSize;

    this._addLocalListeners();
  }

  render(state) {
    this.gameState = state;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // grid
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = this.lineWidth;

    for (
      let x = (this.offset.x % this.gridSize) - this.lineWidth / 2;
      x < this.canvas.width + this.lineWidth / 2;
      x += this.gridSize
    ) {
      this.drawLine(x, 0, x, this.canvas.height);
    }

    for (
      let y = (this.offset.y % this.gridSize) - this.lineWidth / 2;
      y < this.canvas.height + this.lineWidth / 2;
      y += this.gridSize
    ) {
      this.drawLine(0, y, this.canvas.width, y);
    }

    // cell
    this.ctx.fillStyle = this.colors.cell;

    for (const [x, y, isAlive] of state.entries()) {
      if (isAlive) {
        const [x2, y2] = this.grid2canvas(x, y);
        const size = this.gridSize - this.lineWidth;
        this.ctx.fillRect(x2, y2, size, size);
      }
    }
  }

  drawLine(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  grid2canvas = (x, y) => [
    this.offset.x + x * this.gridSize,
    this.offset.y + y * this.gridSize,
  ];

  canvas2grid = (x, y) => [
    Math.floor((x - this.offset.x) / this.gridSize),
    Math.floor((y - this.offset.y) / this.gridSize),
  ];

  onWindowResize() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.render(this.gameState);
  }

  onMouseOut() {
    this.mouseDown = false;
    this.drag = false;
  }

  onMouseUp(event) {
    if (!this.drag) {
      const [x, y] = this.canvas2grid(event.offsetX, event.offsetY);
      this.toggleCell(x, y);
    }
    this.mouseDown = false;
    this.drag = false;
  }

  oneMouseMove(event) {
    if (this.mouseDown) {
      this.drag = true;

      const curX = event.offsetX;
      const curY = event.offsetY;

      this.offset.x += curX - this.startX;
      this.offset.y += curY - this.startY;

      this.startX = curX;
      this.startY = curY;

      this.render(this.gameState);
    }
  }

  onMouseDown(event) {
    this.startX = event.offsetX;
    this.startY = event.offsetY;
    this.mouseDown = true;
    this.drag = false;
  }

  setCount(count) {
    this.generationCounter.value = count;
  }

  centerCells() {
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (const [x, y, a] of this.gameState.entries()) {
      const [x2, y2] = this.grid2canvas(x, y);
      if (a == 1) {
        sumX += x2;
        sumY += y2;
        count += 1;
      }
    }

    if (count > 0) {
      const difX = this.canvas.width / 2 - sumX / count;
      const difY = this.canvas.height / 2 - sumY / count;

      this.offset.x += difX;
      this.offset.y += difY;
    }
  }

  bindHandleToggleCell(callback) {
    this.toggleCell = callback;
  }

  bindHandlePause(handler) {
    this.startStopBtn.addEventListener("click", () => {
      handler(this.isPaused);
      if (this.isPaused) {
        this.startStopBtn.innerHTML = "stop";
        this.isPaused = false;
      } else {
        this.startStopBtn.innerHTML = "start";
        this.isPaused = true;
      }
    });
  }

  bindHandleUpdateRateChange(handler) {
    this.intervalSlider.addEventListener("change", () => {
      const r2s = (x) => Math.floor(Math.pow(10, ((99 - x) / 99) * 2 + 1));

      const interval = r2s(parseInt(this.intervalSlider.value));

      handler(interval);
    });
  }

  _addLocalListeners() {
    this.canvas.addEventListener("mousedown", (event) => {
      this.onMouseDown(event);
    });

    this.canvas.addEventListener("mousemove", (event) => {
      this.oneMouseMove(event);
    });

    this.canvas.addEventListener("mouseup", (event) => {
      this.onMouseUp(event);
    });

    this.canvas.addEventListener("mouseout", () => {
      this.onMouseOut();
    });

    window.addEventListener("resize", () => {
      this.onWindowResize();
    });

    this.centerBtn.addEventListener("click", () => {
      if (!this.isCentered) {
        this.centerCells();
        this.render(this.gameState);
      }
      this.isCentered = !this.isCentered;
    });

    this.gridSizeSlider.addEventListener("input", () => {
      const newGridSize = parseInt(this.gridSizeSlider.value);

      const scale = newGridSize / this.gridSize - 1;

      this.offset.x += (this.offset.x - this.canvas.width / 2) * scale;
      this.offset.y += (this.offset.y - this.canvas.height / 2) * scale;
      this.gridSize = newGridSize;

      this.render(this.gameState);
    });
  }
}
