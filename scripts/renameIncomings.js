/*
    * SCRIPT INFORMATION
    * 
    * SCRIPT NAME: RENAME INCOMINGS
    * VERSION: v1.0
    * LAST UPDATED: December 17, 2024
    * AUTHOR: K I N G S
    * AUTHOR CONTACT: +55 48-98824-2773
    * APPROVED ON: -----
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

$(`
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
        #fa_register_script * {
            margin: 0px;
            box-sizing: border-box;
        }

        #fa_register_script {
            position: fixed;
            top: 20%;
            left: 40%;
            background-color: #202225;
            border-radius: 8px;
            padding: 10px;
            width: 400px;
            z-index: 100;
            animation: in 0.4s ease-out, on 2s infinite ease-in-out;
        }

        #fa_register_script ::-webkit-scrollbar {
            width: 16px; 
        }

        #fa_register_script ::-webkit-scrollbar-thumb {
            background-color: #888; 
            border: 4px solid #40444b; 
            border-radius: 12px;
        }

        #fa_register_script ::-webkit-scrollbar-thumb:hover {
            background-color: #a5a5a5; 
        }

        #fa_register_script ::-webkit-scrollbar-corner {
            background-color: #40444b; 
            border-radius: 0px 0px 8px 0px;
        }

        #fa_register_script ::-webkit-scrollbar-track-piece {
            background-color: #40444b;
            border-radius: 0px 8px 0px 8px;
        }

        #fa_register_script input[type="text"] {
            background-color: #40444b;
            border: none;
            padding: 10px;
            border-radius: 8px;
            color: #fff;
            width: 100%;
            transition: background-color 0.3s;
        }

        #fa_register_script input[type="text"]:hover {
            background-color: #353b41;
        }

        #fa_register_script input[type="color"] {
            border: none;
            width: 100px;
            height: 31px;
            border-radius: 4px;
            cursor: pointer;
        }

        button {
            background-color: rgba(14, 74, 138, 0.502);
            color: #fff;
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            width: 100%;
            white-space: nowrap;
            transition: transform 0.1s;
        }

        button:hover {
            outline: 1px solid #fff;
        }

        button:active {
            transform: scale(0.94);
        }

        .fa_flex {
            display: flex;
            gap: 10px;
        }

        .fa_grid {
            display: grid;
            gap: 10px;
        }

        .grid-repeat-3 {
            grid-template-columns: repeat(3, 1fr);
        }

        .grid-repeat-5 {
            grid-template-columns: repeat(5, 1fr);
        }

        .fa_overflow {
            overflow: auto;
            max-height: 150px;
        }

        .fa_flex-direction-column {
            flex-direction: column;
        }

        .fa_box_vis-base {
            padding: 10px;
            background-color: #2b2d31;
            border-radius: 8px;
            outline: 1px solid #40444b;
        }

        .fa_box_input-icon {
            position: relative;
            width: 100%;
        }

        .fa_box_input-icon i {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: 10px;
        }

        .fa_box_input-icon input {
            padding-left: 40px !important;
        }

        #fa_box_template button {
            pointer-events: none;
        }

        #fa_box_template > div {
            position: relative;
        }

        #fa_box_template i {
            position: absolute;
            top: -5px;
            right: -5px;
            padding: 4px;
            font-size: 7px;
            border-radius: 50%;
            color: #fff;
            cursor: pointer;
            background-color: #ff5f5f;
            transition: background-color 0.3s;
        }

        .fa_box_close {
            position: absolute;
            top: -10px;
            right: -10px;
            background-color: #ff5f5f;
            color: #fff;
            font-size: 15px;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .fa_box_close:hover, #fa_box_template i:hover {
            background-color: #ff3030;
        }

        #fa_animation {
            font-family: 'Arial', sans-serif;
            color: #fff;
            padding: 10px 0;
            width: 100%;
            font-size: 1.3em;
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

        @keyframes continuous {
            0% {
                transform: translateX(100%);
            }

            100% {
                transform: translateX(15%);
            }
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

            0%, 100% {
                box-shadow: 0 0 10px 2px rgba(0, 123, 255, 0.8);
            }

            50% {
                box-shadow: 0 0 20px 6px rgba(0, 123, 255, 0.5);
            }
        }
    </style>
    <div id="fa_register_script" class="fa_flex fa_flex-direction-column">
        <div class="fa_box_close" onclick="return this.parentElement.remove();">
            <i class="fa-solid fa-xmark"></i>
        </div>
        <div class="fa_box_vis-base fa_flex fa_flex-direction-column">
            <div class="fa_flex">
                <div class="fa_box_input-icon">
                    <i class="fa-solid fa-signature fa-lg"></i>
                    <input type="text" placeholder="TEMPLATE NAME...">
                </div>
                <input type="color">
            </div>
            <div class="fa_flex">
                <button onclick="return ScriptFunctions.newTemplate();">
                    <i class="fa-solid fa-plus"></i>
                    CREATE TEMPLATE
                </button>
                <button onclick="return ScriptFunctions.insertTemplate();">
                    <i class="fa-solid fa-arrows-rotate"></i>
                    REFRESH
                </button>
            </div>
        </div>
        <div id="fa_box_template" class="fa_box_vis-base fa_grid grid-repeat-3 fa_overflow"></div>
        <div id="fa_animation">
            <span>
                DEVELOPED BY:
                <i style="color: #ff0000;">K I N G S</i>
                🔥
            </span>
        </div>
    </div>
`).appendTo('body');

$('#fa_register_script').draggable();

this.ScriptFunctions = {
    init() {

        /*
            * - Removes the closest parent div when an `<i>` element is clicked and updates storage.
            * - Simulates renaming a command row when a `<button>` is clicked.
        */

        if (mobiledevice) {
            $('#fa_register_script').css({width: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'});
        }

        this.getStorage();
        $('#commands_incomings, #incomings_table, #fa_box_template').on('click', event => {
            let target = event.target;
            if (target.localName == 'i') {
                target.closest('div').remove();
                this.setStorage();
            };
            if (target.localName == 'button') {
                event.preventDefault();
                const command_row = $(target).parents(':eq(2)').prev();
                command_row.find('a.rename-icon').trigger('click');
                command_row.find('input[type=text]').val(target.textContent);
                command_row.find('input[type=button]').trigger('click');
            };
        });
    },
    newTemplate() {

        /*
            * - Retrieves input values (template name and color) from `#fa_register_script`.
            * - Appends a new template div to `#fa_box_template` containing a button with the specified color and name.
            * - Updates storage after adding the new template.
        */

        const [template, color] = $('#fa_register_script').find('input').map((i, input) => input.value);
        $('#fa_box_template').append(`<div><i class="fa-solid fa-xmark"></i><button style="background-color: ${color}">${template}</button></div>`);
        this.setStorage();
    },
    insertTemplate() {

        /*
            * - Collects all button templates from `#fa_box_template`.
            * - Removes existing rows containing a `div` with a class starting with `fa_grid`.
            * - Appends the collected templates after rows with class `command-row` or `nowrap` in target tables.
        */

        const all_templates = $('#fa_box_template button').get().reduce((acc, button) => acc + button.outerHTML, ``);
        $('#commands_incomings, #incomings_table').find('tr:has(div[class^=fa_grid])').remove();
        $('#commands_incomings, #incomings_table').find('tr.command-row, tr.nowrap').after(`
            <tr>
                <td colspan="100">
                    <div class="fa_grid grid-repeat-5" style="padding: 10px;">${all_templates}</div>
                </td>
            </tr>
        `);
    },
    setStorage() {

        /*
            * - Retrieves the inner HTML of `#fa_box_template`.
            * - Stores the HTML as a JSON string in local storage under the key 'commandRenamer'.
        */

        let innerHTML = $('#fa_box_template').html();
        localStorage.setItem('commandRenamer', JSON.stringify(innerHTML));
    },
    getStorage() {

        /*
            * - Parses the stored `commandRenamer` data from local storage.
            * - If data exists, it sets the HTML of `#fa_box_template` and inserts the templates.
        */

        let storage = JSON.parse(localStorage.commandRenamer || null);
        if (storage) {
            $('#fa_box_template').html(storage);
            this.insertTemplate();
        };
    },
};
ScriptFunctions.init();
