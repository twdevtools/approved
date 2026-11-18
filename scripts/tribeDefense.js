$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.6/twkit.js', dataType: 'script', cache: true }).then(() => {
    const page = game_data.screen === 'map';
    if (!page) return TWK.redirect('map', 'Redirecionando para o mapa...');

    const KEY = `twTribeDefense_${game_data.world}`;
    const SETTINGS_KEY = `twTribeDefenseSettings_${game_data.world}`;
    const BASE = '#ffffff';
    const TIERS = [
        { min: 1, color: '#30d158' },
        { min: .5, color: '#ffd60a' },
        { min: .25, color: '#ff9f0a' },
        { min: 0, color: '#ff453a' },
    ];
    const DEFENSE = 'ally&mode=members_defense';
    const BUILDINGS = 'ally&mode=members_buildings';
    const CONTRACTS = 'ally&mode=contracts';
    const GUARDS = ['spear', 'sword', 'archer', 'spy', 'heavy'];
    const ENEMIES = 2;
    const RADIUS = 10;
    const CELL = 10;
    const RX_COORD = /\((\d+)\|(\d+)\)\s*K\d+\s*$/;
    const WIDE = 1100;
    const NARROW = 400;
    const ALL = '';
    const SHIELD = TWK.svg('<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6Z"/>');

    let data = TWK.store.get(KEY);
    let reading = false;

    const settings = { goal: {}, min: 5, ...TWK.store.get(SETTINGS_KEY, {}) };
    const view = { member: ALL, tier: ALL };
    const scales = {};
    let goalOpen = false;
    let marks = new Map();

    const $panel = TWK.panel({
        id: 'td-panel',
        title: 'Defesa da Tribo',
        sub: 'Aldeias dos membros, front e o que falta para a meta',
        icon: SHIELD,
        width: WIDE,
        fold: true,
        dock: true,
        actions: `<button class="twk-icon td-refresh" data-tip="Atualizar">${TWK.ICON.refresh}</button>`,
        onClose: () => {
            reading = false;
        },
        css: `
            #td-panel .twk-body { padding: 0; gap: 0; max-height: none; overflow: visible; }
            #td-panel .td-content { height: min(620px, 72vh); display: flex; flex-direction: column; }
            #td-panel .td-content.td-compact { height: auto; padding: 28px 24px 24px; align-items: center; gap: 18px; }
            #td-panel .td-compact .twk-idle { padding: 0; }
            #td-panel .td-compact .twk-idle p { max-width: 300px; }
            #td-panel .td-compact .twk-btn { min-width: 180px; }
            #td-panel .td-content > .twk-loading, #td-panel .td-content > .twk-idle { flex: 1; }
            #td-panel .td-progress { flex: none; padding: 10px 16px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 11px; }
            #td-panel .td-progress span { flex: none; min-width: 220px; }
            #td-panel .td-progress i { flex: 1; height: 4px; border-radius: 2px; background: var(--surface); overflow: hidden; }
            #td-panel .td-progress b { display: block; width: 0; height: 100%; background: var(--accent); transition: width .3s; }
            #td-panel .td-reading .td-stats, #td-panel .td-reading .td-main { opacity: .45; pointer-events: none; }
            #td-panel .td-tool.td-goalset { color: #30d158; }
            #td-panel .td-goalrow {
                flex: none; padding: 10px 12px; display: flex; flex-direction: column; gap: 10px;
                background: var(--surface); border: 1px solid var(--line); border-radius: 8px;
            }
            #td-panel .td-goalrow[hidden] { display: none; }
            #td-panel .td-goals { display: flex; align-items: center; gap: 14px; }
            #td-panel .td-goal { display: flex; align-items: center; gap: 6px; }
            #td-panel .td-goal img { width: 18px; height: 18px; }
            #td-panel .td-goal .twk-number { width: 110px; }
            #td-panel .td-goals small { margin-left: auto; color: var(--muted); font-size: 11px; }
            #td-panel .td-tiers { display: flex; gap: 8px; }
            #td-panel .td-tier {
                height: 26px; padding: 0 10px; display: flex; align-items: center; gap: 6px; font-size: 12px; white-space: nowrap;
                background: none; border: 1px solid var(--line); border-radius: 13px; cursor: pointer;
            }
            #td-panel .td-tier:hover { border-color: var(--line-hi); background: var(--hover); }
            #td-panel .td-tier.td-active { border-color: var(--tier); background: var(--hover); }
            #td-panel .td-tier i { width: 10px; height: 10px; flex: none; border-radius: 50%; border: 1px solid #000; }
            #td-panel .td-tier span { color: var(--muted); }
            #td-panel .td-tier b { font-weight: 600; }
            #td-panel .td-tiers small { color: var(--muted); font-size: 11px; }
            #td-panel .td-stats { display: grid; grid-template-columns: repeat(5, 1fr); border-bottom: 1px solid var(--line); }
            #td-panel .td-stat { padding: 12px 16px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--line); }
            #td-panel .td-stat:last-child { border-right: 0; }
            #td-panel .td-stat span { color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #td-panel .td-stat b { font-size: 16px; font-weight: 600; }
            #td-panel .td-main { flex: 1; min-height: 0; display: grid; grid-template-columns: 250px 1fr; }
            #td-panel .td-side { min-height: 0; padding: 16px; display: flex; flex-direction: column; gap: 14px; border-right: 1px solid var(--line); }
            #td-panel .td-side .twk-label { display: flex; justify-content: space-between; }
            #td-panel .td-side .twk-label small { color: var(--muted); font-weight: 400; letter-spacing: 0; text-transform: none; }
            #td-panel .td-area { min-width: 0; min-height: 0; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
            #td-panel .td-members { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 2px; margin: 0 -6px; padding: 0 6px; }
            #td-panel .td-member {
                width: 100%; padding: 8px 10px; display: flex; align-items: center; gap: 10px; text-align: left;
                background: none; border: 1px solid transparent; border-radius: 6px; cursor: pointer;
            }
            #td-panel .td-member:hover { background: var(--surface); }
            #td-panel .td-member.td-active { background: var(--surface); border-color: var(--accent); }
            #td-panel .td-member div { flex: 1; min-width: 0; display: flex; flex-direction: column; }
            #td-panel .td-member div span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            #td-panel .td-member div small { color: var(--muted); font-size: 11px; }
            #td-panel .td-member > b { flex: none; min-width: 28px; padding: 1px 6px; border-radius: 10px; background: var(--hover); color: var(--muted); font-size: 11px; text-align: center; }
            #td-panel .td-bar { display: flex; align-items: center; gap: 8px; }
            #td-panel .td-front { display: flex; align-items: center; gap: 8px; }
            #td-panel .td-front .twk-number { width: 96px; }
            #td-panel .td-bar .td-tools { margin-left: auto; display: flex; gap: 6px; }
            #td-panel .td-table { flex: 1; min-height: 0; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
            #td-panel .td-head, #td-panel .td-row, #td-panel .td-foot { display: grid; grid-template-columns: var(--cols); align-items: center; gap: 12px; padding: 0 16px; }
            #td-panel .td-head, #td-panel .td-foot { padding-right: 26px; }
            #td-panel .td-head { height: 38px; flex: none; background: var(--surface); border-bottom: 1px solid var(--line); color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #td-panel .td-head img { width: 18px; height: 18px; justify-self: end; }
            #td-panel .td-body { flex: 1; min-height: 0; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
            #td-panel .td-row { height: 40px; border-bottom: 1px solid var(--line); cursor: pointer; }
            #td-panel .td-row:last-child { border-bottom: 0; }
            #td-panel .td-row:hover { background: var(--hover); }
            #td-panel .td-foot { height: 42px; flex: none; background: var(--surface); border-top: 1px solid var(--line); font-weight: 600; }
            #td-panel .td-num { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; font-family: ui-monospace, Consolas, monospace; }
            #td-panel .td-zero { color: var(--line-hi); }
            #td-panel .td-owner { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
            #td-panel .td-pop { color: var(--text); font-weight: 600; }
            #td-panel .td-missing { color: #f08a8a; font-weight: 600; }
            #td-panel .twk-btn { white-space: nowrap; }
            #td-panel .td-tool { width: 32px; padding: 0; }
            #td-panel .td-tool.td-active { border-color: #0a84ff; color: #0a84ff; }
        `,
        body: '<div class="td-content"></div>',
    });

    const $content = $panel.find('.td-content');
    const $refresh = $panel.find('.td-refresh');

    const save = () => TWK.store.set(SETTINGS_KEY, settings);

    const idOf = el => el.getAttribute('href').match(/id=(\d+)/)[1];

    const numbers = $cells => $cells.get().map(td => +$.trim(td.textContent) || 0);

    const units = $doc => $doc.find('#ally_content table.vis img[src*="/unit/unit_"]').get()
        .map(img => ({ unit: img.getAttribute('src').match(/unit_(\w+)\./)[1], src: img.getAttribute('src') }));

    const population = async () => {
        const xml = await $.ajax({ url: '/interface.php?func=get_unit_info', dataType: 'xml' });
        return Object.fromEntries($(xml).find('config').children().get().map(el => [el.tagName, +$(el).children('pop').text() || 0]));
    };

    const enemies = $doc => {
        let section = -1;
        return $doc.find('#partners tr').get().flatMap(tr => {
            const header = $(tr).children('th').length > 0;
            if (header) section++;
            const wanted = !header && section === ENEMIES;
            return wanted ? $(tr).find('a[href*="info_ally"]').get().map(idOf) : [];
        });
    };

    const hostile = async allies => {
        const [villages, players] = await Promise.all([TWK.get('/map/village.txt'), TWK.get('/map/player.txt')]);
        const foes = new Set(players.split('\n').map(line => line.split(',')).filter(([, , ally]) => allies.has(ally)).map(([id]) => id));
        const grid = {};
        villages.split('\n').map(line => line.split(',')).filter(([, , , , player]) => foes.has(player)).forEach(([, , x, y]) => {
            const cell = `${Math.floor(x / CELL)}|${Math.floor(y / CELL)}`;
            (grid[cell] ??= []).push([+x, +y]);
        });
        return grid;
    };

    const crowd = (grid, v) => {
        const cx = Math.floor(v.x / CELL);
        const cy = Math.floor(v.y / CELL);
        const ring = Math.ceil(RADIUS / CELL);
        let count = 0;
        for (let dx = -ring; dx <= ring; dx++) {
            for (let dy = -ring; dy <= ring; dy++) {
                count += (grid[`${cx + dx}|${cy + dy}`] || []).filter(([x, y]) => Math.hypot(x - v.x, y - v.y) <= RADIUS).length;
            }
        }
        return count;
    };


    const defense = ($doc, player, result) => $doc.find('#ally_content table.vis td[rowspan] a[href*="info_village"]').each((_, anchor) => {
        const coord = $.trim(anchor.textContent).match(RX_COORD);
        if (!coord) return;
        const $row = $(anchor).closest('tr');
        result.villages[idOf(anchor)] = {
            x: +coord[1],
            y: +coord[2],
            player,
            home: numbers($row.children('td').not('[rowspan]').slice(1)),
            coming: numbers($row.next('tr').children('td').slice(1)),
            attacks: +$.trim($row.children('td[rowspan]').last().text()) || 0,
            wall: null,
            foes: 0,
        };
    });

    const walls = ($doc, result) => {
        const column = $doc.find('#ally_content img[src*="/wall."]').closest('th').index();
        if (column < 0) return;
        $doc.find('#ally_content table.vis a[href*="info_village"]').each((_, anchor) => {
            const village = result.villages[idOf(anchor)];
            if (village) village.wall = +$.trim($(anchor).closest('tr').children().eq(column).text()) || 0;
        });
    };

    const size = wide => {
        $panel.css('width', wide ? WIDE : NARROW);
        $content.toggleClass('td-compact', !wide);
    };

    const busy = (text, ratio = 0) => {
        if (!data) {
            size(false);
            return $content.html(TWK.loading(text));
        }
        const missing = !$content.find('.td-progress').length;
        if (missing) $content.addClass('td-reading').prepend('<div class="td-progress"><span></span><i><b></b></i></div>');
        $content.find('.td-progress span').text(text);
        $content.find('.td-progress b').css('width', `${ratio * 100}%`);
    };

    const read = async () => {
        reading = true;
        $refresh.addClass('twk-spinning').prop('disabled', true);
        const result = { at: Date.now(), units: [], pop: {}, members: {}, hidden: [], enemies: 0, villages: {} };
        let allowed = true;
        try {
            busy('Lendo os membros...');
            const first = await TWK.doc(TWK.url(DEFENSE));
            const $options = first.find('select[name="player_id"] option[value]');
            allowed = $options.length > 0;
            const members = $options.not('[disabled]').get().map(el => [el.value, $.trim(el.textContent)]);
            result.hidden = $options.filter('[disabled]').get().map(el => $.trim(el.textContent));
            result.pop = await population();
            busy('Lendo os inimigos da diplomacia...');
            const foes = new Set(enemies(await TWK.doc(TWK.url(CONTRACTS))));
            result.enemies = foes.size;
            const grid = await hostile(foes);
            for (const [n, [id, name]] of members.entries()) {
                if (!reading) break;
                busy(`Lendo ${name} (${n + 1} de ${members.length})...`, n / members.length);
                const $doc = await TWK.doc(TWK.url(`${DEFENSE}&player_id=${id}`));
                result.units = result.units.length ? result.units : units($doc);
                result.members[id] = name;
                defense($doc, id, result);
                walls(await TWK.doc(TWK.url(`${BUILDINGS}&player_id=${id}`)), result);
            }
            Object.values(result.villages).forEach(v => v.foes = crowd(grid, v));
        } catch {
            reading = false;
            UI.ErrorMessage('Não foi possível ler a defesa da tribo');
        }
        const finished = reading && allowed;
        reading = false;
        $refresh.removeClass('twk-spinning').prop('disabled', false);
        if (!allowed) UI.ErrorMessage('Só líderes com permissão podem ver a defesa da tribo');
        if (finished) {
            data = result;
            TWK.store.set(KEY, data);
            paint();
        }
        render();
    };

    const guards = () => data.units.map((u, i) => ({ ...u, i })).filter(u => GUARDS.includes(u.unit));

    const pop = troops => troops.reduce((total, n, i) => total + n * (data.pop[data.units[i]?.unit] || 0), 0);

    const stock = v => v.home.map((n, i) => n + (v.coming[i] || 0));

    const target = () => guards().reduce((total, u) => total + (settings.goal[u.unit] || 0) * (data.pop[u.unit] || 0), 0);

    const lacking = v => {
        const have = stock(v);
        return guards().map(u => Math.max(0, (settings.goal[u.unit] || 0) - have[u.i]));
    };

    const short = v => {
        const need = lacking(v);
        return guards().reduce((total, u, k) => total + need[k] * (data.pop[u.unit] || 0), 0);
    };

    const front = v => v.foes >= settings.min;

    const scope = () => Object.entries(data.villages).map(([id, v]) => ({ ...v, id })).filter(v => front(v) && (view.member === ALL || v.player === view.member));

    const visible = () => scope().filter(v => !target() || view.tier === ALL || tier(v.id) === view.tier);

    const tier = id => {
        const village = data.villages[id];
        const goal = target();
        const ratio = village && goal ? pop(stock(village)) / goal : -1;
        return TIERS.find(t => ratio >= t.min)?.color || BASE;
    };

    const bounds = i => {
        const goal = target();
        return {
            low: TWK.format(Math.ceil(goal * TIERS[i].min)),
            high: i ? TWK.format(Math.ceil(goal * TIERS[i - 1].min) - 1) : '',
            next: i ? TWK.format(Math.ceil(goal * TIERS[i - 1].min)) : '',
        };
    };

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
        if (!target()) return '<small>Defina a meta por aldeia para colorir o mapa.</small>';
        const list = scope();
        return TIERS.map((t, i) => {
            const count = list.filter(v => tier(v.id) === t.color).length;
            return `<button class="td-tier${view.tier === t.color ? ' td-active' : ''}" style="--tier: ${t.color}" data-tier="${t.color}" data-tip="${describe(i, count)}">
                <i style="background: ${t.color}"></i><span>${range(i)}</span><b class="twk-mono">${TWK.format(count)}</b>
            </button>`;
        }).join('');
    };

    const compact = n => {
        if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', ',')}M`;
        if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
        return String(n);
    };

    const stat = (label, value) => `<div class="td-stat"><span>${label}</span><b class="twk-mono">${value}</b></div>`;

    const cell = (n, extra = '') => `<span class="td-num${n ? extra : ' td-zero'}">${n ? TWK.format(n) : '–'}</span>`;

    const member = (id, name, sub, count) => `<button class="td-member${id === view.member ? ' td-active' : ''}" data-member="${id}">
        <div><span>${name}</span><small>${sub}</small></div><b>${count}</b>
    </button>`;

    const goals = () => `${guards().map(u => `<label class="td-goal" data-unit="${u.unit}"><img src="${u.src}" alt="${u.unit}" data-tip="${u.unit}">${TWK.number('td-goal-input', { min: 0, step: 1000, value: settings.goal[u.unit] || 0 })}</label>`).join('')}
        <small>Meta: <b class="td-target twk-mono">${TWK.format(target())}</b> de população</small>`;

    const render = () => {
        size(!!data);
        $content.removeClass('td-reading');
        if (!data) return $content.html(`
            ${TWK.idle(SHIELD, 'Nenhuma defesa lida ainda', 'Leia a defesa dos membros da tribo para ver as aldeias do front, o que falta em cada uma e marcar tudo no mapa.')}
            <button class="twk-btn twk-primary td-start">${TWK.ICON.refresh}Ler defesa</button>
        `);
        const all = Object.entries(data.villages).map(([id, v]) => ({ ...v, id })).filter(front);
        const goal = target();
        const list = visible().sort((a, b) => goal ? short(b) - short(a) : b.foes - a.foes);
        const columns = guards().map(u => ({ ...u, total: list.reduce((total, v) => total + v.home[u.i], 0) }));
        const members = Object.entries(data.members)
            .map(([id, name]) => ({ id, name, villages: all.filter(v => v.player === id) }))
            .filter(m => m.villages.length)
            .sort((a, b) => a.name.localeCompare(b.name));
        const home = list.reduce((sum, v) => sum + pop(v.home), 0);
        const coming = list.reduce((sum, v) => sum + pop(v.coming), 0);
        const missing = list.reduce((sum, v) => sum + short(v), 0);
        const scroll = $content.find('.td-members').scrollTop();
        const cols = `68px minmax(90px, 1fr) repeat(${columns.length}, minmax(0, 1fr)) 80px 56px 44px 44px 88px 88px`;
        const icon = (src, tip) => `<img src="${window.image_base}${src}" alt="" data-tip="${tip}">`;
        $content.html(`
            <div class="td-stats">
                ${stat('Aldeias', TWK.format(list.length))}
                ${stat('Defesa', TWK.format(home))}
                ${stat('A caminho', TWK.format(coming))}
                ${stat('Falta', goal ? TWK.format(missing) : '–')}
                ${stat('Atualizado', new Date(data.at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }))}
            </div>
            <div class="td-main">
                <aside class="td-side">
                    <span class="twk-label">Membros${data.hidden.length ? `<small data-tip="${TWK.escape(data.hidden.join(', '))}">${data.hidden.length} sem permissão</small>` : ''}</span>
                    <div class="td-members">
                        ${member(ALL, 'Todos os membros', TWK.plural(members.length, 'membro', 'membros'), all.length)}
                        ${members.map(m => member(m.id, TWK.escape(m.name), `${compact(m.villages.reduce((sum, v) => sum + pop(v.home), 0))} de defesa`, m.villages.length)).join('')}
                    </div>
                </aside>
                <section class="td-area">
                    <div class="td-bar">
                        <label class="td-front" data-tip="Aldeias das ${TWK.plural(data.enemies, 'tribo inimiga', 'tribos inimigas')} da diplomacia. 0 mostra todas as aldeias">
                            <span class="twk-label">Front</span>
                            ${TWK.number('td-front-input', { min: 0, step: 1, value: settings.min })}
                            <span class="twk-caption">ou mais inimigas a até ${RADIUS} campos</span>
                        </label>
                        <div class="td-tools">
                            <button class="twk-btn td-tool td-goalbtn${goal ? ' td-goalset' : ''}${goalOpen ? ' td-active' : ''}" data-tip="Meta por aldeia">${TWK.ICON.chart}</button>
                            <button class="twk-btn td-export"${goal ? '' : ' disabled'}>${TWK.ICON.copy}Copiar o que falta</button>
                        </div>
                    </div>
                    <div class="td-goalrow"${goalOpen ? '' : ' hidden'}>
                        <div class="td-goals">${goals()}</div>
                        <div class="td-tiers">${tiers()}</div>
                    </div>
                    <div class="td-table" style="--cols: ${cols}">
                        <div class="td-head">
                            <span>Aldeia</span><span>Membro</span>
                            ${columns.map(u => `<img src="${u.src}" alt="${u.unit}" data-tip="${u.unit}">`).join('')}
                            <span class="td-num">A caminho</span>
                            <span class="td-num" data-tip="Aldeias inimigas a até ${RADIUS} campos">Inimigas</span>
                            ${icon('unit/att.webp', 'Ataques chegando')}
                            ${icon('buildings/wall.webp', 'Muralha')}
                            <span class="td-num">População</span>
                            <span class="td-num" data-tip="População que falta para a meta, contando o que está a caminho">Falta</span>
                        </div>
                        <div class="td-body">
                            ${list.map(v => `<div class="td-row" data-x="${v.x}" data-y="${v.y}">
                                <b class="twk-mono">${v.x}|${v.y}</b>
                                <span class="td-owner">${TWK.escape(data.members[v.player] || '')}</span>
                                ${columns.map(u => cell(v.home[u.i])).join('')}
                                ${cell(pop(v.coming))}
                                ${cell(v.foes)}
                                ${cell(v.attacks, ' td-missing')}
                                <span class="td-num">${v.wall ?? '–'}</span>
                                <span class="td-num td-pop">${TWK.format(pop(v.home))}</span>
                                ${goal ? cell(short(v), ' td-missing') : cell(0)}
                            </div>`).join('')}
                        </div>
                        <div class="td-foot">
                            <span>Total</span><span></span>
                            ${columns.map(u => cell(u.total)).join('')}
                            ${cell(coming)}
                            <span></span><span></span><span></span>
                            <span class="td-num td-pop">${TWK.format(home)}</span>
                            ${cell(missing, ' td-missing')}
                        </div>
                    </div>
                </section>
            </div>
        `);
        $content.find('.td-members').scrollTop(scroll);
    };

    const index = () => {
        marks = new Map(visible().map(v => [`${v.x}|${v.y}`, { ...v, color: tier(v.id) }]));
    };

    const look = (kind, color) => {
        const scale = scales[kind];
        return kind === 'mini'
            ? { width: scale[0], height: scale[1], background: color, zIndex: 10 }
            : { width: scale[0], height: scale[1], border: `3px solid ${color}`, outline: '1px solid #000', background: `${color}73`, zIndex: 5 };
    };

    const badge = v => $('<div>')
        .css({
            position: 'absolute', left: '50%', bottom: 2, transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 2, padding: '0 3px', borderRadius: 3,
            background: 'rgba(0, 0, 0, .78)', color: '#fff', font: '700 10px/14px system-ui, sans-serif', whiteSpace: 'nowrap',
        })
        .append($(`<img src="${window.image_base}buildings/farm.webp" alt="">`).css({ width: 11, height: 11 }), compact(pop(stock(v))));

    const mark = sector => {
        const map = sector._map;
        const span = map.sectorSize;
        const kind = map === TWMap.minimap ? 'mini' : 'main';
        scales[kind] = map.scale;
        for (let x = sector.x; x < sector.x + span; x++) {
            for (let y = sector.y; y < sector.y + span; y++) {
                const v = marks.get(`${x}|${y}`);
                if (!v) continue;
                const $el = $(`<div class="td-mark" data-key="${x}|${y}" data-kind="${kind}">`)
                    .css({ position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', ...look(kind, v.color) });
                if (kind === 'main') $el.append(badge(v));
                sector.appendElement($el[0], x - sector.x, y - sector.y);
            }
        }
    };

    const restyle = () => {
        index();
        $('.td-mark').each((_, el) => $(el).css(look(el.dataset.kind, marks.get(el.dataset.key)?.color || BASE)));
    };

    const paint = () => {
        if (!data) return;
        TWMap.mapHandler.tdSpawn ??= TWMap.mapHandler.spawnSector;
        TWMap.minimapHandler.tdLoad ??= TWMap.minimapHandler.loadSector;
        TWMap.mapHandler.spawnSector = function (info, sector) {
            TWMap.mapHandler.tdSpawn.call(this, info, sector);
            mark(sector);
        };
        TWMap.minimapHandler.loadSector = function (sector) {
            TWMap.minimapHandler.tdLoad.call(this, sector);
            mark(sector);
        };
        index();
        TWMap.reload();
    };

    const update = () => {
        render();
        index();
        TWMap.reload();
    };

    const select = (key, value) => {
        view[key] = value;
        if (key !== 'tier') view.tier = ALL;
        update();
    };

    const exported = () => visible()
        .map(v => ({ v, need: lacking(v) }))
        .filter(({ need }) => need.some(Boolean))
        .map(({ v, need }) => [`${v.x}|${v.y}`, ...need].join('/'))
        .join('\n');

    $panel.on('click', '.td-refresh, .td-start', read);
    $panel.on('click', '.td-member', e => select('member', String($(e.currentTarget).data('member'))));
    $panel.on('click', '.td-row', e => TWMap.focusUserSpecified($(e.currentTarget).data('x'), $(e.currentTarget).data('y')));
    $panel.on('click', '.td-export', () => TWK.copy(exported(), 'Aldeias e tropas que faltam copiadas'));
    $panel.on('change', '.td-front-input', e => {
        settings.min = Math.max(0, parseInt(e.currentTarget.value) || 0);
        save();
        view.tier = ALL;
        update();
    });
    $panel.on('input', '.td-goal-input', e => {
        settings.goal[$(e.currentTarget).closest('.td-goal').data('unit')] = Math.max(0, parseInt(e.currentTarget.value) || 0);
        save();
        $panel.find('.td-target').text(TWK.format(target()));
        $panel.find('.td-tiers').html(tiers());
        $panel.find('.td-goalbtn').toggleClass('td-goalset', !!target());
        restyle();
    });
    $panel.on('change', '.td-goal-input', () => {
        view.tier = ALL;
        update();
    });
    $panel.on('click', '.td-tier', e => {
        const color = $(e.currentTarget).data('tier');
        select('tier', view.tier === color ? ALL : color);
    });
    $panel.on('click', '.td-goalbtn', () => {
        goalOpen = !goalOpen;
        $panel.find('.td-goalrow').prop('hidden', !goalOpen);
        $panel.find('.td-goalbtn').toggleClass('td-active', goalOpen);
    });

    render();
    paint();
});
