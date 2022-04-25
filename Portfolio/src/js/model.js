import leaflet from 'leaflet';
import { MAP_ZOOM_LEVEL } from './config';
import { validInputs, allPositive } from './helpers';

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

export const getMap = () => state.map;

export const getWorkout = () => state.workout;

export const getWorkouts = () => state.workouts;

export const createNewWorkout = function (workoutData) {
  // if (
  //   !validInputs(workoutData.getInputs()) ||
  //   !allPositive(workoutData.getInputs())
  // )
  //   return new Error(`Invalid Inputs`);

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
  state.workout.discription = `${workoutData.type[0].toUpperCase()}${workoutData.type.slice(
    1
  )} on ${
    state.months[state.workout.date.getMonth()]
  } ${state.workout.date.getDate()}`;

  state.workouts.push(state.workout);
};

export const deleteWorkout = function (id) {
  state.workouts.forEach((workout, i) => {
    if (workout.id === id) {
      state.workouts.splice(i, 1);
    }
  });

  updateLocalStorage();
};

export const editWorkout = function (editFormData) {
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

  updateLocalStorage();

  return workout;
};

export const getCurrentWorkout = function (id) {
  return state.workouts.find(wrkt => wrkt.id === id);
};

export const setLocalStorage = function () {
  // Browser provided API
  // Only to be used for small amounts of data
  // Bad because it is Blocking
  localStorage.setItem(`workouts`, JSON.stringify(state.workouts));
};

export const getLocalStorage = function () {
  const data = JSON.parse(localStorage.getItem(`workouts`));

  if (!data) return;

  state.workouts = data;
};

const updateLocalStorage = function () {
  localStorage.removeItem(`workouts`);
  setLocalStorage();
};
