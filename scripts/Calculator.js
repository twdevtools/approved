let $html = 

`<h3 style="text-align: center; padding: 6px; margin: 4px;">Calculator</h3>
                    <table width="100%">
                        <tbody><th></th>
                          <th style="text-align: center; padding: 2px; margin: 4px; color: red">C</th>
                          <th style="text-align: center; padding: 2px; margin: 4px; color: green">R</th> 
                          <th style="text-align: center; padding: 2px; margin: 4px; color: black">B</th>
                            <tr> 
                                <th width="20">
                                    <img src="https://dsbr.innogamescdn.com/asset/82fdfe80/graphic/unit/unit_snob.png">                       
                                </th>
                                <td>
                                    <input type="text" id="noble" size="8" style="padding-top: 2px;" value="12:00:00">
                                </td>
                                <td>
                                    <input type="text" id="noble" size="8" style="padding-top: 2px;" value="12:00:00">
                                </td>
                                <td>
                                    <input type="text" id="noble" size="8" style="padding-top: 2px;" value="12:00:00">
                                </td>
                            </tr>
                            <tr>
                                <th width="20">
                                    <img src="https://dsbr.innogamescdn.com/asset/82fdfe80/graphic/command/support.png">
                                </th> 
                                <td>
                                    <input type="text" id="support" size="8" style="padding-top: 2px;" value="11:50:00">
                                </td>
                                <td>
                                    <input type="text" id="support" size="8" style="padding-top: 2px;" value="11:50:00">
                                </td>
                                <td>
                                    <input type="text" id="support" size="8" style="padding-top: 2px;" value="11:50:00">
                                </td>                
                            </tr>
                            <tr>
                                <th width="20">
                                    <span style="margin-right: 0px; padding-top: 2px;" class="icon header time"></span>   
                                </th>
                                <td>
                                    <input type="text" id="time" size="8" style="padding-top: 2px;" value="00:00:00">
                                </td>  
                                <td>
                                    <input type="text" id="time" size="8" style="padding-top: 2px;" value="00:00:00">
                                </td>
                                <td>
                                    <input type="text" id="time" size="8" style="padding-top: 2px;" value="00:00:00">
                                </td>               
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <tr>
                            <td style="padding-top: 4px">
                                <input type="button" id="calc" class="btn" value="Calcular">
                            </td>
                            <td style="padding-top: 4px">
                                <input type="button" id="extract" class="btn" value="Extrair">
                            </td>                 
                        </tr>
                    </table>`;

Dialog.show("calculator", $html);