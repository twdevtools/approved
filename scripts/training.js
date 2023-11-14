/*
 * Script Name: KNIGHT TRAINING
 * Version: v1.1
 * Last Updated: 2023-11-13
 * Author: K I N G S
 * Author Contact: +55 48-98824-2773
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

 if (window.location.href.includes('statue&mode=overview')) {
	let $html = `<h3 align="center">Knight Training</h3>
    <div class="info_box">
        <div class="content">Choose training option:</div>
    </div>
    <table width="100%">
        <tbody>`;

		BuildingStatue.knights[Object.keys(BuildingStatue.knights)[0]].usable_regimens.forEach(function (el, i) {
    	      	
			if (i % 2 === 0) $html += '<tr>';
        	
        	$html += `
                <td>
                    <div class="time">
                        <input type="radio" name="train-knights" value="${i}">
                        <span style="margin-bottom: 1px" class="icon header time"></span>${String(
                            Math.floor(
                                el.duration / 3600
                            )
                        ).padStart(2, '0')}:${String(
                            Math.floor(
                                (el.duration % 3600) / 60
                            )
                        ).padStart(2, '0')}:${String(
                            Math.floor(el.duration % 60)
                        ).padStart(2, '0')}
                    </div>
                </td>`;

       		if (i % 2 !== 0 || i === 4) $html += '</tr>';
    	}
	);

	$html += `
        </tbody>
    </table>
    <div style="padding-top: 4px">
        <input type="button" id="start" class="btn" value="Start Training">
        <input type="button" id="save" class="btn" value="Save Options">
    </div>
    <br>
    <small>
        <strong>
            Knight Training v1.1 by<span style="color: red"> K I N G S </span>
        </strong>
    </small>`;

	Dialog.show('Knights', $html);
	let val = Number(localStorage.getItem('Statue'));

	$(`input[value="${val === undefined ? 0 : val}"]`).prop('checked', true);

	$('#save').on('click', function () {
		localStorage.setItem('Statue', $('input[type="radio"]:checked').val());
		UI.SuccessMessage(
			'The settings have been saved successfully.'
		);
	});

	$('#start').on('click', function (e) {
		e.preventDefault();
		val = Number($('input[type="radio"]:checked').val());
		Dialog.close();
		Object.keys(BuildingStatue.knights).forEach((i, el) => {
			setTimeout(function () {
				TribalWars.post(
					game_data.link_base.replace('amp;screen=', '') +
						'screen=statue&ajaxaction=regimen',
					null,
					{
						knight: BuildingStatue.knights[i].id,
						regimen: BuildingStatue.knights[i].usable_regimens[val].id,
					},
					function () {
						UI.SuccessMessage(_('386e303de70e5a2ff1b5cabefb0666f5'));
					},
					function (r) {
						console.error(r);
					}
				);
			}, el * 250);
		});
	});
} else
	UI.InfoMessage('Redirecting...'),
		(window.location.href = game_data.link_base_pure + 'statue&mode=overview');
