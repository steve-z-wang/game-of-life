import { Model } from "./Model";
import { View } from "./View";

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindGameStateUpdated(this.onGameStateUpdated);
    this.view.bindHandleToggleCell(this.handleToggleCell);
    this.view.bindHandlePause(this.handlePause);
    this.view.bindHandleUpdateIntervalChange(this.handleUpdateIntervalChange);

    this.updateInterval = 100;
    this.isPaused = true;

    const pattern = [
      [-2, -1],
      [-1, 0],
      [0, -2],
      [0, -1],
      [0, 0],
    ];

    for (let [x, y] of pattern) {
      this.model._activate(this.model.state, x, y);
    }

    this.view.render(this.model.state);
  }

  startGameCycle(interval) {
    return setInterval(() => {
      this.model.update();
    }, interval);
  }

  handlePause = () => {
    if (this.isPaused) {
      this.model.update();
      this.updateIntervalId = this.startGameCycle(this.updateInterval);
      this.isPaused = false;
    } else {
      clearInterval(this.updateIntervalId);
      this.isPaused = true;
    }
    return this.isPaused;
  };

  handleUpdateIntervalChange = (newInterval) => {
    clearInterval(this.updateIntervalId);
    this.updateInterval = newInterval;

    if (!this.isPaused) {
      this.model.update();
      this.updateIntervalId = this.startGameCycle(this.updateInterval);
    }
  };

  handleToggleCell = (x, y) => {
    this.model.toggle(x, y);
    this.view.render(this.model.state);
    this.view.setCount(0)
  };

  onGameStateUpdated = (state, count) => {
    this.view.render(state);
    this.view.setCount(count);
  };
}

const app = new Controller(new Model(), new View());
