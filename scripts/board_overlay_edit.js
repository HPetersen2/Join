let idTask = 0;
/**
 * This function is called as soon as a task is to be processed. All parameters are first collected and transferred to other functions.
 * @param {number} id - Transfers the ID of the task in question.
 * @param {string} title - Hands over the title.
 * @param {string} description - Transfers the description.
 * @param {Date} dueDate - Transfers the completion date.
 * @param {string} priority - Transfers the priority.
 */
async function editTask(id, title, description, dueDate, priority) {
    id--;
    idTask = id;
    let refOverlay = document.getElementById('task-details');
    refOverlay.innerHTML = "";
    refOverlay.innerHTML = getOverlayEdit(id, title, description, dueDate);
    document.getElementById('due-date-input').defaultValue = dateFormatter(dueDate);
    checkActivePriority(priority);
    selectedUserEdit(id);
    renderOverlayEditSubtasks(id);
    loadFileFromFirebase(id);
    load = true;
    loadContacts(id);
    activeFlatPickr();
}

/**
 * This function calls up the calendar for the dueDate.
 */
function activeFlatPickr() {
    const datePickerInput = document.getElementById('due-date-input');
    const openCalendar = document.getElementById('calendar-icon');
    const calendar = flatpickr(datePickerInput, {
        minDate: "today",
        dateFormat: "Y-m-d",
    });
    openCalendar.addEventListener('click', () => {
        calendar.open();
    });
}

/**
 * This function changes the icon for the priority, depending on how it is.
 * @param {string} priority - Transfers the priority.
 */
function checkActivePriority(priority) {
    if (priority == 'Urgent') {
        document.getElementById('urgent-label').style.backgroundColor = '#FF3D00';
        document.getElementById('urgent-text').style = 'color: #FFFFFF;';
        document.getElementById('urgent-icon').setAttribute("src", './assets/icons/urgent_icon_active.png');
    } else if (priority == 'Medium') {
        document.getElementById('medium-label').style.backgroundColor = '#FFA800';
        document.getElementById('medium-text').style = 'color: #FFFFFF;';
        document.getElementById('medium-icon').setAttribute("src", './assets/icons/medium_icon_active.png');
    } else if (priority == 'Low') {
        document.getElementById('low-label').style.backgroundColor = '#7AE229';
        document.getElementById('low-text').style = 'color: #FFFFFF;';
        document.getElementById('low-icon').setAttribute("src", './assets/icons/low_icon_active.png');
    }
    activePriority = priority;
}

/**
 * This function changes an icon if the priority is changed by the user.
 * @param {string} newPriority - Receives the new priority.
 */
function changePriority(newPriority) {
    let prioArr = ['urgent', 'medium', 'low'];
    for (let i = 0; i < prioArr.length; i++) {
        document.getElementById(prioArr[i] + '-label').style.backgroundColor = '#FFFFFF';
        document.getElementById(prioArr[i] + '-text').style = 'color: #000000;';
        let pictureUrl = './assets/icons/' + prioArr[i] + '_icon.png'
        document.getElementById(prioArr[i] + '-icon').setAttribute("src", pictureUrl);
    }
    checkActivePriority(newPriority);
}

/**
 * This function saves the respective changes and loads them into Firebase.
 * @param {number} id - Transfers the ID to save the changes to the correct object.
 */
async function saveEdit(id) {
    id = await findKey(id);
    let responseJson = await loadTaskWithID(id);
    responseJson = generateChangeTask(responseJson);
    let responseTask = await fetch(BASE_URL + "/tasks/" + id + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(responseJson)
    });
    closeOverlay();
    loadTasks();
}

/**
 * This function loads the existing information into the placeholders.
 * @param {Object} responseJson - The entire task is transferred as an object.
 * @returns Object Task
 */
function generateChangeTask(responseJson) {
    let title = document.getElementById('overlay-title').value;
    let description = document.getElementById('overlay-description').value;
    let dueDate = document.getElementById('due-date-input').value;
    responseJson.allFiles = allFilesOverlay;

    if (title != "") {
        responseJson.title = title;
    }
    if (description != "") {
        responseJson.description = description;
    }
    if (dueDate != "") {
        responseJson.dueDate = convertDateFormat(dueDate);
    }
    responseJson.prio = activePriorityButton();
    return responseJson;
}

/**
 * This function highlights the priority already selected.
 * @returns Returns the active element.
 */
function activePriorityButton() {
    let lowLabel = window.getComputedStyle(document.getElementById('low-label')).getPropertyValue("background-color");
    let mediumLabel = window.getComputedStyle(document.getElementById('medium-label')).getPropertyValue("background-color");
    let urgentLabel = window.getComputedStyle(document.getElementById('urgent-label')).getPropertyValue("background-color");
    let activeElement;

    if (lowLabel == "rgb(122, 226, 41)") {
        activeElement = "Low";
    }
    if (mediumLabel == "rgb(255, 168, 0)") {
        activeElement = "Medium";
    }
    if (urgentLabel == "rgb(255, 61, 0)") {
        activeElement = "Urgent";
    }
    return activeElement;
}

