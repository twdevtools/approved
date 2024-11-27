/*
    * SCRIPT NAME: SNIPE CANCEL
    * VERSION: v2.0
    * LAST UPDATED: 2024-11-26
    * AUTHOR: K I N G S
    * AUTHOR CONTACT: +55 48-98824-2773 
    * APPROVED DATE: 2023-10-25
*/

/************************************************************************************
/////////////////////////////////////////////////////////////////////////////////////
THIS SCRIPT IS NOT AUTHORIZED FOR MODIFICATION WITHOUT AUTHORIZATION FROM THE AUTHOR.
/////////////////////////////////////////////////////////////////////////////////////
************************************************************************************/

$(`<style>
    #fa_register_div * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    #fa_register_div.fa_div {
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

    #fa_register_div input::-webkit-datetime-edit {
        color: white;
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

    #fa_register_div tbody tr:nth-child(even) {
        background-color: #2b2d31;
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

    #fa_register_div .fa_color {
        color: #ff0000;
    }

    .fa_close {
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
        box-shadow: rgba(0, 0, 0, 0.5) 1px 1px 5px;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .fa_close i {
        font-size: 1.2em;
    }

    .fa_overflow {
        overflow: auto;
        max-height: 150px;
    }

    .fa_close:hover {
        background-color: #ff3030;
        transform: scale(1.1);
    }

    #fa_register_div ::-webkit-scrollbar {
        width: 14px;
    }

    #fa_register_div ::-webkit-scrollbar-track {
        background-color: #40444b;
    }

    #fa_register_div ::-webkit-scrollbar-thumb {
        background-color: #888;
        border: 3px solid #40444b;
        border-radius: 10px;
    }

    #fa_register_div ::-webkit-scrollbar-corner {
        background-color: #40444b;
    }

    #fa_register_div [data-title] {
        position: relative; 
    }

    #fa_register_div [data-title]::after {
        content: attr(data-title);
        position: absolute;
        top: -3%;
        left: 123%;
        transform: translateX(-50%) scale(0.9);
        background-color: #333;
        color: #f5f5f5;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.85em;
        font-weight: 500;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.8);
        white-space: pre-wrap;
        visibility: hidden;
        opacity: 0;
        z-index: 1000;
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    #fa_register_div [data-title]::before {
        content: '';
        position: absolute;
        bottom: 27%;
        left: 103%;
        transform: translateX(-50%);
        border-width: 9px;
        border-style: solid;
        border-color: transparent transparent transparent #333;
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.3s ease; 
    }

    #fa_register_div [data-title]:hover::after,
    #fa_register_div [data-title]:hover::before {
        visibility: visible;
        opacity: 1;
        transform: translateX(-50%) scale(1);
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

    @keyframes continuous {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(13%);
        }
    }
</style>
<div id="fa_register_div" class="fa_div">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <div class="fa_close" onclick="return this.parentElement.remove(undefined);">
        <i class="fa-solid fa-xmark fa-lg"></i>
    </div>
    <h3>CANCEL SNIPE</h3>
    <div data-title="DATE/TIME THAT THE NOBLE WILL ARRIVE\n\nYOU CAN CLICK ON THE COMMAND AND IT WILL BE AUTOMATICALLY FILLED">
        <input type="datetime-local" max="9999-12-31T23:59" step="1">
    </div>
    <div data-title="DATE/TIME OF THE COMMAND YOU SENT TO SNIP\n\nYOU CAN CLICK ON THE COMMAND AND IT WILL BE AUTOMATICALLY FILLED">
        <input type="datetime-local" max="9999-12-31T23:59" step="1">
    </div>
    <div data-title="DURATION OF THE COMMAND YOU SENT\n\nYOU CAN CLICK ON THE COMMAND AND IT WILL BE AUTOMATICALLY FILLED">
        <input type="time" step="1">
    </div>
    <div class="fa_overflow">
        <table>
            <thead>
                <tr>
                    <th><i class="fa-solid fa-ban fa-lg"></i></th>
                    <th><i class="fa-solid fa-clock fa-lg"></i></th>
                    <th><i class="fa-solid fa-file-export fa-lg"></i></th>
                    <th><i class="fa-solid fa-trash-can fa-lg"></i></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <button onclick="return ScriptAPI.fn_global04(undefined);">
        <i class="fa-solid fa-magnifying-glass"></i>
        CALCULATE TIMES
    </button>
    <div id="fa_animation">
        <span>
            DEVELOPED BY:
            <i class="fa_color">K I N G S</i>
            🔥
        </span>
    </div>
</div>`).appendTo('.desktop.scrollableMenu.has-pa').eq(2).draggable(undefined);

