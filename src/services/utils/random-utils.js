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