/**
 * This function loads the contacts from Firebase.
 * @param {number} id - Transfers the ID of the respective task.
 */
async function loadContacts(id) {
    let userAsContact = {
        email: loggedUser.email,
        id: 0,
        name: loggedUser.name + " (You)",
        phone: '000000'
    }
    let activeUser = await loadActiveUser(id);
    let response = await fetch(BASE_URL + "/contacts.json");
    let responseJson = await response.json();
    let activeUserIndex = checkActiveUser(activeUser, responseJson);
    activeUserIndex.sort();
    responseJson.unshift(userAsContact);
    renderOverlayContacts(id, responseJson, activeUserIndex);
}

/**
 * This function renders the existing contacts when the drop-down is opened.
 * @param {number} id - Transfers the ID of the respective task.
 * @param {object} responseJson - Contains all contacts as an object.
 * @param {number} activeUserIndex - Contains the index of the users who are active, if there are any.
 */
function renderOverlayContacts(id, responseJson, activeUserIndex) {
    for (let i = 0; i < responseJson.length; i++) {
        let urlIcon = './assets/icons/unchecked_icon.png';
        for (let k = 0; k < activeUserIndex.length; k++) {
            if (activeUserIndex[k] == [i - 1]) {
                urlIcon = './assets/icons/checked_icon.png';
            }
        }
        let color = generateColor();
        let firstLetterFirstName = responseJson[i].name[0];
        let position = responseJson[i].name.indexOf(" ");
        let firstLetterLastName = responseJson[i].name[position + 1];
        document.getElementById('user-dropdown').innerHTML += getContactName(id, responseJson[i].name, color, firstLetterFirstName, firstLetterLastName, urlIcon);
    }
}

/**
 * This function determines the users that have been entered for this task.
 * @param {number} id - The ID is transferred in order to find the correct task.
 * @returns An array is returned in which the active users.
 */
async function loadActiveUser(id) {
    let task = await loadTaskWithID(id);
    let activeUser = [];
    if(task.assignedTo != undefined) {
        for (let i = 0; i < task.assignedTo.length; i++) {
            let name = task.assignedTo[i].firstName + " " + task.assignedTo[i].lastName;
            activeUser.push(name);
        }
    }
    return activeUser;
}

/**
 * This function uses the name to check which index the users have.
 * @param {array} activeUser - The array in which the names are stored is transferred.
 * @param {object} responseJson - The task is transferred as an object.
 * @returns An array is returned in which the index of the active users has been saved.
 */
function checkActiveUser(activeUser, responseJson) {
    let allContacts = [];
    let activeUserIndex = [];
    for (let i = 0; i < responseJson.length; i++) {
        allContacts.push(responseJson[i].name);
    }
    for (let i = 0; i < allContacts.length; i++) {
        if (allContacts.indexOf(activeUser[i]) != -1) {
            activeUserIndex.push(allContacts.indexOf(activeUser[i]));
        }
    }
    return activeUserIndex;
}

/**
 * This function saves the change when a user is changed in the task.
 * @param {object} task - The task is transferred as an object.
 * @param {string} firstName - The first name is transferred.
 * @param {string} lastName - The surname is transferred.
 */
function updateAssignedTo(task, firstName, lastName) {
    const index = task.assignedTo.findIndex(user =>
        user.firstName === firstName && user.lastName === lastName
    );
    if (index === -1) {
        task.assignedTo.push({ firstName, lastName, color: generateColor() });
    } else {
        task.assignedTo.splice(index, 1);
    }
}

/**
 * This function saves the change in Firebase.
 * @param {string} taskRefUrl 
 * @param {object} updatedTask 
 */
async function updateTaskInFirebase(taskRefUrl, updatedField) {
    try {
        const response = await fetch(taskRefUrl);
        const currentTask = await response.json();
        if (!currentTask) {
            console.error("Aufgabe konnte nicht geladen werden.");
            return;
        }
        const updatedTask = { ...currentTask, ...updatedField };
        await fetch(taskRefUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
        });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Aufgabe:", error);
    }
}

/**
 * This function changes the icon when a user is selected or deselected.
 * @param {string} contactRef 
 * @param {string} checkedIcon 
 * @param {string} uncheckedIcon 
 */
function toggleIcon(contactRef, checkedIcon, uncheckedIcon) {
    const isChecked = contactRef.getAttribute("src") === checkedIcon;
    contactRef.setAttribute("src", isChecked ? uncheckedIcon : checkedIcon);
}

/**
 * This function changes the user.
 * @param {string} name 
 * @param {number} id 
 */
async function toggleAssignedTo(name, id) {
    const taskRefUrl = `${BASE_URL}/tasks/${id}.json`;
    const task = await loadTaskWithID(id);
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");
    updateAssignedTo(task, firstName, lastName);
    await updateTaskInFirebase(taskRefUrl, { assignedTo: task.assignedTo });
    const contactRef = document.getElementById('checkbox-contact-' + name);
    toggleIcon(contactRef, './assets/icons/checked_icon.png', './assets/icons/unchecked_icon.png');
    document.getElementById('user-names-edit-overlay').innerHTML = "";
    selectedUserEdit(id);
}

