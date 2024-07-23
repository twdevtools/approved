// made by Costache Madalin (lllll llll)
// discord: costache madalin#8472

var countApiKey = "resource_balancer";
var countNameSpace="madalinoTribalWarsScripts"

if(typeof(TWMap) !="undefined" )
    var  originalSpawnSector = TWMap.mapHandler.spawnSector;


    var headerWood="#001a33"
    var headerWoodEven="#002e5a"
    var headerStone="#3b3b00"
    var headerStoneEven="#626200"
    var headerIron="#1e003b"
    var headerIronEven="#3c0076"
    
    
    var defaultTheme= '[["theme1",["#E0E0E0","#000000","#C5979D","#2B193D","#2C365E","#484D6D","#4B8F8C","50"]],["currentTheme","theme1"],["theme2",["#E0E0E0","#000000","#F76F8E","#113537","#37505C","#445552","#294D4A","50"]],["theme3",["#E0E0E0","#000000","#ACFCD9","#190933","#665687","#7C77B9","#623B5A","50"]],["theme4",["#E0E0E0","#000000","#181F1C","#60712F","#274029","#315C2B","#214F4B","50"]],["theme5",["#E0E0E0","#000000","#9AD1D4","#007EA7","#003249","#1F5673","#1C448E","50"]],["theme6",["#E0E0E0","#000000","#EA8C55","#81171B","#540804","#710627","#9E1946","50"]],["theme7",["#E0E0E0","#000000","#754043","#37423D","#171614","#3A2618","#523A34","50"]],["theme8",["#E0E0E0","#000000","#9E0031","#8E0045","#44001A","#600047","#770058","50"]],["theme9",["#E0E0E0","#000000","#C1BDB3","#5F5B6B","#323031","#3D3B3C","#575366","50"]],["theme10",["#E0E0E0","#000000","#E6BCCD","#29274C","#012A36","#14453D","#7E52A0","50"]]]'
    var localStorageThemeName = "resBalancerTheme"
    if(localStorage.getItem(localStorageThemeName)!=undefined){
        let mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)))
        Array.from(mapTheme.keys()).forEach((key)=>{
            if(key!="currentTheme"){
                let listColors=mapTheme.get(key);
                if(listColors.length == 7){
                    listColors.push(50);
                    mapTheme.set(key,listColors)
                }
            }
        })
        localStorage.setItem(localStorageThemeName, JSON.stringify(Array.from(mapTheme.entries())))
    }

    var textColor="#ffffff"
    var backgroundInput="#000000"
    
    var borderColor = "#C5979D";//#026440
    var backgroundContainer="#2B193D"
    var backgroundHeader="#2C365E"
    var backgroundMainTable="#484D6D"
    var backgroundInnerTable="#4B8F8C"
    
    var widthInterface=50;//percentage
    var headerColorDarken=-50 //percentage( how much the header should be darker) if it's with -(darker) + (lighter)
    var headerColorAlternateTable=-30;
    var headerColorAlternateHover=30;
    
    var backgroundAlternateTableEven=backgroundContainer;
    var backgroundAlternateTableOdd=getColorDarker(backgroundContainer,headerColorAlternateTable);
    
    async function main(){
        initializationTheme()
        await $.getScript("https://dl.dropboxusercontent.com/s/i5c0so9hwsizogm/styleCSSGlobal.js?dl=0");

        createMainInterface()
        changeTheme()
        hitCountApi()
    }
    main()
    
    
function getColorDarker(hexInput, percent) {
    let hex = hexInput;

    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, "");

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, "$1$1");
    }

    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    const calculatedPercent = (100 + percent) / 100;

    r = Math.round(Math.min(255, Math.max(0, r * calculatedPercent)));
    g = Math.round(Math.min(255, Math.max(0, g * calculatedPercent)));
    b = Math.round(Math.min(255, Math.max(0, b * calculatedPercent)));

    return `#${("00"+r.toString(16)).slice(-2).toUpperCase()}${("00"+g.toString(16)).slice(-2).toUpperCase()}${("00"+b.toString(16)).slice(-2).toUpperCase()}`
}
    


function createMainInterface(){
    console.log("createInterface")
    let message_info_factor=`<p>if the factor is 0 your villages will receive resources only for building construction(from account manager)\n</p>
        <p>if the factor is 1 resources will be distributed equally, at the end of balancing every village will have the same amount of resources\n</p>
        <p>if it's for example 0.2 in this case your villages will receive 20% from average value of each resources and in adition will receive enough resources for building construction(from account manager)</p>`
    let message_info_construction=`<p>set for how many hours the villages should have resources for building construction\n</p>
                <p> your account manager must be active and your villages must have a template construction active,
                otherwise this setting will be ignored `

    let message_info_cluster=`<p>if it's set to 1 cluster then balancing resources will be globally and for 2 or more it will be locally per each cluster\n</p>
        <p>a larger number of clusters results in a shorter maximum travel time and balanced more locally which is less optimal \n</p>
        <p>every time the script is run clusters are calculated randomly and they may not be optimally calculated  every time so look out for maximum travel distance \n</p>
        <p>if it's run on the map it can be seen how clusters were formed and how many resources are sent and received\n</p>`

    let html_info=`
    
    <div id="div_container" class="scriptContainer"` + (!mobiledevice && ' style="width: 637px;' || ``) + `">
        <div class="scriptHeader">
            <div style=" margin-top:10px;"><h2>Resources balancer</h2></div>
            <div style="position:absolute;top:10px;right: 10px;"><a href="#" onclick="$('#div_container').remove()"><img src="https://img.icons8.com/emoji/24/000000/cross-mark-button-emoji.png"/></a></div>
            <div style="position:absolute;top:8px;right: 35px;" id="div_minimize"><a href="#"><img src="https://img.icons8.com/plasticine/28/000000/minimize-window.png"/></a></div>
            <div style="position:absolute;top:10px;right: 60px;" id="div_theme"><a href="#" onclick="$('#theme_settings').toggle()"><img src="https://img.icons8.com/material-sharp/24/fa314a/change-theme.png"/></a></div>
        </div>
        <div id="theme_settings"></div>

        <div id="div_body" style="height: 600px; overflow-y: auto">
            <center>
                <table id="table_main"  class="scriptTable">
                    <tr>
                        <td>setting name</td>
                        <td>setting value</td>
                    </tr>
                    <tr>
                        <td>reserve merchants</td>
                        <td>
                            <div style="display:flex;justify-content: center; align-items: center;   ">
                                <div><input type="number" id="nr_merchants_reserve" class="scriptInput" placeholder="15" value="0"></div>
                                <div><a href="#" onclick="UI.InfoMessage('how many merchants do you want to keep home',4000)"><img src="https://dsen.innogamescdn.com/asset/dbeaf8db/graphic/questionmark.png" style="width: 13px; height: 13px"/></a></div>
                            </div>
                        </td>
                    </tr> 
                    <tr>
                        <td>construction time[hours]</td>
                        <td>
                            <div style="display:flex;justify-content: center; align-items: center;">
                                <div><input type="number" id="time_construction" class="scriptInput" placeholder="0" value="0"></div>
                                <div><a href="#" onclick="UI.InfoMessage(\`${message_info_construction}\`,15000)"><img src="https://dsen.innogamescdn.com/asset/dbeaf8db/graphic/questionmark.png" style="width: 13px; height: 13px"/></a></div>
                            </div>
                        </td>
                    </tr> 

                    <tr>
                        <td>average factor[0-1]</td>
                        <td>
                            <div style="display:flex;justify-content: center; align-items: center;">
                                <div><input type="number" id="nr_average_factor" class="scriptInput" placeholder="1" value="1"></div>
                                <div><a href="#" onclick="UI.InfoMessage(\`${message_info_factor}\`,20000)"><img src="https://dsen.innogamescdn.com/asset/dbeaf8db/graphic/questionmark.png" style="width: 13px; height: 13px"/></a></div>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td>number of clusters</td>
                        <td>
                            <div style="display:flex;justify-content: center; align-items: center;">
                                <div><center><input type="number" id="nr_clusters" class="scriptInput" placeholder="1" value="1"></div>
                                <div><a href="#" onclick="UI.InfoMessage(\`${message_info_cluster}\`,20000)"><img src="https://dsen.innogamescdn.com/asset/dbeaf8db/graphic/questionmark.png" style="width: 13px; height: 13px"/></a></div>
                            </div>
                        </td>
                    </tr>
                    <tr hidden id="tr_merchant_capacity">
                        <td>merchant capacity</td>
                        <td>
                            <div style="display:flex;justify-content: center; align-items: center;">
                                <div><input type="number" id="merchant_capacity" class="scriptInput" placeholder="1000" value='1000'></div>
                                <div><a href="#" onclick="UI.InfoMessage('set merchant capacity to either 1000 or 1500',3000)"><img src="https://dsen.innogamescdn.com/asset/dbeaf8db/graphic/questionmark.png" style="width: 13px; height: 13px"/></a></div>
                            </div>
                        </td>
                    </tr> 
                </table>
            </center>

            <center>
                <input class="btn evt-confirm-btn btn-confirm-yes" type="button" onclick="balancingResources()" style="margin:10px" value="start">
            </center>

            <div id="div_tables" hidden>
                <center><div id="table_stats" style="width:100%"></div></center><br>
                <center><div id="table_view" style="height:500px;width:100%;overflow:auto"></div></center>
            </div>
        </div>

 
        <div class="scriptFooter">
            <div style=" margin-top:5px;"><h5>made by Costache</h5></div>
        </div>
    </div>`
    ////////////////////////////////////////add and remove window from page///////////////////////////////////////////
    $("#div_container").remove()
    $("#contentContainer").eq(0).prepend(html_info);
    $("#mobileContent").eq(0).prepend(html_info);
    
    if(game_data.device != "desktop"){
        $("#div_body").css("height","500px")
    }



    $("#div_container").css("position","fixed");
    $("#div_container").draggable()

    


    


    if(game_data.locale=="pt_PT"){
        $("#tr_merchant_capacity").show()
    }

    $("#div_minimize").on("click",()=>{
        let currentWidthPercentage=Math.ceil($('#div_container').width() / $('body').width() * 100);
        if(currentWidthPercentage >=widthInterface ){
            $('#div_container').css({'width' : '10%'});
            $('#div_body').hide();
        }
        else{
            $('#div_container').css({'width' : `${widthInterface}%`});
            $('#div_body').show();
        }
    })



    //initialization settings
    if(localStorage.getItem(game_data.world+"settings_resources_balancer2")!=null ){
        //initialize input numbers
        let list_input=JSON.parse(localStorage.getItem(game_data.world+"settings_resources_balancer2"))
        $('#div_container input[type=number]').each(function (index,elem) {
            this.value=list_input[index]
        });
    }


    //save settings
    $("#div_container input[type=number]").on("click input change",()=>{
        console.log("save settings")
        let list_input=[]

        //save inputs
        $('#div_container input[type=number]').each(function () {
            // var checked = this.checked
            var value=this.value
            // console.log(value)
            list_input.push(value)
        });
    
      
        let data=JSON.stringify(list_input)
        let data_localStorage=localStorage.getItem(game_data.world+"settings_resources_balancer2")
        console.log(data)
        console.log(data_localStorage)
        if(data!=data_localStorage){
            localStorage.setItem(game_data.world+"settings_resources_balancer2",data)
        }
    })
    
}



