/**
 * This if statement checks if the user is logged in and
 * redirect the user to the summary page.
 */
let loggedUser = {};
const emailValid = false;
if (sessionStorage.loggedUser != undefined) {
    window.location.href = "./summary.html";
}

let signedUser = {
    "email": "",
    "name": "",
    "password": ""
};

const emailLogin = document.getElementById("login-email");
const passwordLogin = document.getElementById("login-password");
const errorMsgLogin = document.getElementById("check-email-password");
const nameSignUp = document.getElementById("signup-name");
const emailSignUp = document.getElementById("signup-email");
const passwordSignUp = document.getElementById("signup-password");
const confirmSignUp = document.getElementById("confirm-password");
const errorMsgSignUp = document.getElementById("check-password");
const confirmPasswordSignUp = document.querySelector(".password-confirm");
const inputCheckboxSignUp = document.querySelector(".input-checkbox");

const BASE_URL = 'https://join-6bab1-default-rtdb.europe-west1.firebasedatabase.app/';

/**
 * This function loads tasks from Firebase according to their path.
 * @param {String} path 
 * @returns responseToJson
 */
async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}

/**
 * This function update tasks from Firebase according to their path.
 * @param {String} path 
 * @param {Object} data - new values from a task
 * @returns responseToJson
 */
async function patchData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    return responseToJson = await response.json();
}

/**
 * This function loads an user
 */
async function loadUser() {
    errorMsgLogin.classList.add('hidden');
    if (checkInputEmail(emailLogin)) {
        if (checkInputPassword(passwordLogin)) {
            let gettedUser = await loadData("users/" + editEmailToKey(emailLogin.value));
            if (gettedUser) {
                if (matchingPassword(gettedUser.password, passwordLogin.value)) {
                    redirectToSummary(gettedUser, emailLogin, passwordLogin);
                } else {                    
                    showErrorMsg(errorMsgLogin, passwordLogin, emailLogin);
                }
            } else {                
                showErrorMsg(errorMsgLogin, passwordLogin, emailLogin);
            }
        }
    }
}

/**
 * This function checks if the email input field is not empty
 * @param {HTMLElement} email
 * @returns {boolean}
 */
function checkInputEmail(email){
    if (email.value != "") {
        email.classList.remove("wrong-input");
        return true;
    } else {
        email.classList.add("wrong-input");
        email.focus();
        return false;
    }
}

/**
 * This function checks if the password input field is not empty
 * @param {HTMLElement} password
 * @returns {boolean}
 */
function checkInputPassword(password) {
    if (password.value != "") {
        password.classList.remove("wrong-input");
        return true;
    } else {
        password.classList.add("wrong-input");
        password.focus();
        return false;
    }
}

/**
 * This function redirects the user to summary page
 * @param {Object} gettedUser
 * @param {HTMLElement} email
 * @param {HTMLElement} password
 */
function redirectToSummary(gettedUser, email, password){
    loggedUser = gettedUser;
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    checkRememberMe(); 
    email.value = "";
    password.value = "";
    rememberMe();
    window.location.href = "./summary.html";
}

/**
 * This function shows the error message
 * @param {HTMLElement} errorMsg
 * @param {HTMLElement} password
 * @param {HTMLElement} email
 */
function showErrorMsg(errorMsg, password, email) {
    errorMsg.innerHTML = "Check your email and password. Please try again.";
    errorMsg.classList.remove('hidden');
    password.classList.add("wrong-input");
    email.classList.add("wrong-input");
    sessionStorage.removeItem("loggedUser");
}

/**
 * This function loads user as guest
 */
async function loadGuestUser() {
    loggedUser = await loadData("users/guest");
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    window.location.href = "./summary.html";
}

/**
 * This function matches two passwords input values.
 * @param {String} firstPassword 
 * @param {String} secondPassword 
 * @returns {boolean}
 */
