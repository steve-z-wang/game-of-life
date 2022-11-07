import { Model } from "./Model";
import { View } from "./View";

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindGameStateUpdated(this.onGameStateUpdated);
    this.view.bindHandleToggleCell(this.handleToggleCell);
    this.view.bindHandlePause(this.handlePause);
    this.view.bindHandleUpdateRateChange(this.handleUpdateRateChange);

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

    this.updateInterval = 100;
  }

  startGameCycle() {
    this.updateIntervalId = setInterval(() => {
      this.model.update();
    }, this.updateInterval);
  }

  stopGameCycle() {
    clearInterval(this.updateIntervalId);
  }

  handlePause = (isPaused) => {
    if (isPaused) {
      this.model.update();
      this.startGameCycle();
    } else {
      this.stopGameCycle();
    }
  };

  handleUpdateRateChange = (newInterval) => {
    this.stopGameCycle();
    this.updateInterval = newInterval;
    this.model.update();
    this.startGameCycle();
  };

  handleToggleCell = (x, y) => {
    this.model.toggle(x, y);
    this.view.render(this.model.state);
  };

  onGameStateUpdated = (state, count) => {
    this.view.render(state);
    this.view.setCount(count);
  };
}

const app = new Controller(new Model(), new View());
