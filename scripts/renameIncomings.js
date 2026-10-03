$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.1.0/twkit.js', dataType: 'script', cache: true }).then(() => {
    const page = game_data.screen === 'overview' || (game_data.screen === 'overview_villages' && game_data.mode === 'incomings');
    if (!page) return TWK.redirect('overview_villages&mode=incomings&subtype=attacks', 'Redirecionando para os ataques chegando...');

    const KEY = 'twRenamer';
    const LEGACY = 'renameIncomings';
    const TABLES = '#commands_incomings, #incomings_table';
    const ROWS = 'tr.command-row, tr.nowrap';
    const COLORS = ['#8b2e2e', '#b5602a', '#a8872b', '#3f7d3a', '#2f7a78', '#2f5d8f', '#6b4a93', '#5a5f69'];

    const cleanup = () => {
        $(TABLES).find('tr.tr-row').remove();
        $(TABLES).off('.tr');
        $(document).off('.tr');
    };

    const $panel = TWK.panel({
        id: 'tr-panel',
        title: 'Tags de Ataques',
        sub: 'Marque comandos e clique numa tag',
        icon: TWK.ICON.tag,
        width: 310,
        onClose: cleanup,
        css: `
            #tr-panel .tr-field { display: flex; align-items: center; gap: 12px; }
            #tr-panel .tr-field .twk-caption { flex: none; white-space: nowrap; }
            #tr-panel .tr-colors { flex: 1; display: grid; grid-template-columns: repeat(${COLORS.length}, 1fr); gap: 6px; padding: 2px; }
            #tr-panel .tr-color { height: 24px; padding: 0; border: 0; border-radius: 5px; cursor: pointer; box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .25); }
            #tr-panel .tr-color:hover { filter: brightness(1.15); }
            #tr-panel .tr-color.tr-active { box-shadow: 0 0 0 1px var(--bg), 0 0 0 2px var(--text); }
            #tr-panel .tr-list {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); align-content: start; gap: 6px;
                min-height: 96px; max-height: 180px; overflow: auto;
                padding: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
            }
            #tr-panel .tr-list .twk-empty { grid-column: 1 / -1; align-self: center; }
            #tr-panel.tr-busy .tr-list { opacity: .5; pointer-events: none; }
            #tr-panel .tr-item { display: flex; align-items: center; min-width: 0; }
            #tr-panel .tr-item .tr-chip { flex: 1; height: 26px; padding: 0 10px; border-radius: 0; }
            #tr-panel .tr-item .tr-chip:hover { filter: brightness(1.15); }
            #tr-panel .tr-grip, #tr-panel .tr-remove { height: 26px; padding: 0 5px; display: grid; place-items: center; border: 0; background: rgba(0, 0, 0, .35); color: #fff; }
            #tr-panel .tr-grip { border-radius: 4px 0 0 4px; color: var(--muted); cursor: grab; }
            #tr-panel .tr-grip:hover { color: var(--text); }
            #tr-panel .tr-grip:active, #tr-panel .ui-sortable-helper .tr-grip { cursor: grabbing; }
            #tr-panel .tr-remove { border-radius: 0 4px 4px 0; cursor: pointer; }
            #tr-panel .tr-remove:hover { background: var(--accent); }
            #tr-panel .tr-grip svg, #tr-panel .tr-remove svg { width: 11px; height: 11px; }
            .tr-chip {
                height: 22px; min-width: 0; padding: 0 8px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
                border: 0; border-radius: 4px; font: 600 11px/1 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; letter-spacing: .03em;
                cursor: pointer; box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .25);
            }
            .tr-chip span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .tr-row td { padding: 3px 6px 6px !important; }
            .tr-row .tr-bar { display: flex; flex-wrap: wrap; gap: 4px; }
            .tr-row .tr-chip { max-width: 140px; }
            .tr-row .tr-chip:hover { filter: brightness(1.15); }
            .tr-row .tr-chip.tr-on::after {
                content: ''; width: 8px; height: 8px; flex: none; opacity: .85;
                background: linear-gradient(45deg, transparent 42%, currentColor 42% 58%, transparent 58%),
                            linear-gradient(-45deg, transparent 42%, currentColor 42% 58%, transparent 58%);
            }
            tr[style*="none"] + .tr-row { display: none; }
        `,
        body: `
            <div class="twk-section">
                <div class="twk-label">Nova tag</div>
                <input type="text" class="tr-name" maxlength="20" placeholder="Nome da tag">
                <div class="tr-field">
                    <span class="twk-caption">Escolha a cor</span>
                    <div class="tr-colors">${COLORS.map(c => `<button class="tr-color" data-color="${c}" style="background: ${c}"></button>`).join('')}</div>
                </div>
                <button class="twk-btn twk-primary tr-add">${TWK.ICON.plus}Adicionar tag</button>
            </div>
            <div class="twk-divider"></div>
            <div class="twk-section">
                <div class="twk-label">Suas tags <span class="twk-hint tr-hint"></span></div>
                <div class="tr-list"></div>
            </div>
        `,
    });

    const $list = $panel.find('.tr-list');
    const $name = $panel.find('.tr-name');
    const $hint = $panel.find('.tr-hint');
    let color = COLORS[0];

    const legacy = () => $('<div>').html(TWK.store.get(LEGACY, '')).find('button').get()
        .map(btn => ({ name: $.trim(btn.textContent), color: btn.style.backgroundColor || COLORS[0] }))
        .filter(tag => tag.name);

    let tags = TWK.store.get(KEY) || legacy();

    const save = () => TWK.store.set(KEY, tags);

    const ink = value => {
        const $probe = $('<i>').css('color', value).appendTo('body');
        const [r, g, b] = $probe.css('color').match(/\d+/g).map(Number);
        $probe.remove();
        return r * .299 + g * .587 + b * .114 > 150 ? '#111' : '#fff';
    };

    const chip = (tag, i) => $('<button class="tr-chip">')
        .append($('<span>').text(tag.name))
        .attr({ 'data-i': i, title: tag.name })
        .css({ background: tag.color, color: ink(tag.color) });

    const label = $row => $row.data('trName') ?? $.trim($row.find('.quickedit-label').first().text());

    const has = ($row, i) => label($row).includes(`[${tags[i].name}]`);

    const paint = $row => $row.next('.tr-row').find('.tr-chip').each((_, el) => {
        const i = $(el).data('i');
        const on = has($row, i);
        $(el).toggleClass('tr-on', on).attr('title', on ? `Remover [${tags[i].name}]` : tags[i].name);
    });

    const renderPanel = () => {
        if (!tags.length) return $list.html('<span class="twk-empty">Nenhuma tag criada</span>');
        $list.empty().append(tags.map((tag, i) => $('<div class="tr-item">').attr('data-i', i)
            .append(`<span class="tr-grip" title="Arrastar">${TWK.ICON.grip}</span>`, chip(tag, i), `<button class="tr-remove" title="Remover">${TWK.ICON.close}</button>`)));
    };

    const renderRows = () => {
        const $tables = $(TABLES);
        $tables.find('tr.tr-row').remove();
        if (!tags.length) return;
        $tables.find(ROWS).each((_, row) => {
            $('<tr class="tr-row"><td colspan="100"><div class="tr-bar"></div></td></tr>')
                .insertAfter(row).find('.tr-bar').append(tags.map(chip));
            paint($(row));
        });
    };

    const render = () => {
        renderPanel();
        renderRows();
    };

    const add = () => {
        const name = $.trim($name.val()).replace(/[[\]]/g, '');
        if (!name) return $name.trigger('focus');
        if (tags.some(tag => tag.name === name)) return UI.InfoMessage(`A tag ${name} já existe`);
        tags.push({ name, color });
        $name.val('').trigger('focus');
        save();
        render();
    };

    const write = ($row, i, add) => {
        const tag = `[${tags[i].name}]`;
        const name = TWK.rename($row, input => {
            const current = input || label($row);
            return (add ? `${current} ${tag}` : current.split(tag).join(' ')).replace(/\s+/g, ' ').trim();
        });
        $row.data('trName', name);
        paint($row);
    };

    const marked = () => $(TABLES).find(ROWS).filter((_, row) => $(row).find('input[type=checkbox]').is(':checked')).get().map(row => $(row));

    const hint = () => {
        const n = marked().length;
        $hint.text(n ? `clique para aplicar em ${TWK.plural(n, 'marcado', 'marcados')}` : 'marque comandos na tabela');
    };

    const mass = async i => {
        const rows = marked();
        if (!rows.length) return UI.InfoMessage('Marque os comandos na tabela primeiro');
        const add = !rows.every($row => has($row, i));
        const pending = rows.filter($row => has($row, i) !== add);
        $panel.addClass('tr-busy');
        for (const [n, $row] of pending.entries()) {
            $hint.text(`${add ? 'Aplicando' : 'Removendo'} ${n + 1}/${pending.length}`);
            write($row, i, add);
            await TWK.wait(200);
        }
        $panel.removeClass('tr-busy');
        hint();
        UI.SuccessMessage(`[${tags[i].name}] ${add ? 'aplicada em' : 'removida de'} ${TWK.plural(pending.length, 'comando', 'comandos')}`);
    };

    const pick = e => {
        color = $(e.currentTarget).data('color');
        $panel.find('.tr-color').removeClass('tr-active');
        $(e.currentTarget).addClass('tr-active');
    };

    const remove = e => {
        tags.splice($(e.currentTarget).parent().data('i'), 1);
        save();
        render();
    };

    const toggle = e => {
        e.preventDefault();
        const $btn = $(e.currentTarget);
        const $row = $btn.closest('tr.tr-row').prev();
        const i = $btn.data('i');
        write($row, i, !has($row, i));
    };

    const reorder = () => {
        tags = $list.children('.tr-item').get().map(el => tags[$(el).data('i')]);
        save();
        render();
    };

    $panel.on('click', '.tr-add', add);
    $panel.on('click', '.tr-color', pick);
    $name.on('keydown', e => {
        if (e.key === 'Enter') add();
    });
    $list.on('click', '.tr-chip', e => mass($(e.currentTarget).data('i')));
    $list.on('click', '.tr-remove', remove);
    $(TABLES).on('change.tr click.tr', 'input[type=checkbox]', () => setTimeout(hint));
    $(document).on('click.tr', '.tr-row .tr-chip', toggle);

    if ($.fn.sortable) $list.sortable({ items: '.tr-item', handle: '.tr-grip', cursor: 'grabbing', update: reorder });

    $panel.find('.tr-color').first().addClass('tr-active');
    render();
    hint();
});
