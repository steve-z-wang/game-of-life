import { Model } from "./Model";
import { View } from "./View";

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindGameStateChanged(this.onGameStateChanged);

    this.view.bindUpdateModel(this.updateModel);

    this.view.bindHandleUpdate();
    this.view.bindHandleStartStop();
    this.view.bindHandleUpdateIntervalChange(this.updateModel);

    this.view.bindHandleToggleCell(this.handleToggleCell); 

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

  onGameStateChanged = (state) => {
    this.view.render(state);
  };
  
  updateModel = () => {
    this.model.update();
  };

  handleToggleCell = (x, y) => {
    this.model.toggle(x, y);
  };
}

const app = new Controller(new Model(), new View());
