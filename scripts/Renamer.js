/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
-------------------------------------------> IT IS NOT ALLOWED TO CLONE THIS SCRIPT <-------------------------------------------
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

if (window.location.href.includes('screen=overview_villages')) {
  const $html = `<h3 align="center">Renamer</h3>
    <div><table><tbody><tr><td><input id="firstbox" type="checkbox"></td><td><input id="start" type="text" placeholder="1" size="1"></td><td><input id="end" type="text" placeholder="3" size="1"></td></tr></tbody></table></div>
    <div><table><tbody><tr><td><input id="secondbox" type="checkbox"></td><td><input id="textname" type="text" placeholder="Your text" maxlength="32"></td></tr></tbody></table></div>  
    <div style="padding-top: 4px;"><table><tbody><tr><td><input id="rename" type="button" class="btn" value="Rename"></td><td><input id="save" type="button" class="btn" value="Save"></td></tr></tbody></table></div>
    <div><br><small><strong>Rename Villages v1.1 by</strong><strong style="color: red"> K I N G S </strong></small></div>`;

  Dialog.show('rename', $html); let set=localStorage.getItem('set');

  if (set) {
    set=JSON.parse(set);
    $('#firstbox').prop('checked', set.firstbox);
    $('#start').val(set.start);
    $('#end').val(set.end);
    $('#secondbox').prop('checked', set.secondbox);
    $('#textname').val(set.textname);
  }

  $('#save')
    .off('click')
    .on('click', () => 
    { set={
        firstbox: $('#firstbox').prop('checked'),
        start: $('#start').val(),
        end: $('#end').val(),
        secondbox: $('#secondbox').prop('checked'),
        textname: $('#textname').val(),
      };

      localStorage.setItem('set', JSON.stringify(set));

      UI.SuccessMessage('The settings have been saved successfully.');
    });

  $('#rename')
    .off('click')
    .on('click', () => 
    { let n; let e;

      if ($('#firstbox').prop('checked')) {
        n=Number($('#start').val());
        e=Number($('#end').val());
      }

      const a=$('#secondbox').prop('checked')?$('#textname').val():'';
      const t=$('.vis tr[class*="row"]').length;

      Dialog.close();

      async function start() {
        for (let i=0;i<t;i++) {
          $('.rename-icon')[i].click();
          $('.vis input[type="text"]').val(
            `${n&&e!==undefined?String(n+i).padStart(e,'0'):''} ${a}`
          );
          $('input[type="button"]').click();
          UI.SuccessMessage(i+1+' of '+t);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }; start();
    });
} else UI.InfoMessage('Use in views.');

// javascript:$.getScript('https://dl.dropboxusercontent.com/scl/fi/0qo0xti6vufofsrkek76b/Renamer.js?rlkey=69bq7aeteq04arrgzfwwh0c6c&dl=0');