function changeTheme(){
    let html= `
    <h3 style="color:${textColor};padding-left:10px;padding-top:5px">after theme is selected run the script again<h3>
    <table class="scriptTable" >
        
        <tr>
            <td>
                <select  id="select_theme">
                    <option value="theme1">theme1</option>
                    <option value="theme2">theme2</option>
                    <option value="theme3">theme3</option>
                    <option value="theme4">theme4</option>
                    <option value="theme5">theme5</option>
                    <option value="theme6">theme6</option>
                    <option value="theme7">theme7</option>
                    <option value="theme8">theme8</option>
                    <option value="theme9">theme9</option>
                    <option value="theme10">theme10</option>
                </select>
            </td>
            <td>value</td>
            <td >color hex</td>
        </tr>
        <tr>
            <td>textColor</td>
            <td style="background-color:${textColor}" class="td_background"></td>
            <td><input type="text" class="scriptInput input_theme" value="${textColor}"></td>
        </tr>
        <tr>
            <td>backgroundInput</td>
            <td style="background-color:${backgroundInput}" class="td_background"></td>
            <td><input type="text" class="scriptInput input_theme" value="${backgroundInput}"></td>
        </tr>
        <tr>
            <td>borderColor</td>
            <td style="background-color:${borderColor}" class="td_background"></td>
            <td><input type="text" class="scriptInput input_theme" value="${borderColor}"></td>
        </tr>
        <tr>
            <td>backgroundContainer</td>
            <td style="background-color:${backgroundContainer}" class="td_background"></td>
            <td><input type="text" class="scriptInput input_theme" value="${backgroundContainer}"></td>
        </tr>
        <tr>
            <td>backgroundHeader</td>
            <td style="background-color:${backgroundHeader}" class="td_background"></td>
            <td><input type="text" class="scriptInput input_theme" value="${backgroundHeader}"></td>
        </tr>
        <tr>
            <td>backgroundMainTable</td>
            <td style="background-color:${backgroundMainTable}" class="td_background"></td>
            <td><input type="text" class="scriptInput input_theme" value="${backgroundMainTable}"></td>
        </tr>
        <tr>
            <td>backgroundInnerTable</td>
            <td style="background-color:${backgroundInnerTable}" class="td_background"></td>
            <td><input type="text" class="scriptInput input_theme" value="${backgroundInnerTable}"></td>
        </tr>
        <tr>
            <td>widthInterface</td>
            <td><input type="range" min="25" max="100" class="slider input_theme" id="input_slider_width" value="${widthInterface}"></td>
            <td id="td_width">${widthInterface}%</td>
        </tr>
        <tr >
            <td><input class="btn evt-confirm-btn btn-confirm-yes" type="button" id="btn_save_theme" value="Save"></td>
            <td><input class="btn evt-confirm-btn btn-confirm-yes" type="button" id="btn_reset_theme" value="Default themes"></td>
            <td></td>
        </tr>

    </table>
    `
    $("#theme_settings").append(html)
    $("#theme_settings").hide()

    let selectedTheme = ""
    let colours =[]
    let mapTheme = new Map()

    $("#select_theme").on("change",()=>{
        if(localStorage.getItem(localStorageThemeName) != undefined){
            selectedTheme = $('#select_theme').find(":selected").text();
            colours = Array.from($(".input_theme")).map(elem=>elem.value.toUpperCase().trim())
            mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)))
            console.log(selectedTheme)
            console.log(mapTheme)
            colours = mapTheme.get(selectedTheme)
            console.log(colours)
            Array.from($(".input_theme")).forEach((elem,index)=>{
                elem.value = colours[index]
            })
            Array.from($(".td_background")).forEach((elem,index)=>{
                elem.style.background = colours[index]
            })

            mapTheme.set("currentTheme",selectedTheme)
            localStorage.setItem(localStorageThemeName, JSON.stringify(Array.from(mapTheme.entries())))
        }
    })

    $("#btn_save_theme").on("click",()=>{
        colours = Array.from($(".input_theme")).map(elem=>elem.value.toUpperCase().trim())
        selectedTheme = $('#select_theme').find(":selected").text();

        for(let i=0;i<colours.length-1;i++){
            if(colours[i].match(/#[0-9 A-F]{6}/) == null ){
                UI.ErrorMessage("wrong colour: "+colours[i])  
                throw new Error("wrong colour")
            }
        }

        if(localStorage.getItem(localStorageThemeName) != undefined)
            mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)))


        mapTheme.set(selectedTheme,colours)
        mapTheme.set("currentTheme",selectedTheme)

        localStorage.setItem(localStorageThemeName, JSON.stringify(Array.from(mapTheme.entries())))
        console.log("saved colours for: "+selectedTheme)
        UI.SuccessMessage(`saved colours for: ${selectedTheme} \n run the script again`,1000)


    })

    $("#btn_reset_theme").on("click",()=>{
        localStorage.setItem(localStorageThemeName, defaultTheme)
        UI.SuccessMessage("run the script again",1000)

    })
    $("#input_slider_width").on("input",()=>{
        $("#td_width").text($("#input_slider_width").val()+"%")
    })


    if(localStorage.getItem(localStorageThemeName) != undefined){
        mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)))
        let currentTheme=mapTheme.get("currentTheme")
        document.querySelector('#select_theme').value=currentTheme
    }

    
}

function initializationTheme(){
    if(localStorage.getItem(localStorageThemeName) != undefined){
        let mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)))
        let currentTheme=mapTheme.get("currentTheme")
        let colours=mapTheme.get(currentTheme)

        textColor=colours[0]
        backgroundInput=colours[1]

        borderColor = colours[2]
        backgroundContainer=colours[3]
        backgroundHeader=colours[4]
        backgroundMainTable=colours[5]
        backgroundInnerTable=colours[6]
        widthInterface=colours[7]

        if(game_data.device != "desktop"){
            widthInterface = 98
        }

        backgroundAlternateTableEven=backgroundContainer;
        backgroundAlternateTableOdd=getColorDarker(backgroundContainer,headerColorAlternateTable);       
        console.log("textColor: "+textColor)
        console.log("backgroundContainer: "+backgroundContainer)
        
    }
    else{
        localStorage.setItem(localStorageThemeName, defaultTheme)

        let mapTheme = new Map(JSON.parse(localStorage.getItem(localStorageThemeName)))
        let currentTheme=mapTheme.get("currentTheme")
        let colours=mapTheme.get(currentTheme)

        textColor=colours[0]
        backgroundInput=colours[1]

        borderColor = colours[2]
        backgroundContainer=colours[3]
        backgroundHeader=colours[4]
        backgroundMainTable=colours[5]
        backgroundInnerTable=colours[6]
        widthInterface=colours[7]

        if(game_data.device != "desktop"){
            widthInterface = 98
        }

        backgroundAlternateTableEven=backgroundContainer;
        backgroundAlternateTableOdd=getColorDarker(backgroundContainer,headerColorAlternateTable);  
    }

}





