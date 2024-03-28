/*
 * Script Name: MASS ATTACK PLANNER
 * Version: v1.0
 * Last Updated: 2024-02-26
 * Author: K I N G S
 * Author Contact: +55 48-98824-2773
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

/ SCRIPT API FUNCTIONS CONTENT /;
window.ScriptAPI = {
    calculateTimes: function (landingTime, currentTime, sigil, coord, target, unit) {
        var distance = this.calculateDistance(coord, target);
        var sigilRatio = 1 + Number(sigil) / 100;
        var unitTime = (distance * unit * 60000) / sigilRatio;
        var launchTime = new Date(Math.round((landingTime - unitTime) / 1000) * 1000);
        return launchTime > currentTime && distance > 0 && launchTime;
    },
    calculateDistance: function (from, to) {
        var [x1, y1] = from.split('|');
        var [x2, y2] = to.split('|');
        var deltaX = Math.abs(x1 - x2);
        var deltaY = Math.abs(y1 - y2);
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    },
    secondsToHms: function (timestamp) {
        var $hours = Math.floor(timestamp / 3600);
        var $minutes = Math.floor(timestamp % 3600 / 60);
        var $seconds = Math.floor(timestamp % 60);
        return ('' + $hours).padStart(2, '0') + ':' + ('' + $minutes).padStart(2, '0') + ':' + ('' + $seconds).padStart(2, '0');
    },
    formatDateTime: function ($date) {
        return ('' + $date.getDate()).padStart(2, '0') + '/' + ('' + ($date.getMonth() + 1)).padStart(2, '0') + '/' + $date.getFullYear() + ' ' + ('' + $date.getHours()).padStart(2, '0') + ':' + ('' + $date.getMinutes()).padStart(2, '0') + ':' + ('' + $date.getSeconds()).padStart(2, '0');
    },
    RequestAPI: function(event) {
        return new Promise(async (resolve) => {
            try {
                window.APIUpdated = {
                    'database': await this.RequestData(), 'units': await this.RequestUnits(),
                };
                UI.SuccessMessage('Database Updated!'); 
                return resolve();
            } catch (error) {
                return UI.ErrorMessage(
                    `Database has not been updated!: ${error.message}`
                );
            }
        });
    },
    RequestData: function (event) {
        return $.ajax({url: '/map/village.txt', method: 'GET'}).then($xml => {
            var database = {};
            $xml.split('\n').forEach((lines, i) => {
                const index = lines.split(',');
                database[index[2] + '|' + index[3]] = index[0];
            });
            return database;
        });
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
    RequestXML: function(event) {
        / OPEN NEW TAB WITH FILLED UNITS /;
        var columns = [];
        var HTMLCollection = event.closest('tr').cells;
        Array.from(HTMLCollection).slice(1, -3).forEach((el) => columns.push(!el.className.includes('hidden') ? el.textContent : 0));
        window.open('/game.php?village=' + window.APIUpdated.database[columns[0]] + '&screen=place', '_blank').onload = function (event) {
            var units = columns.slice(2);
            this.$('.unitsInput').each(function(i) {
                return this.value = units[i];
            });
            this.document.querySelector('.target-input-field').value = columns[1];
        };
    },
    closeScript: function(event) {
        return document.querySelector('.vis.content-border').remove();
    },
    convertToValidFormat: function (timestamp) {
        var [date, time] = timestamp.split(' ');
        var [day, month, year] = date.split('/');
        return year + '-' + month + '-' + day + ' ' + time;
    },
    exportBBCode: function(event) {
        / INIT EXPORT BB CODE /;
        var content = '[table][**]Unit[||]From[||]To[||]Launch Time[||]Send[/**]';
        $('.commands-found tr').slice(1).each(function(i) {
            var columns = Array.from(this.cells), village = columns[1].textContent, target = columns[2].textContent, launchTime = columns.slice(-3)[0].textContent;
            var [targetX, targetY] = target.split('|');
            content += '[*][unit]' + ScriptAPI.value + '[/unit] [|] ' + village + ' [|] ' + target + ' [|] ' + launchTime + ' [|] [url=' + window.location.origin + '/game.php?village=' + window.APIUpdated.database[village] + '&screen=' + 'place&x=' + targetX + '&y=' + targetY + '&from=simulator';
            game_data.units.slice(0, -1).forEach((unit, i) => {
                var units = columns.slice(3);
                content += `&att_${unit}=` + (!units[i].className.includes('hidden') ? units[i].textContent : 0)  
            });
            content += ']SEND[/url]';
        });
        content += '[/table]';
        return navigator.clipboard.writeText(content), UI.SuccessMessage('BB Code copied!');
    },
    initCalculate: function (event) {
        / INIT CALCULATE TIMES /;
        var unformattedTime = $('.server_info')[0].firstElementChild;
        var currentTime = new Date(this.convertToValidFormat(`${unformattedTime.nextElementSibling.innerHTML} ${unformattedTime.innerHTML}`));
        var landingTime = new Date(this.convertToValidFormat(document.querySelector('.arrival').value));
        var sigil = document.querySelector('.sigil').value;
        / FORMAT TEXTAREA /;
        document.querySelectorAll('textarea').forEach(el => /\d{1,3}\|\d{1,3}/.test(el.value) && (el.value = el.value.match(/(\d{1,3}\|\d{1,3})/g).join(' ')));
        / FIND ALL AVAILABLE VILLAGES AND TROOPS /;
        $.ajax({'url': game_data.link_base_pure + 'overview_villages&type=own_home&mode=units&group=0', 'method': 'GET'}).then(($xml) => {
            var realUnits = {}, realCombinations = [], realCoordinates = {};
            this.value = document.querySelector('input:checked').value;
            document.querySelector('.coordinates').value.split(' ').forEach((coord) => realCoordinates[coord] = true);
            $($xml).find('.quickedit-label').each(function (i, coord) {
                if (typeof realCoordinates[coord = this.textContent.match(/(\d{1,3}\|\d{1,3})/)[0]] === 'boolean') {
                    $(this).closest('tr').find('.unit-item').each(function (i, amount) {
                        realUnits[game_data.units[i]] = Number(this.textContent);
                    });
                    / FIND POSSIBLE COMBINATIONS /;
                    const {spear, sword, axe, archer, spy, light, marcher, heavy, ram, catapult, knight, snob} = realUnits; 
                    document.querySelector('.targets').value.split(' ').forEach((target, index) => {
                        (launchTime = ScriptAPI.calculateTimes(landingTime, currentTime, sigil, coord, target, window.APIUpdated.units[ScriptAPI.value])) && realUnits[ScriptAPI.value] && realCombinations.push({
                            'coord': coord, 'target': target, 'spear': spear, 'sword': sword, 'axe': axe, 'archer': archer, 'spy': spy, 'light': light, 'marcher': marcher, 'heavy': heavy, 'ram': ram, 'catapult': catapult, 'knight': knight, 'snob': snob, 'launchTime': launchTime,
                        });
                    }); 
                };
            });
            realCombinations.sort((a, b) => {
                return a.launchTime - b.launchTime;
            });
            realCombinations = realCombinations.slice(0, 500);
            if (!realCombinations.length) {
                UI.ErrorMessage('No possibilities found!');
            } else {
                / CREATE DYNAMIC TABLE /;
                var innerHTML = '<label><span>&nbsp;' + realCombinations.length + '</span>&nbsp;combinations found</label><div class="container" style="max-height: 300px; overflow: auto"><table width="100%"><thead><tr><th style="text-align: center">#</th><th>From</th><th>To</th>'; game_data.units.slice(0, -1).forEach((unit, i) => innerHTML += '<th><label for="unit_' + unit + '"><img src="/graphic/unit/unit_' + unit + '.png"></label></th>'); innerHTML += '<th>Launch Time</th><th>Send in</th><th style="text-align: center">Send</th></tr></thead><tbody>';
                realCombinations.forEach((village, index) => {
                    innerHTML += '<tr><td align="center">' + (index + 1) + '</td><td align="center"><a href="/game.php?village=' + window.APIUpdated.database[village.coord] + '&screen=overview" target="_blank" rel="noopener noreferrer">' + village.coord + '</a></td><td align="center"><a href="' + game_data.link_base_pure + 'info_village&id=' + window.APIUpdated.database[village.target] + '"target="_blank" rel="noopener noreferrer">' + village.target + '</a></td>';
                    game_data.units.slice(0, -1).forEach((unit, i) => {
                        return innerHTML += '<td class="unit-item' + (village[unit] && window.APIUpdated.units[ScriptAPI.value] >= window.APIUpdated.units[unit] ? '' : ' hidden') + '"' + (village[unit] && window.APIUpdated.units[ScriptAPI.value] >= window.APIUpdated.units[unit] ? 'style="background: #C3FFA5"' : '') + '>' + village[unit] + '</td>';
                    });
                    innerHTML += '<td>' + this.formatDateTime(village.launchTime) + '</td><td><span class="timer">' + this.secondsToHms((village.launchTime - currentTime) / 1000) + '</span</td><td align="center"><input type="button" class="btn" style="padding: 3px" onclick="ScriptAPI.RequestXML(this)" value="SEND"></td></tr>';
                }); 
                innerHTML += '</tbody></table></div>'; document.querySelector('.commands-found').innerHTML = innerHTML;
                Timing.tickHandlers.timers.init(); $(window.TribalWars).on('global_tick', function (event) {
                    event = $('#ds_body > div.vis.content-border.ui-draggable.ui-draggable-handle > div.commands-found > div > table > tbody > tr:nth-child(1) > td:nth-child(15) > span'), event.prop('textContent') === '0:00:00' ? event.closest('tr').remove() : event.prop('textContent') === '0:00:10' && TribalWars.playSound('chat');
                });
            }
        });
    },
};
/ STRING HTML CONTENT /;
ScriptAPI.stringHTML = '<div class="vis content-border" style="width: 789px; border-radius: 8px 8px 8px 8px; z-index: 7; position: fixed; left: 20%; top: 20%; cursor: move"><div class="close"><a style="position: absolute; top: 5px; right: 10px; z-index: 1; font-size: large" onclick="ScriptAPI.closeScript(this)" href="#">X</a></div><div class="content-title"><table width="100%"><tbody><tr><th style="text-align: center; white-space: nowrap; padding: 6px" colspan="4"><h3 style="margin: 0px">MASS ATTACK PLANNER</h3></th></tr><tr><td align="center"><strong>LANDING TIME:</strong></td><td><input type="text" class="arrival" style="font-size: 13pt" placeholder="DD/MM/AAAA 00:00:00"></td><td align="center"><strong>SIGIL:</strong></td><td><input type="text" class="sigil" style="width: 49px; font-size: 13pt" placeholder="00"></td></tr></tbody></table></div><div class="container"><table width="100%"><thead><tr>'; game_data.units.slice(0, -1).forEach((units, i) => ScriptAPI.stringHTML += '<th><label for="unit_' + units + '"><img src="/graphic/unit/unit_' + units + '.png"></label></th>'); ScriptAPI.stringHTML += '</tr></thead><tbody><tr>'; game_data.units.slice(0, -1).forEach((units, i) => ScriptAPI.stringHTML += '<td><input type="radio" id="unit_' + units + '" name="chosen_units" value="' + units + '"' + (units === 'ram' ? 'checked' : '') + '></td>'); ScriptAPI.stringHTML += '</tr></tbody></table></div><div class="textarea-content"><table width="100%"><thead><tr><th><label for="coordinates"><strong>YOUR VILLAGES:</strong></label></th></tr></thead><tbody><tr><td><textarea class="coordinates" style="background: none; font-size: 11pt; resize: none; width: 775px; height: 50px;"></textarea></td></tr></tbody><thead><tr><th><label for="targets"><strong>DESTINATION VILLAGES:</strong></label></th></tr></thead><tbody><tr><td><textarea class="targets" style="background: none; font-size: 11pt; resize: none; width: 775px; height: 50px;"></textarea></td></tr></tbody></table></div><div class="action-content"><input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="ScriptAPI.initCalculate(this)" value="CALCULATE TIMES"><input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="ScriptAPI.exportBBCode(this)" value="EXPORT BB CODE"></div><div class="author" style="margin: 2px"><small><strong>MASS ATTACK PLANNER v1.0 BY&nbsp;<span style="color: red">K I N G S</span></strong></small></div><div class="commands-found"></div></div>';
$(document.body).append(ScriptAPI.stringHTML);
$('.vis.content-border').draggable();
/ DATABASE AND UNITS LAST UPDATED (1X PER HOUR) /;
var updatedTime = Date.now();
var APIUpdated = JSON.parse(localStorage.getItem('APIUpdated'));
(!APIUpdated || APIUpdated.lastUpdated + (3600 * 1000) <= updatedTime) && this.ScriptAPI.RequestAPI().then(event => {
    var contentUpdated = {
        'lastUpdated': this.updatedTime, 'database': this.APIUpdated.database, 'units': this.APIUpdated.units,
    };
    return localStorage.setItem('APIUpdated', JSON.stringify(contentUpdated))
});
