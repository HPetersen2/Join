const inputEmail = document.getElementById("signup-email");
const passwordIcon = document.querySelector(".password-icon");
const confirmIcon = document.querySelector(".confirm-icon");
const inputPassword = document.querySelector(".password-signup");
const confirmPassword = document.querySelector(".password-confirm");
const checkBox = document.querySelector(".checkbox-privacy");
const inputCheckbox = document.querySelector(".input-checkbox");
const errorMsg = document.querySelector(".error-message");

/**
 * Removes the error styling from the email input if it is empty during typing.
 */
inputEmail.addEventListener('keyup', function() {
    if (inputEmail.value === "") {
        inputEmail.classList.remove('wrong-input');
    }
});

/**
 * Validates the email when the input field loses focus, if not empty.
 * 
 * @param {FocusEvent} event - The blur/focusout event triggered by the email input.
 */
inputEmail.addEventListener('focusout', function(event) {
    if (inputEmail.value !== "") {
        validateEmailInput(event);
    } else {
        inputEmail.classList.remove('wrong-input');
    }
});

/**
 * Updates the password icon based on the input state.
 * Resets error styling and icon if password is empty.
 */
inputPassword.addEventListener('keyup', function() {
    if (inputPassword.value !== "") {
        passwordIcon.classList.remove('lock-icon');
        passwordIcon.classList.add('eye-slash-icon');
    } else {
        inputPassword.setAttribute('type', 'password');
        passwordIcon.classList.remove('eye-slash-icon');
        passwordIcon.classList.remove('eye-icon');
        passwordIcon.classList.add('lock-icon');
        if (confirmPassword.value === "") {
            confirmPassword.classList.remove('wrong-input');
            errorMsg.classList.add('hidden');
        }
    }
});

/**
 * Updates the confirm password icon based on the input state.
 * Resets error styling and icon if confirm password is empty.
 */
confirmPassword.addEventListener('keyup', function() {
    if (confirmPassword.value !== "") {
        confirmIcon.classList.remove('lock-icon');
        confirmIcon.classList.add('eye-slash-icon');
    } else {
        confirmPassword.setAttribute('type', 'password');
        confirmIcon.classList.remove('eye-slash-icon');
        confirmIcon.classList.remove('eye-icon');
        confirmIcon.classList.add('lock-icon');
        if (inputPassword.value === "") {
            confirmPassword.classList.remove('wrong-input');
            errorMsg.classList.add('hidden');
        }
    }
});

var password = true;

/**
 * Toggles the visibility of the password input field (show/hide password) and updates icon.
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

var confirmPass = true;

/**
 * Toggles the visibility of the confirm password input field (show/hide) and updates icon.
 */
confirmIcon.addEventListener('click', function() {
    if (confirmPassword.value !== "") {
        if (confirmPass) {
            confirmPassword.setAttribute('type', 'text');
            confirmIcon.classList.remove('eye-icon');
            confirmIcon.classList.add('eye-slash-icon');
            confirmPassword.focus();
        } else {
            confirmPassword.setAttribute('type', 'password');
            confirmIcon.classList.remove('eye-slash-icon');
            confirmIcon.classList.add('eye-icon');
            confirmPassword.focus();
        }
        confirmPass = !confirmPass;
    } else {
        confirmPassword.focus();
    }
});

/**
 * Updates checkbox value when changed and removes visual error indication if checked.
 */
checkBox.addEventListener('change', function() {
    if (checkBox.checked) {
        checkBox.value = true;
        inputCheckbox.classList.remove('unchecked-privacy');
    } else {
        checkBox.value = false;
    }
});
