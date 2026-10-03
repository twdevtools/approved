$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.0.0/twkit.js', dataType: 'script', cache: true }).then(() => {
    const page = game_data.screen === 'overview_villages';
    if (!page) return TWK.redirect('overview_villages&mode=combined&group=0', 'Redirecionando para a visualização de aldeias...');

    const KEY = 'twRenameVillages';
    const LEGACY = 'set';
    const MAX = 32;
    const RX = /\)\s*(K\d+)$/;
    const TOKENS = [
        ['{num}', 'Número'],
        ['{k}', 'Continente'],
        ['{nome}', 'Nome atual'],
    ];

    const $panel = TWK.panel({
        id: 'rv-panel',
        title: 'Renomear Aldeias',
        sub: 'Renomeia todas as aldeias da página',
        icon: TWK.ICON.home,
        width: 310,
        css: `
            #rv-panel .rv-tokens { display: flex; flex-wrap: wrap; gap: 6px; }
            #rv-panel .rv-token { height: 24px; padding: 0 8px; font-size: 11px; font-weight: 400; gap: 4px; }
            #rv-panel .rv-token svg { width: 11px; height: 11px; color: var(--muted); }
        `,
        body: `
            <div class="twk-section">
                <div class="twk-label">Formato <span class="rv-count"></span></div>
                <input type="text" class="rv-format" placeholder="Ex.: {num} {k} Norte">
                <div class="rv-tokens">
                    ${TOKENS.map(([token, label]) => `<button class="twk-btn rv-token" data-token="${token}">${TWK.ICON.plus}${label}</button>`).join('')}
                </div>
            </div>
            <div class="twk-divider"></div>
            <div class="twk-section">
                <div class="twk-label">Numeração <span class="twk-hint">usada pelo {num}</span></div>
                <div class="twk-grid">
                    <div class="twk-field"><span class="twk-caption">Começar em</span>${TWK.number('rv-start', { min: 0, value: 1 })}</div>
                    <div class="twk-field"><span class="twk-caption">Dígitos</span>${TWK.number('rv-digits', { min: 1, max: 5, value: 3 })}</div>
                </div>
                ${TWK.check('rv-per', 'Reiniciar a cada continente')}
            </div>
            <button class="twk-btn twk-primary rv-run">${TWK.ICON.pen}Renomear aldeias</button>
        `,
    });

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

    const legacy = () => {
        const old = TWK.store.get(LEGACY);
        const valid = old && 'firstbox' in old;
        if (!valid) return null;
        const format = [old.firstbox ? '{num}' : '', old.secondbox ? old.textname : ''].join(' ').trim();
        return { format, start: old.start, digits: old.end, per: false };
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

    const counter = () => $count.text(TWK.plural($villages.length, 'aldeia', 'aldeias'));

    const rename = async () => {
        const opt = read();
        if (!opt.format) return UI.InfoMessage('Defina o formato do nome');
        if (!$villages.length) return UI.ErrorMessage('Nenhuma aldeia encontrada nesta página');
        TWK.store.set(KEY, opt);
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
            await TWK.wait(200);
        }
        $run.prop('disabled', false);
        counter();
        UI.SuccessMessage(`${TWK.plural(total, 'aldeia renomeada', 'aldeias renomeadas')}`);
    };

    $panel.on('click', '.rv-token', e => insert($(e.currentTarget).data('token')));
    $run.on('click', rename);
    $format.on('keydown', e => {
        if (e.key === 'Enter') rename();
    });

    const stored = TWK.store.get(KEY);
    const saved = stored && 'format' in stored ? stored : legacy();
    if (saved) {
        $format.val(saved.format);
        $start.val(saved.start);
        $digits.val(saved.digits);
        $per.prop('checked', saved.per);
    }

    counter();
    $format.trigger('focus');
});
