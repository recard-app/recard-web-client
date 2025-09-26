/**
 * Utility functions for generating smart slider steps that include exact maximum values
 */

/**
 * Generates smart step values for a slider that increments by whole dollars
 * but includes the exact maximum value as the final step if it has a fractional part.
 *
 * @param max - The maximum value (can have decimal places)
 * @param stepSize - The increment size for regular steps (default: 1)
 * @returns Array of step values for the slider
 *
 * @example
 * generateSmartSteps(12.95) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12.95]
 * generateSmartSteps(15) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
 * generateSmartSteps(5.25, 0.5) => [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.25]
 */
export function generateSmartSteps(max: number, stepSize: number = 1): number[] {
  if (max <= 0) return [0];

  const steps: number[] = [];

  // Generate regular steps from 0 to the floor of max
  const maxFloor = Math.floor(max / stepSize) * stepSize;
  for (let i = 0; i <= maxFloor; i += stepSize) {
    steps.push(Number(i.toFixed(2))); // Round to 2 decimal places to avoid floating point issues
  }

  // If max has a fractional part that's different from the last step, add it
  const roundedMax = Number(max.toFixed(2));
  const lastStep = steps[steps.length - 1];

  if (roundedMax > lastStep) {
    steps.push(roundedMax);
  }

  return steps;
}

/**
 * Finds the closest valid step value for a given input value
 *
 * @param value - The input value to snap to a step
 * @param steps - Array of valid step values
 * @returns The closest valid step value
 */
export function snapToClosestStep(value: number, steps: number[]): number {
  if (steps.length === 0) return 0;
  if (steps.length === 1) return steps[0];

  // Find the closest step
  let closest = steps[0];
  let minDiff = Math.abs(value - closest);

  for (const step of steps) {
    const diff = Math.abs(value - step);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }

  return closest;
}

/**
 * Gets the step index for a given value in the steps array
 *
 * @param value - The value to find the index for
 * @param steps - Array of step values
 * @returns The index of the step, or -1 if not found
 */
export function getStepIndex(value: number, steps: number[]): number {
  const roundedValue = Number(value.toFixed(2));
  return steps.findIndex(step => Math.abs(step - roundedValue) < 0.01);
}

/**
 * Converts a step index to its corresponding value
 *
 * @param index - The step index
 * @param steps - Array of step values
 * @returns The value at the given index, or 0 if index is out of bounds
 */
export function stepIndexToValue(index: number, steps: number[]): number {
  if (index < 0 || index >= steps.length) return 0;
  return steps[index];
}