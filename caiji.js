const show_localtime = false; // 编辑false为true开启本地时间显示

var EorzeaClock = /** @class */ (function() {
    function EorzeaClock(ts) {
        if (ts === void 0) { ts = undefined; }
        if (ts !== undefined) {
            this.date = new Date(ts);
        } else {
            this.date = new Date(((new Date()).getTime()) * EorzeaClock.ratio);
        }
    }

    EorzeaClock.prototype.nextHour = function(hour) {
        var dtime = hour < this.getHours() ? (24 - this.getHours() + hour) : hour - this.getHours();
        var new_ezt = this.addHours(dtime);
        new_ezt.date.setMinutes(0);
        new_ezt.date.setSeconds(0);
        return new_ezt;
    };

    EorzeaClock.prototype.prevHour = function(hour) {
        var tet = new EorzeaClock(this.date.getTime());
        tet.date.setMinutes(0);
        tet.date.setSeconds(0);
        var new_ezt = new EorzeaClock(tet.date.getTime() - (hour * 3600000));
        new_ezt.date.setMinutes(0);
        new_ezt.date.setSeconds(0);
        return new_ezt;
    }

    EorzeaClock.prototype.getHours = function() {
        return this.date.getUTCHours();
    };

    EorzeaClock.prototype.addHours = function(hourspan) {
        return new EorzeaClock(this.date.getTime() + (hourspan * 3600000));
    };

    EorzeaClock.prototype.getMinutes = function() {
        return this.date.getUTCMinutes();
    };

    EorzeaClock.prototype.getDays = function() {
        return Math.floor(this.date.getTime() / 86400000);
    };

    EorzeaClock.prototype.getLocalTime = function() {
        return new Date(this.date.getTime() / EorzeaClock.ratio);
    };

    EorzeaClock.prototype.toHourMinuteString = function() {
        var hour = this.getHours();
        var hs = "";
        if (hour < 10) {
            hs = "0" + hour;
        } else {
            hs += hour;
        }
        var min = this.getMinutes();
        var ms = "";
        if (min < 10) {
            ms = "0" + min;
        } else {
            ms += min;
        }
        return hs + ":" + ms;
    };
    EorzeaClock.ratio = 1440 / 70;
    return EorzeaClock;
}());

const timer_template = `<div class="timer" id="timer-{{id}}-{{count}}">
<progress value="0" max="4200"></progress><span>0</span>${show_localtime ? '<span>0</span>' : ''}
</div>`

const alarm_template = `<div class="alarm_block" id="{{id}}" title="{{icon_title}}">
<div class="item_info">
    <div>
        <img src="{{icon_url}}" alt="{{icon_title}}" title="{{icon_title}}" id="item-icon-{{id}}" />
    </div>
    <div>{{icon_title}}</div>
</div>

<div class="details_and_timer">
    <div class="details">
        <span onmouseover="javascript:this.innerText='{{pos}}';" onmouseout="javascript:this.innerText='{{zone_area}}'">{{zone_area}}</span>
        <span>{{block}}</span>
        <span>{{status}}</span>
        <a href="javascript:remove_alarm_id('{{id}}')">X</a>
    </div>
    {{timers}}
</div>
</div>`

const et_60min = 175; // second in earth time
const sound_uri = "Alert.ogg";

String.prototype.render = function(context) {
    return this.replace(/{{(.*?)}}/g, (match, key) => context[key.trim()]);
};

console.log("[采集] Overlay is booting up.");

let item_id_table = {};
let timer_id = {};
let timer_info = {};
/*
info format:
"9999" : [
{
    "time": time,
    "status": wait/show,
    "uptime": min et
}, {
    ...
}
]
*/

function refresh_data(data) {
    json_data = data;
}

