(() => {
    const KEY = 'twRenamer';
    const LEGACY = 'renameIncomings';
    const TABLES = '#commands_incomings, #incomings_table';
    const ROWS = 'tr.command-row, tr.nowrap';
    const COLOR = '#8b2e2e';
    const DELAY = 200;
    const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

    const svg = d => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const ICON = {
        close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
        plus: svg('<path d="M12 5v14M5 12h14"/>'),
        grip: svg('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
        tag: svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/>'),
    };

    $('#tr-panel, #tr-style').remove();
    $(TABLES).find('tr.tr-row').remove();
    $(document).off('.tr');

    $(`<style id="tr-style">
        #tr-panel {
            --bg: #0d0e11; --surface: #15171c; --hover: #1b1e24; --line: #262930; --line-hi: #3a3e47;
            --text: #d4d7dd; --muted: #6f7580; --accent: #a33b3b;
            position: fixed; top: 18%; left: 40%; z-index: 12000; width: 310px;
            background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 10px;
            box-shadow: 0 18px 40px rgba(0, 0, 0, .55);
            font: 12px/1.4 ${FONT};
        }
        #tr-panel *, .tr-row * { box-sizing: border-box; margin: 0; }
        #tr-panel svg { display: block; flex: none; }
        #tr-panel .tr-head {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 12px; border-bottom: 1px solid var(--line); cursor: move; user-select: none;
        }
        #tr-panel .tr-logo {
            width: 28px; height: 28px; display: grid; place-items: center; flex: none;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; color: var(--accent);
        }
        #tr-panel .tr-heading { flex: 1; min-width: 0; }
        #tr-panel .tr-title { font-weight: 600; letter-spacing: .02em; }
        #tr-panel .tr-sub { color: var(--muted); font-size: 11px; }
        #tr-panel .tr-body { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
        #tr-panel .tr-form { display: flex; gap: 6px; }
        #tr-panel input[type=text] {
            flex: 1; min-width: 0; height: 30px; padding: 0 10px;
            background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 6px; outline: none;
            font: inherit;
        }
        #tr-panel input[type=text]::placeholder { color: var(--muted); }
        #tr-panel input[type=text]:focus { border-color: var(--accent); }
        #tr-panel input[type=color] {
            width: 30px; height: 30px; padding: 2px; flex: none;
            background: var(--surface); border: 1px solid var(--line); border-radius: 6px; cursor: pointer;
        }
        #tr-panel .tr-btn {
            height: 30px; padding: 0 10px; flex: none; display: inline-flex; align-items: center; gap: 6px;
            background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 6px;
            font: inherit; font-weight: 600; cursor: pointer;
        }
        #tr-panel .tr-btn:hover { border-color: var(--line-hi); background: var(--hover); }
        #tr-panel .tr-btn.tr-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
        #tr-panel .tr-btn.tr-primary:hover { filter: brightness(1.12); }
        #tr-panel .tr-close {
            width: 24px; height: 24px; display: grid; place-items: center;
            background: none; border: 0; border-radius: 4px; color: var(--muted); cursor: pointer;
        }
        #tr-panel .tr-close:hover { color: var(--text); background: var(--surface); }
        #tr-panel .tr-list {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); align-content: start; gap: 6px; min-height: 96px; max-height: 180px; overflow: auto;
            padding: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
        }
        #tr-panel .tr-list::-webkit-scrollbar { width: 8px; }
        #tr-panel .tr-list::-webkit-scrollbar-thumb { background: #2e323a; border-radius: 4px; }
        #tr-panel .tr-empty { grid-column: 1 / -1; align-self: center; color: var(--muted); text-align: center; }
        #tr-panel .tr-item { display: flex; align-items: center; min-width: 0; }
        #tr-panel .tr-item .tr-chip { flex: 1; height: 26px; line-height: 26px; padding: 0 10px; border-radius: 0; }
        #tr-panel .tr-item .tr-chip:hover { filter: brightness(1.15); }
        #tr-panel.tr-busy .tr-list { opacity: .5; pointer-events: none; }
        #tr-panel .tr-grip, #tr-panel .tr-remove {
            height: 26px; padding: 0 5px; display: grid; place-items: center; border: 0;
            background: rgba(0, 0, 0, .35); color: #fff;
        }
        #tr-panel .tr-grip { border-radius: 4px 0 0 4px; color: var(--muted); cursor: grab; }
        #tr-panel .tr-grip:hover { color: var(--text); }
        #tr-panel .tr-grip:active, #tr-panel .ui-sortable-helper .tr-grip { cursor: grabbing; }
        #tr-panel .tr-remove { border-radius: 0 4px 4px 0; cursor: pointer; }
        #tr-panel .tr-grip svg, #tr-panel .tr-remove svg { width: 11px; height: 11px; }
        #tr-panel .tr-remove:hover { background: var(--accent); }
        #tr-panel .tr-foot { color: var(--muted); font-size: 11px; }
        .tr-chip {
            height: 22px; min-width: 0; padding: 0 8px; border: 0; border-radius: 4px;
            font: 600 11px/22px ${FONT}; letter-spacing: .03em; text-align: center;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .25);
        }
        .tr-row .tr-chip:hover { filter: brightness(1.15); }
        .tr-row td { padding: 3px 6px 6px !important; }
        tr[style*="none"] + .tr-row { display: none; }
        .tr-row .tr-bar { display: flex; flex-wrap: wrap; gap: 4px; }
        .tr-row .tr-chip { max-width: 140px; }
    </style>`).appendTo('head');

    const $panel = $(`<div id="tr-panel">
        <div class="tr-head">
            <div class="tr-logo">${ICON.tag}</div>
            <div class="tr-heading">
                <div class="tr-title">Renomeador</div>
                <div class="tr-sub">Marque comandos e clique numa tag</div>
            </div>
            <button class="tr-close" title="Fechar">${ICON.close}</button>
        </div>
        <div class="tr-body">
            <div class="tr-form">
                <input type="text" maxlength="20" placeholder="Nome da tag">
                <input type="color" value="${COLOR}" title="Cor da tag">
                <button class="tr-btn tr-primary tr-add">${ICON.plus}Adicionar</button>
            </div>
            <div class="tr-list"></div>
            <div class="tr-foot">
                <span class="tr-count"></span>
            </div>
        </div>
    </div>`).appendTo('body');

    const $list = $panel.find('.tr-list');
    const $name = $panel.find('input[type=text]');
    const $color = $panel.find('input[type=color]');

    const legacy = () => $('<div>').html(JSON.parse(localStorage[LEGACY] || '""')).find('button').get()
        .map(btn => ({ name: $.trim(btn.textContent), color: btn.style.backgroundColor || COLOR }))
        .filter(tag => tag.name);

    const load = () => {
        try {
            return JSON.parse(localStorage[KEY] || 'null') || legacy();
        } catch {
            return [];
        }
    };

    let tags = load();

    const save = () => localStorage.setItem(KEY, JSON.stringify(tags));

    const ink = color => {
        const $probe = $('<i>').css('color', color).appendTo('body');
        const [r, g, b] = $probe.css('color').match(/\d+/g).map(Number);
        $probe.remove();
        return r * .299 + g * .587 + b * .114 > 150 ? '#111' : '#fff';
    };

    const chip = (tag, i) => $('<button class="tr-chip">')
        .text(tag.name)
        .attr({ 'data-i': i, title: tag.name })
        .css({ background: tag.color, color: ink(tag.color) });

    const renderPanel = () => {
        $panel.find('.tr-count').text(`${tags.length} tag${tags.length === 1 ? '' : 's'}`);
        if (!tags.length) return $list.html('<span class="tr-empty">Nenhuma tag criada</span>');
        $list.empty().append(tags.map((tag, i) => $('<div class="tr-item">').attr('data-i', i)
            .append(`<span class="tr-grip" title="Arrastar">${ICON.grip}</span>`, chip(tag, i), `<button class="tr-remove" title="Remover">${ICON.close}</button>`)));
    };

    const renderRows = () => {
        const $tables = $(TABLES);
        $tables.find('tr.tr-row').remove();
        if (!tags.length) return;
        $tables.find(ROWS).each((_, row) => $('<tr class="tr-row"><td colspan="100"><div class="tr-bar"></div></td></tr>')
            .insertAfter(row).find('.tr-bar').append(tags.map(chip)));
    };

    const render = () => {
        renderPanel();
        renderRows();
    };

    const add = () => {
        const name = $.trim($name.val()).replace(/[[\]]/g, '');
        if (!name) return $name.trigger('focus');
        if (tags.some(tag => tag.name === name)) return UI.InfoMessage(`A tag ${name} já existe`);
        tags.push({ name, color: $color.val() });
        $name.val('').trigger('focus');
        save();
        render();
    };

    const wait = ms => new Promise(done => setTimeout(done, ms));

    const apply = ($row, i) => {
        const tag = `[${tags[i].name}]`;
        $row.find('a.rename-icon').first().trigger('click');
        const $edit = $row.find('.quickedit-edit');
        const $input = $edit.find('input[type=text]').first();
        const $ok = $edit.find('input[type=button]').first();
        const current = $.trim($input.val() || $row.find('.quickedit-label').first().text());
        if (current.includes(tag)) {
            $ok.trigger('click');
            return false;
        }
        $input.val(`${current} ${tag}`.trim());
        $ok.trigger('click');
        return true;
    };

    const mass = async i => {
        const $rows = $(TABLES).find(ROWS).filter((_, row) => $(row).find('input[type=checkbox]').is(':checked'));
        if (!$rows.length) return UI.InfoMessage('Marque os comandos na tabela primeiro');
        const $count = $panel.find('.tr-count');
        const total = $rows.length;
        let renamed = 0;
        $panel.addClass('tr-busy');
        for (const [n, row] of $rows.get().entries()) {
            $count.text(`Aplicando ${n + 1}/${total}`);
            if (apply($(row), i)) renamed++;
            await wait(DELAY);
        }
        $panel.removeClass('tr-busy');
        renderPanel();
        UI.SuccessMessage(`${renamed} renomeado(s), ${total - renamed} já tinham a tag`);
    };

    const close = () => {
        $panel.remove();
        $('#tr-style').remove();
        $(TABLES).find('tr.tr-row').remove();
        $(document).off('.tr');
    };

    $panel.on('click', '.tr-close', close);
    $panel.on('click', '.tr-add', add);
    $name.on('keydown', e => {
        if (e.key === 'Enter') add();
    });
    $list.on('click', '.tr-chip', e => mass($(e.currentTarget).data('i')));
    $list.on('click', '.tr-remove', e => {
        tags.splice($(e.currentTarget).parent().data('i'), 1);
        save();
        render();
    });

    $(document).on('click.tr', '.tr-row .tr-chip', e => {
        e.preventDefault();
        const $btn = $(e.currentTarget);
        const i = $btn.data('i');
        if (!apply($btn.closest('tr.tr-row').prev(), i)) UI.InfoMessage(`O comando já tem [${tags[i].name}]`);
    });

    if ($.fn.draggable) $panel.draggable({ handle: '.tr-head', cancel: '.tr-close', containment: 'window' });
    if ($.fn.sortable) $list.sortable({
        items: '.tr-item',
        handle: '.tr-grip',
        cursor: 'grabbing',
        update: () => {
            tags = $list.children('.tr-item').get().map(el => tags[$(el).data('i')]);
            save();
            render();
        },
    });

    if (window.mobiledevice) $panel.css({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

    render();
})();
