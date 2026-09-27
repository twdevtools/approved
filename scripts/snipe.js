(() => {
    if (game_data.screen !== 'overview') {
        UI.InfoMessage('Redirecionando para a visualização da aldeia...');
        return location.href = `${game_data.link_base_pure}overview`;
    }

    const ID = 'sc-panel';
    const INCOMING = '#show_incoming_units, #commands_incomings';
    const OUTGOING = '#show_outgoing_units, #commands_outgoings';
    const CANCEL_LIMIT = 10 * 60 * 1000;
    const TRAIN_GAP = 1000;
    const RETURN_NEAR = 60 * 1000;
    const TZ_STEP = 15 * 60 * 1000;
    const TEST_KEY = 'twSnipeTest';
    const RX_DURATION = /^\d+:\d{2}:\d{2}$/;
    const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

    const svg = d => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const ICON = {
        close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
        target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
        flask: svg('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>'),
        refresh: svg('<path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>'),
    };

    $(`#${ID}, #${ID}-style`).remove();
    $('tr.sc-mark').removeClass('sc-mark');
    $(window).off('.sc');
    clearInterval(window.scTimer);

    $(`<style id="${ID}-style">
        #${ID} {
            --bg: #0d0e11; --surface: #15171c; --hover: #1b1e24; --line: #262930; --line-hi: #3a3e47;
            --text: #d4d7dd; --muted: #6f7580; --accent: #a33b3b; --ok: #4f9a5b;
            position: fixed; top: 18%; left: 40%; z-index: 12000; width: 330px;
            background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 10px;
            box-shadow: 0 18px 40px rgba(0, 0, 0, .55);
            font: 12px/1.4 ${FONT};
        }
        #${ID} * { box-sizing: border-box; margin: 0; }
        #${ID} svg { display: block; flex: none; }
        #${ID} button { font: inherit; color: inherit; }
        #${ID} .sc-head {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-bottom: 1px solid var(--line); cursor: move; user-select: none;
        }
        #${ID} .sc-logo {
            width: 28px; height: 28px; display: grid; place-items: center; flex: none;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; color: var(--accent);
        }
        #${ID} .sc-heading { flex: 1; min-width: 0; }
        #${ID} .sc-title { font-weight: 600; letter-spacing: .02em; }
        #${ID} .sc-sub { color: var(--muted); font-size: 11px; }
        #${ID} .sc-icon {
            width: 24px; height: 24px; display: grid; place-items: center;
            background: none; border: 0; border-radius: 4px; color: var(--muted); cursor: pointer;
        }
        #${ID} .sc-icon:hover { color: var(--text); background: var(--surface); }
        #${ID} .sc-icon.sc-active { color: var(--accent); background: var(--surface); }
        #${ID} .sc-busy .sc-refresh svg { animation: sc-spin .8s linear infinite; }
        @keyframes sc-spin { to { transform: rotate(360deg); } }
        #${ID} .sc-body { display: flex; flex-direction: column; gap: 12px; padding: 12px; max-height: 70vh; overflow: auto; }
        #${ID} .sc-section { display: flex; flex-direction: column; gap: 8px; }
        #${ID} .sc-divider { height: 1px; margin: 0 -12px; background: var(--line); flex: none; }
        #${ID} .sc-label { color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
        #${ID} .sc-empty { color: var(--muted); text-align: center; padding: 8px 0; }
        #${ID} .sc-idle { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 18px 8px 10px; text-align: center; }
        #${ID} .sc-idle-icon {
            width: 44px; height: 44px; margin-bottom: 4px; display: grid; place-items: center;
            background: var(--surface); border: 1px solid var(--line); border-radius: 50%; color: var(--muted);
        }
        #${ID} .sc-idle-icon svg { width: 20px; height: 20px; }
        #${ID} .sc-idle b { font-size: 13px; font-weight: 600; }
        #${ID} .sc-idle p { max-width: 250px; color: var(--muted); font-size: 11px; }
        #${ID} .sc-options { display: flex; gap: 6px; }
        #${ID} .sc-option b, #${ID} .sc-option small { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
        #${ID} .sc-option {
            flex: 1 1 0; min-width: 0; padding: 6px 4px; white-space: nowrap; display: flex; flex-direction: column; align-items: center; gap: 1px;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer;
        }
        #${ID} .sc-option:hover { border-color: var(--line-hi); background: var(--hover); }
        #${ID} .sc-option.sc-active { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
        #${ID} .sc-option b { font-weight: 600; }
        #${ID} .sc-option small, #${ID} .sc-cmd small { color: var(--muted); font: 11px ui-monospace, Consolas, monospace; }
        #${ID} .sc-plan { padding: 8px 10px; background: var(--surface); border: 1px solid var(--line); border-radius: 6px; }
        #${ID} .sc-plan b { font-family: ui-monospace, Consolas, monospace; }
        #${ID} .sc-cmd {
            width: 100%; padding: 7px 10px; display: flex; flex-direction: column; gap: 2px; text-align: left;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer;
        }
        #${ID} .sc-cmd:hover { border-color: var(--line-hi); background: var(--hover); }
        #${ID} .sc-cmd.sc-active { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
        #${ID} .sc-cmd-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #${ID} .sc-cmd-status { font-size: 11px; color: #e0a44a; }
        #${ID} .sc-cmd.sc-fit .sc-cmd-status { color: var(--ok); font-weight: 600; }
        #${ID} .sc-ret {
            padding: 6px 10px; display: flex; justify-content: space-between; gap: 10px;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; font-size: 11px;
        }
        #${ID} .sc-ret span:first-child { font-family: ui-monospace, Consolas, monospace; }
        #${ID} .sc-ret span:last-child { color: #e0a44a; }
        #${ID} .sc-ret.sc-fit span:last-child { color: var(--ok); font-weight: 600; }
        #${ID} .sc-countdown { padding: 4px 0; font: 600 22px ui-monospace, Consolas, monospace; text-align: center; }
        #${ID} .sc-countdown.sc-soon { color: var(--accent); }
        #${ID} .sc-at { color: var(--muted); text-align: center; font-size: 11px; }
        #${ID} .sc-at b { color: var(--text); font: 600 13px ui-monospace, Consolas, monospace; }
        #${ID} .sc-target { display: flex; justify-content: center; align-items: baseline; gap: 6px; }
        tr.sc-mark > td { background: #fff0a8 !important; }
        #${ID} .sc-body::-webkit-scrollbar { width: 8px; }
        #${ID} .sc-body::-webkit-scrollbar-thumb { background: #2e323a; border-radius: 4px; }
        @supports not selector(::-webkit-scrollbar) {
            #${ID} .sc-body { scrollbar-width: thin; scrollbar-color: #2e323a transparent; }
        }
    </style>`).appendTo('head');

    const $panel = $(`<div id="${ID}">
        <div class="sc-head">
            <div class="sc-logo">${ICON.target}</div>
            <div class="sc-heading">
                <div class="sc-title">Snipe Cancel</div>
                <div class="sc-sub"></div>
            </div>
            <button class="sc-icon sc-test" title="Modo teste: qualquer comando chegando conta como nobre">${ICON.flask}</button>
            <button class="sc-icon sc-refresh" title="Atualizar">${ICON.refresh}</button>
            <button class="sc-icon sc-close" title="Fechar">${ICON.close}</button>
        </div>
        <div class="sc-body"></div>
    </div>`).appendTo('body');

    const $body = $panel.find('.sc-body');
    const durations = {};
    const state = { root: null, trains: [], commands: [], returns: [], train: 0, gap: 0, command: null, test: localStorage.getItem(TEST_KEY) === '1' };

    const pad = (n, size = 2) => String(n).padStart(size, '0');
    const serverNow = () => Math.floor(window.Timing && Timing.getCurrentServerTime ? Timing.getCurrentServerTime() : Date.now());

    const shift = (() => {
        const [d, m, y] = $('#serverDate').text().split('/');
        const shown = Date.parse(`${y}-${m}-${d}T${$.trim($('#serverTime').text())}Z`);
        return isNaN(shown) ? 0 : Math.round((shown - serverNow()) / TZ_STEP) * TZ_STEP;
    })();

    const now = () => serverNow() + shift;
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
    const drag = () => {
        if ($.fn.draggable) $panel.draggable({ handle: '.sc-head', cancel: '.sc-icon', containment: 'window' });
        if (window.mobiledevice) $panel.css({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    };

    const arrival = row => {
        const $row = $(row);
        return +$row.find('[data-endtime]').first().attr('data-endtime') * 1000 + (+$row.find('.grey.small').first().text() || 0) + shift;
    };

    const trains = $root => $root.find(INCOMING).find('tr.command-row')
        .filter((_, row) => state.test || $(row).find('img[src*="command/snob"]').length)
        .get().map(arrival).sort((a, b) => a - b)
        .reduce((acc, t) => {
            const last = acc[acc.length - 1];
            if (last && t - last[last.length - 1] < TRAIN_GAP) last.push(t);
            else acc.push([t]);
            return acc;
        }, [])
        .filter(train => train.length > 1);

    const duration = async href => {
        if (href in durations) return durations[href];
        const html = await $.get(href);
        const text = $.trim($(html).find('#content_value td').filter((_, td) => RX_DURATION.test($.trim(td.textContent))).first().text());
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
        return list.filter(cmd => cmd.travel && cmd.sent > now() - CANCEL_LIMIT);
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
            : start + 1000 <= now() ? 'O segundo de cancelar já passou'
            : '';
        const counter = timer(second(cmd.end) - second(start));
        return { start, back, counter, fit: !status, status: status || `Encaixa · cancele com o contador em ${counter}` };
    };

    const option = (active, title, sub, attrs) => `<button class="sc-option${active ? ' sc-active' : ''}" ${attrs}><b>${title}</b><small>${sub}</small></button>`;

    const render = () => {
        const train = state.trains[state.train];
        if (!train) return $body.html(`<div class="sc-idle">
            <div class="sc-idle-icon">${ICON.target}</div>
            <b>Nenhum trem de nobres</b>
            <p>Quando 2 ou mais nobres chegarem nesta aldeia com menos de 1 s entre eles, os intervalos para encaixar aparecem aqui.</p>
        </div>`);
        const gap = gaps(train)[state.gap];
        const results = state.commands.map(cmd => ({ cmd, ...evaluate(cmd, gap) }));
        const chosen = results.find(r => r.cmd.href === state.command && r.fit) || results.find(r => r.fit);
        state.command = chosen && chosen.cmd.href;
        const back = state.returns.filter(t => t > train[0] - RETURN_NEAR && t < train[train.length - 1] + RETURN_NEAR);
        $body.html(`
            ${state.trains.length > 1 ? `<div class="sc-section">
                <div class="sc-label">Trem</div>
                <div class="sc-options">${state.trains.map((t, i) => option(i === state.train, clock(t[0]).slice(0, 8), `${t.length} nobres`, `data-train="${i}"`)).join('')}</div>
            </div>` : ''}
            <div class="sc-section">
                <div class="sc-label">Encaixar entre</div>
                <div class="sc-options">${gaps(train).map((g, i) => option(i === state.gap, `${g.n}º → ${g.n + 1}º`, `${ms(g.a)}–${ms(g.b)}`, `data-gap="${i}"`)).join('')}</div>
                <div class="sc-plan">${plan(gap)}</div>
            </div>
            <div class="sc-divider"></div>
            <div class="sc-section">
                <div class="sc-label">Seus comandos</div>
                ${results.length ? results.map(r => `<button class="sc-cmd${r.fit ? ' sc-fit' : ''}${chosen && r === chosen ? ' sc-active' : ''}" data-href="${r.cmd.href}">
                    <span class="sc-cmd-name">${$('<i>').text(r.cmd.name).html()}</span>
                    <small>saiu ${clock(r.cmd.sent)}</small>
                    <span class="sc-cmd-status">${r.status}</span>
                </button>`).join('') : '<div class="sc-empty">Envie o apoio. Ao voltar para esta aba, ele aparece aqui.</div>'}
            </div>
            ${back.length ? `<div class="sc-divider"></div>
            <div class="sc-section">
                <div class="sc-label">Retornando</div>
                ${back.map(t => {
                    const p = place(t, train);
                    return `<div class="sc-ret${p.ok ? ' sc-fit' : ''}"><span>${clock(t)}</span><span>${p.ok ? '✓' : '✗'} ${p.text}</span></div>`;
                }).join('')}
            </div>` : ''}
            ${chosen ? `<div class="sc-divider"></div>
            <div class="sc-section">
                <div class="sc-countdown"></div>
                <div class="sc-at sc-target"><span>Cancele quando o “Chega em” marcar</span><b>${chosen.counter}</b></div>
            </div>` : ''}
        `);
        mark(chosen && chosen.cmd.id);
        clearInterval(window.scTimer);
        if (!chosen) return;
        $body.data('start', chosen.start);
        window.scTimer = setInterval(tick, 47);
        tick();
    };

    const mark = id => {
        $('tr.sc-mark').removeClass('sc-mark');
        if (id) $(OUTGOING).find(`[data-command-id="${id}"]`).closest('tr.command-row').addClass('sc-mark');
    };

    const tick = () => {
        const left = $body.data('start') - now();
        const inside = left <= 0 && left > -1000;
        $body.find('.sc-countdown')
            .text(inside ? 'CANCELE AGORA' : left > 0 ? span(left) : 'Horário passou')
            .toggleClass('sc-soon', inside || left > 0 && left < 10000);
        if (left <= -1000) clearInterval(window.scTimer);
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

    const refresh = async () => {
        if ($panel.hasClass('sc-busy')) return;
        $panel.addClass('sc-busy');
        try {
            await load($('<div>').html(await $.get(location.href)));
        } catch {
            UI.ErrorMessage('Não foi possível atualizar a visualização');
        }
        $panel.removeClass('sc-busy');
    };

    const mode = () => {
        $panel.find('.sc-test').toggleClass('sc-active', state.test);
        $panel.find('.sc-sub').text(state.test ? 'Modo teste · qualquer comando conta como nobre' : 'Nobres e comandos detectados sozinhos');
    };

    const close = () => {
        clearInterval(window.scTimer);
        mark(null);
        $(window).off('.sc');
        $(`#${ID}, #${ID}-style`).remove();
    };

    $panel.on('click', '.sc-close', close);
    $panel.on('click', '.sc-refresh', refresh);
    $panel.on('click', '.sc-test', () => {
        state.test = !state.test;
        localStorage.setItem(TEST_KEY, state.test ? '1' : '0');
        mode();
        if (!state.root) return;
        state.trains = trains(state.root);
        state.train = 0;
        state.gap = 0;
        render();
    });
    $panel.on('click', '[data-train]', e => {
        state.train = +$(e.currentTarget).data('train');
        state.gap = 0;
        render();
    });
    $panel.on('click', '[data-gap]', e => {
        state.gap = +$(e.currentTarget).data('gap');
        render();
    });
    $panel.on('click', '.sc-cmd', e => {
        state.command = $(e.currentTarget).data('href');
        render();
    });
    $(window).on('focus.sc', refresh);

    drag();

    mode();
    load($(document));
})();
