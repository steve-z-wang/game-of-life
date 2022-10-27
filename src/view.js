export class View {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.updateInterval = 100;

    this.cellSize = 20;
    this.gridWidth = 2;

    this.startStopBtn = document.getElementById("start-stop");
    this.isPaused = false;

    this.isMoving = false;
    this.offsetX = 0;
    this.offsetY = 0;

    this.intervalSlider = document.getElementById("interval-slider");

    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  grid2canvas = (x, y) => [
    this.offsetX + x * (this.cellSize + this.gridWidth),
    this.offsetY + y * (this.cellSize + this.gridWidth),
  ];

  canvas2grid = (x, y) => [
    Math.floor((x - this.offsetX) / (this.cellSize + this.gridWidth)),
    Math.floor((y - this.offsetY) / (this.cellSize + this.gridWidth)),
  ];

  drawLine(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
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
  }

  bindCanvasChanged(callback) {
    this.onCanvasChanged = callback;
  }

  bindHandleClick(handler) {
    this.canvas.addEventListener("click", (event) => {
      const [x, y] = this.canvas2grid(event.offsetX, event.offsetY);
      handler(x, y);
    });
  }

  bindHandleUpdate(handler) {
    this.updateIntervalId = setInterval(handler, this.updateInterval);
  }

  bindHandleStartStop(handler) {
    this.startStopBtn.addEventListener("click", () => {
      if (this.isPaused) {
        handler();
        this.updateIntervalId = setInterval(handler, this.updateInterval);
        this.isPaused = false;
        this.startStopBtn.innerHTML = "stop";
      } else {
        clearInterval(this.updateIntervalId);
        this.isPaused = true;
        this.startStopBtn.innerHTML = "start";
      }
    });
  }

  bindHandleWindowResize() {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      this.onCanvasChanged();
    });
  }

  bindHandleMouseDown() {
    this.canvas.addEventListener("mousedown", (event) => {
      this.startX = event.offsetX;
      this.startY = event.offsetY;
      this.isMoving = true;
    });
  }

  bindHandleMouseMove() {
    this.canvas.addEventListener("mousemove", (event) => {
      if (this.isMoving) {
        const curX = event.offsetX;
        const curY = event.offsetY;

        this.offsetX += curX - this.startX;
        this.offsetY += curY - this.startY;

        this.startX = curX;
        this.startY = curY;

        this.onCanvasChanged();
      }
    });
  }

  bindHandleMouseUp(handler) {
    this.canvas.addEventListener("mouseup", (event) => {
      this.isMoving = false;
    });
  }

  bindHandleUpdateIntervalChange(handler) {
    this.intervalSlider.addEventListener("change", (event) => {
      const r2s = (x) => Math.floor(Math.pow(10, ((99 - x) / 99) * 2 + 1));

      this.updateInterval = r2s(parseInt(this.intervalSlider.value));

      console.log(this.intervalSlider.value, this.updateInterval);

      clearInterval(this.updateIntervalId);

      handler();
      this.updateIntervalId = setInterval(handler, this.updateInterval);
    });
  }
}
