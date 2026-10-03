$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.0.0/twkit.js', dataType: 'script', cache: true }).then(() => {
    const RX = /(?<!\d)\d{1,3}\|\d{1,3}(?!\d)/g;
    const SEPARATORS = { line: '\n', space: ' ', comma: ',' };

    const $panel = TWK.panel({
        id: 'cc-panel',
        title: 'Coletor de Coordenadas',
        sub: 'Extrai coordenadas de qualquer texto',
        icon: TWK.ICON.pin,
        width: 340,
        css: `
            #cc-panel .cc-label { display: flex; justify-content: space-between; color: var(--muted); font-size: 11px; }
            #cc-panel .cc-count { color: var(--text); font-weight: 600; }
            #cc-panel .cc-output { height: 90px; }
            #cc-panel .twk-row .twk-check { flex: none; }
            #cc-panel .cc-actions .twk-btn { flex: 1; }
        `,
        body: `
            <div class="twk-field">
                <div class="cc-label">Texto</div>
                <textarea class="cc-input" placeholder="Cole aqui qualquer texto"></textarea>
            </div>
            <div class="twk-row">
                <select class="cc-sep">
                    <option value="line">Uma por linha</option>
                    <option value="space">Separar por espaço</option>
                    <option value="comma">Separar por vírgula</option>
                </select>
                ${TWK.check('cc-unique', 'Sem repetidas', true)}
            </div>
            <div class="twk-field">
                <div class="cc-label">Coordenadas <span class="cc-count">0</span></div>
                <textarea class="cc-output" readonly></textarea>
            </div>
            <div class="twk-row cc-actions">
                <button class="twk-btn cc-clear">${TWK.ICON.clear}Limpar</button>
                <button class="twk-btn twk-primary cc-copy" disabled>${TWK.ICON.copy}Copiar</button>
            </div>
        `,
    });

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

    const clear = () => {
        $input.val('').trigger('focus');
        collect();
    };

    $panel.on('click', '.cc-copy', () => TWK.copy($output.val(), `${TWK.plural(+$count.text(), 'coordenada copiada', 'coordenadas copiadas')}`));
    $panel.on('click', '.cc-clear', clear);
    $input.on('input', collect);
    $sep.add($unique).on('change', collect);

    $input.trigger('focus');
});
