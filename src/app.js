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
    this.view.bindHandleStartStop(this.handleStartStop);
    this.view.bindHandleWindowResize();
    this.view.bindHandleMouseDown();
    this.view.bindHandleMouseMove();
    this.view.bindHandleMouseUp();

    const pattern = [
      [10, 10],
      [11, 11],
      [12, 9],
      [12, 10],
      [12, 11],
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
  }

  handleUpdate = () => {
    this.model.update();
  };

  handleClick = (x, y) => {
    this.model.toggle(x, y);
  };

  handleStartStop = () => {
    this.model.update();
  };

}

const app = new Controller(new Model(), new View());
