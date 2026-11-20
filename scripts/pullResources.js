$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.8/twkit.js', dataType: 'script', cache: true }).then(() => {
    const KEY = `twPullResources_${game_data.world}`;
    const CALL = 'market&mode=call&order=distance&dir=ASC&target_id=0';
    const ROWS = '#village_list tr.supply_location';
    const RESOURCES = ['wood', 'stone', 'iron'];
    const BATCH = 1000;
    const LOAD = 1000;
    const NARROW = 360;
    const WIDE = 520;
    const RX_COORD = /\((\d+)\|(\d+)\)\s*\S*\s*$/;
    const RX_INPUT = /(\d{1,3})\|(\d{1,3})/;
    const GOLD = TWK.svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10.5c0-1.4 1.1-2 2.5-2s2.5.6 2.5 1.8c0 2.7-5 1.5-5 4 0 1.2 1.1 1.7 2.5 1.7s2.5-.6 2.5-2"/>');
    const DONE = TWK.svg('<path d="M20 6 9 17l-5-5"/>');

    const saved = TWK.store.get(KEY, { coord: '' });
    let own = null;
    let target = null;
    let cost = null;
    let villages = [];
    let plan = [];
    let sending = false;

    const $panel = TWK.panel({
        id: 'pr-panel',
        title: 'Puxar Recursos',
        sub: 'Para uma aldeia sua, na proporção da moeda',
        icon: GOLD,
        width: NARROW,
        onClose: () => {
            sending = false;
        },
        css: `
            #pr-panel .pr-info { color: var(--muted); font-size: 11px; }
            #pr-panel .pr-info:empty, #pr-panel .pr-result:empty { display: none; }
            #pr-panel .pr-info b { color: var(--text); font-weight: 600; }
            #pr-panel .pr-actions { display: flex; gap: 8px; }
            #pr-panel .pr-actions .twk-btn { flex: 1; }
            #pr-panel .pr-table { border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
            #pr-panel .pr-body { max-height: 280px; overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable; }
            #pr-panel .pr-row { padding: 0 12px; height: 32px; display: grid; grid-template-columns: 64px 56px repeat(3, 1fr) 48px 16px; align-items: center; gap: 8px; border-bottom: 1px solid var(--line); }
            #pr-panel .pr-row:last-child { border-bottom: 0; }
            #pr-panel .pr-head { height: 30px; padding-right: 22px; background: var(--surface); color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            #pr-panel .pr-foot { height: 34px; padding-right: 22px; background: var(--surface); border-top: 1px solid var(--line); border-bottom: 0; font-weight: 600; }
            #pr-panel .pr-num { text-align: right; font-family: ui-monospace, Consolas, monospace; }
            #pr-panel .pr-time { color: var(--muted); }
            #pr-panel .pr-state { display: grid; place-items: center; color: var(--muted); }
            #pr-panel .pr-state svg { width: 13px; height: 13px; }
            #pr-panel .pr-ok { color: var(--ok); }
            #pr-panel .pr-fail { color: #f08a8a; }
        `,
        body: `
            <label class="twk-field"><span class="twk-label">Destino</span><input type="text" class="pr-coord" placeholder="Coordenada, ex.: 500|500"></label>
            <div class="pr-info"></div>
            <div class="pr-actions">
                <button class="twk-btn pr-calc">${TWK.ICON.refresh}Calcular</button>
                <button class="twk-btn twk-primary pr-send" disabled>${GOLD}Pedir</button>
            </div>
            <div class="pr-result"></div>
        `,
    });

    const $info = $panel.find('.pr-info');
    const $coord = $panel.find('.pr-coord').val(saved.coord);
    const $calc = $panel.find('.pr-calc');
    const $send = $panel.find('.pr-send');
    const $result = $panel.find('.pr-result');

    const status = text => {
        $panel.css('width', NARROW);
        $result.html(`<div class="twk-caption">${text}</div>`);
    };

    const amount = $el => +$el.text().replace(/\D/g, '') || 0;

    const at = path => `${game_data.link_base_pure.replace(/village=\d+/, `village=${target.id}`)}${path}`;

    const villagesOwned = async () => {
        const text = await TWK.get('/map/village.txt');
        const mine = String(game_data.player.id);
        return Object.fromEntries(text.split('\n').map(line => line.split(',')).filter(([, , , , player]) => player === mine).map(([id, name, x, y]) => [`${x}|${y}`, { id, name: decodeURIComponent(name.replace(/\+/g, ' ')), x: +x, y: +y }]));
    };

    const prices = async () => {
        const $doc = await TWK.doc(at('snob'));
        const found = RESOURCES.map(r => amount($doc.find(`#coin_cost_${r} .value`)));
        return found.every(Boolean) ? Object.fromEntries(RESOURCES.map((r, i) => [r, found[i]])) : null;
    };

    const parse = $doc => $doc.find(ROWS).get().map(el => {
        const $row = $(el);
        const coord = $.trim($row.find('a[href*="info_village"]').first().text()).match(RX_COORD) || [];
        const stock = Object.fromEntries(RESOURCES.map(r => [r, +$row.find(`td[data-res-type="${r}"]`).attr('data-res') || 0]));
        return { id: el.dataset.village, x: +coord[1], y: +coord[2], time: $.trim($row.children('td').eq(1).text()), capacity: +el.dataset.capacity || 0, ...stock };
    });

    const sources = async () => {
        const first = await TWK.doc(at(`${CALL}&page=0`));
        const numbers = first.find('.paged-nav-item').get().map(a => +((a.getAttribute('href') || '').match(/page=(\d+)/) || [])[1]).filter(n => !isNaN(n));
        const total = Math.max(0, ...numbers) + 1;
        const list = parse(first);
        for (let page = 1; page < total; page++) {
            status(`Lendo as aldeias, página ${page + 1} de ${total}...`);
            list.push(...parse(await TWK.doc(at(`${CALL}&page=${page}`))));
        }
        return list;
    };

    const row = (p, i) => `<div class="pr-row" data-i="${i}">
        <b class="twk-mono">${p.x}|${p.y}</b>
        <span class="pr-num pr-time">${p.time}</span>
        ${RESOURCES.map(r => `<span class="pr-num">${TWK.format(p.send[r])}</span>`).join('')}
        <span class="pr-num">${TWK.format(Math.floor(p.coins))}</span>
        <span class="pr-state"></span>
    </div>`;

    const show = () => {
        $panel.css('width', WIDE);
        const sent = Object.fromEntries(RESOURCES.map(r => [r, plan.reduce((sum, p) => sum + p.send[r], 0)]));
        const coins = Math.floor(plan.reduce((sum, p) => sum + p.coins, 0));
        $result.html(`
            <div class="pr-table">
                <div class="pr-row pr-head"><span>Aldeia</span><span class="pr-num">Tempo</span>${RESOURCES.map(r => `<span class="pr-num"><span class="icon header ${r}"></span></span>`).join('')}<span class="pr-num">Moedas</span><span></span></div>
                <div class="pr-body">${plan.map(row).join('')}</div>
                <div class="pr-row pr-foot"><span>Total</span><span></span>${RESOURCES.map(r => `<span class="pr-num">${TWK.format(sent[r])}</span>`).join('')}<span class="pr-num">${TWK.format(coins)}</span><span></span></div>
            </div>
        `);
        $send.html(`${GOLD}Pedir de ${TWK.plural(plan.length, 'aldeia', 'aldeias')}`);
    };

    const calculate = async () => {
        const coord = $.trim($coord.val());
        TWK.store.set(KEY, { coord });
        const match = coord.match(RX_INPUT);
        if (!match) return status('Digite a coordenada da aldeia que vai receber');
        $calc.prop('disabled', true);
        $send.prop('disabled', true);
        try {
            status('Buscando o destino...');
            own ??= await villagesOwned();
            target = own[`${+match[1]}|${+match[2]}`];
            if (!target) {
                $info.text('');
                return status('Essa coordenada não é uma aldeia sua');
            }
            status('Lendo o custo da moeda...');
            cost = await prices();
            if (!cost) return status('Essa aldeia não tem academia para cunhar moedas');
            status('Lendo as aldeias...');
            villages = await sources();
            const bundle = RESOURCES.reduce((sum, r) => sum + cost[r], 0);
            plan = villages.map(v => {
                const coins = Math.max(0, Math.min(v.capacity / bundle, ...RESOURCES.map(r => v[r] / cost[r])));
                return { ...v, coins, send: Object.fromEntries(RESOURCES.map(r => [r, Math.floor(coins * cost[r])])) };
            }).filter(p => RESOURCES.reduce((sum, r) => sum + p.send[r], 0) >= LOAD);
            $info.html(`<b>${TWK.escape(target.name)}</b> (${target.x}|${target.y}) · Moeda: <b>${RESOURCES.map(r => TWK.format(cost[r])).join(' / ')}</b>`);
            const empty = !plan.length;
            if (empty) status('Nenhuma aldeia tem 1.000 recursos ou mais para enviar');
            else show();
            $send.prop('disabled', empty);
        } catch (error) {
            status(`Não foi possível calcular: ${TWK.escape(error?.message || error?.statusText || 'erro desconhecido')}`);
        } finally {
            $calc.prop('disabled', false);
        }
    };

    const ask = async list => {
        const body = new URLSearchParams({ target_id: 0 });
        list.forEach(p => {
            RESOURCES.forEach(r => body.append(`resource[${p.id}][${r}]`, p.send[r]));
            body.append('select-village', p.id);
        });
        body.append('h', game_data.csrf);
        const json = await $.post(at(`market&ajaxaction=call&h=${game_data.csrf}`), body.toString(), null, 'json');
        const answer = json.response ?? json;
        const errors = [].concat(json.error ?? answer.error ?? []);
        const sent = new Set((answer.transport_info || []).map(t => String(t.village_id)));
        const refused = !sent.size && errors.length;
        if (refused) throw new Error(errors.join(' '));
        return { sent, errors };
    };

    const mark = (i, icon, kind, tip = '') => $result.find(`.pr-row[data-i="${i}"] .pr-state`).html(icon).attr({ class: `pr-state ${kind}`, 'data-tip': tip || null });

    const send = async () => {
        sending = true;
        $calc.add($send).add($coord).prop('disabled', true);
        let done = 0;
        let failed = 0;
        const reasons = new Set();
        const rows = plan.map((p, i) => ({ p, i }));
        for (let start = 0; start < rows.length && sending; start += BATCH) {
            const chunk = rows.slice(start, start + BATCH);
            chunk.forEach(({ i }) => mark(i, '<span class="twk-spin" style="width: 11px; height: 11px"></span>', ''));
            try {
                const { sent, errors } = await ask(chunk.map(({ p }) => p));
                const reason = errors.join(' ') || 'O jogo não enviou desta aldeia';
                chunk.forEach(({ p, i }) => {
                    const ok = sent.has(p.id);
                    if (ok) done++;
                    else failed++;
                    if (!ok) reasons.add(reason);
                    mark(i, ok ? DONE : TWK.ICON.close, ok ? 'pr-ok' : 'pr-fail', ok ? '' : reason);
                });
            } catch (error) {
                const reason = error.message || 'Erro ao pedir';
                reasons.add(reason);
                chunk.forEach(({ i }) => mark(i, TWK.ICON.close, 'pr-fail', reason));
                failed += chunk.length;
            }
        }
        sending = false;
        $calc.add($coord).prop('disabled', false);
        if (done) UI.SuccessMessage(`Recursos pedidos de ${TWK.plural(done, 'aldeia', 'aldeias')}`);
        if (failed) UI.ErrorMessage(`${TWK.plural(failed, 'aldeia falhou', 'aldeias falharam')}: ${[...reasons].join(' / ')}`, 15000);
    };

    $calc.on('click', calculate);
    $send.on('click', send);
    $coord.on('input', () => $send.prop('disabled', true));
    $coord.on('keydown', e => {
        const enter = e.key === 'Enter';
        if (enter) calculate();
    });

    const ready = RX_INPUT.test(saved.coord);
    if (ready) calculate();
});
