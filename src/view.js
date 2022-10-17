export class View {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.cellSize = 7;
    this.updateInterval = 100;

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
    this.offsetX + x * this.cellSize,
    this.offsetY + y * this.cellSize,
  ];
  canvas2grid = (x, y) => [
    Math.floor((x - this.offsetX) / this.cellSize),
    Math.floor((y - this.offsetY) / this.cellSize),
  ];

  render(state) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "green";
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

      const r2s = (x) => Math.floor(Math.pow(10, (99 - x) / 99 * 2 + 1));

      this.updateInterval = r2s(parseInt(this.intervalSlider.value));

      console.log(this.intervalSlider.value, this.updateInterval);

      clearInterval(this.updateIntervalId);

      handler();
      this.updateIntervalId = setInterval(handler, this.updateInterval);
    });
  }
}
