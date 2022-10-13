export class View {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.cellSize = 5;
    this.updateInterval = 250;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  grid2canvas(x, y) {
    return [x * this.cellSize, y * this.cellSize];
  }

  canvas2grid(x, y) {
    return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)];
  }

  render(state) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const [x, y, a] of state.entries()) {
      const [x2, y2] = this.grid2canvas(x, y);

      if (a === 1) {
        this.ctx.fillStyle = "green";
      } else if (a === 0) {
        this.ctx.fillStyle = "red";
      }
      this.ctx.fillRect(x2, y2, this.cellSize, this.cellSize);
    }
  }

  bindClick(handler) {
    this.canvas.addEventListener("click", (event) => {

      const [x, y] = this.canvas2grid(event.x, event.y);
      console.log(x, y);
      handler(x, y);
    });
  }

  bindUpdate(handler) {
    this.updateIntervalId = setInterval(handler, this.updateInterval);
  }
}
