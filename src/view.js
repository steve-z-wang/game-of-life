export class View {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.cellSize = 20;
    this.gridWidth = 2;
    this.offsetX = 0;
    this.offsetY = 0;

    this.startStopBtn = document.getElementById("start-stop");
    this.isPaused = false;

    this.intervalSlider = document.getElementById("interval-slider");

    this.generationCounter = document.getElementById("generation-counter");
    this.generationCounter.value = 1;

    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mouseout", this.onMouseOut.bind(this));
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  updateCount(count) {
    this.generationCounter.value = count;
  }

  bindHandlePause(handler) {
    this.startStopBtn.addEventListener("click", () => {
      const isPaused = handler();
      if (isPaused) {
        this.startStopBtn.innerHTML = "stop";
      } else {
        this.startStopBtn.innerHTML = "start";
      }
    });
  }

  bindHandleUpdateRateChange(handler) {
    this.intervalSlider.addEventListener("change", (event) => {
      const r2s = (x) => Math.floor(Math.pow(10, ((99 - x) / 99) * 2 + 1));

      const interval = r2s(parseInt(this.intervalSlider.value));

      handler(interval);
    });
  }

  bindHandleToggleCell(callback) {
    this.onClickHandler = callback;
  }

  onWindowResize() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.render(this.gameState);
  }

  onMouseDown(event) {
    this.startX = event.offsetX;
    this.startY = event.offsetY;
    this.mouseDown = true;
    this.drag = false;
  }

  onMouseMove(event) {
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
  }

  onMouseUp(event) {
    this.mouseDown = false;

    if (!this.drag) {
      this.onClick(event);
    }
  }

  onMouseOut() {
    this.mouseDown = false;
  }

  onClick(event) {
    const [x, y] = this.canvas2grid(event.offsetX, event.offsetY);
    this.onClickHandler(x, y);
  }

  render(state) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw grid
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

    // draw cell
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

    this.gameState = state;
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
