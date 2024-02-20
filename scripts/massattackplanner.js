/*
 * Script Name: MASS ATTACK PLANNER
 * Version: v1.0
 * Last Updated: 2024-02-18
 * Author: K I N G S
 * Author Contact: +55 48-98824-2773
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

/ STRING HTML CONTENT /;
var stringHTML = '<div class="vis content-border" style="width: 789px; position: relative; left: 3px; top: -698px; cursor: move"><div class="content"><table width="100%"><tbody><tr><th style="text-align: center; white-space: nowrap; padding: 6px" colspan="4"><h3 style="margin: 0px">MASS ATTACK PLANNER</h3></th></tr><tr><td align="center"><strong>LANDING TIME:</strong></td><td><input type="text" class="arrival" style="font-size: 13pt" placeholder="DD/MM/AAAA 00:00:00"></td><td align="center"><strong>SIGIL:</strong></td><td><input type="text" class="sigil" style="width: 49px; font-size: 13pt" placeholder="00"></td></tr></tbody></table></div><table width="100%"><thead><tr><th><label for="unit_spear"><img src="/graphic/unit/unit_spear.png"></label></th><th><label for="unit_sword"><img src="/graphic/unit/unit_sword.png"></label></th><th><label for="unit_axe"><img src="/graphic/unit/unit_axe.png"></label></th><th><label for="unit_spy"><img src="/graphic/unit/unit_spy.png"></label></th><th><label for="unit_light"><img src="/graphic/unit/unit_light.png"></label></th> <th><label for="unit_heavy"><img src="/graphic/unit/unit_heavy.png"></label></th> <th><label for="unit_ram"><img src="/graphic/unit/unit_ram.png"></label></th> <th><label for="unit_catapult"><img src="/graphic/unit/unit_catapult.png"></label></th> <th><label for="unit_knight"><img src="/graphic/unit/unit_knight.png"></label></th><th><label for="unit_snob"><img src="/graphic/unit/unit_snob.png"></label></th> </tr></thead><tbody><tr><td><input type="radio" id="unit_spear" name="chosen_units" value="spear"></td> <td><input type="radio" id="unit_sword" name="chosen_units" value="sword"></td> <td><input type="radio" id="unit_axe" name="chosen_units" value="axe"></td><td><input type="radio" id="unit_spy" name="chosen_units" value="spy"></td> <td><input type="radio" id="unit_light" name="chosen_units" value="light"></td><td><input type="radio" id="unit_heavy" name="chosen_units" value="heavy"></td> <td><input type="radio" id="unit_ram" name="chosen_units" value="ram"></td><td><input type="radio" id="unit_catapult" name="chosen_units" value="catapult"></td> <td><input type="radio" id="unit_knight" name="chosen_units" value="knight"></td> <td><input type="radio" id="unit_snob" name="chosen_units" value="snob"></td> </tr></tbody></table><div class="textarea-content"><table width="100%"><thead><tr><th><label for="coordinates"><strong>YOUR VILLAGES:</strong></label></th> </tr></thead><tbody><tr><td><textarea class="coordinates" style="background: none; font-size: 11pt; resize: none; width: 98%; height: 50px;"></textarea></td></tr></tbody><thead><tr><th><label for="targets"><strong>DESTINATION VILLAGES:</strong></label></th> </tr></thead><tbody><tr><td><textarea class="targets" style="background: none; font-size: 11pt; resize: none; width: 98%; height: 50px;"></textarea></td></tr></tbody></table></div><div class="action-content"><input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="functions.initCalculate(this)" value="CALCULATE TIMES"><input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="" value="EXPORT BB CODE"></div></div>';
$(stringHTML).appendTo(document.body).draggable();
/ SCRIPT FUNCTIONS CONTENT /;
functions = {
    calculateTimes: function (_0x159a17, _0x1a881d, _0x443888, _0x536ac3, _0x232edf, _0x20bf64) {
        var _0x353459 = this.calculateDistance(_0x536ac3, _0x232edf);
        var _0x56294e = 1 + Number(_0x443888) / 0x64;
        var _0x1ef335 = _0x353459 * _0x20bf64 * 0xea60 / _0x56294e;
        var _0x4ece55 = new Date(Math.round((_0x159a17 - _0x1ef335) / 1000) * 1000);
        return _0x4ece55 > _0x1a881d && _0x353459 > 0 && _0x4ece55;
    },
    calculateDistance: function (_0x4c556d, _0x3fb080) {
        var [_0x4b01fe, _0x56b450] = _0x4c556d.split('|');
        var [_0x17eee9, _0xfed66f] = _0x3fb080.split('|');
        var _0x5eb0a9 = Math.abs(_0x4b01fe - _0x17eee9);
        var _0x39bdb7 = Math.abs(_0x56b450 - _0xfed66f);
        return Math.sqrt(_0x5eb0a9 * _0x5eb0a9 + _0x39bdb7 * _0x39bdb7);
    },
    formatSeconds: function (_0x11afd5) {
        var _0xa37254 = Math.floor(_0x11afd5 / 0xe10);
        var _0x29fd94 = Math.floor(_0x11afd5 % 0xe10 / 0x3c);
        var _0x7e26bf = Math.floor(_0x11afd5 % 0x3c);
        return ('' + _0xa37254).padStart(2, '0') + ':' + ('' + _0x29fd94).padStart(2, '0') + ':' + ('' + _0x7e26bf).padStart(2, '0');
    },
    formatDateTime: function (_0x46d6f2) {
        return ('' + _0x46d6f2.getDate()).padStart(2, '0') + '/' + ('' + _0x46d6f2.getMonth() + 1).padStart(2, '0') + '/' + _0x46d6f2.getFullYear() + ' ' + ('' + _0x46d6f2.getHours()).padStart(2, '0') + ':' + ('' + _0x46d6f2.getMinutes()).padStart(2, '0') + ':' + ('' + _0x46d6f2.getSeconds()).padStart(2, '0');
    },
    RequestUnits: function (_0x7d04d4) {
        return $.get('/interface.php?func=get_unit_info').then(function (_0x292612) {
            var _0xf16c50 = {};
            $(_0x292612).find('config').children().each(function () {
                _0xf16c50[this.tagName] = $(this).find('speed').prop('textContent');
            });
            return _0xf16c50;
        });
    },
    convertToValidFormat: function (_0x12e0a5) {
        var [_0x1e504e, _0x17c6d2] = _0x12e0a5.split(' ');
        var [_0x196a3f, _0x22be3f, _0x5283bf] = _0x1e504e.split('/');
        return _0x5283bf + '-' + _0x22be3f + '-' + _0x196a3f + ' ' + _0x17c6d2;
    },
    initCalculate: function (_0x59661) {
        / INIT CALCULATE TIMES /;
        var _0x4762e9 = $('.server_info')[0].firstElementChild;
        var _0x291be6 = new Date(this.convertToValidFormat(_0x4762e9.nextElementSibling.innerHTML + ' ' + _0x4762e9.innerHTML));
        var _0x2d73e6 = new Date(this.convertToValidFormat(document.querySelector('.arrival').value));
        var _0x1dfaa8 = document.querySelector('.sigil').value;
        $.ajax({
            'url': game_data.link_base_pure + 'overview_villages&mode=units&type=own_home',
            'method': 'GET'
        }).then(async _0x3ceaa1 => {
            var _0x382590 = await this.RequestUnits(), _0x5624ea = [], _0x1fbc2e = [], _0x3185e4 = {};
            var _0x41ad6f = document.querySelector('input:checked').value;
            document.querySelector('.coordinates').value.split(' ').forEach(_0x5ae244 => _0x3185e4[_0x5ae244] = true);
            $(_0x3ceaa1).find('.quickedit-label').each(function (_0x4a172f) {
                typeof _0x3185e4[coord = this.textContent.match(/(\d{1,3}\|\d{1,3})/)[0x0]] === 'boolean' && (
                    $(this).closest('tr').find('.unit-item').each(function (_0x22532a) {
                    _0x5624ea.push(this.textContent);
                }), [spear, sword, axe, spy, light, heavy, ram, catapult, knight, snob] = _0x5624ea.map(Number), document.querySelector('.targets').value.split(' ').forEach(_0x18dbf2 => {
                    (launchTime = functions.calculateTimes(_0x2d73e6, _0x291be6, _0x1dfaa8, coord, _0x18dbf2, _0x382590[_0x41ad6f])) && _0x1fbc2e.push({
                        'coord': coord,
                        'target': _0x18dbf2,
                        'spear': spear,
                        'sword': sword,
                        'axe': axe,
                        'spy': spy,
                        'light': light,
                        'heavy': heavy,
                        'ram': ram,
                        'catapult': catapult,
                        'knight': knight,
                        'snob': snob,
                        'launchTime': launchTime
                    });
                }), _0x5624ea.splice(0));
            });
            _0x1fbc2e.sort((_0x309c70, _0x4e4ce1) => {
                return _0x309c70.launchTime - _0x4e4ce1.launchTime;
            });
            _0x1fbc2e = _0x1fbc2e.slice(0);
            var _0x5befd9 = _0x1fbc2e.length;
            if (!_0x5befd9) {
                UI.ErrorMessage('No possibilities found');
            } else {
                const _0x4dede1 = ['<div class="commands-found"><label><span>' + _0x5befd9 + '</span>&nbsp;combinations found</label><div class="container" style="max-height: 300px; overflow: auto"><table width="100%"><thead><tr><th>#</th><th>From</th><th>To</th><th><label for="unit_spear"><img src="/graphic/unit/unit_spear.png"></label></th><th><label for="unit_sword"><img src="/graphic/unit/unit_sword.png"></label></th><th><label for="unit_axe"><img src="/graphic/unit/unit_axe.png"></label></th><th><label for="unit_spy"><img src="/graphic/unit/unit_spy.png"></label></th><th><label for="unit_light"><img src="/graphic/unit/unit_light.png"></label></th> <th><label for="unit_heavy"><img src="/graphic/unit/unit_heavy.png"></label></th> <th><label for="unit_ram"><img src="/graphic/unit/unit_ram.png"></label></th><th><label for="unit_catapult"><img src="/graphic/unit/unit_catapult.png"></label></th> <th><label for="unit_knight"><img src="/graphic/unit/unit_knight.png"></label></th><th><label for="unit_snob"><img src="/graphic/unit/unit_snob.png"></label></th><th>Launch Time</th><th>Send in</th><th>Send</th></tr></thead><tbody>'];
                const _0x4014f2 = ['spear', 'sword', 'axe', 'spy', 'light', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
                _0x1fbc2e.forEach((_0x3dd1c4, _0xa4ee6e) => {
                    _0x4dede1.push('<tr><td>' + Number(_0xa4ee6e + 1) + '</td><td>' + _0x3dd1c4.coord + '</td><td>' + _0x3dd1c4.target + '</td>');
                    const _0x4e7aa6 = [
                        _0x3dd1c4.spear,
                        _0x3dd1c4.sword,
                        _0x3dd1c4.axe,
                        _0x3dd1c4.spy,
                        _0x3dd1c4.light,
                        _0x3dd1c4.heavy,
                        _0x3dd1c4.ram,
                        _0x3dd1c4.catapult,
                        _0x3dd1c4.knight,
                        _0x3dd1c4.snob,
                    ];
                    _0x4e7aa6.forEach((_0xcb2cbc, _0x3417de) => {
                        _0x4dede1.push('<td class="unit-item ' + (_0xcb2cbc && _0x382590[_0x41ad6f] >= _0x382590[_0x4014f2[_0x3417de]] ? '' : 'hidden') + '" style="' + (_0xcb2cbc && _0x382590[_0x41ad6f] >= _0x382590[_0x4014f2[_0x3417de]] ? 'background: #C3FFA5' : '') + '">' + _0xcb2cbc + '</td>');
                    });
                    _0x4dede1.push('<td>' + this.formatDateTime(_0x3dd1c4.launchTime) + '</td><td><span class="timer">' + this.formatSeconds((_0x3dd1c4.launchTime - _0x291be6) / 1000) + '</span</td><td><input type="button" class="btn" value="SEND"></td></tr>');
                });
                _0x4dede1.push('</tbody></table></div></div>');
                const _0x2bc075 = _0x4dede1.join('');
                jQuery('.vis.content-border').append(_0x2bc075);
                Timing.tickHandlers.timers.init();
                $(window.TribalWars).on('global_tick', function (_0x53a5bb) {
                    _0x53a5bb = $('#mass-commands-planner > div > table > tbody > tr:nth-child(2) > td:nth-child(14) > span'), _0x53a5bb.prop('textContent') === '0:00:00' ? _0x53a5bb.closest('tr').remove() : _0x53a5bb.prop('textContent') === '0:00:10' && TribalWars.playSound('chat');
                });
            }
        });
    }
};
