$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.0/twkit.js', dataType: 'script', cache: true }).then(() => {
    const KEY = `twSupportMap_${game_data.world}`;
    const PATH = 'overview_villages&mode=units&type=away_detail&filter_villages=1&group=0';
    const RX_COORD = /\((\d+)\|(\d+)\)\s*K\d+\s*$/;
    const POP = { spear: 1, sword: 1, axe: 1, archer: 1, spy: 2, light: 4, marcher: 5, heavy: 6, ram: 5, catapult: 8, knight: 10, snob: 100 };
    const ALL = '';
    const NONE = '0';

    let data = TWK.store.get(KEY);
    let reading = false;

    const $panel = TWK.panel({
        id: 'sm-panel',
        title: 'Apoios Enviados',
        sub: 'Aldeias que você está apoiando',
        icon: TWK.ICON.target,
        width: 940,
        actions: `<button class="twk-icon sm-refresh" title="Atualizar">${TWK.ICON.refresh}</button>`,
        onClose: () => {
            reading = false;
        },
        css: `
            #sm-panel .twk-body { padding: 0; gap: 0; max-height: none; overflow: visible; }
            #sm-panel .sm-content { height: min(620px, 72vh); display: flex; flex-direction: column; }
            #sm-panel .sm-content > .twk-loading, #sm-panel .sm-content > .twk-idle { flex: 1; }
            #sm-panel .sm-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid var(--line); }
            #sm-panel .sm-stat { padding: 12px 16px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--line); }
            #sm-panel .sm-stat:last-child { border-right: 0; }
            #sm-panel .sm-stat span { color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #sm-panel .sm-stat b { font-size: 16px; font-weight: 600; }
            #sm-panel .sm-main { flex: 1; min-height: 0; display: grid; grid-template-columns: 250px 1fr; }
            #sm-panel .sm-side { min-height: 0; padding: 16px; display: flex; flex-direction: column; gap: 14px; border-right: 1px solid var(--line); }
            #sm-panel .sm-area { min-width: 0; min-height: 0; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
            #sm-panel .sm-players { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 2px; margin: 0 -6px; padding: 0 6px; }
            #sm-panel .sm-player {
                width: 100%; padding: 8px 10px; display: flex; align-items: center; gap: 10px; text-align: left;
                background: none; border: 1px solid transparent; border-radius: 6px; cursor: pointer;
            }
            #sm-panel .sm-player:hover { background: var(--surface); }
            #sm-panel .sm-player.sm-active { background: var(--surface); border-color: var(--accent); }
            #sm-panel .sm-player div { flex: 1; min-width: 0; display: flex; flex-direction: column; }
            #sm-panel .sm-player div span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            #sm-panel .sm-player div small { color: var(--muted); font-size: 11px; }
            #sm-panel .sm-player > b { flex: none; min-width: 28px; padding: 1px 6px; border-radius: 10px; background: var(--hover); color: var(--muted); font-size: 11px; text-align: center; }
            #sm-panel .sm-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            #sm-panel .sm-table { flex: 1; min-height: 0; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
            #sm-panel .sm-head, #sm-panel .sm-row, #sm-panel .sm-foot { display: grid; grid-template-columns: var(--cols); align-items: center; gap: 16px; padding: 0 16px; }
            #sm-panel .sm-head { height: 38px; flex: none; background: var(--surface); border-bottom: 1px solid var(--line); color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #sm-panel .sm-head img { width: 18px; height: 18px; justify-self: end; }
            #sm-panel .sm-body { flex: 1; min-height: 0; overflow: auto; }
            #sm-panel .sm-row { height: 40px; border-bottom: 1px solid var(--line); }
            #sm-panel .sm-row:last-child { border-bottom: 0; }
            #sm-panel .sm-row.sm-link { cursor: pointer; }
            #sm-panel .sm-row.sm-link:hover { background: var(--hover); }
            #sm-panel .sm-foot { height: 42px; flex: none; background: var(--surface); border-top: 1px solid var(--line); font-weight: 600; }
            #sm-panel .sm-num { text-align: right; font-family: ui-monospace, Consolas, monospace; }
            #sm-panel .sm-zero { color: var(--line-hi); }
            #sm-panel .sm-owner { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
            #sm-panel .sm-pop { color: var(--text); font-weight: 600; }
        `,
        body: '<div class="sm-content"></div>',
    });

    const $content = $panel.find('.sm-content');
    const $refresh = $panel.find('.sm-refresh');
    const view = { ally: ALL, player: ALL };

    const pageCount = $doc => {
        const numbers = $doc.find('.paged-nav-item, .paged-nav-item ~ select option').get()
            .map(el => +((el.getAttribute('href') || el.getAttribute('value') || '').match(/page=(\d+)/) || [])[1])
            .filter(n => !isNaN(n));
        return Math.max(0, ...numbers) + 1;
    };

    const units = $doc => $doc.find('#units_table thead img').get()
        .map(img => ({ unit: img.getAttribute('src').match(/unit_(\w+)\./)[1], src: img.getAttribute('src') }));

    const collect = ($doc, result) => $doc.find('#units_table .village_anchor').each((_, anchor) => {
        const $anchor = $(anchor);
        const $row = $anchor.closest('tr');
        const coord = $.trim($anchor.text()).match(RX_COORD);
        if (!coord) return;
        const $ally = $row.find('a[href*="info_ally"]').first();
        const own = !$row.find('a[href*="info_player"]').length;
        const player = $anchor.attr('data-player');
        const ally = own ? String(game_data.player.ally || NONE) : ($ally.attr('href') || '').match(/id=(\d+)/)?.[1] || NONE;
        result.players[player] = own ? game_data.player.name : $.trim($row.find('a[href*="info_player"]').first().text());
        if (own) result.allies[ally] ??= '';
        else result.allies[ally] = $.trim($ally.text());
        const counts = $row.find('.unit-item').get().map(td => +td.textContent || 0);
        const id = $anchor.attr('data-id');
        const village = result.villages[id] ??= { x: +coord[1], y: +coord[2], player, ally, troops: counts.map(() => 0) };
        counts.forEach((n, i) => village.troops[i] += n);
    });

    const busy = text => $content.html(TWK.loading(text));

    const read = async () => {
        reading = true;
        $refresh.addClass('twk-spinning').prop('disabled', true);
        const result = { at: Date.now(), units: [], players: {}, allies: {}, villages: {} };
        try {
            busy('Lendo a página 1...');
            const first = await TWK.doc(TWK.url(`${PATH}&page=0`));
            const total = pageCount(first);
            result.units = units(first);
            collect(first, result);
            for (let page = 1; page < total && reading; page++) {
                busy(`Lendo a página ${page + 1} de ${total}...`);
                collect(await TWK.doc(TWK.url(`${PATH}&page=${page}`)), result);
            }
        } catch {
            reading = false;
            UI.ErrorMessage('Não foi possível ler os apoios');
        }
        const finished = reading;
        reading = false;
        $refresh.removeClass('twk-spinning').prop('disabled', false);
        if (finished) {
            data = result;
            TWK.store.set(KEY, data);
            paint();
        }
        render();
    };

    const onMap = () => game_data.screen === 'map' && !!window.TWMap;

    const pop = troops => troops.reduce((total, n, i) => total + n * (POP[data.units[i].unit] || 0), 0);

    const tag = id => data.allies[id] ? `[${TWK.escape(data.allies[id])}]` : 'Sem tribo';

    const inAlly = v => view.ally === ALL || v.ally === view.ally;

    const visible = () => Object.values(data.villages).filter(v => inAlly(v) && (view.player === ALL || v.player === view.player));

    const stat = (label, value) => `<div class="sm-stat"><span>${label}</span><b class="twk-mono">${value}</b></div>`;

    const cell = n => `<span class="sm-num${n ? '' : ' sm-zero'}">${n ? TWK.format(n) : '–'}</span>`;

    const player = (id, name, sub, count) => `<button class="sm-player${id === view.player ? ' sm-active' : ''}" data-player="${id}">
        <div><span>${name}</span><small>${sub}</small></div><b>${count}</b>
    </button>`;

    const render = () => {
        if (!data) return $content.html(TWK.idle(TWK.ICON.target, 'Nenhum dado salvo', 'Clique em atualizar para ler os apoios que você está enviando.'));
        const all = Object.values(data.villages);
        const scoped = all.filter(inAlly);
        const list = visible().sort((a, b) => pop(b.troops) - pop(a.troops));
        const columns = data.units.map((u, i) => ({ ...u, i, total: list.reduce((total, v) => total + v.troops[i], 0) })).filter(u => u.total);
        const owners = Object.entries(data.players)
            .map(([id, name]) => ({ id, name, villages: scoped.filter(v => v.player === id) }))
            .filter(p => p.villages.length)
            .sort((a, b) => b.villages.length - a.villages.length);
        const allies = [...new Set(all.map(v => v.ally))].sort((a, b) => tag(a).localeCompare(tag(b)));
        const total = list.reduce((sum, v) => sum + pop(v.troops), 0);
        const link = onMap();
        const cols = `72px minmax(110px, 1fr) repeat(${columns.length}, minmax(64px, auto)) 96px`;
        $content.html(`
            <div class="sm-stats">
                ${stat('Aldeias', TWK.format(list.length))}
                ${stat('Jogadores', TWK.format(new Set(list.map(v => v.player)).size))}
                ${stat('População', TWK.format(total))}
                ${stat('Atualizado', new Date(data.at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }))}
            </div>
            <div class="sm-main">
                <aside class="sm-side">
                    <div class="twk-field">
                        <span class="twk-label">Tribo</span>
                        <select class="sm-ally">
                            <option value="${ALL}">Todas as tribos</option>
                            ${allies.map(id => `<option value="${id}"${id === view.ally ? ' selected' : ''}>${tag(id)}</option>`).join('')}
                        </select>
                    </div>
                    <span class="twk-label">Jogadores</span>
                    <div class="sm-players">
                        ${player(ALL, 'Todos os jogadores', TWK.plural(owners.length, 'jogador', 'jogadores'), scoped.length)}
                        ${owners.map(p => player(p.id, TWK.escape(p.name), [...new Set(p.villages.map(v => v.ally))].map(tag).join(' '), p.villages.length)).join('')}
                    </div>
                </aside>
                <section class="sm-area">
                    <div class="sm-bar">
                        <span class="twk-label">Aldeias <span class="twk-hint">${link ? 'clique para ver no mapa' : 'ordenadas por população'}</span></span>
                        <button class="twk-btn sm-copy">${TWK.ICON.copy}Copiar coordenadas</button>
                    </div>
                    <div class="sm-table" style="--cols: ${cols}">
                        <div class="sm-head">
                            <span>Aldeia</span><span>Jogador</span>
                            ${columns.map(u => `<img src="${u.src}" alt="${u.unit}" title="${u.unit}">`).join('')}
                            <span class="sm-num">População</span>
                        </div>
                        <div class="sm-body">
                            ${list.map(v => `<div class="sm-row${link ? ' sm-link' : ''}" data-x="${v.x}" data-y="${v.y}">
                                <b class="twk-mono">${v.x}|${v.y}</b>
                                <span class="sm-owner">${TWK.escape(data.players[v.player] || '')}</span>
                                ${columns.map(u => cell(v.troops[u.i])).join('')}
                                <span class="sm-num sm-pop">${TWK.format(pop(v.troops))}</span>
                            </div>`).join('')}
                        </div>
                        <div class="sm-foot">
                            <span>Total</span><span></span>
                            ${columns.map(u => cell(u.total)).join('')}
                            <span class="sm-num sm-pop">${TWK.format(total)}</span>
                        </div>
                    </div>
                </section>
            </div>
        `);
    };

    const style = map => {
        const mini = map === TWMap.minimap;
        const dot = Math.max(...map.scale) * 2.4;
        return mini
            ? { width: dot, height: dot, marginLeft: (map.scale[0] - dot) / 2, marginTop: (map.scale[1] - dot) / 2, borderRadius: '50%', border: '2px solid #000', background: '#fff', zIndex: 10 }
            : { width: map.scale[0], height: map.scale[1], border: '3px solid #fff', outline: '1px solid #000', background: 'rgba(255, 255, 255, .35)', zIndex: 5 };
    };

    const mark = sector => {
        const map = sector._map;
        const span = map.sectorSize;
        const css = { position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', ...style(map) };
        Object.values(data.villages)
            .filter(v => v.x >= sector.x && v.x < sector.x + span && v.y >= sector.y && v.y < sector.y + span)
            .forEach(v => sector.appendElement($('<div class="sm-mark">').css(css)[0], v.x - sector.x, v.y - sector.y));
    };

    const paint = () => {
        const ready = onMap() && data;
        if (!ready) return;
        TWMap.mapHandler.smSpawn ??= TWMap.mapHandler.spawnSector;
        TWMap.minimapHandler.smLoad ??= TWMap.minimapHandler.loadSector;
        TWMap.mapHandler.spawnSector = function (info, sector) {
            TWMap.mapHandler.smSpawn.call(this, info, sector);
            mark(sector);
        };
        TWMap.minimapHandler.loadSector = function (sector) {
            TWMap.minimapHandler.smLoad.call(this, sector);
            mark(sector);
        };
        TWMap.reload();
    };

    const select = (key, value) => {
        view[key] = value;
        if (key === 'ally') view.player = ALL;
        render();
    };

    const copy = () => TWK.copy(visible().map(v => `${v.x}|${v.y}`).join('\n'), 'Coordenadas copiadas');

    $panel.on('click', '.sm-refresh', read);
    $panel.on('change', '.sm-ally', e => select('ally', e.currentTarget.value));
    $panel.on('click', '.sm-player', e => select('player', String($(e.currentTarget).data('player'))));
    $panel.on('click', '.sm-link', e => TWMap.focusUserSpecified($(e.currentTarget).data('x'), $(e.currentTarget).data('y')));
    $panel.on('click', '.sm-copy', copy);

    render();
    paint();
});
