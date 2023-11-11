/*
 * Script Name: KNIGHT TRAINING
 * Version: v1
 * Last Updated: 2023-11-11
 * Author: K I N G S
 * Author Contact: +55 48-98824-2773
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

if (window.location.href.includes('statue&mode=overview')) {
	const $html = `<h3 align="center">Knight Training</h3>
	<div class="info_box">
		<div class="content">Choose training option:</div>
	</div>
	<table width="100%">
		<tbody>
			<tr>
				<td>
					<div class="time">
						<input type="radio" name="train-knights" value="0"><span style="margin-bottom: 1px" class="icon header time"></span>3:20:00
					</div>
				</td>
				<td>
					<div class="time">
						<input type="radio" name="train-knights" value="1"><span style="margin-bottom: 1px" class="icon header time"></span>6:40:00
					</div>
				</td>
			</tr>
			<tr>
				<td>
					<div class="time">
						<input type="radio" name="train-knights" value="2"><span style="margin-bottom: 1px" class="icon header time"></span>13:20:00
					</div>
				</td>
				<td>
					<div class="time">
						<input type="radio" name="train-knights" value="3"><span style="margin-bottom: 1px" class="icon header time"></span>20:00:00
					</div>
				</td>
			</tr>
			<tr>
				<td>
					<div class="time">
						<input type="radio" name="train-knights" value="4"><span style="margin-bottom: 1px" class="icon header time"></span>40:00:00
					</div>
				</td>
			</tr>
		</tbody>
	</table>
	<div style="padding-top: 4px">
		<input type="button" id="start" class="btn" value="Start Training">
		<input type="button" id="save" class="btn" value="Save Options">
	</div>
	<br>
	<small>
		<strong>
			Knight Training v1 by<span style="color: red"> K I N G S </span>
		</strong>
	</small>`;

	Dialog.show('Knight', $html);
	let val = Number(localStorage.getItem('Statue'));

	if (val === undefined) val = 0;

	$(`input[value="${val}"]`).prop('checked', true);

	$('#save').on('click', function () {
		localStorage.setItem('Statue', $('input[type="radio"]:checked').val());
		val = Number(localStorage.getItem('Statue')); UI.SuccessMessage(
			'The settings have been saved successfully.'
		);
	});

	$('#start').on('click', function (e) {
		e.preventDefault();
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
