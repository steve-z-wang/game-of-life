import { Model } from "./Model";
import { View } from "./View";

class Controller {

  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindGridChanged(this.onGridChanged);
    this.view.bindClick(this.handleClick);
    this.view.bindUpdate(this.handleUpdate);
    this.view.bindStartStop(this.handleStartStop); 
    this.view.bindHandleWindowResize(this.handleWindowResize); 

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

  handleUpdate = () => {
    this.model.update();
  };

  handleClick = (x, y) => {
    this.model.toggle(x, y);
  };

  handleStartStop = () => {
    this.model.update(); 
  }

  handleWindowResize = () => {
    this.view.render(this.model.state);
  }; 
}

const app = new Controller(new Model(), new View());