function matchingPassword(firstPassword = "", secondPassword = "") {
    return firstPassword === secondPassword;
}

/**
 * This function converts email input value to firebase key
 * by replacing . to , according to the firebase's rules.
 * @param {String} email
 * @returns {String}
 */
function editEmailToKey(email = "") {
    let editedEmail = email.replaceAll(".", ",");
    return editedEmail;
}

/**
 * Saves a signed-up user to Firebase after validating input fields.
 */
async function signUpUser() {
    clearMessageBoxes();

    if (!areFieldsFilled()) return notificationPopUp("Please fill in all fields correctly.");
    if (!areInputsValid()) return;
    if (!checkPrivacyPolicy(inputCheckboxSignUp)) return;
    if (!matchingPassword(passwordSignUp.value, confirmSignUp.value)) return errorPasswords();
    if (!isEmailValid(emailSignUp.value)) return;
    if (nameSignUp.value === "") return highlightInvalidName();

    setSignedUser(nameSignUp, emailSignUp, passwordSignUp);
    const users = await loadData("users");

    if (checkFoundUser(emailSignUp, users)) return emailAlreadyLinked(emailSignUp);

    await patchData("users/" + editEmailToKey(emailSignUp.value), signedUser);
    resetSignUpInputs(emailSignUp, nameSignUp, passwordSignUp, confirmSignUp);
    clearMessageBoxes();
    showSucessSignedUp();
}

/**
 * Checks if all required signup fields are filled.
 * 
 * @returns {boolean} True if all fields are filled, false otherwise.
 */
function areFieldsFilled() {
    return document.getElementById('privacy-checkbox').value &&
        nameSignUp.value && emailSignUp.value && passwordSignUp.value && confirmSignUp.value;
}

/**
 * Validates that none of the input fields start with a whitespace character.
 * 
 * @returns {boolean} True if all inputs are valid, false otherwise.
 */
function areInputsValid() {
    return !nameSignUp.value.startsWith(" ") &&
           !emailSignUp.value.startsWith(" ") &&
           !passwordSignUp.value.startsWith(" ") &&
           !confirmSignUp.value.startsWith(" ");
}

/**
 * Highlights the name input field as invalid and shows an error message.
 * 
 * @returns {void}
 */
function highlightInvalidName() {
    document.getElementById('signup-name').classList.add('unvalid-border');
    document.getElementById('name-signup-input-msg').classList.add('show-msg');
}

/**
 * This function checks if a user already exists
 * @param {HTMLElement} email 
 * @param {Array} users
 */
function checkFoundUser(email, users) {
    const userArray = Object.values(users);
    const foundUser = userArray.find(u => u.email === email.value);
    return foundUser != undefined;
}

/**
 * This function checks if the privacy policy is accepted
 * @param {HTMLElement} inputCheckbox 
 */
function checkPrivacyPolicy(inputCheckbox) {
    let privacyAccepted = document.getElementById("privacy-checkbox");
    if (privacyAccepted.value == 'true') {
        return true;
    } else {
        notificationPopUp("Privacy policy must be accepted!");
        inputCheckbox.classList.add('unchecked-privacy');
        privacyAccepted.focus();
        return false;
    }
}

/**
 * This function sets new values to the global object signedUser
 * @param {HTMLElement} email 
 * @param {HTMLElement} name  
 * @param {HTMLElement} password 
 */
function setSignedUser (name, email, password) {
    signedUser.name = capitalizeNames(name.value);
    signedUser.email = email.value;
    signedUser.password = password.value;
}

/**
 * This function shows the error messages when the passwords do not match
 * @param {HTMLElement} errorMsg 
 * @param {HTMLElement} confirmPassword  
 * @param {HTMLElement} password 
 */
function errorPasswords() {
    document.getElementById('confirm-password').classList.add('unvalid-border');
    document.getElementById('password-signup-input-msg').classList.add('show-msg');
}