async function balancingResources(){

    let time_construction_total=parseFloat(document.getElementById("time_construction").value)
    let averageFactor=parseFloat(document.getElementById("nr_average_factor").value)
    let reserveMerchants=parseInt(document.getElementById("nr_merchants_reserve").value)
    let merchantCapacity=parseInt(document.getElementById("merchant_capacity").value)
    let nrClusters=parseInt(document.getElementById("nr_clusters").value)

    reserveMerchants=(Number.isNaN(reserveMerchants)==true || reserveMerchants<0 )?0:reserveMerchants //by default are 0 merchants as reserver
    nrClusters=(Number.isNaN(nrClusters)==true || nrClusters<1 )?1:nrClusters //by default is one cluster
    time_construction_total=(Number.isNaN(time_construction_total)==true || time_construction_total<0 )?20:time_construction_total//if something is not right by default is 20hours
    
    averageFactor=(Number.isNaN(averageFactor)==true)?1:(averageFactor<0)?0:(averageFactor>1)?1:averageFactor //if>1 is 1 if <0 is 0 if is NaN is 1
    merchantCapacity=(Number.isNaN(merchantCapacity)==true)?1000:(merchantCapacity<1000)?1000:(merchantCapacity>1500)?1500:merchantCapacity //capacitiy is 1000 but for .PT might be 1500
    
    

    // console.log("reserveMerchants",reserveMerchants)
    // console.log("time_construction_total",time_construction_total)
    // console.log("averageFactor",averageFactor)
    // console.log("merchantCapacity",merchantCapacity)
    time_construction_total=time_construction_total*3600



    $("#div_container").remove()
    let {list_production, map_farm_usage} = await getDataProduction().catch(err=>alert(err))
    let map_incoming = await getDataIncoming().catch(err=>alert(err))
    let map_resources_get_AM = await getResourcesForAM(time_construction_total,map_farm_usage).catch(err=>alert(err))
    let list_production_home=JSON.parse(JSON.stringify(list_production))

    console.log("list_production",list_production)
    console.log("map_farm_usage",map_farm_usage)
    console.log("map_incoming",map_incoming)
    console.log("map_resources_get_AM",map_resources_get_AM)


    let start=new Date().getTime()




    ///////////////////////////////////////////////get clusters///////////////////////////////////////
    let kmeans_coords=[]
    for(let i=0;i<list_production.length;i++){
        kmeans_coords.push([
                parseInt(list_production[i].coord.split("|")[0]),
                parseInt(list_production[i].coord.split("|")[1])
            ])
    }
    console.log(kmeans_coords)
    let options={
        numberOfClusters:nrClusters,
        maxIterations:100
    }
    let clusters= getClusters(kmeans_coords,options)
    console.log("clusters",clusters)

    let list_production_cluster=[]
    let list_production_home_cluster=[]
    let map_draw_on_map=new Map()

    for(let i=0;i<clusters.length;i++){// for each cluster
        let list_coords=clusters[i].data
        let list_prod=[],list_prod_home=[]
        // console.log(list_coords)
        for(let j=0;j<list_coords.length;j++){//for each village of a cluster
            let coord=list_coords[j].join("|")
            for(let k=0;k<list_production.length;k++){//search in the main list 
                if(list_production[k].coord == coord){
                    list_prod.push(list_production[k])
                    list_prod_home.push(list_production_home[k])
                    console.log(`label_cluster: ${i}`)

                    //add incoming and then show on the map
                    let total_resources_get=0
                    if(map_incoming.has(coord)){
                        total_resources_get=map_incoming.get(coord).wood+map_incoming.get(coord).stone+map_incoming.get(coord).iron
                    }
                    map_draw_on_map.set(list_production[k].id,{
                        label_cluster:i,
                        villageId:list_production[k].id,
                        total_resources_get:total_resources_get,
                        total_resources_send:0
                    })

                    break;
                }
            }
        }

        list_production_cluster.push(list_prod)
        list_production_home_cluster.push(list_prod_home)
    }
    console.log("list_production_cluster",list_production_cluster)



    /////////////////////////////////////////////calculate total nr of resources and global average////////////////////////////////////////

    let total_wood_home=0,total_stone_home=0,total_iron_home=0
    let avg_wood_total=0,avg_stone_total=0,avg_iron_total=0

    for(let i=0;i<list_production.length;i++){
        let coord=list_production[i].coord
        if(map_incoming.has(coord)){
            list_production[i].wood  += map_incoming.get(coord).wood
            list_production[i].stone += map_incoming.get(coord).stone
            list_production[i].iron  += map_incoming.get(coord).iron

            //in case minting a village might have huge cantity of resources underway
            list_production[i].wood = Math.min(list_production[i].wood , list_production[i].capacity)
            list_production[i].stone= Math.min(list_production[i].stone, list_production[i].capacity)
            list_production[i].iron = Math.min(list_production[i].iron , list_production[i].capacity)

        }
        avg_wood_total +=list_production[i].wood/list_production.length
        avg_stone_total+=list_production[i].stone/list_production.length
        avg_iron_total +=list_production[i].iron/list_production.length

        total_wood_home +=list_production[i].wood
        total_stone_home+=list_production[i].stone
        total_iron_home +=list_production[i].iron
    }

    // //////////////////////////////////update list_production with all incoming resources ,get average for each resource/////////////////////////

    let list_launches=[]
    let list_clusters_stats=[]

    let total_wood_send_stats=0,total_stone_send_stats=0,total_iron_send_stats=0
    let total_wood_get_stats=0,total_stone_get_stats=0,total_iron_get_stats=0

    for(let i=0;i<list_production_cluster.length;i++){
        console.log(`--------------cluster:${i}----------------`)

        let list_prod=list_production_cluster[i]
        let list_prod_home=list_production_home_cluster[i]

        let avg_wood=0,avg_stone=0,avg_iron=0
        let avg_wood_factor=0,avg_stone_factor=0,avg_iron_factor=0
        let total_wood_send=0,total_stone_send=0,total_iron_send=0
        let total_wood_get=0,total_stone_get=0,total_iron_get=0
        let list_res_send=[],list_res_get=[]
        let total_wood_cluster=0,total_stone_cluster=0,total_iron_cluster=0


        for(let j=0;j<list_prod.length;j++){

            avg_wood+=list_prod[j].wood/list_prod.length
            avg_stone+=list_prod[j].stone/list_prod.length
            avg_iron+=list_prod[j].iron/list_prod.length

            total_wood_cluster+=list_prod[j].wood
            total_stone_cluster+=list_prod[j].stone
            total_iron_cluster+=list_prod[j].iron

        }


        avg_wood_factor   = avg_wood  * averageFactor//reduce avg with a factor [0-1]
        avg_stone_factor  = avg_stone * averageFactor
        avg_iron_factor   = avg_iron  * averageFactor


        // console.log("list_prod_home",list_prod_home)
        // console.log("list_prod",list_prod)


        /////////////////////////////////////calculates resources send and get for each village//////////////////////////////////////////////////
        for(let j=0;j<list_prod.length;j++){
            let coord=list_prod[j].coord
            let name=list_prod[j].name
            let id=list_prod[j].id
            let merchants=list_prod[j].merchants
            merchants-=reserveMerchants

            let capacity=list_prod[j].capacity*0.95
            let capacity_travel=merchants*merchantCapacity

            let avg_wood_res = avg_wood_factor
            let avg_stone_res = avg_stone_factor
            let avg_iron_res = avg_iron_factor

            //here are added resources needed for AM construction
            if(map_resources_get_AM.has(list_prod[j].coord)){
                let obj_res_AM = map_resources_get_AM.get(list_prod[j].coord)

                avg_wood_res  += obj_res_AM.total_wood
                avg_stone_res += obj_res_AM.total_stone
                avg_iron_res  += obj_res_AM.total_iron
                list_prod[j].time_finished=obj_res_AM.time_finished
            }
            else{
                list_prod[j].time_finished=0//added later to see for how many hours do j have resources at home
            }

            let diff_wood =list_prod[j].wood - Math.round(avg_wood_res)
            let diff_stone =list_prod[j].stone - Math.round(avg_stone_res)
            let diff_iron =list_prod[j].iron - Math.round(avg_iron_res)

            // console.log(`aici ba prod:${list_prod[j].iron}, avg: ${Math.round(avg_iron_res)}`)

            //in case diff>0 check if there are available res at home
            diff_wood=(diff_wood < 0)?diff_wood:(list_prod_home[j].wood - diff_wood > 0)?diff_wood: (list_prod_home[j].wood)
            diff_stone=(diff_stone < 0)?diff_stone:(list_prod_home[j].stone - diff_stone > 0)?diff_stone: (list_prod_home[j].stone)
            diff_iron=(diff_iron < 0)?diff_iron:(list_prod_home[j].iron - diff_iron > 0)?diff_iron: (list_prod_home[j].iron)

            // console.log(`coord ${coord} merch:${merchants} cap:${capacity}, wood:${diff_wood}, stone:${diff_stone}, iron:${diff_iron}`)

            let total_res_available=0
            total_res_available=(diff_wood>0)?  total_res_available+diff_wood :  total_res_available
            total_res_available=(diff_stone>0)? total_res_available+diff_stone : total_res_available
            total_res_available=(diff_iron>0)?  total_res_available+diff_iron :  total_res_available

            // console.log("total_res_available",total_res_available)
            let norm_factor=(capacity_travel <= total_res_available) ? capacity_travel/total_res_available:1//normalize to the number of merchant available
            let send_wood=0,send_stone=0,send_iron=0
            let get_wood=0,get_stone=0,get_iron=0
            // console.log("norm_factor",norm_factor)

            send_wood =(diff_wood>0) ?  parseInt(diff_wood * norm_factor):send_wood
            send_stone=(diff_stone>0) ?  parseInt(diff_stone* norm_factor):send_stone
            send_iron =(diff_iron>0) ?  parseInt(diff_iron * norm_factor):send_iron
            // console.log(`send---->wood:${send_wood}, stone:${send_stone}, iron:${send_iron}`)
            
            //firstly check if needs res(diff_res<0) then check if after balance wh will overflow and if it overflows send only res to fill 95% of wh
            get_wood =(diff_wood>0) ?get_wood :(list_prod[j].wood +Math.abs(diff_wood) < capacity)? Math.abs(diff_wood) : capacity-list_prod[j].wood
            get_stone=(diff_stone>0)?get_stone:(list_prod[j].stone+Math.abs(diff_stone)< capacity)? Math.abs(diff_stone): capacity-list_prod[j].stone
            get_iron =(diff_iron>0) ?get_iron :(list_prod[j].iron +Math.abs(diff_iron) < capacity)? Math.abs(diff_iron) : capacity-list_prod[j].iron
            // console.log(`get---->wood:${get_wood}, stone:${get_stone}, iron:${get_iron}`)
            // console.log("------------------------------------------------------")
            




            total_wood_send+=send_wood
            total_stone_send+=send_stone
            total_iron_send+=send_iron

            total_wood_get+=get_wood
            total_stone_get+=get_stone
            total_iron_get+=get_iron

            let obj_send={
                coord:coord,
                id:id,
                name:name
            }
            let obj_get={
                coord:coord,
                id:id,
                name:name
            }

            obj_send.wood =(send_wood  > 0)?send_wood :0
            obj_send.stone=(send_stone > 0)?send_stone:0
            obj_send.iron =(send_iron  > 0)?send_iron :0
            if(obj_send.wood > 0 || obj_send.stone > 0 || obj_send.iron > 0)
                list_res_send.push(obj_send)
            
            obj_get.wood =(get_wood  > 0)?parseInt(get_wood) :0
            obj_get.stone=(get_stone > 0)?parseInt(get_stone):0
            obj_get.iron =(get_iron  > 0)?parseInt(get_iron) :0
            if(obj_get.wood > 0 || obj_get.stone > 0 || obj_get.iron > 0)
                list_res_get.push(obj_get)




        }

        // console.log("end results")
        // console.log("avg wood: " + avg_wood)
        // console.log("avg stone: "+ avg_stone)
        // console.log("avg iron: " + avg_iron)
        // console.log(`send---> wood:${total_wood_send}, stone:${total_stone_send}, iron:${total_iron_send}`)
        // console.log(`get----> wood:${total_wood_get}, stone:${total_stone_get}, iron:${total_iron_get}`)

        /////////////////////////////////////////normalization resources,if send resources< get resources =>normalize///////////////////////////
        let norm_wood=(total_wood_get>total_wood_send)?(total_wood_send/total_wood_get):1
        let norm_stone=(total_stone_get>total_stone_send)?(total_stone_send/total_stone_get):1
        let norm_iron=(total_iron_get>total_iron_send)?(total_iron_send/total_iron_get):1

        //////////////////////////////////////////normalize each res///////////////////////////////////////////////////////////////////
        for(let j=0;j<list_res_get.length;j++){
            list_res_get[j].wood =parseInt(list_res_get[j].wood *norm_wood)
            list_res_get[j].stone=parseInt(list_res_get[j].stone*norm_stone)
            list_res_get[j].iron =parseInt(list_res_get[j].iron *norm_iron)
        }

        // console.log("list_res_send",list_res_send)
        // console.log("list_res_get",list_res_get)




        let list_maxDistance=[]
        // ////////////////////////////////////////////////////calculates launches///////////////////////////////////////
        for(let j=0;j<list_res_get.length;j++){
            let coord_destination=list_res_get[j].coord
            let id_destination=list_res_get[j].id
            let name_destination=list_res_get[j].name
            
            //////////////////////////////////////////////////////calculate distance/////////////////////////////////////
            let max_distance=0;
            for(let k=0;k<list_res_send.length;k++){
                let distance=calcDistance(list_res_get[j].coord,list_res_send[k].coord)
                list_res_send[k].distance=distance
                max_distance=(max_distance > distance) ? max_distance :distance
            }
            list_res_send.sort((o1,o2)=>{
                return (o1.distance>o2.distance)?1:(o1.distance<o2.distance)?-1:0
            })

            let obj_launch={
                wood:0,
                stone:0,
                iron:0
            }

            for(let k=0;k<list_res_send.length;k++){
                let coord_origin=list_res_send[k].coord
                let id_origin=list_res_send[k].id
                let name_origin=list_res_send[k].name

                // if resources send >0 then return minimum between send and ged othervise return current value
                let send_wood=(list_res_send[k].wood   > 0) ? Math.min(list_res_get[j].wood  , list_res_send[k].wood)  : 0
                let send_stone=(list_res_send[k].stone > 0) ? Math.min(list_res_get[j].stone , list_res_send[k].stone)  : 0
                let send_iron=(list_res_send[k].iron   > 0) ? Math.min(list_res_get[j].iron  , list_res_send[k].iron)  : 0



                obj_launch.wood +=send_wood
                obj_launch.stone +=send_stone
                obj_launch.iron +=send_iron

                list_res_get[j].wood -= send_wood 
                list_res_get[j].stone -= send_stone 
                list_res_get[j].iron -= send_iron

                list_res_send[k].wood -= send_wood 
                list_res_send[k].stone -= send_stone 
                list_res_send[k].iron -= send_iron


                let total_send=send_wood+send_stone+send_iron

                //stupid bug, if a resource has xxx699 must get rid of 699 
                let restDivision=total_send%merchantCapacity
                let minim_resources= (merchantCapacity==1000)?700:1200// special case for PT 
                if(restDivision < minim_resources){
                    if(send_wood>restDivision){
                        send_wood-=restDivision
                        total_send-=restDivision
                    }
                    else if(send_stone>restDivision){
                        send_stone-=restDivision
                        total_send-=restDivision
                    }
                    else if(send_iron>restDivision){
                        send_iron-=restDivision
                        total_send-=restDivision
                    }                   
                }


                list_maxDistance.push(list_res_send[k].distance)

                if(total_send>=minim_resources)
                list_launches.push({
                    total_send:total_send,
                    wood:send_wood,
                    stone:send_stone,
                    iron:send_iron,
                    coord_origin:coord_origin,
                    name_origin:name_origin,
                    id_destination:id_destination,
                    id_origin:id_origin,
                    coord_destination:coord_destination,
                    name_destination:name_destination,
                    distance:list_res_send[k].distance
                })

                let total_get=list_res_get[j].wood+list_res_get[j].stone+list_res_get[j].iron
                if(total_get < minim_resources){
                    // console.log("done sending here")
                    break;
                }
            }
        }
        total_wood_send_stats +=total_wood_send
        total_stone_send_stats+=total_stone_send
        total_iron_send_stats +=total_iron_send

        total_wood_get_stats +=total_wood_get
        total_stone_get_stats+=total_stone_get
        total_iron_get_stats +=total_iron_get


        //calc distance max
        let max_distance=0
        for(let j=0;j<list_maxDistance.length;j++){
            if(max_distance < list_maxDistance[j])
                max_distance = list_maxDistance[j]
        }

        //add stats for cluster
        list_clusters_stats.push({
            nr_coords:clusters[i].data.length,
            center: parseInt(clusters[i].mean[0])+"|"+parseInt(clusters[i].mean[1]),
            max_distance:max_distance,

            avg_wood:Math.round(avg_wood),
            avg_stone:Math.round(avg_stone),
            avg_iron:Math.round(avg_iron),

            total_wood_send:total_wood_send,
            total_stone_send:total_stone_send,
            total_iron_send:total_iron_send,

            total_wood_get:total_wood_get,
            total_stone_get:total_stone_get,
            total_iron_get:total_iron_get,

            total_wood_cluster:total_wood_cluster,
            total_stone_cluster:total_stone_cluster,
            total_iron_cluster:total_iron_cluster
        })

    }

    console.log("list_clusters_stats",list_clusters_stats)


    // list_launches.sort((o1,o2)=>{
    //     return (o1.total_send > o2.total_send)?-1:(o1.total_send < o2.total_send)?1:0
    // })
    list_clusters_stats.sort((o1,o2)=>{
        return (o1.max_distance > o2.max_distance)?-1:(o1.max_distance < o2.max_distance)?1:0
    })

    // how many merchants are sent on each village
    let map_nr_merchants=new Map()
    for(let i=0;i<list_launches.length;i++){
        let nr_merchants=list_launches[i].wood+list_launches[i].stone+list_launches[i].iron
        nr_merchants=Math.ceil(nr_merchants/merchantCapacity)

        if(map_nr_merchants.has(list_launches[i].coord_origin)){
            let nr_update=map_nr_merchants.get(list_launches[i].coord_origin)
            map_nr_merchants.set(list_launches[i].coord_origin,nr_merchants+nr_update)
        }
        else{
            map_nr_merchants.set(list_launches[i].coord_origin,nr_merchants)

        }
    }
    console.log("map nr merchants",map_nr_merchants)
    for(let i=0;i<list_production.length;i++){
        let nr_merchants=0
        if(map_nr_merchants.get(list_production[i].coord))
            nr_merchants=map_nr_merchants.get(list_production[i].coord)

        // console.log(`coord: ${list_production[i].coord},merchants calculated: ${nr_merchants} vs theory: ${list_production[i].merchants}`)
        list_production[i].merchantAvailable = list_production[i].merchants - nr_merchants
    }


    /////////////////////////////////////////////////////////////some statistics///////////////////////////////////
    let obj_stats={}
    obj_stats.avg_wood=Math.round(avg_wood_total)
    obj_stats.avg_stone=Math.round(avg_stone_total)
    obj_stats.avg_iron=Math.round(avg_iron_total)

    obj_stats.total_wood_send=Math.round(total_wood_send_stats)
    obj_stats.total_stone_send=Math.round(total_stone_send_stats)
    obj_stats.total_iron_send=Math.round(total_iron_send_stats)

    obj_stats.total_wood_get=Math.round(total_wood_get_stats)
    obj_stats.total_stone_get=Math.round(total_stone_get_stats)
    obj_stats.total_iron_get=Math.round(total_iron_get_stats)

    obj_stats.total_wood_home=Math.round(total_wood_home)
    obj_stats.total_stone_home=Math.round(total_stone_home)
    obj_stats.total_iron_home=Math.round(total_iron_home)

    ///////////////////////////////////////////////////////////end result of balancing//////////////////////////////
    for(let i=0;i<list_production.length;i++){
        for(let j=0;j<list_launches.length;j++){
            if(list_production[i].coord == list_launches[j].coord_destination){
                list_production[i].wood +=list_launches[j].wood
                list_production[i].stone+=list_launches[j].stone
                list_production[i].iron +=list_launches[j].iron
            }
            else if(list_production[i].coord == list_launches[j].coord_origin){
                list_production[i].wood -=list_launches[j].wood
                list_production[i].stone-=list_launches[j].stone
                list_production[i].iron -=list_launches[j].iron
            }
            list_production[i].result_wood =list_production[i].wood -Math.round(avg_wood_total)
            list_production[i].result_stone=list_production[i].stone-Math.round(avg_stone_total)
            list_production[i].result_iron =list_production[i].iron -Math.round(avg_iron_total)
            list_production[i].result_total=list_production[i].result_wood+list_production[i].result_stone+list_production[i].result_iron
        }

    }
    list_production.sort((o1,o2)=>{
        return (o1.result_total>o2.result_total)?1:(o1.result_total<o2.result_total)?-1:0
    })


    let map_launches_mass=new Map()







    for(let i=0;i<list_launches.length;i++){
        let target_id=list_launches[i].id_destination
        let origin_id=list_launches[i].id_origin
        let woodKey=`resource[${origin_id}][wood]`
        let stoneKey=`resource[${origin_id}][stone]`
        let ironKey=`resource[${origin_id}][iron]`
        let send_resources={}

        //create a map with every launch
        if(map_launches_mass.has(target_id)){
            let obj_update=map_launches_mass.get(target_id)
            obj_update.send_resources[woodKey]=list_launches[i].wood
            obj_update.send_resources[stoneKey]=list_launches[i].stone
            obj_update.send_resources[ironKey]=list_launches[i].iron

            obj_update.total_send+=list_launches[i].total_send
            obj_update.total_wood+=list_launches[i].wood
            obj_update.total_stone+=list_launches[i].stone
            obj_update.total_iron+=list_launches[i].iron

            obj_update.distance=Math.max(obj_update.distance,list_launches[i].distance)
            map_launches_mass.set(target_id,obj_update)

        }else{
            send_resources[woodKey]=list_launches[i].wood
            send_resources[stoneKey]=list_launches[i].stone
            send_resources[ironKey]=list_launches[i].iron

            map_launches_mass.set(target_id,{
                target_id:target_id,
                coord_destination:list_launches[i].coord_destination,
                name_destination:list_launches[i].name_destination,
                send_resources:send_resources,
                total_send:list_launches[i].total_send,
                total_wood:list_launches[i].wood,
                total_stone:list_launches[i].stone,
                total_iron:list_launches[i].iron,
                distance:list_launches[i].distance
            })
        }




        if(map_draw_on_map.has(target_id)){
            let obj_update=map_draw_on_map.get(target_id)
            obj_update.total_resources_get+=list_launches[i].wood+list_launches[i].stone+list_launches[i].iron
            map_draw_on_map.set(target_id,obj_update)
        }

        if(map_draw_on_map.has(origin_id)){
            let obj_update=map_draw_on_map.get(origin_id)
            obj_update.total_resources_send+=list_launches[i].wood+list_launches[i].stone+list_launches[i].iron


            map_draw_on_map.set(origin_id,obj_update)
        }





    }

    let list_launches_mass=Array.from(map_launches_mass.entries()).map(e=>e[1])
    list_launches_mass.sort((o1,o2)=>{
        return (o1.total_send > o2.total_send)?-1:(o1.total_send < o2.total_send)?1:0
    })

    console.log("list_production",list_production)
    console.log("list_launches",list_launches)
    console.log("list_launches_mass",list_launches_mass)
    console.log("map_draw_on_map",map_draw_on_map)

    let stop= new Date().getTime()
    console.log("time process: "+(stop-start))
    

    createMainInterface()
    changeTheme()
    $("#div_tables").show()
    createTable(list_launches_mass,obj_stats,list_production,list_clusters_stats)

    if (typeof (TWMap) != 'undefined') {
        console.log("map page")
        document.getElementById("map_container").remove()
        TWMap.mapHandler.spawnSector=originalSpawnSector

        let random_color=[]
        for(let i=0;i<clusters.length;i++){
            let opacity=0.2
            let randomColor=getRandomColor(opacity)
            random_color.push(randomColor)
        }
        console.log(random_color)

        addInfoOnMap(map_draw_on_map,random_color)
        TWMap.init();

    }


}




