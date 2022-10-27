import { Model } from "./Model";
import { View } from "./View";

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindGridChanged(this.onGridChanged);
    this.view.bindCanvasChanged(this.onCanvasChanged);
    this.view.bindHandleClick(this.handleClick);
    this.view.bindHandleUpdate(this.handleUpdate);
    this.view.bindHandleStartStop(this.handleUpdate);
    this.view.bindHandleWindowResize();
    this.view.bindHandleMouseDown();
    this.view.bindHandleMouseMove();
    this.view.bindHandleMouseUp();
    this.view.bindHandleUpdateIntervalChange(this.handleUpdate);

    const pattern = [
      [5, 5],
      [6, 6],
      [7, 4],
      [7, 5],
      [7, 6],
    ];

    for (let [x, y] of pattern) {
      this.model._activate(this.model.state, x, y);
    }

    this.view.render(this.model.state);
  }

  onGridChanged = () => {
    this.view.render(this.model.state);
  };

  onCanvasChanged = () => {
    this.view.render(this.model.state);
  };

  handleUpdate = () => {
    this.model.update();
  };

  handleClick = (x, y) => {
    this.model.toggle(x, y);
  };
}

const app = new Controller(new Model(), new View());
