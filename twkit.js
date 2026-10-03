(() => {
    const VERSION = '1.0.0';
    if (window.TWK?.version === VERSION) return;

    const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    const MONO = 'ui-monospace, Consolas, monospace';
    const GAP = 200;
    const TZ_STEP = 15 * 60 * 1000;
    const POS_KEY = 'twkPositions';
    const CHECK = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E\")";
    const CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f7580' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

    const svg = d => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

    const ICON = {
        close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
        plus: svg('<path d="M12 5v14M5 12h14"/>'),
        up: svg('<path d="m6 15 6-6 6 6"/>'),
        down: svg('<path d="m6 9 6 6 6-6"/>'),
        copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
        clear: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
        refresh: svg('<path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>'),
        grip: svg('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
        pin: svg('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
        tag: svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/>'),
        pen: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
        home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/>'),
        target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
        flask: svg('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>'),
        chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
        shield: svg('<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6Z"/>'),
        fill: svg('<path d="M12 5v14M5 12l7 7 7-7"/>'),
        send: svg('<path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/>'),
    };

    const CSS = `
        .twk-panel {
            --bg: #0d0e11; --surface: #15171c; --hover: #1b1e24; --line: #262930; --line-hi: #3a3e47; --thumb: #2e323a;
            --text: #d4d7dd; --muted: #6f7580; --accent: #a33b3b; --ok: #4f9a5b; --warn: #e0a44a;
            position: fixed; top: 18%; left: 40%; z-index: 12000;
            background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 10px;
            box-shadow: 0 18px 40px rgba(0, 0, 0, .55);
            font: 12px/1.4 ${FONT}; text-align: left;
        }
        .twk-panel.twk-center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .twk-panel * { box-sizing: border-box; margin: 0; }
        .twk-panel svg { display: block; flex: none; }
        .twk-panel button, .twk-panel input, .twk-panel select, .twk-panel textarea { font: inherit; color: inherit; }
        .twk-panel .twk-mono { font-family: ${MONO}; }
        .twk-panel .twk-head {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-bottom: 1px solid var(--line); cursor: move; user-select: none;
        }
        .twk-panel .twk-logo {
            width: 28px; height: 28px; display: grid; place-items: center; flex: none;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; color: var(--accent);
        }
        .twk-panel .twk-heading { flex: 1; min-width: 0; }
        .twk-panel .twk-title { font-weight: 600; letter-spacing: .02em; }
        .twk-panel .twk-sub { color: var(--muted); font-size: 11px; }
        .twk-panel .twk-icon {
            width: 24px; height: 24px; display: grid; place-items: center; flex: none;
            background: none; border: 0; border-radius: 4px; color: var(--muted); cursor: pointer;
        }
        .twk-panel .twk-icon:hover { color: var(--text); background: var(--surface); }
        .twk-panel .twk-icon.twk-active { color: var(--accent); background: var(--surface); }
        .twk-panel .twk-spinning svg, .twk-panel .twk-spin { animation: twk-spin .7s linear infinite; }
        @keyframes twk-spin { to { transform: rotate(360deg); } }
        .twk-panel .twk-body { display: flex; flex-direction: column; gap: 12px; padding: 12px; max-height: 75vh; overflow: auto; }
        .twk-panel .twk-section { display: flex; flex-direction: column; gap: 8px; }
        .twk-panel .twk-divider { height: 1px; margin: 0 -12px; background: var(--line); flex: none; }
        .twk-panel .twk-label {
            display: flex; align-items: center; justify-content: space-between; gap: 6px;
            color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
        }
        .twk-panel .twk-label > span { font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; }
        .twk-panel .twk-label .twk-count { color: var(--text); }
        .twk-panel .twk-hint { margin: 0 auto 0 0; display: inline-flex; align-items: center; gap: 6px; }
        .twk-panel .twk-hint::before { content: ''; width: 3px; height: 3px; border-radius: 50%; background: currentColor; transform: translateY(1px); }
        .twk-panel .twk-caption { color: var(--muted); font-size: 11px; }
        .twk-panel .twk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .twk-panel .twk-row { display: flex; align-items: center; gap: 8px; }
        .twk-panel .twk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .twk-panel input[type=text], .twk-panel input[type=number], .twk-panel input[type=datetime-local], .twk-panel select, .twk-panel textarea {
            width: 100%; height: 30px; padding: 0 10px; color-scheme: dark;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; outline: none;
        }
        .twk-panel textarea { height: 100px; padding: 8px 10px; resize: vertical; font: 12px/1.5 ${MONO}; }
        .twk-panel ::placeholder { color: var(--muted); font-family: ${FONT}; }
        .twk-panel input:focus, .twk-panel select:focus, .twk-panel textarea:focus { border-color: var(--accent); }
        .twk-panel input:disabled, .twk-panel select:disabled { opacity: .45; cursor: default; }
        .twk-panel select {
            padding: 0 24px 0 8px; appearance: none; cursor: pointer;
            background: var(--surface) ${CHEVRON} right 6px center / 14px no-repeat;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .twk-panel select:hover { border-color: var(--line-hi); }
        .twk-panel .twk-number { position: relative; }
        .twk-panel .twk-number input { padding-right: 26px; appearance: textfield; -moz-appearance: textfield; }
        .twk-panel .twk-number input::-webkit-inner-spin-button, .twk-panel .twk-number input::-webkit-outer-spin-button { appearance: none; margin: 0; }
        .twk-panel .twk-steps {
            position: absolute; top: 1px; right: 1px; bottom: 1px; width: 20px;
            display: flex; flex-direction: column; border-left: 1px solid var(--line);
        }
        .twk-panel .twk-step { flex: 1; display: grid; place-items: center; padding: 0; background: none; border: 0; color: var(--muted); cursor: pointer; }
        .twk-panel .twk-step:first-child { border-bottom: 1px solid var(--line); border-radius: 0 5px 0 0; }
        .twk-panel .twk-step:last-child { border-radius: 0 0 5px 0; }
        .twk-panel .twk-step:hover { color: var(--text); background: var(--hover); }
        .twk-panel .twk-step svg { width: 10px; height: 10px; }
        .twk-panel .twk-check {
            height: 30px; padding: 0 10px; display: flex; align-items: center; gap: 8px;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer; user-select: none;
        }
        .twk-panel .twk-check:hover { border-color: var(--line-hi); }
        .twk-panel .twk-check input {
            appearance: none; width: 16px; height: 16px; flex: none; cursor: pointer;
            background: var(--surface) center / 12px no-repeat; border: 1px solid var(--line-hi); border-radius: 4px;
        }
        .twk-panel .twk-check input:hover { border-color: var(--muted); }
        .twk-panel .twk-check input:checked { background-color: var(--accent); border-color: var(--accent); background-image: ${CHECK}; }
        .twk-panel .twk-btn {
            height: 30px; padding: 0 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; font-weight: 600; cursor: pointer;
        }
        .twk-panel .twk-btn:hover { border-color: var(--line-hi); background: var(--hover); }
        .twk-panel .twk-btn.twk-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
        .twk-panel .twk-btn.twk-primary:hover { filter: brightness(1.12); }
        .twk-panel .twk-btn:disabled { opacity: .45; pointer-events: none; }
        .twk-panel .twk-box { padding: 8px 10px; background: var(--surface); border: 1px solid var(--line); border-radius: 6px; }
        .twk-panel .twk-empty { color: var(--muted); text-align: center; padding: 8px 0; }
        .twk-panel .twk-idle { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 18px 8px 10px; text-align: center; }
        .twk-panel .twk-idle-icon {
            width: 44px; height: 44px; margin-bottom: 4px; display: grid; place-items: center;
            background: var(--surface); border: 1px solid var(--line); border-radius: 50%; color: var(--muted);
        }
        .twk-panel .twk-idle-icon svg { width: 20px; height: 20px; }
        .twk-panel .twk-idle b { font-size: 13px; font-weight: 600; }
        .twk-panel .twk-idle p { max-width: 250px; color: var(--muted); font-size: 11px; }
        .twk-panel .twk-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 24px 0; color: var(--muted); font-size: 11px; }
        .twk-panel .twk-spin { width: 20px; height: 20px; border: 2px solid var(--line-hi); border-top-color: var(--accent); border-radius: 50%; }
        .twk-panel .twk-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--muted); font-size: 11px; }
        .twk-panel ::-webkit-scrollbar { width: 8px; height: 8px; }
        .twk-panel ::-webkit-scrollbar-track, .twk-panel ::-webkit-scrollbar-corner { background: transparent; }
        .twk-panel ::-webkit-scrollbar-thumb { background: var(--thumb); border-radius: 4px; }
        .twk-panel ::-webkit-scrollbar-thumb:hover { background: var(--line-hi); }
        @supports not selector(::-webkit-scrollbar) {
            .twk-panel * { scrollbar-width: thin; scrollbar-color: var(--thumb) transparent; }
        }
    `;

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const format = n => n.toLocaleString('pt-BR');
    const plural = (n, one, many) => `${format(n)} ${n === 1 ? one : many}`;
    const escape = text => $('<i>').text(text).html();
    const url = path => `${game_data.link_base_pure}${path}`;

    const store = {
        get: (key, fallback = null) => {
            try {
                return JSON.parse(localStorage.getItem(key)) ?? fallback;
            } catch {
                return fallback;
            }
        },
        set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    };

    const redirect = (path, message) => {
        UI.InfoMessage(message);
        location.href = url(path);
    };

    let next = 0;
    const get = async href => {
        const delay = Math.max(0, next - Date.now());
        next = Date.now() + delay + GAP;
        await wait(delay);
        return $.get(href);
    };

    const doc = async href => $(new DOMParser().parseFromString(await get(href), 'text/html'));

    const pages = async (path, { rows, progress = () => {} }) => {
        const first = await doc(url(`${path}&page=-1`));
        const numbers = first.find('.paged-nav-item').get().map(a => +(a.getAttribute('href').match(/page=(\d+)/) || [])[1]).filter(n => !isNaN(n));
        const total = Math.max(0, ...numbers) + 1;
        const size = +first.find('#pagination_form input[name=page_size]').val() || 0;
        const count = first.find(rows).length;
        const missing = size && count <= (total - 1) * size;
        const docs = [first];
        for (let page = missing ? Math.floor(count / size) : total; page < total; page++) {
            progress(page + 1, total);
            docs.push(await doc(url(`${path}&page=${page}`)));
        }
        return docs;
    };

    const serverNow = () => Math.floor(window.Timing?.getCurrentServerTime?.() ?? Date.now());

    let offset;
    const shift = () => {
        const [d, m, y] = $('#serverDate').text().split('/');
        const shown = Date.parse(`${y}-${m}-${d}T${$.trim($('#serverTime').text())}Z`);
        return isNaN(shown) ? 0 : Math.round((shown - serverNow()) / TZ_STEP) * TZ_STEP;
    };
    const now = () => serverNow() + (offset ??= shift());

    const unitInfo = async () => {
        const key = `twkUnitInfo_${game_data.world}`;
        const cached = store.get(key);
        if (cached) return cached;
        const xml = await get('/interface.php?func=get_unit_info');
        const info = Object.fromEntries($(xml).find('config').children().get()
            .map(el => [el.tagName, { speed: +$(el).find('speed').text(), pop: +$(el).find('pop').text() }]));
        store.set(key, info);
        return info;
    };

    const copy = async (text, message) => {
        const fallback = () => {
            const $area = $('<textarea>').val(text).css({ position: 'fixed', opacity: 0 }).appendTo('body').trigger('select');
            document.execCommand('copy');
            $area.remove();
        };
        await (navigator.clipboard ? navigator.clipboard.writeText(text) : fallback());
        UI.SuccessMessage(message);
    };

    const check = (cls, label, checked = false) => `<label class="twk-check"><input type="checkbox" class="${cls}"${checked ? ' checked' : ''}>${label}</label>`;

    const number = (cls, { min = '', max = '', value = '', step = '' } = {}) => `<div class="twk-number">
        <input type="number" class="${cls}" min="${min}" max="${max}" step="${step}" value="${value}">
        <div class="twk-steps"><button class="twk-step" data-step="1">${ICON.up}</button><button class="twk-step" data-step="-1">${ICON.down}</button></div>
    </div>`;

    const loading = text => `<div class="twk-loading"><span class="twk-spin"></span><span>${text}</span></div>`;

    const idle = (icon, title, text) => `<div class="twk-idle"><div class="twk-idle-icon">${icon}</div><b>${title}</b><p>${text}</p></div>`;

    const step = btn => {
        const input = $(btn).closest('.twk-number').find('input')[0];
        const value = (parseFloat(input.value) || 0) + (parseFloat(input.step) || 1) * $(btn).data('step');
        const min = input.min === '' ? -Infinity : +input.min;
        const max = input.max === '' ? Infinity : +input.max;
        input.value = Math.min(Math.max(value, min), max);
        $(input).trigger('input');
    };

    const remember = $panel => {
        const positions = store.get(POS_KEY, {});
        positions[$panel.attr('id')] = $panel.position();
        store.set(POS_KEY, positions);
    };

    const restore = $panel => {
        const pos = store.get(POS_KEY, {})[$panel.attr('id')];
        const fits = pos && pos.left >= 0 && pos.top >= 0 && pos.left < innerWidth - 60 && pos.top < innerHeight - 40;
        if (fits) $panel.css(pos);
    };

    const panel = ({ id, title, sub = '', icon = '', width = 320, actions = '', body = '', css = '', onClose }) => {
        $(`#${id}`).each((_, el) => $(el).data('twkClose')());
        const $panel = $(`<div id="${id}" class="twk-panel" style="width: ${width}px">
            <style>${css}</style>
            <div class="twk-head">
                <div class="twk-logo">${icon}</div>
                <div class="twk-heading">
                    <div class="twk-title">${title}</div>
                    <div class="twk-sub">${sub}</div>
                </div>
                ${actions}
                <button class="twk-icon twk-close" title="Fechar">${ICON.close}</button>
            </div>
            <div class="twk-body">${body}</div>
        </div>`).appendTo('body');
        const close = () => {
            onClose?.();
            $panel.remove();
        };
        $panel.data('twkClose', close).on('click', '.twk-close', close);
        if (window.mobiledevice) return $panel.addClass('twk-center');
        restore($panel);
        if ($.fn.draggable) $panel.draggable({ handle: '.twk-head', cancel: '.twk-icon', containment: 'window', stop: () => remember($panel) });
        return $panel;
    };

    $('#twk-style').remove();
    $(`<style id="twk-style">${CSS}</style>`).appendTo('head');
    $(document).off('click.twk').on('click.twk', '.twk-panel .twk-step', e => step(e.currentTarget));

    window.TWK = {
        version: VERSION,
        svg, ICON,
        panel, check, number, loading, idle,
        wait, format, plural, escape, copy, store,
        url, redirect, get, doc, pages,
        serverNow, now, unitInfo,
    };
})();
