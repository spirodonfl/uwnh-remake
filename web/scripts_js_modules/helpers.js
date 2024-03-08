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