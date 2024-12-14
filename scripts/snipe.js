/*
    * SCRIPT INFORMATION
    * 
    * SCRIPT NAME: Snipe Cancel
    * VERSION: v2.0
    * LAST UPDATED: November 26, 2024
    * AUTHOR: K I N G S
    * AUTHOR CONTACT: +55 48-98824-2773
    * APPROVED ON: October 25, 2023
    * 
    * WARNING: UNAUTHORIZED MODIFICATION IS STRICTLY FORBIDDEN
    * 
    * This script is protected by copyright and may not be altered, 
    * distributed, or reused without explicit written consent from the 
    * original author. Unauthorized modifications or redistribution 
    * of this code may lead to legal consequences under intellectual 
    * property laws.
    * 
    * For support, permission requests, or inquiries, please contact 
    * the author directly using the contact information above.
*/




/* Modal for managing command cancellations with draggable functionality, input fields, a dynamic table, and action buttons. */

stringHTML = `
<style>
    #fa_register_div * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        right: 0px;
    }

    #fa_register_div {
        position: fixed;
        top: 20%;
        left: 30%;
        width: 300px;
        background-color: #202225;
        border-radius: 12px;
        box-shadow: rgba(0, 0, 0, 0.5) 2px 2px 10px;
        border: 1px solid #40444b;
        padding: 25px;
        color: rgb(248, 239, 239);
        display: flex;
        flex-direction: column;
        z-index: 100;
        gap: 20px;
    }

    #fa_register_div h3 {
        background-color: #2b2d31;
        padding: 10px 14px;
        border-radius: 8px;
        text-align: center;
        color: #fff;
    }

    #fa_register_div div {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    #fa_register_div span {
        font-size: 1.00em;
        font-weight: bold;
        color: #b5b5b5;
    }

    #fa_register_div input {
        background-color: #40444b;
        border: none;
        padding: 8px;
        border-radius: 8px;
        color: white;
        font-size: 1.4em;
        transition: background-color 0.3s ease;
    }

    #fa_register_div input:focus {
        background-color: #2b2d31;
        outline: none;
    }

    #fa_register_div input:hover {
        background-color: #353b41;
    }

    #fa_register_div table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9em;
    }

    #fa_register_div th,
    #fa_register_div td {
        padding: 8px;
        text-align: center;
        border: 1px solid #40444b;
    }

    #fa_register_div th {
        background-color: #2b2d31 !important;
        background-image: none;
        color: white;
    }

    #fa_register_div tbody tr:nth-child(odd) {
        background-color: #353b41;
    }

    #fa_register_div button {
        background-color: #007BFF;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
        transition: background-color 0.3s;
        width: 100%;
    }

    #fa_register_div button:hover {
        background-color: #0056b3;
    }

    #fa_register_div {
        animation: in 0.4s ease-out, on 2s infinite ease-in-out;
    }

    #fa_animation {
        font-family: 'Arial', sans-serif;
        font-size: 1.3em;
        color: #fff;
        background-color: #202225;
        padding: 10px 0;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: rgba(0, 0, 0, 0.5) 2px 2px 10px;
        position: relative;
        font-style: italic;
    }

    #fa_animation span {
        display: inline-block;
        white-space: nowrap;
        padding-right: 100%;
        animation: continuous 5s linear(0 0%, 0.22 2.1%, 0.86 6.5%, 1.11 8.6%, 1.3 10.7%, 1.35 11.8%, 1.37 12.9%, 1.37 13.7%, 1.36 14.5%, 1.32 16.2%, 1.03 21.8%, 0.94 24%, 0.89 25.9%, 0.88 26.85%, 0.87 27.8%, 0.87 29.25%, 0.88 30.7%, 0.91 32.4%, 0.98 36.4%, 1.01 38.3%, 1.04 40.5%, 1.05 42.7%, 1.05 44.1%, 1.04 45.7%, 1 53.3%, 0.99 55.4%, 0.98 57.5%, 0.99 60.7%, 1 68.1%, 1.01 72.2%, 1 86.7%, 1 100%) infinite;
    }

    #fa_register_div .fa_color-icon {
        color: #ff0000;
    }

    .fa_close-icon {
        position: absolute;
        top: -10px;
        right: -10px !important;
        background-color: #ff5f5f;
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: rgba(0, 0, 0, 0.5) 1px 1px 5px;
        transition: background-color 0.3s ease;
    }

    .fa_close-icon i {
        font-size: 1.2em;
    }

    .fa_close-icon:hover {
        background-color: #ff3030;
    }

    #fa_register_div [data-title] {
        position: relative;
    }

    #fa_register_div [data-title]::after {
        content: attr(data-title);
        position: absolute;
        background-color: #333;
        opacity: 0;
        z-index: 100;
        color: #f5f5f5;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.85em;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.8);
        transition: all 0.3s;
        visibility: hidden;
        white-space: pre-wrap;
        font-family: sans-serif;
        font-weight: normal;
    }

    #fa_register_div [data-title]:hover::after {
        visibility: visible;
        opacity: 1;
        transition-delay: 0.5s;
    }

    #fa_register_div [data-title].right:after {
        top: 50%;
        left: 100%;
        transform: translateY(-50%) translateX(10px);
    }

    #fa_register_div [data-title].top::after {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-10px);
    }

    @keyframes in {
        from {
            opacity: 0;
            transform: scale(0.8);
        }

        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes on {

        0%,
        100% {
            box-shadow: 0 0 10px 2px rgba(0, 123, 255, 0.8);
        }

        50% {
            box-shadow: 0 0 20px 6px rgba(0, 123, 255, 0.5);
        }
    }

    @keyframes continuous {
        0% {
            transform: translateX(100%);
        }

        100% {
            transform: translateX(13%);
        }
    }
</style>
<div id="fa_register_div">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <div class="fa_close-icon" onclick="return this.parentElement.remove(undefined);">
        <i class="fa-solid fa-xmark fa-lg"></i>
    </div>
    <h3>CANCEL SNIPE</h3>
    <div data-title="DATE/TIME THAT THE NOBLE WILL ARRIVE\n\nYOU CAN CLICK ON THE COMMAND AND IT WILL BE AUTOMATICALLY FILLED" class="right">
        <input type="datetime-local" max="9999-12-31T23:59" step="1">
    </div>
    <div data-title="DATE/TIME OF THE COMMAND YOU SENT TO SNIP\n\nYOU CAN CLICK ON THE COMMAND AND IT WILL BE AUTOMATICALLY FILLED" class="right">
        <input type="datetime-local" max="9999-12-31T23:59" step="1">
    </div>
    <div data-title="DURATION OF THE COMMAND YOU SENT\n\nYOU CAN CLICK ON THE COMMAND AND IT WILL BE AUTOMATICALLY FILLED" class="right">
        <input type="time" step="1">
    </div>
    <div>
        <table>
            <thead>
                <tr>
                    <th data-title="DURATION OF COMMAND TO CANCEL" class="top"><i class="fa-solid fa-ban fa-lg"></i></th>
                    <th data-title="TIME LEFT TO CANCEL THE COMMAND" class="top"><i class="fa-solid fa-clock fa-lg"></i></th>
                    <th data-title="EXPORT THE DURATION TO CANCEL" class="top"><i class="fa-solid fa-file-export fa-lg"></i></th>
                    <th data-title="DELETE THE COMMAND" class="top"><i class="fa-solid fa-trash-can fa-lg"></i></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <button onclick="return Functions.updateTableWithProcessedTimes(undefined);">
        <i class="fa-solid fa-magnifying-glass"></i>
        CALCULATE TIMES
    </button>
    <div id="fa_animation">
        <span>
            DEVELOPED BY:
            <i class="fa_color-icon">K I N G S</i>
            🔥
        </span>
    </div>
</div>`

