/*
 * Script Name: Support Counter Evolved
 * Version: v1.1.3
 * Last Updated: 2023-10-07
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: N/A
 * Approved Date: 2023-01-18
 * Mod: JawJaw
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;
if (typeof HC_AMOUNT === 'undefined') HC_AMOUNT = null;

if ('TWMap' in window) mapOverlay = TWMap;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'supportCounterEvolved',
        name: 'Support Counter Evolved',
        version: 'v1.1.3',
        author: 'RedAlert',
        authorUrl: 'https://twscripts.dev/',
        helpLink:
            'https://forum.tribalwars.net/index.php?threads/support-counter-evolved.289857/',
    },
    translations: {
        en_DK: {
            'Support Counter Evolved': 'Support Counter Evolved',
            Help: 'Help',
            'Redirecting...': 'Redirecting...',
            'Support in your own villages': 'Support in your own villages',
            'Support in other players villages':
                'Support in other players villages',
            'Support in barbarian villages': 'Support in barbarian villages',
            population: 'population',
            Withdraw: 'Withdraw',
            'Player:': 'Player:',
            pop: 'pop',
            'Village Name': 'Village Name',
            Action: 'Action',
            'Mass Withdraw': 'Mass Withdraw',
            TOTAL: 'TOTAL',
            'supports selected': 'supports selected',
            'There was an error fetching supports data!':
                'There was an error fetching supports data!',
            'Amount of troops to call back in %':
                'Amount of troops to call back in %',
            '(example 20 for 20%)': '(example 20 for 20%)',
            'Fill Units': 'Fill Units',
            'Invalid amount!': 'Invalid amount!',
            Village: 'Village',
            Population: 'Population',
            'Fetching support data ...': 'Fetching support data ...',
            'Total Units': 'Total Units',
            'Selected Units': 'Selected Units',
            'Remaining Units': 'Remaining Units',
            'Toggle call back by unit amounts':
                'Toggle call back by unit amounts',
            'Invalid input!': 'Invalid input!',
        },
    },
    allowedMarkets: [],
    allowedScreens: ['overview_villages'],
    allowedModes: ['units'],
    isDebug: DEBUG,
    enableCountApi: true,
};

$.getScript(
    `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
        // Initialize Library
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();
        const gameScreen = twSDK.getParameterByName('screen');
        const gameMode = twSDK.getParameterByName('mode');
        const screenType = twSDK.getParameterByName('type');
        const id = twSDK.getParameterByName('id');

        const hcPopAmount = HC_AMOUNT ?? twSDK.unitsFarmSpace['heavy']; // HC_AMOUNT is provided by the player

        // Entry point
        (function () {
            if (
                gameScreen === 'overview_villages' &&
                gameMode === 'units' &&
                screenType === 'away_detail'
            ) {
                initSupportUnitsScreen();
            } else if (gameScreen === 'map') {
                initMapScreen();
            } else if (gameScreen === 'info_village' && id) {
                initSingleVillageScreen();
            } else {
                UI.InfoMessage(twSDK.tt('Redirecting...'));
                twSDK.redirectTo(
                    'overview_villages&mode=units&type=away_detail&group=0&page=-1&filter_villages=1'
                );
            }
        })();

        // Initialize script logic for overview units screen
        function initSupportUnitsScreen() {
            //build the user interface
            const support = calculateSupport(jQuery('#units_table'));
            const sortedSupport = sortSupportByPop(support);
            const content = buildSupportTable(sortedSupport);

            const customStyle = `
                .ra-support-counter-box { display: block; margin-bottom: 8px; border: 1px solid #c59349; }
                .ra-support-counter-box:last-child { margin-bottom: 0; }
                .ra-support-counter-box h3 { user-select: none; font-weight: normal; margin: 0; padding: 5px; font-size: 14px; background-color: #ddc390 !important; position: relative; cursor: pointer; }
                .ra-player-support-table { padding: 5px; display: none; }
                .ra-player-support-table .ra-mb5 { margin-bottom: 5px; }
                .ra-player-support-table .ra-mb5:last-child { margin-bottom: 0 !important; }
                .ra-table-v2 th { background-image: none !important; }

                .ra-table-v3 { border-width: 1px; }
                .ra-table-v3 th { background-image: none; }

                .ra-main-table td { padding: 0; }

                .ra-villages-table tr:nth-of-type(2n) td { background-color: #f0e2be; padding: 5px; }
                .ra-villages-table tr:nth-of-type(2n+1) td { background-color: #fff5da; padding: 5px; }
                .ra-villages-table tfoot td { background-color: #c1a264 !important; }

                .ra-toggle-icon { float: right; }
                .ra-mr15 { margin-right: 15px; }
                .ra-red { color: #ff0000; }
                .ra-hidden { color: #b19661; }
                .btn-confirm-yes { padding: 3px; }
            `;

            twSDK.renderBoxWidget(
                content,
                'raSupportCounterEvolved',
                'ra-support-counter-evolved',
                customStyle
            );

            // register user actions
            toggleSupportBoxes();
            handleWithdrawSupport();
            handleMassWithdrawSupport();
        }

        // Initialize script logic for map screen
        async function initMapScreen() {
            const supports = await fetchSupportsData();
            const villages = extractCoordinatesAndSupport(supports);
            const mapVillagesTable = buildMapVillagesTable(villages);

            const content = `
                <div class="ra-mb15 ra-table-container">
                    ${mapVillagesTable}
                </div>
            `;

            twSDK.renderFixedWidget(
                content,
                'raSupportCounterEvolved',
                'ra-support-counter-evolved'
            );

            updateMap(villages);
        }

        // Initialize script logic for single village screen
        function initSingleVillageScreen() {
            const unitAmountHtml = buildUnitAmountSelector();

            // build user interface
            const content = `
                <div class="ra-mb15">
                    ${buildUnitsChoserTable()}
                </div>
                <div class="ra-mb15">
                    <table class="ra-table ra-table-v3" width="100%">
                        <tbody>
                            <tr id="raCallBackByPercentage">
                                <td>
                                    <label class="ra-label">
                                        ${twSDK.tt(
                                            'Amount of troops to call back in %'
                                        )}
                                    </label>
                                </td>
                                <td>
                                    <input type="text" class="ra-input" value="0" id="raAmountToCallBack" />
                                    <span class="ra-hint">${twSDK.tt(
                                        '(example 20 for 20%)'
                                    )}</span>
                                </td>
                            </tr>
                            <tr id="raCallBackByUnitAmounts" style="display:none;">
                                <td>
                                    ${unitAmountHtml}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <label for="raToggleCallBackMethod" class="ra-label">
                                        <input type="checkbox" id="raToggleCallBackMethod"> ${twSDK.tt(
                                            'Toggle call back by unit amounts'
                                        )}
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <a href="javascript:void(0);" id="raSelectAmountOfUnitsBtn" class="btn">
                                        ${twSDK.tt('Fill Units')}
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            const customStyle = `
                .ra-label { font-weight: 600; }
                .ra-input { padding: 5px; font-size: 14px; margin: 6px 0 3px; }
                .ra-hint { display: block; font-size: 12px; color: #999; }
                .ra-unit-picker-table th { padding: 0; }
                .ra-unit-picker-table label { cursor: pointer; display: block; padding: 5px !important; }
                .ra-unit { width: 35px; }
                .ra-label { font-weight: normal; cursor: pointer; }
            `;

            twSDK.renderFixedWidget(
                content,
                'raSupportCounterEvolved',
                'ra-support-counter-evolved',
                customStyle,
                '580px'
            );

            setTimeout(() => {
                const amount =
                    localStorage.getItem(
                        `${scriptConfig.scriptData.prefix}_amount`
                    ) ?? 0;
                if (amount) {
                    jQuery('#raAmountToCallBack').val(amount);
                }
            }, 10);

            // show total unit amounts
            showTotalUnitAmounts();

            // register user action handlers
            handleFillUnits();
            handleCallBackMethod();
            handleUnitChoserToggle();
        }

        // Action Handler: Toggle player expandable widget
        function toggleSupportBoxes() {
            jQuery('.ra-support-counter-toggle').on('click', function () {
                jQuery(this)
                    .parent()
                    .find('> .ra-player-support-table')
                    .slideToggle(50);
                const toggleIcon = jQuery(this).find('> .ra-toggle-icon img');
                const toggleIconSrc = jQuery(toggleIcon).attr('src');
                if (toggleIconSrc === '/graphic/minus.png') {
                    jQuery(toggleIcon).attr('src', '/graphic/plus.png');
                } else {
                    jQuery(toggleIcon).attr('src', '/graphic/minus.png');
                }
            });
        }

        // Action Handler: Withdraw support
        function handleWithdrawSupport() {
            jQuery('.ra-btn-withdraw-support').on('click', function (e) {
                e.preventDefault();

                jQuery(this).addClass('btn-confirm-yes');

                const villageName = jQuery(this)
                    .parent()
                    .parent()
                    .find('.ra-village-link')
                    .text()
                    .trim();

                let atLeastOneWasFound = 0;
                jQuery('.village_anchor a').each(function () {
                    const currentVillageName = jQuery(this).text().trim();

                    if (villageName === currentVillageName) {
                        const foundName = jQuery(this)
                            .parent()
                            .parent()
                            .find('.village_checkbox')
                            .attr('name');

                        if (foundName) {
                            jQuery(this)
                                .parent()
                                .parent()
                                .find(
                                    `input[type="checkbox"][name="${foundName}"]`
                                )
                                .prop('checked', true);
                            atLeastOneWasFound++;
                        }
                    }
                });

                if (atLeastOneWasFound) {
                    UI.SuccessMessage(
                        `${atLeastOneWasFound} ${twSDK.tt('supports selected')}`
                    );
                    setTimeout(function () {
                        jQuery('form#overview_form').submit();
                    }, 500);
                }
            });
        }

        // Action Handler: Mass withdraw support
        function handleMassWithdrawSupport() {
            jQuery('.ra-btn-mass-withraw-support').on('click', function (e) {
                e.preventDefault();

                jQuery(this).addClass('btn-confirm-yes');

                const villagesToSelect = [];

                jQuery(this)
                    .closest('.ra-villages-table')
                    .find('tbody > tr')
                    .each(function () {
                        const currentVillageName = jQuery(this)
                            .find('.ra-village-link')
                            .text()
                            .trim();

                        villagesToSelect.push(currentVillageName);
                    });

                let atLeastOneWasFound = 0;
                jQuery('.village_anchor a').each(function () {
                    const currentVillageName = jQuery(this).text().trim();

                    if (villagesToSelect.includes(currentVillageName)) {
                        const foundName = jQuery(this)
                            .parent()
                            .parent()
                            .find('.village_checkbox')
                            .attr('name');

                        if (foundName) {
                            jQuery(this)
                                .parent()
                                .parent()
                                .find(
                                    `input[type="checkbox"][name="${foundName}"]`
                                )
                                .prop('checked', true);
                            atLeastOneWasFound++;
                        }
                    }
                });

                if (atLeastOneWasFound) {
                    UI.SuccessMessage(
                        `${atLeastOneWasFound} ${twSDK.tt('supports selected')}`
                    );
                    setTimeout(function () {
                        jQuery('form#overview_form').submit();
                    }, 500);
                }
            });
        }

        // Action Handler: Fill units
        function handleFillUnits() {
            jQuery('#raSelectAmountOfUnitsBtn').on('click', function (e) {
                e.preventDefault();

                jQuery('.troop-request-selector-all').prop('checked', false);
                jQuery('.troop-request-selector-all').trigger('change');

                const isUnitAmountCallBackActive = jQuery(
                    '#raToggleCallBackMethod'
                ).is(':checked');
                const amount = +jQuery('#raAmountToCallBack').val();

                const chosenUnits = [];
                jQuery('.ra-unit-selector').each(function () {
                    if (jQuery(this).is(':checked')) {
                        chosenUnits.push(this.value);
                    }
                });

                localStorage.setItem(
                    `${scriptConfig.scriptData.prefix}_chosen_units`,
                    JSON.stringify(chosenUnits)
                );

                if (isUnitAmountCallBackActive) {
                    const villageUnitsTotals = getSingleVillageUnitTotals();
                    let unitAmounts = {};

                    jQuery('.ra-unit').each(function () {
                        const unitAmount = parseInt(jQuery(this).val());
                        const unitType = jQuery(this)
                            .attr('name')
                            .split('unit_')[1];
                        if (unitAmount > 0) {
                            unitAmounts = {
                                ...unitAmounts,
                                [unitType]: unitAmount,
                            };
                        }
                    });

                    let canCallBack = true;
                    for (let [key, value] of Object.entries(unitAmounts)) {
                        if (villageUnitsTotals[key] < value) {
                            canCallBack = false;
                        }
                    }

                    if (canCallBack) {
                        const ownDefRows = jQuery(
                            `.troop-request-selector[name^="withdraw_unit"]`
                        ).length;
                        const outsideDefRows = jQuery(
                            `.troop-request-selector[name^="send_back"]`
                        ).length;

                        let unitFieldAmounts = {};
                        chosenUnits.forEach((unit) => {
                            const unitFieldAmount = jQuery(
                                `.unit-item-${unit}`
                            ).not('.hidden').length;
                            unitFieldAmounts = {
                                ...unitFieldAmounts,
                                [unit]: unitFieldAmount,
                            };
                        });

                        jQuery(
                            '#withdraw_selected_units_village_info tbody tr'
                        ).each(function (_, tableRow) {
                            const isOwnSupport =
                                jQuery(tableRow).find('td:eq(0) a').length;
                            if (isOwnSupport === 1) {
                                jQuery(tableRow)
                                    .find('.troop-request-selector')
                                    .prop('checked', true);
                                jQuery(tableRow)
                                    .find('.troop-request-selector')
                                    .trigger('change');

                                jQuery(tableRow)
                                    .find('td.has-input')
                                    .not('.hidden')
                                    .each(function () {
                                        const unit = jQuery(this).attr('id');
                                        if (chosenUnits.includes(unit)) {
                                            jQuery(this)
                                                .find('.call-unit-box')
                                                .val(
                                                    Math.ceil(
                                                        unitAmounts[unit] /
                                                            (unitFieldAmounts[
                                                                unit
                                                            ] -
                                                                outsideDefRows)
                                                    )
                                                );
                                        } else {
                                            jQuery(this)
                                                .find('.call-unit-box')
                                                .val(0);
                                        }
                                    });
                            }
                        });
                    } else {
                        UI.ErrorMessage(twSDK.tt('Invalid input!'));
                    }
                } else {
                    if (!Number.isInteger(amount)) {
                        UI.ErrorMessage(twSDK.tt('Invalid amount!'));
                        jQuery('#raAmountToCallBack').val(0);
                        return;
                    }

                    if (amount < 0 || amount > 100 || amount === 0) {
                        UI.ErrorMessage(twSDK.tt('Invalid amount!'));
                        jQuery('#raAmountToCallBack').val(0);
                        return;
                    }

                    localStorage.setItem(
                        `${scriptConfig.scriptData.prefix}_amount`,
                        amount
                    );

                    jQuery(
                        '#withdraw_selected_units_village_info tbody tr'
                    ).each(function (_, tableRow) {
                        const isOwnSupport =
                            jQuery(tableRow).find('td:eq(0) a').length;
                        if (isOwnSupport === 1) {
                            jQuery(tableRow)
                                .find('.troop-request-selector')
                                .prop('checked', true);
                            jQuery(tableRow)
                                .find('.troop-request-selector')
                                .trigger('change');

                            jQuery(tableRow)
                                .find('td.has-input')
                                .not('.hidden')
                                .each(function () {
                                    const unit = jQuery(this).attr('id');
                                    if (chosenUnits.includes(unit)) {
                                        const unitAmount = parseInt(
                                            jQuery(this)
                                                .find('.call-unit-box')
                                                .val()
                                        );
                                        jQuery(this)
                                            .find('.call-unit-box')
                                            .val(
                                                Math.floor(
                                                    unitAmount * (amount / 100)
                                                )
                                            );
                                    } else {
                                        jQuery(this)
                                            .find('.call-unit-box')
                                            .val(0);
                                    }
                                });
                        }
                    });
                }

                selectionSideEffects();
            });
        }

        // Action Handler: Toggle call back method handler
        function handleCallBackMethod() {
            jQuery('#raToggleCallBackMethod').on('change', function (event) {
                const isChecked = jQuery('#raToggleCallBackMethod').is(
                    ':checked'
                );

                if (isChecked) {
                    jQuery('#raCallBackByPercentage').hide();
                    jQuery('#raCallBackByUnitAmounts').show();
                } else {
                    jQuery('#raCallBackByPercentage').show();
                    jQuery('#raCallBackByUnitAmounts').hide();
                }
            });
        }

        // Action Handler: Handle user changing the unit selected
        function handleUnitChoserToggle() {
            jQuery('.ra-unit-selector').on('change', function (event) {
                if (event.target.checked) {
                    jQuery(`.ra-unit-${event.target.value}`).prop(
                        'disabled',
                        false
                    );
                } else {
                    jQuery(`.ra-unit-${event.target.value}`).prop(
                        'disabled',
                        true
                    );
                }
            });
        }

        // Helper: Build the unit amount selector
        function buildUnitAmountSelector() {
            const storedChosenUnits = JSON.parse(
                localStorage.getItem(
                    `${scriptConfig.scriptData.prefix}_chosen_units`
                )
            ) ?? ['spear', 'sword'];

            let unitAmountHtml = `<table width="100%"><tbody><tr>`;

            game_data.units.forEach((unit) => {
                if (unit !== 'militia') {
                    unitAmountHtml += `
                    <td>
                        <input class="ra-unit ra-unit-${unit}" ${
                        !storedChosenUnits.includes(unit) ? 'disabled' : ''
                    } type="text" name="unit_${unit}">
                    </td>
                `;
                }
            });

            unitAmountHtml += `</tr></tbody></table>`;

            return unitAmountHtml;
        }

        // Helper: Handle side effects of select/deselecting a village
        function selectionSideEffects() {
            // update selected units amount
            const selectedUnitTotals = getSingleVillageUnitTotals('selected');
            const selectedUnitPop = calculatePop(selectedUnitTotals);
            let selectedUnitTotalsHtml = `<th>${twSDK.tt(
                'Selected Units'
            )}</th>`;
            for (let [_, value] of Object.entries(selectedUnitTotals)) {
                selectedUnitTotalsHtml += `
                    <th class="ra-tac ${value ? '' : 'hidden'}">
                        ${twSDK.formatAsNumber(value)}
                    </th>
                `;
            }
            selectedUnitTotalsHtml += `<th>${twSDK.formatAsNumber(
                selectedUnitPop
            )} ${twSDK.tt('pop')}</th></tr>`;
            jQuery('#raSelectedUnitsRow').html(selectedUnitTotalsHtml);

            // update remaining units amount
            const remainingUnitsAmount = getRemainingUnitsAmount();
            const remainingUnitsPop = calculatePop(remainingUnitsAmount);
            let remainingUnitsHtml = `<th>${twSDK.tt('Remaining Units')}</th>`;
            for (let [_, value] of Object.entries(remainingUnitsAmount)) {
                remainingUnitsHtml += `
                    <th class="ra-tac ${value ? '' : 'hidden'}">
                        ${twSDK.formatAsNumber(value)}
                    </th>
                `;
            }
            remainingUnitsHtml += `<th>${twSDK.formatAsNumber(
                remainingUnitsPop
            )} ${twSDK.tt('pop')}</th></tr>`;
            jQuery('#raRemainingUnitsRow').html(remainingUnitsHtml);
        }

        // Helper: Get amount of how many units will remain at a village
        function getRemainingUnitsAmount() {
            const totalUnitAmounts = [];
            const selectedUnitAmounts = [];
            let remainingUnitAmounts = {};

            jQuery('#raTotalUnitsRow th').each(function (index, element) {
                if (index !== 0 && jQuery(element).text().trim() !== '') {
                    totalUnitAmounts.push(
                        +jQuery(element)
                            .text()
                            .trim()
                            .replace(/.(?=\d{3})/g, '')
                    );
                }
            });

            jQuery('#raSelectedUnitsRow th').each(function (index, element) {
                if (index !== 0 && jQuery(element).text().trim() !== '') {
                    selectedUnitAmounts.push(
                        +jQuery(element)
                            .text()
                            .trim()
                            .replace(/.(?=\d{3})/g, '')
                    );
                }
            });

            game_data.units.forEach((unit, index) => {
                remainingUnitAmounts = {
                    ...remainingUnitAmounts,
                    [unit]:
                        totalUnitAmounts[index] - selectedUnitAmounts[index],
                };
            });

            return remainingUnitAmounts;
        }

        // Helper: Show total unit amounts on single village screen
        function showTotalUnitAmounts() {
            const villageUnitsTotals = getSingleVillageUnitTotals();
            const population = calculatePop(villageUnitsTotals);

            let newRowHtml = `<tr id="raTotalUnitsRow"><th>${twSDK.tt(
                'Total Units'
            )}</th>`;
            for (let [_, value] of Object.entries(villageUnitsTotals)) {
                newRowHtml += `
                    <th class="ra-tac ${value ? '' : 'hidden'}">
                        ${twSDK.formatAsNumber(value)}
                    </th>
                `;
            }
            newRowHtml += `<th>${twSDK.formatAsNumber(population)} ${twSDK.tt(
                'pop'
            )}</th></tr>`;

            newRowHtml += `
                <tr id="raSelectedUnitsRow">
                    <th>${twSDK.tt('Selected Units')}</th>
                    ${game_data.units.map((unit) => {
                        return `<th class="ra-tac hidden unit-item-${unit}">0</th>`;
                    })}
                    <th>0 ${twSDK.tt('pop')}</th>
                </tr>
            `;

            newRowHtml += `<tr id="raRemainingUnitsRow"><th>${twSDK.tt(
                'Remaining Units'
            )}</th>`;
            for (let [_, value] of Object.entries(villageUnitsTotals)) {
                newRowHtml += `
                    <th class="ra-tac ${value ? '' : 'hidden'}">
                        ${twSDK.formatAsNumber(value)}
                    </th>
                `;
            }
            newRowHtml += `<th>${twSDK.formatAsNumber(population)} ${twSDK.tt(
                'pop'
            )}</th></tr>`;

            jQuery('#withdraw_selected_units_village_info table tbody').append(
                newRowHtml
            );
        }

        // Helper: Get support troop totals on single village screen
        function getSingleVillageUnitTotals(typeOfCollect = 'initial') {
            let villageUnitsTotals = [];

            jQuery('#withdraw_selected_units_village_info tbody tr').each(
                function (index, element) {
                    if (index !== 0 && index !== 1) {
                        let villageUnits = {};
                        jQuery(element)
                            .find('td.unit-item')
                            .each(function (_, tableCell) {
                                if (typeOfCollect === 'initial') {
                                    const unit = jQuery(tableCell).attr('id');
                                    const amount = jQuery(tableCell)
                                        .text()
                                        .trim();

                                    villageUnits = {
                                        ...villageUnits,
                                        [unit]: parseInt(amount) ?? 0,
                                    };
                                }

                                if (typeOfCollect === 'selected') {
                                    const unit = jQuery(tableCell).attr('id');
                                    const amount = jQuery(tableCell)
                                        .find('input[type="number"')
                                        .val();

                                    villageUnits = {
                                        ...villageUnits,
                                        [unit]: parseInt(amount) || 0,
                                    };
                                }
                            });

                        villageUnitsTotals.push(villageUnits);
                    }
                }
            );

            villageUnitsTotals = villageUnitsTotals.filter(
                (item) => Object.keys(item).length !== 0
            );

            return getTotalHomeTroops(villageUnitsTotals);
        }

        // Helper: Get total home troops
        function getTotalHomeTroops(homeTroops) {
            let totalTroopsAtHome = {
                spear: 0,
                sword: 0,
                axe: 0,
                archer: 0,
                spy: 0,
                light: 0,
                marcher: 0,
                heavy: 0,
                ram: 0,
                catapult: 0,
                knight: 0,
                snob: 0,
                militia: 0,
            };

            for (const obj of homeTroops) {
                totalTroopsAtHome.spear += obj.spear;
                totalTroopsAtHome.sword += obj.sword;
                totalTroopsAtHome.axe += obj.axe;
                totalTroopsAtHome.archer += obj.archer;
                totalTroopsAtHome.spy += obj.spy;
                totalTroopsAtHome.light += obj.light;
                totalTroopsAtHome.marcher += obj.marcher;
                totalTroopsAtHome.heavy += obj.heavy;
                totalTroopsAtHome.ram += obj.ram;
                totalTroopsAtHome.catapult += obj.catapult;
                totalTroopsAtHome.knight += obj.knight;
                totalTroopsAtHome.snob += obj.snob;
                totalTroopsAtHome.militia += obj.militia;
            }

            // handle non-archer worlds
            if (!game_data.units.includes('archer')) {
                delete totalTroopsAtHome['archer'];
                delete totalTroopsAtHome['marcher'];
            }

            // handle non-paladin worlds
            if (!game_data.units.includes('knight')) {
                delete totalTroopsAtHome['knight'];
            }

            return totalTroopsAtHome;
        }

        // Helper: Build the table that shows village supports on map
        function buildMapVillagesTable(villages) {
            let mapVillagesTableHtml = `
                <table class="ra-table ra-table-v3" width="100%">
                    <thead>
                        <tr>
                            <th class="ra-tac">
                                ${twSDK.tt('Village')}
                            </th>
                            <th>
                                ${twSDK.tt('Population')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            villages.forEach((village) => {
                const { coordinate, pop } = village;
                const [x, y] = coordinate.split('|');

                mapVillagesTableHtml += `
                    <tr>
                        <td class="ra-tac">
                            <a href="javascript:TWMap.focus(${x}, ${y})">
                                ${coordinate}
                            </a>
                        </td>
                        <td>
                            ${twSDK.formatAsNumber(pop)}
                        </td>
                    </tr>
                `;
            });

            mapVillagesTableHtml += '</tbody></table>';

            return mapVillagesTableHtml;
        }

        // Helper: Fetch supports data
        async function fetchSupportsData() {
            const supportsUrl =
                game_data.link_base_pure +
                `overview_villages&mode=units&type=away_detail&group=${game_data.group_id}&page=-1&filter_villages=1`;

            UI.InfoMessage(twSDK.tt('Fetching support data ...'));

            try {
                const villageEffects = await jQuery
                    .get(supportsUrl)
                    .then((response) => {
                        const parser = new DOMParser();
                        const htmlDoc = parser.parseFromString(
                            response,
                            'text/html'
                        );

                        const tableRows = jQuery(htmlDoc).find('#units_table');
                        const data = calculateSupport(tableRows);
                        return data;
                    });

                return villageEffects;
            } catch (error) {
                UI.ErrorMessage(
                    twSDK.tt('There was an error fetching supports data!')
                );
                console.error(`${scriptInfo} Error: `, error);
            }
        }

        // Helper: Sort support by population
        function sortSupportByPop(support) {
            let sortedSupport = {};
            const sortedSupportArray = [];

            for (let [key, value] of Object.entries(support)) {
                sortedSupportArray.push({
                    type: key,
                    ...value,
                });
            }

            sortedSupportArray.sort((a, b) => {
                return b.pop - a.pop;
            });

            sortedSupportArray.forEach((supportData) => {
                const { type } = supportData;

                sortedSupport[type] = {
                    ...supportData,
                };
            });

            return sortedSupport;
        }

        // Helper: Build support table
        function buildSupportTable(support) {
            let supportTableHtml = ``;

            for (let [key, value] of Object.entries(support)) {
                if (value.pop) {
                    const { pop } = value;
                    switch (key) {
                        case 'own':
                            supportTableHtml += `
                                <div class="ra-support-counter-box">
                                    <h3 class="ra-support-counter-toggle">
                                        <b>
                                            ${twSDK.tt(
                                                'Support in your own villages'
                                            )} (${twSDK.formatAsNumber(
                                pop
                            )} ${twSDK.tt('population')})
                                        </b>
                                        <span class="ra-toggle-icon">
                                            <img src="/graphic/plus.png">
                                        </span>
                                    </h3>
                                    <div class="ra-player-support-table">
                                        ${buildTableData(value, key)}
                                    </div>
                                </div>
                            `;
                            break;
                        case 'barbs':
                            supportTableHtml += `
                                <div class="ra-support-counter-box">
                                    <h3 class="ra-support-counter-toggle">
                                        <b>
                                            ${twSDK.tt(
                                                'Support in barbarian villages'
                                            )}  (${twSDK.formatAsNumber(
                                pop
                            )} ${twSDK.tt('population')})
                                        </b>
                                        <span class="ra-toggle-icon">
                                            <img src="/graphic/plus.png">
                                        </span>
                                    </h3>
                                    <div class="ra-player-support-table">
                                        ${buildTableData(value, key)}
                                    </div>
                                </div>
                            `;
                            break;
                        case 'players':
                            supportTableHtml += `
                                <div class="ra-support-counter-box">
                                    <h3 class="ra-support-counter-toggle">
                                        <b>
                                            ${twSDK.tt(
                                                'Support in other players villages'
                                            )}  (${twSDK.formatAsNumber(
                                pop
                            )} ${twSDK.tt('population')})
                                        </b>
                                        <span class="ra-toggle-icon">
                                            <img src="/graphic/plus.png">
                                        </span>
                                    </h3>
                                    <div class="ra-player-support-table">
                                        ${buildTableData(value, key)}
                                    </div>
                                </div>
                            `;
                            break;
                        default:
                            return;
                    }
                }
            }

            return supportTableHtml;
        }

        // Helper: Build table of support by type
        function buildTableData(support, type) {
            let tableData = ``;

            if (type === 'own') {
                const { totalUnits, villages } = support;

                tableData = `
                    <table class="ra-table ra-table-v2 ra-main-table" width="100%"><tbody>
                `;

                tableData += `
                    <tr>
                        <td colspan="2">
                            ${buildVillagesTable(villages, totalUnits)}
                        </td>
                    </tr>
                `;

                tableData += '</tbody></table>';
            }

            if (type === 'players') {
                const { tribes } = support;

                const sortedTribes = sortSupportByPop(tribes);

                let tribesHtml = ``;
                for (let [key, value] of Object.entries(sortedTribes)) {
                    const sortedPlayers = sortSupportByPop(value.players);

                    tribesHtml += `
                        <div class="ra-mb5">
                            <table class="ra-table ra-table-v2 ra-tribe-table" width="100%">
                                <tbody>
                                    <tr>
                                        <th width="15%" class="ra-tac">
                                            ${
                                                key ||
                                                '<span class="ra-red">N/A</span>'
                                            } (${twSDK.formatAsNumber(
                        value.pop
                    )} ${twSDK.tt('pop')})
                                        </th>
                                        <td>
                                            ${buildTribeTroopTotals(
                                                value.totalUnits
                                            )}
                                            ${buildTribePlayersBoxes(
                                                sortedPlayers
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                tableData += `${tribesHtml}`;
            }

            if (type === 'barbs') {
                const { totalUnits, villages } = support;

                tableData = `
                    <table class="ra-table ra-table-v2 ra-main-table" width="100%"><tbody>
                `;

                tableData += `
                    <tr>
                        <td colspan="2">
                            ${buildVillagesTable(villages, totalUnits)}
                        </td>
                    </tr>
                `;

                tableData += '</tbody></table>';
            }

            return tableData;
        }

        // Helper: Build expandable tribe player boxes
        function buildTribePlayersBoxes(players) {
            let playerSupportHtml = ``;

            for (let [player, playerSupport] of Object.entries(players)) {
                const { pop } = playerSupport;

                playerSupportHtml += `
                    <div class="ra-support-counter-box">
                        <h3 class="ra-support-counter-toggle">
                            <b>
                                ${player} (${twSDK.formatAsNumber(
                    pop
                )} ${twSDK.tt('pop')})
                            </b>
                            <span class="ra-toggle-icon">
                                <img src="/graphic/plus.png">
                            </span>
                        </h3>
                        <div class="ra-player-support-table">
                            ${buildTableData(playerSupport, 'own')}
                        </div>
                    </div>
                `;
            }

            return playerSupportHtml;
        }

        // Helper: Build villages table
        function buildVillagesTable(villages, totalUnits) {
            const sortedVillages = sortSupportByPop(villages);

            let gameUnitsHtml = buildTableThUnits();

            let villagesTableHtml = `
                <table class="ra-table ra-table-v3 ra-villages-table" width="100%">
                    <thead>
                        <tr>
                            <th>
                                ${twSDK.tt('Village Name')}
                            </th>
                            ${gameUnitsHtml}
                            <th class="ra-tac">
                                ${twSDK.tt('Action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            for (let [key, value] of Object.entries(sortedVillages)) {
                const { units, pop, url } = value;

                villagesTableHtml += `
                    <tr>
                        <td width="33%">
                            <a href="${url}" target="_blank" rel="noreferrer" class="ra-village-link">
                                ${key}
                            </a>
                            (${twSDK.formatAsNumber(pop)} ${twSDK.tt('pop')})
                        </td>
                        ${buildUnits(units)}
                        <td width="10%" class="ra-tac">
                            <a href="javascript:void(0);" class="btn ra-btn-withdraw-support">
                                ${twSDK.tt('Withdraw')}
                            </a>
                        </td>
                    </tr>
                `;
            }

            villagesTableHtml += `
                </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                <b>${twSDK.tt('TOTAL')}<b>
                            </td>
                            ${buildUnits(totalUnits)}
                            <td>
                                <a href="javascript:void(0);" class="btn ra-btn-mass-withraw-support">
                                    ${twSDK.tt('Mass Withdraw')}
                                </a>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            `;

            return villagesTableHtml;
        }

        // Helper: Build the th for units with unit icon
        function buildTableThUnits() {
            let gameUnitsHtml = ``;

            game_data.units.forEach((unit) => {
                if (unit !== 'militia') {
                    gameUnitsHtml += `
                        <th class="ra-tac">
                            <img src="/graphic/unit/unit_${unit}.png">
                        </th>
                    `;
                }
            });

            return gameUnitsHtml;
        }

        // Helper: Build tribe total units
        function buildTribeTroopTotals(totalUnits, type = 'string') {
            let tribeTroopsHtml = ``;

            if (type === 'table') {
                let thCells = ``;
                let tdCells = ``;

                game_data.units.forEach((unit) => {
                    if (unit !== 'militia') {
                        thCells += `
                            <th class="ra-tac">
                                <img src="/graphic/unit/unit_${unit}.png">
                            </th>
                        `;

                        tdCells += `
                            <td class="ra-tac">
                                ${twSDK.formatAsNumber(totalUnits[unit])}
                            </td>
                        `;
                    }
                });

                tribeTroopsHtml = `
                    <div class="ra-mb5">
                        <table class="ra-table ra-table-v3" width="100%">
                            <thead>
                                <tr>
                                    ${thCells}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    ${tdCells}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }

            if (type === 'string') {
                tribeTroopsHtml += `<div class="ra-mb10"><b>${twSDK.tt(
                    'Total Units'
                )}</b>&nbsp;&nbsp;`;

                game_data.units.forEach((unit) => {
                    if (totalUnits[unit]) {
                        tribeTroopsHtml += `<span class="ra-mr15"><b>${unit}</b>: ${twSDK.formatAsNumber(
                            totalUnits[unit]
                        )}</span>`;
                    }
                });

                tribeTroopsHtml += `</div>`;
            }

            return tribeTroopsHtml;
        }

        // Helper: Build unit choser table
        function buildUnitsChoserTable() {
            const storedChosenUnits = JSON.parse(
                localStorage.getItem(
                    `${scriptConfig.scriptData.prefix}_chosen_units`
                )
            ) ?? ['spear', 'sword'];

            let unitsTable = ``;

            let thUnits = ``;
            let tableRow = ``;

            game_data.units.forEach((unit) => {
                if (unit !== 'militia') {
                    let checked = '';
                    if (storedChosenUnits.includes(unit)) {
                        checked = `checked`;
                    }

                    thUnits += `
                        <th class="ra-tac">
                            <label for="unit_${unit}">
                                <img src="/graphic/unit/unit_${unit}.png">
                            </label>
                        </th>
                    `;

                    tableRow += `
                        <td class="ra-tac">
                            <input name="ra_chosen_units" type="checkbox" ${checked} id="unit_${unit}" class="ra-unit-selector" value="${unit}" />
                        </td>
                    `;
                }
            });

            unitsTable = `
                <table class="ra-table ra-table-v3 ra-unit-picker-table" width="100%" id="raUnitSelector">
                    <thead>
                        <tr>
                            ${thUnits}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            ${tableRow}
                        </tr>
                    </tbody>
                </table>
            `;

            return unitsTable;
        }

        // Helper: Build units list from object
        function buildUnits(totalUnits) {
            let totalUnitsHtml = ``;

            for (let [key, value] of Object.entries(totalUnits)) {
                totalUnitsHtml += `
                <td class="ra-tac ${value ? '' : 'ra-hidden'}">
                    ${twSDK.formatAsNumber(value)}
                </td>
            `;
            }

            return totalUnitsHtml;
        }

        // Helper: Collect support
        // https://forum.tribalwars.net/index.php?threads/support-counter.286689/
        function calculateSupport(element) {
            const players = { totalUnits: {}, pop: 0, tribes: {} };
            const barbs = { totalUnits: {}, pop: 0, villages: {} };
            const own = { totalUnits: {}, pop: 0, villages: {} };

            const tableRows = element.find('tbody tr');

            tableRows.each((i, row) => {
                if (jQuery(row).hasClass('units_away')) {
                    return;
                }

                const rowData = jQuery(row).find('td').toArray();
                const { text, playerName, tribeName, villageUrl, villageName } =
                    parseVillageData(jQuery(rowData.shift()));

                if (!villageName) return;

                let tribe = null;
                let player = null;

                if (!playerName) {
                    player = isBarb(text) ? barbs : own;
                } else {
                    if (!players.tribes[tribeName]) {
                        players.tribes[tribeName] = {
                            totalUnits: {},
                            pop: 0,
                            players: {},
                        };
                    }

                    tribe = players.tribes[tribeName];

                    if (!tribe.players[playerName]) {
                        tribe.players[playerName] = {
                            totalUnits: {},
                            pop: 0,
                            villages: {},
                        };
                    }

                    player = tribe.players[playerName];
                }

                if (!player.villages[villageName]) {
                    player.villages[villageName] = {
                        units: {},
                        pop: 0,
                        url: villageUrl,
                    };
                }

                village = player.villages[villageName];

                //units
                for (let i = 1; i < rowData.length - 1; i++) {
                    const unitName = game_data.units[i - 1];
                    const unitCount = parseInt(jQuery(rowData[i]).text());
                    const unitPopAmount =
                        unitName !== 'heavy'
                            ? twSDK.unitsFarmSpace[unitName]
                            : hcPopAmount;
                    const unitPop = unitCount * unitPopAmount;

                    if (!player.totalUnits[unitName]) {
                        player.totalUnits[unitName] = 0;
                    }

                    if (!village.units[unitName]) {
                        village.units[unitName] = 0;
                    }

                    player.totalUnits[unitName] += unitCount;
                    player.pop += unitPop;
                    village.units[unitName] += unitCount;
                    village.pop += unitPop;

                    if (tribe) {
                        if (!players.totalUnits[unitName]) {
                            players.totalUnits[unitName] = 0;
                        }
                        if (!tribe.totalUnits[unitName]) {
                            tribe.totalUnits[unitName] = 0;
                        }
                        players.totalUnits[unitName] += unitCount;
                        tribe.totalUnits[unitName] += unitCount;
                        tribe.pop += unitPop;
                        players.pop += unitPop;
                    }
                }
            });

            return { players, own, barbs };
        }

        // Helper: Collect village info
        function parseVillageData(villageData) {
            if (villageData.length === 0) return {};

            const village = jQuery(villageData)
                .find('span.village_anchor > a')
                .first();

            const checkboxName = jQuery(villageData)
                .find('input[type=checkbox]')
                .attr('name');
            const spanId = 'label_text_' + checkboxName.match(/(\d)+/)[0];
            const [player, tribe] = jQuery(
                villageData.find(`#${spanId} > a`)
            ).toArray();

            return {
                text: villageData.text(),
                playerName: jQuery(player).text(),
                tribeName: jQuery(tribe).text(),
                villageUrl: jQuery(village).attr('href'),
                villageName: jQuery(village).text(),
            };
        }

        // Helper: Extract list of villages and support on each village
        function extractCoordinatesAndSupport(supports) {
            const villagesData = [];

            for (let [, value] of Object.entries(supports)) {
                const { tribes, villages } = value;

                if (tribes) {
                    for (let [, tribe] of Object.entries(tribes)) {
                        const { players } = tribe;
                        for (let [, player] of Object.entries(players)) {
                            const { villages } = player;
                            for (let [villageName, village] of Object.entries(
                                villages
                            )) {
                                const coordinate = villageName.match(
                                    twSDK.coordsRegex
                                )[0];
                                villagesData.push({
                                    coordinate: coordinate,
                                    pop: village.pop,
                                });
                            }
                        }
                    }
                }

                if (villages) {
                    for (let [villageName, village] of Object.entries(
                        villages
                    )) {
                        const coordinate = villageName.match(
                            twSDK.coordsRegex
                        )[0];
                        villagesData.push({
                            coordinate: coordinate,
                            pop: village.pop,
                        });
                    }
                }
            }

            villagesData.sort((a, b) => b.pop - a.pop);

            return villagesData;
        }

        // Helper: Update the map UI
        function updateMap(villages) {
            const villageCoords = villages.map((village) => village.coordinate);
            // Show wall level of barbarian villages on the Map
            if (mapOverlay.mapHandler._spawnSector) {
                //exists already, don't recreate
            } else {
                //doesn't exist yet
                mapOverlay.mapHandler._spawnSector =
                    mapOverlay.mapHandler.spawnSector;
            }

            TWMap.mapHandler.spawnSector = function (data, sector) {
                // Override Map Sector Spawn
                mapOverlay.mapHandler._spawnSector(data, sector);
                var beginX = sector.x - data.x;
                var endX = beginX + mapOverlay.mapSubSectorSize;
                var beginY = sector.y - data.y;
                var endY = beginY + mapOverlay.mapSubSectorSize;
                for (var x in data.tiles) {
                    var x = parseInt(x, 10);
                    if (x < beginX || x >= endX) {
                        continue;
                    }
                    for (var y in data.tiles[x]) {
                        var y = parseInt(y, 10);

                        if (y < beginY || y >= endY) {
                            continue;
                        }
                        var xCoord = data.x + x;
                        var yCoord = data.y + y;
                        var v = mapOverlay.villages[xCoord * 1000 + yCoord];
                        if (v) {
                            var vXY = '' + v.xy;
                            var vCoords =
                                vXY.slice(0, 3) + '|' + vXY.slice(3, 6);
                            if (villageCoords.includes(vCoords)) {
                                const currentVillage = villages.find(
                                    (obj) => obj.coordinate == vCoords
                                );

                                const villageDef = intToString(
                                    currentVillage.pop
                                );

                                const eleDIV = $('<div></div>')
                                    .css({
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '2px',
                                        padding: '1px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        color: '#fff',
                                        width: '50px',
                                        height: '35px',
                                        zIndex: '10',
                                        fontSize: '10px',
                                    })
                                    .attr('id', 'dsm' + v.id)
                                    .html(villageDef);

                                sector.appendElement(
                                    eleDIV[0],
                                    data.x + x - sector.x,
                                    data.y + y - sector.y
                                );
                            }
                        }
                    }
                }
            };

            mapOverlay.reload();
        }

        // Helper: Calculate total pop
        function calculatePop(units) {
            let total = 0;

            for (let [key, value] of Object.entries(units)) {
                if (value) {
                    const unitPopAmount =
                        key !== 'heavy'
                            ? twSDK.unitsFarmSpace[key]
                            : hcPopAmount;
                    total += unitPopAmount * value;
                }
            }

            return total;
        }

        // Helper: Convert 1000 to 1k
        // https://www.html-code-generator.com/javascript/shorten-long-numbers
        function intToString(num) {
            num = num.toString().replace(/[^0-9.]/g, '');
            if (num < 1000) {
                return num;
            }
            let si = [
                { v: 1e3, s: 'K' },
                { v: 1e6, s: 'M' },
                { v: 1e9, s: 'B' },
                { v: 1e12, s: 'T' },
                { v: 1e15, s: 'P' },
                { v: 1e18, s: 'E' },
            ];
            let index;
            for (index = si.length - 1; index > 0; index--) {
                if (num >= si[index].v) {
                    break;
                }
            }
            return (
                (num / si[index].v)
                    .toFixed(2)
                    .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[index].s
            );
        }

        // Helper: Check if the village is a barbarian village
        function isBarb(text) {
            return text.search('(---)') !== -1;
        }
    }
);
