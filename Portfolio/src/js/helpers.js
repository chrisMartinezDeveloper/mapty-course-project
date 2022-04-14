export const validInputs = function (inputs) {
  inputs.every(imp => Number.isFinite(imp));
};
export const allPositive = function (inputs) {
  inputs.every(imp => imp >= 0);
};
