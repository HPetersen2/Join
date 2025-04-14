const inputEmail = document.getElementById("login-email");
const passwordIcon = document.querySelector(".password-icon");
const inputPassword = document.querySelector(".password-login");
const checkBox = document.querySelector(".checkbox-login");
const errorMsg = document.querySelector(".error-message");

/**
 * Handles keyup event on the email input field.
 * Removes error styling if the input is empty and hides error message if both fields are empty.
 */
inputEmail.addEventListener('keyup', function() {
    if (inputEmail.value === "") {
        inputEmail.classList.remove('wrong-input');
        if (inputPassword.value === "") {
            errorMsg.classList.add('hidden');
        }
    }
});

/**
 * Handles keyup event on the password input field.
 * Updates the icon depending on whether the password field has input, and hides error message if both fields are empty.
 */
inputPassword.addEventListener('keyup', function() {
    if (inputPassword.value !== "") {
        passwordIcon.classList.remove('lock-icon');
        passwordIcon.classList.add('eye-slash-icon');
    } else {
        inputPassword.setAttribute('type', 'password');
        inputPassword.classList.remove('wrong-input');
        passwordIcon.classList.remove('eye-slash-icon');
        passwordIcon.classList.remove('eye-icon');
        passwordIcon.classList.add('lock-icon');
        if (inputEmail.value === "") {
            errorMsg.classList.add('hidden');
        }
    }
});

var password = true;

/**
 * Toggles the visibility of the password by switching the input type and updating the icon.
 */
passwordIcon.addEventListener('click', function() {
    if (inputPassword.value !== "") {
        if (password) {
            inputPassword.setAttribute('type', 'text');
            passwordIcon.classList.remove('eye-icon');
            passwordIcon.classList.add('eye-slash-icon');
            inputPassword.focus();
        } else {
            inputPassword.setAttribute('type', 'password');
            passwordIcon.classList.remove('eye-slash-icon');
            passwordIcon.classList.add('eye-icon');
            inputPassword.focus();
        }
        password = !password;
    } else {
        inputPassword.focus();
    }
});

/**
 * Updates the value of the checkbox input based on its checked state.
 */
checkBox.addEventListener('change', function() {
    if (checkBox.checked) {
        checkBox.value = true;
    } else {
        checkBox.value = false;
    }
});
