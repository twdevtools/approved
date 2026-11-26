$.ajax({ url: 'https://cdn.jsdelivr.net/gh/twdevtools/approved@1.2.8/twkit.js', dataType: 'script', cache: true }).then(async () => {
    const page = game_data.screen === 'map';
    if (!page) return TWK.redirect('map', 'Redirecionando para o mapa...');

    const KEY = `twNobleRange_${game_data.world}`;
    const AREA = '#ffd60a';
    const TARGET = '#ff453a';
    const RX_COORD = /\d{1,3}\|\d{1,3}/g;
    const ALL = 'all';
    const ALLIES = 0;
    const OTHERS = 'allies';

    const $panel = TWK.panel({
        id: 'nr-panel',
        title: 'Alcance do Nobre',
        sub: 'Área de onde o nobre alcança os alvos',
        icon: TWK.ICON.target,
        width: 380,
        onClose: () => {
            TWMap.mapHandler.spawnSector = TWMap.mapHandler.nrSpawn;
            TWMap.minimapHandler.loadSector = TWMap.minimapHandler.nrLoad;
            TWMap.reload();
        },
        css: `
            #nr-panel .nr-label { display: flex; justify-content: space-between; color: var(--muted); font-size: 11px; }
            #nr-panel .nr-count { color: var(--text); font-weight: 600; }
            #nr-panel .nr-input { height: 90px; }
            #nr-panel .nr-info { color: var(--muted); font-size: 11px; }
            #nr-panel .nr-info b { color: var(--text); }
            #nr-panel [hidden] { display: none !important; }
            #nr-panel .nr-actions .twk-btn { flex: 1; }
        `,
        body: `
            <div class="twk-field">
                <div class="nr-label">Alvos <span class="nr-count">0</span></div>
                <textarea class="nr-input" placeholder="Cole as coordenadas dos alvos"></textarea>
            </div>
            <div class="nr-info">${TWK.loading('Lendo o mundo...')}</div>
            <select class="nr-tribe" hidden></select>
            <select class="nr-player" hidden></select>
            <div class="twk-row nr-actions" hidden>
                <button class="twk-btn nr-clear">${TWK.ICON.clear}Limpar</button>
                <button class="twk-btn twk-primary nr-copy">${TWK.ICON.copy}Copiar</button>
            </div>
        `,
    });

    const $input = $panel.find('.nr-input').val(TWK.store.get(KEY, ''));
    const $info = $panel.find('.nr-info');
    const $tribe = $panel.find('.nr-tribe');
    const $player = $panel.find('.nr-player');

    const ally = String(game_data.player.ally);
    const me = String(game_data.player.id);
    const solo = ally === '0';
    const decode = text => decodeURIComponent(text.replace(/\+/g, ' '));

    const partners = $doc => {
        let section = -1;
        return $doc.find('#partners tr').get().flatMap(tr => {
            const header = $(tr).children('th').length > 0;
            if (header) section++;
            const wanted = !header && section === ALLIES;
            return wanted ? $(tr).find('a[href*="info_ally"]').get().map(a => a.getAttribute('href').match(/id=(\d+)/)[1]) : [];
        });
    };

    const [config, villageText, playerText, allyText, contracts] = await Promise.all([
        $.get('/interface.php?func=get_config'),
        TWK.get('/map/village.txt'),
        TWK.get('/map/player.txt'),
        TWK.get('/map/ally.txt'),
        solo ? null : TWK.doc(TWK.url('ally&mode=contracts')),
    ]);
    const reach = +$(config).find('snob > max_dist').text() || 0;
    const friends = solo ? [] : [ally, ...partners(contracts)];
    const tags = Object.fromEntries(allyText.split('\n').map(line => line.split(',')).map(([id, , tag]) => [id, decode(tag || '')]));
    const members = new Map(playerText.split('\n').map(line => line.split(','))
        .filter(([id, , tribe]) => solo ? id === me : friends.includes(tribe))
        .map(([id, name, tribe]) => [id, { player: decode(name), tribe }]));
    const tribe = villageText.split('\n').map(line => line.split(','))
        .filter(([, , , , player]) => members.has(player))
        .map(([, , x, y, player]) => ({ x: +x, y: +y, ...members.get(player) }));

    let targets = [];
    let inside = [];

    const reaches = (x, y, list) => list.some(([tx, ty]) => (tx - x) ** 2 + (ty - y) ** 2 <= reach ** 2);

    const pool = () => {
        const value = $tribe.val();
        if (value === ALL) return inside;
        if (value === OTHERS) return inside.filter(v => v.tribe !== ally);
        return inside.filter(v => v.tribe === value);
    };

    const players = () => [...new Set(pool().map(v => v.player))]
        .map(name => ({ name, count: pool().filter(v => v.player === name).length }))
        .sort((a, b) => b.count - a.count);

    const chosen = () => $player.val() === ALL ? pool() : pool().filter(v => v.player === $player.val());

    const fill = ($select, label, options) => {
        const current = $select.val();
        $select.html(`<option value="${ALL}">${label}</option>${options.map(o => `<option value="${TWK.escape(o.value)}">${TWK.escape(o.text)}</option>`).join('')}`);
        const kept = options.some(o => o.value === current);
        $select.val(kept ? current : ALL);
    };

    const people = () => {
        fill($player, `Todos os jogadores (${pool().length})`, players().map(p => ({ value: p.name, text: `${p.name} (${p.count})` })));
        $panel.find('.nr-copy').prop('disabled', !pool().length);
    };

    const render = () => {
        inside = tribe.filter(v => reaches(v.x, v.y, targets));
        const count = id => inside.filter(v => v.tribe === id).length;
        const allies = friends.filter(id => id !== ally);
        const each = allies.length > 1 ? allies.map(id => ({ value: id, text: `[${tags[id] || id}] (${count(id)})` })) : [];
        fill($tribe, `Tribo e aliados (${inside.length})`, [
            { value: ally, text: `Só minha tribo [${tags[ally] || ally}] (${count(ally)})` },
            { value: OTHERS, text: `Só aliados (${inside.length - count(ally)})` },
            ...each,
        ]);
        const owner = solo ? 'Suas aldeias no alcance' : 'Aldeias no alcance';
        $info.html(`Distância máxima do nobre: <b>${TWK.plural(reach, 'campo', 'campos')}</b> · ${owner}: <b>${TWK.format(inside.length)}</b>`);
        people();
    };

    const copy = () => {
        const single = $player.val() !== ALL;
        const coords = villages => villages.map(v => `${v.x}|${v.y}`).join(' ');
        const text = single
            ? coords(chosen())
            : players().map(p => `${p.name}:\n${coords(pool().filter(v => v.player === p.name))}`).join('\n\n');
        TWK.copy(text, TWK.plural(chosen().length, 'aldeia copiada', 'aldeias copiadas'));
    };

    const parse = () => [...new Set($input.val().match(RX_COORD) || [])];

    const tidy = () => $input.val(parse().join(' '));

    const read = () => {
        targets = parse().map(coord => coord.split('|').map(Number));
        TWK.store.set(KEY, $input.val());
        $panel.find('.nr-count').text(targets.length);
        $panel.find('.nr-clear').prop('disabled', !targets.length);
        render();
        TWMap.reload();
    };

    const mark = sector => {
        const span = sector._map.sectorSize;
        const [width, height] = sector._map.scale;
        const mini = sector._map === TWMap.minimap;
        const near = targets.filter(([x, y]) => x > sector.x - reach - 1 && x < sector.x + span + reach && y > sector.y - reach - 1 && y < sector.y + span + reach);
        if (!near.length) return;

        const canvas = document.createElement('canvas');
        canvas.width = span * width;
        canvas.height = span * height;
        $(canvas).css({ position: 'absolute', pointerEvents: 'none', zIndex: mini ? 9 : 4 });
        const context = canvas.getContext('2d');
        context.fillStyle = AREA;
        context.globalAlpha = mini ? .45 : .3;
        for (let dx = 0; dx < span; dx++) {
            for (let dy = 0; dy < span; dy++) {
                const reached = reaches(sector.x + dx, sector.y + dy, near);
                if (reached) context.fillRect(dx * width, dy * height, width, height);
            }
        }
        sector.appendElement(canvas, 0, 0);

        const dot = Math.max(width, height) * 2.4;
        const look = mini
            ? { width: dot, height: dot, marginLeft: (width - dot) / 2, marginTop: (height - dot) / 2, borderRadius: '50%', border: '2px solid #000', background: TARGET, zIndex: 10 }
            : { width, height, border: `3px solid ${TARGET}`, outline: '1px solid #000', background: `${TARGET}73`, zIndex: 5 };
        near.filter(([x, y]) => x >= sector.x && x < sector.x + span && y >= sector.y && y < sector.y + span)
            .forEach(([x, y]) => {
                const $el = $('<div>').css({ position: 'absolute', pointerEvents: 'none', boxSizing: 'border-box', ...look });
                sector.appendElement($el[0], x - sector.x, y - sector.y);
            });
    };

    TWMap.mapHandler.nrSpawn ??= TWMap.mapHandler.spawnSector;
    TWMap.minimapHandler.nrLoad ??= TWMap.minimapHandler.loadSector;
    TWMap.mapHandler.spawnSector = function (info, sector) {
        TWMap.mapHandler.nrSpawn.call(this, info, sector);
        mark(sector);
    };
    TWMap.minimapHandler.loadSector = function (sector) {
        TWMap.minimapHandler.nrLoad.call(this, sector);
        mark(sector);
    };

    let timer;
    $input.on('input', () => {
        clearTimeout(timer);
        timer = setTimeout(read, 400);
    });
    $input.on('paste change', () => setTimeout(() => {
        clearTimeout(timer);
        tidy();
        read();
    }));
    $tribe.on('change', people);
    $panel.on('click', '.nr-copy', copy);
    $panel.on('click', '.nr-clear', () => {
        $input.val('');
        read();
    });

    $panel.find('.nr-player, .nr-actions').prop('hidden', false);
    $tribe.prop('hidden', friends.length < 2);
    tidy();
    read();
});
