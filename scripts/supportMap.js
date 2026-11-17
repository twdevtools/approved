$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.6/twkit.js', dataType: 'script', cache: true }).then(() => {
    const KEY = `twSupportMap_${game_data.world}`;
    const GOAL_KEY = `twSupportMapGoal_${game_data.world}`;
    const BASE = '#ffffff';
    const CHOSEN = '#0a84ff';
    const TIERS = [
        { min: 1, color: '#30d158' },
        { min: .5, color: '#ffd60a' },
        { min: .25, color: '#ff9f0a' },
        { min: 0, color: '#ff453a' },
    ];
    const PATH = 'overview_villages&mode=units&type=away_detail&filter_villages=1&group=0';
    const RX_COORD = /\((\d+)\|(\d+)\)\s*K\d+\s*$/;
    const POP = { spear: 1, sword: 1, axe: 1, archer: 1, spy: 2, light: 4, marcher: 5, heavy: 6, ram: 5, catapult: 8, knight: 10, snob: 100 };
    const WIDE = 1100;
    const NARROW = 400;
    const ALL = '';
    const NONE = '0';

    let data = TWK.store.get(KEY);
    let reading = false;

    const $panel = TWK.panel({
        id: 'sm-panel',
        title: 'Apoios Enviados',
        sub: 'Aldeias que você está apoiando',
        icon: TWK.ICON.target,
        width: WIDE,
        fold: true,
        dock: true,
        actions: `<button class="twk-icon sm-refresh" data-tip="Atualizar">${TWK.ICON.refresh}</button>`,
        onClose: () => {
            reading = false;
            picking = false;
        },
        css: `
            #sm-panel .twk-body { padding: 0; gap: 0; max-height: none; overflow: visible; }
            #sm-panel .sm-content { height: min(620px, 72vh); display: flex; flex-direction: column; }
            #sm-panel .sm-content.sm-compact { height: auto; padding: 28px 24px 24px; align-items: center; gap: 18px; }
            #sm-panel .sm-compact .twk-idle { padding: 0; }
            #sm-panel .sm-compact .twk-idle p { max-width: 300px; }
            #sm-panel .sm-compact .twk-btn { min-width: 180px; }
            #sm-panel .sm-content > .twk-loading, #sm-panel .sm-content > .twk-idle { flex: 1; }
            #sm-panel .sm-progress { flex: none; padding: 10px 16px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 11px; }
            #sm-panel .sm-progress span { flex: none; min-width: 170px; }
            #sm-panel .sm-progress i { flex: 1; height: 4px; border-radius: 2px; background: var(--surface); overflow: hidden; }
            #sm-panel .sm-progress b { display: block; width: 0; height: 100%; background: var(--accent); transition: width .3s; }
            #sm-panel .sm-reading .sm-stats, #sm-panel .sm-reading .sm-main { opacity: .45; pointer-events: none; }
            #sm-panel .sm-tool.sm-goalset { color: #30d158; }
            #sm-panel .sm-goalrow {
                flex: none; padding: 8px 12px; display: flex; align-items: center; gap: 18px;
                background: var(--surface); border: 1px solid var(--line); border-radius: 8px;
            }
            #sm-panel .sm-goalrow[hidden] { display: none; }
            #sm-panel .sm-goalrow-field { flex: none; display: flex; align-items: center; gap: 8px; }
            #sm-panel .sm-goalrow-field .twk-number { width: 120px; flex: none; }
            #sm-panel .sm-tiers { flex: 1; min-width: 0; display: flex; gap: 8px; }
            #sm-panel .sm-tier {
                height: 26px; padding: 0 10px; display: flex; align-items: center; gap: 6px; font-size: 12px; white-space: nowrap;
                background: none; border: 1px solid var(--line); border-radius: 13px; cursor: pointer;
            }
            #sm-panel .sm-tier:hover { border-color: var(--line-hi); background: var(--hover); }
            #sm-panel .sm-tier.sm-active { border-color: var(--tier); background: var(--hover); }
            #sm-panel .sm-tier i { width: 10px; height: 10px; flex: none; border-radius: 50%; border: 1px solid #000; }
            #sm-panel .sm-tier span { color: var(--muted); }
            #sm-panel .sm-tier b { font-weight: 600; }
            #sm-panel .sm-tiers small { color: var(--muted); font-size: 11px; }
            #sm-panel .sm-row.sm-chosen { background: rgba(10, 132, 255, .1); }
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
            #sm-panel .sm-table { flex: 1; min-height: 0; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
            #sm-panel .sm-head, #sm-panel .sm-row, #sm-panel .sm-foot { display: grid; grid-template-columns: var(--cols); align-items: center; gap: 12px; padding: 0 16px; }
            #sm-panel .sm-head, #sm-panel .sm-foot { padding-right: 26px; }
            #sm-panel .sm-head { height: 38px; flex: none; background: var(--surface); border-bottom: 1px solid var(--line); color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #sm-panel .sm-head img { width: 18px; height: 18px; justify-self: end; }
            #sm-panel .sm-body { flex: 1; min-height: 0; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
            #sm-panel .sm-row { height: 40px; border-bottom: 1px solid var(--line); }
            #sm-panel .sm-row:last-child { border-bottom: 0; }
            #sm-panel .sm-row.sm-link { cursor: pointer; }
            #sm-panel .sm-row.sm-link:hover { background: var(--hover); }
            #sm-panel .sm-foot { height: 42px; flex: none; background: var(--surface); border-top: 1px solid var(--line); font-weight: 600; }
            #sm-panel .sm-num { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; font-family: ui-monospace, Consolas, monospace; }
            #sm-panel .sm-zero { color: var(--line-hi); }
            #sm-panel .sm-owner { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
            #sm-panel .sm-pop { color: var(--text); font-weight: 600; }
            #sm-panel .twk-btn { white-space: nowrap; }
            #sm-panel .sm-tools { display: flex; gap: 6px; }
            #sm-panel .sm-tool { width: 32px; padding: 0; }
            #sm-panel .sm-tool.sm-active { border-color: #0a84ff; color: #0a84ff; }
            #sm-panel .sm-pick { display: flex; align-items: center; gap: 6px; }
            #sm-panel .sm-pick .sm-tools { margin-left: auto; }
            #sm-panel .sm-pick .twk-caption { margin-right: 4px; }
            #sm-panel .sm-toggle {
                width: 32px; height: 30px; padding: 0; display: grid; place-items: center;
                background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer; opacity: .35;
            }
            #sm-panel .sm-toggle img { width: 18px; height: 18px; }
            #sm-panel .sm-toggle.sm-on { opacity: 1; border-color: var(--accent); }
            #sm-panel .sm-percent { width: 96px; margin-left: 8px; }
            #sm-panel .sm-remove { border-color: var(--accent); color: #f08a8a; }
            #sm-panel .sm-remove:hover { background: var(--accent); color: #fff; }
            #sm-panel .sm-del {
                width: 24px; height: 24px; padding: 0; display: grid; place-items: center; justify-self: end;
                background: none; border: 1px solid transparent; border-radius: 4px; color: var(--muted); cursor: pointer;
            }
            #sm-panel .sm-del:hover { color: #f08a8a; border-color: var(--line-hi); }
        `,
        body: '<div class="sm-content"></div>',
    });

    const $content = $panel.find('.sm-content');
    const $refresh = $panel.find('.sm-refresh');
    const view = { ally: ALL, player: ALL, tier: ALL };
    const pick = { off: new Set(), percent: 100 };
    let goal = TWK.store.get(GOAL_KEY, 0);
    let goalOpen = false;
    const chosen = new Set();
    const scales = {};
    let picking = false;

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

    const size = wide => {
        $panel.css('width', wide ? WIDE : NARROW);
        $content.toggleClass('sm-compact', !wide);
    };

    const busy = (text, ratio = 0) => {
        if (!data) {
            size(false);
            return $content.html(TWK.loading(text));
        }
        const missing = !$content.find('.sm-progress').length;
        if (missing) $content.addClass('sm-reading').prepend('<div class="sm-progress"><span></span><i><b></b></i></div>');
        $content.find('.sm-progress span').text(text);
        $content.find('.sm-progress b').css('width', `${ratio * 100}%`);
    };

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
                busy(`Lendo a página ${page + 1} de ${total}...`, page / total);
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

    const scope = () => Object.entries(data.villages).map(([id, v]) => ({ ...v, id })).filter(v => inAlly(v) && (view.player === ALL || v.player === view.player));

    const visible = () => scope().filter(v => !goal || view.tier === ALL || tier(v.id) === view.tier);

    const bounds = i => ({
        low: TWK.format(Math.ceil(goal * TIERS[i].min)),
        high: i ? TWK.format(Math.ceil(goal * TIERS[i - 1].min) - 1) : '',
        next: i ? TWK.format(Math.ceil(goal * TIERS[i - 1].min)) : '',
    });

    const range = i => {
        const b = bounds(i);
        if (!i) return `${b.low}+`;
        if (!TIERS[i].min) return `< ${b.next}`;
        return `${b.low}–${b.high}`;
    };

    const describe = (i, count) => {
        const b = bounds(i);
        const villages = TWK.plural(count, 'aldeia', 'aldeias');
        if (!i) return `${villages} com ${b.low} ou mais de população`;
        if (!TIERS[i].min) return `${villages} com menos de ${b.next} de população`;
        return `${villages} com ${b.low} a ${b.high} de população`;
    };

    const tiers = () => {
        if (!goal) return '<small>Defina a população por aldeia para colorir o mapa.</small>';
        const list = scope();
        return TIERS.map((t, i) => {
            const count = list.filter(v => tier(v.id) === t.color).length;
            return `<button class="sm-tier${view.tier === t.color ? ' sm-active' : ''}" style="--tier: ${t.color}" data-tier="${t.color}" data-tip="${describe(i, count)}">
                <i style="background: ${t.color}"></i><span>${range(i)}</span><b class="twk-mono">${TWK.format(count)}</b>
            </button>`;
        }).join('');
    };


    const stat = (label, value) => `<div class="sm-stat"><span>${label}</span><b class="twk-mono">${value}</b></div>`;

    const cell = n => `<span class="sm-num${n ? '' : ' sm-zero'}">${n ? TWK.format(n) : '–'}</span>`;

    const player = (id, name, sub, count) => `<button class="sm-player${id === view.player ? ' sm-active' : ''}" data-player="${id}">
        <div><span>${name}</span><small>${sub}</small></div><b>${count}</b>
    </button>`;

    const render = () => {
        size(!!data);
        $content.removeClass('sm-reading');
        if (!data) return $content.html(`
            ${TWK.idle(TWK.ICON.target, 'Nenhum apoio lido ainda', 'Leia os apoios que você está enviando para ver quem você apoia, as tropas em cada aldeia e marcar tudo no mapa.')}
            <button class="twk-btn twk-primary sm-start">${TWK.ICON.refresh}Ler apoios</button>
        `);
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
        const cols = `16px 68px minmax(90px, 1fr) repeat(${columns.length}, minmax(0, 1fr)) 96px 28px`;
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
                    <div class="sm-pick">
                        <span class="twk-caption">Retirar</span>
                        ${columns.map(u => `<button class="sm-toggle${pick.off.has(u.unit) ? '' : ' sm-on'}" data-unit="${u.unit}" data-tip="${u.unit}"><img src="${u.src}" alt="${u.unit}"></button>`).join('')}
                        <div class="sm-percent">${TWK.number('sm-amount', { min: 10, max: 100, step: 10, value: pick.percent })}</div>
                        <span class="twk-caption">%</span>
                        <div class="sm-tools">
                            ${link ? `<button class="twk-btn sm-tool sm-mapmode${picking ? ' sm-active' : ''}" data-tip="Selecionar no mapa">${TWK.ICON.target}</button>` : ''}
                            <button class="twk-btn sm-tool sm-copy" data-tip="Copiar coordenadas">${TWK.ICON.copy}</button>
                            <button class="twk-btn sm-tool sm-goalbtn${goal ? ' sm-goalset' : ''}${goalOpen ? ' sm-active' : ''}" data-tip="Meta de população">${TWK.ICON.chart}</button>
                            <button class="twk-btn sm-remove"${chosen.size ? '' : ' disabled'}>${removal()}</button>
                        </div>
                    </div>
                    <div class="sm-goalrow"${goalOpen ? '' : ' hidden'}>
                        <div class="sm-goalrow-field">
                            <span class="twk-label">Meta</span>
                            ${TWK.number('sm-goal-input', { min: 0, step: 1000, value: goal })}
                        </div>
                        <div class="sm-tiers">${tiers()}</div>
                    </div>
                    <div class="sm-table" style="--cols: ${cols}">
                        <div class="sm-head">
                            <input type="checkbox" class="sm-check sm-check-all"${list.length && list.every(v => chosen.has(v.id)) ? ' checked' : ''}>
                            <span>Aldeia</span><span>Jogador</span>
                            ${columns.map(u => `<img src="${u.src}" alt="${u.unit}" data-tip="${u.unit}">`).join('')}
                            <span class="sm-num">População</span><span></span>
                        </div>
                        <div class="sm-body">
                            ${list.map(v => `<div class="sm-row${link ? ' sm-link' : ''}${chosen.has(v.id) ? ' sm-chosen' : ''}" data-id="${v.id}" data-x="${v.x}" data-y="${v.y}">
                                <input type="checkbox" class="sm-check"${chosen.has(v.id) ? ' checked' : ''}>
                                <b class="twk-mono">${v.x}|${v.y}</b>
                                <span class="sm-owner">${TWK.escape(data.players[v.player] || '')}</span>
                                ${columns.map(u => cell(v.troops[u.i])).join('')}
                                <span class="sm-num sm-pop">${TWK.format(pop(v.troops))}</span>
                                <button class="sm-del" data-tip="Remover apoio">${TWK.ICON.close}</button>
                            </div>`).join('')}
                        </div>
                        <div class="sm-foot">
                            <span></span><span>Total</span><span></span>
                            ${columns.map(u => cell(u.total)).join('')}
                            <span class="sm-num sm-pop">${TWK.format(total)}</span><span></span>
                        </div>
                    </div>
                </section>
            </div>
        `);
    };

    const tier = id => {
        const village = data.villages[id];
        const ratio = village && goal ? pop(village.troops) / goal : -1;
        return TIERS.find(t => ratio >= t.min)?.color || BASE;
    };

    const tone = id => chosen.has(id) ? CHOSEN : tier(id);

    const look = (kind, id) => {
        const scale = scales[kind];
        const color = tone(id);
        const dot = Math.max(...scale) * 2.4;
        return kind === 'mini'
            ? { width: dot, height: dot, marginLeft: (scale[0] - dot) / 2, marginTop: (scale[1] - dot) / 2, borderRadius: '50%', border: '2px solid #000', background: color, zIndex: 10 }
            : { width: scale[0], height: scale[1], border: `3px solid ${color}`, outline: '1px solid #000', background: `${color}73`, zIndex: 5 };
    };


    const short = n => {
        if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', ',')}M`;
        if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
        return String(n);
    };

    const badge = v => $('<div>')
        .css({
            position: 'absolute', left: '50%', bottom: 2, transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 2, padding: '0 3px', borderRadius: 3,
            background: 'rgba(0, 0, 0, .78)', color: '#fff', font: '700 10px/14px system-ui, sans-serif', whiteSpace: 'nowrap',
        })
        .append($(`<img src="${window.image_base}buildings/farm.webp" alt="">`).css({ width: 11, height: 11 }), short(pop(v.troops)));

    const mark = sector => {
        const map = sector._map;
        const span = map.sectorSize;
        const kind = map === TWMap.minimap ? 'mini' : 'main';
        scales[kind] = map.scale;
        Object.entries(data.villages)
            .filter(([, v]) => v.x >= sector.x && v.x < sector.x + span && v.y >= sector.y && v.y < sector.y + span)
            .forEach(([id, v]) => {
                const $el = $(`<div class="sm-mark" data-id="${id}" data-kind="${kind}">`)
                    .css({ position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', ...look(kind, id) });
                if (kind === 'main') $el.append(badge(v));
                sector.appendElement($el[0], v.x - sector.x, v.y - sector.y);
            });
    };

    const restyle = () => $('.sm-mark').each((_, el) => $(el).css(look(el.dataset.kind, el.dataset.id)));

    const at = (x, y) => Object.keys(data.villages).find(id => data.villages[id].x === x && data.villages[id].y === y);

    const paint = () => {
        const ready = onMap() && data;
        if (!ready) return;
        TWMap.mapHandler.smSpawn ??= TWMap.mapHandler.spawnSector;
        TWMap.minimapHandler.smLoad ??= TWMap.minimapHandler.loadSector;
        TWMap.mapHandler.smClick ??= TWMap.mapHandler.onClick;
        TWMap.mapHandler.onClick = function (x, y, event) {
            const id = picking && at(x, y);
            if (!id) return TWMap.mapHandler.smClick.call(this, x, y, event);
            toggle(id);
            return false;
        };
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
        if (key !== 'tier') view.tier = ALL;
        render();
    };

    const removal = () => `${TWK.ICON.clear}${chosen.size ? `Retirar das selecionadas (${chosen.size})` : 'Selecione aldeias'}`;

    const refresh = () => {
        $panel.find('.sm-remove').html(removal()).prop('disabled', !chosen.size);
        $panel.find('.sm-check-all').prop('checked', visible().every(v => chosen.has(v.id)));
        restyle();
    };

    const toggle = id => {
        const on = !chosen.has(id);
        if (on) chosen.add(id);
        else chosen.delete(id);
        $panel.find(`.sm-row[data-id="${id}"]`).toggleClass('sm-chosen', on).find('.sm-check').prop('checked', on);
        refresh();
    };

    const withdraw = async id => {
        const $form = (await TWK.doc(TWK.url(`info_village&id=${id}`))).find('#withdraw_selected_units_village_info');
        const body = { village_id: id, h: game_data.csrf };
        const removed = {};
        $form.find('input.unit-selection').each((_, el) => {
            const chosen = !pick.off.has(el.name.replace('checkbox_', ''));
            if (chosen) body[el.name] = 'on';
        });
        $form.find('td[data-away-id][data-unit-count]').each((_, td) => {
            const count = Math.floor(+td.getAttribute('data-unit-count') * pick.percent / 100);
            const chosen = count && !pick.off.has(td.id);
            if (!chosen) return;
            body[`withdraw_unit[${td.getAttribute('data-away-id')}][units][${td.id}]`] = count;
            removed[td.id] = (removed[td.id] || 0) + count;
        });
        $form.find('input.troop-request-selector').each((_, el) => body[el.name] = 'on');
        const empty = !$form.length;
        if (!empty) await $.post($form.attr('action'), body);
        const village = data.villages[id];
        village.troops = village.troops.map((n, i) => Math.max(0, n - (removed[data.units[i].unit] || 0)));
        const cleared = empty || !village.troops.some(Boolean);
        if (cleared) delete data.villages[id];
    };

    const remove = async ids => {
        $panel.find('.sm-remove, .sm-del, .sm-refresh').prop('disabled', true);
        let done = 0;
        try {
            for (const id of ids) {
                $panel.find('.sm-remove').text(`Retirando ${done + 1} de ${ids.length}...`);
                await withdraw(id);
                TWK.store.set(KEY, data);
                done++;
            }
        } catch {
            UI.ErrorMessage('Não foi possível remover todos os apoios');
        }
        chosen.clear();
        render();
        if (onMap()) TWMap.reload();
        UI.SuccessMessage(`Apoios removidos de ${TWK.plural(done, 'aldeia', 'aldeias')}`);
    };

    const copy = () => TWK.copy(visible().map(v => `${v.x}|${v.y}`).join('\n'), 'Coordenadas copiadas');

    $panel.on('click', '.sm-refresh, .sm-start', read);
    $panel.on('change', '.sm-ally', e => select('ally', e.currentTarget.value));
    $panel.on('click', '.sm-player', e => select('player', String($(e.currentTarget).data('player'))));
    $panel.on('click', '.sm-link', e => TWMap.focusUserSpecified($(e.currentTarget).data('x'), $(e.currentTarget).data('y')));
    $panel.on('click', '.sm-copy', copy);
    $panel.on('click', '.sm-remove', () => remove([...chosen]));
    $panel.on('click', '.sm-row .sm-check', e => {
        e.stopPropagation();
        toggle(String($(e.currentTarget).closest('.sm-row').data('id')));
    });
    $panel.on('change', '.sm-check-all', e => {
        const all = e.currentTarget.checked;
        visible().forEach(v => {
            if (all) chosen.add(v.id);
            else chosen.delete(v.id);
        });
        render();
        restyle();
    });
    $panel.on('click', '.sm-mapmode', e => {
        picking = !picking;
        $(e.currentTarget).toggleClass('sm-active', picking).attr('data-tip', picking ? 'Parar de selecionar no mapa' : 'Selecionar no mapa');
    });
    $panel.on('click', '.sm-toggle', e => {
        const unit = $(e.currentTarget).data('unit');
        const off = !pick.off.has(unit);
        if (off) pick.off.add(unit);
        else pick.off.delete(unit);
        $(e.currentTarget).toggleClass('sm-on', !off);
    });
    $panel.on('input', '.sm-goal-input', e => {
        goal = Math.max(0, parseInt(e.currentTarget.value) || 0);
        TWK.store.set(GOAL_KEY, goal);
        $panel.find('.sm-tiers').html(tiers());
        $panel.find('.sm-goalbtn').toggleClass('sm-goalset', !!goal);
        restyle();
    });
    $panel.on('change', '.sm-goal-input', () => {
        const filtered = view.tier !== ALL;
        if (filtered) render();
    });
    $panel.on('click', '.sm-tier', e => {
        const color = $(e.currentTarget).data('tier');
        select('tier', view.tier === color ? ALL : color);
    });
    $panel.on('click', '.sm-goalbtn', () => {
        goalOpen = !goalOpen;
        $panel.find('.sm-goalrow').prop('hidden', !goalOpen);
        $panel.find('.sm-goalbtn').toggleClass('sm-active', goalOpen);
    });
    $panel.on('input', '.sm-amount', e => {
        pick.percent = Math.min(100, Math.max(10, parseInt(e.currentTarget.value) || 100));
    });
    $panel.on('click', '.sm-del', e => {
        e.stopPropagation();
        remove([String($(e.currentTarget).closest('.sm-row').data('id'))]);
    });

    render();
    paint();
});
