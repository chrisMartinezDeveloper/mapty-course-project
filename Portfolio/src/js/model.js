import leaflet from 'leaflet';
import { MAP_ZOOM_LEVEL } from './config';
import { validInputs, allPositive } from './helpers';

//////////
// State

const state = {
  latitude: 0,
  longitude: 0,
  map: ``,
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  workout: {},
  workouts: [],
};

// From JS Course
// ---
// const getPosition = function () {
//   // Geolocation API
//   if (navigator.geolocation)
//     navigator.geolocation.getCurrentPosition(loadMap.bind(this), function () {
//       alert(`Could not get your location.`);
//     });
// };

// Loads the map from the Leaflet Library
export const loadMap = async function (position) {
  try {
    // From JS Course
    // ---
    // const { latitude } = position.coords;
    // const { longitude } = position.coords;

    // Lattitude and Longitude for New York City
    state.latitude = 40.7591703;
    state.longitude = -74.0394429;
    const coords = [state.latitude, state.longitude];

    state.map = await L.map('map').setView(coords, MAP_ZOOM_LEVEL);

    await L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(state.map);
  } catch (error) {
    throw error;
  }
};

// Gets the map from the state
export const getMap = () => state.map;

// Gets the current workout from the state
export const getWorkout = () => state.workout;

// Gets all the workouts from the state
export const getWorkouts = () => state.workouts;

// Create a new user defined workout
export const createNewWorkout = function (workoutData) {
  const inputs = workoutData.getInputs();
  if (!validInputs(inputs) || !allPositive(inputs))
    throw new Error(`Invalid Inputs`);

  state.workout = {
    date: new Date(),
    id: (Date.now() + ``).slice(-10),
    type: workoutData.type,
    distance: workoutData.distance.toFixed(2),
    duration: workoutData.duration.toFixed(2),
    coords: [workoutData.latitude, workoutData.longitude],
    cadence: workoutData.type === 'running' ? workoutData.cadence : 0,
    elevation: workoutData.type === 'cycling' ? workoutData.elevation : 0,
    pace: +(workoutData.duration / workoutData.distance).toFixed(2),
    speed: +(workoutData.distance / (workoutData.duration / 60)).toFixed(2),
  };

  // prettier-ignore
  state.workout.discription = `${workoutData.type[0].toUpperCase()}${workoutData.type.slice(1)} on ${
    state.months[state.workout.date.getMonth()]
  } ${state.workout.date.getDate()}`;

  state.workouts.push(state.workout);
};

// Deletes the given workout
export const deleteWorkout = function (id) {
  state.workouts.forEach((workout, i) => {
    if (workout.id === id) {
      state.workouts.splice(i, 1);
    }
  });

  updateLocalStorage();
};

// Makes user requested edits to the given workout
export const editWorkout = function (editFormData) {
  const inputs = editFormData.getInputs();
  if (!validInputs(inputs) || !allPositive(inputs))
    throw new Error(`Invalid Inputs`);

  const workout = state.workouts.find(wrkt => wrkt.id === editFormData.id);

  workout.type =
    workout.type === editFormData.type ? workout.type : editFormData.type;
  workout.distance = editFormData.distance;
  workout.duration = editFormData.duration;
  workout.cadence = editFormData.cadence;
  workout.elevation = editFormData.elevation;
  if (editFormData.type === 'running')
    workout.pace = +(editFormData.duration / editFormData.distance).toFixed(2);
  if (editFormData.type === 'cycling')
    workout.pace = +(
      +editFormData.distance /
      (editFormData.duration / 60)
    ).toFixed(2);

  const parsedDescription = workout.discription;
  workout.discription =
    workout.type.slice(0, 1).toUpperCase() +
    workout.type.slice(1) +
    parsedDescription.slice(7);

  updateLocalStorage();

  return workout;
};

// Gets the current workout
export const getCurrentWorkout = function (id) {
  return state.workouts.find(wrkt => wrkt.id === id);
};

// Saves the workouts to local storage
export const setLocalStorage = function () {
  // Browser provided API
  // Only to be used for small amounts of data
  // Bad because it is Blocking
  localStorage.setItem(`workouts`, JSON.stringify(state.workouts));
};

// Gets the workouts from local storage
export const getLocalStorage = function () {
  const data = JSON.parse(localStorage.getItem(`workouts`));

  if (!data) return;

  state.workouts = data;
};

// Updates local storage
const updateLocalStorage = function () {
  localStorage.removeItem(`workouts`);
  setLocalStorage();
};