function hitCountApi(){
    $.getJSON(`https://api.counterapi.dev/v1/${countNameSpace}/${countApiKey}/up`, response=>{
        console.log(`This script has been run: ${response.count} times`);
    });
    if(game_data.device !="desktop"){
        $.getJSON(`https://api.counterapi.dev/v1/${countNameSpace}/${countApiKey}_phone/up`, response=>{
            console.log(`This script has been run on mobile: ${response.count} times`);
        });
    }
 
    $.getJSON(`https://api.counterapi.dev/v1/${countNameSpace}/${countApiKey}_id2${game_data.player.id}/up`, response=>{
        if(response.count == 1){
            $.getJSON(`https://api.counterapi.dev/v1/${countNameSpace}/${countApiKey}_scriptUsers/up`, response=>{});
        }

    });

    try {
        $.getJSON(`https://api.counterapi.dev/v1/${countNameSpace}/${countApiKey}_scriptUsers`, response=>{
            console.log(`Total number of users: ${response.count}`);
        }); 
      
    } catch (error) {}

}



///////////////////////////////////////////////////////////////////get all resources from page combined production//////////////////////////////////////////////////


function getDataProduction(){

    return new Promise((resolve,reject)=>{
        let link_combined_production=game_data.link_base_pure+"overview_villages&mode=prod"
        let dataPage = httpGet(link_combined_production)
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(dataPage, 'text/html');
        //get pages for all incoming
        let list_pages=[]
    
        if($(htmlDoc).find(".paged-nav-item").parent().find("select").length>0){
            Array.from($(htmlDoc).find(".paged-nav-item").parent().find("select").find("option")).forEach(function(item){
                list_pages.push(item.value)
            })
            list_pages.pop();
        }
        else if(htmlDoc.getElementsByClassName("paged-nav-item").length>0){//all pages from the current folder
            let nr=0;
            Array.from(htmlDoc.getElementsByClassName("paged-nav-item")).forEach(function(item){
                let current=item.href;
                current=current.split("page=")[0]+"page="+nr
                nr++;
                list_pages.push(current);
            })
        }
        else{
            list_pages.push(link_combined_production);
        }
        list_pages=list_pages.reverse();
    
    
        // go to every page and get incoming
        let list_production=[]
        let map_farm_usage=new Map() 
        function ajaxRequest (urls) {
            let current_url
            if(urls.length>0){
                current_url=urls.pop()
            }
            else{
                current_url="stop"
            }
            console.log(current_url)
            let start_ajax=new Date().getTime()
            if (urls.length >= 0 && current_url!="stop") {
                $.ajax({
                    url: current_url,
                    method: 'get',
                    success: (data) => {
                        const parser = new DOMParser();
                        const htmlDoc = parser.parseFromString(data, 'text/html');

                        if(game_data.device == "desktop"){
                            let table_production=Array.from($(htmlDoc).find(".row_a, .row_b"))
                            for(let i=0;i<table_production.length;i++){
                                let name=table_production[i].getElementsByClassName("quickedit-vn")[0].innerText
                                let coord=table_production[i].getElementsByClassName("quickedit-vn")[0].innerText.match(/[0-9]{3}\|[0-9]{3}/)[0]
                                let id=table_production[i].getElementsByClassName("quickedit-vn")[0].getAttribute("data-id")
                                
                                let wood=parseInt(table_production[i].getElementsByClassName("wood")[0].innerText.replace(".",""))
                                let stone=parseInt(table_production[i].getElementsByClassName("stone")[0].innerText.replace(".",""))
                                let iron=parseInt(table_production[i].getElementsByClassName("iron")[0].innerText.replace(".",""))
                                let merchants=parseInt(table_production[i].querySelector("a[href*='market']").innerText.split("/")[0])
                                let merchants_total=parseInt(table_production[i].querySelector("a[href*='market']").innerText.split("/")[1])
                                let capacity=parseInt(table_production[i].children[4].innerText)
                                let points=parseInt(table_production[i].children[2].innerText.replace(".",""))
                                let farm_current_pop=parseInt(table_production[i].children[6].innerText.split("/")[0])
                                let farm_total_pop=parseInt(table_production[i].children[6].innerText.split("/")[1])
                                let farm_usage=farm_current_pop/farm_total_pop
                                
                                let obj={
                                    coord:coord,
                                    id:id,
                                    wood:wood,
                                    stone:stone,
                                    iron:iron,
                                    name:name,
                                    merchants:merchants,
                                    merchants_total:merchants_total,
                                    capacity:capacity,
                                    points:points,
    
                                }
                                list_production.push(obj)
    
                                map_farm_usage.set(coord,farm_usage)
                            }
                        }
                        else{

                            let table_production = Array.from($(htmlDoc).find("#production_table").find(".nowrap"))
                            for(let i=0;i<table_production.length;i++){
                                let name = table_production[i].previousElementSibling.children[0].innerText.trim()
                                let coord = table_production[i].previousElementSibling.children[0].innerText.match(/\d+\|\d+/)[0]
                                let id = table_production[i].previousElementSibling.getElementsByClassName("quickedit-vn")[0].getAttribute("data-id")

                                let wood = parseInt(table_production[i].getElementsByClassName("mwood")[0].innerText.replace(".",""))
                                let stone = parseInt(table_production[i].getElementsByClassName("mstone")[0].innerText.replace(".",""))
                                let iron = parseInt(table_production[i].getElementsByClassName("miron")[0].innerText.replace(".",""))
                                let merchants=parseInt(table_production[i].querySelector("a[href*='market']").innerText)
                                let merchants_total=500
                                let capacity = parseInt(table_production[i].getElementsByClassName("ressources")[0].parentElement.innerText)
                                let points = parseInt(table_production[i].previousElementSibling.children[1].innerText.replace(".",""))
                                let farm_current_pop=parseInt(table_production[i].getElementsByClassName("population")[0].parentElement.innerText.split("/")[0])
                                let farm_total_pop=parseInt(table_production[i].getElementsByClassName("population")[0].parentElement.innerText.split("/")[1])
                                let farm_usage=farm_current_pop/farm_total_pop
                           
                           
                                let obj={
                                    coord:coord,
                                    id:id,
                                    wood:wood,
                                    stone:stone,
                                    iron:iron,
                                    name:name,
                                    merchants:merchants,
                                    merchants_total:merchants_total,
                                    capacity:capacity,
                                    points:points,
    
                                }
                                list_production.push(obj)
    
                                map_farm_usage.set(coord,farm_usage)
                            }

                        }
                        


                        let stop_ajax=new Date().getTime();
                        let diff=stop_ajax-start_ajax
                        console.log("wait: "+diff)
                        window.setTimeout(function(){
                            ajaxRequest (list_pages)
                            UI.SuccessMessage("get production page: "+urls.length)
                        },200-diff)
                    },
                    error: (err)=>{
                        reject(err)
                    }
                })
               
            }
            else
            {
                console.log("list_production: herererre",list_production)
                UI.SuccessMessage("done")
                resolve({
                    list_production:list_production,
                    map_farm_usage:map_farm_usage
                })
    
                
            }
        }
        ajaxRequest(list_pages);
    
    })
}

