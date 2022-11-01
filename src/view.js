export class View {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.startStopBtn = document.getElementById("start-stop");
    this.intervalSlider = document.getElementById("interval-slider");
    this.generationCounter = document.getElementById("generation-counter");
    this.generationCounter.value = 1;
    this.centerBtn = document.getElementById("center");

    this.cellSize = 20;
    this.gridWidth = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isPaused = false;
    this.isCentered = false;

    this._addLocalListeners();
  }

  _addLocalListeners() {
    this.canvas.addEventListener("mousedown", (event) => {
      this.startX = event.offsetX;
      this.startY = event.offsetY;
      this.mouseDown = true;
      this.drag = false;
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (this.mouseDown) {
        this.drag = true;

        const curX = event.offsetX;
        const curY = event.offsetY;

        this.offsetX += curX - this.startX;
        this.offsetY += curY - this.startY;

        this.startX = curX;
        this.startY = curY;

        this.render(this.gameState);
      }
    });

    this.canvas.addEventListener("mouseup", (event) => {
      if (!this.drag) {
        const [x, y] = this.canvas2grid(event.offsetX, event.offsetY);
        this.toggleCell(x, y);
      }
      this.mouseDown = false;
      this.drag = false;
    });

    this.canvas.addEventListener("mouseout", () => {
      this.mouseDown = false;
      this.drag = false;
    });

    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      this.render(this.gameState);
    });

    this.centerBtn.addEventListener("click", () => {
      if (!this.isCentered) {
        this.centerCells();
        this.render(this.gameState);
      }
      this.isCentered = !this.isCentered;
    });
  }

  setCount(count) {
    this.generationCounter.value = count;
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

  bindHandleToggleCell(callback) {
    this.toggleCell = callback;
  }

  render(state) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isCentered && !this.drag && !this.isPaused) {
      this.centerCells();
    }
    this.renderGrid();
    this.renderCells(state);

    this.gameState = state;
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

      this.offsetX += difX;
      this.offsetY += difY;
    }
  }

  renderGrid() {
    this.ctx.strokeStyle = "green";
    this.ctx.lineWidth = this.gridWidth;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const margin = this.gridWidth / 2;
    const increment = this.gridWidth + this.cellSize;

    for (
      let x = (this.offsetX % increment) - margin;
      x < width + margin;
      x += increment
    ) {
      this.drawLine(x, 0, x, height);
    }

    for (
      let y = (this.offsetY % increment) - margin;
      y < height + margin;
      y += increment
    ) {
      this.drawLine(0, y, width, y);
    }
  }

  renderCells(state) {
    this.ctx.fillStyle = "red";

    for (const [x, y, a] of state.entries()) {
      if (a === 1) {
        this.ctx.fillRect(
          ...this.grid2canvas(x, y),
          this.cellSize,
          this.cellSize
        );
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
    this.offsetX + x * (this.cellSize + this.gridWidth),
    this.offsetY + y * (this.cellSize + this.gridWidth),
  ];

  canvas2grid = (x, y) => [
    Math.floor((x - this.offsetX) / (this.cellSize + this.gridWidth)),
    Math.floor((y - this.offsetY) / (this.cellSize + this.gridWidth)),
  ];
}
