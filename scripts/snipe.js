/*
 * Script Name: SNIPE CANCELLATION
 * Version: v1.0
 * Last Updated: 2024-02-16
 * Author: K I N G S
 * Author Contact: +55 48-98824-2773
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

(html = '<div class="vis moveable cancel content-border" style="width: 500px; cursor: move; position: relative; left: 609px; top: -446px"><div class="cancel_content"><table class="vis" width="100%"><tbody><tr><th style="text-align: center; white-space: nowrap; font-size: 16px; padding: 6px; margin: 0px" colspan="2"><strong>SNIPE CANCELLATION</strong></th></tr>' + (localSave = JSON.parse(localStorage.getItem('cancelContent')), '<tr><td align="center"><strong>NOBLE ARRIVAL TIME:</strong></td><td><input type="text" class="arrival" placeholder="00:00:00" value="' + (localSave ? localSave.arrival : '') + '"style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>YOUR COMMAND EXIT TIME:</strong></td><td><input type="text" class="exit" placeholder="00:00:00" value="' + (localSave ? localSave.exit : '') + '"style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>COMMAND DURATION:</strong></td><td><input type="text" class="duration" placeholder="00:00:00" value="' + (localSave ? localSave.duration : '') + '"style="margin: 4px; height: 22px; font-size: 13pt"></td></tr></tbody></table></div>') + '<div class="content"><input type="button" class="btn" style="margin: 4px" onclick="content.initCalculate()" value="CALCULATE TIMES"></div></div>', $(document.body).append(html), $('.vis.moveable.cancel.content-border').draggable());
/ LIBRARY FUNCTIONS CONTENT /;
window.content = {
    formatSeconds: function (time) {
        var hour = Math.floor(time / 3600);
        var min = Math.floor(time % 3600 / 60);
        var sec = Math.floor(time % 60);
        return ('' + hour).padStart(2, '0') + ':' + ('' + min).padStart(2, '0') + ':' + ('' + sec).padStart(2, '0');
    },
    formatMilliseconds: function (milli) {
        var arr = milli.split(':');
        return arr[0] * 3600000 + arr[1] * 60000 + arr[2] * 1000;
    },
    convertToValidFormat: function (date) {
        var [year, time] = date.split(' ');
        var [day, month, year] = year.split('/');
        return year + '-' + month + '-' + day + ' ' + time;
    },
    calculateTimes: function (server, time, arrival, exit, duration) {
        var convertTime = new Date(this.convertToValidFormat(server + ' ' + time));
        var convertArrival = new Date(this.convertToValidFormat(server + ' ' + arrival));
        var convertExit = new Date(this.convertToValidFormat(server + ' ' + exit));''
        var formattedDuration = this.formatMilliseconds(duration);
        return (i = (convertArrival - convertExit) / 2) > 0 && (t = convertExit.getTime() + i - convertTime) > 0 && formattedDuration && {'timer': '<span class="timer" style="color: red">' + this.formatSeconds(t / 1000) + '</span>', 'cancel': '<span style="color: #229b22">' + this.formatSeconds((formattedDuration - i) / 1000) + '</span>'};
    },
    extractTime: function (event) {
        var content = $(event).closest('div').find('span').prop('textContent');
        return navigator.clipboard.writeText('🟢 CANCEL IN: ' + content + ' 🟢'), UI.SuccessMessage('Copied time!');
    },
    initCalculate: function (event) {
        var serverDate = $('#serverDate').prop('textContent');
        var serverTime = $('#serverTime').prop('textContent');
        var arrival = $('.arrival').prop('value');
        var exit = $('.exit').prop('value');
        var duration = $('.duration').prop('value');
        return (i = this.calculateTimes(serverDate, serverTime, arrival, exit, duration)) ? ($('.vis.moveable.cancel.content-border').append('<div><table width="100%"><tbody><tr><th><strong>NOBLE ARRIVING:</strong></th><th><strong>COMMAND SENT:</strong></th><th><strong>CANCEL TIME:</strong></th><th><strong>CANCEL AT:</strong></th><th style="text-align: center"><strong>SEND:</strong></th></tr><tr><td style="text-align: center; font-size: larger"><strong>' + arrival + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + exit + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + i.cancel + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + i.timer + '</strong></td><td class="align_right"><input type="button" class="btn" style="margin: 4px" onclick="content.extractTime(this)" value="COPY"></td></tr></tbody></table></div>'), Timing.tickHandlers.timers.init(), Timing.tickHandlers.timers.handleTimerEnd = function (event) { this.closest('div').remove(); }) : UI.ErrorMessage('No matches found');
    },
    saveAction: function (event) {
        const values = {};
        $(this).closest('div').find('input').each(function (i) {
            values[this.className] = this.value;
        });
        return localStorage.setItem('cancelContent', JSON.stringify(values));
    },
};
$(window.TribalWars).on('global_tick', function (event) {
    event = $('#main_layout > tbody > tr.shadedBG > td.maincell > div.vis.moveable.cancel.content-border > div:nth-child(3) > table > tbody > tr > td:nth-child(4) > strong > span'), event.prop('textContent') === '0:00:10' && TribalWars.playSound('chat');
});
$('.vis.moveable.cancel.content-border').on('input', content.saveAction);
