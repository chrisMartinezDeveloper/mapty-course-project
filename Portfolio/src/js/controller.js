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

    await workoutView.renderWorkouts(model.getWorkouts());
    workoutView.addHandlerDeleteWorkout(controlDeleteWorkout);
    workoutView.addHandlerEditWorkout(controlEditWorkout);
    workoutView.renderWorkoutMarkers(model.getMap(), model.getWorkouts());
  } catch (error) {
    console.error(`🔥 ${error}`);
  }
};

const controlToggleInputType = function () {
  workoutView.toggleElevationField();
};

const controlWorkoutSubmit = async function () {
  try {
    // Create workout in state
    model.createNewWorkout(workoutView.getWorkoutFormData());

    // Render workout and marker
    await workoutView.renderWorkout(model.getWorkout());
    workoutView.renderWorkoutMarker(model.getMap(), model.getWorkout());
    workoutView.hideForm();

    // Event Listeners
    workoutView.addHandlerDeleteWorkout(controlDeleteWorkout);
    workoutView.addHandlerEditWorkout(controlEditWorkout);

    // Set Local Storage
    model.setLocalStorage();
  } catch (error) {
    console.error(`🔥 ${error}`);
  }
};

const controlMoveToMarker = function (event) {
  workoutView.moveToPopup(event, model.getMap(), model.getWorkouts());
};

const controlDeleteWorkout = function (event) {
  workoutView.deleteWorkoutElement(event);
  model.deleteWorkout(workoutView.getID(event));
};

const controlEditWorkout = function (event) {
  workoutView.renderEditView(event, model.getWorkouts());
};

const init = function () {
  // Publisher/Subscriber method
  workoutView.addHandlerLoadMap(controlLoadMap);
  workoutView.addHandlerWorkoutSubmit(controlWorkoutSubmit);
  workoutView.addHandlerToggleInputType(controlToggleInputType);
};
init();
