/*
 * Script Name: KNIGHT TRAINING
 * Version: v1
 * Last Updated: 2023-11-10
 * Author: K I N G S
 * Author Contact: 48-98824-2773
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

if (window.location.href.includes('statue&mode=overview')) {
	const $html = `<h3 align="center">Knight Training</h3>
	<div>
		<div class="info_box">
			<div class="content">Choose training option:</div>
		</div>
		<table width="100%">
			<tbody>
				<tr>
					<th style="text-align: center">(1)<br>
						<input type="radio" name="train-knights" value="0"> 
					</th>
					<th style="text-align: center">(2)<br>
						<input type="radio" name="train-knights" value="1"> 
					</th>
					<th style="text-align: center">(3)<br>
						<input type="radio" name="train-knights" value="2"> 
					</th>
					<th style="text-align: center">(4)<br>
						<input type="radio" name="train-knights" value="3"> 
					</th>
					<th style="text-align: center">(5)<br>
						<input type="radio" name="train-knights" value="4"> 
					</th>
				</tr>
			</tbody>
		</table>
	</div>
	<div style="padding-top: 4px">
		<input type="button" class="btn" value="Start">
		<input type="button" class="btn" value="Save">
	</div>
	<br>
	<small>
		<strong>
			Knight Training v.1 by<span style="color: red"> K I N G S </span>
		</strong>
	</small>`;

	Dialog.show('Knights', $html);
	let val = Number(localStorage.getItem('Statue'));

	val || val === 0
		? $(`input[value="${val}"]`).prop('checked', true)
	: (val = 0);

	$('input[value="Save"]').on('click', function () {
		localStorage.setItem('Statue', $('input[type="radio"]:checked').val());
		val = Number(localStorage.getItem('Statue'));
		UI.SuccessMessage(
			'The settings have been saved successfully.'
		);
	});

	$('input[value="Start"]').on('click', function () {
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
