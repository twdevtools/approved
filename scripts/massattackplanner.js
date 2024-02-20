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
var stringHTML = '<div class="vis content-border" style="width: 789px; position: relative; left: 3px; top: -698px; cursor: move"><div class="content"><table width="100%"><tbody><tr><th style="text-align: center; white-space: nowrap; padding: 6px" colspan="4"><h3 style="margin: 0px">MASS ATTACK PLANNER</h3></th></tr><tr><td align="center"><strong>LANDING TIME:</strong></td><td><input type="text" class="arrival" style="font-size: 13pt" placeholder="DD/MM/AAAA 00:00:00"></td><td align="center"><strong>SIGIL:</strong></td><td><input type="text" class="sigil" style="width: 49px; font-size: 13pt" placeholder="00"></td></tr></tbody></table></div><table width="100%"><thead><tr><th><label for="unit_spear"><img src="/graphic/unit/unit_spear.png"></label></th><th><label for="unit_sword"><img src="/graphic/unit/unit_sword.png"></label></th><th><label for="unit_axe"><img src="/graphic/unit/unit_axe.png"></label></th><th><label for="unit_spy"><img src="/graphic/unit/unit_spy.png"></label></th><th><label for="unit_light"><img src="/graphic/unit/unit_light.png"></label></th> <th><label for="unit_heavy"><img src="/graphic/unit/unit_heavy.png"></label></th> <th><label for="unit_ram"><img src="/graphic/unit/unit_ram.png"></label></th> <th><label for="unit_catapult"><img src="/graphic/unit/unit_catapult.png"></label></th> <th><label for="unit_knight"><img src="/graphic/unit/unit_knight.png"></label></th><th><label for="unit_snob"><img src="/graphic/unit/unit_snob.png"></label></th> </tr></thead><tbody><tr><td><input type="radio" id="unit_spear" name="chosen_units" value="spear"></td> <td><input type="radio" id="unit_sword" name="chosen_units" value="sword"></td> <td><input type="radio" id="unit_axe" name="chosen_units" value="axe"></td><td><input type="radio" id="unit_spy" name="chosen_units" value="spy"></td> <td><input type="radio" id="unit_light" name="chosen_units" value="light"></td><td><input type="radio" id="unit_heavy" name="chosen_units" value="heavy"></td> <td><input type="radio" id="unit_ram" name="chosen_units" value="ram"></td><td><input type="radio" id="unit_catapult" name="chosen_units" value="catapult"></td> <td><input type="radio" id="unit_knight" name="chosen_units" value="knight"></td> <td><input type="radio" id="unit_snob" name="chosen_units" value="snob"></td> </tr></tbody></table><div class="textarea-content"><table width="100%"><thead><tr><th><label for="coordinates"><strong>YOUR VILLAGES:</strong></label></th> </tr></thead><tbody><tr><td><textarea class="coordinates" style="background: none; font-size: 11pt; resize: none; width: 98%; height: 50px;"></textarea></td></tr></tbody><thead><tr><th><label for="targets"><strong>DESTINATION VILLAGES:</strong></label></th> </tr></thead><tbody><tr><td><textarea class="targets" style="background: none; font-size: 11pt; resize: none; width: 98%; height: 50px;"></textarea></td></tr></tbody></table></div><div class="action-content"><input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="functions.initCalculate(this)" value="CALCULATE TIMES"><input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="" value="EXPORT BB CODE"></div><div class="commands-found"></div></div>';
$(stringHTML).appendTo(document.body).draggable();
/ SCRIPT FUNCTIONS CONTENT /;
functions = {
    calculateTimes: function (landingTIme, currentTime, sigil, coord, target, unit) {
        var distance = this.calculateDistance(coord, target);
        var sigilRatio = 1 + Number(sigil) / 100;
        var unitTime = (distance * unit * 60000) / sigilRatio;
        var launchTime = new Date(Math.round((landingTIme - unitTime) / 1000) * 1000);
        return launchTime > currentTime && distance > 0 && launchTime;
    },
    calculateDistance: function (coord, target) {
        var [$X1, $Y1] = coord.split('|');
        var [$X2, $Y2] = target.split('|');
        var $DX = Math.abs($X1 - $X2);
        var $DY = Math.abs($Y1 - $Y2);
        return Math.sqrt($DX * $DX + $DY * $DY);
    },
    formatSeconds: function (unformattedTime) {
        var $hours = Math.floor(unformattedTime / 3600);
        var $minutes = Math.floor(unformattedTime % 3600 / 60);
        var $seconds = Math.floor(unformattedTime % 60);
        return ('' + $hours).padStart(2, '0') + ':' + ('' + $minutes).padStart(2, '0') + ':' + ('' + $seconds).padStart(2, '0');
    },
    formatDateTime: function ($date) {
        return ('' + $date.getDate()).padStart(2, '0') + '/' + ('' + ($date.getMonth() + 1)).padStart(2, '0') + '/' + $date.getFullYear() + ' ' + ('' + $date.getHours()).padStart(2, '0') + ':' + ('' + $date.getMinutes()).padStart(2, '0') + ':' + ('' + $date.getSeconds()).padStart(2, '0');
    },
    RequestUnits: function (event) {
        return $.get('/interface.php?func=get_unit_info').then(function ($xml) {
            var $units = {};
            $($xml).find('config').children().each(function () {
                $units[this.tagName] = Number(
                    $(this).find('speed').prop('textContent')
                );
            });
            return $units;
        });
    },
    convertToValidFormat: function (invalidFormat) {
        var [$Y, $T] = invalidFormat.split(' ');
        var [$D, $M, $A] = $Y.split('/');
        return $A + '-' + $M + '-' + $D + ' ' + $T;
    },
    initCalculate: function (event) {
        / INIT CALCULATE TIMES /;
        var unformattedTime = $('.server_info')[0].firstElementChild;
        var currentTime = new Date(this.convertToValidFormat(unformattedTime.nextElementSibling.innerHTML + ' ' + unformattedTime.innerHTML));
        var landingTime = new Date(this.convertToValidFormat(document.querySelector('.arrival').value));
        var sigil = document.querySelector('.sigil').value;
        document.querySelectorAll('textarea').forEach(el => /\d{1,3}\|\d{1,3}/.test(el.value) && (
            el.value = el.value.match(/(\d{1,3}\|\d{1,3})/g).join(' ')
        ));
        $.ajax({
            'url': game_data.link_base_pure + 'overview_villages&mode=units&type=own_home',
            'method': 'GET'
        }).then(async $xml => {
            var units = await this.RequestUnits(), realUnits = [], realCombinations = [], realCoordinates = {};
            var value = document.querySelector('input:checked').value;
            document.querySelector('.coordinates').value.split(' ').forEach(coord => realCoordinates[coord] = true);
            $($xml).find('.quickedit-label').each(function (index, villages) {
                typeof realCoordinates[coord = this.textContent.match(/(\d{1,3}\|\d{1,3})/)[0]] === 'boolean' && (
                $(this).closest('tr').find('.unit-item').each(function (amount) {
                    realUnits.push(this.textContent);
                }), [spear, sword, axe, spy, light, heavy, ram, catapult, knight, snob] = realUnits.map(Number), document.querySelector('.targets').value.split(' ').forEach(target => {
                    (launchTime = functions.calculateTimes(landingTime, currentTime, sigil, coord, target, units[value])) && realCombinations.push({
                        'coord': coord,
                        'target': target,
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
                }), realUnits.splice(0));
            });
            realCombinations.sort((a, b) => {
                return a.launchTime - b.launchTime;
            });
            realCombinations = realCombinations.slice(0, 500);
            if (!realCombinations.length) {
                UI.ErrorMessage('No possibilities found');
            } else {
                const stringHTML = ['<label><span>' + realCombinations.length + '</span>&nbsp;combinations found</label><div class="container" style="max-height: 300px; overflow: auto"><table width="100%"><thead><tr><th>#</th><th>From</th><th>To</th><th><label for="unit_spear"><img src="/graphic/unit/unit_spear.png"></label></th><th><label for="unit_sword"><img src="/graphic/unit/unit_sword.png"></label></th><th><label for="unit_axe"><img src="/graphic/unit/unit_axe.png"></label></th><th><label for="unit_spy"><img src="/graphic/unit/unit_spy.png"></label></th><th><label for="unit_light"><img src="/graphic/unit/unit_light.png"></label></th> <th><label for="unit_heavy"><img src="/graphic/unit/unit_heavy.png"></label></th> <th><label for="unit_ram"><img src="/graphic/unit/unit_ram.png"></label></th><th><label for="unit_catapult"><img src="/graphic/unit/unit_catapult.png"></label></th> <th><label for="unit_knight"><img src="/graphic/unit/unit_knight.png"></label></th><th><label for="unit_snob"><img src="/graphic/unit/unit_snob.png"></label></th><th>Launch Time</th><th>Send in</th><th>Send</th></tr></thead><tbody>'];
                const $units = ['spear', 'sword', 'axe', 'spy', 'light', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
                realCombinations.forEach((village, index) => {
                    stringHTML.push('<tr><td>' + Number(index + 1) + '</td><td>' + village.coord + '</td><td>' + village.target + '</td>');
                    const totalUnits = [
                        village.spear,
                        village.sword,
                        village.axe,
                        village.spy,
                        village.light,
                        village.heavy,
                        village.ram,
                        village.catapult,
                        village.knight,
                        village.snob,
                    ];
                    totalUnits.forEach((unit, i) => {
                        stringHTML.push('<td class="unit-item ' + (unit && units[value] >= units[$units[i]] ? '' : 'hidden') + '" style="' + (unit && units[value] >= units[$units[i]] ? 'background: #C3FFA5' : '') + '">' + unit + '</td>');
                    });
                    stringHTML.push('<td>' + this.formatDateTime(village.launchTime) + '</td><td><span class="timer">' + this.formatSeconds((village.launchTime - currentTime) / 1000) + '</span</td><td><input type="button" class="btn" value="SEND"></td></tr>');
                });
                stringHTML.push('</tbody></table></div>');
                const formattedHTML = stringHTML.join('');
                jQuery('.commands-found').html(formattedHTML);
                Timing.tickHandlers.timers.init();
                $(window.TribalWars).on('global_tick', function (event) {
                    event = $('#ds_body > div.vis.content-border.ui-draggable.ui-draggable-handle > div.commands-found > div > table > tbody > tr:nth-child(1) > td:nth-child(15) > span'), event.prop('textContent') === '0:00:00' ? event.closest('tr').remove() : event.prop('textContent') === '0:00:10' && TribalWars.playSound('chat');
                });
            }
        });
    }
};
