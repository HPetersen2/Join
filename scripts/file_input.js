const fileInput = document.getElementById('file-input');
let allFiles = [];

/**
 * Listens for file input changes and handles uploaded files.
 */
fileInput.addEventListener('change', async () => {
    const files = fileInput.files;
    if (files.length > 0) {
        handleFiles(Array.from(files));
    }
});

/**
 * Handles the uploaded files one by one.
 * @param {File[]} files - The list of uploaded files.
 */
async function handleFiles(files) {
    for (const file of files) {
        if (!validateFileLimit()) return;
        if (!validateFileType(file)) return;
        await processFile(file);
    }
}

/**
 * Validates the maximum file upload limit.
 * @returns {boolean} Returns true if the limit is not exceeded.
 */
function validateFileLimit() {
    if (allFiles.length >= 3) {
        errorUpload.textContent = `You can upload a maximum of 3 images.`;
        return false;
    }
    return true;
}

/**
 * Validates whether the uploaded file is an image.
 * @param {File} file - The file to validate.
 * @returns {boolean} Returns true if the file is an image.
 */
function validateFileType(file) {
    if (!file.type.startsWith('image/')) {
        errorUpload.textContent = `The file "${file.name}" is not a valid image.`;
        return false;
    }
    return true;
}

/**
 * Processes the image file: compresses, stores, and renders it.
 * @param {File} file - The image file to process.
 */
async function processFile(file) {
    const uploadFieldRef = document.getElementById('upload-field');
    uploadFieldRef.innerHTML = "";
    const compressedBase64 = await compressImage(file, 800, 800, 0.8);
    saveFile(file, compressedBase64);
    renderFiles(uploadFieldRef);
}

/**
 * Saves the compressed image data to the allFiles array.
 * @param {File} file - The original file.
 * @param {string} base64 - The compressed image in base64 format.
 */
function saveFile(file, base64) {
    allFiles.push({
        fileName: file.name,
        fileShortName: file.name.slice(0, 6),
        fileEndName: file.name.slice(-3),
        fileType: file.type,
        base64: base64,
    });
}

/**
 * Renders all saved image files to the upload area.
 * @param {HTMLElement} container - The HTML container for rendering files.
 */
function renderFiles(container) {
    container.innerHTML = "";
    allFiles.forEach((file) => {
        container.innerHTML += `
            <div class="file-add-task">
                <img onclick="galleryAddTask.show()" class="view-upload" src="${file.base64}" alt="${file.fileName}">
                <p class="file-add-task-name">${file.fileShortName}...${file.fileEndName}</p>
            </div>`;
    });
    window.galleryAddTask = new Viewer(document.getElementById('upload-field'), {
        filter(image) {
          return !image.classList.contains('no-viewer');
        }
    });
}

/**
 * This function opens the file upload.
 */
function openUpload() {
    document.getElementById('file-input').click();
}

/**
 * Handle the click event for the container.
 * 
 * @param {Event} event The click event.
 */
function handleContainerClick(event) {
    if (event.target.tagName.toLowerCase() === 'img') {
        return;
    } else {
        openUpload();
    }
}

/**
 * Compresses an image file to a specified size and quality.
 * @param {File} file - The image file to compress.
 * @param {number} maxWidth - Maximum width of the compressed image.
 * @param {number} maxHeight - Maximum height of the compressed image.
 * @param {number} quality - Compression quality (0 to 1).
 * @returns {Promise<string>} Base64 string of the compressed image.
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            loadImage(event.target.result)
                .then(img => {
                    const { canvas, context } = prepareCanvas(img, maxWidth, maxHeight);
                    drawImageOnCanvas(context, img, canvas.width, canvas.height);
                    const base64 = getCompressedBase64(canvas, quality);
                    resolve(base64);
                })
                .catch(() => reject('Error loading the image.'));
        };

        reader.onerror = () => reject('Error reading the file.');
        reader.readAsDataURL(file);
    });
}

/**
 * Loads an image from a data URL.
 * @param {string} src - The data URL of the image.
 * @returns {Promise<HTMLImageElement>} Loaded image element.
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Creates a canvas and resizes it based on image and max dimensions.
 * @param {HTMLImageElement} img - The loaded image element.
 * @param {number} maxWidth - The max width allowed.
 * @param {number} maxHeight - The max height allowed.
 * @returns {{ canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }}
 */
function prepareCanvas(img, maxWidth, maxHeight) {
    let { width, height } = img;

    if (width > maxWidth || height > maxHeight) {
        if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    return { canvas, context };
}

/**
 * Draws an image onto the given canvas context.
 * @param {CanvasRenderingContext2D} context - Canvas context to draw on.
 * @param {HTMLImageElement} img - The image to draw.
 * @param {number} width - The width to draw the image.
 * @param {number} height - The height to draw the image.
 */
function drawImageOnCanvas(context, img, width, height) {
    context.drawImage(img, 0, 0, width, height);
}

/**
 * Converts the canvas to a compressed JPEG base64 string.
 * @param {HTMLCanvasElement} canvas - The canvas to convert.
 * @param {number} quality - Compression quality (0 to 1).
 * @returns {string} Base64 encoded image.
 */
function getCompressedBase64(canvas, quality) {
    return canvas.toDataURL('image/jpeg', quality);
}
