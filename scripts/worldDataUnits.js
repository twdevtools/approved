this.worldDataArcher = {
    HTMLContent: {
        'thead': {
            archer: '<th><label for="unit_archer"><img src="/graphic/unit/unit_archer.png"></label></th>', marcher: '<th><label for="unit_marcher"><img src="/graphic/unit/unit_marcher.png"></label></th>',
        },
        'tbody': {
            archer: '<td><input type="radio" id="unit_archer" name="chosen_units" value="archer"></td>', marcher: '<td><input type="radio" id="unit_marcher" name="chosen_units" value="marcher"></td>',
        },
    },
    index: 11,
    ArrayBBCode: ['&att_spear=', '&att_sword=', '&att_axe=', '&att_archer=', '&att_spy=', '&att_light=', '&att_marcher=', '&att_heavy=', '&att_ram=', '&att_catapult=', '&att_knight=', '&att_snob='],
    collectUnits: function() { 
       return {spear, sword, axe, archer, spy, light, marcher, heavy, ram, catapult, knight, snob} = realUnits;
    },
    realCombinations: function() {
        return realCombinations.push({
            'data_id': data_id, 'coord': coord, 'target': target, 'spear': spear, 'sword': sword, 'axe': axe, 'archer': archer, 'spy': spy, 'light': light, 'marcher': marcher, 'heavy': heavy, 'ram': ram, 'catapult': catapult, 'knight': knight, 'snob': snob, 'launchTime': launchTime,
        });
    },
    villagesUnits: function() {
        return [village.spear, village.sword, village.axe, village.archer, village.spy, village.light, village.marcher, village.heavy, village.ram, village.catapult, village.knight, village.snob];
    },
};
