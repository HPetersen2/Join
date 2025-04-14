const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

/**
 * Function to handle the submission of the contact form.
 */
function submitContact() {
    const nameRef = document.getElementById('addName');
    const emailRef = document.getElementById('addEmail');
    const phoneRef = document.getElementById('addPhone');

    nameRef.classList.remove('unvalid-border');
    emailRef.classList.remove('unvalid-border');
    phoneRef.classList.remove('unvalid-border');
    document.getElementById('name-input-msg').classList.remove('show-msg');
    document.getElementById('email-input-msg').classList.remove('show-msg');
    document.getElementById('phone-input-msg').classList.remove('show-msg');

    checkValidation(nameRef, emailRef, phoneRef);
}

function isValidEmail(email) {
    return pattern.test(email);
}

/**
 * This function checks the validity of the input fields and adds error classes if invalid.
 * @param {string} nameRef - Reference to the name input field.
 * @param {string} emailRef - Reference to the email input field.
 * @param {string} phoneRef - Reference to the phone input field.
 */
function checkValidation(nameRef, emailRef, phoneRef) {
    if(!nameRef.checkValidity() || nameRef.value.startsWith(" ")) {
        nameRef.classList.add('unvalid-border');
        document.getElementById('name-input-msg').classList.add('show-msg');
    }
    if(!emailRef.checkValidity() || emailRef.value.startsWith(" ") || !isValidEmail(emailRef.value)) {
        emailRef.classList.add('unvalid-border');
        document.getElementById('email-input-msg').classList.add('show-msg');
    }
    if(!phoneRef.checkValidity() || phoneRef.value.startsWith(" ")) {
        phoneRef.classList.add('unvalid-border');
        document.getElementById('phone-input-msg').classList.add('show-msg');
    }

    if(nameRef.checkValidity() && emailRef.checkValidity() && phoneRef.checkValidity() && !nameRef.value.startsWith(" ") && !emailRef.value.startsWith(" ") && !phoneRef.value.startsWith(" ") && isValidEmail(emailRef.value)) {
        createContact();
    }
}

/**
 * This function checks the validity of the input fields and adds error classes if invalid.
 * @param {string} nameRef - Reference to the name input field.
 * @param {string} emailRef - Reference to the email input field.
 * @param {string} phoneRef - Reference to the phone input field.
 */
function checkValidationEdit(editName, editEmail, editPhone) {
    if(!editName.checkValidity() || editName.value.startsWith(" ")) {
        editName.classList.add('unvalid-border');
        document.getElementById('name-edit-input-msg').classList.add('show-msg');
    }
    if(!editEmail.checkValidity() || editEmail.value.startsWith(" ") || !isValidEmail(editEmail.value)) {
        editEmail.classList.add('unvalid-border');
        document.getElementById('email-edit-input-msg').classList.add('show-msg');
    }
    if(!editPhone.checkValidity() || editPhone.value.startsWith(" ")) {
        editPhone.classList.add('unvalid-border');
        document.getElementById('phone-edit-input-msg').classList.add('show-msg');
    }

    if(editName.checkValidity() && editEmail.checkValidity() && editPhone.checkValidity() && !editName.value.startsWith(" ") && !editEmail.value.startsWith(" ") && !editPhone.value.startsWith(" ") && isValidEmail(editEmail.value)) {
        saveEditChanges();
    }
}

/**
 * Function to handle the submission of the contact form.
 */
function submitEditContact() {
    const nameRef = document.getElementById('editName');
    const emailRef = document.getElementById('editEmail');
    const phoneRef = document.getElementById('editPhone');

    nameRef.classList.remove('unvalid-border');
    emailRef.classList.remove('unvalid-border');
    phoneRef.classList.remove('unvalid-border');
    document.getElementById('name-edit-input-msg').classList.remove('show-msg');
    document.getElementById('email-edit-input-msg').classList.remove('show-msg');
    document.getElementById('phone-edit-input-msg').classList.remove('show-msg');

    checkValidationEdit(nameRef, emailRef, phoneRef);
}