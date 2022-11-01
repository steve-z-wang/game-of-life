import { Model } from "./Model";
import { View } from "./View";

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.bindUpdateModel(this.updateModel);
    this.view.bindCanvasChanged(this.onCanvasChanged);
    this.model.bindRenderView(this.renderView);

    this.view.bindHandleUpdate();
    this.view.bindHandleStartStop();
    this.view.bindHandleWindowResize();
    this.view.bindHandleMouseDown();
    this.view.bindHandleMouseMove();
    this.view.bindHandleMouseUp(this.handleClick);
    this.view.bindHandleUpdateIntervalChange(this.updateModel);
    this.view.bindHandleMouseOut(); 

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

  onCanvasChanged = () => {
    this.view.render(this.model.state);
  };

  updateModel = () => {
    this.model.update();
  };

  renderView = (state) => {
    this.view.render(state);
  };

  handleClick = (x, y) => {
    this.model.toggle(x, y);
  };
}

const app = new Controller(new Model(), new View());
