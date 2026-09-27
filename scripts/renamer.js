(() => {
    if (!location.href.includes('screen=overview_villages')) {
        UI.InfoMessage('Redirecionando para a visualização de aldeias...');
        return location.href = `${game_data.link_base_pure}overview_villages&mode=combined&group=0`;
    }

    const ID = 'rv-panel';
    const KEY = 'twRenameVillages';
    const LEGACY = 'set';
    const DELAY = 200;
    const MAX = 32;
    const RX = /\)\s*(K\d+)$/;
    const TOKENS = [
        ['{num}', 'Número'],
        ['{k}', 'Continente'],
        ['{nome}', 'Nome atual'],
    ];
    const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

    const svg = d => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const ICON = {
        close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
        pen: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
        home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/>'),
        plus: svg('<path d="M12 5v14M5 12h14"/>'),
        up: svg('<path d="m6 15 6-6 6 6"/>'),
        down: svg('<path d="m6 9 6 6 6-6"/>'),
    };
    const STEPS = `<div class="rv-steps"><button class="rv-step" data-step="1">${ICON.up}</button><button class="rv-step" data-step="-1">${ICON.down}</button></div>`;

    $(`#${ID}, #${ID}-style`).remove();

    $(`<style id="${ID}-style">
        #${ID} {
            --bg: #0d0e11; --surface: #15171c; --hover: #1b1e24; --line: #262930; --line-hi: #3a3e47;
            --text: #d4d7dd; --muted: #6f7580; --accent: #a33b3b;
            position: fixed; top: 18%; left: 40%; z-index: 12000; width: 310px;
            background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 10px;
            box-shadow: 0 18px 40px rgba(0, 0, 0, .55);
            font: 12px/1.4 ${FONT};
        }
        #${ID} * { box-sizing: border-box; margin: 0; }
        #${ID} svg { display: block; flex: none; }
        #${ID} .rv-head {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-bottom: 1px solid var(--line); cursor: move; user-select: none;
        }
        #${ID} .rv-logo {
            width: 28px; height: 28px; display: grid; place-items: center; flex: none;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; color: var(--accent);
        }
        #${ID} .rv-heading { flex: 1; min-width: 0; }
        #${ID} .rv-title { font-weight: 600; letter-spacing: .02em; }
        #${ID} .rv-sub { color: var(--muted); font-size: 11px; }
        #${ID} .rv-close {
            width: 24px; height: 24px; display: grid; place-items: center;
            background: none; border: 0; border-radius: 4px; color: var(--muted); cursor: pointer;
        }
        #${ID} .rv-close:hover { color: var(--text); background: var(--surface); }
        #${ID} .rv-body { display: flex; flex-direction: column; gap: 12px; padding: 12px; }
        #${ID} .rv-section { display: flex; flex-direction: column; gap: 8px; }
        #${ID} .rv-divider { height: 1px; margin: 0 -12px; background: var(--line); }
        #${ID} .rv-label {
            display: flex; align-items: center; justify-content: space-between;
            color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
        }
        #${ID} .rv-count, #${ID} .rv-hint { font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; }
        #${ID} .rv-hint { margin: 0 auto 0 6px; display: inline-flex; align-items: center; gap: 6px; }
        #${ID} .rv-hint::before { content: ""; width: 3px; height: 3px; border-radius: 50%; background: currentColor; transform: translateY(1px); }
        #${ID} input[type=text], #${ID} input[type=number] {
            width: 100%; height: 30px; padding: 0 10px;
            background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 6px; outline: none;
            font: inherit;
        }
        #${ID} input::placeholder { color: var(--muted); }
        #${ID} input[type=text]:focus, #${ID} input[type=number]:focus { border-color: var(--accent); }
        #${ID} .rv-tokens { display: flex; flex-wrap: wrap; gap: 6px; }
        #${ID} .rv-token {
            height: 24px; padding: 0 8px; display: inline-flex; align-items: center; gap: 4px;
            background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 5px;
            font: inherit; font-size: 11px; cursor: pointer;
        }
        #${ID} .rv-token svg { width: 11px; height: 11px; color: var(--muted); }
        #${ID} .rv-token:hover { border-color: var(--line-hi); background: var(--hover); }
        #${ID} .rv-check {
            height: 30px; padding: 0 10px; display: flex; align-items: center; gap: 8px;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer; user-select: none;
        }
        #${ID} .rv-check:hover { border-color: var(--line-hi); }
        #${ID} .rv-check input {
            appearance: none; width: 16px; height: 16px; flex: none; cursor: pointer;
            background: var(--surface) center / 12px no-repeat; border: 1px solid var(--line-hi); border-radius: 4px;
        }
        #${ID} .rv-check input:checked {
            background-color: var(--accent); border-color: var(--accent);
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
        }
        #${ID} .rv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        #${ID} .rv-number { position: relative; }
        #${ID} .rv-number input { padding-right: 26px; appearance: textfield; -moz-appearance: textfield; }
        #${ID} .rv-number input::-webkit-inner-spin-button, #${ID} .rv-number input::-webkit-outer-spin-button { appearance: none; margin: 0; }
        #${ID} .rv-steps {
            position: absolute; top: 1px; right: 1px; bottom: 1px; width: 20px;
            display: flex; flex-direction: column; border-left: 1px solid var(--line);
        }
        #${ID} .rv-step {
            flex: 1; display: grid; place-items: center; padding: 0;
            background: none; border: 0; color: var(--muted); cursor: pointer;
        }
        #${ID} .rv-step:first-child { border-bottom: 1px solid var(--line); border-radius: 0 5px 0 0; }
        #${ID} .rv-step:last-child { border-radius: 0 0 5px 0; }
        #${ID} .rv-step:hover { color: var(--text); background: var(--hover); }
        #${ID} .rv-step svg { width: 10px; height: 10px; }
        #${ID} .rv-field { display: flex; flex-direction: column; gap: 4px; }
        #${ID} .rv-caption { color: var(--muted); font-size: 11px; }
        #${ID} .rv-btn {
            height: 30px; padding: 0 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            background: var(--accent); color: #fff; border: 1px solid var(--accent); border-radius: 6px;
            font: inherit; font-weight: 600; cursor: pointer;
        }
        #${ID} .rv-btn:hover { filter: brightness(1.12); }
        #${ID} .rv-btn:disabled { opacity: .5; pointer-events: none; }
    </style>`).appendTo('head');

    const $panel = $(`<div id="${ID}">
        <div class="rv-head">
            <div class="rv-logo">${ICON.home}</div>
            <div class="rv-heading">
                <div class="rv-title">Renomear Aldeias</div>
                <div class="rv-sub">Renomeia todas as aldeias da página</div>
            </div>
            <button class="rv-close" title="Fechar">${ICON.close}</button>
        </div>
        <div class="rv-body">
            <div class="rv-section">
                <div class="rv-label">Formato <span class="rv-count"></span></div>
                <input type="text" class="rv-format" placeholder="Ex.: {num} {k} Norte">
                <div class="rv-tokens">
                    ${TOKENS.map(([token, label]) => `<button class="rv-token" data-token="${token}">${ICON.plus}${label}</button>`).join('')}
                </div>
            </div>
            <div class="rv-divider"></div>
            <div class="rv-section">
                <div class="rv-label">Numeração <span class="rv-hint">usada pelo {num}</span></div>
                <div class="rv-grid">
                    <div class="rv-field">
                        <span class="rv-caption">Começar em</span>
                        <div class="rv-number"><input type="number" class="rv-start" min="0" value="1">${STEPS}</div>
                    </div>
                    <div class="rv-field">
                        <span class="rv-caption">Dígitos</span>
                        <div class="rv-number"><input type="number" class="rv-digits" min="1" max="5" value="3">${STEPS}</div>
                    </div>
                </div>
                <label class="rv-check"><input type="checkbox" class="rv-per">Reiniciar a cada continente</label>
            </div>
            <button class="rv-btn rv-run">${ICON.pen}Renomear aldeias</button>
        </div>
    </div>`).appendTo('body');

    const $format = $panel.find('.rv-format');
    const $start = $panel.find('.rv-start');
    const $digits = $panel.find('.rv-digits');
    const $per = $panel.find('.rv-per');
    const $count = $panel.find('.rv-count');
    const $run = $panel.find('.rv-run');
    const $villages = $('.quickedit-vn');

    const read = () => ({
        format: $.trim($format.val()),
        start: Math.max(0, parseInt($start.val()) || 0),
        digits: Math.min(5, Math.max(1, parseInt($digits.val()) || 1)),
        per: $per.is(':checked'),
    });

    const load = () => {
        try {
            const saved = JSON.parse(localStorage[KEY] || 'null');
            if (saved && 'format' in saved) return saved;
            const old = JSON.parse(localStorage[LEGACY] || 'null');
            if (!old || !('firstbox' in old)) return null;
            const format = [old.firstbox ? '{num}' : '', old.secondbox ? old.textname : ''].join(' ').trim();
            return { format, start: old.start, digits: old.end, per: false };
        } catch {
            return null;
        }
    };

    const info = $village => {
        const $label = $village.find('.quickedit-label').first();
        const match = $.trim($label.text()).match(RX) || [];
        return { name: $.trim($label.attr('data-text')), k: match[1] || '' };
    };

    const insert = token => {
        const el = $format[0];
        const value = el.value;
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        const spaced = `${start && value[start - 1] !== ' ' ? ' ' : ''}${token}`;
        el.value = value.slice(0, start) + spaced + value.slice(end);
        el.focus();
        el.setSelectionRange(start + spaced.length, start + spaced.length);
    };

    const step = btn => {
        const input = $(btn).closest('.rv-number').find('input')[0];
        const next = (parseInt(input.value) || 0) + $(btn).data('step');
        input.value = Math.min(Math.max(next, input.min === '' ? -Infinity : +input.min), input.max === '' ? Infinity : +input.max);
    };

    const counter = () => $count.text(`${$villages.length} aldeia${$villages.length === 1 ? '' : 's'}`);

    const wait = ms => new Promise(done => setTimeout(done, ms));

    const rename = async () => {
        const opt = read();
        if (!opt.format) return UI.InfoMessage('Defina o formato do nome');
        if (!$villages.length) return UI.ErrorMessage('Nenhuma aldeia encontrada nesta página');
        localStorage.setItem(KEY, JSON.stringify(opt));
        const total = $villages.length;
        const seq = {};
        $run.prop('disabled', true);
        for (const [i, el] of $villages.get().entries()) {
            const $village = $(el);
            const village = info($village);
            const group = opt.per ? village.k : 'all';
            seq[group] = seq[group] ?? opt.start;
            const values = { '{num}': String(seq[group]++).padStart(opt.digits, '0'), '{k}': village.k, '{nome}': village.name };
            const name = opt.format.replace(/\{(num|k|nome)\}/g, token => values[token]).replace(/\s+/g, ' ').trim().slice(0, MAX);
            $count.text(`Renomeando ${i + 1}/${total}`);
            $village.find('.rename-icon').first().trigger('click');
            $village.find('.quickedit-edit input[type=text]').first().val(name);
            $village.find('.quickedit-edit input[type=button]').first().trigger('click');
            await wait(DELAY);
        }
        $run.prop('disabled', false);
        counter();
        UI.SuccessMessage(`${total} aldeia(s) renomeada(s)`);
    };

    $panel.on('click', '.rv-close', () => $(`#${ID}, #${ID}-style`).remove());
    $panel.on('click', '.rv-token', e => insert($(e.currentTarget).data('token')));
    $panel.on('click', '.rv-step', e => step(e.currentTarget));
    $run.on('click', rename);
    $format.on('keydown', e => {
        if (e.key === 'Enter') rename();
    });

    const saved = load();
    if (saved) {
        $format.val(saved.format);
        $start.val(saved.start);
        $digits.val(saved.digits);
        $per.prop('checked', saved.per);
    }

    if ($.fn.draggable) $panel.draggable({ handle: '.rv-head', cancel: '.rv-close', containment: 'window' });
    if (window.mobiledevice) $panel.css({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

    counter();
    $format.trigger('focus');
})();