function update_timer(id) {
    var infos = timer_info[id];
    var pgbars = document.getElementById(id).getElementsByClassName("timer");
    var i = 0;
    var show_up = false;
    infos.forEach(info => {
        var rest_second = Math.floor((info.time.getLocalTime() - Date.now()) / 1000);
        if (rest_second > 0) {
            pgbars[i].getElementsByTagName('progress')[0].value = pgbars[i].getElementsByTagName('progress')[0].max - rest_second;
            pgbars[i].getElementsByTagName('span')[0].innerText = `${(rest_second - (rest_second % 60)) / 60 < 10 ? '0' : ''}${(rest_second - (rest_second % 60)) / 60}:${rest_second % 60 < 10 ? '0' : ''}${rest_second % 60}`
            if (show_localtime)
                pgbars[i].getElementsByTagName('span')[1].innerText = `${info.time.getLocalTime().getHours() < 10 ? '0' : ''}${info.time.getLocalTime().getHours()}:${info.time.getLocalTime().getMinutes() < 10 ? '0' : ''}${info.time.getLocalTime().getMinutes()}`
        } else {
            // console.log(infos);
            timer_info[id][i].time = new EorzeaClock().nextHour(info.time.getHours() + info.uptime / 60);
            timer_info[id][i].status = timer_info[id][i].status == "wait" ? "show" : "wait";
            status_node = document.getElementById(id).getElementsByClassName("details")[0].getElementsByTagName("span")[2];
            if (timer_info[id][i].status == "wait") {
                timer_info[id][i].time = new EorzeaClock().nextHour(info.show_time);
                if (!show_up) {
                    status_node.innerText = "冷却中";
                    status_node.style.color = "";
                }
                pgbars[i].getElementsByTagName('progress')[0].max = 4200;
                pgbars[i].getElementsByTagName('span')[0].style.color = '';
                pgbars[i].getElementsByTagName('span')[1].style.color = '';
            } else if (timer_info[id][i].status == "show") {
                timer_info[id][i].time = new EorzeaClock().nextHour(info.show_time + info.uptime / 60);
                if (show_up == false) {
                    // play notification sound
                    sound = document.createElement("audio");
                    sound.setAttribute("src", sound_uri);
                    sound.play();

                    status_node.innerText = "出现中";
                    status_node.style.color = "red";
                    show_up == true;
                }
                pgbars[i].getElementsByTagName('progress')[0].max = info.uptime / 60 * et_60min;
                pgbars[i].getElementsByTagName('span')[0].style.color = 'red';
                pgbars[i].getElementsByTagName('span')[1].style.color = 'red';
            }
        }
        i++;
    });
}

function set_icon(ele_id, img_src) {
    document.getElementById(ele_id).src = img_src;
    return document.getElementById(ele_id);
}

function add_alarm(item) {
    console.log("[采集] Add alarm: " + item);
    item_datas = json_data.data.filter(
        x => (
            RegExp(item + "\\(\(\\d+\)\\)").test(x[25]) &&
            x[25].split(',').map(x => x.split('(')[0]).includes(item)
        )
    );
    item_datas.map(item_data => add_alarm_with_gp_id(item, item_data[0]));
}

function add_alarm_with_gp_id(item, gp_id) {
    console.log("[采集] Add alarm: " + item + ", with gathering point id: " + gp_id);
    item_data = json_data.data.find(
        x => (
            RegExp(item + "\\(\(\\d+\)\\)").test(x[25]) &&
            x[0] == gp_id &&
            x[25].split(',').map(x => x.split('(')[0]).includes(item)
        )
    );

    item_id = item_data[25].split(',').map(x => x.split('(')[1].replace(')', ''))[(item_data[25].split(',').map(x => x.split('(')[0])).findIndex(x => x == item)];;
    if (timer_id[item_id + '-' + gp_id]) {
        console.log('[采集] Alarm is already in use.');
        return;
    }

    gp_id = String(gp_id);

    if (item_id_table[item])
        item_id_table[item].push(item_id + "-" + gp_id);
    else
        item_id_table[item] = [item_id + "-" + gp_id];

    // console.log(item_data);
    item_time = item_data[9].split(';').map(x => Number(x));
    item_cords = "X:" + (item_data[14].split(';').map(x => Number(x))).join(', Y:');
    item_zone = item_data[12];
    item_uptime = item_data[10]; // eorzea time min
    item_block = item_data.slice(15, 23).findIndex(x => x == item_id) + 1;

    timer_info[item_id + "-" + gp_id] = [];
    item_time.forEach(time => {
        var showing = ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].slice(time, time + item_uptime / 60).includes(new EorzeaClock().getHours()));
        timer_info[item_id + "-" + gp_id].push({
            time: showing ? new EorzeaClock().nextHour(time + item_uptime / 60) : new EorzeaClock().nextHour(time),
            status: showing ? "show" : "wait",
            uptime: item_uptime,
            show_time: time
        })
    });

    let root = document.getElementById("main_root");
    root.innerHTML += alarm_template.render({
        id: item_id + "-" + gp_id,
        icon_url: "",
        icon_title: item,
        pos: item_cords,
        zone_area: item_zone,
        block: `第 ${item_block} 格`,
        status: "Status",
        timers: timer_template.render({
            id: "1",
            count: "1"
        }).repeat(item_time.length)
    });

    setTimeout((a, b) => {
        fetch("https://cafemaker.wakingsands.com/item/" + a)
            .then(response => {
                if (response.ok) return response.json()
                throw new Error('[采集] Network response was not ok.')
            })
            .then(data => {
                document.getElementById("item-icon-" + a + "-" + b).src = "https://cafemaker.wakingsands.com" + data.Icon;
            });
    }, 1, item_id, gp_id);

    timer_id[item_id + "-" + gp_id] = setInterval(update_timer, 1000, item_id + "-" + gp_id);
    console.log("[采集] Register timer for id: " + item_id + "-" + gp_id);

    let status_node = document.getElementById(item_id + "-" + gp_id).getElementsByClassName("details")[0].getElementsByTagName("span")[2];
    let pgbars = document.getElementById(item_id + "-" + gp_id).getElementsByClassName("timer");
    let show_up = false;
    for (var i = 0; i < item_time.length; i++) {
        if (timer_info[item_id + "-" + gp_id][i].status == "wait") {
            if (!show_up) {
                status_node.innerText = "冷却中";
                status_node.style.color = "";
            }
            pgbars[i].getElementsByTagName('progress')[0].max = 4200;
            pgbars[i].getElementsByTagName('span')[0].style.color = '';
        } else {
            status_node.innerText = "出现中";
            status_node.style.color = "red";
            show_up = true;
            pgbars[i].getElementsByTagName('progress')[0].max = item_uptime / 60 * et_60min;
            pgbars[i].getElementsByTagName('span')[0].style.color = 'red';
        }
    }

    save_alarm();
}

