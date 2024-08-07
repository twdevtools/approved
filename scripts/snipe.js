this.ScriptAPI = {
    init: function(event) {
        window.language = [
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
            "a0bccd9315fa3e38aef93f34cd116aa9",
        ].reduce((acc, $pb, i) => (acc[lang[$pb].toLowerCase(null)] = `${i+1}`.padStart(2, '0') || !void 0) && acc, {});
        let scriptHTML = `<div id="ScriptAPI" class="vis content-border" style="position: fixed; border-radius: 8px; top: 30%; left: 20%; z-index: 7;">
            <style>#ScriptAPI th, #ScriptAPI h4 {background-color: #202225 !important;background-image: none;font-weight: normal; text-align: center;color: #ffffdf;}#ScriptAPI input[type="text"] {font-size: 13pt; background: none; border: none;color: #ffffdf;}#ScriptAPI button {background-image: linear-gradient(#6e7178 0%, #36393f 30%, #202225 80%, black 100%);}#ScriptAPI, #ScriptAPI td {background: #36393f !important;color: #ffffdf;}#ScriptAPI a {color: #ae441c;}</style>
            <a href="#" onclick="return $('#ScriptAPI').remove()" style="position: absolute; font-size: 20px; top: 3px; right: 10px; z-index: 1;">X</a>
            <h4 style="border-radius: 8px 8px 0px 0px; font-size: 16px; padding: 6px;">SNIPE CANCELAMENTO</h4>
            <table id="options" width="100%">
                <tbody>
                    <tr>
                        <th>HORA DE CHEGADA NOBRE:</th>
                        <td><input id="snob-commands" type="text" placeholder="DD/MM/AAAA 00:00:00"></td>                    
                    </tr>
                    <tr>
                        <th>HORA DE SAÍDA COMANDO:</th>
                        <td><input id="exit-commands" type="text" placeholder="DD/MM/AAAA 00:00:00"></td>                       
                    </tr>
                    <tr>
                        <th>TEMPO DO COMANDO:</th>
                        <td><input id="time-commands" type="text" placeholder="00:00:00"></td>   
                    </tr>
                    <tr>
                        <td colspan="100">
                            <div id="commands-list" style="overflow: auto; max-height: 150px;">
                            <style>#ScriptAPI #combinations-found td:nth-child(1) {color: #c9c922;}#ScriptAPI #combinations-found td:nth-child(2) {color: #53853b;}#ScriptAPI #combinations-found td:nth-child(4) {color: #c14848;}#ScriptAPI #combinations-found td {text-align: center;font-family: monospace;font-weight: bold;font-size: larger;}#ScriptAPI #combinations-found td:has(button) {padding: 2px 0px 4px 0px;}#ScriptAPI #combinations-found button {font-size: 9px !important;font-family: monospace;}#ScriptAPI #combinations-found img {margin: 2px;cursor: pointer;}</style>
                                <table style="border-spacing: 0px; width: 100%;">
                                    <thead style="position: sticky; top: 0px; z-index: 1;">
                                        <tr>
                                            <th width="160px;">CHEGADA NOBRE:</th>
                                            <th width="160px;">SAÍDA COMANDO:</th>
                                            <th width="125px;">TEMPO CANCELAR:</th>
                                            <th width="100px;">CANCELAR EM:</th>
                                            <th width="50px;">#</th>
                                            <th>#</th>
                                        </tr>
                                    </thead>
                                    <tbody id="combinations-found"></tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="margin: 2px 0px 4px 2px;"><button class="btn" onclick="ScriptAPI.constructor(event);">CALCULAR TEMPOS</button></div>
        </div>`
        Timing.tickHandlers.timers.handleTimerEnd = $pb => $pb.target.closest('tr').remove();
        !mobiledevice || $('#ScriptAPI').css(
            {'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)'},
        );
        return $(scriptHTML).appendTo(document.body).draggable() && $(document).on('click', ScriptAPI.times);
    },
    times: function(event) {
        let $pbElement = $(event.target).closest('tr'); 
        $pbElement.attr('class')?.includes('command-row') && $pbElement.children(0e+0).css('background', '#ffff5b') && $.get($pbElement.find('a[href*=info_command]').attr('href') || ``).then(function(xhr) {
            let $pbTimes = $(xhr).find('td#content_value table tr'), description = $(event.target).closest('div').attr('id') != 'commands_outgoings' && [
                0x4,
                0x5,
                0x1,
            ] || [
                0x5,
                0x6,
                0x0,
            ];
            let timestamp = new Date($pbTimes[description[1]].cells[1].textContent.replace(/\s+/g, '\x20').replace(/(\w+). (\d+), (\d+) (\d+:\d+:\d+)/, (regex, $1, $2, $3, $4) => `${$3}-${language[$1]}-${$2} ${$4}`)), duration = ScriptAPI.convertHoursToSeconds($pbTimes[description[0]].cells[1].textContent) * 1000, diference = new Date(timestamp - duration);
            return description[2] && $('#ScriptAPI #snob-commands').val(ScriptAPI.convertToLocaleString(timestamp) || 0e+1) || $('#ScriptAPI #exit-commands').val(ScriptAPI.convertToLocaleString(diference) || 0e+2) && $('#ScriptAPI #time-commands').val(ScriptAPI.convertToTimeFormat(duration / 1000) || !NaN);
        });
    },
    export: function(event) {
        let $pbElement = $(event.target).closest('tr').children(0e+0)[2e+0].textContent;
        return navigator.clipboard.writeText(`CANCELAR EM: 🚨 ` + $pbElement) && UI.SuccessMessage('Tempo exportado com sucesso!', 1000);
    },
    constructor: function(event) {
        let $pbElement = $('.server_info, #ScriptAPI #options input').map((i, $pb) => i < 3e+0 && new Date(this.convertToDateTimeFormat(!i && `${$pb.children.serverDate.textContent} ${$pb.children.serverTime.textContent}` || $pb.value) || ``) || this.convertHoursToSeconds($pb.value) * 1000);     
        let duration = ($pbElement[1] - $pbElement[2]) / 2e+0;
        $('#ScriptAPI #combinations-found').append(`<tr><td>${this.convertToLocaleString($pbElement[1])}</td><td>${this.convertToLocaleString($pbElement[2])}</td><td>${this.convertToTimeFormat(($pbElement[3] - duration) / 1e+3)}</td><td><span class="timer">${this.convertToTimeFormat(($pbElement[1] - duration - $pbElement[0]) / 1e+3)}<span></td><td><button class="btn" onclick="return ScriptAPI.export(event);">EXPORTAR</button></td><td><img src="/graphic/delete_14.png" class="float_right" onclick="return this.closest('tr').remove();"></td></tr>`)
        return Timing.tickHandlers.timers.init();
    },
    convertToLocaleString: function(event) {
        return event.toLocaleString(`pt-BR`).replace(`,`, ``);
    },
    convertToDateTimeFormat: function (event) {
        return event.replace(/(\d+)\/(\d+)\/(\d+) (.*)/, '$3-$2-$1 $4');
    },
    convertHoursToSeconds: function(event) {
        return event.split(':').map(Number).reduce((acc, $pb, i) => acc + (!i ? $pb * 3600 : i == 1 ? $pb * 60 : $pb), 0);
    },
    convertToTimeFormat: function (event) {
        let $pbHours = ~~(event / 3600), $pbMinutes = ~~(event % 3600 / 60), $pbSeconds = ~~(event % 60);
        return ('' + $pbHours).padStart(2, '0') + ':' + ('' + $pbMinutes).padStart(2, '0') + ':' + ('' + $pbSeconds).padStart(2, '0');
    },
};
window.ScriptAPI.init();
