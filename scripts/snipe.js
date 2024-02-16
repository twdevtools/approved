/*
 * Script Name: SNIPE CANCELLATION
 * Version: v1.0
 * Last Updated: 2024-02-14
 * Author: K I N G S
 * Author Contact: +55 48-98824-2773
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

/ HTML CONTENT /;
const a = '<div class="vis moveable cancel" style="width: 500px"><div class="cancel_content"><table class="vis" width="100%"><tbody><tr><th style="text-align: center; white-space: nowrap; font-size: 16px; padding: 6px; margin: 0px" colspan="2"><strong>SNIPE CANCELLATION</strong></th></tr><tr><td align="center"><strong>NOBLE ARRIVAL TIME:</strong></td><td><input type="text" class="arrival" placeholder="00:00:00" style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>YOUR COMMAND EXIT TIME:</strong></td><td><input type="text" class="exit" placeholder="00:00:00" style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>COMMAND DURATION:</strong></td><td><input type="text" class="duration" placeholder="00:00:00" style="margin: 4px; height: 22px; font-size: 13pt"></td></tr></tbody></table></div><div class="content"><input type="button" class="btn" style="margin: 4px" onclick="content.initCalculate()" value="CALCULATE TIMES"></div></div>';
$('#header_info')['after'](a);
/ LIBRARY FUNCTIONS CONTENT /;
window.content = {
formatSeconds: function (a) {
    const s = Math.floor(a / 0xe10);
    const e = Math.floor(a % 0xe10 / 0x3c);
    const c = Math.floor(a % 0x3c);
    return ('' + s)['padStart'](0x2, '0') + ':' + ('' + e)['padStart'](0x2, '0') + ':' + ('' + c)['padStart'](0x2, '0');
},
formatMilliseconds: function(a) {
    const s = a['split'](':');
    return s[0x0] * 0x36ee80 + s[0x1] * 0xea60 + s[0x2] * 0x3e8;
},
convertToValidFormat: function (a) {
    const [s, e] = a['split'](' ');
    const [c, x, o] = s['split']('/');
    return o + '-' + x + '-' + c + ' ' + e;
},
calculateTimes: function (a, s, e, c, x) {
    const o = new Date(this.convertToValidFormat(a + ' ' + s));
    const v = new Date(this.convertToValidFormat(a + ' ' + e));
    const t = new Date(this.convertToValidFormat(a + ' ' + c));
    const i = this.formatMilliseconds(x);
    return (n = (v - t) / 0x2) > 0x0 && i && {timer: '<span class="timer" style="color: red">' + this.formatSeconds((t.getTime() + n - o) / 0x3e8) + '</span>', cancel: '<span style="color: #229b22">' + this.formatSeconds((i - n) / 0x3e8) + '</span>'};
},
extractTime: function (a) {
    const s = $(a)['closest']('div')['find']('span')['prop']('textContent');
    return navigator.clipboard.writeText('🟢 CANCEL IN: ' + s + ' 🟢'), UI['SuccessMessage']('Copied time!');
},
initCalculate: function (a) {
    const s = $('#serverDate')['prop']('textContent');
    const e = $('#serverTime')['prop']('textContent');
    const c = $('.arrival')['prop']('value');
    const x = $('.exit')['prop']('value');
    const o = $('.duration')['prop']('value');
    return (v = this.calculateTimes(s, e, c, x, o)) ? ($('.vis.moveable.cancel')['append']('<div><table width="100%"><tbody><tr><th><strong>NOBLE ARRIVING:</strong></th><th><strong>COMMAND SENT:</strong></th><th><strong>CANCEL TIME:</strong></th><th><strong>CANCEL AT:</strong></th><th style="text-align: center"><strong>SEND:</strong></th></tr><tr><td style="text-align: center; font-size: larger"><strong>' + c + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + x + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + v['cancel'] + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + v['timer'] + '</strong></td><td class="align_right"><input type="button" class="btn" style="margin: 4px" onclick="content.extractTime(this)" value="COPY"></td></tr></tbody></table></div>'), Timing['tickHandlers']['timers']['init'](), Timing['tickHandlers']['timers']['handleTimerEnd'] = function(_0x275089) { this.closest('div').remove(); }) : UI['ErrorMessage']('No matches found');
}};
$(window['TribalWars'])['on']('global_tick', function (a) {
    a = $('#main_layout > tbody > tr.shadedBG > td.maincell > div.vis.moveable.cancel > div:nth-child(3) > table > tbody > tr > td:nth-child(4) > strong > span'), a['prop']('textContent') === '0:00:10' && TribalWars['playSound']('chat');
});
