$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.6/twkit.js', dataType: 'script', cache: true }).then(() => {
    const KEY = `twResourceSender_${game_data.world}`;
    const PATH = 'overview_villages&mode=prod&group=';
    const ROWS = '#production_table .quickedit-vn';
    const RX_COORD = /(\d{1,3})\|(\d{1,3})/;
    const RESOURCES = ['wood', 'stone', 'iron'];
    const CARRY = 1000;
    const CART = TWK.svg('<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>');

    const saved = TWK.store.get(KEY, { coord: '', group: '0', keep: 0 });
    const cache = {};
    let world = null;
    let target = null;
    let plan = [];
    let skipped = 0;
    let sending = false;
    let runs = 0;

    const $panel = TWK.panel({
        id: 'rs-panel',
        title: 'Enviar Recursos',
        sub: 'Envia das suas aldeias para uma coordenada',
        icon: CART,
        width: 460,
        onClose: () => {
            sending = false;
        },
        css: `
            #rs-panel .rs-target { min-height: 18px; color: var(--muted); font-size: 11px; }
            #rs-panel .rs-target b { color: var(--text); font-weight: 600; }
            #rs-panel .rs-actions { display: flex; gap: 8px; }
            #rs-panel .rs-actions .twk-btn { flex: 1; }
            #rs-panel .rs-summary { color: var(--muted); font-size: 11px; }
            #rs-panel .rs-summary b { color: var(--text); font-weight: 600; }
            #rs-panel .rs-table { border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
            #rs-panel .rs-body { max-height: 260px; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
            #rs-panel .rs-row { padding: 0 12px; height: 32px; display: grid; grid-template-columns: 64px 40px repeat(3, 1fr) 16px; align-items: center; gap: 8px; border-bottom: 1px solid var(--line); }
            #rs-panel .rs-row:last-child { border-bottom: 0; }
            #rs-panel .rs-head { height: 30px; padding-right: 22px; background: var(--surface); color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #rs-panel .rs-head .rs-num { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
            #rs-panel .rs-total { color: var(--text); font-size: 11px; letter-spacing: 0; }
            #rs-panel .rs-num { text-align: right; font-family: ui-monospace, Consolas, monospace; }
            #rs-panel .rs-state { display: grid; place-items: center; color: var(--muted); }
            #rs-panel .rs-state svg { width: 13px; height: 13px; }
            #rs-panel .rs-ok { color: var(--ok); }
            #rs-panel .rs-fail { color: #f08a8a; }
        `,
        body: `
            <div class="twk-section">
                <div class="twk-label">Destino</div>
                <input type="text" class="rs-coord" placeholder="Coordenada, ex.: 500|500">
                <div class="rs-target"></div>
            </div>
            <div class="twk-grid">
                <label class="twk-field"><span class="twk-label">Grupo</span><select class="rs-group"><option value="0">Todas as aldeias</option></select></label>
                <div class="twk-field"><span class="twk-label">Reserva (%)</span>${TWK.number('rs-keep', { min: 0, max: 100, step: 5, value: saved.keep })}</div>
            </div>
            <div class="rs-actions">
                <button class="twk-btn rs-calc">${TWK.ICON.refresh}Calcular</button>
                <button class="twk-btn twk-primary rs-send" disabled>${CART}Enviar</button>
            </div>
            <div class="rs-result"></div>
        `,
    });

    const $coord = $panel.find('.rs-coord').val(saved.coord);
    const $group = $panel.find('.rs-group');
    const $keep = $panel.find('.rs-keep');
    const $info = $panel.find('.rs-target');
    const $calc = $panel.find('.rs-calc');
    const $send = $panel.find('.rs-send');
    const $result = $panel.find('.rs-result');
    const $fields = $coord.add($group).add($keep);

    const read = () => ({
        coord: $.trim($coord.val()),
        group: $group.val() || '0',
        keep: Math.min(100, Math.max(0, parseInt($keep.val()) || 0)),
    });

    const decode = text => decodeURIComponent(text.replace(/\+/g, ' '));

    const load = async () => {
        const [villages, players] = await Promise.all([TWK.get('/map/village.txt'), TWK.get('/map/player.txt')]);
        const names = Object.fromEntries(players.split('\n').filter(Boolean).map(line => line.split(',')).map(([id, name]) => [id, decode(name)]));
        const map = {};
        villages.split('\n').filter(Boolean).forEach(line => {
            const [id, name, x, y, player] = line.split(',');
            map[`${x}|${y}`] = { id, name: decode(name), x: +x, y: +y, owner: names[player] || 'Bárbara' };
        });
        return map;
    };

    const locate = async coord => {
        world ??= await load();
        return world[coord] || null;
    };

    const parse = $doc => $doc.find(ROWS).get().map(el => {
        const $row = $(el).closest('tr');
        const label = $.trim($row.find('.quickedit-label').first().text());
        const coord = label.match(/\((\d+)\|(\d+)\)\s*K\d+\s*$/) || [];
        const amount = type => +$row.find(`.res.${type}`).first().text().replace(/\D/g, '');
        const traders = +$row.find('a[href*="screen=market"]').first().text().split('/')[0] || 0;
        return { id: el.dataset.id, name: label, x: +coord[1], y: +coord[2], wood: amount('wood'), stone: amount('stone'), iron: amount('iron'), traders };
    });

    const groups = $doc => $doc.find('.vis_item .group-menu-item[data-group-id]').get()
        .map(el => [el.getAttribute('data-group-id'), $.trim(el.textContent).replace(/^[[>]|[\]<]$/g, '').trim()]);

    const sources = async group => {
        if (cache[group]) return cache[group];
        const docs = await TWK.pages(`${PATH}${group}`, { rows: ROWS, progress: (page, total) => status(`Lendo a produção, página ${page} de ${total}...`) });
        const options = groups(docs[0]);
        const fresh = $group.children().length < 2;
        if (fresh) $group.html(options.map(([id, name]) => `<option value="${id}">${id === '0' ? 'Todas as aldeias' : TWK.escape(name)}</option>`).join('')).val(group);
        return cache[group] = docs.flatMap(parse);
    };

    const split = (capacity, available) => {
        const order = RESOURCES.map(r => ({ r, max: available[r] })).sort((a, b) => a.max - b.max);
        const out = {};
        let left = capacity;
        order.forEach((item, n) => {
            out[item.r] = Math.max(0, Math.min(item.max, Math.floor(left / (order.length - n))));
            left -= out[item.r];
        });
        return out;
    };

    const status = text => $result.html(`<div class="twk-caption">${text}</div>`);

    const row = (p, i) => `<div class="rs-row" data-i="${i}">
        <b class="twk-mono">${p.x}|${p.y}</b>
        <span class="rs-num">${p.distance.toFixed(1)}</span>
        ${RESOURCES.map(r => `<span class="rs-num">${TWK.format(p.send[r])}</span>`).join('')}
        <span class="rs-state"></span>
    </div>`;

    const show = () => {
        $result.html(`
            <div class="twk-section">
                <div class="rs-summary"><span><b>${TWK.plural(plan.length, 'aldeia envia', 'aldeias enviam')}</b>${skipped ? ` · ${TWK.format(skipped)} sem comerciantes ou recursos` : ''}</span></div>
                <div class="rs-table">
                    <div class="rs-row rs-head"><span>Aldeia</span><span class="rs-num">Dist.</span>${RESOURCES.map(r => `<span class="rs-num"><span class="icon header ${r}"></span><b class="rs-total twk-mono" data-r="${r}"></b></span>`).join('')}<span></span></div>
                    <div class="rs-body">${plan.map(row).join('')}</div>
                </div>
            </div>
        `);
    };

    const calculate = async () => {
        const opt = read();
        TWK.store.set(KEY, opt);
        const match = opt.coord.match(RX_COORD);
        if (!match) return UI.InfoMessage('Digite a coordenada de destino');
        const run = ++runs;
        $calc.prop('disabled', true);
        $send.prop('disabled', true);
        try {
            status('Buscando o destino...');
            target = await locate(`${+match[1]}|${+match[2]}`);
            if (!target) {
                $info.text('Nenhuma aldeia nessa coordenada');
                return status('');
            }
            $info.html(`<b>${TWK.escape(target.name)}</b> (${target.x}|${target.y}) · ${TWK.escape(target.owner)}`);
            const villages = await sources(opt.group);
            const stale = run !== runs;
            if (stale) return;
            const list = villages.filter(v => v.id !== target.id);
            plan = list
                .filter(v => v.traders)
                .map(v => ({ ...v, distance: Math.hypot(v.x - target.x, v.y - target.y) }))
                .sort((a, b) => a.distance - b.distance)
                .map(v => ({ ...v, send: split(v.traders * CARRY, Object.fromEntries(RESOURCES.map(r => [r, Math.floor(v[r] * (100 - opt.keep) / 100)]))) }))
                .filter(v => RESOURCES.some(r => v.send[r]));
            skipped = list.length - plan.length;
            const empty = !list.length;
            const idle = !plan.length;
            if (empty) status('Nenhuma aldeia neste grupo');
            else if (idle) status(`${TWK.plural(skipped, 'aldeia', 'aldeias')} sem comerciantes ou recursos para enviar`);
            else show();
            $send.prop('disabled', !plan.length);
        } catch {
            status('Não foi possível calcular o envio');
        } finally {
            $calc.prop('disabled', false);
        }
    };

    const ship = async p => {
        const url = game_data.link_base_pure.replace(/village=\d+/, `village=${p.id}`);
        const text = await $.post(`${url}market&ajaxaction=map_send`, { target_id: target.id, ...p.send, h: game_data.csrf }, null, 'text');
        const json = JSON.parse(text);
        if (json.error) throw new Error([].concat(json.error).join(' '));
    };

    const DONE = TWK.svg('<path d="M20 6 9 17l-5-5"/>');

    const mark = (i, icon, kind, tip = '') => $result.find(`.rs-row[data-i="${i}"] .rs-state`).html(icon).attr({ class: `rs-state ${kind}`, 'data-tip': tip || null });

    const tally = (label, sent) => {
        $result.find('.rs-summary').html(label);
        RESOURCES.forEach(r => $result.find(`.rs-total[data-r="${r}"]`).text(TWK.format(sent[r])));
    };

    const send = async () => {
        const sent = { wood: 0, stone: 0, iron: 0 };
        sending = true;
        $calc.add($send).add($fields).prop('disabled', true);
        let done = 0;
        let failed = 0;
        for (const [i, p] of plan.entries()) {
            if (!sending) break;
            mark(i, '<span class="twk-spin" style="width: 11px; height: 11px"></span>', '');
            try {
                await ship(p);
                mark(i, DONE, 'rs-ok');
                RESOURCES.forEach(r => sent[r] += p.send[r]);
                done++;
            } catch (error) {
                mark(i, TWK.ICON.close, 'rs-fail', error.message || 'Erro ao enviar');
                failed++;
            }
            tally(`Enviando <b>${TWK.format(i + 1)}</b> de <b>${TWK.format(plan.length)}</b>`, sent);
            await TWK.wait(200);
        }
        sending = false;
        if (done) tally(`Enviado de <b>${TWK.plural(done, 'aldeia', 'aldeias')}</b>`, sent);
        Object.keys(cache).forEach(group => delete cache[group]);
        $calc.add($fields).prop('disabled', false);
        if (done) UI.SuccessMessage(`Recursos enviados de ${TWK.plural(done, 'aldeia', 'aldeias')}`);
        if (failed) UI.ErrorMessage(`${TWK.plural(failed, 'aldeia falhou', 'aldeias falharam')}, passe o mouse no ✕ para ver o motivo`);
    };

    const start = async () => {
        $calc.prop('disabled', true);
        try {
            await sources('0');
            const known = $group.find(`option[value="${saved.group}"]`).length;
            if (known) $group.val(saved.group);
            status('');
        } catch {
            status('Não foi possível carregar suas aldeias');
        }
        $calc.prop('disabled', false);
    };

    const refresh = () => {
        const ready = RX_COORD.test($coord.val());
        if (ready) calculate();
    };

    $calc.on('click', calculate);
    $group.on('change', refresh);
    $keep.on('input change', refresh);
    $coord.on('input', () => $send.prop('disabled', true));
    $send.on('click', send);
    $coord.on('keydown', e => {
        if (e.key === 'Enter') calculate();
    });

    start();
});