///////////////////////////////////////////////////////////////////get all resources from page incoming transport//////////////////////////////////////////////////

function getDataIncoming(){
    return new Promise((resolve,reject)=>{
        let link_combined_production=game_data.link_base_pure+"overview_villages&mode=trader&type=inc"
        let dataPage = httpGet(link_combined_production)
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(dataPage, 'text/html');

        //get pages for all incoming
        let list_pages=[]

        if($(htmlDoc).find(".paged-nav-item").parent().find("select").length>0){
            Array.from($(htmlDoc).find(".paged-nav-item").parent().find("select").find("option")).forEach(function(item){
                list_pages.push(item.value)
            })
            list_pages.pop();
        }
        else if(htmlDoc.getElementsByClassName("paged-nav-item").length>0){//all pages from the current folder
            let nr=0;
            Array.from(htmlDoc.getElementsByClassName("paged-nav-item")).forEach(function(item){
                let current=item.href;
                current=current.split("page=")[0]+"page="+nr
                nr++;
                list_pages.push(current);
            })
        }
        else{
            list_pages.push(link_combined_production);
        }
        list_pages=list_pages.reverse();


        // go to every page and get incoming
        let  map_incoming=new Map()
        function ajaxRequest (urls) {
            let current_url
            if(urls.length>0){
                current_url=urls.pop()
            }
            else{
                current_url="stop"
            }
            console.log(current_url)
            let start_ajax=new Date().getTime()
            if (urls.length >= 0 && current_url!="stop") {
                $.ajax({
                    url: current_url,
                    method: 'get',
                    success: (data) => {
                        const parser = new DOMParser();
                        const htmlDoc = parser.parseFromString(data, 'text/html');
                        let table_incoming=Array.from($(htmlDoc).find(".row_a, .row_b"))

                        for(let i=0;i<table_incoming.length;i++){
                            let coord = ""
                            if(game_data.device == "desktop"){
                                coord=table_incoming[i].children[4].innerText.match(/[0-9]{3}\|[0-9]{3}/)[0]
                            }
                            else{
                                coord=table_incoming[i].children[3].innerText.match(/[0-9]{3}\|[0-9]{3}/g)[1]
                            }

                            let wood=parseInt($(table_incoming[i]).find(".wood").parent().text().replace(".",""))
                            let stone=parseInt($(table_incoming[i]).find(".stone").parent().text().replace(".",""))
                            let iron=parseInt($(table_incoming[i]).find(".iron").parent().text().replace(".",""))
                            wood=(Number.isNaN(wood) ==true)?0:wood
                            stone=(Number.isNaN(stone) ==true)?0:stone
                            iron=(Number.isNaN(iron) ==true)?0:iron


                            let obj={
                                wood:wood,
                                stone:stone,
                                iron:iron,
                            }
                            if(map_incoming.has(coord)){
                                let obj_update=map_incoming.get(coord)
                                obj_update.wood+=wood
                                obj_update.stone+=stone
                                obj_update.iron+=iron
                                map_incoming.set(coord,obj_update)
                            }
                            else{
                                map_incoming.set(coord,obj)
                            }
                        }
                        let stop_ajax=new Date().getTime();
                        let diff=stop_ajax-start_ajax
                        console.log("wait: "+diff)
                        window.setTimeout(function(){
                            ajaxRequest (list_pages)
                            UI.SuccessMessage("get incoming page: "+urls.length)
                        },200-diff)
                    },
                    error:(err)=>{
                        reject(err)
                    }
                })
            
            }
            else
            {
                UI.SuccessMessage("done")
                // console.log(map_incoming)
                resolve(map_incoming)

                
            }
        }
        ajaxRequest(list_pages);
    })

}



function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}


 function calcDistance(coord1,coord2)
        {
            let x1=parseInt(coord1.split("|")[0])
            let y1=parseInt(coord1.split("|")[1])
            let x2=parseInt(coord2.split("|")[0])
            let y2=parseInt(coord2.split("|")[1])
    
            return Math.sqrt( (x1-x2)*(x1-x2) +  (y1-y2)*(y1-y2) );
}

///////////////////////////////////////////////////////////////////create interface +tables//////////////////////////////////////////////////

async function createTable(list_launches,obj_stats,list_production,list_clusters_stats){




    
    ////////////////////////////////////////////////////////////////////table send resources/////////////////////////////////////////////////////////////////////
    let html_prod_table=`
        <table  class="scriptTableAlternate">
        <tr>
            <td style="width:3%">nr</td>
            <td style="width:35%">target</td>
            <td><a href="#" id="sort_distance"><font color="${textColor}">max distance</font></a></td>
            <td><a href="#" id="sort_total"><font color="${textColor}">total send</font></a></td>
            <td class="hide_mobile"><a href="#" id="sort_wood"><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/wood.png"/></a></td>
            <td class="hide_mobile"><a href="#" id="sort_stone"><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/stone.png"/></a></td>
            <td class="hide_mobile"><a href="#" id="sort_iron"><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/iron.png"/></a></td>
            <td>send</td>
        </tr>`

    for(let i=0;i<list_launches.length;i++){
        let target_id = list_launches[i].target_id
        let wood = list_launches[i].total_wood
        let stone = list_launches[i].total_stone
        let iron = list_launches[i].total_iron
        let origin_id=list_launches[i].id_origin
        let data=JSON.stringify(list_launches[i].send_resources)

        
        html_prod_table+=`
            <tr id="delete_row" >
                <td>${i+1}</td>          
                <td><a href="${game_data.link_base_pure}info_village&id=${list_launches[i].target_id}"><font color="${textColor}">${list_launches[i].name_destination}</font></a></td>
                <td>${list_launches[i].distance.toFixed(1)}</td>
                <td>${formatNumber(list_launches[i].total_send)}</td>
                <td class="hide_mobile">${formatNumber(wood)}</td>
                <td class="hide_mobile">${formatNumber(stone)}</td>
                <td class="hide_mobile">${formatNumber(iron)}</td>
                <td><input class="btn evt-confirm-btn btn-confirm-yes btn_send" target_id="${target_id}" data='${data}'  type="button" value="send"></td>
   
            </tr>`
    }

    html_prod_table+=`
        </table>`

    document.getElementById("table_view").innerHTML=html_prod_table

    //hide wood, stone, iron for mobile app because there isn't enough space
    if(game_data.device !="desktop")
        $(".hide_mobile").hide()

    ///////////////////////////////////////////////////////////////////add event for each button send//////////////////////////////////////////////
    $(".btn_send").on("click",async(event)=>{

        if($(event.target).is(":disabled")==false){
            let target_id=$(event.target).attr("target_id")
            let data=JSON.parse($(event.target).attr("data"))
            console.log(target_id,data)
            
    
            $(".btn_send").attr("disabled", true)
    
            let start=new Date().getTime()
            sendResources(target_id,data)
            let stop=new Date().getTime()
            let diff_time=stop-start
            // console.log("ajax time: "+(diff_time))
    
            window.setTimeout(()=>{
                $(event.target).closest("#delete_row").remove()
                $(".btn_send").attr("disabled", false)
            },200-diff_time)

        }

    })

    
    ////////////////////////////////////////////////////////////////////table statistics/////////////////////////////////////////////////////////////////////

    let html_stats_table=`
        <table id="table_stats" class="scriptTable">
        <tr>
            <td><input class="btn evt-confirm-btn btn-confirm-yes" id="btn_result" type="button" value="results"></td>
            <td><input class="btn evt-confirm-btn btn-confirm-yes" id="btn_cluster" type="button" value="clusters"></td>
            <td><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/wood.png"/></td>
            <td><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/stone.png"/></td>
            <td><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/iron.png"/></td>
        </tr>
        <tr>
            <td colspan="2">total</td>
            <td>${formatNumber(obj_stats.total_wood_home)}</td>
            <td>${formatNumber(obj_stats.total_stone_home)}</td>
            <td>${formatNumber(obj_stats.total_iron_home)}</td>
       
        </tr>
        <tr>
            <td colspan="2">average</td>
            <td>${formatNumber(obj_stats.avg_wood)}</td>
            <td>${formatNumber(obj_stats.avg_stone)}</td>
            <td>${formatNumber(obj_stats.avg_iron)}</td>
        </tr>
        <tr>
            <td colspan="2">surplus</td>
            <td>${formatNumber(obj_stats.total_wood_send)}</td>
            <td>${formatNumber(obj_stats.total_stone_send)}</td>
            <td>${formatNumber(obj_stats.total_iron_send)}</td>
        </tr>
        <tr>
            <td colspan="2">deficit</td>
            <td>${formatNumber(obj_stats.total_wood_get)}</td>
            <td>${formatNumber(obj_stats.total_stone_get)}</td>
            <td>${formatNumber(obj_stats.total_iron_get)}</td>
        </tr>

    </table>
    `
    document.getElementById("table_stats").innerHTML=html_stats_table


    //////////////////////////////////////////////add event for results button +create table for end of balancing//////////////////////////////////////////////
    $("#btn_result").on("click",()=>{
        createTableResults(list_production)
    })
    $("#btn_cluster").on("click",()=>{
        createTableClusters(list_clusters_stats)
    })
   
    



    ///////////////////////////////////////////////////////////add event for sorting/////////////////////////////////////////////////
    document.getElementById("sort_distance").addEventListener("click",()=>{
        list_launches.sort((o1,o2)=>{
            return (parseFloat(o1.distance) > parseFloat(o2.distance))?1:(parseFloat(o1.distance) < parseFloat(o2.distance))?-1:0
        })
        document.getElementById("table_stats").innerHTML=""
        createTable(list_launches,obj_stats,list_production,list_clusters_stats)

    })
    document.getElementById("sort_total").addEventListener("click",()=>{
        list_launches.sort((o1,o2)=>{
            return (o1.total_send > o2.total_send)?-1:(o1.total_send < o2.total_send)?1:0
        })
        document.getElementById("table_view").innerHTML=""
        createTable(list_launches,obj_stats,list_production,list_clusters_stats)

    })
    document.getElementById("sort_wood").addEventListener("click",()=>{
        list_launches.sort((o1,o2)=>{
            return (o1.total_wood > o2.total_wood)?-1:(o1.total_wood < o2.total_wood)?1:0
        })
        document.getElementById("table_view").innerHTML=""
        createTable(list_launches,obj_stats,list_production,list_clusters_stats)

    })
    document.getElementById("sort_stone").addEventListener("click",()=>{
        list_launches.sort((o1,o2)=>{
            return (o1.total_stone > o2.total_stone)?-1:(o1.total_stone < o2.total_stone)?1:0
        })
        document.getElementById("table_view").innerHTML=""
        createTable(list_launches,obj_stats,list_production,list_clusters_stats)

    })
    document.getElementById("sort_iron").addEventListener("click",()=>{
        list_launches.sort((o1,o2)=>{
            return (o1.total_iron > o2.total_iron)?-1:(o1.total_iron < o2.total_iron)?1:0
        })
        document.getElementById("table_view").innerHTML=""
        createTable(list_launches,obj_stats,list_production,list_clusters_stats)

    })




    //////////////////////////////////////////////add event for key enter//////////////////////////////////////////////////
    if(document.getElementsByClassName("btn_send").length>0){
        document.getElementsByClassName("btn_send")[0].focus()
    }

    window.onkeydown = function(e) {
        // console.log(e.which)
        if(e.which == 13 ){

            if(document.getElementsByClassName("btn_send").length>0){
                document.getElementsByClassName("btn_send")[0].click()
            }
        }
        // e.preventDefault()
    }


}

function formatNumber(number){
    return new Intl.NumberFormat().format(number)
}



///////////////////////////////////////////////////////////////////create table for results////////////////////////////

