// Function to convert an image to a flat array of RGBA values
function imageToFlatArray(image) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set the canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);

    // Get the pixel data as an array
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Create a flat array to store the RGBA values
    const flatArray = [];

    // Iterate through the pixel data and extract RGBA values
    for (let i = 0; i < imageData.length; i += 4) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        const alpha = imageData[i + 3];

        // Push the RGBA values to the flat array
        flatArray.push(red, green, blue, alpha);
    }

    return flatArray;
}

// Load the image
const image = new Image();
image.src = 'your_image_url_here.jpg'; // Replace with the URL of your image

// Wait for the image to load
image.onload = function () {
    // Convert the image to a flat array
    const flatArray = imageToFlatArray(image);

    // Print the flat array to the console
    console.log(flatArray);
};