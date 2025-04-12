let allFilesOverlay = [];
let load = false;

/**
 * Sets the load flag to true once the window is fully loaded.
 */
window.addEventListener('load', () => {
    load = true;
    checkEmptyAllFilesOverlay();
});

/**
 * Loads previously uploaded files from Firebase and displays them.
 * 
 * @param {string} taskId - ID of the task to load files for.
 */
async function loadFileFromFirebase(taskId) {
    const response = await fetch(BASE_URL + "/tasks/" + taskId + ".json");
    const responseJSON = await response.json();
    allFilesOverlay = responseJSON.allFiles || [];

    checkEmptyAllFilesOverlay();

    if (allFilesOverlay.length > 0) {
        const uploadField = document.getElementById('upload-field-overlay');
        uploadField.innerHTML = "";
        allFilesOverlay.forEach(renderFilePreview);
    }
}

/**
 * Updates the UI with a placeholder if there are no files uploaded.
 */
function checkEmptyAllFilesOverlay() {
    const uploadField = document.getElementById('upload-field-overlay');
    if (!uploadField) return;

    if (allFilesOverlay.length === 0) {
        uploadField.innerHTML = `<p class="upload-placeholder">Upload your attachments</p>`;
    } else {
        uploadField.innerHTML = "";
    }
}

/**
 * Opens the hidden file input field and sets up the event listener if not already attached.
 */
function openUploadOverlay() {
    const inputEl = document.getElementById('file-input-overlay');
    if (!inputEl) {
        console.warn('file-input-overlay is not in the DOM.');
        return;
    }

    if (!inputEl.dataset.listenerAttached) {
        inputEl.addEventListener('change', () => handleFileChange(inputEl));
        inputEl.dataset.listenerAttached = "true";
    }
    inputEl.click();
}

/**
 * Handles the file input change event and processes each selected file.
 * 
 * @param {HTMLInputElement} inputEl - The hidden file input element.
 */
async function handleFileChange(inputEl) {
    const files = inputEl.files;
    if (!files || files.length === 0) {
        return;
    }

    for (const file of files) {
        if (!validateFile(file)) return;
        await processFile(file);
    }
}

/**
 * Validates a selected file based on type and upload limits.
 * 
 * @param {File} file - The selected file.
 * @returns {boolean} - True if the file is valid, otherwise false.
 */
function validateFile(file) {
    if (allFilesOverlay.length >= 3) {
        if (errorUploadOverlay) {
            errorUploadOverlay.textContent = `A maximum of 3 images is allowed.`;
        }
        return false;
    }

    if (!file.type.startsWith('image/')) {
        if (errorUploadOverlay) {
            errorUploadOverlay.textContent = `The file "${file.name}" is not a valid image.`;
        }
        return false;
    }

    return true;
}

/**
 * Compresses and processes a valid image file, updates the UI, and stores it in the array.
 * 
 * @param {File} file - The image file to process.
 */
async function processFile(file) {
    const uploadField = document.getElementById('upload-field-overlay');
    uploadField.innerHTML = "";

    const compressedBase64 = await compressImage(file, 800, 800, 0.8);

    allFilesOverlay.push({
        fileName: file.name,
        fileShortName: file.name.slice(0, 6),
        fileEndName: file.name.slice(-3),
        fileType: file.type,
        base64: compressedBase64,
    });

    allFilesOverlay.forEach(renderFilePreview);
}

/**
 * Renders a preview of the uploaded image in the UI.
 * 
 * @param {Object} file - The file object containing metadata and base64 image data.
 * @param {string} file.fileName - Full name of the file.
 * @param {string} file.fileShortName - Shortened beginning of the file name.
 * @param {string} file.fileEndName - File extension or last characters.
 * @param {string} file.base64 - Base64-encoded image data.
 */
function renderFilePreview(file) {
    const container = document.getElementById('upload-field-overlay');
    container.innerHTML += `
        <div class="file-add-task">
            <img class="view-upload" src="${file.base64}" alt="${file.fileName}">
            <p style="font-size: 11px;" class="file-add-task-name">${file.fileShortName}...${file.fileEndName}</p>
        </div>`;
}

/**
 * Compresses an image file to the target size and quality.
 *
 * @param {File} file - The image file to compress.
 * @param {number} maxWidth - Maximum allowed width.
 * @param {number} maxHeight - Maximum allowed height.
 * @param {number} quality - Compression quality (0 to 1).
 * @returns {Promise<string>} A promise that resolves with a base64 string.
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            handleImageLoad(event.target.result, maxWidth, maxHeight, quality)
                .then(resolve)
                .catch(() => reject('Error loading the image.'));
        };

        reader.onerror = () => reject('Error reading the file.');
        reader.readAsDataURL(file);
    });
}

/**
 * Handles image loading and compression from a data URL.
 *
 * @param {string} dataUrl - Base64 data URL of the image.
 * @param {number} maxWidth - Max width for compression.
 * @param {number} maxHeight - Max height for compression.
 * @param {number} quality - JPEG quality (0 to 1).
 * @returns {Promise<string>} Compressed base64 image.
 */
function handleImageLoad(dataUrl, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const { width, height } = getScaledDimensions(img.width, img.height, maxWidth, maxHeight);
            const canvas = createCanvas(width, height);
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/jpeg', quality);
            resolve(base64);
        };

        img.onerror = reject;
        img.src = dataUrl;
    });
}

/**
 * Calculates scaled dimensions while preserving aspect ratio.
 *
 * @param {number} width - Original image width.
 * @param {number} height - Original image height.
 * @param {number} maxWidth - Max width constraint.
 * @param {number} maxHeight - Max height constraint.
 * @returns {{ width: number, height: number }} Scaled width and height.
 */
function getScaledDimensions(width, height, maxWidth, maxHeight) {
    if (width > maxWidth || height > maxHeight) {
        if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
    }
    return { width, height };
}

/**
 * Creates a canvas element with specified dimensions.
 *
 * @param {number} width - Canvas width.
 * @param {number} height - Canvas height.
 * @returns {HTMLCanvasElement} The created canvas element.
 */
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}