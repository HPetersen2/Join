function getTemplateContacts () {
    return `<template id="contactTemplate">
                <section class="contactItem">
                    <section class="contactWrapper" style="width: 80%; display: flex; align-items: center;">
                        <div class="initialsCircle"></div>
                        <section class="contactDetails">
                            <p style="display: flex; align-items: center; font-size: 18px;">
                                <span class="contactName"></span>
                            </p>
                            <p><span class="contactEmail"></span></p>
                        </section>
                    </section>
                </section>
            </template>`
}