function createTableResults(list_production){
    let html_end_result=`
    <center><div id="table_results" style="height:800px;width:800px;overflow:auto">
    <table id="table_stats"  class="scriptTableBalancerResult">
    <tr>
        <td>coord</td>
        <td ><a href="#" id="order_points"><font  color="${textColor}">points</font></a></td>
        <td style="width:10%"><a href="#" id="order_merchants"><font  color="${textColor}">merchants</font></a></td>
        <td >
            <img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/main.png"/>
            <a href="#" id="order_hours"><font  color="${textColor}">[hours]</font></a>
        </td>
        <td colspan="2">
            <a href="#" class="order_deficit">
                <center style="margin:10px"><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/wood.png"/></center>
            </a>
        </td>
        <td colspan="2">
            <a href="#" class="order_deficit">
                <center style="margin:10px"><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/stone.png"/></center>
            </a>
        </td>
        <td colspan="2">
            <a href="#" class="order_deficit">
                <center style="margin:10px"><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/iron.png"/></center>
            </a>
        </td>
        <td >
            <a href="#" class="order_wh">
            <center style="margin:10px"><img src="https://dsen.innogamescdn.com/asset/04d88c84/graphic/buildings/storage.png"/></center>
            </a>
        </td>
   
    </tr>`


   
    for(let i=0;i<list_production.length;i++){



        let greenColor="#013e27",greenColorEven="#026440"//green
        let redColor="#5f0000",redColorEven="#9a0000"//red

        if(i%2!=0){
            header_status_wood =(parseInt(list_production[i].result_wood) >=0)?greenColor:redColor
            header_status_stone=(parseInt(list_production[i].result_stone)>=0)?greenColor:redColor
            header_status_iron =(parseInt(list_production[i].result_iron) >=0)?greenColor:redColor
        }
        else{
            header_status_wood =(parseInt(list_production[i].result_wood) >=0)?greenColorEven:redColorEven
            header_status_stone=(parseInt(list_production[i].result_stone)>=0)?greenColorEven:redColorEven
            header_status_iron =(parseInt(list_production[i].result_iron) >=0)?greenColorEven:redColorEven
        }

        html_end_result+=`
        <tr >
            <td><a href="${game_data.link_base_pure}info_village&id=${list_production[i].id}"><font color="${textColor}">${list_production[i].coord}</font></a>
            <td>${formatNumber(list_production[i].points)}</td>
            <td><b>${list_production[i].merchantAvailable}</b> / ${list_production[i].merchants_total}</td>
            <td>${formatNumber(parseInt(list_production[i].time_finished*10)/10)}</td>
            <td>${formatNumber(list_production[i].wood)}</td>
            <td style="background-color:${header_status_wood}">${formatNumber(list_production[i].result_wood)}</td>
            <td>${formatNumber(list_production[i].stone)}</td>
            <td style="background-color:${header_status_stone}">${formatNumber(list_production[i].result_stone)}</td>
            <td>${formatNumber(list_production[i].iron)}</td>
            <td style="background-color:${header_status_iron}">${formatNumber(list_production[i].result_iron)}</td>
            <td>${formatNumber(list_production[i].capacity)}</td>

        </tr>
        `
    }
        

    html_end_result+=`
    </table>
    </div></center>
    `
    Dialog.show("content",html_end_result)
    $("#order_points").on("click",()=>{
        list_production.sort((o1,o2)=>{
            return (o1.points>o2.points)?1:(o1.points<o2.points)?-1:0
        })
        console.log("order by points")
        $(".popup_box_close").click()
        createTableResults(list_production)

    })
    $("#order_merchants").on("click",()=>{
        list_production.sort((o1,o2)=>{
            return (o1.merchantAvailable>o2.merchantAvailable)?1:(o1.merchantAvailable<o2.merchantAvailable)?-1:0
        })
        console.log("order by merchants")
        $(".popup_box_close").click()
        createTableResults(list_production)

    })
    $("#order_hours").on("click",()=>{
        list_production.sort((o1,o2)=>{
            return (o1.time_finished>o2.time_finished)?-1:(o1.time_finished<o2.time_finished)?1:0
        })
        console.log("order by construction time")
        console.log(list_production)
        $(".popup_box_close").click()
        createTableResults(list_production)

    })
    $(".order_deficit").on("click",()=>{
        list_production.sort((o1,o2)=>{
            return (o1.result_total>o2.result_total)?1:(o1.result_total<o2.result_total)?-1:0

        })
        console.log("order by deficit/surplus")
        $(".popup_box_close").click()
        createTableResults(list_production)

    })
    $("#order_wh").on("click",()=>{
        list_production.sort((o1,o2)=>{
            return (o1.capacity>o2.capacity)?1:(o1.capacity<o2.capacity)?-1:0

        })
        console.log("order by warehouse capacity")
        $(".popup_box_close").click()
        createTableResults(list_production)

    })
}

///////////////////////////////////////////////////////////////////create table for clusters////////////////////////////

function createTableClusters(list_clusters_stats){
    let html_end_result=`
    <center><div id="table_results" style="height:800px;width:700px;overflow:auto">
    <table id="table_stats" class="scriptTable">
    <tr>
        <td style="width:5%">nr</td>
        <td >coords/\ncluster</td>
        <td >center of cluster</td>
        <td style="width:50%">resources</td>
        <td >max distance</td>   
    </tr>`


   
    for(let i=0;i<list_clusters_stats.length;i++){

        let gray="#202825",grayEven="#313e39"
        let header_status_wh = (i%2==0)?gray:grayEven

 

        html_end_result+=`
        <tr >
            <td>${i+1}</td>
            <td>${formatNumber(list_clusters_stats[i].nr_coords)}</td>
            <td>${list_clusters_stats[i].center}</td>
            <td >
                <table id="table_stats" class="scriptTableInner" >
                    <tr>
                        <td>type</td>
                        <td><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/wood.png"/></td>
                        <td><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/stone.png"/></td>
                        <td><img src="https://dsen.innogamescdn.com/asset/c2e59f13/graphic/buildings/iron.png"/></td>
                    </tr>
                    <tr>
                        <td>total</td>
                        <td>${formatNumber(list_clusters_stats[i].total_wood_cluster)}</td>
                        <td>${formatNumber(list_clusters_stats[i].total_stone_cluster)}</td>
                        <td>${formatNumber(list_clusters_stats[i].total_iron_cluster)}</td>
                    </tr>
                    <tr>
                        <td>average</td>
                        <td>${formatNumber(list_clusters_stats[i].avg_wood)}</td>
                        <td>${formatNumber(list_clusters_stats[i].avg_stone)}</td>
                        <td>${formatNumber(list_clusters_stats[i].avg_iron)}</td>
                    </tr>
                    <tr>
                        <td>surplus</td>
                        <td>${formatNumber(list_clusters_stats[i].total_wood_send)}</td>
                        <td>${formatNumber(list_clusters_stats[i].total_stone_send)}</td>
                        <td>${formatNumber(list_clusters_stats[i].total_iron_send)}</td>
                    </tr>
                    <tr>
                        <td>deficit</td>
                        <td>${formatNumber(list_clusters_stats[i].total_wood_get)}</td>
                        <td>${formatNumber(list_clusters_stats[i].total_stone_get)}</td>
                        <td>${formatNumber(list_clusters_stats[i].total_iron_get)}</td>
                    </tr>
                </table>
            </td>
            <td>${list_clusters_stats[i].max_distance.toFixed(1)}</td>
        </tr>
        `
    }
        

    html_end_result+=`
    </table>
    </div></center>
    `
    Dialog.show("content",html_end_result)
}




/////////////////////////////////////////////////////////////////function for sending resources//////////////////////////////////////////////////



function sendResources(target_id,data) {
    let options={
        "village":target_id,
        "ajaxaction" : "call",
        "h" : window.csrf_token,     
    }

    TribalWars.post("market",options, data, function(response) {
        console.log(response)
        UI.SuccessMessage(response.success,1000)
    }, function(error){
        console.log(error)
    });
}


/////////////////////////////////////////////////////////////////function for getting resources for AM buildings//////////////////////////////////////////////////


async function getResourcesForAM(time_construction_total,map_farm_usage){
    let {map_construction_templates, map_coord_templates} = await getTemplates().catch(e=>alert(e))
    let map_buildings = await getDataBuildings().catch(e=>alert(e))
    let map_constants_buildings = getConstantsTwBuildings()
    console.log("map_construction_templates",map_construction_templates)
    console.log("map_coord_templates",map_coord_templates)
    console.log("map_buildings",map_buildings)

    console.log("map_constants_buildings",map_constants_buildings)

    return new Promise((resolve,reject)=>{
    
        if(time_construction_total==0)
            resolve(new Map())

        
        let map_resources_get_AM=new Map()
    
        //add construction time for each building
        Array.from(map_buildings.keys()).forEach(key=>{
            if(key.includes("_time_queued")){
                map_resources_get_AM.set(key.replace("_time_queued",""),{
                    total_wood:0,
                    total_stone:0,
                    total_iron:0,
                    time_finished:Math.round(map_buildings.get(key)/3600)
                })
            }
        })

        Array.from(map_coord_templates.keys()).forEach(key=>{//for every coord which have a AM construction template
            let coord=key
            let count_time_construction=map_buildings.get(coord+"_time_queued")//if a village has already queued building then get time when last building is finished
            let template_name=map_coord_templates.get(coord)//get name template for the current village and then get the whole template tree from AM
            let list_template=map_construction_templates.get(template_name)
            // console.log("template_name",template_name)
            // console.log(list_template)
    
            //special case if a village doesn't have farm to max lv then check if farm is >99% used and then request to build farm 1 lv
            if(map_buildings.get(coord+"_farm")<30 && map_farm_usage.get(coord)>=0.99){
                let lv_building_HQ=map_buildings.get(coord+"_main")
                let lv_building_current=map_buildings.get(coord+"_farm")//curent building from building page
                let obj_constants_buildings=map_constants_buildings.get("farm")

                let list_info_construction=calculateTimeAndResConstruction(lv_building_HQ, lv_building_current, obj_constants_buildings)
                let time_construction=list_info_construction[0]
                let total_wood=list_info_construction[1]
                let total_stone=list_info_construction[2]
                let total_iron=list_info_construction[3]
                count_time_construction+=time_construction

                map_resources_get_AM.set(coord,{
                    total_wood:total_wood,
                    total_stone:total_stone,
                    total_iron:total_iron,
                    time_finished:count_time_construction/3600
                })
            }
            // if(coord == "619|525"){
            //     console.log("total count time construction :"+count_time_construction)
            // }
            for(let i=0;i<list_template.length;i++){//for every building from AM template
                let name_building=list_template[i].name
                let key_building=coord+"_"+name_building//the key for getting current building from building page is 'coord_name(building)'
    
                let lv_building_AM=list_template[i].level_absolute//level building from AM template
                let lv_building_current=map_buildings.get(key_building)//curent building from building page
    
                
                if(lv_building_AM>lv_building_current){//means current building must be constructed
                    let nr_levels=lv_building_AM-lv_building_current //lv building from AM can have 2-3 level above the current lv from building page
                  
                    for(let j=0;j<nr_levels;j++){
                      
                        //calculate time and resources needed for this lv
                        lv_building_current++//need to construct this building with 1 lv
                        let lv_building_HQ=map_buildings.get(coord+"_main")
                        let obj_constants_buildings=map_constants_buildings.get(name_building)
                        // console.log(`coord:${coord}, name_building: ${name_building} lv_building_current: ${lv_building_current}`)
                        let list_info_construction=calculateTimeAndResConstruction(lv_building_HQ, lv_building_current, obj_constants_buildings)
                        let time_construction=list_info_construction[0]
                        let total_wood=list_info_construction[1]
                        let total_stone=list_info_construction[2]
                        let total_iron=list_info_construction[3]                        
    


                        count_time_construction+=time_construction
                        //update map with res needed for this lv building
                        if(map_resources_get_AM.has(coord)){
                            let obj_update = map_resources_get_AM.get(coord)
                            obj_update.total_wood += total_wood
                            obj_update.total_stone += total_stone
                            obj_update.total_iron += total_iron
                            obj_update.time_finished = count_time_construction/3600
                            map_resources_get_AM.set(coord,obj_update)
                            
                        }
                        else{
                            map_resources_get_AM.set(coord,{
                                total_wood:total_wood,
                                total_stone:total_stone,
                                total_iron:total_iron,
                                time_finished:count_time_construction/3600
                            })
                        }
                   


                        map_buildings.set(key_building,lv_building_current)
                        
                        if(count_time_construction>time_construction_total){//this village has reached the number of res needed( construction time )
                            break;
                        }
    
    
                    }
                }
    
                if(count_time_construction>time_construction_total){//this village has reached the number of res needed( construction time )
                    break;
                }
            }
    
         
        })
    
    
        // console.log("map_resources_get_AM",map_resources_get_AM)
        resolve(map_resources_get_AM)
    
    })


}


/////////////////////////////////////////////////////////////////get templates//////////////////////////////////////////////////