/**
 * This function shows error message if an email is already linked
 * @param {HTMLElement} email
 */
function emailAlreadyLinked(email) {
    notificationPopUp("Email is already linked to an account!");
    email.classList.add('wrong-input');
    email.focus();
}

/**
 * This function resets the sign up inputs values
 * @param {HTMLElement} confirm 
 * @param {HTMLElement} email 
 * @param {HTMLElement} name  
 * @param {HTMLElement} password 
 */
function resetSignUpInputs(email, name, password, confirm) {
    email.classList.remove('wrong-input');
    name.value = "";
    email.value = "";
    password.value = "";
    confirm.value = "";
}

/**
 * This function capitalizes the name value
 * @param {String} name
 */
function capitalizeNames(name) {
    return name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

/**
 * This function shows the successful message of a new signed up user
 * and redirect the user to index.html, the login page.
 */
function showSucessSignedUp() {
    const successMessage = document.querySelector('.success-signed');
    successMessage.style.display = 'flex';
    setTimeout(() => {
        successMessage.style.display = 'none';
        window.location.href = "./index.html";
    }, 2000);
}

/**
 * This function shows a pop up notification with its message value.
 * @param {String} msg
 */
function notificationPopUp(msg = "") {
    const notificationMessage = document.querySelector('.notification');
    let spanMessage = document.getElementById("pop-up-notification");
    spanMessage.innerHTML = msg;
    notificationMessage.style.display = 'flex';
    setTimeout(() => {
        notificationMessage.style.display = 'none';
    }, 1500);
}

/**
 * This function checks and sets the last saved email address to the email input field.
 */
function rememberMe() {
    let savedEmail = localStorage.getItem("join-saved-email");
    if (savedEmail != null) {
        document.getElementById("login-email").value = savedEmail;
        document.querySelector(".checkbox-login").checked = true;
    }
}

/**
 * This function checks if remember me checkbox is checked.
 */
function checkRememberMe() {
    const checkBox = document.querySelector(".checkbox-login");
    if (checkBox.checked) {
        const email = document.getElementById("login-email").value;
        localStorage.setItem("join-saved-email", email);
    } else {
        localStorage.removeItem("join-saved-email");
    }
}

/**
 * This function checks if the typed email is valid.
 * @param {Event} event 
 */
function validateEmailInput(event) {
    const emailInput = event.target;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

    if (!emailRegex.test(emailInput.value)) {
        document.getElementById('signup-email').classList.add('unvalid-border');
        document.getElementById('email-signup-input-msg').classList.add('show-msg');
    }
}

/**
 * This function cleared the message under input boxes.
 */
function clearMessageBoxes() {
    document.getElementById('signup-email').classList.remove('unvalid-border');
    document.getElementById('email-signup-input-msg').classList.add('disabled-msg');
    document.getElementById('confirm-password').classList.remove('unvalid-border');
    document.getElementById('password-signup-input-msg').classList.add('disabled-msg');
}

/**
 * Checks whether a given email address has a valid format.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function isEmailValid(email) {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
    return emailRegex.test(email.trim());
}

/**
 * Adds an input event listener to the signup email and passwort confirm field.
 * Triggers checkChangeEmail() and checkChangeConfirmPassword() whenever the user types in the field.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (emailSignUp) {
        emailSignUp.addEventListener('input', () => {
            if (isEmailValid(emailSignUp.value)) {
                document.getElementById('signup-email').classList.remove('unvalid-border');
                document.getElementById('email-signup-input-msg').classList.remove('show-msg');
            }
        });
    }

    if (confirmSignUp) {
        confirmSignUp.addEventListener('input', () => {
            if(matchingPassword(passwordSignUp.value, confirmSignUp.value)) {
                document.getElementById('confirm-password').classList.remove('unvalid-border');
                document.getElementById('password-signup-input-msg').classList.remove('show-msg');
            }
        });
    }
});
