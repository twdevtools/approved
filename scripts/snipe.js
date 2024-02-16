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
var _0x364012 = '<div class="vis moveable cancel content-border" style="width: 500px; cursor: move; position: relative; left: 535px; top: -730px"><div class="cancel_content"><table class="vis" width="100%"><tbody><tr><th style="text-align: center; white-space: nowrap; font-size: 16px; padding: 6px; margin: 0px" colspan="2"><strong>SNIPE CANCELLATION</strong></th></tr>' + (_0x210150 = JSON['parse'](localStorage['getItem']('cancelContent')), '<tr><td align="center"><strong>NOBLE ARRIVAL TIME:</strong></td><td><input type="text" class="arrival" placeholder="00:00:00" value="' + (_0x210150 ? _0x210150['arrival'] : '') + '"style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>YOUR COMMAND EXIT TIME:</strong></td><td><input type="text" class="exit" placeholder="00:00:00" value="' + (_0x210150 ? _0x210150['exit'] : '') + '"style="margin: 4px; height: 22px; font-size: 13pt"></td></tr><tr><td align="center"><strong>COMMAND DURATION:</strong></td><td><input type="text" class="duration" placeholder="00:00:00" value="' + (_0x210150 ? _0x210150['duration'] : '') + '"style="margin: 4px; height: 22px; font-size: 13pt"></td></tr></tbody></table></div>') + '<div class="content"><input type="button" class="btn" style="margin: 4px" onclick="content.initCalculate()" value="CALCULATE TIMES"></div></div>';
$(document.body)['append'](_0x364012); $('.vis.moveable.cancel.content-border')['draggable']();
/ LIBRARY FUNCTIONS CONTENT /;
window['content'] = {
    'formatSeconds': function (_0x3704fb) {
        var _0x454e83 = Math.floor(_0x3704fb / 0xe10);
        var _0x3c7b0e = Math.floor(_0x3704fb % 0xe10 / 0x3c);
        var _0x2a6890 = Math.floor(_0x3704fb % 0x3c);
        return ('' + _0x454e83)['padStart'](0x2, '0') + ':' + ('' + _0x3c7b0e)['padStart'](0x2, '0') + ':' + ('' + _0x2a6890)['padStart'](0x2, '0');
    },
    'formatMilliseconds': function (_0x14526e) {
        var _0x320997 = _0x14526e['split'](':');
        return _0x320997[0x0] * 0x36ee80 + _0x320997[0x1] * 0xea60 + _0x320997[0x2] * 0x3e8;
    },
    'convertToValidFormat': function (_0x4ac8f8) {
        var [_0x35de69, _0x130dce] = _0x4ac8f8['split'](' ');
        var [_0x1fa37c, _0x499aef, _0x3399ac] = _0x35de69['split']('/');
        return _0x3399ac + '-' + _0x499aef + '-' + _0x1fa37c + ' ' + _0x130dce;
    },
    'calculateTimes': function (_0x5478b5, _0x5b014a, _0x1823ef, _0x5946b7, _0x49d518) {
        var _0x32af22 = new Date(this.convertToValidFormat(_0x5478b5 + ' ' + _0x5b014a));
        var _0x55b533 = new Date(this.convertToValidFormat(_0x5478b5 + ' ' + _0x1823ef));
        var _0x2f6517 = new Date(this.convertToValidFormat(_0x5478b5 + ' ' + _0x5946b7));''
        var _0x46a264 = this['formatMilliseconds'](_0x49d518);
        return (i = (_0x55b533 - _0x2f6517) / 0x2) > 0x0 && (t = _0x2f6517['getTime']() + i - _0x32af22) > 0x0 && _0x46a264 && {'timer': '<span class="timer" style="color: red">' + this['formatSeconds'](t / 0x3e8) + '</span>', 'cancel': '<span style="color: #229b22">' + this['formatSeconds']((_0x46a264 - i) / 0x3e8) + '</span>'};
    },
    'extractTime': function (_0x13eee4) {
        var _0x46d9ac = $(_0x13eee4)['closest']('div')['find']('span')['prop']('textContent');
        return navigator['clipboard']['writeText']('🟢 CANCEL IN: ' + _0x46d9ac + ' 🟢'), UI['SuccessMessage']('Copied time!');
    },
    'initCalculate': function (_0x19a5e9) {
        var _0x5885ff = $('#serverDate')['prop']('textContent');
        var _0x16bcc5 = $('#serverTime')['prop']('textContent');
        var _0x10a6b1 = $('.arrival')['prop']('value');
        var _0x44105b = $('.exit')['prop']('value');
        var _0x131eab = $('.duration')['prop']('value');
        return (i = this['calculateTimes'](_0x5885ff, _0x16bcc5, _0x10a6b1, _0x44105b, _0x131eab)) ? ($('.vis.moveable.cancel.content-border')['append']('<div><table width="100%"><tbody><tr><th><strong>NOBLE ARRIVING:</strong></th><th><strong>COMMAND SENT:</strong></th><th><strong>CANCEL TIME:</strong></th><th><strong>CANCEL AT:</strong></th><th style="text-align: center"><strong>SEND:</strong></th></tr><tr><td style="text-align: center; font-size: larger"><strong>' + _0x10a6b1 + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + _0x44105b + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + i['cancel'] + '</strong></td><td style="text-align: center; font-size: larger"><strong>' + i['timer'] + '</strong></td><td class="align_right"><input type="button" class="btn" style="margin: 4px" onclick="content.extractTime(this)" value="COPY"></td></tr></tbody></table></div>'), Timing['tickHandlers']['timers']['init'](), Timing['tickHandlers']['timers']['handleTimerEnd'] = function (_0x33166b) { this['closest']('div')['remove'](); }) : UI['ErrorMessage']('No matches found');
    },
    'saveAction': function (_0x339fab) {
        const _0x255653 = {};
        $(this)['closest']('div')['find']('input')['each'](function (_0x2a8749) {
            _0x255653[this.className] = this.value;
        });
        return localStorage['setItem']('cancelContent', JSON['stringify'](_0x255653));
    },
};
$(window['TribalWars'])['on']('global_tick', function (_0x2b125b) {
    _0x2b125b = $('#main_layout > tbody > tr.shadedBG > td.maincell > div.vis.moveable.cancel.content-border > div:nth-child(3) > table > tbody > tr > td:nth-child(4) > strong > span'), _0x2b125b['prop']('textContent') === '0:00:10' && TribalWars['playSound']('chat');
});
$('.vis.moveable.cancel.content-border').on('input', content.saveAction);
