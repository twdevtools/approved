$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.0.0/twkit.js', dataType: 'script', cache: true }).then(async () => {
    const KEY = `twTroopCounter_${game_data.world}`;
    const ROWS = '#units_table tbody.row_marker';
    const TYPES = [
        ['Disponível', [[0, 1]]],
        ['Todas as Suas Próprias', [[0, 1], [2, 1], [3, 1]]],
        ['Nas Aldeias', [[1, 1]]],
        ['Apoios', [[1, 1], [0, -1]]],
        ['Fora', [[2, 1]]],
        ['Em Trânsito', [[3, 1]]],
    ];

    const $panel = TWK.panel({
        id: 'tc-panel',
        title: 'Contador de Tropas',
        sub: 'Soma das tropas de todas as aldeias',
        icon: TWK.ICON.chart,
        width: 340,
        css: `
            #tc-panel .tc-units { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
            #tc-panel .tc-units .twk-loading { grid-column: 1 / -1; min-height: 174px; padding: 0; }
            #tc-panel .tc-unit {
                height: 30px; padding: 0 10px; display: flex; align-items: center; gap: 8px;
                background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
            }
            #tc-panel .tc-unit img { width: 18px; height: 18px; flex: none; }
            #tc-panel .tc-unit b { flex: 1; text-align: right; font-weight: 600; }
            #tc-panel .tc-unit.tc-zero b { color: var(--muted); font-weight: 400; }
        `,
        body: `
            <div class="twk-grid">
                <label class="twk-field"><span class="twk-label">Grupo</span><select class="tc-group" disabled><option>Carregando...</option></select></label>
                <label class="twk-field"><span class="twk-label">Tipo</span><select class="tc-type">${TYPES.map(([name], i) => `<option value="${i}">${name}</option>`).join('')}</select></label>
            </div>
            <div class="tc-units"></div>
            <div class="twk-foot">
                <span class="tc-count"></span>
                <button class="twk-btn twk-primary tc-copy">${TWK.ICON.copy}Copiar BBCode</button>
            </div>
        `,
    });

    const $group = $panel.find('.tc-group');
    const $type = $panel.find('.tc-type');
    const $units = $panel.find('.tc-units');
    const $count = $panel.find('.tc-count');
    const $controls = $panel.find('select, .tc-copy');

    const saved = TWK.store.get(KEY, {});
    let state = { cols: [], villages: new Map() };

    const save = () => TWK.store.set(KEY, { group: $group.val(), type: $type.val() });

    const columns = $doc => $doc.find('#units_table thead img').get()
        .map(img => ({ unit: img.getAttribute('src').match(/unit_(\w+)\./)[1], src: img.getAttribute('src') }));

    const villages = $doc => $doc.find(ROWS).get().map(tbody => [
        $(tbody).find('.quickedit-vn').attr('data-id'),
        $(tbody).children('tr').get().map(tr => $(tr).children('.unit-item').get().map(td => +td.textContent || 0)),
    ]);

    const groups = $doc => $doc.find('.vis_item .group-menu-item[data-group-id]').get()
        .map(el => [el.getAttribute('data-group-id'), $.trim(el.textContent).replace(/^[[>]|[\]<]$/g, '').trim()]);

    const totals = () => {
        const parts = TYPES[$type.val()][1];
        const rows = [...state.villages.values()];
        return state.cols
            .map((col, c) => ({ ...col, amount: rows.reduce((sum, row) => sum + parts.reduce((acc, [i, sign]) => acc + sign * (row[i]?.[c] || 0), 0), 0) }))
            .filter(col => col.unit !== 'militia');
    };

    const busy = text => {
        $units.html(TWK.loading(text));
        $count.text('');
    };

    const render = () => {
        $units.html(totals().map(col => `<div class="tc-unit${col.amount ? '' : ' tc-zero'}"><img src="${col.src}" alt="${col.unit}"><b class="twk-mono">${TWK.format(col.amount)}</b></div>`).join(''));
        $count.text(TWK.plural(state.villages.size, 'aldeia', 'aldeias'));
    };

    const load = async group => {
        $controls.prop('disabled', true);
        busy('Carregando aldeias...');
        const docs = await TWK.pages(`overview_villages&mode=units&type=complete&group=${group}`, {
            rows: ROWS,
            progress: (page, total) => busy(`Carregando página ${page} de ${total}...`),
        });
        state = { cols: columns(docs[0]), villages: new Map(docs.flatMap(villages)) };
        $controls.prop('disabled', false);
        render();
        return docs[0];
    };

    const copy = () => TWK.copy(totals().filter(col => col.amount).map(col => `[unit]${col.unit}[/unit] ${col.amount}`).join('\n'), 'BBCode copiado');

    $group.on('change', () => {
        save();
        load($group.val());
    });
    $type.on('change', () => {
        save();
        render();
    });
    $panel.on('click', '.tc-copy', copy);

    $type.val(saved.type || 0);
    const $doc = await load(saved.group || 0);
    $group.html(groups($doc).map(([id, name]) => `<option value="${id}">${id === '0' ? 'Todas' : name}</option>`).join(''));
    $group.val($group.find(`option[value="${saved.group}"]`).length ? saved.group : '0');
});
