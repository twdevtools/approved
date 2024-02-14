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
const _0x4b1945 = '<div class="vis moveable cancel" style="width: 500px"><div class="cancel_content"><table class="vis" width="100%"><tbody><tr><th style="text-align: center; white-space: nowrap; font-size: 16px; padding: 6px; margin: 0px" colspan="2"><strong>SNIPE CANCELLATION</strong></th></tr><tr><td align="center"><strong>NOBLE ARRIVAL TIME:</strong></td><td><input type="text" class="arrival" placeholder="00:00:00" style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>YOUR COMMAND EXIT TIME:</strong></td><td><input type="text" class="exit" placeholder="00:00:00" style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>COMMAND DURATION:</strong></td><td><input type="text" class="duration" placeholder="00:00:00" style="margin: 4px; height: 22px; font-size: 13pt"></td></tr></tbody></table></div><div class="content"><input type="button" class="btn" style="margin: 4px" onclick="content.initCalculate()" value="CALCULATE TIMES"></div></div>';
$('#header_info')['after'](_0x4b1945);
/ LIBRARY FUNCTIONS CONTENT /;
window.content = {
formatSeconds: function (_0x59521f) {
    const _0x3084c0 = Math.floor(_0x59521f / 0xe10);
    const _0x2b949c = Math.floor(_0x59521f % 0xe10 / 0x3c);
    const _0x55de75 = Math.floor(_0x59521f % 0x3c);
    return ('' + _0x3084c0)['padStart'](0x2, '0') + ':' + ('' + _0x2b949c)['padStart'](0x2, '0') + ':' + ('' + _0x55de75)['padStart'](0x2, '0');
},
formatMilliseconds: function(_0x5cf944) {
    const _0x12fb06 = _0x5cf944['split'](':');
    return _0x12fb06[0x0] * 0x36ee80 + _0x12fb06[0x1] * 0xea60 + _0x12fb06[0x2] * 0x3e8;
},
convertToValidFormat: function (_0x542821) {
    const [_0x38879d, _0x230279] = _0x542821['split'](' ');
    const [_0x3f6224, _0x27a087, _0x2bd6df] = _0x38879d['split']('/');
    return _0x2bd6df + '-' + _0x27a087 + '-' + _0x3f6224 + ' ' + _0x230279;
},
calculateTimes: function (_0x5491bd, _0x3359b3, _0xb74308, _0xb75309) {
    const _0x4db34b = new Date(this.convertToValidFormat(_0x5491bd + ' ' + _0x3359b3));
    const _0x44325f = new Date(this.convertToValidFormat(_0x5491bd + ' ' + _0xb74308));
    const _0x370c73 = (_0x4db34b - _0x44325f) / 0x2;
    const _0x572c71 = this.formatMilliseconds(_0xb75309);
    return _0x370c73 > 0x0 && _0x572c71 && {timer: '<span class="timer" style="color: red">' + this.formatSeconds(_0x370c73 / 0x3e8) + '</span>', cancel: '<span style="color: #229b22">' + this.formatSeconds((_0x572c71 - _0x370c73) / 0x3e8) + '</span>'};
},
extractTime: function (_0x3a1a28) {
    const _0x30c9f0 = $(_0x3a1a28)['closest']('div')['find']('span')['prop']('textContent');
    return navigator.clipboard.writeText('🟢 CANCEL IN: ' + _0x30c9f0 + ' 🟢'), UI['SuccessMessage']('Copied time!');
},
initCalculate: function () {
    const _0x5aa236 = $('#serverDate')['prop']('textContent');
    const _0x191068 = $('.arrival')['prop']('value');
    const _0x271354 = $('.exit')['prop']('value');
    const _0x291351 = $('.duration')['prop']('value');
    const _0x2538c8 = this.calculateTimes(_0x5aa236, _0x191068, _0x271354, _0x291351);
    return _0x2538c8 ? ($('.vis.moveable.cancel')['append']('<div><table width="100%"><tbody><tr><th><strong>NOBLE ARRIVING:</strong></th><th><strong>COMMAND SENT:</strong></th><th><strong>CANCEL TIME:</strong></th><th><strong>CANCEL AT:</strong></th><th style="text-align: center"><strong>SEND:</strong></th></tr><tr><td style="text-align: center; font-size: larger"><strong>' + _0x191068 + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + _0x271354 + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + _0x2538c8['cancel'] + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + _0x2538c8['timer'] + '</strong></td><td class="align_right"><input type="button" class="btn" style="margin: 4px" onclick="content.extractTime(this)" value="COPY"></td></tr></tbody></table></div>'), Timing['tickHandlers']['timers']['init'](), Timing['tickHandlers']['timers']['handleTimerEnd'] = function(_0x275089) { this.closest('div').remove(); }) : UI['ErrorMessage']('No matches found');
}};
$(window['TribalWars'])['on']('global_tick', function (_0xfb67b4) {
    _0xfb67b4 = $('#main_layout > tbody > tr.shadedBG > td.maincell > div.vis.moveable.cancel > div:nth-child(3) > table > tbody > tr > td:nth-child(4) > strong > span'), _0xfb67b4['prop']('textContent') === '0:00:10' && TribalWars['playSound']('chat');
});
