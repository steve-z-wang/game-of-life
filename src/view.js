export class View {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.cellSize = 8;
    this.updateInterval = 150;

    this.startStopBtn = document.getElementById("start-stop");
    this.isPaused = false;

    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  }

  grid2canvas = (x, y) => [x * this.cellSize, y * this.cellSize];
  canvas2grid = (x, y) => [
    Math.floor(x / this.cellSize),
    Math.floor(y / this.cellSize),
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

  bindClick(handler) {
    this.canvas.addEventListener("click", (event) => {
      const [x, y] = this.canvas2grid(event.offsetX, event.offsetY);
      handler(x, y);
    });
  }

  bindUpdate(handler) {
    this.updateIntervalId = setInterval(handler, this.updateInterval);
  }

  bindStartStop(handler) {
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

  bindHandleWindowResize(handler) {
    window.addEventListener("resize", () => {
      this.canvas.width = document.body.clientWidth;
      this.canvas.height = document.body.clientHeight;
      handler(); 
    }) 
  }
}