function remove_alarm(item) {
    console.log("[采集] Remove alarm: " + item);
    item_id_table[item].map(id => remove_alarm_id(id));
    delete item_id_table[item];
}

function remove_alarm_id(id) {
    console.log("[采集] Remove alarm by ID: " + id);
    document.getElementById(String(id)).remove();
    clearInterval(timer_id[id]);
    timer_id[id] = null;

    var item = Object.keys(item_id_table).find(k => item_id_table[k].includes(id))
    delete item_id_table[item][item_id_table[item].findIndex(x => x == id)];
    save_alarm();
}

let storage = window.localStorage;
var json_data = null;

fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://ff14.huijiwiki.com/api.php?action=jsondata&format=json&formatversion=2&title=%E9%87%87%E9%9B%86%E7%82%B9.tabx')}`)
    .then(response => {
        if (response.ok) return response.json()
        throw new Error('[采集] Network response was not ok.')
    })
    .then(data => {
        jd = JSON.parse(data.contents);
        storage.json_data = JSON.stringify(jd.jsondata);
        console.log("[采集] Data has been updated.");
        refresh_data(jd.jsondata);
    });

addOverlayListener('LogLine', (line) => {
    let rawLine = line.rawLine;
    let sline = line.line;
    if (sline[0] == "00" && sline[2] == "0038" && sline[3] == "") {
        msg = sline[4];
        var item_pat_add = /Add_Alarm (.*)/
        var item_pat_remove = /Remove_Alarm (.*)/
        if (item_pat_add.test(msg))
            add_alarm(item_pat_add.exec(msg)[1].replace('', '').replace('', '').replace('', ''));
        if (item_pat_remove.test(msg))
            remove_alarm(item_pat_remove.exec(msg)[1].replace('', '').replace('', '').replace('', ''));
    }
});

refresh_data(JSON.parse(storage.json_data));

startOverlayEvents();

console.log("[采集] Overlay is started.");

function fold() {
    main_root = document.getElementById("main_root");
    fold_ele = document.getElementById("fold");
    if (main_root.getAttribute('class') != 'hidden') {
        main_root.setAttribute('class', 'hidden');
        fold_ele.innerText = '>>>>';
    } else {
        main_root.setAttribute('class', '');
        fold_ele.innerText = '<<<<';
    }
}

const popup_html = `<div class="selectors" id="selectors">
        <span>职业:</span>
        <select id="jobs">
            <option value="0">全部</option>
            <option value="1">园艺工</option>
            <option value="2">采矿工</option>
        </select>

        <span>等级:</span>
        <select id="lvls">
        </select>

        <span>地图:</span>
        <select id="maps">
        </select>

        <span>类型:</span>
        <select id="types">
        </select>

        <span>物品名:</span>
        <input id="item_name" />

        <button onclick="javascript:window.opener.search(document.getElementById('jobs').value,document.getElementById('lvls').value,document.getElementById('maps').value,document.getElementById('types').value,document.getElementById('item_name').value);">Search</button>
    </div>
    <div calss="tips"><span style="color:red;">ET: 艾欧泽亚时间, 持续时间: 艾欧泽亚分钟</span></div>
    <div class="results" id="results"></div>`

