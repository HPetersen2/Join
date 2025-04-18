/**
 * This if-else statement checks if the user is logged in, else
 * it occurs a redirection to index.html, the login page.
 */
let loggedUser = {};
if (sessionStorage.loggedUser != undefined){
    loggedUser = JSON.parse(sessionStorage.loggedUser);
} else {
    window.location.href = "./index.html";
}

const colors = [
    "#FF7F00", "#FF66CC", "#A349A4",
    "#8A2BE2", "#00C5CD", "#00CED1",
    "#FF6A6A", "#FF9C00", "#FF77FF",
    "#FFFF33", "#4169E1", "#ADFF2F",
    "#FFFF00", "#FF4040", "#FFA500"
];
/**
 * Returns a random color from a predefined list of color hex codes.
 * 
 * @returns {string} A randomly selected color hex code.
 */
function generateColor() {
    const colors = [
        "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1",
        "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B",
        "#FFE62B", "#FF4646", "#FFBB2B"
    ];
    let length = colors.length;
    let color = colors[Math.floor(Math.random() * length)];
    return color;
}

/**
 * Initializes the application by loading necessary tasks.
 */
function init() {
    loadTasks();
}

/**
 * Sets the user's initials inside the designated DOM element.
 */
function setUserInitials() {
    const userInitiials = document.getElementById('user-initials');
    userInitiials.innerHTML = getUserInitials(loggedUser.name);
}

/**
 * Extracts initials from a given full name.
 * 
 * @param {string} name - The full name of the user.
 * @returns {string} The initials (first letter of the first and last name).
 */
function getUserInitials(name) {
    name = name.trim();
    const words = name.split(' ');
    let initials = '';
    initials += words[0].charAt(0).toUpperCase();
    if (words.length > 1) {
        initials += words[words.length - 1].charAt(0).toUpperCase();
    } 
    return initials;
}

/**
 * Toggles the user submenu visibility and icon state.
 */
function toggleSubmenu() {
    const submenu = document.querySelector('.submenu');
    const submenuContent = document.querySelector('.submenu-content');
    const userIcon = document.querySelector('.user-icon');
    submenuContent.classList.toggle('opened');
    submenuContent.classList.toggle('closed');
    submenu.classList.toggle('d-none');
    userIcon.classList.toggle('user-icon-activated');
}

/**
 * Logs out the current user by clearing the session and redirecting to the login page.
 */
function logOut() {
    loggedUser = {};
    sessionStorage.removeItem("loggedUser");
    window.location.href = "./index.html";
}


let colorsUser = ['#6E52FF', '#FF7A00', '#FF5EB3', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];

/**
 * This function converts the date input from dd/mm/yyyy to the 
 * format yyyy-mm-dd
 * @param {String} date - Gets the input value as dd/mm/yyyy.
 * @returns the value as yyyy-mm-dd.
 */
function convertDateFormat(date) {
    return date.split("/").reverse().join("-");
}

/**
 * This function converts the date input from yyyy-mm-dd to the 
 * format dd/mm/yyyy
 * @param {String} date - Gets the input value as yyyy-mm-dd.
 * @returns the value as dd/mm/yyyy.
 */
function dateFormatter(date){
    return date.split("-").reverse().join("/");
}


/**
 * This function formats automatically the date input to the 
 * format dd/mm/yyyy
 * @param {Event} e - Determines the last event
 */
function formatDueDate(e) {
    let date = document.getElementById("due-date-input");
    var keynum;
    if(window) {             
        keynum = e.keyCode;
    } else if(e.which){              
        keynum = e.which;
    }
    let lastChar = String.fromCharCode(keynum);
    if(lastChar != "/" && (date.value.length == 2|| date.value.length == 5)){
        date.value += '/';
    }
}

/**
 * Loads a task from the server by its ID.
 * 
 * @async
 * @param {string|number} id - The ID of the task to load.
 * @returns {Promise<Object>} A promise that resolves to the task data as a JSON object.
 */
async function loadTaskWithID(id) {
    let response = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let responseJson = await response.json();
    return responseJson;
}

/**
 * Closes the task details overlay, resets the content brightness, reloads tasks, and updates state.
 */
function closeOverlay() {
    document.getElementById('task-details').style = 'display: none;';
    document.getElementById('all-content').style = 'filter: brightness(1);';
    document.getElementById('board-lists').classList.remove('no-scroll');
    loadTasks();
    load = false;
}

/**
 * Adds a global click event listener to the document.
 * When a click occurs outside the 'task-details', 'edit-container', and 'delete-container' elements,
 * the `closeOverlay()` function is called.
 * 
 * This is useful for closing modal overlays or dropdowns when clicking elsewhere on the page.
 * Assumes that the 'task-details', 'edit-container', and 'delete-container' elements
 * exist or may be dynamically rendered in the DOM.
 */
document.addEventListener('click', function(event) {
    const taskDetails = document.getElementById('task-details');
    const edit = document.getElementById('edit-container');
    const del = document.getElementById('delete-container');
  
    if (taskDetails) {
      if (!taskDetails.contains(event.target) && !edit.contains(event.target) && !del.contains(event.target)) {
        closeOverlay();
      }
    }
});
  