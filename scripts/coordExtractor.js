(() => {
    const ID = 'cc-panel';
    const RX = /(?<!\d)\d{1,3}\|\d{1,3}(?!\d)/g;
    const SEPARATORS = { space: ' ', line: '\n', comma: ',' };
    const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

    const svg = d => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const ICON = {
        close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
        copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
        clear: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
        pin: svg('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
    };

    $(`#${ID}, #${ID}-style`).remove();

    $(`<style id="${ID}-style">
        #${ID} {
            --bg: #0d0e11; --surface: #15171c; --hover: #1b1e24; --line: #262930; --line-hi: #3a3e47;
            --text: #d4d7dd; --muted: #6f7580; --accent: #a33b3b;
            position: fixed; top: 18%; left: 40%; z-index: 12000; width: 340px;
            background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 10px;
            box-shadow: 0 18px 40px rgba(0, 0, 0, .55);
            font: 12px/1.4 ${FONT};
        }
        #${ID} * { box-sizing: border-box; margin: 0; }
        #${ID} svg { display: block; flex: none; }
        #${ID} .cc-head {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-bottom: 1px solid var(--line); cursor: move; user-select: none;
        }
        #${ID} .cc-logo {
            width: 28px; height: 28px; display: grid; place-items: center; flex: none;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; color: var(--accent);
        }
        #${ID} .cc-heading { flex: 1; min-width: 0; }
        #${ID} .cc-title { font-weight: 600; letter-spacing: .02em; }
        #${ID} .cc-sub { color: var(--muted); font-size: 11px; }
        #${ID} .cc-close {
            width: 24px; height: 24px; display: grid; place-items: center;
            background: none; border: 0; border-radius: 4px; color: var(--muted); cursor: pointer;
        }
        #${ID} .cc-close:hover { color: var(--text); background: var(--surface); }
        #${ID} .cc-body { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
        #${ID} .cc-label { display: flex; justify-content: space-between; color: var(--muted); font-size: 11px; margin-bottom: 4px; }
        #${ID} .cc-count { color: var(--text); font-weight: 600; }
        #${ID} textarea {
            width: 100%; height: 110px; padding: 8px 10px; resize: vertical;
            background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 6px; outline: none;
            font: 12px/1.5 ui-monospace, Consolas, monospace;
        }
        #${ID} textarea::placeholder { color: var(--muted); font-family: ${FONT}; }
        #${ID} textarea:focus { border-color: var(--accent); }
        #${ID} textarea[readonly] { height: 90px; }
        #${ID} .cc-options { display: flex; align-items: center; gap: 8px; }
        #${ID} select {
            height: 30px; padding: 0 8px; flex: 1;
            background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 6px; outline: none;
            font: inherit; cursor: pointer;
        }
        #${ID} .cc-check {
            height: 30px; padding: 0 10px; display: flex; align-items: center; gap: 8px; flex: none;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer; user-select: none;
        }
        #${ID} .cc-check:hover { border-color: var(--line-hi); }
        #${ID} .cc-check input {
            appearance: none; width: 16px; height: 16px; flex: none; cursor: pointer;
            background: var(--surface) center / 12px no-repeat; border: 1px solid var(--line-hi); border-radius: 4px;
        }
        #${ID} .cc-check input:hover { border-color: var(--muted); }
        #${ID} .cc-check input:checked {
            background-color: var(--accent); border-color: var(--accent);
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
        }
        #${ID} textarea::-webkit-scrollbar { width: 8px; }
        #${ID} textarea::-webkit-scrollbar-track { background: transparent; }
        #${ID} textarea::-webkit-scrollbar-thumb { background: #2e323a; border-radius: 4px; }
        #${ID} textarea::-webkit-scrollbar-thumb:hover { background: var(--line-hi); }
        #${ID} textarea::-webkit-scrollbar-corner { background: transparent; }
        @supports not selector(::-webkit-scrollbar) {
            #${ID} textarea { scrollbar-width: thin; scrollbar-color: #2e323a transparent; }
        }
        #${ID} .cc-actions { display: flex; gap: 6px; }
        #${ID} .cc-btn {
            height: 30px; padding: 0 12px; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 6px;
            font: inherit; font-weight: 600; cursor: pointer;
        }
        #${ID} .cc-btn:hover { border-color: var(--line-hi); background: var(--hover); }
        #${ID} .cc-btn.cc-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
        #${ID} .cc-btn.cc-primary:hover { filter: brightness(1.12); }
        #${ID} .cc-btn:disabled { opacity: .45; pointer-events: none; }
    </style>`).appendTo('head');

    const $panel = $(`<div id="${ID}">
        <div class="cc-head">
            <div class="cc-logo">${ICON.pin}</div>
            <div class="cc-heading">
                <div class="cc-title">Coletor de Coordenadas</div>
                <div class="cc-sub">Extrai coordenadas de qualquer texto</div>
            </div>
            <button class="cc-close" title="Fechar">${ICON.close}</button>
        </div>
        <div class="cc-body">
            <div>
                <div class="cc-label">Texto</div>
                <textarea class="cc-input" placeholder="Cole aqui qualquer texto"></textarea>
            </div>
            <div class="cc-options">
                <select class="cc-sep">
                    <option value="line" selected>Uma por linha</option>
                    <option value="space">Separar por espaço</option>
                    <option value="comma">Separar por vírgula</option>
                </select>
                <label class="cc-check"><input type="checkbox" class="cc-unique" checked>Sem repetidas</label>
            </div>
            <div>
                <div class="cc-label">Coordenadas <span class="cc-count">0</span></div>
                <textarea class="cc-output" readonly></textarea>
            </div>
            <div class="cc-actions">
                <button class="cc-btn cc-clear">${ICON.clear}Limpar</button>
                <button class="cc-btn cc-primary cc-copy" disabled>${ICON.copy}Copiar</button>
            </div>
        </div>
    </div>`).appendTo('body');

    const $input = $panel.find('.cc-input');
    const $output = $panel.find('.cc-output');
    const $sep = $panel.find('.cc-sep');
    const $unique = $panel.find('.cc-unique');
    const $count = $panel.find('.cc-count');
    const $copy = $panel.find('.cc-copy');

    const collect = () => {
        const found = $input.val().match(RX) || [];
        const coords = $unique.is(':checked') ? [...new Set(found)] : found;
        $output.val(coords.join(SEPARATORS[$sep.val()]));
        $count.text(coords.length);
        $copy.prop('disabled', !coords.length);
    };

    const copy = () => {
        const text = $output.val();
        const done = () => UI.SuccessMessage(`${$count.text()} coordenada(s) copiada(s)`);
        if (navigator.clipboard) return navigator.clipboard.writeText(text).then(done);
        $output.trigger('select');
        document.execCommand('copy');
        done();
    };

    $panel.on('click', '.cc-close', () => $(`#${ID}, #${ID}-style`).remove());
    $panel.on('click', '.cc-copy', copy);
    $panel.on('click', '.cc-clear', () => {
        $input.val('').trigger('focus');
        collect();
    });
    $input.on('input', collect);
    $sep.add($unique).on('change', collect);

    if ($.fn.draggable) $panel.draggable({ handle: '.cc-head', cancel: '.cc-close', containment: 'window' });
    if (window.mobiledevice) $panel.css({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

    $input.trigger('focus');
})();
