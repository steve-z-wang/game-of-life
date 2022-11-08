import { Model } from "./Model";
import { View } from "./View";

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindOnStateChanged(this.onStateChanged);
    this.view.bindHandleToggleCell(this.handleToggleCell);
    this.view.bindHandlePause(this.handlePause);
    this.view.bindHandleUpdate(this.update);
    this.view.bindHandleClearReset(this.handleClearReset);
    this.view.bindHandleUpdateIntervalChange(this.handleUpdateIntervalChange);

    this.updateInterval = 100;
    this.isPaused = true;

    // load initial pattern
    const pattern = [
      [-2, -1],
      [-1, 0],
      [0, -2],
      [0, -1],
      [0, 0],
    ];

    this.model.setState(pattern);
    this.view.setCount(0);
  }

  onStateChanged = (state) => {
    this.view.render(state);
  };

  startGameCycle(interval) {
    return setInterval(() => {
      this.update();
    }, interval);
  }

  handlePause = () => {
    // start
    if (this.isPaused) {
      this.update();
      this.updateIntervalId = this.startGameCycle(this.updateInterval);
      this.isPaused = false;
    }
    // stop
    else {
      clearInterval(this.updateIntervalId);
      this.isPaused = true;
    }
    return this.isPaused;
  };

  handleClearReset = () => {
    // reset
    if (this.model.getCount() > 0) {
      this.model.reset();
      this.view.setCount(0);
    }
    // clear
    else {
      this.model.clear();
    }
  };

  handleUpdateIntervalChange = (newInterval) => {
    clearInterval(this.updateIntervalId);
    this.updateInterval = newInterval;

    if (!this.isPaused) {
      this.update();
      this.updateIntervalId = this.startGameCycle(this.updateInterval);
    }
  };

  handleToggleCell = (x, y) => {
    this.model.toggle(x, y);
    this.view.setCount(0);
  };

  update = () => {
    this.model.update();
    this.view.update(); 
    this.view.setCount(this.model.getCount());
  };
}

const app = new Controller(new Model(), new View());
