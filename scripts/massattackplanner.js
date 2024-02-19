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
 / STRING HTML CONTENT /

var stringHTML = 
`<div class="vis content-border" style="width: 789px; position: relative; left: 3px; top: -698px; cursor: move">
    <div class="content">
        <table width="100%">
            <tbody>
                <tr>
                    <th style="text-align: center; white-space: nowrap; padding: 6px" colspan="4">
                        <h3 style="margin: 0px">MASS ATTACK PLANNER</h3>
                    </th>
                </tr>
                <tr>
                    <td align="center">
                        <strong>LANDING TIME:</strong>
                    </td>
                    <td>
                        <input type="text" class="arrival" style="font-size: 13pt" placeholder="DD/MM/AAAA 00:00:00">
                    </td>
                    <td align="center">
                        <strong>SIGIL:</strong>
                    </td>
                    <td>
                        <input type="text" class="sigil" style="width: 49px; font-size: 13pt" placeholder="00">
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <table width="100%">
        <thead>
            <tr>
                <th>
                    <label for="unit_spear">
                        <img src="/graphic/unit/unit_spear.png">
                    </label>
                </th>
                <th>
                    <label for="unit_sword">
                        <img src="/graphic/unit/unit_sword.png">
                    </label>
                </th>
                <th>
                    <label for="unit_axe">
                        <img src="/graphic/unit/unit_axe.png">
                    </label>
                </th>
                <th>
                    <label for="unit_spy">
                        <img src="/graphic/unit/unit_spy.png">
                    </label>
                </th>                
                <th>
                    <label for="unit_light">
                        <img src="/graphic/unit/unit_light.png">
                    </label>
                </th>               
                <th>
                    <label for="unit_heavy">
                        <img src="/graphic/unit/unit_heavy.png">
                    </label>
                </th>               
                <th>
                    <label for="unit_ram">
                        <img src="/graphic/unit/unit_ram.png">
                    </label>
                </th>               
                <th>
                    <label for="unit_catapult">
                        <img src="/graphic/unit/unit_catapult.png">
                    </label>
                </th>               
                <th>
                    <label for="unit_knight">
                        <img src="/graphic/unit/unit_knight.png">
                    </label>
                </th>                
                <th>
                    <label for="unit_snob">
                        <img src="/graphic/unit/unit_snob.png">
                    </label>
                </th>               
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <input type="radio" id="unit_spear" name="chosen_units" value="spear">
                </td>               
                <td>
                    <input type="radio" id="unit_sword" name="chosen_units" value="sword">
                </td>               
                <td>
                    <input type="radio" id="unit_axe" name="chosen_units" value="axe">
                </td>
                <td>
                    <input type="radio" id="unit_spy" name="chosen_units" value="spy">
                </td>               
                <td>
                    <input type="radio" id="unit_light" name="chosen_units" value="light">
                </td>                
                <td>
                    <input type="radio" id="unit_heavy" name="chosen_units" value="heavy">
                </td>             
                <td>
                    <input type="radio" id="unit_ram" name="chosen_units" value="ram">
                </td>
                <td>
                    <input type="radio" id="unit_catapult" name="chosen_units" value="catapult">
                </td>             
                <td>
                    <input type="radio" id="unit_knight" name="chosen_units" value="knight">
                </td>     
                <td>
                    <input type="radio" id="unit_snob" name="chosen_units" value="snob">
                </td>         
            </tr>
        </tbody>
    </table>
    <div class="textarea-content">
        <table width="100%">
            <thead>
                <tr>
                    <th>
                        <label for="coordinates">
                            <strong>YOUR VILLAGES:</strong>
                        </label>
                    </th>               
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <textarea class="coordinates" style="background: none; font-size: 11pt; resize: none; width: 98%; height: 50px;"></textarea>
                    </td>
                </tr>
            </tbody>
            <thead>
                <tr>
                    <th>
                        <label for="targets">
                            <strong>DESTINATION VILLAGES:</strong>
                        </label>
                    </th>               
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <textarea class="targets" style="background: none; font-size: 11pt; resize: none; width: 98%; height: 50px;"></textarea>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="action-content">
        <input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="functions.initCalculate(this)" value="CALCULATE TIMES">
        <input type="button" class="btn" style="margin: 4px; margin-top: auto" onclick="" value="EXPORT BB CODE">
    </div>
</div>`

$(stringHTML).appendTo(document.body).draggable();

/ SCRIPT FUNCTIONS CONTENT /

