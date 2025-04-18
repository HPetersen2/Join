/**
 * This function loads the selected task using the ID.
 * @param {number} id - The ID is transferred when the function is called so that the correct task can be loaded from Firebase.
 */
async function showOverlayDetailsTask(id) {
    id--
    document.getElementById('all-content').style = 'filter: brightness(0.5);';
    let responseTask = await fetch(BASE_URL + "/tasks.json");
    let responseTaskJson = await responseTask.json();
    let tasksArray = Object.values(responseTaskJson);
    tasksArray = tasksArray[id];
    renderOverlay(tasksArray);
    document.getElementById('board-lists').classList.add('no-scroll');
    const galleryDetail = new Viewer(document.getElementById('attachments-overlay'), {
        filter(image) {
          return !image.classList.contains('no-viewer');
        },
    });
}

/**
 * This function renders the selected task in the overlay.
 * @param {object} responseTaskJson - An object is transferred that contains the task that is to be rendered.
 */
function renderOverlay(responseTaskJson) {
    let refOverlay = document.getElementById('task-details');
    refOverlay.style = 'display: flex';
    refOverlay.innerHTML = "";

    let classCategory = checkCategory(responseTaskJson.category);
    let prioIcon = findPrio(responseTaskJson.prio)

    refOverlay.innerHTML = getOverlayDetails(responseTaskJson.id, classCategory, responseTaskJson.category, responseTaskJson.title, responseTaskJson.description, responseTaskJson.dueDate, responseTaskJson.prio, prioIcon);
    renderOverlayUser(responseTaskJson);    
    if (responseTaskJson.subtasks != undefined) {
        renderOverlaySubtasks(responseTaskJson);
    } else {
        document.getElementById('subtask-headline-overlay').style = 'display: none';
    }
    if(responseTaskJson.allFiles != undefined) {
        renderOverlayAttachments(responseTaskJson);
    } else {
        document.getElementById('attachments-overlay-headline').style = 'display: none';
    }
}

/**
 * This function renders the first letters of the respective names of the responsible persons. The whole name is also displayed.
 * @param {object} responseTaskJson - The object in which the users are contained.
 */
function renderOverlayUser(responseTaskJson) {
    let names = [];
    let firstLetters = [];
    let colors = [];

    determineUserInfo(responseTaskJson, names, firstLetters, colors);
    if (names.length <= 3) {
        for (let i = 0; i < names.length; i++) {
            document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i], colors[i]);
        } 
    } else {
        for (let i = 0; i < 3; i++) {
        document.getElementById('user-names-overlay').innerHTML += getUserNamesOverlay(firstLetters[i], names[i], colors[i]);
        }
        document.getElementById('more-user-overlay').innerHTML += getMoreUserOverlay(names.length - 3);
    }
}

/**
 * This function determines the first letters of the respective names from the respective task and their creator. The color is also determined.
 * @param {object} responseTaskJson 
 * @param {string} names 
 * @param {string} firstLetters 
 * @param {string} colors 
 * @returns The whole name, the initial letters and the color for the icon are returned.
 */
function determineUserInfo(responseTaskJson, names, firstLetters, colors) {
    if (responseTaskJson.assignedTo != undefined) {
        for (let i = 0; i < responseTaskJson.assignedTo.length; i++) {
            let name = responseTaskJson.assignedTo[i].firstName + " " + responseTaskJson.assignedTo[i].lastName;
            let firstLetter = responseTaskJson.assignedTo[i].firstName[0] + responseTaskJson.assignedTo[i].lastName[0];
            let color = responseTaskJson.assignedTo[i].color;
            names.push(name);
            firstLetters.push(firstLetter.replace("(", ""));
            colors.push(color);
        }
    }
    return names, firstLetters, colors;
}

/**
 * This function renders the subtasks and the corresponding icon, which indicates whether the subtask is completed or open.
 * @param {object} responseTaskJson - The task is transferred to the function as an object in order to determine the subtasks.
 */
async function renderOverlaySubtasks(responseTaskJson) {
    let id = responseTaskJson.id;
    for (let i = 0; i < responseTaskJson.subtasks.length; i++) {
        let subtaskId = [i];
        let title = responseTaskJson.subtasks[i].title;
        let status = responseTaskJson.subtasks[i].status;
        let statusIcon = responseTaskJson.subtasks[i].status;
        if (statusIcon == 'done') {
            statusIcon = './assets/icons/checked_icon.png';
        } else {
            statusIcon = './assets/icons/unchecked_icon.png';
        }
        document.getElementById('subtasks-overlay').innerHTML += getSubtasksOverlay(id, subtaskId, status, title, statusIcon);
    }
}

/**
 * This function load the attachments from the reponse.
 * @param {*} responseTaskJson - The task is transferred to the function as an object in order to determine the subtasks.
 */
async function renderOverlayAttachments(responseTaskJson) {
    let id = responseTaskJson.id;
    document.getElementById('attachments-overlay').innerHTML = "";
    if(responseTaskJson.allFiles.length <= 0) {
        document.getElementById('attachments-overlay-headline').style = 'display: none';
    }
    for (let i = 0; i < responseTaskJson.allFiles.length; i++) {
        let attachmentId = [i];
        let name = responseTaskJson.allFiles[i].fileName;
        let base64 = responseTaskJson.allFiles[i].base64;
        document.getElementById('attachments-overlay').innerHTML += getAttachmentsOverlay(id, attachmentId, name, base64);
    }
}

/**
 * This function deletes a attachment.
 * @param {number} taskId 
 * @param {number} attachmentId 
 */
async function deleteFile(taskId, attachmentId) {
    taskId--;
    let task = await loadTaskWithID(taskId);
    if (task.allFiles !== -1) {
        task.allFiles.splice(attachmentId, 1);
        await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
    }
    renderOverlayAttachments(task);
}