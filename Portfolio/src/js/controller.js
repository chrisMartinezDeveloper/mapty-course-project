import * as model from './model';
import workoutView from './view/workoutView';

// Dev controls - maintains state between reloads
if (module.hot) {
  module.hot.accept();
}

/////////////////////////
// Controller functions

// Controls loading the map from the Leaflet API
const controlLoadMap = async function () {
  try {
    // Loads the map
    await model.loadMap();

    // Event Listener
    workoutView.addHandlerMapClick(model.getMap());

    // Gets local storage
    model.getLocalStorage();

    // Awaiting the FontAwesome xIcon loading
    await workoutView.renderWorkouts(model.getWorkouts());

    // Event Listeners
    workoutView.addHandlerDeleteWorkout(controlDeleteWorkout);
    workoutView.addHandlerEditWorkouts(controlEditWorkout);

    // Renders the workout marker
    workoutView.renderWorkoutMarkers(model.getMap(), model.getWorkouts());
  } catch (error) {
    console.error(`🔥 ${error}`);
  }
};

// Controls toggling the workout form input type
const controlToggleInputType = function () {
  workoutView.toggleElevationField();
};

// Controls submitting the workout form
const controlSubmitWorkout = async function () {
  try {
    // Clear error message, if any
    workoutView.clearInputErrorMessage();

    // Create workout in state
    model.createNewWorkout(workoutView.getWorkoutFormData());

    // Render workout and marker
    await workoutView.renderWorkout(model.getWorkout());
    workoutView.renderWorkoutMarker(model.getMap(), model.getWorkout());
    workoutView.hideForm();

    // Event Listeners
    workoutView.addHandlerDeleteWorkout(controlDeleteWorkout);
    workoutView.addHandlerNewWorkoutEdit(controlEditWorkout);

    // Set Local Storage
    model.setLocalStorage();
  } catch (error) {
    if (error.message === 'Invalid Inputs')
      workoutView.displayInputErrorMessage();
    console.error(`🔥 ${error}`);
  }
};

// Controls moving the map view to the workout clicked by the user
const controlMoveToMarker = function (event) {
  workoutView.moveToMarker(event, model.getMap(), model.getWorkouts());
};

const controlDeleteWorkout = function (event) {
  workoutView.deleteWorkoutElement(event);

  const workout = model.getCurrentWorkout(workoutView.getElementID(event));
  workoutView.removeMarker(model.getMap(), workout);

  model.deleteWorkout(workoutView.getElementID(event));
};

const controlEditWorkout = function (event, workoutElement) {
  workoutView.renderEditView(event, model.getWorkouts());

  workoutView.addHandlerSubmitWorkoutEdits(
    controlSubmitWorkoutEdits,
    workoutElement
  );
};

// Controls submitting edits to the workout
const controlSubmitWorkoutEdits = function (
  event,
  workoutElement,
  editFormElement
) {
  try {
    // model.editWorkout() returns the editedWorkout
    const editFormData = workoutView.getEditFormData(editFormElement);
    const editedWorkout = model.editWorkout(editFormData);

    workoutView.updateWorkout(workoutElement, editedWorkout);

    // Event Listeners
    workoutView.addHandlerDeleteWorkout(controlDeleteWorkout);
    // Allows the edit btn to be clicked after edits have been submitted
    workoutView.addHandlerEditWorkout(controlEditWorkout, workoutElement);
  } catch (error) {
    if (error.message === 'Invalid Inputs')
      workoutView.displayInputErrorMessage(event);
    console.error(`🔥 ${error}`);
  }
};

// Welcomes a dev to the application
const welcome = function () {
  console.log('Welcome to the application!');
};

// Initializes the application
const init = function () {
  // Publisher/Subscriber method
  welcome();
  workoutView.addHandlerLoadMap(controlLoadMap);
  workoutView.addHandlerWorkoutSubmit(controlSubmitWorkout);
  workoutView.addHandlerToggleInputType(controlToggleInputType);
  workoutView.addHandlerMoveToWorkouts(controlMoveToMarker);
};
init();