const result_block = `<div class="result" style="margin:10px;background-color: cyan;display: inline-flex;align-items: center;justify-content: center;">
<div class="items">{{items}}</div>
<div class="time-info">ET: {{ET}}&nbsp;持续时间: {{uptime}}</div>
</div>`

const result_item = `<a style="display:block" href="javascript:window.opener.add_alarm_with_gp_id('{{item}}', '{{gpid}}');">{{item}}</a>`

popup_initial = (json_data, doc) => {

    sorted_maps = [
        "All",
        "中拉诺西亚", "拉诺西亚低地", "东拉诺西亚", "西拉诺西亚", "拉诺西亚高地",
        "黑衣森林中央林区", "黑衣森林东部林区", "黑衣森林南部林区", "黑衣森林北部林区",
        "西萨纳兰", "中萨纳兰", "东萨纳兰", "南萨纳兰", "北萨纳兰",
        "摩杜纳",
        "库尔札斯中央高地", "库尔札斯西部高地",
        "阿巴拉提亚云海", "魔大陆阿济兹拉",
        "龙堡内陆低地", "龙堡参天高地", "翻云雾海",
        "红玉海", "延夏", "太阳神草原",
        "基拉巴尼亚边区", "基拉巴尼亚山区", "基拉巴尼亚湖区",
        "雷克兰德", "珂露西亚岛", "安穆·艾兰", "伊尔美格", "拉凯提卡大森林", "黑风海"
    ];

    sorted_types = [
        "All",
        "未知",
        "限时",
        "隐藏",
        "传说"
    ]

    function update_selector() {
        lvls_sel = doc.getElementById("lvls");
        maps_sel = doc.getElementById("maps");
        types_sel = doc.getElementById("types");
        lvls = new Set();
        json_data.data.map(x => lvls.add(x[5]));
        lvls = Array.from(lvls).sort((a, b) => a < b ? -1 : 1);
        lvls.forEach(lvl => lvls_sel.options.add(new Option(lvl == 0 ? '全部' : lvl, lvl)));
        sorted_maps.forEach(map => maps_sel.options.add(new Option(map == "All" ? '全部' : map, map)));
        sorted_types.forEach(type => types_sel.options.add(new Option(type == "All" ? '全部' : type, type)));
    }

    update_selector();
}

function add() {
    if (window.popup)
        return;
    var nw = window.open("", "_blank", "width=530, height=500");
    nw.document.title = '[采集] 简易搜索';
    nw.document.body.innerHTML = popup_html;
    popup_initial(json_data, nw.document);
    nw.onbeforeunload = () => {
        window.popup = null;
    }
    window.popup = nw;
}

function search(job, lvl, map, type, key_word) { // return an array with gp data
    if (!window.popup) {
        console.log('[采集] No popup window, output to console only.')
    }
    console.log(`[采集] Searching for: ${job} ${lvl} ${map} ${type} ${key_word}.`);
    var results = json_data.data.filter(x => (
        // (x[7] == true) && // only search for limit gp
        (x[0] != -1) &&
        (x[9] != null) &&
        (job == 0 ? true : (job == 1 ? (x[4] == 2 || x[4] == 3) : (x[4] == 0 || x[4] == 1))) &&
        (lvl == 0 ? true : x[5] == lvl) &&
        (map == 'All' ? true : x[12] == map) &&
        (type == 'All' ? true : x[8] == type) &&
        (key_word == '' ? true : new RegExp(key_word).test(x[25]))
    ));
    console.log(`[采集] We have totally ${results.length} results.`);
    // console.log(results);

    if (window.popup) {
        let htmls = '';
        results.forEach(gp_data => {
            let items_html = '';
            let items = gp_data[25].split(',').map(x => x.split('(')[0]);
            items.forEach(i => items_html += result_item.render({ item: i, gpid: gp_data[0] }));
            result_block_html = result_block.render({
                ET: gp_data[9].split(';').map(x => `${x < 10 ? '0' : ''}${x}:00`),
                uptime: gp_data[10],
                items: items_html
            });
            htmls += result_block_html;
        });
        window.popup.document.getElementById('results').innerHTML = htmls;
    }
}

function save_alarm() {
    storage.alarms = [];
    storage.alarms = Array.from(document.getElementsByClassName("alarm_block")).map(x => (x.title + '-' + x.id.split('-')[1]));
}

function load_alarm() {
    alarms = storage.alarms.split(',');
    alarms.forEach(x => {
        add_alarm_with_gp_id(x.split('-')[0], x.split('-')[1])
    });
}

window.onload = () => {
    if (storage.alarms) {
        load_alarm();
    }
};