import { globals } from './globals.js';

export function addEventListenerWithRemoval(element, event, handler) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
}

export function removeAndReorder(obj, indexToRemove) {
    // Step 1: Remove the specified index
    delete obj[indexToRemove];

    // Step 2: Reorder the remaining indices
    let keys = Object.keys(obj).sort((a, b) => a - b); // Sort keys to ensure they are in sequence
    let newObj = {};
    keys.forEach((key, newIndex) => {
        if (key > indexToRemove) {
            newObj[newIndex] = obj[key];
        } else {
            newObj[key] = obj[key];
        }
    });

    return newObj;
}

export function flattenObjectToArray(obj) {
    let result = [];

    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // If the value is an object, recursively flatten it
            result = result.concat(flattenObjectToArray(obj[key]));
        } else {
            // If the value is not an object, add it to the result array
            result.push(obj[key]);
        }
    }

    return result;
}

export function convertObjectToNestedArray(obj) {
    let result = [];

    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // If the value is an object, recursively convert it to a nested array
            result[key] = convertObjectToNestedArray(obj[key]);
        } else {
            // If the value is not an object, add it to the result array
            result[key] = obj[key];
        }
    }

    return result;
}

export function swapElements(arr, index1, index2) {
    // Check if the indices are valid and within the array bounds
    if (index1 >= 0 && index1 < arr.length && index2 >= 0 && index2 < arr.length) {
        // Use array destructuring to swap the elements
        [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
    } else {
        console.log("One or both indices are out of bounds for the given array.");
    }
}

export function getRandomKey(obj) {
    // Step 1: Get all the keys of the object
    var keys = Object.keys(obj);
    
    // Step 2: Generate a random index
    var randomIndex = Math.floor(Math.random() * keys.length);
    
    // Step 3: Return the key at the random index
    return keys[randomIndex];
}

export function convertToLowercaseWithUnderscores(str) {
    return str.toLowerCase().replace(/ /g, "_");
}

export function listenForKeys(parent) {
    document.addEventListener('keydown', (e) => {
        for (let i = 0; i < globals.INPUTS.length; ++i) {
            let input = globals.INPUTS[i];
            if (e.code === input.code && e.shiftKey === input.shiftKey && e.ctrlKey === input.ctrlKey) {
                if (input.context === globals.MODES.indexOf('ALL') || input.context === globals.MODE) {
                    input.callback(parent);
                }
            }
        }
    });
}
