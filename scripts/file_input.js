
/**
 * Reference to the file input and definition of an empty array for the uploaded files.
 */
const fileInput = document.getElementById('file-input');
let allFiles = [];


/**
 * This function waits for a file to be uploaded. The image is then validated, compressed and saved in the array. It is then also rendered.
 */
fileInput.addEventListener('change', async () => {
    const files = fileInput.files;
    if (files.length > 0) {
        Array.from(files).forEach(async file => {
            if(allFiles.length >= 3) {
                errorUpload.textContent = `Es sind maximal 3 Bilder erlaubt.`;
                return;
            }
            if (!file.type.startsWith('image/')) {
                errorUpload.textContent = `Die Datei "${file.name}" ist kein gültiges Bild.`;
                return;
            }
            const uploadFieldRef = document.getElementById('upload-field');
            uploadFieldRef.innerHTML = "";
            const compressedBase64 = await compressImage(file, 800, 800, 0.8);
            allFiles.push({
                fileName: file.name,
                fileShortName: file.name.slice(0, 6),
                fileEndName: file.name.slice(-3),
                fileType: file.type,
                base64: compressedBase64,
            });
            allFiles.forEach((file) => uploadFieldRef.innerHTML += `<div class="file-add-task"><img class="view-upload" src="${file.base64}" alt="${file.fileName}"><p class="file-add-task-name">${file.fileShortName}...${file.fileEndName}</div>`);
        });
    }
});
/**
 * This function open the file upload.
 */
function openUpload() {
    document.getElementById('file-input').click();
}

/**
 * Compresses an image to a target size or quality.
 * @param {File} file - The image file to be compressed.
 * @param {number} maxWidth - The maximum width of the image.
 * @param {number} maxHeight - The maximum height of the image.
 * @param {number} quality - Quality of the compressed image (between 0 and 1).
 * @returns {Promise<string>} - Base64 string of the compressed image.
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Berechnung der neuen Größe, um die Proportionen beizubehalten
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    } else {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Zeichne das Bild in das Canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Exportiere das Bild als Base64
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = () => reject('Fehler beim Laden des Bildes.');
            img.src = event.target.result;
        };

        reader.onerror = () => reject('Fehler beim Lesen der Datei.');
        reader.readAsDataURL(file);
    });
}