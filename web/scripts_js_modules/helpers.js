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