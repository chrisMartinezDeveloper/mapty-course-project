import { MAP_ZOOM_LEVEL } from '../config';
import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

library.add(faXmark);

// Elements
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class WorkoutView {
  #mapEvent;

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove(`hidden`);
    inputDistance.focus();
  }

  ////////
  // API

  hideForm() {
    // Empty the imputs
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        ``;

    // Hide form
    form.style.display = `none`;
    form.classList.add(`hidden`);
    setTimeout(() => (form.style.display = `grid`), 1000);
  }

  toggleElevationField() {
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  renderWorkouts(workouts) {
    workouts.forEach(workout => {
      this.renderWorkout(workout);
    });
  }

  renderWorkoutMarkers(map, workouts) {
    workouts.forEach(workout => {
      this.renderWorkoutMarker(map, workout);
    });
  }

  getWorkoutFormData() {
    const mapE = this.#mapEvent;
    const workoutData = {
      type: inputType.value,
      distance: +inputDistance.value,
      duration: +inputDuration.value,
      cadence: inputCadence.value ? +inputCadence.value : 0,
      elevation: inputElevation.value ? +inputElevation.value : 0,
      latitude: mapE.latlng.lat,
      longitude: mapE.latlng.lng,
      coords: [mapE.latlng.lat, mapE.latlng.lng],
      getInputs() {
        return [this.distance, this.duration, this.cadence, this.elevation];
      },
    };

    return workoutData;
  }

  renderWorkout(workout) {
    const xIcon = icon(faXmark, {
      classes: ['workout__delete-icon'],
    }).html;

    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.discription}</h2>
      ${xIcon}
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;

    if (workout.type === `running`)
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;
    if (workout.type === `cycling`)
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
        </div>
        </li>`;

    form.insertAdjacentHTML(`afterend`, html);
  }

  renderWorkoutMarker(map, workout) {
    L.marker(workout.coords)
      .addTo(map)
      .bindPopup(
        L.popup({
          maxwidth: 250,
          minwidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`} ${workout.discription}`
      )
      .openPopup();
  }

  moveToPopup(event, map, workouts) {
    const workoutEl = event.target.closest(`.workout`);

    if (!workoutEl) return;

    const workout = workouts.find(work => work.id === workoutEl.dataset.id);

    map.setView(workout.coords, MAP_ZOOM_LEVEL, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  deleteWorkout(event) {
    console.log(event.target.closest(`.workout`));
    debugger;
    workout = event.target.closest(`.workout`);
    console.log(`1: `, workout);
    containerWorkouts.removeChild();
    console.log(1, containerWorkouts);
  }

  getID(event) {
    return event.target.closest(`.workout`).dataset.id;
  }

  // Event Listeners
  addHandlerLoadMap(handler) {
    window.addEventListener(`load`, handler);
  }

  addHandlerMapClick(map) {
    map.on(`click`, this._showForm.bind(this));
  }

  addHandlerToggleInputType(handler) {
    inputType.addEventListener(`change`, handler);
  }

  addHandlerWorkoutSubmit(handler) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      inputType.addEventListener('change', this._toggleElevationField);

      handler();
    });
  }

  addHandlerMoveToWorkouts(handler) {
    containerWorkouts.addEventListener(`click`, function (event) {
      handler(event);
    });
  }

  addHandlerDeleteWorkout(handler) {
    document.querySelectorAll('.fa-xmark').forEach(icon => {
      icon.addEventListener('click', function (event) {
        handler(event);
      });
    });
  }
}

export default new WorkoutView();