$(stringHTML).appendTo(document.body).eq(2).draggable();

// Main script functions for data manipulation, time handling, and DOM element interaction.

this.Functions = {
    configureLanguagesAndListeners() {

        /* 
            - Creates the `window.langMapping` object, which contains language data within an array, 
            - ensuring that the month values are formatted as two-digit numbers according to the local date language.
        */

        window.langMapping = [
            "f0eadcecffbb5f66bf549645d20bd0cd",
            "b8a8de82dd0387e97241d76edb64c78e",
            "99d26c335ff06a1f4f32e1b78ccc0855",
            "2d0ea4e2a5d29e1321ae6d9ff1861052",
            "c0a48f32c11d4e56173d7bb151154236",
            "00a5cf879180a196bf1720187b4a29ba",
            "23176c991f48ba3a17942b82cc7787b2",
            "19c1b76c51e0eb5d5c92221e6e891bad",
            "1f17626a373b6a69f8287ed8781e1e0a",
            "4caa55b7c609d00fb95f03cd1ceafeab",
            "b575d8d37fffa782cfa3592d1cfc65da",
            "a0bccd9315fa3e38aef93f34cd116aa9"
        ].reduce(
            (acc, el, i) => (acc[lang[el].toLowerCase()] = `${i + 1}`.padStart(2, '0'), acc), {}
        );

        Timing.tickHandlers.timers.handleTimerEnd = event => $(event.target).closest('tr').remove();

        $(document).on('click', function (e) {
            Functions.globalCommandDataFormatterAndProcessor.init(e);
        });
    },
    globalCommandDataFormatterAndProcessor: {
        applyLanguageFormat(unformattedDateTime) {

            /* 
                - Formats the input `unformattedDateTime` string by replacing the original date format with a new one. 
                - The format is changed to `YYYY-MonthCode-DD HH:MM:SS`, 
                - where the month is mapped using `langMapping` based on the language code.
            */

            return unformattedDateTime.replace(/(\S{3})\. (\d+), (\d+)\x20\x20(\d+:\d+:\d+).*/, (regex, $1, $2, $3, $4) => `${$3}-${langMapping[$1]}-${$2} ${$4}`);
        },
        filterResponseContent(responseData, regex) {

            /* 
                - Filters the `responseData` to extract the text content from the second `<td>` element within `#content_value`. 
                - The content is filtered using the provided regular expression (`regex`), 
                - returning the text of the first matching element.
            */
           
            return $(responseData.toString()).find('#content_value td:nth-child(2)').filter((i, el) => regex.test(el.textContent)).eq(0).text();
        },
        async init({ target } /* Destructures the event received from the document listener */) {

            /* 
                - The `init` function listens for an event and processes a command row from a table.
                - It first checks if the closest `<tr>` element has the `command-row` class, then highlights the row and fetches data via an AJAX request (`$.get`).
                - Once the response is retrieved, it updates input fields inside the `#fa_register_div` based on specific content extracted from the response.
                - The first input is populated with a formatted date, while the others are filled with calculated durations or modified timestamps.
            */

            /* Gets the closest `tr` element relative to `target`. */

            let parentElement =$(target).closest('tr');

            /* Check if the event was triggered on a command row */

            if (parentElement.hasClass('command-row')) {

                /* Highlight the command row */

                parentElement.children('td').css('background', '#ffff5b');

                /* Make the AJAX request to fetch data from the command row */

                const response = await $.get(parentElement.find('a[href*=info_command]').attr('href'));

                /* 
                    - Selects all input elements inside the `#fa_register_div` container.
                    - Stores the collection of input elements in the `inputElement` variable for further manipulation.
                */

                let inputElement = $('#fa_register_div').find('input');

                /* Check if it's in the 'show_outgoing_units' area to decide how to fill the fields */

                if ($(parentElement).parents(':eq(4)').attr('id') != 'show_outgoing_units') {

                    /* Fill the first field with the formatted date */

                    inputElement.eq(0).val(this.applyLanguageFormat(this.filterResponseContent(response, /\S{3}\./)));
                }
                else {

                    /* Fill the remaining fields with calculated durations and timestamps */

                    let duration = Functions.convertTimeToSeconds(this.filterResponseContent(response, /^\d+:/)) * 1000;
                    inputElement[1].value = Functions.formatDateToISOString(Functions.dateToMilliseconds(this.applyLanguageFormat(this.filterResponseContent(response, /\S{3}\./)) + '.000Z') - duration);
                    inputElement[2].value = Functions.formatTimeToHHMMSS(duration / 1000);
                };

            };
        },
    },
    formatAndGetServerDateTime() {

        /* 
            - The `formatAndGetServerDateTime` function retrieves the server date and time by combining the text content of the elements `#serverDate` and `#serverTime`.
            - It formats the date from `MM/DD/YYYY` to `YYYY-MM-DD`, preserving the time part.
            - The formatted string is then passed to `Functions.dateToMilliseconds` for further conversion.
        */

        return Functions.dateToMilliseconds((
            $('#serverDate').text() + ' ' + $('#serverTime').text()).replace(/(\d+)\/(\d+)\/(\d+) (.*)/, '$3-$2-$1 $4')
        );
    },
    updateTableWithProcessedTimes() {

        /* 
            1. Maps input times, applying `dateToMilliseconds` and `convertTimeToSeconds` to the inputs.
            2. Calculates the average difference between the first two input times.
            3. Generates a table row with formatted time differences, an export button, and a delete icon.
        */

        $('#fa_register_div tbody').html(function (index) {

            /* 
                - Maps over input elements inside `#fa_register_div`.
                - For the first input, applies `dateToMilliseconds`, for others applies `convertTimeToSeconds` and multiplies by 1000.
            */

            let mappedInputTimes = $('#fa_register_div input').map(function (i) {
                return (!i || i == 1) && Functions.dateToMilliseconds(this.value) || Functions.convertTimeToSeconds(this.value) * 1000;
            });

            /* Calculates the average difference between the first two values in `mappedInputTimes` */

            let diference = (mappedInputTimes[0] - mappedInputTimes[1]) / 2;

            /*  Generates a table row with time differences, export button, and delete icon */

            return `<tr>
                <td>` + Functions.formatTimeToHHMMSS((mappedInputTimes[2] - diference) / 1000) + `</td>
                <td><span class="timer">` + Functions.formatTimeToHHMMSS((mappedInputTimes[0] - diference - Functions.formatAndGetServerDateTime()) / 1000) + `</span></td>
                <td><button onclick="return Functions.exportTimeToClipboard(this);">EXPORT</button></td>
                <td><i class="fa-solid fa-circle-xmark fa-lg" onclick="return this.parentElement.parentNode.remove(undefined);"></i></td>
            </tr>`;
        });
        Timing.tickHandlers.timers.init();
    },
    exportTimeToClipboard(event) {

        /* 
            - Exports the formatted time to clipboard with a success message.
        */

        navigator.clipboard.writeText(`CANCEL AT: ` + $(event).parent(Node).prevAll(':eq(1)').text() + ` 💥`) && UI.SuccessMessage('Time exported successfully!');
    },
    formatDateToISOString(dateTime) {

        /* 
            - Converts the current date to an ISO string format.
            - Removes the milliseconds part of the ISO string.
        */

        return new Date(dateTime).toISOString().replace(/\..+/, ``);
    },
    convertTimeToSeconds(duration) {

        /* 
            - Converts a time duration in the format HH:MM:SS to seconds.
            - Splits the duration string by colon, maps each part to a number, and sums up the corresponding time in seconds (hours to seconds, minutes to seconds, and seconds).
        */

        return duration.split(':').map(Number).reduce((acc, el, i) => acc + (!i ? el * 3600 : i == 1 ? el * 60 : el), 0);
    },
    formatTimeToHHMMSS(seconds) {

        /* 
            - Converts a time duration in seconds to the format HH:MM:SS.
            - Divides the total seconds into hours, minutes, and remaining seconds, then formats each part with leading zeros and joins them with a colon.
        */

        return [seconds / 3600, seconds % 3600 / 60, seconds % 60].map(el => String(~~el).padStart(2, '0')).join(':');
    },
    dateToMilliseconds(dateValue) {

        /* 
            - Converts a given date value into milliseconds.
        */

        return new Date(dateValue).getTime();
    },
};

/* 
    - Initializes language settings and attaches event listeners to the document.
    - Configures language mappings and ensures that the application is ready to handle user interactions.
*/

Functions.configureLanguagesAndListeners();
