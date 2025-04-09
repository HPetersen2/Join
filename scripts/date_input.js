const fileInput = document.getElementById('file-input');
let fileNames = [];
let allFiles = [];
let fileTest;

fileInput.addEventListener('change', async () => {
    const files = fileInput.files;
    if(files.length > 0) {
        Array.from(files).forEach(async file => {
            const blob = new Blob([file], {type: file.type});
            fileNames.push(file.name);
            const uploadFieldRef = document.getElementById('upload-field');
            uploadFieldRef.innerHTML = "";
            fileNames.forEach((fileName) => uploadFieldRef.innerHTML += fileName + " | ");
            const text = await blob.text();


            const base64 = await blobToBase64(blob);
            const img = document.createElement('img');
            img.src = base64;
            fileTest = base64;

            allFiles.push({
                fileName: file.name,
                fileType: file.type,
                base64: base64,
            });
            // document.getElementById('gallery').appendChild(img);
        })
    }
});

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

function openUpload() {
    document.getElementById('file-input').click();
}