functions = {
	calculateTimes: function (landingTime, currentTime, sigil, coord, target, unit) {
		var distance = this.calculateDistance(coord, target);
		var sigilRatio = 1 + Number(sigil) / 100;
		var unitTime = (distance * unit * 60000) / sigilRatio;
		var launchTime = new Date(Math.round((landingTime - unitTime) / 1000) * 1000);
		return launchTime > currentTime && distance > 0 ? launchTime : false;
	},
	calculateDistance: function (coord, target) {
		var [x1, y1] = coord.split('|');
		var [x2, y2] = target.split('|');
		var deltaX = Math.abs(x1 - x2);
		var deltaY = Math.abs(y1 - y2);
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	},
	formatSeconds: function (unformattedTime) {
		var hourFormatted  = Math.floor(unformattedTime / 3600);
		var minutesFormatted  = Math.floor((unformattedTime % 3600) / 60);
		var secondsFormatted  = Math.floor(unformattedTime % 60);
		return ('' + hourFormatted ).padStart(2, '0') + ':' + ('' + minutesFormatted ).padStart(2, '0') + ':' + ('' + secondsFormatted ).padStart(2, '0');
	},
    formatDateTime: function (timeDate) {
        return ('' + timeDate.getDate()).padStart(2, '0') + '/' + ('' + timeDate.getMonth() + 1).padStart(2, '0') + '/' + timeDate.getFullYear() + ' ' + ('' + timeDate.getHours()).padStart(2, '0') + ':' + ('' + timeDate.getMinutes()).padStart(2, '0') + ':' + ('' + timeDate.getSeconds()).padStart(2, '0');
    },
	RequestUnits: function (event) {
		return $.get('/interface.php?func=get_unit_info').then(function (xml) {
			var units = {};
			$(xml).find('config').children().each(function () {
			    units[this.tagName] = $(this).find('speed').prop('textContent');
			});
		    return units;
		});
	},
	convertToValidFormat: function(invalidFormat) {
		var [date, time] = invalidFormat.split(' ');
		var [day, month, year] = date.split('/');
		return `${year}-${month}-${day} ${time}`;
	},
	initCalculate: function (event) {
        var unformattedTime = $('.server_info')[0].firstElementChild;
        var currentTime = new Date(this.convertToValidFormat(unformattedTime.nextElementSibling.innerHTML + ' ' + unformattedTime.innerHTML));
        var landingTime = new Date(this.convertToValidFormat(
            document.querySelector('.arrival').value
        ));
        var sigil = document.querySelector('.sigil').value;

        $.ajax({url: game_data.link_base_pure + 'overview_villages&mode=units&type=own_home', method: 'GET'}).then(async ($html) => { 

            var unitsSpeed = await this.RequestUnits(), realUnits = [], realCombinations = [], realCoordinates = {};
            var unitSelected = document.querySelector('input:checked').value;

            document.querySelector('.coordinates').value.split(' ').forEach(el => realCoordinates[el] = true);

            $($html).find('.quickedit-label').each(function(i) {
                typeof realCoordinates[coord = this.textContent.match(/(\d{1,3}\|\d{1,3})/)[0]] === 'boolean' && (        
                $(this).closest('tr').find('.unit-item').each(function(i) {
                    realUnits.push(this.textContent);
                }),
                
                [spear, sword, axe, spy, light, heavy, ram, catapult, knight, snob] = realUnits.map(Number),

                document.querySelector('.targets').value.split(' ').forEach(target => {
                  (launchTime = functions.calculateTimes(landingTime, currentTime, sigil, coord, target, unitsSpeed[unitSelected])) && realCombinations.push({
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
                }),

                realUnits.splice(0)
                
                );})
                    
                realCombinations.sort((a, b) => {
                    return a.launchTime - b.launchTime;
                });
                    
                realCombinations = realCombinations.slice(0, 500);
                var totalCombinations = realCombinations.length;

                if (!totalCombinations) {
                    UI.ErrorMessage('No possibilities found');
                } else {
                const stringHTML = [`<div class="commands-found">
                    <label><span>` + totalCombinations + `</span>&nbsp;combinations found</label>
                        <div class="container" style="max-height: 300px; overflow: auto">
                            <table width="100%">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>
                                            From
                                        </th>
                                        <th>
                                            To
                                        </th>
                                        <th>
                                            <label for="unit_spear">
                                                <img src="/graphic/unit/unit_spear.png">
                                            </label>
                                        </th>
                                        <th>
                                            <label for="unit_sword">
                                                <img src="/graphic/unit/unit_sword.png">
                                            </label>
                                        </th>
                                        <th>
                                            <label for="unit_axe">
                                                <img src="/graphic/unit/unit_axe.png">
                                            </label>
                                        </th>
                                        <th>
                                            <label for="unit_spy">
                                                <img src="/graphic/unit/unit_spy.png">
                                            </label>
                                        </th>                
                                        <th>
                                            <label for="unit_light">
                                                <img src="/graphic/unit/unit_light.png">
                                            </label>
                                        </th>               
                                        <th>
                                            <label for="unit_heavy">
                                                <img src="/graphic/unit/unit_heavy.png">
                                            </label>
                                        </th>               
                                        <th>
                                            <label for="unit_ram">
                                                <img src="/graphic/unit/unit_ram.png">
                                            </label>
                                        </th>               
                                        <th>
                                            <label for="unit_catapult">
                                                <img src="/graphic/unit/unit_catapult.png">
                                            </label>
                                        </th>               
                                        <th>
                                            <label for="unit_knight">
                                                <img src="/graphic/unit/unit_knight.png">
                                            </label>
                                        </th>                
                                        <th>
                                            <label for="unit_snob">
                                                <img src="/graphic/unit/unit_snob.png">
                                            </label>
                                        </th>
                                        <th>
                                            Launch Time
                                        </th>
                                        <th>
                                            Send in
                                        </th>
                                        <th>
                                            Send
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>`];

                                const content = {
                                    spear: {
                                      0: true,
                                      1: false,
                                      2: true,
                                      3: true,
                                      4: true,
                                      5: true,
                                      6: false,
                                      7: false,
                                      8: true,
                                      9: false,
                                    },
                                    sword: {
                                      0: true,
                                      1: true,
                                      2: true,
                                      3: true,
                                      4: true,
                                      5: true,
                                      6: false,
                                      7: false,
                                      8: true,
                                      9: false,
                                    },
                                    axe: {
                                      0: true,
                                      1: false,
                                      2: true,
                                      3: true,
                                      4: true,
                                      5: true,
                                      6: false,
                                      7: false,
                                      8: true,
                                      9: false,
                                    },
                                    spy: {
                                      0: false,
                                      1: false,
                                      2: false,
                                      3: true,
                                      4: false,
                                      5: false,
                                      6: false,
                                      7: false,
                                      8: true,
                                      9: false,
                                    },
                                    light: {
                                      0: false,
                                      1: false,
                                      2: false,
                                      3: true,
                                      4: true,
                                      5: true,
                                      6: false,
                                      7: false,
                                      8: true,
                                      9: false,
                                    },
                                    heavy: {
                                      0: false,
                                      1: false,
                                      2: false,
                                      3: true,
                                      4: true,
                                      5: true,
                                      6: false,
                                      7: false,
                                      8: true,
                                      9: false,
                                    },
                                    ram: {
                                      0: true,
                                      1: true,
                                      2: true,
                                      3: true,
                                      4: true,
                                      5: false,
                                      6: true,
                                      7: true,
                                      8: true,
                                      9: false,
                                    },
                                    catapult: {
                                      0: true,
                                      1: true,
                                      2: true,
                                      3: true,
                                      4: true,
                                      5: true,
                                      6: true,
                                      7: true,
                                      8: true,
                                      9: false,
                                    },
                                    knight: {
                                      0: false,
                                      1: false,
                                      2: false,
                                      3: true,
                                      4: false,
                                      5: false,
                                      6: false,
                                      7: false,
                                      8: true,
                                      9: false,
                                    },
                                    snob: {
                                      0: true,
                                      1: true,
                                      2: true,
                                      3: true,
                                      4: true,
                                      5: true,
                                      6: true,
                                      7: true,
                                      8: true,
                                      9: true,
                                    },
                                  };

                                realCombinations.forEach((combinations, index) => {
                                    stringHTML.push(`<tr>
                                    <td>` + Number(index+1) + `</td>
                                    <td>` + combinations.coord + `</td>
                                    <td>` + combinations.target + `</td>`);
                                    const extractUnits = [combinations.spear, combinations.sword, combinations.axe, combinations.spy, combinations.light, 
                                    combinations.heavy, combinations.ram, combinations.catapult, 
                                    combinations.knight, combinations.snob]; extractUnits.forEach((el, i) => {
                                        stringHTML.push(`<td class="unit-item ` + (el && content[unitSelected][i] ? '' : 'hidden') + `" style="` + (el && content[unitSelected][i] ? 'background: #C3FFA5' : '') + `">` + el + `</td>`)
                                    })
                                    stringHTML.push(`<td>` + this.formatDateTime(combinations.launchTime) + `</td>
                                    <td><span class="timer">` + this.formatSeconds((combinations.launchTime - currentTime) / 1000) + `</span</td>
                                    <td><input type="button" class="btn" value="SEND"></td>
                                    </tr>`)});                                                                                                                                                                                                                                                                                                                                                                              
                                stringHTML.push('</tbody></table></div></div>');
                                const stringFormatted = stringHTML.join('');
                                jQuery('.vis.content-border').append(stringFormatted);
                                Timing.tickHandlers.timers.init();  
                                $(window.TribalWars).on('global_tick', function (_08756F8) { 
                                    _08756F8 = $('#mass-commands-planner > div > table > tbody > tr:nth-child(2) > td:nth-child(14) > span'), _08756F8.prop('textContent') === '0:00:00' && _08756F8.closest('tr').remove();
                                });                
                          
            }}
        );
    },
};

'863|195 868|176 862|192 863|191 863|196 863|190 865|194'
