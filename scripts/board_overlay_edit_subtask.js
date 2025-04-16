/**
 * This function changes the status of a subtask.
 * @param {number} id 
 * @param {number} subtaskId 
 * @param {string} status 
 */
async function changeStatusSubtask(id, subtaskId, status) {
    id--;
    id = await findKey(id);
    let responseJson = await loadTaskWithID(id);
    if (status == 'done') {
        responseJson.subtasks[subtaskId].status = 'not done'
    } else if (status == 'not done') {
        responseJson.subtasks[subtaskId].status = 'done';
    }
    await fetch(BASE_URL + "/tasks/" + id + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(responseJson)
    });
    document.getElementById('subtasks-overlay').innerHTML = "";
    renderOverlaySubtasks(responseJson);
}

/**
 * This function creates a new subtask.
 * @param {number} id 
 */
async function createSubtaskOverlay(id) {
    let inputRef = document.getElementById('subtask-edit');
    let task = await loadTaskWithID(id);
    if (!task.subtasks) {
        task.subtasks = [];
    }
    let idSubtask = task.subtasks.length;
    if (!inputRef.value.startsWith(" ")) {
        let newSubtask = {
            status: "not done",
            title: inputRef.value
        };

        await fetch(`${BASE_URL}/tasks/${id}/subtasks/${idSubtask}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newSubtask)
        });
    }
    renderOverlayEditSubtasks(id);
    clearSubtaskInput();
}

/**
 * This function clears the input field after a new subtask has been created.
 */
function clearSubtaskInput() {
    document.getElementById('subtask-edit').value = "";
}

/**
 * This function renders the editing of subtasks.
 * @param {number} id 
 */
async function renderOverlayEditSubtasks(id) {
    let responseJson = await loadTaskWithID(id);
    document.getElementById('subtasks-overlay-edit').innerHTML = "";
    if (responseJson.subtasks != undefined) {
        for (let i = 0; i < responseJson.subtasks.length; i++) {
            document.getElementById('subtasks-overlay-edit').innerHTML += getSubtasksOverlayEdit(responseJson.subtasks[i].title, id, i);
        }
    }
}

/**
 * This function allows you to edit a subtask.
 * @param {number} id 
 * @param {array} subtask 
 */
async function editSubtask(id, subtask) {
    let task = await loadTaskWithID(id);
    let subtaskId = findSubtask(task, subtask);
    for (let i = 0; i < task.subtasks.length; i++) {
        if (subtaskId == i) {
            document.getElementById('list-' + subtaskId).innerHTML = "";
            document.getElementById('list-' + subtaskId).innerHTML += getSubtasksOverlayEditInput(task.subtasks[i].title, id);
        }
    }
}

/**
 * This function deletes a subtask.
 * @param {number} taskId 
 * @param {string} subtaskName 
 */
async function deleteSubtask(taskId, subtaskName) {
    let task = await loadTaskWithID(taskId);
    let subtaskIndex = findSubtask(task, subtaskName);
    if (subtaskIndex !== -1) {
        task.subtasks.splice(subtaskIndex, 1);
        await fetch(BASE_URL + "/tasks/" + taskId + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
    }
    renderOverlayEditSubtasks(taskId);
}

/**
 * This function finds the relevant subtask.
 * @param {object} task 
 * @param {array} subtask 
 * @returns {any}
 */
function findSubtask(task, subtask) {
    let subtaskId;
    for (let i = 0; i < task.subtasks.length; i++) {
        if (task.subtasks[i].title == subtask) {
            subtaskId = i;
        }
    }
    return subtaskId;
}

/**
 * This function saves the change to the processing of the subtask.
 * @param {number} id 
 * @param {array} subtask 
 */
async function saveEditSubtask(id, subtask) {
    let task = await loadTaskWithID(id);
    let subtaskId = findSubtask(task, subtask);
    let inputTitle = document.getElementById('change-subtask-input').value;
    if (!inputTitle.startsWith(" ")) {
        let newSubtask = {
            status: "not done",
            title: inputTitle
        }
        await fetch(`${BASE_URL}/tasks/${id}/subtasks/${subtaskId}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newSubtask)
        });
    } else {
        document.getElementById('warn-emptyinput-container').innerHTML = getWarningEmptyInput();
    }
    renderOverlayEditSubtasks(id);
}
