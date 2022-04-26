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
  #xIcon;
  #markers = {};

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

  async renderWorkouts(workouts) {
    try {
      await workouts.forEach(workout => {
        this.renderWorkout(workout);
      });
    } catch (error) {
      throw error;
    }
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

  displayInputErrorMessage(event = undefined) {
    let btnSubmit = form.querySelector('.btnSubmit');

    // Triggered if imput error comes from the edit form
    if (event) {
      btnSubmit = event.target.querySelector('.submit__edit');
      // const workoutToEdit = event.target.closest('.workout');
      const editForm = event.target;
      editForm.style.height = '12.7rem';
    }

    // Check if error is already created
    if (document.querySelector('.input__error__message')) return;

    const html = `   
      <p class="input__error__message">Invalid Inputs: Please enter positive numbers only</p>
    `;

    btnSubmit.insertAdjacentHTML('beforebegin', html);
  }

  clearInputErrorMessage() {
    const inputErrorMessage = form.querySelector('.input__error__message');

    if (!inputErrorMessage) return;

    inputErrorMessage.remove();
  }

  async renderWorkout(workout) {
    try {
      this.#xIcon = await icon(faXmark, {
        classes: ['workout__delete-icon'],
      }).html;
      // console.log(`Render Workout Successful`);

      let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.discription}</h2>
      ${this.#xIcon}
      <div class="workout__data">
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
        </div>
      `;

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
      </div>
    `;
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
        </div>
        `;

      html += `
        <div class="btn__container">         
            <button class="btn workout__edit">Edit</button>         
        </div>
      </li>
      `;

      form.insertAdjacentHTML('afterend', html);
    } catch (error) {
      throw error;
    }
  }

  renderWorkoutMarker(map, workout) {
    if (!map) return;

    const id = workout.id;
    this.#markers[id] = L.marker(workout.coords)
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

  moveToMarker(event, map, workouts) {
    // If the xIcon is clicked, return
    if (event.target.closest('.fa-xmark')) return;

    const workoutEl = event.target.closest('.workout');

    if (!workoutEl) return;

    const workout = workouts.find(work => work.id === workoutEl.dataset.id);

    map.setView(workout.coords, MAP_ZOOM_LEVEL, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  removeMarker(map, workout) {
    if (!map) return;

    const id = workout.id;
    map.removeLayer(this.#markers[id]);
  }

  deleteWorkoutElement(event) {
    event.target.closest(`.workout`).remove();
  }

  getElementID(event) {
    return event.target.closest(`.workout`).dataset.id;
  }

  renderEditView(event, workouts) {
    const workoutElement = event.target.closest(`.workout`);

    if (!workoutElement) return;

    const workoutDataElement = workoutElement.querySelector(`.workout__data`);
    const btn = event.target.closest(`.btn__container`);

    const id = workoutElement.dataset.id;
    const workoutToEdit = workouts.find(wrkt => wrkt.id === id);

    // Create HTML for the editWorkoutForm
    let html = `
      <form class="form edit">
      <div class="form__row">
        <label class="form__label">Type</label>
        <select class="form__input form__input--type">
        ${
          workoutToEdit.type === 'running'
            ? `<option value="running">Running</option>
               <option value="cycling">Cycling</option>`
            : `<option value="cycling">Cycling</option>
               <option value="running">Running</option>`
        }
        </select>
      </div>
      <div class="form__row">
        <label class="form__label">Distance</label>
        <input class="form__input form__input--distance" placeholder="km" value="${
          workoutToEdit.distance
        }" />
      </div>
      <div class="form__row">
        <label class="form__label">Duration</label>
        <input
          class="form__input form__input--duration" placeholder="min"
          value="${workoutToEdit.duration}"
        />
      </div>
    `;

    if (workoutToEdit.type === 'running')
      html += `
      <div class="form__row">
        <label class="form__label">Cadence</label>
        <input
          class="form__input form__input--cadence" placeholder="step/min"
          value="${workoutToEdit.cadence}"
        />
      </div>
      <div class="form__row form__row--hidden">
        <label class="form__label">Elev Gain</label>
        <input
          class="form__input form__input--elevation" placeholder="meters"
          value="${workoutToEdit.elevation}"
        />
      </div>
      `;

    if (workoutToEdit.type === 'cycling')
      html += `
      <div class="form__row form__row--hidden">
        <label class="form__label">Cadence</label>
        <input
          class="form__input form__input--cadence"
          value="${workoutToEdit.cadence}"
        />
      </div>
      <div class="form__row">
        <label class="form__label">Elev Gain</label>
        <input
          class="form__input form__input--elevation"
          value="${workoutToEdit.elevation}"
        />
      </div>
      `;

    html += `
    <div class="form__row submit__edit">
      <input type="submit" class="btn submit"/>
    </div>
    </form>`;

    // Delete workoutDataElement and button, then add edit form
    workoutElement.removeChild(workoutDataElement);
    workoutElement.removeChild(btn);
    workoutElement.insertAdjacentHTML('beforeend', html);

    // Add an event listener to a change in workout type
    workoutElement
      .querySelector('.form__input--type')
      .addEventListener('change', function () {
        workoutElement
          .querySelector('.form__input--elevation')
          .closest(`.form__row`)
          .classList.toggle(`form__row--hidden`);
        workoutElement
          .querySelector('.form__input--cadence')
          .closest(`.form__row`)
          .classList.toggle(`form__row--hidden`);
      });
  }

  getEditFormData(event) {
    const editForm = event.target.closest('.edit');
    return {
      id: editForm.closest('.workout').dataset.id,
      type: editForm.querySelector('.form__input--type').value,
      distance: +editForm.querySelector('.form__input--distance').value,
      duration: +editForm.querySelector('.form__input--duration').value,
      cadence: +editForm.querySelector('.form__input--cadence').value,
      elevation: +editForm.querySelector('.form__input--elevation').value,
      getInputs() {
        return [this.distance, this.duration, this.cadence, this.elevation];
      },
    };
  }

  updateWorkout(event, editedWorkout) {
    const workout = event.target.closest('.workout');

    workout.innerHTML = ``;

    let html = `
    <h2 class="workout__title">${editedWorkout.discription}</h2>
    ${this.#xIcon}
    <div class="workout__data">
      <div class="workout__details">
        <span class="workout__icon">${
          editedWorkout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`
        }</span>
        <span class="workout__value">${editedWorkout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${editedWorkout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (editedWorkout.type === `running`)
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${editedWorkout.pace}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${editedWorkout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </div>
      `;

    if (editedWorkout.type === `cycling`)
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${editedWorkout.speed}</span>
            <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${editedWorkout.elevation}</span>
            <span class="workout__unit">m</span>
        </div>
      </div>
      `;

    html += `
    <div class="btn__container">         
        <button class="btn workout__edit">Edit</button>         
    </div>
    `;

    editedWorkout.type === 'running'
      ? workout.classList.remove('workout--cycling')
      : workout.classList.remove('workout--running');

    workout.classList.add(`workout--${editedWorkout.type}`);

    workout.insertAdjacentHTML('beforeend', html);

    // Rerenders the marker popup in the event of a workout type change
    this.#markers[editedWorkout.id]
      .closePopup()
      .bindPopup(
        L.popup({
          maxwidth: 250,
          minwidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${editedWorkout.type}-popup`,
        })
      )
      .setPopupContent(
        `${editedWorkout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`} ${
          editedWorkout.discription
        }`
      )
      .openPopup();
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

  addHandlerEditWorkout(handler) {
    document.querySelectorAll('.workout__edit').forEach(edit => {
      edit.addEventListener(`click`, function (event) {
        handler(event);
      });
    });
  }

  addHandlerSubmitWorkoutEdits(handler) {
    document.querySelectorAll('.edit').forEach(editForm => {
      editForm.addEventListener('submit', function (event) {
        event.preventDefault();

        handler(event);
      });
    });
  }
}

export default new WorkoutView();
