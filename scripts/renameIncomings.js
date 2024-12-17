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
    </style>
    <div id="fa_register_script" class="fa_flex fa_flex-direction-column">
        <div class="fa_box_close" onclick="this.parentElement.remove();">
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
                <button onclick="ScriptFunctions.newTemplate();">
                    <i class="fa-solid fa-plus"></i>
                    CREATE TEMPLATE
                </button>
                <button onclick="ScriptFunctions.insertTemplate();">
                    <i class="fa-solid fa-arrows-rotate"></i>
                    REFRESH
                </button>
            </div>
        </div>
        <div id="fa_box_template" class="fa_box_vis-base fa_grid grid-repeat-3 fa_overflow"></div>
    </div>
`).appendTo('html');

$('#fa_register_script').draggable();

this.ScriptFunctions = {
    init() {
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
        const [template, color] = $('#fa_register_script').find('input').map((i, input) => input.value);
        $('#fa_box_template').append(`<div><i class="fa-solid fa-xmark"></i><button style="background-color: ${color}">${template}</button></div>`);
        this.setStorage();
    },
    insertTemplate() {
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
        let innerHTML = $('#fa_box_template').html();
        localStorage.setItem('commandRenamer', JSON.stringify(innerHTML));
    },
    getStorage() {
        let storage = JSON.parse(localStorage.commandRenamer || null);
        if (storage) {
            $('#fa_box_template').html(storage);
            this.insertTemplate();
        };
    },
};
ScriptFunctions.init();
