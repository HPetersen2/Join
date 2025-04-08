
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if(files.length > 0) {
        Array.from(files).forEach(async file => {
            const blob = new Blob([file], {type: file.type});
            const text = await blob.text();
            console.log('Neue Datei', text)
        })
    }
})

function openUpload() {
    document.getElementById('file-input').click();
}