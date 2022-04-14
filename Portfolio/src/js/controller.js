import * as model from './model';
import workoutView from './view/workoutView';

// Maintains state between reloads
if (module.hot) {
  module.hot.accept();
}

const controlLoadMap = async function () {
  try {
    // Loads the map
    await model.loadMap();

    workoutView.addHandlerMapClick(model.getMap());

    model.getLocalStorage();

    workoutView.renderWorkouts(model.getWorkouts());
    workoutView.renderWorkoutMarkers(model.getMap(), model.getWorkouts());
  } catch (error) {
    console.error(`🔥 ${error}`);
  }
};

const controlToggleInputType = function () {
  workoutView.toggleElevationField();
};

const controlWorkoutSubmit = function () {
  model.createNewWorkout(workoutView.getWorkoutFormData());

  workoutView.renderWorkout(model.getWorkout());
  workoutView.renderWorkoutMarker(model.getMap(), model.getWorkout());
  workoutView.hideForm();

  model.setLocalStorage();
};

const controlMoveToMarker = function (event) {
  workoutView.moveToPopup(event, model.getMap(), model.getWorkouts());
};

const init = function () {
  // Publisher/Subscriber method
  workoutView.addHandlerLoadMap(controlLoadMap);
  workoutView.addHandlerWorkoutSubmit(controlWorkoutSubmit);
  workoutView.addHandlerToggleInputType(controlToggleInputType);
};
init();
