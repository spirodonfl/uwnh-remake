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

export function listenToAllErrors() {
    window.addEventListener("error", (ErrorEvent) => {
         let output = document.getElementById("result");
         
         // Print the error message
         output.innerHTML += "Message : " + ErrorEvent.message + "<br>";
         
         // Print the url of the file that contains the error
         output.innerHTML += "Url : " + ErrorEvent.filename + "<br>";
         
         // Print the line number from which the error generated
         output.innerHTML += "Line number : " + ErrorEvent.lineno + "<br>";
         
         // Print the column number of the error line
         output.innerHTML += "Column number : " + ErrorEvent.colno + "<br>";
         
         // Print he error object
         output.innerHTML += "Error Object : " + ErrorEvent.error;
    });
}

export function reloadPageAfter30Minutes(callback) {
    // Set the delay to 30 minutes (30 * 60 * 1000 milliseconds)
    const delay = 30 * 60 * 1000;

    // Schedule the page reload
    setTimeout(function() {
        callback();
    }, delay);
}

