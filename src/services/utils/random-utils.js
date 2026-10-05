/**
 * Fisher-Yates shuffle — mutates array in place, returns it.
 * @param {Array} arr
 * @returns {Array}
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns a new shuffled copy, original untouched.
 * @param {Array} arr
 * @returns {Array}
 */
export function shuffled(arr) {
  return shuffle([...arr]);
}

/**
 * Pick one random element from array.
 * @param {Array} arr
 * @returns {*}
 */
export function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick n random elements (no repeat) from array.
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
export function sampleN(arr, n) {
  return shuffled(arr).slice(0, n);
}