function getTemplates(){
    return new Promise((resolve,reject)=>{

        if(game_data.features.AccountManager.active == false){//AM is not active
            resolve({
                map_coord_templates:new Map(),
                map_construction_templates:new Map()
            })
        }




        let link_combined_production=game_data.link_base_pure+"am_village"
        let dataPage = httpGet(link_combined_production)
        const parserMain = new DOMParser();
        const htmlDocMain = parserMain.parseFromString(dataPage, 'text/html');
        //get pages for all incoming
        let list_pages=[]

        if($(htmlDocMain).find("#village_table").prev().find("select").length>0){
            Array.from($(htmlDocMain).find("#village_table").prev().find("select").get(0)).forEach(function(item){
                list_pages.push(item.value)
            })
        }
        else if($(htmlDocMain).find("#village_table").prev().find(".paged-nav-item").length>0){//all pages from the current folder
            let nr_pages=$(htmlDocMain).find("#village_table").prev().find(".paged-nav-item").length
            for(let i=nr_pages-2;i>=0;i--){
                let link=game_data.link_base_pure+`am_village&page=${i}`
                list_pages.push(link);
            }
        
        }
        else{
            list_pages.push(link_combined_production);
        }
        list_pages=list_pages.reverse();
        console.log(list_pages)

        // go to every page and get template
        let map_coord_templates=new Map()
        let map_construction_templates=new Map() 
        async function ajaxRequest (urls) {
            let current_url
            if(urls.length>0){
                current_url=urls.pop()
            }
            else{
                current_url="stop"
            }
            console.log(current_url)
            let start_ajax=new Date().getTime()
            if (urls.length >= 0 && current_url!="stop") {
                $.ajax({
                    url: current_url,
                    method: 'get',
                    success: (data) => {
                        const parser = new DOMParser();
                        const htmlDoc = parser.parseFromString(data, 'text/html');

                        let table_construction=Array.from($(htmlDoc).find(".row_a, .row_b"))
                        for(let i=0;i<table_construction.length;i++){
                            let coord=table_construction[i].children[0].innerText.match(/[0-9]{3}\|[0-9]{3}/)[0]
                            let template_name=table_construction[i].children[1].innerText.trim()
                            // console.log(template_name)
                            if(template_name!=""){
                                map_coord_templates.set(coord,template_name)
                                map_construction_templates.set(template_name,0)
                            }

                        }

               
                        let stop_ajax=new Date().getTime();
                        let diff=stop_ajax-start_ajax
                        console.log("wait: "+diff)
                        window.setTimeout(function(){
                            ajaxRequest (list_pages)
                            UI.SuccessMessage("get AM construction page: "+urls.length)
                        },200-diff)
                    },
                    error:(err)=>{
                        reject(err)
                    }
                })
            
            }
            else
            {
                //get templates name
                let table_name_tamplate=Array.from($(htmlDocMain).find("select[name=template]").eq(0).find("option"))
                for(let i=0;i<table_name_tamplate.length;i++){

                    let link=game_data.link_base_pure+`am_village&mode=queue&template=${table_name_tamplate[i].value}`
                    let name
                    if(i<3)//only for the first 3 default template remove parantesis
                        name=table_name_tamplate[i].innerText.replaceAll("\n","").replaceAll("\t","").replace(/\(\w+\)/,"")
                    else
                        name=table_name_tamplate[i].innerText.replaceAll("\n","").replaceAll("\t","")

                    if(map_construction_templates.has(name)){
                        // console.log(name)
                        let data=await ajaxPromise(link)
                        const parser = new DOMParser();
                        const htmlDoc = parser.parseFromString(data, 'text/html');

                        let template_construction=[]
                        Array.from($(htmlDoc).find(".sortable_row")).forEach(item=>{
                            template_construction.push({
                                name:item.getAttribute("data-building"),
                                level_relative:parseInt($(item).find(".level_relative").text()),
                                level_absolute:parseInt($(item).find(".level_absolute").text().match(/\d+/)[0])
                            })
                        })
                        map_construction_templates.set(name,template_construction)
                    }
                    
                }
                
                


                // console.log("map_construction_templates",map_construction_templates)
                // console.log("map_coord_templates",map_coord_templates)
                UI.SuccessMessage("done")
                resolve({
                    map_coord_templates:map_coord_templates,
                    map_construction_templates:map_construction_templates
                })
                // console.log(map_incoming)

                
            }
        }
        ajaxRequest(list_pages);
    })

}


function ajaxPromise(link){
    return new Promise((resolve,reject)=>{

        let startAjax=new Date().getTime()
        $.ajax({
            url: link,
            method: 'get',
            success: (data) => {
   
                let stopAjax=new Date().getTime()
                let difAjax=stopAjax-startAjax
                // console.log("wait ",difAjax)
                window.setTimeout(()=>{
                    resolve(data)
                },200-difAjax)

            },error:(data)=>{
                reject(data)
            }

        })
    })
}


function getDataBuildings(){

    return new Promise((resolve,reject)=>{
        let link_combined_production=game_data.link_base_pure+"overview_villages&mode=buildings"
        let dataPage = httpGet(link_combined_production)
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(dataPage, 'text/html');
        //get pages for all incoming
        let list_pages=[]
    
        if($(htmlDoc).find(".paged-nav-item").parent().find("select").length>0){
            Array.from($(htmlDoc).find(".paged-nav-item").parent().find("select").find("option")).forEach(function(item){
                list_pages.push(item.value)
            })
            list_pages.pop();
        }
        else if(htmlDoc.getElementsByClassName("paged-nav-item").length>0){//all pages from the current folder
            let nr=0;
            Array.from(htmlDoc.getElementsByClassName("paged-nav-item")).forEach(function(item){
                let current=item.href;
                current=current.split("page=")[0]+"page="+nr
                nr++;
                list_pages.push(current);
            })
            
        }
        else{
            list_pages.push(link_combined_production);
        }
        list_pages=list_pages
        console.log(list_pages)
    
        
        // go to every page and get incoming
        let  map_buildings=new Map()
        function ajaxRequest (urls) {
            let current_url
            if(urls.length>0){
                current_url=urls.pop()
            }
            else{
                current_url="stop"
            }
            console.log(current_url)
            let start_ajax=new Date().getTime()
            if (urls.length >= 0 && current_url!="stop") {
                $.ajax({
                    url: current_url,
                    method: 'get',
                    success: (data) => {
                        const parser = new DOMParser();
                        const htmlDoc = parser.parseFromString(data, 'text/html');

                        if(game_data.device == "desktop"){
                            let table_buildings=Array.from($(htmlDoc).find(".row_a, .row_b"))
                            for(let i=0;i<table_buildings.length;i++){
                                let coord=$(table_buildings[i]).find(".nowrap").text().match(/[0-9]{3}\|[0-9]{3}/)[0]
                                // console.log(table_buildings[i])
                                let time_last_construction=$(table_buildings[i]).find(".queue_icon img").last().attr("title")
                                if(time_last_construction==undefined){//has building queued
                                    time_last_construction=0
                                }
                                else{
                                    time_last_construction=time_last_construction.split("-")[1]
                                    time_last_construction=getFinishTime(time_last_construction)
                               
                                }
                                // console.log(time_last_construction)
                                map_buildings.set(coord+"_time_queued",time_last_construction)
                                
    
                                let buildings=$(table_buildings[i]).find(".upgrade_building")
                                for(let j=0;j<buildings.length;j++){
                                    let name=buildings[j].classList[1].replace("b_","")
                                    let level=parseInt(buildings[j].innerText)
                                    // console.log(`name: ${name}, level:${level}`)
                                    let key=coord+"_"+name
                                    map_buildings.set(key,level)
                                }
    
    
    
                                //add queued buildings
                                let list_queued=Array.from($(table_buildings[i]).find(".queue_icon img")).map(e=>e.src.match(/\w+.png/)[0].replace(".png",""))
                                // console.log(list_queued)
                                for(let j=0;j<list_queued.length;j++){
                                    let key=coord+"_"+list_queued[j]
    
                                    if(map_buildings.has(key)){
                                        let value=map_buildings.get(key)
                                        map_buildings.set(key,value+1)
                                    }else{
                                        map_buildings.set(key,1)
                                    }
                                }
    
                            }    
                        }
                        else{
                            let table_buildings=Array.from($(htmlDoc).find(".row_a, .row_b"))
                            for(let i=0;i<table_buildings.length;i++){

                                let coord = $(table_buildings[i]).find(".nowrap").text().match(/[0-9]{3}\|[0-9]{3}/)[0]
                                let time_last_construction = $(table_buildings[i].nextElementSibling.nextElementSibling).find("img").last().attr("title")
                                if(time_last_construction==undefined){//has building queued
                                    time_last_construction=0
                                }
                                else{
                                    time_last_construction=time_last_construction.split("-")[1]
                                    time_last_construction=getFinishTime(time_last_construction)
                               
                                }
                                map_buildings.set(coord+"_time_queued",time_last_construction)


                                let buildingsLevel = $(table_buildings[i].nextElementSibling).find('table').find('td')
                                let buildingsName = $(table_buildings[i].nextElementSibling).find('table').find('th')
                                for(let j=0;j<buildingsLevel.length;j++){
                                    let name=buildingsName[j].getElementsByTagName("img")[0].src.split("buildings/")[1].replace(".png","")
                                    let level=parseInt(buildingsLevel[j].innerText)
                                    // console.log(`name: ${name}, level:${level}`)
                                    let key=coord+"_"+name
                                    map_buildings.set(key,level)
                                }

                                //add queued buildings
                                let list_queued=Array.from($(table_buildings[i].nextElementSibling.nextElementSibling).find("img")).map(e=>e.src.match(/\w+.png/)[0].replace(".png",""))
                                // console.log(list_queued)
                                for(let j=0;j<list_queued.length;j++){
                                    let key=coord+"_"+list_queued[j]
    
                                    if(map_buildings.has(key)){
                                        let value=map_buildings.get(key)
                                        map_buildings.set(key,value+1)
                                    }else{
                                        map_buildings.set(key,1)
                                    }
                                }
                                
                            }

                        }
                        

                        let stop_ajax=new Date().getTime();
                        let diff=stop_ajax-start_ajax
                        console.log("wait: "+diff)
                        window.setTimeout(function(){
                            ajaxRequest (list_pages)
                            UI.SuccessMessage("get building page: "+urls.length)
                        },200-diff)
                    },
                    error: (err)=>{
                        reject(err)
                    }
                })
               
            }
            else
            {
                UI.SuccessMessage("done")
                console.log("map_buildings herere",map_buildings)
                resolve(map_buildings)
     
            }
        }
        ajaxRequest(list_pages);
    
    })
}





function getFinishTime(time_finished){
    var date_finished=""
    let server_date=document.getElementById("serverDate").innerText.split("/")
    if(time_finished.includes(lang["aea2b0aa9ae1534226518faaefffdaad"].replace(" %s",""))){    //today
        date_finished=server_date[1]+"/"+server_date[0]+"/"+server_date[2]+" "+time_finished.match(/\d+:\d+/)[0]
    }
    else if(time_finished.includes(lang["57d28d1b211fddbb7a499ead5bf23079"].replace(" %s",""))){    //tomorrow
        var tomorrow_date=new Date(server_date[1]+"/"+server_date[0]+"/"+server_date[2]);
        tomorrow_date.setDate(tomorrow_date.getDate()+1);
        date_finished= ("0"+(tomorrow_date.getMonth()+1)).slice(-2)+"/"+("0"+tomorrow_date.getDate()).slice(-2)+"/"+tomorrow_date.getFullYear()+" "+time_finished.match(/\d+:\d+/)[0];
    }else if(time_finished.includes(lang["0cb274c906d622fa8ce524bcfbb7552d"].split(" ")[0])){  //on
        var on=time_finished.match(/\d+.\d+/)[0].split(".");
        date_finished=on[1]+"/"+on[0]+"/"+server_date[2]+" "+time_finished.match(/\d+:\d+/)[0];
    }
    // console.log("date_finished: "+date_finished)
    date_finished=new Date(date_finished)

    let serverTime=document.getElementById("serverTime").innerText
    let serverDate=document.getElementById("serverDate").innerText.split("/")
    serverDate=serverDate[1]+"/"+serverDate[0]+"/"+serverDate[2]
    let date_current=new Date(serverDate+" "+serverTime)

    let result_seconds=parseInt((date_finished.getTime()-date_current.getTime())/1000)
    // console.log("before here---------: "+result_seconds)

    if(result_seconds < 0){
        date_finished.setDate(date_finished.getDate()+1)
        result_seconds=parseInt((date_finished.getTime()-date_current.getTime())/1000)
    }

    // console.log("after here---------: "+result_seconds)

    return result_seconds;
}

