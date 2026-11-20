$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.8/twkit.js', dataType: 'script', cache: true }).then(() => {
    const page = game_data.screen === 'map';
    if (!page) return TWK.redirect('map', 'Redirecionando para o mapa...');

    const KEY = `twSupportMap_${game_data.world}`;
    const GOAL_KEY = `twSupportMapGoals_${game_data.world}`;
    const BASE = '#ffffff';
    const CHOSEN = '#0a84ff';
    const TIERS = [
        { min: 1, color: '#30d158', icon: '🟢' },
        { min: .5, color: '#ffd60a', icon: '🟡' },
        { min: .25, color: '#ff9f0a', icon: '🟠' },
        { min: 0, color: '#ff453a', icon: '🔴' },
    ];
    const PATH = 'overview_villages&mode=units&type=away_detail&filter_villages=1&group=0';
    const COMMANDS = 'overview_villages&mode=commands&type=support&group=0';
    const RX_COORD = /\((\d+)\|(\d+)\)\s*\S*\s*$/;
    const POP = { spear: 1, sword: 1, axe: 1, archer: 1, spy: 0, light: 4, marcher: 5, heavy: 4, ram: 5, catapult: 8, knight: 10, snob: 100 };
    const WIDE = 1100;
    const UNIT = 58;
    const GAP = 12;
    const FRAME = 250 + 32 + 42 + 2;
    const NARROW = 400;
    const GUARDS = ['spear', 'sword', 'archer', 'spy', 'heavy'];
    const SCOUT = 'spy';
    const DEFENSES = ['defense', 'defense_cavalry', 'defense_archer'];
    const KINDS = ['Infantaria', 'Cavalaria', 'Arqueiro'];
    const NAMES = { spear: 'lança', sword: 'espada', axe: 'machado', archer: 'arqueiro', spy: 'explorador', light: 'cavalaria leve', marcher: 'arqueiro a cavalo', heavy: 'cavalaria pesada', ram: 'aríete', catapult: 'catapulta', knight: 'paladino', snob: 'nobre' };
    const ALL = '';
    const NONE = '0';
    const EXCESS = 'excess';
    const BELOW = 'below';
    const PERCENTS = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    const VERSION = 2;

    const stored = TWK.store.get(KEY);
    let data = stored?.version === VERSION ? stored : null;
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
            #sm-panel .sm-content.sm-compact { height: auto; padding: 16px; gap: 12px; }
            #sm-panel .sm-empty { display: flex; flex-direction: column; gap: 4px; }
            #sm-panel .sm-empty b { font-size: 13px; font-weight: 600; }
            #sm-panel .sm-empty p { margin: 0; color: var(--muted); font-size: 11px; }
            #sm-panel .sm-content > .twk-loading, #sm-panel .sm-content > .twk-idle { flex: 1; }
            #sm-panel .sm-progress { flex: none; padding: 10px 16px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 11px; }
            #sm-panel .sm-progress span { flex: none; min-width: 170px; }
            #sm-panel .sm-progress i { flex: 1; height: 4px; border-radius: 2px; background: var(--surface); overflow: hidden; }
            #sm-panel .sm-progress b { display: block; width: 0; height: 100%; background: var(--accent); transition: width .3s; }
            #sm-panel .sm-reading .sm-stats, #sm-panel .sm-reading .sm-main { opacity: .45; pointer-events: none; }
            #sm-panel .sm-tool.sm-goalset { color: #30d158; }
            #sm-panel .sm-goalrow {
                flex: none; padding: 8px 12px; display: flex; align-items: center;
                background: var(--surface); border: 1px solid var(--line); border-radius: 8px;
            }
            #sm-panel .sm-goalrow[hidden] { display: none; }
            #sm-panel .sm-goals { flex: none; display: flex; align-items: center; gap: 10px; }
            #sm-panel .sm-goal { position: relative; display: block; width: 110px; }
            #sm-panel .sm-goal img { position: absolute; left: 9px; top: 50%; z-index: 1; width: 16px; height: 16px; transform: translateY(-50%); pointer-events: none; }
            #sm-panel .sm-goal input { padding-left: 32px; }
            #sm-panel .sm-goalrow small { margin-left: auto; padding-left: 16px; color: var(--muted); font-size: 11px; white-space: nowrap; }
            #sm-panel .sm-extra { color: #64d2ff; }
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
            #sm-panel .sm-table { flex: 1; min-height: 0; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 8px; overflow-x: auto; overflow-y: hidden; }
            #sm-panel .sm-head, #sm-panel .sm-row, #sm-panel .sm-foot { display: grid; grid-template-columns: var(--cols); align-items: center; gap: ${GAP}px; padding: 0 16px; }
            #sm-panel .sm-head, #sm-panel .sm-body, #sm-panel .sm-foot { min-width: min-content; }
            #sm-panel .sm-head, #sm-panel .sm-foot { padding-right: 26px; }
            #sm-panel .sm-head { height: 38px; flex: none; background: var(--surface); border-bottom: 1px solid var(--line); color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #sm-panel .sm-head img { width: 18px; height: 18px; }
            #sm-panel .sm-sort { display: flex; align-items: center; gap: 5px; min-width: 0; white-space: nowrap; cursor: pointer; user-select: none; }
            #sm-panel .sm-sort.sm-end { justify-content: flex-end; }
            #sm-panel .sm-sort:hover, #sm-panel .sm-sorted { color: var(--text); }
            #sm-panel .sm-sort svg { width: 11px; height: 11px; flex: none; opacity: .6; }
            #sm-panel .sm-sorted svg { opacity: 1; color: var(--accent); }
            #sm-panel .sm-pick.sm-sparing .sm-toggle { opacity: .2; pointer-events: none; }
            #sm-panel .sm-body { flex: 1; min-height: 0; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
            #sm-panel .sm-body > .twk-idle { height: 100%; justify-content: center; }
            #sm-panel .sm-row { height: 40px; border-bottom: 1px solid var(--line); cursor: pointer; }
            #sm-panel .sm-row:last-child { border-bottom: 0; }
            #sm-panel .sm-row:hover { background: var(--hover); }
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
            #sm-panel .sm-amount { width: 130px; margin-left: 4px; }
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
    const view = { ally: ALL, player: ALL, tier: ALL, sort: null };
    const pick = { off: new Set(), percent: 100, spare: false };
    const goal = TWK.store.get(GOAL_KEY, { spear: 30000, sword: 30000 });
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

    const unitInfo = async () => {
        const xml = await $.ajax({ url: '/interface.php?func=get_unit_info', dataType: 'xml' });
        const list = $(xml).find('config').children().get();
        const read = (el, tag) => +$(el).children(tag).text() || 0;
        return Object.fromEntries(list.map(el => [el.tagName, DEFENSES.map(tag => read(el, tag))]));
    };

    const read = async () => {
        reading = true;
        $refresh.toggleClass('twk-spinning', !!data).prop('disabled', true);
        const result = { version: VERSION, at: Date.now(), units: [], power: {}, players: {}, allies: {}, villages: {}, coming: {} };
        try {
            busy('Lendo a página 1...');
            const first = await TWK.doc(TWK.url(`${PATH}&page=0`));
            const total = pageCount(first);
            result.units = units(first);
            result.power = await unitInfo();
            collect(first, result);
            for (let page = 1; page < total && reading; page++) {
                busy(`Lendo a página ${page + 1} de ${total}...`, page / total);
                collect(await TWK.doc(TWK.url(`${PATH}&page=${page}`)), result);
            }
            if (reading) await travel(result);
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

    const travel = async result => {
        const index = new Map(Object.entries(result.villages).map(([id, v]) => [`${v.x}|${v.y}`, id]));
        busy('Lendo os apoios a caminho...');
        const first = await TWK.doc(TWK.url(`${COMMANDS}&page=0`));
        const total = pageCount(first);
        transit(first, index, result);
        for (let page = 1; page < total && reading; page++) {
            busy(`Lendo os apoios a caminho, página ${page + 1} de ${total}...`, page / total);
            transit(await TWK.doc(TWK.url(`${COMMANDS}&page=${page}`)), index, result);
        }
    };

    const transit = ($doc, index, result) => {
        const order = $doc.find('#commands_table th img[src*="/unit/unit_"]').get().map(img => img.getAttribute('src').match(/unit_(\w+)\./)[1]);
        $doc.find('#commands_table .own_command[data-command-type="support"]').each((_, el) => {
            const $row = $(el).closest('tr');
            const coord = $.trim($row.find('.quickedit-label').first().text()).match(RX_COORD);
            const id = coord && index.get(`${coord[1]}|${coord[2]}`);
            if (!id) return;
            const counts = $row.find('td.unit-item').get().map(td => +td.textContent || 0);
            const troops = result.coming[id] ??= result.units.map(() => 0);
            order.forEach((unit, k) => {
                const i = result.units.findIndex(u => u.unit === unit);
                if (i >= 0) troops[i] += counts[k] || 0;
            });
        });
    };

    const pop = troops => troops.reduce((total, n, i) => total + n * (POP[data.units[i].unit] || 0), 0);

    const arriving = v => data.coming?.[v.id] || v.troops.map(() => 0);

    const stock = v => {
        const incoming = arriving(v);
        return v.troops.map((n, i) => n + incoming[i]);
    };

    const tag = id => data.allies[id] ? `[${TWK.escape(data.allies[id])}]` : 'Sem tribo';

    const inAlly = v => view.ally === ALL || v.ally === view.ally;

    const scope = () => Object.entries(data.villages).map(([id, v]) => ({ ...v, id })).filter(v => inAlly(v) && (view.player === ALL || v.player === view.player));

    const guards = () => data.units.map((u, i) => ({ ...u, i })).filter(u => GUARDS.includes(u.unit));

    const target = () => guards().reduce((total, u) => total + (goal[u.unit] || 0) * (POP[u.unit] || 0), 0);

    const armor = (unit, k) => unit === SCOUT ? 0 : data.power[unit]?.[k] || 0;

    const power = troops => {
        const kinds = data.units.some(u => u.unit === 'archer') ? DEFENSES.length : DEFENSES.length - 1;
        return DEFENSES.slice(0, kinds).map((_, k) => troops.reduce((total, n, i) => total + n * armor(data.units[i].unit, k), 0));
    };

    const required = () => power(data.units.map(u => goal[u.unit] || 0));

    const spies = troops => troops[data.units.findIndex(u => u.unit === SCOUT)] || 0;

    const shares = troops => {
        const have = power(troops);
        const wanted = goal[SCOUT] || 0;
        return [...required().map((n, k) => n ? have[k] / n : null), wanted ? spies(troops) / wanted : null];
    };

    const labels = () => [...KINDS.slice(0, required().length), 'Explorador'];

    const strength = troops => {
        const list = shares(troops).filter(share => share !== null);
        return list.length ? Math.min(...list) : -1;
    };

    const breakdown = v => shares(stock(v))
        .map((share, k) => share === null ? '' : `${labels()[k]} ${Math.floor(share * 100)}%`)
        .filter(Boolean)
        .join(' · ');

    const spare = v => {
        const need = required();
        const have = power(stock(v));
        const left = [...v.troops];
        const taken = v.troops.map(() => 0);
        const room = i => {
            const unit = data.units[i].unit;
            const limits = need.map((n, k) => armor(unit, k) ? Math.floor((have[k] - n) / armor(unit, k)) : Infinity);
            return Math.max(0, Math.min(left[i], ...limits));
        };
        data.units.forEach(() => {
            const best = left.map((_, i) => ({ i, n: room(i) })).reduce((top, c) => c.n * (POP[data.units[c.i].unit] || 0) > top.n * (POP[data.units[top.i].unit] || 0) ? c : top);
            if (!best.n) return;
            left[best.i] -= best.n;
            taken[best.i] += best.n;
            have.forEach((_, k) => have[k] -= best.n * armor(data.units[best.i].unit, k));
        });
        const scout = data.units.findIndex(u => u.unit === SCOUT);
        const wanted = goal[SCOUT] || 0;
        if (scout >= 0 && wanted) taken[scout] = Math.max(0, Math.min(left[scout], spies(stock(v)) - wanted));
        return taken;
    };

    const extra = v => target() ? pop(spare(v)) : 0;

    const surplus = v => !!target() && spare(v).some(Boolean);

    const spareShown = v => extra(v) || spies(spare(v));

    const leftover = v => spare(v).map((n, i) => n ? `${TWK.format(n)} ${NAMES[data.units[i].unit] || data.units[i].unit}` : '').filter(Boolean).join(' · ');

    const below = v => tier(v.id) !== TIERS[0].color;

    const ranked = v => {
        if (view.tier === EXCESS) return surplus(v);
        if (view.tier === BELOW) return below(v);
        return tier(v.id) === view.tier;
    };

    const fits = v => !target() || view.tier === ALL || ranked(v);

    const visible = () => scope().filter(fits);

    const shown = () => new Set([...visible().map(v => v.id), ...chosen]);

    const bounds = i => ({
        low: TWK.format(Math.ceil(target() * TIERS[i].min)),
        high: i ? TWK.format(Math.ceil(target() * TIERS[i - 1].min) - 1) : '',
        next: i ? TWK.format(Math.ceil(target() * TIERS[i - 1].min)) : '',
    });

    const range = i => {
        const b = bounds(i);
        if (!i) return `${b.low}+`;
        if (!TIERS[i].min) return `< ${b.next}`;
        return `${b.low}–${b.high}`;
    };

    const tiers = () => {
        const list = scope();
        const option = (value, label, count) => `<option value="${value}"${view.tier === value ? ' selected' : ''}>${label} (${TWK.format(count)})</option>`;
        const colors = TIERS.map((t, i) => option(t.color, `${t.icon} ${range(i)}`, list.filter(v => tier(v.id) === t.color).length));
        return [
            `<option value="${ALL}">Todas as faixas</option>`,
            option(BELOW, 'Abaixo da meta', list.filter(below).length),
            option(EXCESS, 'Com sobra', list.filter(surplus).length),
            ...colors,
        ].join('');
    };

    const SORTS = {
        player: v => data.players[v.player] || '',
        coming: v => pop(arriving(v)),
        pop: v => pop(v.troops),
        extra: v => extra(v),
    };

    const ASCENDING = ['player'];

    const sorter = () => {
        const sort = view.sort;
        const fallback = (a, b) => pop(b.troops) - pop(a.troops);
        if (!sort) return fallback;
        const unit = sort.key.startsWith('unit:');
        const value = unit ? v => v.troops[+sort.key.slice(5)] : SORTS[sort.key];
        return (a, b) => {
            const x = value(a);
            const y = value(b);
            const order = typeof x === 'string' ? x.localeCompare(y) : x - y;
            return sort.dir * order || fallback(a, b);
        };
    };

    const header = (key, content, extra = '') => {
        const active = view.sort?.key === key;
        const arrow = active && view.sort.dir > 0 ? TWK.ICON.up : TWK.ICON.down;
        return `<span class="sm-sort${active ? ' sm-sorted' : ''}${extra}" data-sort="${key}">${content}${arrow}</span>`;
    };

    const stat = (label, value) => `<div class="sm-stat"><span>${label}</span><b class="twk-mono">${value}</b></div>`;

    const cell = n => `<span class="sm-num${n ? '' : ' sm-zero'}">${n ? TWK.format(n) : '–'}</span>`;

    const goals = () => guards().map(u => `<label class="sm-goal" data-unit="${u.unit}" data-tip="${u.unit}"><img src="${u.src}" alt="${u.unit}">${TWK.number('sm-goal-input', { min: 0, step: 1000, value: goal[u.unit] || 0 })}</label>`).join('');

    const player = (id, name, sub, count) => `<button class="sm-player${id === view.player ? ' sm-active' : ''}" data-player="${id}">
        <div><span>${name}</span><small>${sub}</small></div><b>${count}</b>
    </button>`;

    const render = () => {
        size(!!data);
        $content.removeClass('sm-reading');
        if (!data) return $content.html(`
            <div class="sm-empty"><b>Nenhum apoio lido</b><p>Leia os apoios para ver quem você apoia e as tropas.</p></div>
            <button class="twk-btn twk-primary sm-start">${TWK.ICON.refresh}Ler apoios</button>
        `);
        const all = Object.values(data.villages);
        const scoped = Object.entries(data.villages).map(([id, v]) => ({ ...v, id })).filter(v => inAlly(v) && fits(v));
        const list = visible().sort(sorter());
        const columns = data.units.map((u, i) => ({ ...u, i, total: list.reduce((total, v) => total + v.troops[i], 0) })).filter(u => u.total);
        const owners = Object.entries(data.players)
            .map(([id, name]) => ({ id, name, villages: scoped.filter(v => v.player === id) }))
            .filter(p => p.villages.length || p.id === view.player)
            .sort((a, b) => b.villages.length - a.villages.length);
        const allies = [...new Set(all.map(v => v.ally))].sort((a, b) => tag(a).localeCompare(tag(b)));
        const total = list.reduce((sum, v) => sum + pop(v.troops), 0);
        const scroll = $content.find('.sm-players').scrollTop();
        const fixed = [16, 68, 120, 96, 96, 96, 28];
        const units = columns.map(() => `minmax(${UNIT}px, 1fr)`).join(' ');
        const cols = `16px 68px minmax(120px, 1fr) ${units} 96px 96px 96px 28px`;
        $panel.css('width', Math.max(WIDE, FRAME + fixed.reduce((sum, n) => sum + n, 0) + columns.length * UNIT + (fixed.length + columns.length - 1) * GAP));
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
                    ${target() ? `<div class="twk-field">
                        <span class="twk-label">Meta</span>
                        <select class="sm-tier">${tiers()}</select>
                    </div>` : ''}
                    <span class="twk-label">Jogadores</span>
                    <div class="sm-players">
                        ${player(ALL, 'Todos os jogadores', TWK.plural(owners.length, 'jogador', 'jogadores'), scoped.length)}
                        ${owners.map(p => player(p.id, TWK.escape(p.name), [...new Set(p.villages.map(v => v.ally))].map(tag).join(' '), p.villages.length)).join('')}
                    </div>
                </aside>
                <section class="sm-area">
                    <div class="sm-pick${pick.spare ? ' sm-sparing' : ''}">
                        <span class="twk-caption">Retirar</span>
                        ${columns.map(u => `<button class="sm-toggle${pick.off.has(u.unit) ? '' : ' sm-on'}" data-unit="${u.unit}" data-tip="${u.unit}"><img src="${u.src}" alt="${u.unit}"></button>`).join('')}
                        <select class="sm-amount">
                            ${PERCENTS.map(n => `<option value="${n}"${!pick.spare && n === pick.percent ? ' selected' : ''}>${n}%</option>`).join('')}
                            ${target() ? `<option value="${EXCESS}"${pick.spare ? ' selected' : ''}>Só a sobra</option>` : ''}
                        </select>
                        <div class="sm-tools">
                            <button class="twk-btn sm-tool sm-mapmode${picking ? ' sm-active' : ''}" data-tip="Selecionar no mapa">${TWK.ICON.target}</button>
                            <button class="twk-btn sm-tool sm-copy" data-tip="Copiar coordenadas">${TWK.ICON.copy}</button>
                            <button class="twk-btn sm-tool sm-goalbtn${target() ? ' sm-goalset' : ''}${goalOpen ? ' sm-active' : ''}" data-tip="Meta por aldeia">${TWK.ICON.chart}</button>
                            <button class="twk-btn sm-remove"${chosen.size ? '' : ' disabled'}>${removal()}</button>
                        </div>
                    </div>
                    <div class="sm-goalrow"${goalOpen ? '' : ' hidden'}>
                        <div class="sm-goals">${goals()}</div>
                        <small>Meta: <b class="sm-target twk-mono">${TWK.format(target())}</b> de população</small>
                    </div>
                    <div class="sm-table" style="--cols: ${cols}">
                        <div class="sm-head">
                            <input type="checkbox" class="sm-check sm-check-all"${list.length && list.every(v => chosen.has(v.id)) ? ' checked' : ''}>
                            <span>Aldeia</span>${header('player', 'Jogador')}
                            ${columns.map(u => header(`unit:${u.i}`, `<img src="${u.src}" alt="${u.unit}" data-tip="${u.unit}">`, ' sm-end')).join('')}
                            ${header('coming', 'A caminho', ' sm-end')}${header('pop', 'População', ' sm-end')}${header('extra', '<span data-tip="Tropa além da meta que dá para tirar">Sobra</span>', ' sm-end')}<span></span>
                        </div>
                        <div class="sm-body">
                            ${list.map(v => `<div class="sm-row${chosen.has(v.id) ? ' sm-chosen' : ''}" data-id="${v.id}" data-x="${v.x}" data-y="${v.y}">
                                <input type="checkbox" class="sm-check"${chosen.has(v.id) ? ' checked' : ''}>
                                <b class="twk-mono"${target() ? ` data-tip="${breakdown(v)}"` : ''}>${v.x}|${v.y}</b>
                                <span class="sm-owner">${TWK.escape(data.players[v.player] || '')}</span>
                                ${columns.map(u => cell(v.troops[u.i])).join('')}
                                ${cell(pop(arriving(v)))}
                                <span class="sm-num sm-pop">${TWK.format(pop(v.troops))}</span>
                                ${surplus(v) ? `<span class="sm-num sm-extra" data-tip="${leftover(v)}">${TWK.format(spareShown(v))}</span>` : cell(0)}
                                <button class="sm-del" data-tip="${retreat()}">${TWK.ICON.clear}</button>
                            </div>`).join('') || nothing()}
                        </div>
                        <div class="sm-foot">
                            <span></span><span>Total</span><span></span>
                            ${columns.map(u => `<span class="sm-num${u.total ? '' : ' sm-zero'}" data-tip="${TWK.format(u.total)}">${short(u.total)}</span>`).join('')}
                            ${cell(list.reduce((sum, v) => sum + pop(arriving(v)), 0))}<span class="sm-num sm-pop">${TWK.format(total)}</span>${cell(list.reduce((sum, v) => sum + extra(v), 0))}<span></span>
                        </div>
                    </div>
                </section>
            </div>
        `);
        $content.find('.sm-players').scrollTop(scroll);
    };

    const tier = id => {
        const village = data.villages[id];
        const ratio = village && target() ? strength(stock({ ...village, id })) : -1;
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
        const ids = shown();
        Object.entries(data.villages)
            .filter(([id, v]) => ids.has(id) && v.x >= sector.x && v.x < sector.x + span && v.y >= sector.y && v.y < sector.y + span)
            .forEach(([id, v]) => {
                const $el = $(`<div class="sm-mark" data-id="${id}" data-kind="${kind}">`)
                    .css({ position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', ...look(kind, id) });
                if (kind === 'main') $el.append(badge(v));
                sector.appendElement($el[0], v.x - sector.x, v.y - sector.y);
            });
    };

    const restyle = () => $('.sm-mark').each((_, el) => $(el).css(look(el.dataset.kind, el.dataset.id)));

    const at = (x, y) => {
        const ids = shown();
        return Object.keys(data.villages).find(id => ids.has(id) && data.villages[id].x === x && data.villages[id].y === y);
    };

    const paint = () => {
        if (!data) return;
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
        render();
        TWMap.reload();
    };

    const retreat = () => pick.spare && target() ? 'Retirar a sobra desta aldeia' : `Retirar ${pick.percent}% desta aldeia`;

    const nothing = () => Object.keys(data.villages).length
        ? TWK.idle(TWK.ICON.target, 'Nenhuma aldeia com esses filtros', 'Troque a tribo, o jogador ou a faixa para ver outras aldeias.')
        : TWK.idle(TWK.ICON.target, 'Nenhum apoio enviado', 'Quando você apoiar alguma aldeia, ela aparece aqui.');

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
        const hidden = !on && !visible().some(v => v.id === id);
        if (hidden) $(`.sm-mark[data-id="${id}"]`).remove();
        refresh();
    };

    const withdraw = async id => {
        const $form = (await TWK.doc(TWK.url(`info_village&id=${id}`))).find('#withdraw_selected_units_village_info');
        const body = { village_id: id, h: game_data.csrf };
        const removed = {};
        const sparing = pick.spare && !!target();
        const limit = sparing ? Object.fromEntries(spare({ ...data.villages[id], id }).map((n, i) => [data.units[i].unit, n])) : null;
        const allowed = unit => sparing ? limit[unit] > 0 : !pick.off.has(unit);
        $form.find('input.unit-selection').each((_, el) => {
            const wanted = allowed(el.name.replace('checkbox_', ''));
            if (wanted) body[el.name] = 'on';
        });
        $form.find('td[data-away-id][data-unit-count]').each((_, td) => {
            const available = +td.getAttribute('data-unit-count');
            const share = Math.floor(available * pick.percent / 100);
            const count = sparing ? Math.min(available, limit[td.id] || 0) : share;
            const wanted = count && allowed(td.id);
            if (!wanted) return;
            if (sparing) limit[td.id] -= count;
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
        TWMap.reload();
        if (done) UI.SuccessMessage(`Apoios removidos de ${TWK.plural(done, 'aldeia', 'aldeias')}`);
    };

    const copy = () => TWK.copy(visible().map(v => `${v.x}|${v.y}`).join('\n'), 'Coordenadas copiadas');

    $panel.on('click', '.sm-refresh, .sm-start', read);
    $panel.on('change', '.sm-ally', e => select('ally', e.currentTarget.value));
    $panel.on('click', '.sm-player', e => select('player', String($(e.currentTarget).data('player'))));
    $panel.on('click', '.sm-row', e => TWMap.focusUserSpecified($(e.currentTarget).data('x'), $(e.currentTarget).data('y')));
    $panel.on('click', '.sm-copy', copy);
    $panel.on('click', '.sm-sort', e => {
        const key = $(e.currentTarget).data('sort');
        const first = ASCENDING.includes(key) ? 1 : -1;
        const same = view.sort?.key === key;
        const reset = same && view.sort.dir !== first;
        view.sort = reset ? null : { key, dir: same ? -first : first };
        render();
    });
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
        goal[$(e.currentTarget).closest('.sm-goal').data('unit')] = Math.max(0, parseInt(e.currentTarget.value) || 0);
        TWK.store.set(GOAL_KEY, goal);
        $panel.find('.sm-target').text(TWK.format(target()));
        $panel.find('.sm-tier').html(tiers());
        $panel.find('.sm-goalbtn').toggleClass('sm-goalset', !!target());
        restyle();
    });
    $panel.on('change', '.sm-goal-input', () => {
        render();
        TWMap.reload();
    });
    $panel.on('change', '.sm-tier', e => select('tier', e.currentTarget.value));
    $panel.on('click', '.sm-goalbtn', () => {
        goalOpen = !goalOpen;
        $panel.find('.sm-goalrow').prop('hidden', !goalOpen);
        $panel.find('.sm-goalbtn').toggleClass('sm-active', goalOpen);
    });
    $panel.on('change', '.sm-amount', e => {
        const value = e.currentTarget.value;
        pick.spare = value === EXCESS;
        if (!pick.spare) pick.percent = +value;
        $panel.find('.sm-pick').toggleClass('sm-sparing', pick.spare);
        $panel.find('.sm-del').attr('data-tip', retreat());
    });
    $panel.on('click', '.sm-del', e => {
        e.stopPropagation();
        remove([String($(e.currentTarget).closest('.sm-row').data('id'))]);
    });

    render();
    paint();
});
