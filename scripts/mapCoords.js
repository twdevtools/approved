$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.8/twkit.js', dataType: 'script', cache: true }).then(() => {
    const page = game_data.screen === 'map';
    if (!page) return TWK.redirect('map', 'Redirecionando para o mapa...');

    const KEY = `twMapCoords_${game_data.world}`;
    const COLOR = '#ffffff';
    const SEPARATORS = { line: '\n', space: ' ', comma: ',' };

    const picked = TWK.store.get(KEY, []);

    const $panel = TWK.panel({
        id: 'mc-panel',
        title: 'Coordenadas no Mapa',
        sub: 'Clique nas aldeias para coletar',
        icon: TWK.ICON.pin,
        width: 340,
        onClose: () => {
            TWMap.mapHandler.onClick = TWMap.mapHandler.mcClick;
            TWMap.mapHandler.spawnSector = TWMap.mapHandler.mcSpawn;
            TWMap.minimapHandler.loadSector = TWMap.minimapHandler.mcLoad;
            TWMap.reload();
        },
        css: `
            #mc-panel .mc-label { display: flex; justify-content: space-between; color: var(--muted); font-size: 11px; }
            #mc-panel .mc-count { color: var(--text); font-weight: 600; }
            #mc-panel .mc-output { height: 120px; }
            #mc-panel .mc-actions .twk-btn { flex: 1; }
        `,
        body: `
            <select class="mc-sep">
                <option value="line">Uma por linha</option>
                <option value="space">Separar por espaço</option>
                <option value="comma">Separar por vírgula</option>
            </select>
            <div class="twk-field">
                <div class="mc-label">Coordenadas <span class="mc-count">0</span></div>
                <textarea class="mc-output" readonly placeholder="Clique nas aldeias do mapa"></textarea>
            </div>
            <div class="twk-row mc-actions">
                <button class="twk-btn mc-clear">${TWK.ICON.clear}Limpar</button>
                <button class="twk-btn twk-primary mc-copy">${TWK.ICON.copy}Copiar</button>
            </div>
        `,
    });

    const $output = $panel.find('.mc-output');
    const $sep = $panel.find('.mc-sep');

    const show = () => {
        $output.val(picked.join(SEPARATORS[$sep.val()]));
        $panel.find('.mc-count').text(picked.length);
        $panel.find('.mc-copy, .mc-clear').prop('disabled', !picked.length);
    };

    const save = () => {
        TWK.store.set(KEY, picked);
        show();
        TWMap.reload();
    };

    const toggle = coord => {
        const index = picked.indexOf(coord);
        if (index >= 0) picked.splice(index, 1);
        else picked.push(coord);
        save();
    };

    const mark = sector => {
        const span = sector._map.sectorSize;
        const [width, height] = sector._map.scale;
        const mini = sector._map === TWMap.minimap;
        const look = mini ? { background: COLOR, zIndex: 10 } : { border: `3px solid ${COLOR}`, outline: '1px solid #000', background: `${COLOR}73`, zIndex: 5 };
        picked.map(coord => coord.split('|').map(Number))
            .filter(([x, y]) => x >= sector.x && x < sector.x + span && y >= sector.y && y < sector.y + span)
            .forEach(([x, y]) => {
                const $el = $('<div>').css({
                    position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', width, height, ...look,
                });
                sector.appendElement($el[0], x - sector.x, y - sector.y);
            });
    };

    TWMap.mapHandler.mcClick ??= TWMap.mapHandler.onClick;
    TWMap.mapHandler.mcSpawn ??= TWMap.mapHandler.spawnSector;
    TWMap.minimapHandler.mcLoad ??= TWMap.minimapHandler.loadSector;
    TWMap.mapHandler.onClick = function (x, y, event) {
        const village = TWMap.villages[x * 1000 + y];
        if (!village) return TWMap.mapHandler.mcClick.call(this, x, y, event);
        toggle(`${x}|${y}`);
        return false;
    };
    TWMap.mapHandler.spawnSector = function (info, sector) {
        TWMap.mapHandler.mcSpawn.call(this, info, sector);
        mark(sector);
    };
    TWMap.minimapHandler.loadSector = function (sector) {
        TWMap.minimapHandler.mcLoad.call(this, sector);
        mark(sector);
    };

    $panel.on('click', '.mc-copy', () => TWK.copy($output.val(), TWK.plural(picked.length, 'coordenada copiada', 'coordenadas copiadas')));
    $panel.on('click', '.mc-clear', () => {
        picked.length = 0;
        save();
    });
    $sep.on('change', show);

    show();
    TWMap.reload();
});
