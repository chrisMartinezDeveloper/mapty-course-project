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

    // Event Listener
    workoutView.addHandlerMapClick(model.getMap());

    // Gets local storage
    model.getLocalStorage();

    // Awaiting the FontAwsome xIcon loading
    await workoutView.renderWorkouts(model.getWorkouts());

    // Event Listeners
    workoutView.addHandlerDeleteWorkout(controlDeleteWorkout);
    workoutView.addHandlerEditWorkout(controlEditWorkout);

    // Renders the workout marker
    workoutView.renderWorkoutMarkers(model.getMap(), model.getWorkouts());
  } catch (error) {
    console.error(`🔥 ${error}`);
  }
};

const controlToggleInputType = function () {
  workoutView.toggleElevationField();
};

const controlSubmitWorkout = async function () {
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
  workoutView.moveToMarker(event, model.getMap(), model.getWorkouts());
};

const controlDeleteWorkout = function (event) {
  workoutView.deleteWorkoutElement(event);

  const workout = model.getCurrentWorkout(workoutView.getElementID(event));
  workoutView.removeMarker(model.getMap(), workout);

  model.deleteWorkout(workoutView.getElementID(event));
};

const controlEditWorkout = function (event) {
  workoutView.renderEditView(event, model.getWorkouts());

  workoutView.addHandlerSubmitWorkoutEdits(controlSubmitWorkoutEdits);
};

const controlSubmitWorkoutEdits = function (event) {
  // model.editWorkout() returns the editedWorkout
  const editedWorkout = model.editWorkout(workoutView.getEditFormData(event));

  workoutView.updateWorkout(event, editedWorkout);

  // Allows the edit btn to be clicked after edits have been submitted
  // workoutView.addHandlerSubmitWorkoutEdits(controlSubmitWorkoutEdits);
};

const init = function () {
  // Publisher/Subscriber method
  workoutView.addHandlerLoadMap(controlLoadMap);
  workoutView.addHandlerWorkoutSubmit(controlSubmitWorkout);
  workoutView.addHandlerToggleInputType(controlToggleInputType);
  workoutView.addHandlerMoveToWorkouts(controlMoveToMarker);
};
init();
