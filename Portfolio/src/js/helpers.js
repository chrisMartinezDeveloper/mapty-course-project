export const validInputs = function (inputs) {
  return inputs.every(inp => Number.isFinite(inp));
};
export const allPositive = function (inputs) {
  return inputs.every(inp => inp >= 0);
};