/**
 * This function opens the drop-down menu with the users.
 */
function openDropdownAssigned() {
    let dropdownRef = document.getElementById('selected-user-dropdown');
    let arrowRef = document.getElementById('arrow-dropdown');
    let assignedUserRef = document.getElementById('user-names-edit-overlay');
    if (dropdownRef.className == 'd-none') {
        dropdownRef.classList.remove('d-none');
        dropdownRef.classList.add('d_block');
        arrowRef.setAttribute("src", "./assets/icons/arrow_drop_down_top.png");
        assignedUserRef.classList.add('d-none');
    } else {
        dropdownRef.classList.add('d-none');
        dropdownRef.classList.remove('d_block');
        arrowRef.setAttribute("src", "./assets/icons/arrow_drop_down.png");
        assignedUserRef.classList.remove('d-none');
    }
}

/**
 * This function closes the drop-down menu.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('selected-user-dropdown');
        const dropdownButton = document.getElementById('assigned-container');
        const arrowRef = document.getElementById('arrow-dropdown');
        const assignedUserRef = document.getElementById('user-names-edit-overlay');

        if (dropdown && dropdownButton && arrowRef && assignedUserRef) {
            if (!dropdown.contains(event.target) && !dropdownButton.contains(event.target)) {
                if (!assignedUserRef.classList.contains('d-none')) {
                    dropdown.classList.add('d-none');
                    dropdown.classList.remove('d_block');
                    arrowRef.setAttribute("src", "./assets/icons/arrow_drop_down.png");
                    assignedUserRef.classList.remove('d-none');
                }
            }
        }
    });
});

/**
 * This function selects the selected users and saves them in an array.
 * @param {number} id 
 */
async function selectedUserEdit(id) {
    let responseJson = await loadTaskWithID(id);
    let usersFirstLetters = [];
    let colors = [];
    if(responseJson.assignedTo != undefined) {
        for (let i = 0; i < responseJson.assignedTo.length; i++) {
            let firstName = responseJson.assignedTo[i].firstName[0];
            let lastName = responseJson.assignedTo[i].lastName[0];
            let firstLetter = firstName + lastName;
            usersFirstLetters.push(firstLetter);
            colors.push(responseJson.assignedTo[i].color);
        }
    }
    renderOverlayEditUser(usersFirstLetters, colors)
}

/**
 * This function renders the respective users.
 * @param {array} usersFirstLetters 
 * @param {array} colors 
 */
function renderOverlayEditUser(usersFirstLetters, colors) {
    if (usersFirstLetters.length >= 8) {
        for (let i = 0; i < 8; i++) {
            document.getElementById('user-names-edit-overlay').innerHTML += getUserInititalsOverlayEdit(colors[i], usersFirstLetters[i]);
        }
        let userslength = usersFirstLetters.length - 8;
        document.getElementById('user-names-edit-overlay').innerHTML += getMoreUserOverlayEdit(userslength);
    } else {
        for (let i = 0; i < usersFirstLetters.length; i++) {
            document.getElementById('user-names-edit-overlay').innerHTML += getUserInititalsOverlayEdit(colors[i], usersFirstLetters[i]);
        }
    }
}

/**
 * This function renders the edit mode for the subtasks.
 * @param {number} id 
 */
function editMode(id) {
    let createContainer = document.getElementById('create-subtask-overlay');
    if (document.getElementById('add-subtask-overlay-edit').getAttribute("src") == "./assets/icons/add_subtask.png") {
        createContainer.innerHTML = getSubtaskOverlayIcons(id);
    } else {
        createContainer.innerHTML = getSubtaskOverlayAddIcon();
    }
}

/**
 * Waits for the dynamic appearance of an input field with ID 'subtask-edit',
 * then observes its content. Depending on whether the input is empty or not,
 * the function updates the element with ID 'create-subtask-overlay' by calling
 * either `getSubtaskOverlayIcons(idTask)` or `getSubtaskOverlayAddIcon()`.
 *
 * This function uses a MutationObserver to detect when the input is added
 * to the DOM, then attaches an 'input' event listener to react to content changes.
 *
 * Assumptions:
 * - The input field is rendered asynchronously (e.g., loaded dynamically).
 * - A global variable `idTask` must exist and contain the task ID.
 * - `getSubtaskOverlayIcons(idTask)` and `getSubtaskOverlayAddIcon()` are defined elsewhere.
 */
function waitForInputAndObserveContent() {
    const observer = new MutationObserver(() => {
        const input = document.getElementById('subtask-edit');
        if (input) {
            observer.disconnect();
            const updateOverlay = () => {
                const overlay = document.getElementById('create-subtask-overlay');
                if (!overlay) return;
                if (input.value.trim() !== '') {
                    overlay.innerHTML = getSubtaskOverlayIcons(idTask);
                } else {
                    overlay.innerHTML = getSubtaskOverlayAddIcon();
                }
            };
            updateOverlay();
            input.addEventListener('input', updateOverlay);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
window.addEventListener('DOMContentLoaded', waitForInputAndObserveContent);