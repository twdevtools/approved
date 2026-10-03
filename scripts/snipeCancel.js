$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.1.0/twkit.js', dataType: 'script', cache: true }).then(() => {
    const page = game_data.screen === 'overview';
    if (!page) return TWK.redirect('overview', 'Redirecionando para a visualização da aldeia...');

    const INCOMING = '#show_incoming_units, #commands_incomings';
    const OUTGOING = '#show_outgoing_units, #commands_outgoings';
    const CANCEL_LIMIT = 10 * 60 * 1000;
    const TRAIN_GAP = 1000;
    const RETURN_NEAR = 60 * 1000;
    const TZ_STEP = 15 * 60 * 1000;
    const TEST_KEY = 'twSnipeTest';
    const RX_DURATION = /^\d+:\d{2}:\d{2}$/;
    const MONO = 'ui-monospace, Consolas, monospace';

    const $panel = TWK.panel({
        id: 'sc-panel',
        title: 'Snipe Cancel',
        icon: TWK.ICON.target,
        width: 330,
        actions: `
            <button class="twk-icon sc-test" title="Modo teste: qualquer comando chegando conta como nobre">${TWK.ICON.flask}</button>
            <button class="twk-icon sc-refresh" title="Atualizar">${TWK.ICON.refresh}</button>
        `,
        onClose: () => {
            clearInterval(ticker);
            mark(null);
            $(window).off('.sc');
        },
        css: `
            #sc-panel .sc-options { display: flex; gap: 6px; }
            #sc-panel .sc-option {
                flex: 1 1 0; min-width: 0; padding: 6px 4px; white-space: nowrap; display: flex; flex-direction: column; align-items: center; gap: 1px;
                background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer;
            }
            #sc-panel .sc-option b, #sc-panel .sc-option small { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
            #sc-panel .sc-option b { font-weight: 600; }
            #sc-panel .sc-option small, #sc-panel .sc-cmd small { color: var(--muted); font: 11px ${MONO}; }
            #sc-panel .sc-option:hover, #sc-panel .sc-cmd:hover { border-color: var(--line-hi); background: var(--hover); }
            #sc-panel .sc-option.sc-active, #sc-panel .sc-cmd.sc-active { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
            #sc-panel .twk-box b { font-family: ${MONO}; }
            #sc-panel .sc-cmd {
                width: 100%; padding: 7px 10px; display: flex; flex-direction: column; gap: 2px; text-align: left;
                background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer;
            }
            #sc-panel .sc-cmd-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            #sc-panel .sc-cmd-status { font-size: 11px; color: var(--warn); }
            #sc-panel .sc-cmd.sc-fit .sc-cmd-status { color: var(--ok); font-weight: 600; }
            #sc-panel .sc-ret {
                padding: 6px 10px; display: flex; justify-content: space-between; gap: 10px;
                background: var(--surface); border: 1px solid var(--line); border-radius: 6px; font-size: 11px;
            }
            #sc-panel .sc-ret span:first-child { font-family: ${MONO}; }
            #sc-panel .sc-ret span:last-child { color: var(--warn); }
            #sc-panel .sc-ret.sc-fit span:last-child { color: var(--ok); font-weight: 600; }
            #sc-panel .sc-countdown { padding: 4px 0; font: 600 22px ${MONO}; text-align: center; }
            #sc-panel .sc-countdown.sc-soon { color: var(--accent); }
            #sc-panel .sc-at { display: flex; justify-content: center; align-items: baseline; gap: 6px; color: var(--muted); font-size: 11px; }
            #sc-panel .sc-at b { color: var(--text); font: 600 13px ${MONO}; }
            tr.sc-mark > td { background: #fff0a8 !important; }
        `,
    });

    const $body = $panel.find('.twk-body');
    const $refresh = $panel.find('.sc-refresh');
    const durations = {};
    let ticker;
    const shift = Math.round((TWK.now() - TWK.serverNow()) / TZ_STEP) * TZ_STEP;
    const state = { root: null, trains: [], commands: [], returns: [], train: 0, gap: 0, command: null, test: localStorage.getItem(TEST_KEY) === '1' };

    const pad = (n, size = 2) => String(n).padStart(size, '0');
    const ms = t => pad((t % 1000 + 1000) % 1000, 3);
    const clock = t => `${new Date(t).toISOString().slice(11, 19)}:${ms(t)}`;
    const second = t => Math.floor(t / 1000);
    const span = t => {
        const total = Math.max(0, Math.round(t));
        const s = second(total);
        return `${Math.floor(s / 3600)}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}:${ms(total)}`;
    };
    const timer = t => `${Math.floor(t / 3600)}:${pad(Math.floor(t % 3600 / 60))}:${pad(t % 60)}`;
    const seconds = text => text.split(':').map(Number).reduce((acc, n) => acc * 60 + n, 0);

    const arrival = row => {
        const $row = $(row);
        return +$row.find('[data-endtime]').first().attr('data-endtime') * 1000 + (+$row.find('.grey.small').first().text() || 0) + shift;
    };

    const trains = $root => $root.find(INCOMING).find('tr.command-row')
        .filter((_, row) => state.test || $(row).find('img[src*="command/snob"]').length)
        .get().map(arrival).sort((a, b) => a - b)
        .reduce((acc, t) => {
            const last = acc[acc.length - 1];
            const joins = last && t - last[last.length - 1] < TRAIN_GAP;
            if (joins) last.push(t);
            else acc.push([t]);
            return acc;
        }, [])
        .filter(train => train.length > 1);

    const duration = async href => {
        if (href in durations) return durations[href];
        const $doc = await TWK.doc(href);
        const text = $.trim($doc.find('#content_value td').filter((_, td) => RX_DURATION.test($.trim(td.textContent))).first().text());
        return durations[href] = text ? seconds(text) * 1000 : 0;
    };

    const commands = async $root => {
        const rows = $root.find(OUTGOING).find('tr.command-row')
            .filter((_, row) => $(row).find('a[href*="cancel"], .command-cancel').length)
            .get().map(row => ({
                href: $(row).find('a[href*="info_command"]').attr('href'),
                id: $(row).find('[data-command-id]').first().attr('data-command-id'),
                name: $.trim($(row).find('.quickedit-label').first().text()) || 'Comando',
                end: arrival(row),
            }));
        const list = [];
        for (const cmd of rows) {
            const travel = await duration(cmd.href);
            list.push({ ...cmd, travel, sent: cmd.end - travel });
        }
        return list.filter(cmd => cmd.travel && cmd.sent > TWK.now() - CANCEL_LIMIT);
    };

    const returns = $root => $root.find(OUTGOING).find('tr.command-row')
        .filter((_, row) => $(row).find('[data-command-type="cancel"]').length)
        .get().map(arrival).sort((a, b) => a - b);

    const gaps = train => train.slice(1).map((b, i) => ({ a: train[i], b, n: i + 1 }));

    const place = (t, train) => {
        const i = train.findIndex(noble => t < noble);
        if (i === 0) return { ok: false, text: 'antes do 1º' };
        if (i === -1) return { ok: false, text: 'depois do último' };
        return { ok: true, text: `entre ${i}º e ${i + 1}º` };
    };

    const plan = ({ a, b }) => {
        const from = a + 1;
        const to = b - 1;
        if (to < from) return 'Intervalo curto demais para encaixar.';
        const parts = second(from) === second(to) ? [[from, to]] : [[from, second(from) * 1000 + 999], [second(to) * 1000, to]];
        return `Envie com ${parts.map(([x, y]) => `ms <b>${ms(x)}–${ms(y)}</b> em segundo <b>${second(x) % 2 ? 'ímpar' : 'par'}</b>`).join(' ou ')}.`;
    };

    const evaluate = (cmd, { a, b }) => {
        const k = Math.floor((a - cmd.sent) / 2000) + 1;
        const back = cmd.sent + k * 2000;
        const start = second(cmd.sent) * 1000 + k * 1000;
        const status = back >= b ? `Não encaixa: volta ${clock(back)}`
            : k * 1000 > CANCEL_LIMIT ? 'Passa do limite de 10 min para cancelar'
            : k * 1000 >= cmd.travel ? 'Chega ao destino antes de cancelar'
            : start + 1000 <= TWK.now() ? 'O segundo de cancelar já passou'
            : '';
        const counter = timer(second(cmd.end) - second(start));
        return { start, back, counter, fit: !status, status: status || `Encaixa · cancele com o contador em ${counter}` };
    };

    const option = (active, title, sub, attrs) => `<button class="sc-option${active ? ' sc-active' : ''}" ${attrs}><b>${title}</b><small>${sub}</small></button>`;

    const mark = id => {
        $('tr.sc-mark').removeClass('sc-mark');
        if (id) $(OUTGOING).find(`[data-command-id="${id}"]`).closest('tr.command-row').addClass('sc-mark');
    };

    const tick = () => {
        const left = $body.data('start') - TWK.now();
        const inside = left <= 0 && left > -1000;
        $body.find('.sc-countdown')
            .text(inside ? 'CANCELE AGORA' : left > 0 ? span(left) : 'Horário passou')
            .toggleClass('sc-soon', inside || left > 0 && left < 10000);
        if (left <= -1000) clearInterval(ticker);
    };

    const render = () => {
        const train = state.trains[state.train];
        clearInterval(ticker);
        if (!train) {
            mark(null);
            return $body.html(TWK.idle(TWK.ICON.target, 'Nenhum trem de nobres', 'Quando 2 ou mais nobres chegarem nesta aldeia com menos de 1 s entre eles, os intervalos para encaixar aparecem aqui.'));
        }
        const gap = gaps(train)[state.gap];
        const results = state.commands.map(cmd => ({ cmd, ...evaluate(cmd, gap) }));
        const chosen = results.find(r => r.cmd.href === state.command && r.fit) || results.find(r => r.fit);
        state.command = chosen?.cmd.href;
        const back = state.returns.filter(t => t > train[0] - RETURN_NEAR && t < train[train.length - 1] + RETURN_NEAR);
        $body.html(`
            ${state.trains.length > 1 ? `<div class="twk-section">
                <div class="twk-label">Trem</div>
                <div class="sc-options">${state.trains.map((t, i) => option(i === state.train, clock(t[0]).slice(0, 8), `${t.length} nobres`, `data-train="${i}"`)).join('')}</div>
            </div>` : ''}
            <div class="twk-section">
                <div class="twk-label">Encaixar entre</div>
                <div class="sc-options">${gaps(train).map((g, i) => option(i === state.gap, `${g.n}º → ${g.n + 1}º`, `${ms(g.a)}–${ms(g.b)}`, `data-gap="${i}"`)).join('')}</div>
                <div class="twk-box">${plan(gap)}</div>
            </div>
            <div class="twk-divider"></div>
            <div class="twk-section">
                <div class="twk-label">Seus comandos</div>
                ${results.length ? results.map(r => `<button class="sc-cmd${r.fit ? ' sc-fit' : ''}${r === chosen ? ' sc-active' : ''}" data-href="${r.cmd.href}">
                    <span class="sc-cmd-name">${TWK.escape(r.cmd.name)}</span>
                    <small>saiu ${clock(r.cmd.sent)}</small>
                    <span class="sc-cmd-status">${r.status}</span>
                </button>`).join('') : '<div class="twk-empty">Envie o apoio. Ao voltar para esta aba, ele aparece aqui.</div>'}
            </div>
            ${back.length ? `<div class="twk-divider"></div>
            <div class="twk-section">
                <div class="twk-label">Retornando</div>
                ${back.map(t => {
                    const p = place(t, train);
                    return `<div class="sc-ret${p.ok ? ' sc-fit' : ''}"><span>${clock(t)}</span><span>${p.ok ? '✓' : '✗'} ${p.text}</span></div>`;
                }).join('')}
            </div>` : ''}
            ${chosen ? `<div class="twk-divider"></div>
            <div class="twk-section">
                <div class="sc-countdown"></div>
                <div class="sc-at"><span>Cancele quando o “Chega em” marcar</span><b>${chosen.counter}</b></div>
            </div>` : ''}
        `);
        mark(chosen?.cmd.id);
        if (!chosen) return;
        $body.data('start', chosen.start);
        ticker = setInterval(tick, 47);
        tick();
    };

    const load = async $root => {
        state.root = $root;
        state.trains = trains($root);
        state.commands = await commands($root);
        state.returns = returns($root);
        state.train = Math.min(state.train, Math.max(0, state.trains.length - 1));
        state.gap = Math.min(state.gap, Math.max(0, (state.trains[state.train] || []).length - 2));
        render();
    };

    const refresh = async $root => {
        const busy = $refresh.hasClass('twk-spinning');
        if (busy) return;
        $refresh.addClass('twk-spinning');
        try {
            await load($root || await TWK.doc(location.href));
        } catch {
            UI.ErrorMessage('Não foi possível atualizar a visualização');
        }
        $refresh.removeClass('twk-spinning');
    };

    const mode = () => {
        $panel.find('.sc-test').toggleClass('twk-active', state.test);
        $panel.find('.twk-sub').text(state.test ? 'Modo teste · qualquer comando conta como nobre' : 'Nobres e comandos detectados sozinhos');
    };

    const test = () => {
        state.test = !state.test;
        localStorage.setItem(TEST_KEY, state.test ? '1' : '0');
        mode();
        if (!state.root) return;
        state.trains = trains(state.root);
        state.train = 0;
        state.gap = 0;
        render();
    };

    const select = (key, value) => {
        state[key] = value;
        if (key === 'train') state.gap = 0;
        render();
    };

    $panel.on('click', '.sc-refresh', () => refresh());
    $panel.on('click', '.sc-test', test);
    $panel.on('click', '[data-train]', e => select('train', +$(e.currentTarget).data('train')));
    $panel.on('click', '[data-gap]', e => select('gap', +$(e.currentTarget).data('gap')));
    $panel.on('click', '.sc-cmd', e => select('command', $(e.currentTarget).data('href')));
    $(window).on('focus.sc', () => refresh());

    mode();
    refresh($(document));
});
