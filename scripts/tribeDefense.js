$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.8/twkit.js', dataType: 'script', cache: true }).then(() => {
    const page = game_data.screen === 'map';
    if (!page) return TWK.redirect('map', 'Redirecionando para o mapa...');

    const KEY = `twTribeDefense_${game_data.world}`;
    const SETTINGS_KEY = `twTribeDefenseSettings_${game_data.world}`;
    const BASE = '#ffffff';
    const ALERT = '#ff453a';
    const CHOSEN = '#0a84ff';
    const UNKNOWN = '#8e8e93';
    const TIERS = [
        { min: 1, color: '#30d158', icon: '🟢' },
        { min: .5, color: '#ffd60a', icon: '🟡' },
        { min: .25, color: '#ff9f0a', icon: '🟠' },
        { min: 0, color: '#ff453a', icon: '🔴' },
    ];
    const DEFENSE = 'ally&mode=members_defense';
    const BUILDINGS = 'ally&mode=members_buildings';
    const CONTRACTS = 'ally&mode=contracts';
    const GUARDS = ['spear', 'sword', 'archer', 'spy', 'heavy'];
    const WEIGHT = { heavy: 4, spy: 0 };
    const SCOUT = 'spy';
    const DEFENSES = ['defense', 'defense_cavalry', 'defense_archer'];
    const KINDS = ['Infantaria', 'Cavalaria', 'Arqueiro'];
    const STALE = 60 * 60 * 1000;
    const ENEMIES = 2;
    const LIMIT = 15;
    const CLOSE = 5;
    const NEIGHBORS = 5;
    const CELL = 10;
    const RX_COORD = /\((\d+)\|(\d+)\)\s*\S*\s*$/;
    const FRAME = 986;
    const UNIT = 58;
    const GAP = 10;
    const NARROW = 400;
    const ALL = '';
    const BELOW = 'below';
    const SHIELD = TWK.svg('<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6Z"/>');

    const VERSION = 7;

    const stored = TWK.store.get(KEY);
    let data = stored?.version === VERSION ? stored : null;
    let reading = false;

    const settings = { goal: { spear: 30000, sword: 30000 }, reach: 5, wall: 0, area: null, ...TWK.store.get(SETTINGS_KEY, {}) };
    settings.reach = Math.min(LIMIT, Math.max(1, settings.reach));
    const legacy = settings.area && !Array.isArray(settings.area);
    if (legacy) settings.area = [[settings.area.x1, settings.area.y1], [settings.area.x2, settings.area.y1], [settings.area.x2, settings.area.y2], [settings.area.x1, settings.area.y2]];
    const view = { member: ALL, tier: ALL, foe: ALL, sort: null };
    const scales = {};
    let goalOpen = false;
    let marks = new Map();
    let picking = false;
    let drawing = null;
    let chosen = new Set();
    let pivot = null;

    const $panel = TWK.panel({
        id: 'td-panel',
        title: 'Defesa da Tribo',
        sub: 'Front da tribo e o que falta para a meta',
        icon: SHIELD,
        width: NARROW,
        fold: true,
        dock: true,
        actions: `<button class="twk-icon td-refresh" data-tip="Atualizar">${TWK.ICON.refresh}</button>`,
        onClose: () => {
            reading = false;
            stop();
            picking = false;
        },
        css: `
            #td-panel .twk-body { padding: 0; gap: 0; max-height: none; overflow: visible; }
            #td-panel .td-content { height: min(620px, 72vh); display: flex; flex-direction: column; }
            #td-panel .td-content.td-compact { height: auto; padding: 16px; gap: 12px; }
            #td-panel .td-empty { display: flex; flex-direction: column; gap: 4px; }
            #td-panel .td-empty b { font-size: 13px; font-weight: 600; }
            #td-panel .td-empty p { margin: 0; color: var(--muted); font-size: 11px; }
            #td-panel .td-content > .twk-loading, #td-panel .td-content > .twk-idle { flex: 1; }
            #td-panel .td-progress { flex: none; padding: 10px 16px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 11px; }
            #td-panel .td-progress span { flex: none; min-width: 220px; }
            #td-panel .td-progress i { flex: 1; height: 4px; border-radius: 2px; background: var(--surface); overflow: hidden; }
            #td-panel .td-progress b { display: block; width: 0; height: 100%; background: var(--accent); transition: width .3s; }
            #td-panel .td-reading .td-stats, #td-panel .td-reading .td-main { opacity: .45; pointer-events: none; }
            #td-panel .td-tool.td-set { color: #30d158; }
            #td-panel .td-goalrow {
                flex: none; padding: 10px 12px; display: flex; flex-direction: column; gap: 10px;
                background: var(--surface); border: 1px solid var(--line); border-radius: 8px;
            }
            #td-panel .td-goalrow[hidden] { display: none; }
            #td-panel .td-goals { display: flex; align-items: center; gap: 14px; }
            #td-panel .td-goal { position: relative; display: block; width: 120px; }
            #td-panel .td-goal img { position: absolute; left: 9px; top: 50%; z-index: 1; width: 16px; height: 16px; transform: translateY(-50%); pointer-events: none; }
            #td-panel .td-goal input { padding-left: 32px; }
            #td-panel .td-goals small { margin-left: auto; color: var(--muted); font-size: 11px; }
            #td-panel .td-stats { display: grid; grid-template-columns: repeat(5, 1fr); border-bottom: 1px solid var(--line); }
            #td-panel .td-stat { padding: 12px 16px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--line); }
            #td-panel .td-stat:last-child { border-right: 0; }
            #td-panel .td-stat span { color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #td-panel .td-stat b { font-size: 16px; font-weight: 600; white-space: nowrap; }
            #td-panel .td-main { flex: 1; min-height: 0; display: grid; grid-template-columns: 220px 1fr; }
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
            #td-panel .td-member > b.td-attacked { background: rgba(255, 69, 58, .18); color: #ff453a; }
            #td-panel .td-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
            #td-panel .td-front { position: relative; display: flex; align-items: center; }
            #td-panel .td-front .twk-number { width: 168px; }
            #td-panel .td-front .twk-number input { padding-left: 80px; padding-right: 70px; }
            #td-panel .td-front .twk-caption { position: absolute; z-index: 1; color: var(--muted); pointer-events: none; }
            #td-panel .td-front .td-before {
                top: 1px; bottom: 1px; left: 1px; padding: 0 10px; display: flex; align-items: center;
                background: var(--hover); border-right: 1px solid var(--line); border-radius: 5px 0 0 5px;
            }
            #td-panel .td-front .td-after { right: 28px; }
            #td-panel .td-foe { width: 150px; }
            #td-panel .td-tier { width: 170px; }
            #td-panel .td-zone-draw.td-active, #td-panel .td-mapmode.td-active { border-color: #0a84ff; color: #0a84ff; }
            #td-panel .td-hint { flex: none; padding: 8px 12px; border: 1px dashed var(--line-hi); border-radius: 8px; color: var(--muted); font-size: 11px; }
            #td-panel .td-tag { color: var(--muted); font-family: system-ui, sans-serif; }
            #td-panel .td-bar .td-tools { margin-left: auto; display: flex; gap: 6px; }
            #td-panel .td-table { flex: 1; min-height: 0; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 8px; overflow-x: auto; overflow-y: hidden; }
            #td-panel .td-head, #td-panel .td-row, #td-panel .td-foot { display: grid; grid-template-columns: var(--cols); align-items: center; gap: ${GAP}px; padding: 0 16px; }
            #td-panel .td-head, #td-panel .td-foot { padding-right: 26px; }
            #td-panel .td-head, #td-panel .td-body, #td-panel .td-foot { min-width: min-content; }
            #td-panel .td-head { height: 38px; flex: none; background: var(--surface); border-bottom: 1px solid var(--line); color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #td-panel .td-head img { width: 18px; height: 18px; }
            #td-panel .td-sort { display: flex; align-items: center; gap: 5px; min-width: 0; white-space: nowrap; cursor: pointer; user-select: none; }
            #td-panel .td-sort.td-end { justify-content: flex-end; }
            #td-panel .td-sort:hover, #td-panel .td-sorted { color: var(--text); }
            #td-panel .td-sort svg { width: 11px; height: 11px; flex: none; opacity: .6; }
            #td-panel .td-sorted svg { opacity: 1; color: var(--accent); }
            #td-panel .td-enemy { min-width: 0; display: flex; justify-content: space-between; gap: 6px; }
            #td-panel .td-enemy .td-tag { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            #td-panel .td-stale b { color: #ff9f0a; }
            #td-panel .td-body { flex: 1; min-height: 0; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
            #td-panel .td-body > .twk-idle { height: 100%; justify-content: center; }
            #td-panel .td-row { height: 40px; border-bottom: 1px solid var(--line); cursor: pointer; }
            #td-panel .td-row:last-child { border-bottom: 0; }
            #td-panel .td-row:hover { background: var(--hover); }
            #td-panel .td-row.td-chosen { background: rgba(10, 132, 255, .1); }
            #td-panel .td-coord { display: flex; align-items: center; gap: 6px; }
            #td-panel .td-dot { width: 8px; height: 8px; flex: none; border-radius: 50%; }
            #td-panel .td-pick, #td-panel .td-pick-all { width: 14px; height: 14px; margin: 0; accent-color: var(--accent); cursor: pointer; }
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

    const unitInfo = async () => {
        const xml = await $.ajax({ url: '/interface.php?func=get_unit_info', dataType: 'xml' });
        const list = $(xml).find('config').children().get();
        const read = (el, tag) => +$(el).children(tag).text() || 0;
        return {
            pop: Object.fromEntries(list.map(el => [el.tagName, read(el, 'pop')])),
            power: Object.fromEntries(list.map(el => [el.tagName, DEFENSES.map(tag => read(el, tag))])),
        };
    };

    const enemies = $doc => {
        let section = -1;
        return Object.fromEntries($doc.find('#partners tr').get().flatMap(tr => {
            const header = $(tr).children('th').length > 0;
            if (header) section++;
            const wanted = !header && section === ENEMIES;
            return wanted ? $(tr).find('a[href*="info_ally"]').get().map(a => [idOf(a), $.trim(a.textContent)]) : [];
        }));
    };

    const bucket = points => points.reduce((grid, p) => {
        (grid[`${Math.floor(p.x / CELL)}|${Math.floor(p.y / CELL)}`] ??= []).push(p);
        return grid;
    }, {});

    const near = (grid, v, radius) => {
        const cx = Math.floor(v.x / CELL);
        const cy = Math.floor(v.y / CELL);
        const ring = Math.ceil(radius / CELL);
        const found = [];
        for (let dx = -ring; dx <= ring; dx++) {
            for (let dy = -ring; dy <= ring; dy++) {
                found.push(...(grid[`${cx + dx}|${cy + dy}`] || []).filter(p => Math.hypot(p.x - v.x, p.y - v.y) <= radius));
            }
        }
        return found;
    };

    const hostile = async (allies, hidden) => {
        const [villages, players] = await Promise.all([TWK.get('/map/village.txt'), TWK.get('/map/player.txt')]);
        const foes = new Map(players.split('\n').map(line => line.split(',')).filter(([, , ally]) => ally in allies).map(([id, , ally]) => [id, ally]));
        const rows = villages.split('\n').map(line => line.split(','));
        const points = rows.filter(([, , , , player]) => foes.has(player)).map(([, , x, y, player]) => ({ x: +x, y: +y, ally: foes.get(player) }));
        const all = bucket(points);
        const grid = bucket(points.filter(p => near(all, p, CLOSE).length > NEIGHBORS));
        const unknown = rows.filter(([, , , , player]) => hidden.has(player)).map(([, , x, y]) => ({ x: +x, y: +y }));
        return { grid, unknown };
    };

    const closest = (grid, v) => {
        const [nearest] = near(grid, v, LIMIT)
            .map(p => ({ ally: p.ally, distance: Math.hypot(p.x - v.x, p.y - v.y) }))
            .sort((a, b) => a.distance - b.distance);
        return { gap: nearest ? Math.round(nearest.distance * 10) / 10 : null, foe: nearest?.ally ?? null };
    };


    const column = ($doc, icon) => $doc.find(`#ally_content img[src*="/${icon}."]`).closest('th').index();

    const defense = ($doc, player, result) => {
        const attacks = column($doc, 'att');
        $doc.find('#ally_content table.vis td[rowspan] a[href*="info_village"]').each((_, link) => village($(link), player, attacks, result));
    };

    const village = ($link, player, attacks, result) => {
        const coord = $.trim($link.text()).match(RX_COORD);
        if (!coord) return;
        const $row = $link.closest('tr');
        result.villages[idOf($link[0])] = {
            x: +coord[1],
            y: +coord[2],
            player,
            home: numbers($row.children('td').not('[rowspan]').slice(1)),
            coming: numbers($row.next('tr').children('td').slice(1)),
            attacks: attacks < 0 ? null : +$.trim($row.children().eq(attacks).text()) || 0,
            wall: null,
            gap: null,
            foe: null,
        };
    };

    const walls = ($doc, result) => {
        const wall = column($doc, 'wall');
        if (wall < 0) return;
        $doc.find('#ally_content table.vis a[href*="info_village"]').each((_, anchor) => {
            const village = result.villages[idOf(anchor)];
            if (village) village.wall = +$.trim($(anchor).closest('tr').children().eq(wall).text()) || 0;
        });
    };

    const size = wide => {
        $panel.css('width', wide ? FRAME + guards().length * (UNIT + GAP) : NARROW);
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
        $refresh.toggleClass('twk-spinning', !!data).prop('disabled', true);
        const result = { version: VERSION, at: Date.now(), units: [], pop: {}, power: {}, members: {}, hidden: [], unknown: [], tribes: {}, villages: {} };
        let allowed = true;
        try {
            busy('Lendo os membros...');
            const first = await TWK.doc(TWK.url(DEFENSE));
            const $options = first.find('select[name="player_id"] option[value]');
            allowed = $options.length > 0;
            const members = $options.not('[disabled]').get().map(el => [el.value, $.trim(el.textContent)]);
            const $hidden = $options.filter('[disabled]');
            result.hidden = $hidden.get().map(el => $.trim(el.textContent));
            Object.assign(result, await unitInfo());
            busy('Lendo os inimigos da diplomacia...');
            result.tribes = enemies(await TWK.doc(TWK.url(CONTRACTS)));
            const { grid, unknown } = await hostile(result.tribes, new Set($hidden.get().map(el => el.value)));
            result.unknown = unknown.map(v => ({ ...v, ...closest(grid, v) })).filter(v => v.gap !== null);
            for (const [n, [id, name]] of members.entries()) {
                if (!reading) break;
                busy(`Lendo ${name} (${n + 1} de ${members.length})...`, n / members.length);
                const $doc = await TWK.doc(TWK.url(`${DEFENSE}&player_id=${id}`));
                result.units = result.units.length ? result.units : units($doc);
                result.members[id] = name;
                defense($doc, id, result);
                walls(await TWK.doc(TWK.url(`${BUILDINGS}&player_id=${id}`)), result);
            }
            Object.values(result.villages).forEach(v => Object.assign(v, closest(grid, v)));
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
            chosen = new Set();
            TWK.store.set(KEY, data);
            paint();
        }
        render();
    };

    const guards = () => data.units.map((u, i) => ({ ...u, i })).filter(u => GUARDS.includes(u.unit));

    const weight = unit => WEIGHT[unit] ?? data.pop[unit] ?? 0;

    const pop = troops => troops.reduce((total, n, i) => total + n * weight(data.units[i]?.unit), 0);

    const stock = v => v.home.map((n, i) => n + (v.coming[i] || 0));

    const target = () => guards().reduce((total, u) => total + (settings.goal[u.unit] || 0) * weight(u.unit), 0);

    const armor = (unit, k) => unit === SCOUT ? 0 : data.power[unit]?.[k] || 0;

    const power = troops => {
        const kinds = 'archer' in data.pop ? DEFENSES.length : DEFENSES.length - 1;
        return DEFENSES.slice(0, kinds).map((_, k) => troops.reduce((total, n, i) => total + n * armor(data.units[i]?.unit, k), 0));
    };

    const required = () => power(data.units.map(u => settings.goal[u.unit] || 0));

    const spies = troops => troops[data.units.findIndex(u => u.unit === SCOUT)] || 0;

    const shares = v => {
        const troops = stock(v);
        const have = power(troops);
        const wanted = settings.goal[SCOUT] || 0;
        return [...required().map((n, k) => n ? have[k] / n : null), wanted ? spies(troops) / wanted : null];
    };

    const labels = () => [...KINDS.slice(0, required().length), 'Explorador'];

    const strength = v => {
        const list = shares(v).filter(share => share !== null);
        return list.length ? Math.min(...list) : -1;
    };

    const breakdown = v => shares(v)
        .map((share, k) => share === null ? '' : `${labels()[k]} ${Math.floor(share * 100)}%`)
        .filter(Boolean)
        .join(' · ');

    const lacking = v => {
        const need = required();
        const have = power(stock(v));
        const send = guards().map(() => 0);
        const options = guards().map((u, k) => ({ ...u, k })).filter(u => settings.goal[u.unit] > 0 && u.unit !== SCOUT);
        const scout = guards().findIndex(u => u.unit === SCOUT);
        if (scout >= 0) send[scout] = Math.max(0, (settings.goal[SCOUT] || 0) - spies(stock(v)));
        need.forEach(() => {
            const weakest = need.map((n, d) => ({ d, share: n ? have[d] / n : Infinity })).sort((a, b) => a.share - b.share)[0];
            const covered = !options.length || weakest.share >= 1;
            if (covered) return;
            const value = u => armor(u.unit, weakest.d) / (data.pop[u.unit] || 1);
            const best = options.reduce((top, u) => value(u) > value(top) ? u : top);
            const each = armor(best.unit, weakest.d);
            if (!each) return;
            const count = Math.ceil((need[weakest.d] - have[weakest.d]) / each);
            send[best.k] += count;
            have.forEach((_, d) => have[d] += count * armor(best.unit, d));
        });
        return send;
    };

    const short = v => {
        const need = lacking(v);
        return guards().reduce((total, u, k) => total + need[k] * weight(u.unit), 0);
    };

    const front = v => v.gap !== null && v.gap <= settings.reach;

    const inside = v => !settings.area || within(settings.area, v.x, v.y);

    const weak = v => v.wall !== null && v.wall < settings.wall;

    const needy = v => !!target() || v.attacks > 0 || weak(v);

    const paintColor = v => {
        if (chosen.has(v.id)) return CHOSEN;
        return target() ? tier(v.id) : ALERT;
    };

    const tag = id => data.tribes[id] ? `[${TWK.escape(data.tribes[id])}]` : '';

    const zone = () => Object.entries(data.villages).map(([id, v]) => ({ ...v, id })).filter(v => front(v) && inside(v));

    const scope = () => zone().filter(v => (view.member === ALL || v.player === view.member) && (view.foe === ALL || v.foe === view.foe));

    const below = v => tier(v.id) !== TIERS[0].color;

    const ranked = v => {
        if (view.tier === BELOW) return below(v);
        return tier(v.id) === view.tier;
    };

    const visible = () => scope().filter(v => !target() || view.tier === ALL || ranked(v));

    const tier = id => {
        const village = data.villages[id];
        const goal = target();
        const ratio = village && goal ? strength(village) : -1;
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

    const tiers = () => {
        const list = scope();
        const options = TIERS.map((t, i) => {
            const count = list.filter(v => tier(v.id) === t.color).length;
            return `<option value="${t.color}"${view.tier === t.color ? ' selected' : ''}>${t.icon} ${range(i)} (${TWK.format(count)})</option>`;
        });
        const under = list.filter(below).length;
        return `<option value="${ALL}">Todas as faixas</option><option value="${BELOW}"${view.tier === BELOW ? ' selected' : ''}>Abaixo da meta (${TWK.format(under)})</option>${options.join('')}`;
    };

    const compact = n => {
        if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', ',')}M`;
        if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
        return String(n);
    };

    const stat = (label, value, extra = '') => `<div class="td-stat${extra}"><span>${label}</span><b class="twk-mono">${value}</b></div>`;

    const ago = time => {
        const minutes = Math.floor((Date.now() - time) / 60000);
        if (minutes < 60) return `há ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        return hours < 24 ? `há ${hours}h` : `há ${Math.floor(hours / 24)}d`;
    };

    const SORTS = {
        member: v => data.members[v.player] || '',
        coming: v => pop(v.coming),
        gap: v => v.gap ?? LIMIT + 1,
        attacks: v => v.attacks,
        wall: v => v.wall ?? -1,
        pop: v => pop(v.home),
        missing: v => short(v),
    };

    const ASCENDING = ['member', 'gap', 'wall'];

    const priority = (a, b) => b.attacks - a.attacks || weak(b) - weak(a) || (target() ? short(b) - short(a) : SORTS.gap(a) - SORTS.gap(b));

    const sorter = () => {
        const sort = view.sort;
        if (!sort) return priority;
        const unit = sort.key.startsWith('unit:');
        const value = unit ? v => v.home[+sort.key.slice(5)] : SORTS[sort.key];
        return (a, b) => {
            const x = value(a);
            const y = value(b);
            const order = typeof x === 'string' ? x.localeCompare(y) : x - y;
            return sort.dir * order || priority(a, b);
        };
    };

    const header = (key, content, extra = '') => {
        const active = view.sort?.key === key;
        const arrow = active && view.sort.dir > 0 ? TWK.ICON.up : TWK.ICON.down;
        return `<span class="td-sort${active ? ' td-sorted' : ''}${extra}" data-sort="${key}">${content}${arrow}</span>`;
    };

    const cell = (n, extra = '', tip = '') => `<span class="td-num${n ? extra : ' td-zero'}"${tip ? ` data-tip="${tip}"` : ''}>${n ? TWK.format(n) : '–'}</span>`;

    const incoming = villages => villages.reduce((sum, v) => sum + v.attacks, 0);

    const picked = list => {
        const selection = list.filter(v => chosen.has(v.id));
        return selection.length ? selection : list;
    };

    const sum = (list, value) => list.reduce((total, v) => total + value(v), 0);

    const stats = (list, counted) => {
        const selecting = counted !== list;
        const stale = Date.now() - data.at > STALE;
        return `<div class="td-stats">
            ${stat(selecting ? 'Selecionadas' : 'Aldeias', selecting ? `${TWK.format(counted.length)} de ${TWK.format(list.length)}` : TWK.format(list.length))}
            ${stat('Defesa', TWK.format(sum(counted, v => pop(v.home))))}
            ${stat('A caminho', TWK.format(sum(counted, v => pop(v.coming))))}
            ${stat('Falta', target() ? TWK.format(sum(counted, short)) : '–')}
            ${stat(`Atualizado ${ago(data.at)}`, new Date(data.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }), stale ? ' td-stale' : '')}
        </div>`;
    };

    const copier = selecting => {
        const lines = exported().length;
        const tip = selecting ? 'Só as aldeias selecionadas' : view.member === ALL ? 'Aldeias visíveis de todos os membros' : `Só as aldeias de ${TWK.escape(data.members[view.member] || '')}`;
        return `<button class="twk-btn td-export"${lines ? '' : ' disabled'} data-tip="${tip}">${TWK.ICON.copy}Copiar o que falta${lines ? ` (${TWK.format(lines)})` : ''}</button>`;
    };

    const foot = counted => `<div class="td-foot">
        <span></span><span>Total</span><span></span>
        ${guards().map(u => sum(counted, v => v.home[u.i])).map(total => `<span class="td-num" data-tip="${TWK.format(total)}">${compact(total)}</span>`).join('')}
        ${cell(sum(counted, v => pop(v.coming)))}
        <span></span>
        ${cell(incoming(counted), ' td-missing')}
        <span></span>
        <span class="td-num td-pop">${TWK.format(sum(counted, v => pop(v.home)))}</span>
        ${cell(sum(counted, short), ' td-missing')}
    </div>`;

    const member = (id, name, sub, villages) => {
        const attacks = incoming(villages);
        const hidden = villages.every(v => v.attacks === null);
        const tip = hidden ? 'Não compartilha os ataques' : 'Ataques chegando';
        return `<button class="td-member${id === view.member ? ' td-active' : ''}" data-member="${id}">
            <div><span>${name}</span><small>${sub}</small></div><b class="${attacks ? 'td-attacked' : ''}" data-tip="${tip}">${hidden ? '–' : TWK.format(attacks)}</b>
        </button>`;
    };

    const nothing = () => {
        if (zone().length) return TWK.idle(SHIELD, 'Nenhuma aldeia com esses filtros', 'Troque o membro, o inimigo ou a faixa para ver outras aldeias.');
        if (settings.area) return TWK.idle(SHIELD, 'Nenhuma aldeia na área', 'Desenhe outra área ou limpe a atual no lápis.');
        return TWK.idle(SHIELD, 'Nenhuma aldeia no front', 'Aumente o front para pegar aldeias mais longe do inimigo.');
    };

    const goals = () => `${guards().map(u => `<label class="td-goal" data-unit="${u.unit}" data-tip="${u.unit}"><img src="${u.src}" alt="${u.unit}">${TWK.number('td-goal-input', { min: 0, step: 1000, value: settings.goal[u.unit] || 0 })}</label>`).join('')}
        <label class="td-goal" data-tip="Muralha mínima"><img src="${window.image_base}buildings/wall.webp" alt="">${TWK.number('td-wall-input', { min: 0, max: 20, step: 1, value: settings.wall })}</label>
        <small>Meta: <b class="td-target twk-mono">${TWK.format(target())}</b> de população</small>`;

    const render = () => {
        size(!!data);
        $content.removeClass('td-reading');
        if (!data) return $content.html(`
            <div class="td-empty"><b>Nenhuma defesa lida</b><p>Leia a defesa da tribo para ver o front e o que falta.</p></div>
            <button class="twk-btn twk-primary td-start">${TWK.ICON.refresh}Ler defesa</button>
        `);
        const all = zone();
        const goal = target();
        const list = visible().sort(sorter());
        const foes = [...new Set(all.map(v => v.foe).filter(Boolean))].sort((a, b) => tag(a).localeCompare(tag(b)));
        const counted = picked(list);
        const every = list.length > 0 && list.every(v => chosen.has(v.id));
        const area = settings.area;
        const columns = guards();
        const members = Object.entries(data.members)
            .map(([id, name]) => ({ id, name, villages: all.filter(v => v.player === id) }))
            .filter(m => m.villages.length)
            .map(m => ({ ...m, attacks: incoming(m.villages) }))
            .sort((a, b) => b.attacks - a.attacks || a.name.localeCompare(b.name));
        const scroll = $content.find('.td-members').scrollTop();
        const rows = $content.find('.td-body').scrollTop();
        const cols = `16px 82px minmax(70px, 1fr) repeat(${columns.length}, ${UNIT}px) 88px 104px 36px 36px 84px 80px`;
        const icon = (src, tip) => `<img src="${window.image_base}${src}" alt="" data-tip="${tip}">`;
        $content.html(`
            ${stats(list, counted)}
            <div class="td-main">
                <aside class="td-side">
                    <span class="twk-label">Membros${data.hidden.length ? `<small data-tip="${TWK.escape(data.hidden.join(', '))}">${data.hidden.length} sem permissão</small>` : ''}</span>
                    <div class="td-members">
                        ${member(ALL, 'Todos os membros', TWK.plural(members.length, 'membro', 'membros'), all)}
                        ${members.map(m => member(m.id, TWK.escape(m.name), `${compact(sum(m.villages, v => pop(v.home)))} de defesa`, m.villages)).join('')}
                    </div>
                </aside>
                <section class="td-area">
                    <div class="td-bar">
                        <label class="td-front">
                            <span class="twk-caption td-before">Front até</span>
                            ${TWK.number('td-front-input', { min: 1, max: LIMIT, step: 1, value: settings.reach })}
                            <span class="twk-caption td-after">${settings.reach === 1 ? 'campo' : 'campos'}</span>
                        </label>
                        <select class="td-foe">
                            <option value="${ALL}">Todos os inimigos</option>
                            ${foes.map(id => `<option value="${id}"${id === view.foe ? ' selected' : ''}>${tag(id)}</option>`).join('')}
                        </select>
                        ${goal ? `<select class="td-tier">${tiers()}</select>` : ''}
                        <div class="td-tools">
                            <button class="twk-btn td-tool td-mapmode${picking ? ' td-active' : ''}" data-tip="${picking ? 'Parar de selecionar no mapa' : 'Selecionar no mapa'}">${TWK.ICON.target}</button>
                            <button class="twk-btn td-tool td-zone-draw${area ? ' td-set' : ''}${drawing ? ' td-active' : ''}" data-tip="${area ? 'Limpar a área' : 'Desenhar área'}">${TWK.ICON.pen}</button>
                            <button class="twk-btn td-tool td-goalbtn${goal ? ' td-set' : ''}${goalOpen ? ' td-active' : ''}" data-tip="Meta por aldeia">${TWK.ICON.chart}</button>
                            ${copier(counted !== list)}
                        </div>
                    </div>
                    <div class="td-goalrow"${goalOpen ? '' : ' hidden'}>
                        <div class="td-goals">${goals()}</div>
                    </div>
                    ${goal ? '' : '<div class="td-hint">Defina a meta em 📊 para ver as aldeias que precisam de defesa. Sem meta, o mapa mostra só ataques chegando e muralha baixa.</div>'}
                    <div class="td-table" style="--cols: ${cols}">
                        <div class="td-head">
                            <input type="checkbox" class="td-pick-all"${every ? ' checked' : ''}${list.length ? '' : ' disabled'} data-tip="Selecionar todas">
                            <span>Aldeia</span>
                            ${header('member', 'Membro')}
                            ${columns.map(u => header(`unit:${u.i}`, `<img src="${u.src}" alt="${u.unit}" data-tip="${u.unit}">`, ' td-end')).join('')}
                            ${header('coming', 'A caminho', ' td-end')}
                            ${header('gap', '<span data-tip="Inimigo mais próximo e distância">Inimigo</span>', ' td-end')}
                            ${header('attacks', icon('unit/att.webp', 'Ataques chegando'), ' td-end')}
                            ${header('wall', icon('buildings/wall.webp', 'Muralha'), ' td-end')}
                            ${header('pop', '<span data-tip="Tropas que já estão na aldeia">População</span>', ' td-end')}
                            ${header('missing', '<span data-tip="Falta para a meta, contando o que está a caminho">Falta</span>', ' td-end')}
                        </div>
                        <div class="td-body">
                            ${list.map(v => `<div class="td-row${chosen.has(v.id) ? ' td-chosen' : ''}" data-x="${v.x}" data-y="${v.y}">
                                <input type="checkbox" class="td-pick" data-id="${v.id}"${chosen.has(v.id) ? ' checked' : ''}>
                                <b class="twk-mono td-coord"${goal ? ` data-tip="${breakdown(v)}"` : ''}>${goal ? `<i class="td-dot" style="background: ${tier(v.id)}"></i>` : ''}${v.x}|${v.y}</b>
                                <span class="td-owner">${TWK.escape(data.members[v.player] || '')}</span>
                                ${columns.map(u => cell(v.home[u.i])).join('')}
                                ${cell(pop(v.coming))}
                                <span class="td-enemy${v.gap === null ? ' td-zero' : ''}"><span class="td-tag">${tag(v.foe)}</span><span class="td-num">${v.gap === null ? '–' : v.gap.toFixed(1)}</span></span>
                                ${cell(v.attacks, ' td-missing')}
                                <span class="td-num${weak(v) ? ' td-missing' : ''}">${v.wall ?? '–'}</span>
                                <span class="td-num td-pop">${TWK.format(pop(v.home))}</span>
                                ${goal ? cell(short(v), ' td-missing', breakdown(v)) : cell(0)}
                            </div>`).join('') || nothing()}
                        </div>
                        ${foot(counted)}
                    </div>
                </section>
            </div>
        `);
        $content.find('.td-members').scrollTop(scroll);
        $content.find('.td-body').scrollTop(rows);
    };

    const refresh = () => {
        const list = visible();
        const counted = picked(list);
        $content.find('.td-stats').replaceWith(stats(list, counted));
        $content.find('.td-foot').replaceWith(foot(counted));
        $content.find('.td-export').replaceWith(copier(counted !== list));
        $content.find('.td-pick').each((_, el) => {
            const on = chosen.has(el.dataset.id);
            el.checked = on;
            $(el).closest('.td-row').toggleClass('td-chosen', on);
        });
        $content.find('.td-pick-all').prop('checked', list.length > 0 && list.every(v => chosen.has(v.id)));
        index();
        TWMap.reload();
    };

    const strangers = () => {
        const open = view.member === ALL && view.tier === ALL;
        if (!open) return [];
        return data.unknown.filter(v => front(v) && inside(v) && (view.foe === ALL || v.foe === view.foe));
    };

    const index = () => {
        const pinned = view.tier !== ALL;
        const known = visible().filter(v => pinned || needy(v) || chosen.has(v.id)).map(v => [`${v.x}|${v.y}`, { ...v, color: paintColor(v) }]);
        const unknown = strangers().map(v => [`${v.x}|${v.y}`, { ...v, unknown: true, color: UNKNOWN }]);
        marks = new Map([...unknown, ...known]);
    };

    const look = (kind, color) => {
        const scale = scales[kind];
        const dot = Math.max(...scale) * 2.4;
        return kind === 'mini'
            ? { width: dot, height: dot, marginLeft: (scale[0] - dot) / 2, marginTop: (scale[1] - dot) / 2, borderRadius: '50%', border: '2px solid #000', background: color, zIndex: 10 }
            : { width: scale[0], height: scale[1], border: `3px solid ${color}`, outline: '1px solid #000', background: `${color}73`, zIndex: 5 };
    };

    const chip = (place, src, text, background = 'rgba(0, 0, 0, .78)') => $('<div>')
        .css({
            position: 'absolute', ...place,
            display: 'flex', alignItems: 'center', gap: 1, padding: '0 2px', borderRadius: 3,
            background, color: '#fff', font: '700 9px/12px system-ui, sans-serif', whiteSpace: 'nowrap',
        })
        .append(src ? $(`<img src="${window.image_base}${src}" alt="">`).css({ width: 9, height: 9 }) : [], text);

    const badges = v => [
        chip({ left: 1, bottom: 1 }, 'buildings/farm.webp', compact(pop(stock(v)))),
        v.wall === null ? null : chip({ left: 1, top: 1 }, 'buildings/wall.webp', v.wall, weak(v) ? 'rgba(190, 30, 30, .9)' : undefined),
        v.attacks ? chip({ right: 1, top: 1 }, null, v.attacks, 'rgba(190, 30, 30, .9)') : null,
    ].filter(Boolean);

    const mark = sector => {
        const map = sector._map;
        const span = map.sectorSize;
        const kind = map === TWMap.minimap ? 'mini' : 'main';
        scales[kind] = map.scale;
        for (let x = sector.x; x < sector.x + span; x++) {
            for (let y = sector.y; y < sector.y + span; y++) {
                const v = !drawing && marks.get(`${x}|${y}`);
                if (!v) continue;
                const $el = $(`<div class="td-mark" data-key="${x}|${y}" data-kind="${kind}">`)
                    .css({ position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', ...look(kind, v.color) });
                const detailed = kind === 'main' && !v.unknown;
                if (detailed) $el.append(badges(v));
                sector.appendElement($el[0], x - sector.x, y - sector.y);
            }
        }
        outline(sector, span);
    };

    const shape = () => {
        if (drawing) return { points: drawing.points, closed: false };
        return settings.area ? { points: settings.area, closed: true } : null;
    };

    const outline = (sector, span) => {
        const current = shape();
        const empty = !current || current.points.length < 2;
        if (empty) return;
        const scale = sector._map.scale;
        const kind = current.closed ? 'polygon' : 'polyline';
        const points = current.points.map(([x, y]) => `${x + .5},${y + .5}`).join(' ');
        const fill = current.closed ? 'rgba(255, 255, 255, .08)' : 'none';
        const svg = `<svg class="td-outline" width="${span * scale[0]}" height="${span * scale[1]}" viewBox="${sector.x} ${sector.y} ${span} ${span}" preserveAspectRatio="none" style="position: absolute; pointer-events: none; z-index: 11; filter: drop-shadow(0 0 1px rgba(0, 0, 0, .9))">
            <${kind} points="${points}" fill="${fill}" stroke="#fff" stroke-width="1" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        </svg>`;
        sector.appendElement($(svg)[0], 0, 0);
    };

    const restyle = () => {
        index();
        $('.td-mark').each((_, el) => $(el).css(look(el.dataset.kind, marks.get(el.dataset.key)?.color || BASE)));
    };

    const paint = () => {
        if (!data) return;
        TWMap.mapHandler.tdSpawn ??= TWMap.mapHandler.spawnSector;
        TWMap.minimapHandler.tdLoad ??= TWMap.minimapHandler.loadSector;
        TWMap.mapHandler.tdClick ??= TWMap.mapHandler.onClick;
        TWMap.mapHandler.onClick = function (x, y, event) {
            const village = picking && marks.get(`${x}|${y}`);
            const pickable = village && !village.unknown;
            if (!pickable) return TWMap.mapHandler.tdClick.call(this, x, y, event);
            const on = !chosen.has(village.id);
            if (on) chosen.add(village.id);
            else chosen.delete(village.id);
            refresh();
            return false;
        };
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
        if (key === 'member') chosen = new Set();
        update();
    };

    const exported = () => picked(visible())
        .map(v => ({ v, need: lacking(v) }))
        .filter(({ need }) => need.some(Boolean))
        .map(({ v, need }) => `${v.x}|${v.y} ${need.join('/')}`);

    const limit = area => {
        settings.area = area;
        save();
        update();
    };

    const maps = () => [TWMap.map, TWMap.minimap].filter(Boolean);

    const redraw = () => {
        $('.td-outline').remove();
        maps().forEach(map => Object.values(map._loadedSectors).forEach(sector => outline(sector, map.sectorSize)));
    };

    const line = (a, b) => p => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / (Math.hypot(dx, dy) || 1);
    };

    const simplify = points => {
        if (points.length < 3) return points;
        const distance = line(points[0], points[points.length - 1]);
        const far = points.slice(1, -1).reduce((best, p, i) => distance(p) > best.d ? { d: distance(p), i: i + 1 } : best, { d: 0, i: 0 });
        if (far.d <= 1) return [points[0], points[points.length - 1]];
        return [...simplify(points.slice(0, far.i + 1)).slice(0, -1), ...simplify(points.slice(far.i))];
    };

    const loop = points => {
        const [start] = points;
        const split = points.reduce((best, p, i) => Math.hypot(p[0] - start[0], p[1] - start[1]) > best.d ? { d: Math.hypot(p[0] - start[0], p[1] - start[1]), i } : best, { d: 0, i: 0 }).i;
        return [...simplify(points.slice(0, split + 1)).slice(0, -1), ...simplify(points.slice(split))];
    };

    const owner = target => maps().find(map => map.el.root.contains(target));

    const block = e => {
        e.stopPropagation();
        e.preventDefault();
    };

    const press = e => {
        const map = owner(e.target);
        if (!map) return;
        block(e);
        drawing.map = map;
        drawing.points = [map.coordByEvent(e)];
    };

    const move = e => {
        const map = drawing.map;
        if (!map) return;
        block(e);
        const [x, y] = map.coordByEvent(e);
        const [lx, ly] = drawing.points[drawing.points.length - 1];
        const moved = x !== lx || y !== ly;
        if (!moved) return;
        drawing.points.push([x, y]);
        redraw();
    };

    const lift = e => {
        const map = drawing.map;
        if (!map) return;
        block(e);
        const area = drawing.points.length > 2 ? loop(drawing.points) : null;
        setTimeout(() => {
            release();
            if (area) limit(area);
            else TWMap.reload();
        });
    };

    const keys = e => {
        const cancel = e.key === 'Escape';
        if (cancel) stop();
    };

    const swallow = e => {
        const onMap = !!owner(e.target);
        if (onMap) block(e);
    };

    const LISTENERS = { mousedown: press, mousemove: move, mouseup: lift, click: swallow };

    const release = () => {
        drawing = null;
        Object.entries(LISTENERS).forEach(([type, fn]) => window.removeEventListener(type, fn, true));
        $(document).off('keydown.td');
        maps().forEach(map => $(map.el.root).css('cursor', ''));
        $panel.find('.td-zone-draw').removeClass('td-active');
    };

    const stop = () => {
        const active = !!drawing;
        if (!active) return;
        release();
        TWMap.reload();
    };

    const draw = () => {
        const active = !!drawing;
        if (active) return stop();
        drawing = { points: [], map: null };
        Object.entries(LISTENERS).forEach(([type, fn]) => window.addEventListener(type, fn, true));
        $(document).on('keydown.td', keys);
        maps().forEach(map => $(map.el.root).css('cursor', 'crosshair'));
        $panel.find('.td-zone-draw').addClass('td-active');
        TWMap.reload();
    };

    const within = (points, x, y) => points.reduce((hit, [x1, y1], i) => {
        const [x2, y2] = points[(i + 1) % points.length];
        const crosses = (y1 > y) !== (y2 > y) && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1;
        return crosses ? !hit : hit;
    }, false);

    $panel.on('click', '.td-refresh, .td-start', read);
    $panel.on('click', '.td-member', e => select('member', String($(e.currentTarget).data('member'))));
    $panel.on('click', '.td-pick', e => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const on = e.currentTarget.checked;
        const ids = $content.find('.td-pick').get().map(el => el.dataset.id);
        const from = ids.indexOf(pivot);
        const to = ids.indexOf(id);
        const range = e.shiftKey && from >= 0;
        const span = range ? ids.slice(Math.min(from, to), Math.max(from, to) + 1) : [id];
        span.forEach(key => on ? chosen.add(key) : chosen.delete(key));
        pivot = id;
        refresh();
    });
    $panel.on('click', '.td-pick-all', () => {
        const ids = visible().map(v => v.id);
        const every = ids.every(id => chosen.has(id));
        chosen = every ? new Set() : new Set([...chosen, ...ids]);
        refresh();
    });
    $panel.on('click', '.td-row', e => TWMap.focusUserSpecified($(e.currentTarget).data('x'), $(e.currentTarget).data('y')));
    $panel.on('click', '.td-export', () => TWK.copy(exported().join('\n'), 'Aldeias e tropas que faltam copiadas'));
    $panel.on('change', '.td-foe', e => select('foe', e.currentTarget.value));
    $panel.on('click', '.td-sort', e => {
        const key = $(e.currentTarget).data('sort');
        const first = ASCENDING.includes(key) ? 1 : -1;
        const same = view.sort?.key === key;
        const reset = same && view.sort.dir !== first;
        view.sort = reset ? null : { key, dir: same ? -first : first };
        render();
    });
    $panel.on('click', '.td-mapmode', e => {
        picking = !picking;
        $(e.currentTarget).toggleClass('td-active', picking).attr('data-tip', picking ? 'Parar de selecionar no mapa' : 'Selecionar no mapa');
    });
    $panel.on('click', '.td-zone-draw', () => {
        const clear = !drawing && !!settings.area;
        if (clear) return limit(null);
        draw();
    });
    $panel.on('change', '.td-wall-input', e => {
        settings.wall = Math.min(20, Math.max(0, parseInt(e.currentTarget.value) || 0));
        save();
        update();
    });
    $panel.on('change', '.td-front-input', e => {
        settings.reach = Math.min(LIMIT, Math.max(1, parseInt(e.currentTarget.value) || 1));
        save();
        update();
    });
    $panel.on('input', '.td-goal-input', e => {
        settings.goal[$(e.currentTarget).closest('.td-goal').data('unit')] = Math.max(0, parseInt(e.currentTarget.value) || 0);
        save();
        $panel.find('.td-target').text(TWK.format(target()));
        $panel.find('.td-tier').html(tiers());
        $panel.find('.td-goalbtn').toggleClass('td-set', !!target());
        restyle();
    });
    $panel.on('change', '.td-goal-input', update);
    $panel.on('change', '.td-tier', e => select('tier', e.currentTarget.value));
    $panel.on('click', '.td-goalbtn', () => {
        goalOpen = !goalOpen;
        $panel.find('.td-goalrow').prop('hidden', !goalOpen);
        $panel.find('.td-goalbtn').toggleClass('td-active', goalOpen);
    });

    render();
    paint();
});