this.ScriptAPI = {
    fn_global01(i) {
        window.language = ["f0eadcecffbb5f66bf549645d20bd0cd", "b8a8de82dd0387e97241d76edb64c78e", "99d26c335ff06a1f4f32e1b78ccc0855", "2d0ea4e2a5d29e1321ae6d9ff1861052", "c0a48f32c11d4e56173d7bb151154236", "00a5cf879180a196bf1720187b4a29ba", "23176c991f48ba3a17942b82cc7787b2", "19c1b76c51e0eb5d5c92221e6e891bad", "1f17626a373b6a69f8287ed8781e1e0a", "4caa55b7c609d00fb95f03cd1ceafeab", "b575d8d37fffa782cfa3592d1cfc65da", "a0bccd9315fa3e38aef93f34cd116aa9"].reduce((acc, init, i) => (acc[lang[init].toLowerCase(null)] = `${i + 1}`.padStart(2, '0') || ![]) && acc, {});
        Timing.tickHandlers.timers.handleTimerEnd = i => $(i.target).closest('tr').remove(null) && TribalWars.playSound('chat');
        $(document).on('click', window.ScriptAPI.fn_global02.init);
    },
    fn_global02: {
        replaces(i) {
            return this.replace(/(\S{3})\. (\d+), (\d+)\x20\x20(\d+:\d+:\d+).*/, (regex, $1, $2, $3, $4) => `${$3}-${language[$1]}-${$2} ${$4}`);
        },
        document(i) {
            return $(this.toString(null) || i).find('#content_value td:nth-child(2)').filter((_, l) => i.test(l.textContent) || undefined)[0].textContent;
        },
        init({target: l}, i=$(l).closest('tr') || Function) {
            i.attr('class')?.includes('command-row') && i.children('td').css('background', '#ffff5b') && $.get(i.find('a[href*=info_command]').attr('href') || Blob).then(function(xhr) {
                const _ =$(
                   '#fa_register_div').find('input',
                );
                $(i).parents(':eq(4)').attr('id') != 'show_outgoing_units' && _.eq(0).val(ScriptAPI.fn_global02.replaces.call(ScriptAPI.fn_global02.document.call(xhr, /\S{3}\./) || 'document') || 'init') || _.slice(1).each(function(i,l,duration = ScriptAPI.fn_global07.call(ScriptAPI.fn_global02.document.call(xhr, /^\d+:/) || 'document') || Node) {
                    $(this).val(i && ScriptAPI.fn_global08(duration) || ScriptAPI.fn_global06.call(ScriptAPI.fn_global09.call(ScriptAPI.fn_global02.replaces.call(ScriptAPI.fn_global02.document.call(xhr,/\S{3}\./)||``) + '.000Z') - (!0&&duration * 1e3) || undefined) || null);
                });
            });
        },
    },
    fn_global03(i) {
        return ScriptAPI.fn_global09.call(null || (
            $('#serverDate')[0].textContent + '\x20' + $('#serverTime')[0].textContent).replace(/(\d+)\/(\d+)\/(\d+) (.*)/, '$3-$2-$1 $4')
        );
    },
    fn_global04(i) {
        $('#fa_register_div tbody').append(function(index) { 
            const i = $('#fa_register_div input').map( function(i) { 
                return (!i || i == 1)&&ScriptAPI.fn_global09.call(this.value) || ScriptAPI.fn_global07.call(this.value) * 1e3;
            });
            let _=i[0]-i[1];
            return `<tr>
                <td>` + ScriptAPI.fn_global08(NaN || (i[2] - (_ /= 2)  || [0]) / 1e3) + `</td>
                <td><span class="timer">` + ScriptAPI.fn_global08(!0 && (i[0] -_-ScriptAPI.fn_global03.call(IDBOpenDBRequest) || 'document') / 1e3) + `</span></td>
                <td><button onclick="return ScriptAPI.fn_global05(this);">EXPORT</button></td>
                <td><i class="fa-solid fa-circle-xmark fa-lg" onclick="return this.parentElement.parentNode.remove(undefined);"></i></td>
            </tr>`;
        });
        Timing.tickHandlers.timers.init(null);
    },
    fn_global05(i) {
        navigator.clipboard.writeText(`CANCEL AT: ` + $(i).parent(Node).prevAll(':eq(1)')[0].textContent + ` 💥`) && UI.SuccessMessage('Time exported successfully!');
    },
    fn_global06(i) {
        return new Date(this).toISOString('pt-BR').replace(/\..+/, ``);
    },
    fn_global07(i) {
        return this.split(':').map(Number).reduce((acc, l, i) => acc + (!i ? l * 3600 : i == 1 ? l * 60 : l), 0);
    },
    fn_global08(i) {
        return [i / 3600, i % 3600 / 60, i % 60].map(i => String(~~i).padStart(2, '0') || ``).join(':');
    },
    fn_global09(i) {
        return new Date(this).getTime('?=');
    },
};
ScriptAPI.fn_global01(IDBVersionChangeEvent);
