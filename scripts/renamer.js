/*
 * Script Name: RENAME VILLAGES
 * Version: v1.2
 * Last Updated: 2023-11-12
 * Author: K I N G S
 * Author Contact: +55 48-98824-2773
 * Approved Date: 2023-10-25
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

if (window.location.href.includes('screen=overview_villages')) {
	const $html = `<h3 align="center">Renamer</h3>
	<div>
		<div class="info_box">
			<div class="content" style="margin-left: 4px">
				<b>1 -</b> Example 1, starting with 001.<br>
				<b>2 -</b> Example 3, starting with 3 digits.
			</div>
		</div>
		<input id="firstbox" type="checkbox">
		<input id="start" type="text" placeholder="1" size="1">
		<input id="end" type="text" placeholder="3" size="1">
	</div>
	<div style="margin-top: 4px">
		<input id="secondbox" type="checkbox">
		<input id="textname" type="text" placeholder="Your text here" maxlength="32">
	</div>
	<div style="padding-top: 8px;">
		<input id="rename" type="button" class="btn" value="Rename Villages">
		<input id="save" type="button" class="btn" value="Save Options">
	</div>
	<br>
	<div>
		<small>
			<strong>Rename Villages v1.2 by<span style="color: red;"> K I N G S </span></strong>
		</small>
	</div>`;

	Dialog.show('rename', $html);
	let set = localStorage.getItem('set');

	if (set) {
		set = JSON.parse(set);
		$('#firstbox').prop('checked', set.firstbox);
		$('#start').val(set.start);
		$('#end').val(set.end);
		$('#secondbox').prop('checked', set.secondbox);
		$('#textname').val(set.textname);
	}

	$('#save').on('click', () => {
		set = {
			firstbox: $('#firstbox').prop('checked'),
			start: $('#start').val(),
			end: $('#end').val(),
			secondbox: $('#secondbox').prop('checked'),
			textname: $('#textname').val(),
		};

		localStorage.setItem('set', JSON.stringify(set));

		UI.SuccessMessage('The settings have been saved successfully.');
	});

	$('#rename').on('click', function (s) {
		s.preventDefault();
		let n, e;

		if ($('#firstbox').prop('checked')) {
			n = Number($('#start').val());
			e = Number($('#end').val());
		}

		const a = $('#secondbox').prop('checked') ? $('#textname').val() : '';
		const total = game_data.player.villages;

		Dialog.close();

		$('.rename-icon').each(function (i) {
			let $this = this;
			setTimeout(function () {
				$($this).click();
				$('.vis input[type="text"]').val(
					`${n && e !== undefined ? String(n + i).padStart(e, '0') : ''} ${a}`
				);
				$('input[type="button"]').click();
				UI.SuccessMessage(' Success: ' + (i + 1) + '/' + total);
			}, i * 200);
		});
	});
} else
	UI.InfoMessage('Redirecting...'),
		(window.location.href =
			game_data.link_base_pure + 'overview_villages&mode=combined&group=0');
