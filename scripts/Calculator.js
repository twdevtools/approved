const $html = `<h3 align="center">Calculator</h3>
<div class="info_box">
    <div class="content">...</div>
</div>
<table width="100%">
    <tbody>
        <tr>
            <th></th>
            <th style="text-align: center">CANCEL</th>
            <th style="text-align: center">RETURN</th>
            <th style="text-align: center">BACKTIME</th>
        </tr>
        <tr>
            <th>
                <img src="https://dsbr.innogamescdn.com/asset/91e46e1a/graphic/unit/unit_snob.png">
            </th>
            <td>
                <input type="text" id="noble" style="width: 54px" placeholder="00:00:00">
            </td>
            <td>
                <input type="text" id="return" style="width: 54px" placeholder="00:00:00">
            </td>
            <td>
                <input type="text" id="backtime" style="width: 66px" placeholder="00:00:00">
            </td>
        </tr>
        <tr>
            <th>
                <img src="https://dsbr.innogamescdn.com/asset/91e46e1a/graphic/command/support.png">
            </th>
            <td>
                <input type="text" id="support" style="width: 54px" placeholder="00:00:00">
            </td>
            <td>
                <input type="text" id="return" style="width: 54px" placeholder="00:00:00">
            </td>
            <td>
                <input type="text" id="backtime" style="width: 66px" placeholder="00:00:00">
            </td>
        </tr>
    </tbody>
</table>
<div style="margin-top: 4px; margin-bottom: 4px">
    <input type="button" id="start" class="btn" value="Calculate Times">
</div>
`;

Dialog.show('Calculator', $html);

$('#start').on('click', function (e) {
	e.preventDefault();

	let i = [
		...$('#noble').val().split(':').map(Number),
		...$('#support').val().split(':').map(Number),
		...$('#serverTime').text().split(':').map(Number),
	];

	i = {
		n: i[0] * 3600 + i[1] * 60 + i[2],

		s: i[3] * 3600 + i[4] * 60 + i[5],

		t: i[6] * 3600 + i[7] * 60 + i[8],
	};

	$('.popup_box_content').append(
	`<div>
        <table width="100%">
            <tbody>
                <tr>
                    <th style="text-align: center">Cancel at:</th>
                    <th style="text-align: center">Arrives at:</th>
                    <th style="text-align: center">Copy:</th>
                </tr>
                <tr>
                    <td align="center">
                        <div class="time">
                            <span class="icon header time"></span>${String(
                                Math.floor((i.n - i.s) / 2 / 3600)
                            ).padStart(2, '0')}:${String(
                                Math.floor((((i.n - i.s) / 2) % 3600) / 60)
                            ).padStart(2, '0')}:${String(Math.floor((i.n - i.s) / 2) % 60).padStart(
                                2,'0'
                            )}
                        </div>
                    </td>
                    <td align="center">
                        <div class="time">
                            <span class="icon header time"></span>${String(
                                Math.floor((i.n - i.t) / 2 / 3600)
                            ).padStart(2, '0')}:${String(
                                Math.floor((((i.n - i.t) / 2) % 3600) / 60)
                            ).padStart(2, '0')}:${String(Math.floor((i.n - i.t) / 2) % 60).padStart(2, '0')}
                        </div>
                    </td>
                    <td align="center">
                        <input type="button" class="btn" value="Copy">
                    </td>
                </tr>
            </tbody>
        </table>
    </div>`
	);
});