function getConstantsTwBuildings(){
    if (localStorage.getItem(game_data.world+"constantBuildings") !== null) {
        let map_constants_buildings = new Map(JSON.parse(localStorage.getItem(game_data.world+"constantBuildings")))
        console.log("constant building world already exist")
        return map_constants_buildings
    }
    else{ //Get data from xml and save it in localStorage to avoid excessive XML requests to server
            let data=httpGet("/interface.php?func=get_building_info") //Load world data
            
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, 'text/html');
            let map_constants_buildings=new Map()
            let list_buildings=htmlDoc.getElementsByTagName("config")[0].children
            for(let i=0;i<list_buildings.length;i++){
                let name_building=list_buildings[i].tagName.toLowerCase()
                let wood=Number(list_buildings[i].getElementsByTagName("wood")[0].innerText)
                let stone=Number(list_buildings[i].getElementsByTagName("stone")[0].innerText)
                let iron=Number(list_buildings[i].getElementsByTagName("iron")[0].innerText)



                let wood_factor=Number(list_buildings[i].getElementsByTagName("wood_factor")[0].innerText)
                let stone_factor=Number(list_buildings[i].getElementsByTagName("stone_factor")[0].innerText)
                let iron_factor=Number(list_buildings[i].getElementsByTagName("iron_factor")[0].innerText)

                let build_time=Number(list_buildings[i].getElementsByTagName("build_time")[0].innerText)
                let build_time_factor=Number(list_buildings[i].getElementsByTagName("build_time_factor")[0].innerText)

                map_constants_buildings.set(name_building,{
                    wood:wood,
                    stone:stone,
                    iron:iron,
                    wood_factor:wood_factor,
                    stone_factor:stone_factor,
                    iron_factor:iron_factor,
                    build_time:build_time,
                    build_time_factor:build_time_factor
                })
            }
            let data_save=JSON.stringify(Array.from(map_constants_buildings.entries()))
            localStorage.setItem(game_data.world+"constantBuildings",data_save);
            console.log("save speed world")
        return map_constants_buildings
    }

}


function calculateTimeAndResConstruction(hq, level, obj_data) {

    let constantLvl={
        1:1,
        2:1,
        3:0.112292,
        4:0.289555,
        5:0.46113,
        6:0.606372,
        7:0.723059,
        8:0.815935,
        9:0.889947,
        10:0.948408,
        11:0.994718,
        12:1.031,
        13:1.059231,
        14:1.080939,
        15:1.09729,
        16:1.109156,
        17:1.117308,
        18:1.122392,
        19:1.124817,
        20:1.124917,
        21:1.123181,
        22:1.119778,
        23:1.114984,
        24:1.109038,
        25:1.102077,
        26:1.0942,
        27:1.085601,
        28:1.076369,
        29:1.066566,
        30:1.056291,
    }


    var buildTime = obj_data.build_time * Math.pow(1.2, (level -1)) * Math.pow(1.05, -hq) * constantLvl[level]
    
    let total_wood = Math.round(obj_data.wood * Math.pow(obj_data.wood_factor, level - 1))
    let total_stone = Math.round(obj_data.stone * Math.pow(obj_data.stone_factor, level - 1))
    let total_iron = Math.round(obj_data.iron * Math.pow(obj_data.iron_factor, level - 1))
    
    return [Math.round(buildTime), total_wood , total_stone, total_iron];
}





/////////////////////////////////////////////////////////k-means////////////////////////////////////////////////////////
// https://github.com/shudima/dimas-kmeans/blob/master/dimas-kmeans.js




function getClusters(data, options) {
    let result_cluster=[]
    let maxDistanceGlobal=999999;
    let repeat=50;

    for(let rep=0;rep<repeat;rep++){
        let result=insideGetCluster(data,options)
        if(maxDistanceGlobal > result.maxDistance){
            maxDistanceGlobal=result.maxDistance
            result_cluster=result
        }
    }
    console.log("maxDistanceGlobal",maxDistanceGlobal)

    // throw new Error("stop")
	return result_cluster
}


function insideGetCluster(data,options){
    var numberOfClusters, distanceFunction, vectorFunction, minMaxValues, maxIterations;

    if (!options || !options.numberOfClusters) { numberOfClusters = 1 }
    else { numberOfClusters = options.numberOfClusters; }

    if (!options || !options.distanceFunction) { distanceFunction = getDistance; }
    else { distanceFunction = options.distanceFunction; }
    
    if (!options || !options.vectorFunction) { vectorFunction = defaultVectorFunction; }
    else { vectorFunction = options.vectorFunction; }
    
    if (!options || !options.maxIterations) { maxIterations = 1000; }
    else { maxIterations = options.maxIterations; }

    let result_cluster=getClustersWithParams(data, numberOfClusters, distanceFunction, vectorFunction, maxIterations).clusters;

    ////calculate max distance

    let maxDistance=0;
    for(let i=0;i<result_cluster.length;i++){//for each cluster
        let list_coord=result_cluster[i].data
        for(let j=0;j<list_coord.length;j++){
            for(let k=j+1;k<list_coord.length;k++){
                let dist=getDistance(list_coord[j],list_coord[k])
                maxDistance=(maxDistance > dist)?maxDistance:dist
            }
        }
    }
    // console.log("maxDistance",maxDistance)
    result_cluster.maxDistance=maxDistance
    return result_cluster

    
}


function getClustersWithParams(data ,numberOfClusters, distanceFunction, vectorFunction, maxIterations) {

    let means=[]
    for(let i=0;i<numberOfClusters;i++){
        let random_index=parseInt(Math.random()*Object.keys(data).length)
        means.push(data[random_index])
    }


    // console.log("means",means)
	var clusters = createClusters(means);

	var prevMeansDistance = 999999;

    var numOfInterations = 0;
    var iterations = [];


	while(numOfInterations < maxIterations) {

		initClustersData(clusters);

	    assignDataToClusters(data, clusters, distanceFunction, vectorFunction);

		updateMeans(clusters, vectorFunction);

		var meansDistance = getMeansDistance(clusters, vectorFunction, distanceFunction);

	    //iterations.push(meansDistance);
        // console.log(numOfInterations + ': ' + meansDistance);
        numOfInterations++;
	}
	
	// console.log(getMeansDistance(clusters, vectorFunction, distanceFunction));

    return { clusters: clusters, iterations: iterations };
}

function defaultVectorFunction(vector) {
	return vector;
}


function getMeansDistance(clusters, vectorFunction, distanceFunction) {

	var meansDistance = 0;

	clusters.forEach(function (cluster) {

		cluster.data.forEach(function (vector) {

		    meansDistance = meansDistance + Math.pow(distanceFunction(cluster.mean, vectorFunction(vector)), 2);
		});
	});


	return meansDistance;
}

function updateMeans(clusters, vectorFunction) {

	clusters.forEach(function (cluster) {
		updateMean(cluster, vectorFunction);

	});
}


function updateMean(cluster, vectorFunction) {

	var newMean = [];

	for (var i = 0; i < cluster.mean.length; i++) {
		newMean.push(getMean(cluster.data, i, vectorFunction));
	};


	cluster.mean = newMean;

}

function getMean(data, index, vectorFunction) {
	var sum =  0;
	var total = data.length;

	if(total == 0) return 0;

	data.forEach(function (vector) {

			sum = sum + vectorFunction(vector)[index];
	});


	return sum / total;
}

function assignDataToClusters(data, clusters, distanceFunction, vectorFunction) {


	data.forEach(function (vector) {
	    var cluster = findClosestCluster(vectorFunction(vector), clusters, distanceFunction);

	    if(!cluster.data) cluster.data = [];
		
		cluster.data.push(vector);
	});
}

function findClosestCluster(vector, clusters, distanceFunction) {

	var closest = {};
	var minDistance = 9999999;

	clusters.forEach(function (cluster) {
		
		var distance = distanceFunction(cluster.mean, vector);
		if (distance < minDistance) {
			minDistance = distance;
			closest = cluster;
		};
	});

	return closest;
}

function initClustersData(clusters) {
	clusters.forEach(function (cluster) {
		cluster.data = [];
	});
}

function createClusters(means) {
	var clusters = [];

	means.forEach(function (mean) {
		var cluster = { mean : mean, data : []};

		clusters.push(cluster);
	});

	return clusters;
}


function getDistance(vector1, vector2) {
	var sum = 0;

	for (var i = 0; i < vector1.length; i++) {
		sum = sum + Math.pow(vector1[i] - vector2[i],2)
	};

	return Math.sqrt(sum);

}



///////////////////////////////////////////////////////show data on the map///////////////////////////////////////

function addInfoOnMap(mapInfoResources,random_color){
    let drawInfo=true
    // console.log("sa mor eu de nu merge",mapInfoResources)
    TWMap.mapHandler.spawnSector = function (data, sector) {
        originalSpawnSector.call(TWMap.mapHandler, data, sector);
        console.log(`spawn area map`)

        if(drawInfo==true){
            drawInfo=false
            window.setTimeout(() => {

                let visibleSectors=TWMap.map._visibleSectors
                Object.keys(visibleSectors).forEach(key=>{
                    let elements=visibleSectors[key]._elements
                    Object.keys(elements).forEach(key=>{
                        let villageId=elements[key].id.match(/\d+/)
                        // console.log(villageId)
                        if(villageId!=null){
                            if(mapInfoResources.has(villageId[0])){
                                let obj=mapInfoResources.get(villageId[0])
                                // console.log(obj)
                                // console.log(`label cluster: ${obj.label_cluster}, color random: `)
                                // console.log(random_color[obj.label_cluster])
                                createMapInfo(obj,random_color[obj.label_cluster])
                            }
                        }  
                    })
                })
                drawInfo=true
            }, 50);
        }
    };
}


function createMapInfo(obj,random_color){

    try {
        console.log(random_color)
        if(document.getElementById(`info_extra${obj.villageId}`) == null ){
            let greenColor="#026440"
            let redColor="#E80000"
            let villageImg=document.getElementById(`map_village_${obj.villageId}`)

            let parent=document.getElementById(`map_village_${obj.villageId}`).parentElement
            let leftImg=villageImg.style.left
            let topImg=villageImg.style.top

            while(document.getElementById(`map_icons_${obj.villageId}`)!=null){
                document.getElementById(`map_icons_${obj.villageId}`).remove()
            }
            if(document.getElementById(`map_cmdicons_${obj.villageId}_0`)!=null)
                document.getElementById(`map_cmdicons_${obj.villageId}_0`).remove()
            if(document.getElementById(`map_cmdicons_${obj.villageId}_1`)!=null)
                document.getElementById(`map_cmdicons_${obj.villageId}_1`).remove()


            let html_info=`
                <div class="border_info" id="info_extra${obj.villageId}" style="position:absolute;left:${leftImg};top:${topImg};width:51px;height:36px;z-index:3; ${`background-color:${random_color.colorOpacity};outline:${random_color.color} solid 2px`}"></div>
                <center><font color="${textColor}"  class="shadow20" style="position:absolute;left:${leftImg};top:${topImg};width:14px;height:14px;z-index:4;margin-left:0px;; font-size: 12px">nr:${obj.label_cluster} </font></center>
                <center><font color="${greenColor}"  class="shadow20" style="position:absolute;left:${leftImg};top:${topImg};width:14px;height:14px;z-index:4;margin-left:0px;margin-top:11px; font-size: 12px">${parseInt(obj.total_resources_get/1000)}k </font></center>
                <center><font color="${redColor}"  class="shadow20" style="position:absolute;left:${leftImg};top:${topImg};width:14px;height:14px;z-index:4;margin-left:0px;margin-top:23px; font-size: 12px">${parseInt(obj.total_resources_send/1000)}k </font></center>
                `
            $(html_info).appendTo(parent);


        }

    } catch (error) {
        
    }
}


function getRandomColor(opacity) {
    let  color = 'rgb(';
    let colorOpacity = 'rgba(';

    for (let i = 0; i < 3; i++) {
        let randomNr=Math.floor(Math.random() * 255)
        color += randomNr + ',';
        colorOpacity += randomNr + ',';

    }
    color=color.substr(0,color.length-1)  + ')'; // add the transparency
    colorOpacity=colorOpacity + opacity + ')'; // add the transparency

    return {
        color:color,
        colorOpacity:colorOpacity
    }

}
