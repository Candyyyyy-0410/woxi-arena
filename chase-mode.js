(function () {
  "use strict";

  const MAX_TURNS = 10;
  const ROUTE_GAIN_SCALE = .64;
  const STREET_RECORD_KEY = "woxi_chase_baiqi_record_v1";
  const CASTLE_RECORD_KEY = "woxi_chase_hanxin_castle_record_v1";
  const BAIQI_CASTLE_RECORD_KEY = "woxi_chase_baiqi_castle_record_v1";
  const HANXIN_STREET_RECORD_KEY = "woxi_chase_hanxin_street_record_v1";
  const $ = function (id) { return document.getElementById(id); };
  const clamp = function (n, min, max) { return Math.max(min, Math.min(max, n)); };
  const pick = function (items) { return items[Math.floor(Math.random() * items.length)]; };
  const mobileAsset = function (src) { return src.replace(/\.jpg$/i, "-mobile.webp"); };

  const STREET_OUTCOMES = {
    silent: {
      kicker: "CHASE END / SILENT ESCAPE",
      title: "静默脱身",
      copy: "你把每一步都压进雨声里。白起在街中停住，已经不是没看见你，而是失去了你离开的方向。"
    },
    extreme: {
      kicker: "CHASE END / LAST BREATH",
      title: "极限逃脱",
      copy: "出口关上的前一秒，你从白起的钩镰旁挤了出去。没有从容，只有一个还活着的结果。"
    },
    exit: {
      kicker: "CHASE END / DRAGGED BACK",
      title: "出口前被拖回",
      copy: "铁门的冷光已经照到脸上，钩镰却先一步扣住衣领。你被从门槛上拖回积水里，出口只剩一道缝。"
    },
    midway: {
      kicker: "CHASE END / TAKEN MIDWAY",
      title: "途中处刑",
      copy: "街还没有走完，身后的脚步声已经停了。白起不需要再追，你已经站在他伸手可及的范围内。"
    }
  };

  const CASTLE_OUTCOMES = {
    silent: {
      kicker: "CASTLE END / STONE-SILENT",
      title: "石廊无声",
      copy: "你把脚步藏进拱窗回声里。韩信的长枪停在门厅石缝前，枪尖没有再向前探。"
    },
    extreme: {
      kicker: "CASTLE END / BREAK THE GATE",
      title: "破门而出",
      copy: "铁闸落下前，你从侧门挤进雨里。身后传来枪杆撞门的闷响，守门的人没有追出来。"
    },
    exit: {
      kicker: "CASTLE END / TAKEN AT THE GRATE",
      title: "闸前截回",
      copy: "外门已经看见，枪尖却先一步横在锁链前。你被从门槛拖回长廊，铁闸在身后合死。"
    },
    midway: {
      kicker: "CASTLE END / SPEAR IN THE HALL",
      title: "廊下截杀",
      copy: "侧廊没有接上，直线又被枪锋封死。韩信从拱窗阴影里踏出来，整个长廊只剩一条退路。"
    }
  };

  const STREET_ROLE_LABELS = {
    steady: "稳妥路线",
    near: "冒险近路",
    lure: "诱导追兵",
    hide: "原地屏息",
    recon: "观察路线"
  };

  const CASTLE_ROLE_LABELS = Object.assign({}, STREET_ROLE_LABELS, {
    flank: "侧廊包抄",
    cut: "长枪截线",
    listen: "贴墙听声",
    feint: "掷响换路",
    hide: "梁柱潜藏"
  });

  const STREET_ACTION_ROLES = {
    entry: { shutter: "steady", hood: "recon", kiosk: "lure", alley: "near" },
    flooded: { plank: "steady", wreck: "near", undercar: "hide", stir: "lure" },
    gate: { crates: "near", squeeze: "steady", pipe: "lure", recess: "hide" },
    finish: { block: "lure", wall: "near", breathe: "steady" }
  };

  const CASTLE_ACTION_ROLES = {
    entry: { sideHall: "flank", greatHall: "cut", listenAtDoor: "listen", alcove: "hide" },
    gallery: { serviceGallery: "flank", crossGallery: "cut", spearPivot: "listen", curtain: "hide" },
    undercroft: { cellarGutter: "flank", chainStairs: "cut", throwCrucible: "feint", culvert: "hide" },
    finish: { postern: "flank", gateChain: "cut", stillAtGate: "listen" }
  };

  const WAREHOUSE_OUTCOMES = {
    silent: {
      kicker: "CHASE END / RACK-SILENT",
      title: "货架无声",
      copy: "你把脚步藏进货架之间的回声里。追击者在装卸平台前停下，长直通道里没有留下你离开的方向。"
    },
    extreme: {
      kicker: "CHASE END / SHUTTER BREAK",
      title: "铁闸脱身",
      copy: "卷帘门落下的前一瞬，你从叉车和铁链之间挤了出去。身后只有铁皮震响，没有另一双靴子跟出来。"
    },
    exit: {
      kicker: "CHASE END / TAKEN AT THE DOCK",
      title: "出货口前被拖回",
      copy: "出口的冷光已经照到地上，追击线却先一步封住门缝。你被从装卸平台拖回货架深处，卷帘门在身后砸死。"
    },
    midway: {
      kicker: "CHASE END / LOST IN THE RACKS",
      title: "仓储区截杀",
      copy: "货架没有连成侧路，主通道又暴露得太久。脚步声从相邻过道绕到正面，整座仓库只剩一条退路。"
    }
  };

  const WAREHOUSE_ROLE_LABELS = Object.assign({}, STREET_ROLE_LABELS, {
    quiet: "稳妥路线",
    racks: "货架断线",
    aisle: "主通道冒险",
    listen: "贴架听声",
    feint: "铁皮诱饵",
    hide: "货垛潜藏"
  });

  const WAREHOUSE_ACTION_ROLES = {
    entry: { dockEdge: "quiet", openDock: "aisle", cageStep: "racks", palletGap: "hide" },
    racks: { narrowAisle: "racks", mainAisle: "aisle", rackPivot: "listen", boxStack: "hide" },
    service: { pipeRun: "quiet", catwalk: "aisle", valveNoise: "feint", serviceNiche: "hide" },
    finish: { sideDock: "racks", shutterDash: "aisle", forkliftBlock: "feint", chainAnchor: "quiet" }
  };

  // After the opening move, every turn redraws a route deck. The next deck is
  // selected from the previous role, so two consecutive clicks never leave the
  // player staring at the same four choices.
  const BRANCH_PACKS = {
    street: [
      [
        { role: "steady", kind: "quiet", label: "沿排水沟侧移", sub: "让水流盖住鞋底声", progress: [7, 11], distance: .7, noise: -3, stamina: -2, hint: "你避开了路灯正下方，追兵只能重新判断方向。", text: ["鞋边擦过铁格栅，水声替你吞掉了脚步。"] },
        { role: "lure", kind: "context", label: "把空罐踢向反方向", sub: "制造第二处响动，再从暗处折回", progress: [6, 10], distance: .2, noise: 18, stamina: -3, hint: "响动把追兵引向了另一条巷口。", text: ["空罐撞上卷帘门。你没有往声音那边跑。"] },
        { role: "recon", kind: "context", label: "钻进雨棚后侧", sub: "避开灯下直线，先看清下一处拐角", progress: [6, 9], distance: .5, noise: -1, stamina: -4, hint: "你记住了一个没有积水的落脚点。", text: ["雨沿着破棚布灌下来，正好遮住你的肩线。"] },
        { role: "near", kind: "risk", label: "踩上垃圾桶盖越墙", sub: "抢出距离，但金属会大声回弹", progress: [10, 14], distance: -.4, noise: 15, stamina: -8, slipAt: 38, hint: "桶盖在脚下塌了一下，追兵听见了。", text: ["锈蚀的桶盖被你蹬翻，墙头的碎玻璃划开袖口。"] }
      ],
      [
        { role: "steady", kind: "quiet", label: "借开门车辆挡住视线", sub: "贴着车门绕到街道另一侧", progress: [8, 12], distance: .9, noise: -4, stamina: -2, hint: "车门替你把追击线切断了半秒。", text: ["一辆弃车的车门斜开着，你从门后滑过去。"] },
        { role: "lure", kind: "context", label: "推倒湿透的报刊架", sub: "让纸张和铁架同时制造混乱", progress: [7, 11], distance: .3, noise: 21, stamina: -5, hint: "追兵踩碎了纸板，却慢了一步。", text: ["整排旧报纸扑进积水，墨迹像黑血一样散开。"] },
        { role: "hide", kind: "stealth", label: "滑进车底压住呼吸", sub: "让轮胎和积水遮住身体轮廓", progress: [6, 9], distance: 1.4, noise: -10, stamina: -6, hint: "鞋跟从车尾经过，没有停。", text: ["底板贴着你的脊背，骨节随着引擎残响发颤。"] },
        { role: "recon", kind: "context", label: "退到电话亭后听脚步", sub: "先数清转向，再决定下一次冲刺", progress: [5, 8], distance: .9, noise: -5, stamina: -3, hint: "你听出追兵在左侧换了步频。", text: ["玻璃后的呼吸圈起白雾，街上的脚步一深一浅。"] }
      ],
      [
        { role: "steady", kind: "quiet", label: "踩水洼的反光改道", sub: "借倒影确认追兵位置再侧切", progress: [9, 13], distance: 1, noise: -4, stamina: -3, hint: "倒影里那双靴子慢了半拍。", text: ["你从水面看见他的钩影，先一步拐进灯外。"] },
        { role: "near", kind: "risk", label: "翻过断掉的广告牌", sub: "缩短出口距离，但铁架会刮响", progress: [11, 15], distance: -.5, noise: 16, stamina: -9, slipAt: 42, hint: "广告牌的铁脚被拖过路面，声音很长。", text: ["你跃过裂开的灯箱，鞋底在铁架上滑出火星。"] },
        { role: "lure", kind: "context", label: "故意留下反向脚印", sub: "让追兵先追错一段，再抢回主路", progress: [7, 11], distance: .6, noise: 12, stamina: -4, hint: "脚印把你藏进了一片更深的黑暗。", text: ["你踩着水来回打了两次方向，才真正离开。"] },
        { role: "recon", kind: "context", label: "绕进死巷再贴墙折返", sub: "用短暂消失换一次重新判断", progress: [6, 9], distance: 1.2, noise: 2, stamina: -4, hint: "死巷尽头没有出口，但拐角替你遮了他一瞬。", text: ["脚步在湿墙上折回来，你贴着砖缝退向主路。"] }
      ]
    ],
    castle: [
      [
        { role: "flank", kind: "quiet", label: "沿侧廊压低身形", sub: "借石柱断开追兵的视线", progress: [8, 12], distance: .8, noise: -3, stamina: -2, hint: "长枪擦过石柱，枪影短暂失准。", text: ["石柱一根接一根挡住灯火，你的影子被切成碎片。"] },
        { role: "cut", kind: "risk", label: "踩住垂落铁链滑下", sub: "抄近路，铁环会一路撞墙", progress: [10, 14], distance: -.5, noise: 16, stamina: -8, slipAt: 40, spearLine: true, hint: "铁链声把枪线引到了你前方。", text: ["锈环在掌心割出热痕，整段石廊都听见你落下。"] },
        { role: "listen", kind: "context", label: "数完回声再换门", sub: "先判断枪尾落在哪一段石阶", progress: [6, 9], distance: 1.1, noise: -5, stamina: -3, hint: "你听出他下一次换位会从右侧来。", text: ["回声撞上拱顶，第二遍回来时已经变了方向。"] },
        { role: "hide", kind: "stealth", label: "缩进拱窗下的暗槽", sub: "让石台挡住灯与枪尖", progress: [7, 10], distance: 1.4, noise: -9, stamina: -5, hint: "枪尖从暗槽外扫过，没有停下。", text: ["冷石贴着后背，你听见甲片从头顶掠过。"] }
      ],
      [
        { role: "flank", kind: "quiet", label: "翻过帘幕后绕柱", sub: "把直廊切成两段视线", progress: [9, 13], distance: .9, noise: -3, stamina: -3, hint: "帘布晃动，枪尖却刺进了空处。", text: ["旧帘裂开一条口子，你从饰柱背后换了方向。"] },
        { role: "cut", kind: "risk", label: "沿中庭直线抢枪位", sub: "抢出最大距离，正面承受枪线", progress: [12, 16], distance: -.6, noise: 14, stamina: -9, spearLine: true, hint: "枪线从侧方截住了你的直线。", text: ["你刚踏上中庭，枪尖已经提前横在出口前。"] },
        { role: "listen", kind: "context", label: "敲墙制造第二次回声", sub: "用假回声骗出一次换位", progress: [6, 10], distance: .7, noise: 9, stamina: -4, hint: "他往假的方向迈了一步。", text: ["指节敲在石砖上，回声像另一个人跑过。"] },
        { role: "feint", kind: "context", label: "把披风挂在断戟上", sub: "让枪锋先刺向无人的轮廓", progress: [7, 10], distance: .8, noise: 4, stamina: -4, hint: "枪锋穿透布料，你从另一侧换路。", text: ["旧甲上的披风微微晃动，正好替你挨了一下。"] }
      ],
      [
        { role: "flank", kind: "quiet", label: "从地下蓄水槽边缘绕行", sub: "让水面吞掉鞋跟和枪影", progress: [9, 13], distance: 1, noise: -5, stamina: -4, hint: "水声把两个人的位置搅在一起。", text: ["冷水漫过鞋口，你把每一步都踩在滴水之间。"] },
        { role: "cut", kind: "risk", label: "沿铁梯冲进枪线", sub: "出口更近，铁梯却会放大脚步", progress: [12, 16], distance: -.5, noise: 17, stamina: -8, slipAt: 45, spearLine: true, hint: "枪尾撞上铁梯，整段回响追着你走。", text: ["铁踏板一节节炸响，你几乎听见枪锋贴着后颈。"] },
        { role: "listen", kind: "context", label: "停在闸门后听枪尾", sub: "用一次停顿换出正确路线", progress: [6, 9], distance: 1.2, noise: -6, stamina: -3, hint: "枪尾停在门前，他终于失去你的节奏。", text: ["你没有动。门后的铁锈味越来越近，脚步却慢下来。"] },
        { role: "feint", kind: "context", label: "踢倒铜盆引开枪尖", sub: "让追兵先扑向声源", progress: [8, 11], distance: .7, noise: 19, stamina: -5, hint: "铜盆滚过石阶，枪尖偏了半尺。", text: ["铜盆撞上拱门，回声在古堡里来回折返。"] }
      ]
    ],
    warehouse: [
      [
        { role: "racks", kind: "quiet", label: "钻进窄货架断线", sub: "让纸箱和铁架切断视线", progress: [8, 12], distance: .8, noise: -3, stamina: -2, hint: "瞄准线被一排纸箱挡住。", text: ["纸箱边缘擦过肩膀，铁架后的灯只剩一条细缝。"] },
        { role: "aisle", kind: "risk", label: "沿主通道抢出货口", sub: "距离最短，但会暴露在准星下", progress: [11, 15], distance: -.5, noise: 15, stamina: -8, sightLine: true, hint: "主通道把你的轮廓完整交给准星。", text: ["顶灯把整条通道照得发白，你只能硬着头皮冲。"] },
        { role: "listen", kind: "context", label: "贴住阀门听管线震动", sub: "用蒸汽节拍判断追兵方向", progress: [6, 9], distance: 1.1, noise: 4, stamina: -3, hint: "管线的震动先替你报出了脚步。", text: ["阀门每响一次，你就往相反的方向挪半步。"] },
        { role: "hide", kind: "stealth", label: "躲进空托盘夹层", sub: "让塑料膜盖住呼吸和轮廓", progress: [7, 10], distance: 1.3, noise: -9, stamina: -5, hint: "靴底从托盘边经过，白色雾气停了一瞬。", text: ["薄膜裹住你的肩膀，冷气从颈后灌进去。"] }
      ],
      [
        { role: "racks", kind: "quiet", label: "推倒空箱搭出断线", sub: "让货架投下更长的阴影", progress: [9, 13], distance: .9, noise: 8, stamina: -4, hint: "纸箱倒塌后，准星找不到你的胸口。", text: ["你从箱堆缺口滑过去，身后的纸板还在塌。"] },
        { role: "aisle", kind: "risk", label: "踩上叉车冲过装卸口", sub: "抢速度，但叉臂会反光", progress: [12, 16], distance: -.6, noise: 16, stamina: -9, slipAt: 45, sightLine: true, hint: "叉车金属反光把位置交给了守约。", text: ["你踩上车盖，铁皮在鞋底发出一声闷响。"] },
        { role: "feint", kind: "context", label: "用反光铁片引开准星", sub: "先制造一个假目标再换货架", progress: [7, 11], distance: .7, noise: 6, stamina: -4, hint: "光点偏了一下，你趁机跨过通道。", text: ["碎铁片卡在栏杆上，正好反出一道移动的光。"] },
        { role: "quiet", kind: "stealth", label: "沿冷库管线侧身潜行", sub: "让白雾盖住鞋跟和体温", progress: [7, 10], distance: 1.2, noise: -7, stamina: -5, hint: "雾气合上时，通道里只剩你自己的呼吸。", text: ["管壁结着薄霜，你把手掌贴上去稳住重心。"] }
      ],
      [
        { role: "racks", kind: "quiet", label: "推着空笼车挡住枪口", sub: "借铁笼换一段安全距离", progress: [9, 13], distance: .9, noise: 9, stamina: -5, hint: "笼轮的声音盖住了鞋底。", text: ["空笼车碾过地面，铁栅把准星切成几格。"] },
        { role: "aisle", kind: "risk", label: "翻过卷帘门最后直冲", sub: "直接抢出口，彻底暴露在枪线下", progress: [13, 17], distance: -.7, noise: 18, stamina: -10, sightLine: true, hint: "你刚离开遮挡，准星就贴上了背心。", text: ["卷帘门下沿刮过脊背，外面冷风像刀一样灌进来。"] },
        { role: "feint", kind: "context", label: "启动空叉车撞向侧门", sub: "用巨响分开追兵和枪口", progress: [8, 12], distance: .6, noise: 22, stamina: -5, hint: "叉车撞上侧门，追兵被迫换了路线。", text: ["发动机干咳两声，叉臂顶着侧门一路尖叫。"] },
        { role: "quiet", kind: "stealth", label: "绕到装货台下方爬行", sub: "从盲区钻进最后一排货架", progress: [7, 10], distance: 1.3, noise: -8, stamina: -6, hint: "台板遮住了整条人影。", text: ["你伏在水泥台上，指尖全是机油和碎玻璃。"] }
      ]
    ]
  };

  const ROUTE_LEXICON = {
    street: {
      quiet: "雨棚后的排水沟",
      bait: "墙脚的空铁罐",
      high: "垃圾桶盖和废车顶",
      gap: "报刊亭与废车之间的夹角",
      door: "最后的铁门"
    },
    castle: {
      quiet: "拱廊石柱后的湿影",
      bait: "门口的铁灯笼",
      high: "断拱下的石栏",
      gap: "帷幔与窗台之间的夹角",
      door: "最后的铁闸"
    },
    warehouse: {
      quiet: "货架背面的窄缝",
      bait: "装卸台上的空油桶",
      high: "叉车顶盖和货架横梁",
      gap: "冷库管线与卷帘门之间的夹角",
      door: "出货卷帘门"
    }
  };

  const ROUTE_METRICS = {
    steady: { progress: [8, 11], distance: .8, noise: -3, stamina: -2 },
    lure: { progress: [6, 10], distance: .3, noise: 18, stamina: -3 },
    recon: { progress: [6, 9], distance: .6, noise: -1, stamina: -4 },
    near: { progress: [11, 15], distance: -.5, noise: 15, stamina: -8, slipAt: 42 },
    flank: { progress: [8, 12], distance: .8, noise: -3, stamina: -2 },
    cut: { progress: [11, 15], distance: -.5, noise: 16, stamina: -8, slipAt: 43 },
    listen: { progress: [6, 10], distance: 1, noise: -4, stamina: -3 },
    feint: { progress: [7, 11], distance: .6, noise: 10, stamina: -4 },
    hide: { progress: [7, 10], distance: 1.3, noise: -9, stamina: -5 },
    racks: { progress: [8, 12], distance: .8, noise: -3, stamina: -2 },
    aisle: { progress: [11, 15], distance: -.6, noise: 16, stamina: -8, slipAt: 44 },
    quiet: { progress: [7, 10], distance: 1.1, noise: -7, stamina: -5 }
  };

  // Each hero reads the same environment differently. These route tables are
  // composed with scene-specific locations so the four heroes never share the
  // same visible route choices inside one scene.
  const HERO_ROUTE_PROFILES = {
    baiqi: [
      [
        ["steady", "quiet", "沿{quiet}切断钩链回声", "让雨声盖住铁链的拖动声", "钩镰在你背后换了方向。", "你贴着排水沟侧移，钩链刮墙的声音忽然断了一拍。"],
        ["lure", "context", "把{bait}踢向反巷", "用第二处响动骗他收钩", "空罐把追兵引向了另一条巷口。", "空罐撞上卷帘门，你没有往声音那边跑。"],
        ["recon", "context", "从{high}看钩影", "先记住钩链下一次会从哪边扫来", "你看见钩柄在暗处偏了半寸。", "你借高处看清钩链的弧线，鞋底没有踩碎脚下的玻璃。"],
        ["near", "risk", "踩{high}抢到墙头", "用一段噪声换出距离", "他听见了你蹬踏金属的声音。", "锈蚀的薄盖在脚下塌陷，你还是先把身体送上了墙头。"]
      ],
      [
        ["steady", "stealth", "把钩链节奏拖慢", "贴住墙根，不跟着他的链节跑", "钩镰在你身侧停了一下。", "你故意漏掉一个步点，墙后的铁链立刻失去准头。"],
        ["lure", "context", "推倒{bait}制造双声", "让回声从两个方向同时长出", "追兵停在岔口分辨声音。", "铁器滚过地面，另一头的脚步终于慢了半拍。"],
        ["hide", "stealth", "藏进{gap}听链节", "把呼吸压得比雨还轻", "钩链在遮挡外来回拖动。", "你躲进夹角，听见钩柄在石面上拖出第三道划痕。"],
        ["recon", "context", "借{gap}突然折返", "等他越过夹角再换方向", "你抢回了一小段侧路。", "他的链影刚扫过去，你便从遮挡后折回了原路。"]
      ],
      [
        ["steady", "quiet", "等钩链过肩再走", "不跟金属声抢同一拍", "钩镰扫空后收得更慢。", "你先让钩链从肩后掠过，才把脚从积水里拔出来。"],
        ["near", "risk", "抢{high}跨过收束", "借高度抢路，也把噪声交出去", "追兵开始沿你制造的声音收拢。", "你从高处跃下，落地的闷响把整条侧巷都震醒了。"],
        ["lure", "context", "反踢{bait}引他回钩", "让钩镰去追一件空物", "钩影被偏向了身后。", "你踢翻铁器后立刻反向贴墙，钩镰果然追着响声去了。"],
        ["recon", "context", "把钩柄卡进{gap}", "狭窄夹角会让长链失去两段距离", "钩链撞在墙边，短暂收不回去。", "你把身形贴近石角，钩柄撞出声响，链节终于乱了。"]
      ]
    ],
    hanxin: [
      [
        ["flank", "quiet", "贴墙逼他收枪", "把长枪的长度推回窄道", "枪影从你肩侧擦过。", "你贴着墙根走，枪尖只能被迫向内收。 "],
        ["cut", "risk", "冲直道抢半拍", "赌速度，也赌枪杆还没转正", "枪线从侧面压住了直道。", "你撞进直线，枪尖已经等在下一步的落点上。"],
        ["listen", "context", "听枪尾换向", "枪尾磕石的位置会暴露下一次突刺", "你听见枪杆在墙后滑了一下。", "枪尾轻敲石面，你从回声里提前听见了折返。"],
        ["hide", "stealth", "藏进{gap}等他越过", "不要在他正前方露头", "他越过遮挡时停了一瞬。", "你把身体压进夹角，枪杆贴着遮挡外侧滑过去。"]
      ],
      [
        ["flank", "quiet", "绕{quiet}切到枪杆内侧", "贴身会让长枪来不及回挑", "你绕进了他的枪杆里侧。", "石影吞掉你的肩线，枪尖转向时已经晚了一步。"],
        ["feint", "context", "故意在{bait}旁露头", "骗他先出枪，再从盲侧换路", "枪锋刺进你留下的空位。", "你把半边肩从遮挡后送出去，枪尖果然先撞上了铁器。"],
        ["listen", "context", "听枪尾换步", "用两次短停判断他的下一段直线", "枪尾换了第二处落点。", "你没有急着跑，只等枪杆第二次碰地才侧身。"],
        ["hide", "stealth", "借{gap}反折枪线", "让枪尖从最长距离变成最尴尬的距离", "长枪在夹角里撞上了石壁。", "你贴着夹角折返，枪杆被迫斜着才收得回来。"]
      ],
      [
        ["flank", "quiet", "沿{quiet}逆着他的直线跑", "不走他希望你看的那条路", "枪尖在远处停了半拍。", "你逆着枪线的方向切进暗处，脚步声没有跟上去。"],
        ["cut", "risk", "踩{high}逼枪杆转向", "借高度冲过刺击平面", "枪锋从下方追到你的鞋边。", "你踩上高处起跳，枪杆在身下扫出一道冷光。"],
        ["listen", "context", "停一拍听枪尾", "枪尾声重，下一步就会走直线", "枪杆在你身后猛然回挑。", "你听见重音便停住，枪尖从面前空刺过去。"],
        ["feint", "context", "拉倒{bait}遮断枪影", "让长兵器先被杂物拖住", "枪锋被遮挡拖慢了。", "铁器倒下的声音盖住脚步，你趁那一瞬穿了过去。"]
      ]
    ],
    shouyue: [
      [
        ["steady", "quiet", "贴{quiet}压低肩线", "让轮廓混进阴影里", "远处的红点从你头上滑过。", "你把肩线降到雨棚下，准星在墙上多停了一拍。"],
        ["lure", "context", "打翻{bait}碎掉准星", "用反光引走他的枪口", "枪声偏向了另一处亮点。", "铁器翻倒后的反光很亮，子弹先落在了那边。"],
        ["recon", "context", "盯反光跑弧线", "不要经过准星停留最久的地方", "你看见红点正在向左移。", "你借着碎玻璃的反光判断枪口，脚下始终不走直线。"],
        ["near", "risk", "借{gap}缩进射界", "贴近会让步枪失去长距离优势", "他已经开始后退保留射界。", "你贴着夹角压过去，枪口第一次被迫向下。" ]
      ],
      [
        ["steady", "stealth", "沿{quiet}走盲区", "让每一步都藏住身体边缘", "枪机声隔着墙传来。", "你的鞋底没有离开阴影，远处的准星只能慢慢扫过。"],
        ["lure", "context", "推{bait}挡住枪口", "让遮挡物替你吃掉第一枪", "枪声打在铁器边缘。", "遮挡物被撞翻，子弹从它后面擦出了一串火星。"],
        ["hide", "stealth", "贴地听枪机复位", "换弹的间隙才能抢距离", "第二声枪响还没落下。", "你数到枪机回弹，才从遮挡后换到下一个落脚点。"],
        ["recon", "context", "在{high}下折返", "用高处的阴影截断视线", "红点在远处短暂丢失目标。", "你从高处下方折返，枪口只能沿着空墙追过去。"]
      ],
      [
        ["steady", "quiet", "贴着阴影换步", "不给准星留下连续轮廓", "红点在你背后停了很久。", "你每走两步就换一次高度，准星始终慢半拍。"],
        ["lure", "context", "撞{bait}让枪口偏半寸", "用声音抢先占住他的判断", "远处的枪声终于落后了。", "铁器一响，你便贴着地面冲过去，枪口还在追回声。"],
        ["near", "risk", "从{high}直冲近身", "逼近射手的身体就是最好的掩体", "枪机已经来不及重新瞄准。", "你从高处落下，枪口的直线在最后一刻失去了意义。"],
        ["hide", "stealth", "钻{gap}的视线死角", "让枪口只能看见一堵墙", "他在出口前重新架枪。", "你钻进夹角，听见枪托撞墙，却找不到可以穿过去的线。"]
      ]
    ],
    zhugeliang: [
      [
        ["steady", "quiet", "踩水听回声推坐标", "用每一声回响判断他下一步", "你的回声替他暴露了一次位置。", "你只踩浅水，等他脚步的回声先撞上墙。"],
        ["lure", "context", "拨倒{bait}制造假坐标", "让他追一处并不存在的脚步", "他把目光转向了假目标。", "铁器滚开，长影却从另一个方向贴了过去。"],
        ["recon", "context", "登上{high}看封锁阵线", "先看清环境，再选最薄的一格", "你发现了一处没有影子的出口。", "高处视野把岔路收成几条清楚的线。"],
        ["near", "risk", "从{gap}斜切近身", "用最短的斜线破坏他的预判", "他收回长影，开始调整封锁。", "你没有沿直线跑，而是贴着夹角切进了他的计算之外。"]
      ],
      [
        ["steady", "quiet", "顺{quiet}的暗流走", "只让水声回答你的方向", "背后的长影停在原地。", "你贴着暗流换步，身后只剩雨声。"],
        ["lure", "context", "把{bait}推向反方向", "让错误坐标先替他做决定", "一道长影朝反方向压过去。", "铁器滚远，你的脚步却贴着墙根收回。"],
        ["hide", "stealth", "借{gap}藏住长影", "漂亮而显眼的羽冠必须离开光源", "羽冠的影子终于被遮挡切断。", "你把羽冠和肩线一起沉进夹角，远处只剩一片冷光。"],
        ["recon", "context", "故意留下湿脚印", "让他看见旧的你，再从新路离开", "他沿着脚印向前，却慢了一步。", "脚印拐进死角，你从另一侧迈了出去。"]
      ],
      [
        ["steady", "quiet", "反走他预判的下一格", "每一个选择都要迟半拍再落点", "长影在假出口前停住。", "你看着他的影子先动，才从相反方向迈步。"],
        ["near", "risk", "踩{high}破开包围", "用一次强硬位移打乱封锁", "他终于放弃远距离预判。", "你借高处突然下沉，落点砸进了原本封死的夹角。"],
        ["recon", "context", "折返绕过{door}", "先让他封门，再从封门后离开", "长影已经在门前立好。", "你只让他看见半个肩线，转身却奔向另一条侧路。"],
        ["hide", "stealth", "贴{door}卡断视线", "把最后一格留给门柱和黑暗", "铁门外的冷光被门柱切开。", "你贴在门柱后，衣摆与羽冠都停在投进来的那道窄光之外。"]
      ]
    ]
  };

  function routeText(value, sceneKey) {
    return value.replace(/\{(\w+)\}/g, function (match, key) {
      return (ROUTE_LEXICON[sceneKey] && ROUTE_LEXICON[sceneKey][key]) || match;
    });
  }

  function buildHeroRoutePacks(heroKey, sceneKey) {
    return HERO_ROUTE_PROFILES[heroKey].map(function (wave, waveIndex) {
      return wave.map(function (route) {
        const metrics = ROUTE_METRICS[route[0]];
        return Object.assign({}, metrics, {
          role: route[0],
          kind: route[1],
          label: routeText(route[2], sceneKey),
          sub: routeText(route[3], sceneKey),
          hint: routeText(route[4], sceneKey),
          text: [routeText(route[5], sceneKey)],
          progress: [metrics.progress[0] + waveIndex, metrics.progress[1] + waveIndex]
        });
      });
    });
  }

  const HERO_ROUTE_PACKS = {};
  Object.keys(HERO_ROUTE_PROFILES).forEach(function (heroKey) {
    Object.keys(ROUTE_LEXICON).forEach(function (sceneKey) {
      HERO_ROUTE_PACKS[sceneKey + ":" + heroKey] = buildHeroRoutePacks(heroKey, sceneKey);
    });
  });

  const STREET_MODE = {
    key: "street",
    id: "chase-baiqi",
    hash: "#chase-baiqi",
    recordKey: STREET_RECORD_KEY,
    recordLabel: "白起 · 积水街追逃档案",
    heroKey: "baiqi",
    heroName: "白起",
    eyebrow: "CHASE / 本人模式",
    brand: "雨夜追逃",
    statusLabel: "与白起的距离",
    startSeal: "01",
    startKicker: "STANDALONE / FLOODED STREET",
    startTitle: "积水街追逃",
    startText: "十回合长局，一条没有路灯尽头的旧街。每轮推进都被压低，路线会在四个地点反复收紧；最后能否逃出去，取决于你前面留下的噪声、体力和路线。",
    startNote: "四种结局：静默脱身、极限逃脱、出口拖回、途中处刑。完整镜头均为预生成，不在游玩时临时生图。",
    startNarration: "白起从雨幕深处走近。角冠、甲胄和双靴都映在积水里，他没有说话。",
    startHint: "先拉开距离，再决定往哪条巷子里钻。",
    controlsLabel: "当前街区可选行动",
    hideLabel: "垃圾桶内屏息",
    hideCopy: "臭味越来越重。按住不放，撑到脚步过去。",
    hideLeave: "忍不住了，推开盖子冲出去",
    outcomes: STREET_OUTCOMES,
    roleLabels: STREET_ROLE_LABELS,
    actionRoles: STREET_ACTION_ROLES
  };

  const CASTLE_MODE = {
    key: "castle",
    id: "chase-castle-hanxin",
    hash: "#chase-castle-hanxin",
    recordKey: CASTLE_RECORD_KEY,
    recordLabel: "韩信 · 古堡追逃档案",
    heroKey: "hanxin",
    heroName: "韩信",
    eyebrow: "CHASE / 本人模式 · 古堡",
    brand: "古堡追逃",
    statusLabel: "与韩信的距离",
    startSeal: "02",
    startKicker: "STANDALONE / CASTLE UNDERCROFT",
    startTitle: "古堡追逃",
    startText: "门厅、拱窗长廊、地下蓄水间、城门闸室。韩信会从侧廊包抄，长枪会封死笔直的正道；你的噪声越高，他换路截击得越快。",
    startNote: "侧廊包抄能绕开枪线，贴墙听声可提前判断换路。古堡环境与韩信遭遇镜头均为预生成素材，并随模式优先预载。",
    startNarration: "韩信站在古堡门厅尽头，枪尾轻敲石板。拱窗外的冷光只照亮枪尖，没有照亮退路。",
    startHint: "不要沿中庭直线跑。借侧廊和石柱切断他的枪线。",
    controlsLabel: "当前古堡区域可选行动",
    hideLabel: "壁龛与帷幔间屏息",
    hideCopy: "冷灰贴着喉咙。按住不放，等枪尾敲击声从藏身处旁走过去。",
    hideLeave: "不再等，撞开遮挡冲出去",
    outcomes: CASTLE_OUTCOMES,
    roleLabels: CASTLE_ROLE_LABELS,
    actionRoles: CASTLE_ACTION_ROLES
  };

  let CHASE_MODE = STREET_MODE;
  let CHASE_RECORD_KEY = CHASE_MODE.recordKey;
  let OUTCOMES = CHASE_MODE.outcomes;
  let ROLE_LABELS = CHASE_MODE.roleLabels;
  let ACTION_ROLES = CHASE_MODE.actionRoles;
  let SCENES = [];
  let STAGE_ACTIONS = {};
  let SCENE_WATCHES = {};

  const overlay = $("chaseOverlay");
  const selectOverlay = $("selectOverlay");
  const visual = $("cmVisual");
  const shot = $("cmShot");
  const shotImage = $("cmShotImg");
  const shotTag = $("cmShotTag");
  const controls = $("cmControls");
  const sceneName = $("cmSceneName");
  const hotspot = $("cmHotspot");
  const hotspotLabel = $("cmHotspotLabel");
  const interact = $("cmInteract");
  const hidePanel = $("cmHidePanel");
  const holdButton = $("cmHold");
  const againButton = $("cmAgain");
  const startButton = $("cmStart");
  const entryButton = $("btnChaseMode");
  const exitButton = $("cmExit");
  const backButton = $("cmBackSelect");
  const leaveHideButton = $("cmLeaveHide");
  const picker = $("cmPicker");
  const pickerClose = $("cmPickClose");
  const pickerStart = $("cmPickStart");
  const loadout = $("cmLoadout");
  const loadoutBack = $("cmLoadoutBack");
  const loadoutGrid = $("cmLoadoutGrid");
  const loadoutSummary = $("cmLoadoutSummary");
  const loadoutStart = $("cmLoadoutStart");
  const itemHud = $("cmItemHud");
  const itemHudList = $("cmItemHudList");
  const itemEvent = $("cmItemEvent");
  const itemEventKicker = $("cmItemEventKicker");
  const itemEventTitle = $("cmItemEventTitle");
  const itemEventCopy = $("cmItemEventCopy");
  const itemEventEffect = $("cmItemEventEffect");
  const itemEventContinue = $("cmItemEventContinue");
  const comboTitle = $("cmComboTitle");
  const comboRule = $("cmComboRule");
  const comboRecord = $("cmComboRecord");
  const comboArt = $("cmComboArt");
  const comboIntro = $("cmComboIntro");
  const selection = {
    hero: "baiqi",
    scene: "street"
  };
  const loadoutSelection = [];
  let activeLoadout = [];
  let pendingItemEvent = null;

  if (!overlay || !selectOverlay) return;

  const state = {
    turn: 1,
    distance: 9,
    noise: 20,
    stamina: 100,
    progress: 0,
    bestDistance: 9,
    active: false,
    hidden: false,
    holdCompleted: false,
    hiddenSceneId: "",
    hotspotsUsed: {},
    phaseId: "entry",
    renderedPhaseId: "",
    ended: false,
    executing: false,
    interactPhaseId: "",
    watchSeen: {},
    watchTimer: 0,
    holdFrame: 0,
    holdLast: 0,
    peakNoise: 20,
    minStamina: 100,
    routeLog: [],
    actionsUsed: {},
    branchDepth: 0,
    branchWave: 0,
    currentActions: {},
    lastBranchRole: "",
    hideCount: 0,
    slipCount: 0,
    finalGambit: false,
    outcome: "",
    recordSaved: false,
    itemLoadout: [],
    itemUsed: {},
    itemEventOpen: false,
    itemAutoQueue: [],
    itemAutoTimer: 0,
    traceTurns: 0,
    sealTurns: 0,
    mode: CHASE_MODE.id,
    heroKey: CHASE_MODE.heroKey,
    sceneKey: CHASE_MODE.key
  };

  const STREET_SCENES = [
    {
      id: "entry",
      min: 0,
      max: 24.999,
      name: "旧街入口",
      visual: "phase-1",
      hide: {
        title: "钻进入口旁的垃圾桶",
        copy: "桶盖内壁黏着一层发臭的黑水，白起的靴声却已经绕到墙边。",
        hint: "按住不放，撑到那双靴子从桶边走过去。"
      },
      hotspot: {
        x: "79%",
        y: "45%",
        label: "路灯电闸",
        title: "拉下路灯电闸",
        text: "老旧电闸就在卷帘门旁。拉下来，整段街会陷进黑里，但你也更难看清白起。",
        gain: "凭黑暗甩开约 1.6 m",
        risk: "会消耗一回合，白起仍可能听见闸刀的响动",
        effects: { progress: 9, distance: 1.6, noise: 2, stamina: -2 },
        success: "闸刀落下，整条街一下黑了。白起停在原地，你借这段黑摸出了十几米。",
        hint: "黑暗帮了你，也让你更难判断他的位置。",
        note: "黑暗暂时压住了白起的视线。"
      },
      actions: {
        advance: { label: "沿墙摸过去", sub: "稳妥推进 · 尽量不踩积水", kind: "quiet" },
        sprint: { label: "冲过报刊亭", sub: "推进最快 · 噪声和体力代价高", kind: "risk" },
        look: { label: "探头看街口", sub: "确认白起位置 · 会耽搁", kind: "" },
        cover: { label: "翻到旧车后面", sub: "利用车身遮挡 · 推进较慢", kind: "context" }
      }
    },
    {
      id: "flooded",
      min: 25,
      max: 49.999,
      name: "积水街心",
      visual: "phase-2",
      hide: {
        title: "钻到废车底盘下",
        copy: "你贴着湿冷的路面滑进车底。污水和机油混在一起，白起的脚步停在车门外。",
        hint: "别让呼吸撞到车底。噪声条满之前必须松开。"
      },
      hotspot: {
        x: "17%",
        y: "61%",
        label: "废车门",
        title: "拉开废车门挡路",
        text: "车门半挂在铰链上。推出去能短暂堵住窄巷，但金属摩擦声也会传得很远。",
        gain: "拉开约 2.2 m 距离",
        risk: "噪声明显上升，白起会记住这条巷子"
      },
      actions: {
        advance: { label: "绕过深水", sub: "减少水声 · 推进稳定", kind: "quiet" },
        sprint: { label: "踏水狂奔", sub: "推进最多 · 会留下巨大水声", kind: "risk" },
        hide: { label: "钻到废车底", sub: "进入屏息 · 利用污水掩护", kind: "stealth" },
        look: { label: "回头看车灯", sub: "判断追兵距离 · 耽误时间", kind: "" }
      }
    },
    {
      id: "gate",
      min: 50,
      max: 74.999,
      name: "铁门窄巷",
      visual: "phase-3",
      hide: {
        title: "缩进铁门凹槽",
        copy: "铁门的阴影刚够遮住一个人。门外有人经过，白起的钩镰擦着墙面响。",
        hint: "屏住呼吸。这里没有垃圾桶的臭味掩护，任何喘息都很清楚。"
      },
      hotspot: {
        x: "82%",
        y: "52%",
        label: "铁门门闩",
        title: "抬起生锈门闩",
        text: "门闩已经锈死。抬开它会多出一条路，也会把铁门撞响，逼白起立刻追进来。",
        gain: "打开近路，推进约 12 米",
        risk: "噪声大幅上升，并消耗体力",
        effects: { progress: 12, distance: 1.2, noise: 18, stamina: -8 },
        success: "生锈门闩被硬生生抬起，铁门撞墙的声音冲进巷子。你抢在白起前面钻了过去。",
        hint: "近路已经打开，但整条街都听见了。",
        note: "铁门回响换来了近路，也暴露了方向。"
      },
      actions: {
        advance: { label: "贴着铁门走", sub: "借助阴影推进 · 速度一般", kind: "quiet" },
        sprint: { label: "抢在门闭合前冲", sub: "推进更快 · 噪声很重", kind: "risk" },
        cover: { label: "翻过堆货箱", sub: "走高处绕行 · 消耗体力", kind: "context" },
        look: { label: "听门后的脚步", sub: "判断白起方向 · 会停滞", kind: "" }
      }
    },
    {
      id: "finish",
      min: 75,
      max: 100,
      name: "出口铁门",
      visual: "phase-4",
      hotspot: {
        x: "50%",
        y: "43%",
        label: "出口铁闸",
        title: "撞开出口铁闸",
        text: "铁闸只差一道锁。撞开它就能离开旧街，但白起也会知道你已经到了出口。",
        gain: "直接推进约 18 米",
        risk: "发出巨响并主动缩短追兵距离",
        effects: { progress: 18, distance: 2.5, noise: 10, stamina: -6 },
        success: "你撞开出口铁闸。门轴炸出一声尖响，外面的风一下灌进来。",
        hint: "出口就在前面，白起也已经知道你到了这里。",
        note: "出口已经打开，但也把追兵引到最后一截路。"
      },
      actions: {
        advance: { label: "压住脚步冲向出口", sub: "最后一段路 · 稳步推进", kind: "quiet" },
        sprint: { label: "最后冲刺", sub: "抢时间 · 体力与噪声见底", kind: "risk" },
        look: { label: "回头确认", sub: "看清还有多少距离 · 会停一步", kind: "" }
      }
    }
  ];

  const CASTLE_SCENES = [
    {
      id: "entry",
      min: 0,
      max: 24.999,
      name: "古堡门厅",
      visual: "phase-1",
      hide: {
        title: "缩进壁龛",
        copy: "壁龛里全是冷灰和旧甲片。门厅另一端，枪尾开始有节奏地敲击石板。",
        hint: "别和他的敲击同拍呼吸；撑到那串声音拐进侧廊。",
        success: "枪尾声停了一拍。韩信从壁龛前走过，枪尖在湿石上拖出一道细线。",
        fail: "石缝里的呼吸响了。门厅尽头那串枪尾声，突然停在你面前。"
      },
      hotspot: {
        x: "82%",
        y: "42%",
        label: "吊灯绞盘",
        title: "放下半截铁链",
        text: "铁链连着门厅侧门的配重。松开会造出一条窄缝，也会让整座门厅听见。",
        gain: "打开侧门，推进约 10 m",
        risk: "韩信的枪会立刻转向锁链落点",
        effects: { progress: 10, distance: 1.4, noise: 15, stamina: -4 },
        success: "绞盘脱扣，铁链砸进门厅回声里。侧门刚够一人通过，远处的枪尖已经转过来。",
        hint: "侧门比中庭快，但这条响动也会替你标出一条直线。"
      },
      actions: {
        sideHall: { label: "贴侧廊绕进门厅", sub: "避开中庭枪线 · 保持安静", kind: "quiet" },
        greatHall: { label: "抢中庭直线", sub: "推进最快 · 暴露在枪锋下", kind: "risk" },
        listenAtDoor: { label: "听枪尾敲地", sub: "判断换路方向 · 放慢脚步", kind: "context" },
        alcove: { label: "缩进壁龛", sub: "藏住呼吸 · 让他先走过去", kind: "stealth" }
      }
    },
    {
      id: "gallery",
      min: 25,
      max: 49.999,
      name: "拱窗长廊",
      visual: "phase-2",
      hide: {
        title: "藏到破帷幔后",
        copy: "帷幔贴着石柱垂下，风从破拱窗灌进来。韩信的枪尖挑开第一扇窗，玻璃碎了一地。",
        hint: "按住呼吸，等枪尖从帷幔边缘慢慢移过去。",
        success: "枪尖挑过帷幔后又收了回去。韩信沿着窗格投下的长影，走向另一端。",
        fail: "帷幔被风掀起。你听见枪杆擦过石柱，随后那道影子停在原地。"
      },
      hotspot: {
        x: "20%",
        y: "55%",
        label: "破拱窗",
        title: "推倒裂开的窗框",
        text: "碎裂声能把韩信引去窗边，侧廊却会被横梁堵住一半。",
        gain: "拉开约 2.8 m，并从内侧绕过拱窗",
        risk: "噪声大幅上升，枪线会重新对准长廊",
        effects: { progress: 8, distance: 2.8, noise: 24, stamina: -7 },
        success: "窗框塌进雨里。韩信转向碎玻璃的声响，你贴着内侧拱墙绕了过去。",
        hint: "声音引开了他，但下一次走直线一定会被追上。"
      },
      actions: {
        serviceGallery: { label: "沿拱窗内侧包抄", sub: "绕开枪尖轨迹 · 消耗体力", kind: "quiet" },
        crossGallery: { label: "冲过拱窗正道", sub: "长枪最爱封住这条直线", kind: "risk" },
        spearPivot: { label: "借石柱切断枪线", sub: "压低噪声 · 让枪尖擦柱而过", kind: "context" },
        curtain: { label: "藏到破帷幔后", sub: "逆向借风 · 等他走过长影", kind: "stealth" }
      }
    },
    {
      id: "undercroft",
      min: 50,
      max: 74.999,
      name: "地下蓄水间",
      visual: "phase-3",
      hide: {
        title: "缩进排水拱洞",
        copy: "拱洞里只有滴水声。你踩在湿砖上，外面的枪尖正沿着铁栅慢慢划过来。",
        hint: "枪尖会停在拱洞口，别被铁栅的回声骗着提前出来。",
        success: "枪尖在铁栅外划过去。韩信没有进拱洞，只把一截水痕留在出口。",
        fail: "湿砖一响，铁栅外的脚步立刻停住。洞口只剩枪尖反射的冷光。"
      },
      hotspot: {
        x: "76%",
        y: "58%",
        label: "旧铁栅",
        title: "撬松蓄水铁栅",
        text: "铁栅后有一条贴近侧墙的排水沟，能把中央石阶上的枪线绕开。",
        gain: "打开侧沟，推进约 14 m",
        risk: "铁栅落水会暴露位置并消耗体力",
        effects: { progress: 14, distance: 1.7, noise: 19, stamina: -11 },
        success: "铁栅倒进黑水。你从侧沟钻进蓄水间后半段，韩信还在门外的干石阶上找声音。",
        hint: "侧沟比中央石阶更慢，却能绕开那一枪的直线。"
      },
      actions: {
        cellarGutter: { label: "涉水走铁栅侧道", sub: "侧廊续接 · 湿石会拖慢脚步", kind: "quiet" },
        chainStairs: { label: "抢中央石阶", sub: "一路直线 · 正对韩信长枪", kind: "risk" },
        throwCrucible: { label: "掷铁片引开枪锋", sub: "制造假换路 · 噪声很高", kind: "context" },
        culvert: { label: "缩进排水拱洞", sub: "贴着湿砖 · 等枪尖划过去", kind: "stealth" }
      }
    },
    {
      id: "finish",
      min: 75,
      max: 100,
      name: "城门闸室",
      visual: "phase-4",
      hotspot: {
        x: "52%",
        y: "44%",
        label: "外门铁环",
        title: "拽下外门铁环",
        text: "铁环连着最后一道闸链。拉开能冲进雨里，也会把整间闸室震出回声。",
        gain: "打穿外门，推进约 20 m",
        risk: "枪尖会从闸链另一侧直接截来",
        effects: { progress: 20, distance: 2.2, noise: 21, stamina: -10 },
        success: "铁环被拽脱，外门在雨声里裂开。你钻过闸链，韩信的枪尖紧贴着门框追来。",
        hint: "最后一段别贪直线。侧门和听声都能把枪锋骗偏。"
      },
      actions: {
        postern: { label: "穿侧门抄到闸后", sub: "不走门洞直线 · 多耗体力", kind: "quiet" },
        gateChain: { label: "借铁环破开闸链", sub: "最直接的出口 · 枪尖正等在那里", kind: "risk" },
        stillAtGate: { label: "贴住闸门听枪声", sub: "稳住呼吸 · 判断最后一次换路", kind: "context" }
      }
    }
  ];

  const SCENE_LINES = {
    entry: {
      advance: ["你沿着卷帘门往前挪。铁皮吸收了脚步，白起还在街口听雨。"],
      sprint: ["你从报刊亭旁冲过去。塑料棚被撞得乱响，白起立刻抬头。"],
      look: ["你探头看了一眼。白起仍站在旧街入口，钩镰贴着腿侧，没有急着追。"],
      cover: ["你翻到旧车后，借车身遮住半截身影。推进不快，但水声被压了下去。"]
    },
    flooded: {
      advance: ["你贴着墙绕过最深的一滩水。脚步虽慢，白起没有立刻锁定方向。"],
      sprint: ["你直接踏进深水。每一步都炸起水花，身后的靴声突然加速。"],
      look: ["你回头看车灯。白起正从两辆车之间穿过来，离你比刚才更近。"],
      hide: ["你滑进废车底盘。污水和机油味堵住呼吸，外面的靴声停在车门旁。"]
    },
    gate: {
      advance: ["你贴着铁门阴影往前。门后有脚步来回走，但还没有人发现你。"],
      sprint: ["你抢在铁门合拢前冲过去。门轴尖叫，白起的方向立刻转向这边。"],
      look: ["你停下听门后的脚步。白起离得更近了，钩镰偶尔擦过墙。"],
      cover: ["你翻过堆在墙边的货箱。落地不算轻，但换来了一条更高的近路。"]
    },
    finish: {
      advance: ["你压低脚步走完最后一段湿路。出口铁闸已经在眼前。"],
      sprint: ["你朝出口做最后冲刺。雨声、水声和呼吸全混在一起。"],
      look: ["你只回头看一眼。白起仍在对街追来，没有停下。"],
    }
  };

  const lines = {
    advance: [
      "你贴着湿冷的墙根往前挪。白起停在原地听了两秒，靴尖转向了另一条岔路。",
      "碎玻璃在鞋底下发涩，他没有立刻追来。前面的巷口又近了一点。",
      "你绕过停着的车，积水映出那道青色身影。他看得见你，但暂时还没提速。"
    ],
    sprint: [
      "你冲过一盏路灯。水花炸开，身后的脚步突然变得又快又重。",
      "旧鞋踩上湿路，声响太明显。白起抬起头，角冠下的目光直接钉在你背上。",
      "你撞开一只空垃圾桶，甩出一段距离。回头时，他已经跨过你刚才的位置。"
    ],
    look: [
      "你只回了一次头。白起正从雨幕里穿过，双靴踏水，没有半分犹豫。",
      "他离得更近了，脚步却始终不变。你意识到自己耽误不起第二次回头。"
    ],
    lure: [
      "铁桶滚过街面，撞上另一侧卷帘门。白起停了半步，随即转向声音传来的方向。",
      "假响把巷口短暂让了出来，但他已经记住这声音是从你脚边发出的。"
    ],
    hide: [
      "你掀开垃圾桶钻进去。腐臭味一下堵住喉咙，外面只剩越来越近的靴声。",
      "白起从桶边走过。你按住盖子，连牙齿都不敢碰出声音。"
    ],
    caught: [
      "靴尖在水洼前停住。你还没来得及转身，冰冷的甲手已经从背后压住肩膀。",
      "白起没有问你去哪。他只把你从雨里拖出来，像处置一件已经记账的东西。"
    ]
  };

  // Each street uses its own set of actions. The keys intentionally do not
  // repeat across stages: changing the route changes the available tactics.
  const STREET_STAGE_ACTIONS = {
    entry: {
      shutter: {
        label: "贴着卷帘门摸过去",
        sub: "安静推进 · 慢，但不在主街露头",
        kind: "quiet",
        progress: [15, 19],
        distance: .8,
        noise: 1,
        stamina: 1,
        text: [
          "你沿着卷帘门一点点挪。铁皮吃掉了鞋底的响声，白起仍在街口听雨。",
          "卷帘门的阴影遮住半截身影。你没有抢到太多路，却避开了水最深的地方。"
        ],
        hint: "这是入口最稳的走法，但不会像制造路障那样一下拉开距离。"
      },
      kiosk: {
        label: "推倒报刊亭挡街",
        sub: "制造路障 · 巨响换一段安全距离",
        kind: "risk",
        progress: [21, 25],
        distance: 2.2,
        noise: 16,
        stamina: -8,
        shake: true,
        text: [
          "你把报刊亭连着一排铁架推倒。杂物横在街心，白起被迫绕开，靴声一下被甩远。",
          "报刊亭轰然倒地，碎纸被雨卷起来。白起停步拆开障碍，你趁机钻进下一段街。"
        ],
        hint: "障碍确实拦住了他，但整条旧街都听见了这次倒塌。"
      },
      hood: {
        label: "踩上旧车引擎盖观察",
        sub: "越过遮挡看清路线 · 会暴露一瞬",
        kind: "context",
        progress: [11, 14],
        distance: .4,
        noise: 7,
        stamina: -5,
        text: [
          "你踩上旧车引擎盖，越过报刊亭看清了积水缺口。落地时车身一沉，白起果然抬头。",
          "车顶给了你一小段视野。你找到更浅的路，却也让那道青色身影确认了你的方向。"
        ],
        hint: "你换到了信息优势，代价是让他短暂看见你。"
      },
      alley: {
        label: "退进岔巷绕路",
        sub: "放弃直线 · 绕开主街视野",
        kind: "",
        progress: [13, 16],
        distance: 1.7,
        noise: 2,
        stamina: -4,
        text: [
          "你退回岔巷，从一排关门的铺面后绕向积水街心。白起没有立刻跟上。",
          "主街留下了一串假脚步。你从岔巷穿出去时，白起还在报刊亭旁停着。"
        ],
        hint: "路线更长，但你彻底离开了他的正面视野。"
      }
    },
    flooded: {
      plank: {
        label: "踩着漂浮木板过水",
        sub: "平衡路线 · 噪声过高会踩翻",
        kind: "quiet",
        progress: [22, 26],
        distance: 1.6,
        noise: 7,
        stamina: -7,
        slipAt: 62,
        text: [
          "你踩着漂在水面的木板一步步过去。木板没有翻，深水声被压在脚下。",
          "木板在鞋底打滑，你及时把重心压回去。前进不算快，但没让他立刻锁定。"
        ],
        slipText: [
          "木板被浊水掀翻。你半条腿砸进深水，水声一下炸开，白起立刻转向。",
          "脚底的木板滑开，你跪进污水里。爬起时，那双靴子已经逼近很多。"
        ],
        slipHint: "噪声已经太高，浮板成了最容易被听见的选择。",
        hint: "噪声越高，踩浮板越容易失足。"
      },
      wreck: {
        label: "翻过废车抄近路",
        sub: "跨过车顶抢进度 · 落地声很重",
        kind: "risk",
        progress: [24, 28],
        distance: 1.1,
        noise: 18,
        stamina: -14,
        shake: true,
        text: [
          "你踩着废车保险杠翻上车顶，从另一侧跳进浅水。落地声砸开整条街的回音，白起立刻抬头。",
          "废车车顶替你越过最深的积水。你抢到一段近路，却把落脚的震动留给了他。"
        ],
        hint: "这条路推进最快，但高噪声会让下一次隐蔽和最后冲刺更难。"
      },
      undercar: {
        label: "钻到废车底盘下屏息",
        sub: "进入屏息 · 让他在车门外停步",
        kind: "stealth",
        hide: true
      },
      stir: {
        label: "搅动污水引开视线",
        sub: "制造假水声 · 骗他转向另一条巷",
        kind: "context",
        progress: [8, 11],
        distance: 2.5,
        noise: 24,
        stamina: -6,
        pulse: true,
        text: [
          "你踢起一片水花，随后贴着墙滑进阴影。白起朝假响的方向迈了一步。",
          "漂浮物被污水推远。白起追着水声走向侧巷，你借机穿过车灯下方。"
        ],
        hint: "假响能骗他一次，也会把你的噪声推得很高。"
      }
    },
    gate: {
      crates: {
        label: "踩货箱翻过铁门",
        sub: "高处路线 · 消耗大量体力",
        kind: "context",
        progress: [27, 31],
        distance: 1.9,
        noise: 10,
        stamina: -18,
        minStamina: 18,
        text: [
          "你踩着货箱翻上铁门。手掌被锈边割开，但落地已经是在巷子的另一侧。",
          "货箱在脚下晃了一下。你死死抓住门沿翻过去，落地时白起还在门后。"
        ],
        hint: "换路最快，代价是把体力留在铁门边。"
      },
      squeeze: {
        label: "侧身挤过门缝",
        sub: "狭窄近路 · 慢，但几乎没有回声",
        kind: "quiet",
        progress: [21, 24],
        distance: 1.3,
        noise: 3,
        stamina: -10,
        text: [
          "你侧过肩膀挤进铁门缝。锈铁擦过衣料，声音却始终没传到门外。",
          "门缝只够半个人通过。你压着呼吸挪过去，白起的脚步从另一侧掠过。"
        ],
        hint: "推进稳定且安静，但必须把身体卡进狭窄门缝。"
      },
      pipe: {
        label: "敲铁管引他回头",
        sub: "声东击西 · 让追兵先选错方向",
        kind: "risk",
        progress: [12, 15],
        distance: 2.7,
        noise: 18,
        stamina: -5,
        pulse: true,
        text: [
          "你敲响墙后的铁管，随后闪进堆货箱背面。白起朝反方向停了一下。",
          "回声在窄巷里绕了两圈。白起先去检查那扇门，你趁机穿过他背后。"
        ],
        hint: "这次推进不多，但让他多走了一段错路。"
      },
      recess: {
        label: "缩进门洞藏住呼吸",
        sub: "进入屏息 · 阴影比垃圾桶更薄",
        kind: "stealth",
        hide: true
      }
    },
    finish: {
      block: {
        label: "拖货箱卡死铁闸",
        sub: "封门断追 · 噪声和体力都很重",
        kind: "risk",
        progress: [9, 12],
        distance: 3.5,
        noise: 18,
        stamina: -14,
        minStamina: 16,
        shake: true,
        text: [
          "你把货箱拖进铁闸轨道。铁闸合到一半就被卡死，白起被困在门后。",
          "货箱撞进导轨，整扇门发出刺耳巨响。追路被堵住，你终于和那道青色身影隔开。"
        ],
        hint: "最直接的断后手段，但会把体力耗在出口门口。"
      },
      wall: {
        label: "翻过出口侧墙",
        sub: "绕开正门 · 抢时间但耗体力",
        kind: "context",
        progress: [19, 23],
        distance: 1.4,
        noise: 7,
        stamina: -22,
        minStamina: 22,
        text: [
          "你踩住墙边排水管翻上侧墙。脚下打滑，还是抓住了墙头。",
          "你从侧墙滚落，出口的灯一下照到脸上。身后传来白起加速的脚步。"
        ],
        hint: "比正面冲刺安静，但翻墙会立刻吃掉大量体力。"
      },
      breathe: {
        label: "背靠门后缓一口气",
        sub: "不出门 · 降噪回体力，但会停一回合",
        kind: "quiet",
        progress: [0, 0],
        distance: -.55,
        noise: -24,
        stamina: 18,
        text: [
          "你背靠铁闸压低呼吸。雨声重新盖住脚步，发抖的手终于稳下来。",
          "你停在门后数了两口气。噪声被雨吞掉，白起的靴声没有继续靠近。"
        ],
        hint: "这是唯一能恢复体力的选择，但你必须在门口多停一轮。"
      }
    }
  };

  // 古堡的每一步都围绕韩信的长枪：侧廊绕线、正道受截、听声提速。
  const CASTLE_STAGE_ACTIONS = {
    entry: {
      sideHall: {
        label: "贴侧廊绕开门厅",
        sub: "避开中庭枪线 · 保持安静",
        kind: "quiet",
        progress: [14, 17],
        distance: 1.1,
        noise: 1,
        stamina: -3,
        text: [
          "你贴着门厅侧墙挪动。石柱一截截挡住中庭，韩信的枪尖始终没有找到直线。",
          "侧廊比正门窄，却避开了枪锋正对的位置。枪尾敲石声从你身后移向中庭。"
        ],
        hint: "侧廊是古堡里最稳的换路线。"
      },
      greatHall: {
        label: "抢中庭直线",
        sub: "推进最快 · 正对长枪截线",
        kind: "risk",
        progress: [22, 25],
        distance: 1.8,
        noise: 16,
        stamina: -14,
        spearLine: true,
        shake: true,
        text: [
          "你踏上门厅中轴，枪尖立刻从远处压低。你抢到一截直线，却把整个人交给那条枪线。",
          "中庭的地砖没有遮挡。韩信向前半步，枪锋顺着你的路线贴过来。"
        ],
        hint: "正路最快，但韩信的枪永远先封直线。"
      },
      listenAtDoor: {
        label: "贴门听枪尾敲地",
        sub: "判断下一次换路 · 放慢脚步",
        kind: "context",
        progress: [8, 10],
        distance: 1.4,
        noise: 2,
        stamina: -2,
        text: [
          "你停在内门边听枪尾敲地。韩信先向左走了一步，随后折向侧廊。",
          "枪尾三短一长。你没有抢路，却听出他准备从门厅另一侧包过来。"
        ],
        hint: "提前换路能让他多绕一截，但会耽误出口进度。"
      },
      alcove: {
        label: "缩进石壁龛",
        sub: "进入屏息 · 等枪尾声走过",
        kind: "stealth",
        hide: true
      }
    },
    gallery: {
      serviceGallery: {
        label: "沿拱窗内侧包抄",
        sub: "借石柱绕开枪线 · 消耗体力",
        kind: "quiet",
        progress: [18, 21],
        distance: 1.6,
        noise: 3,
        stamina: -8,
        text: [
          "你从拱窗内侧贴着石柱包抄。韩信的枪尖从外侧窗框掠过，没有拐进内廊。",
          "长廊被拱窗切成一格格冷光。你始终走在石柱背面，让直线枪锋失去目标。"
        ],
        hint: "侧廊会多耗体力，却能持续切断长枪直线。"
      },
      crossGallery: {
        label: "冲过拱窗正道",
        sub: "最快穿过长廊 · 枪尖正对这里",
        kind: "risk",
        progress: [25, 28],
        distance: 1.2,
        noise: 20,
        stamina: -12,
        spearLine: true,
        text: [
          "你沿拱窗正中的长影冲出去。枪尖几乎同时压到地面，逼得你改步。",
          "石柱从两侧退开，长廊只剩一条笔直的路。韩信要截你，不需要猜。"
        ],
        hint: "长廊正路最能推进，也最容易吃满一次枪线截击。"
      },
      spearPivot: {
        label: "借石柱切断枪线",
        sub: "贴着石柱换步 · 噪声较低",
        kind: "context",
        progress: [12, 15],
        distance: 2.2,
        noise: 5,
        stamina: -4,
        text: [
          "你在两根石柱之间突然换步。枪尖擦过柱面，韩信的追击方向慢了半拍。",
          "石屑从柱边落下。你借这一下停顿钻进长廊内侧，把自己从他枪锋的直线上摘出去。"
        ],
        hint: "换步不会推进太多，但能让枪线落空。"
      },
      curtain: {
        label: "藏到破帷幔后",
        sub: "进入屏息 · 等他沿窗影走过",
        kind: "stealth",
        hide: true
      }
    },
    undercroft: {
      cellarGutter: {
        label: "涉水走铁栅侧道",
        sub: "侧廊续接 · 湿石拖慢脚步",
        kind: "quiet",
        progress: [19, 22],
        distance: 1.7,
        noise: 4,
        stamina: -11,
        text: [
          "你踏进铁栅侧沟，冷水平过脚踝。中央石阶上的枪尖始终追不到侧墙后面。",
          "排水沟贴着蓄水间外沿。你走得慢，却让韩信只能沿干石阶猜你的换路。"
        ],
        hint: "侧沟更耗体力，但能绕开中央石阶的枪线。"
      },
      chainStairs: {
        label: "抢中央石阶",
        sub: "一路直线 · 正对长枪",
        kind: "risk",
        progress: [25, 29],
        distance: 1.2,
        noise: 22,
        stamina: -16,
        spearLine: true,
        shake: true,
        text: [
          "你冲上中央石阶。枪杆撞在铁链上，回声顺着台阶一路追到脚后。",
          "湿石阶没有侧墙可借。韩信守住中轴，枪尖逼你越跑越偏。"
        ],
        hint: "中央石阶推进最快，但长枪能把整段台阶封成一条线。"
      },
      throwCrucible: {
        label: "掷铁片引开枪锋",
        sub: "制造假换路 · 噪声很高",
        kind: "context",
        progress: [10, 13],
        distance: 2.9,
        noise: 25,
        stamina: -6,
        pulse: true,
        text: [
          "铁片砸进另一侧的蓄水池。韩信转向水声，枪尖短暂离开了石阶。",
          "你用铁片骗出一次换路。回声在拱顶下反复折返，也把你的噪声推得更高。"
        ],
        hint: "假响能立刻拉开距离，但韩信随后换路会更快。"
      },
      culvert: {
        label: "缩进排水拱洞",
        sub: "贴着湿砖 · 等枪尖划过去",
        kind: "stealth",
        hide: true
      }
    },
    finish: {
      postern: {
        label: "穿侧门抄到闸后",
        sub: "不走门洞直线 · 多耗体力",
        kind: "quiet",
        progress: [17, 20],
        distance: 1.4,
        noise: 4,
        stamina: -18,
        text: [
          "你从闸室侧门绕到铁链背后。韩信的枪尖仍守在正门中央。",
          "侧门窄得只能侧身通过。你挤过去时，正门那边传来一次落空的枪响。"
        ],
        hint: "侧门绕开最后一条枪线，但会吃满体力。"
      },
      gateChain: {
        label: "借铁环破开闸链",
        sub: "最直接的出口 · 枪尖正等在那里",
        kind: "risk",
        progress: [25, 28],
        distance: 1.5,
        noise: 22,
        stamina: -14,
        spearLine: true,
        shake: true,
        text: [
          "铁环砸开闸链。外门刚露出缝隙，枪尖已经从门洞正中压来。",
          "你拽断最后一道链节。出口就在面前，韩信也终于等到你走直线。"
        ],
        hint: "门洞直线最快，也最容易被最后一段枪锋截住。"
      },
      stillAtGate: {
        label: "贴住闸门听枪声",
        sub: "稳住呼吸 · 判断最后一次换路",
        kind: "context",
        progress: [0, 0],
        distance: -.35,
        noise: -18,
        stamina: 12,
        text: [
          "你背贴闸门，等枪尾声越过侧廊。噪声落下去，门后的脚步也跟着放慢。",
          "你停在闸前数完一串敲击。韩信转向另一侧，门口短暂空出一条侧线。"
        ],
        hint: "停一步能恢复体力并压低噪声，也会让追兵接近。"
      }
    }
  };

  const WAREHOUSE_SCENES = [
    {
      id: "entry",
      min: 0,
      max: 24.999,
      name: "装卸平台",
      visual: "phase-1",
      hide: {
        title: "缩进托盘货垛后",
        copy: "木托盘和废纸箱留出一道窄缝。装卸口的风吹动塑料膜，外面的靴声停得很近。",
        hint: "按住屏息，别让薄塑料膜贴着肩膀发出声音。",
        success: "脚步声沿托盘外侧走过去。塑料膜还在响，但没有人掀开货垛。",
        fail: "塑料膜被你的呼吸顶响。装卸平台外的脚步立刻停下。"
      },
      hotspot: {
        x: "78%",
        y: "50%",
        label: "卷帘门配重链",
        title: "扯松卷帘门配重链",
        text: "铁链连着半开的卷帘门。扯松它能让侧边多出一条缝隙，也会把整座装卸平台震醒。",
        gain: "打开侧缝，推进约 11 m",
        risk: "铁链巨响会让追击者立刻转向",
        effects: { progress: 11, distance: 1.5, noise: 17, stamina: -5 },
        success: "配重链脱扣，卷帘门被拽出一道侧缝。你挤过去时，追击声已经拐向铁链落点。",
        hint: "侧缝比主平台快，但整座仓库都听见了。",
        note: "配重链暴露了方向，却换来一条侧缝。"
      },
      actions: {
        dockEdge: { label: "贴装卸口边缘前进", sub: "避开主平台 · 脚步最轻", kind: "quiet" },
        openDock: { label: "冲过敞开的装卸口", sub: "路线最短 · 完全暴露", kind: "risk" },
        cageStep: { label: "踩倒铁笼翻上货台", sub: "借铁笼换路 · 消耗体力", kind: "context" },
        palletGap: { label: "缩进托盘货垛后", sub: "进入屏息 · 挡住视线", kind: "stealth" }
      }
    },
    {
      id: "racks",
      min: 25,
      max: 49.999,
      name: "货架迷宫",
      visual: "phase-2",
      hide: {
        title: "挤进两排货架之间",
        copy: "纸箱抵着后背，铁架只留出半个人的宽度。相邻过道里，脚步正一下下压过铁板。",
        hint: "货架挡住视线，却挡不住声音。任何挪动都会沿着铁架传过去。",
        success: "脚步声从相邻过道经过。你贴住货架，没有让纸箱滑动。",
        fail: "纸箱被肩膀顶歪。相邻过道的脚步在货架另一侧停住。"
      },
      hotspot: {
        x: "18%",
        y: "44%",
        label: "松脱货架卡扣",
        title: "推倒一排空货架",
        text: "这排货架已经歪了。推倒它能封住主通道，但整片铁架会接连砸下来。",
        gain: "堵住追线，拉开约 3.1 m",
        risk: "货架连锁倒塌，噪声大幅上升",
        effects: { progress: 9, distance: 3.1, noise: 23, stamina: -9 },
        success: "空货架砸在主通道中央，纸箱和铁网一起塌下去。追击者被迫退开，你从侧过道绕了出去。",
        hint: "主通道暂时封死，下一次走开阔位会更危险。",
        note: "倒塌货架切断追线，也留下明显方向。"
      },
      actions: {
        narrowAisle: { label: "钻过两排货架窄缝", sub: "切断视线 · 推进慢", kind: "quiet" },
        mainAisle: { label: "冲过主通道", sub: "推进最快 · 长时间暴露", kind: "risk" },
        rackPivot: { label: "借货架拐角换步", sub: "逼追兵判断错方向", kind: "context" },
        boxStack: { label: "藏在纸箱堆后", sub: "进入屏息 · 铁架会传声", kind: "stealth" }
      }
    },
    {
      id: "service",
      min: 50,
      max: 74.999,
      name: "冷库管线区",
      visual: "phase-3",
      hide: {
        title: "缩进管线检修井",
        copy: "冷雾从阀门缝里漏出来。你贴着铁管屏住呼吸，维修通道上的脚步正敲过格栅。",
        hint: "冷凝水滴个不停。等脚步越过阀门，再松开呼吸。",
        success: "格栅上的脚步走远了。冷雾遮住检修井，没有人停下来。",
        fail: "肩膀撞上阀门，金属声穿过整条管线。脚步停在检修井前。"
      },
      hotspot: {
        x: "76%",
        y: "58%",
        label: "冷库泄压阀",
        title: "拧开泄压阀",
        text: "阀门后还压着一股冷气。打开它会把检修通道灌满白雾，也会让管线尖啸。",
        gain: "白雾遮挡视线，推进约 15 m",
        risk: "管线尖啸会持续暴露你的位置",
        effects: { progress: 15, distance: 2.2, noise: 21, stamina: -8 },
        success: "泄压阀被拧开，白雾一下堵住整条维修通道。你借冷雾穿过格栅，追击者只能沿声音摸索。",
        hint: "白雾能挡住视线，但尖啸也把你的方向留在身后。",
        note: "冷雾阻断视线，管线声却拖住脚步。"
      },
      actions: {
        pipeRun: { label: "沿管线低身前进", sub: "借冷雾遮挡 · 速度较慢", kind: "quiet" },
        catwalk: { label: "冲过中央检修格栅", sub: "最短直线 · 铁皮回响很重", kind: "risk" },
        valveNoise: { label: "敲阀放出一股蒸汽", sub: "引开视线 · 噪声很高", kind: "context" },
        serviceNiche: { label: "藏进管线检修井", sub: "进入屏息 · 压住冷雾里的呼吸", kind: "stealth" }
      }
    },
    {
      id: "finish",
      min: 75,
      max: 100,
      name: "出货闸门",
      visual: "phase-4",
      hotspot: {
        x: "49%",
        y: "42%",
        label: "出货口横链",
        title: "踢开出货口横链",
        text: "卷帘门已经抬到腰间。踢开横链能钻进雨里，也会让叉车和铁门一起震动。",
        gain: "打开最后出口，推进约 20 m",
        risk: "横链会响，追兵也能直接从门缝看见你",
        effects: { progress: 20, distance: 2.3, noise: 20, stamina: -9 },
        success: "横链被踢落，卷帘门下的缝隙露出来。你贴地钻出去，门后的脚步紧跟着压到平台边。",
        hint: "最后不要贪主门直线。叉车和侧装卸台都能切断追线。"
      },
      actions: {
        sideDock: { label: "翻过侧装卸台", sub: "绕开主门 · 体力消耗很大", kind: "quiet" },
        shutterDash: { label: "从卷帘门缝冲出去", sub: "最直接 · 正对最后追线", kind: "risk" },
        forkliftBlock: { label: "推叉车卡住门轨", sub: "封住主门 · 巨响换距离", kind: "context" },
        chainAnchor: { label: "背靠铁链缓一口气", sub: "降低噪声并恢复体力", kind: "quiet" }
      }
    }
  ];

  const WAREHOUSE_STAGE_ACTIONS = {
    entry: {
      dockEdge: {
        label: "贴装卸口边缘前进",
        sub: "避开主平台 · 脚步最轻",
        kind: "quiet",
        progress: [14, 18],
        distance: 1.1,
        noise: 2,
        stamina: -3,
        text: [
          "你沿着装卸口边缘挪动，铁皮把鞋底的声响压低。主平台留在侧后方，追击者没有找到直线。",
          "卷帘门的阴影遮住半截身影。你走得慢，却始终没有踏进最开阔的一块地。"
        ],
        hint: "边缘路线最安静，但推进稳定而不快。"
      },
      openDock: {
        label: "冲过敞开的装卸口",
        sub: "路线最短 · 完全暴露",
        kind: "risk",
        progress: [22, 26],
        distance: 1.5,
        noise: 19,
        stamina: -13,
        text: [
          "你直接冲上装卸平台。铁皮被踩得连声回响，远处的人影立刻转向敞开的平台。",
          "最短的路没有遮挡。你抢到一截距离，也把自己完整留在了对方视线里。"
        ],
        hint: "主平台最快，也是长距离视线最容易咬住的位置。"
      },
      cageStep: {
        label: "踩倒铁笼翻上货台",
        sub: "借铁笼换路 · 消耗体力",
        kind: "context",
        progress: [16, 20],
        distance: 1.9,
        noise: 9,
        stamina: -10,
        text: [
          "你踩在倒扣的铁笼上借力翻上货台。笼盖被踩塌，追击声被迫绕到木托盘另一侧。",
          "铁笼在脚下滑了一下。你抓住货台边缘翻过去，落点避开了主通道。"
        ],
        hint: "换路会拉开距离，也会让腿力迅速下降。"
      },
      palletGap: {
        label: "缩进托盘货垛后",
        sub: "进入屏息 · 挡住视线",
        kind: "stealth",
        hide: true
      }
    },
    racks: {
      narrowAisle: {
        label: "钻过两排货架窄缝",
        sub: "切断视线 · 推进慢",
        kind: "quiet",
        progress: [18, 22],
        distance: 1.7,
        noise: 4,
        stamina: -8,
        text: [
          "你侧身钻进两排货架之间。纸箱挡住正面视线，追击者只能从相邻过道判断方向。",
          "狭窄通道把脚步压得很低。货架一层层切碎视线，你从另一头钻出时，主通道仍然空着。"
        ],
        hint: "货架窄缝最能切断长距离视线，但很吃体力。"
      },
      mainAisle: {
        label: "冲过主通道",
        sub: "推进最快 · 长时间暴露",
        kind: "risk",
        progress: [25, 29],
        distance: 1.2,
        noise: 24,
        stamina: -15,
        text: [
          "你冲进最宽的主通道。两侧货架同时退开，整条直线把奔跑的身影暴露得很清楚。",
          "铁板在脚下连续作响。你抢到一大段路，却也让追击者获得了最完整的视线。"
        ],
        hint: "主通道推进最快，代价是把整段路线交到对方眼里。"
      },
      rackPivot: {
        label: "借货架拐角换步",
        sub: "逼追兵判断错方向",
        kind: "context",
        progress: [11, 14],
        distance: 2.5,
        noise: 5,
        stamina: -5,
        text: [
          "你在货架尽头突然折向侧过道。脚步顺着铁架传出去，方向却和你的路线错开。",
          "你贴住拐角停了一拍，再把落脚点换到另一排。追击声果然沿旧方向多走了一截。"
        ],
        hint: "换步推进不多，但能让追兵多绕一排货架。"
      },
      boxStack: {
        label: "藏在纸箱堆后",
        sub: "进入屏息 · 铁架会传声",
        kind: "stealth",
        hide: true
      }
    },
    service: {
      pipeRun: {
        label: "沿管线低身前进",
        sub: "借冷雾遮挡 · 速度较慢",
        kind: "quiet",
        progress: [19, 23],
        distance: 1.8,
        noise: 4,
        stamina: -12,
        text: [
          "你贴着冰凉的管线低身穿过维修通道。冷雾挡住半截身影，格栅之外的脚步没有直接追来。",
          "阀门滴下的冷凝水盖住部分声响。你走得不快，却始终没有踏进中央检修道。"
        ],
        hint: "管线侧路安静但低矮，持续消耗体力。"
      },
      catwalk: {
        label: "冲过中央检修格栅",
        sub: "最短直线 · 铁皮回响很重",
        kind: "risk",
        progress: [24, 28],
        distance: 1.3,
        noise: 22,
        stamina: -16,
        text: [
          "你踏上中央格栅，每一脚都让铁皮在冷库里回响。远处的人影顺着声音转向这条直线。",
          "检修道没有遮挡。你冲得很快，但脚步已经替追击者标出了完整路线。"
        ],
        hint: "格栅直线最快，也最容易吃到长距离瞄准线。"
      },
      valveNoise: {
        label: "敲阀放出一股蒸汽",
        sub: "引开视线 · 噪声很高",
        kind: "context",
        progress: [10, 13],
        distance: 3.0,
        noise: 25,
        stamina: -6,
        text: [
          "你敲松阀门，冷气从管线缝里尖啸着喷出。追击声转向另一条维修支路。",
          "白雾遮住检修口。你借这股冷气绕到管线背面，代价是尖啸一直跟着脚步。"
        ],
        hint: "蒸汽能制造视线盲区，也会持续暴露你的方向。"
      },
      serviceNiche: {
        label: "藏进管线检修井",
        sub: "进入屏息 · 压住冷雾里的呼吸",
        kind: "stealth",
        hide: true
      }
    },
    finish: {
      sideDock: {
        label: "翻过侧装卸台",
        sub: "绕开主门 · 体力消耗很大",
        kind: "quiet",
        progress: [18, 22],
        distance: 1.5,
        noise: 5,
        stamina: -18,
        text: [
          "你抓住侧装卸台的铁沿翻上去。主门留在身后，卷帘门的追线被叉车挡断。",
          "侧台窄得只能放下半只脚。你贴着墙挪过去，最后才从叉车后面落到出口侧。"
        ],
        hint: "侧台绕开主门，却几乎榨干最后一段体力。"
      },
      shutterDash: {
        label: "从卷帘门缝冲出去",
        sub: "最直接 · 正对最后追线",
        kind: "risk",
        progress: [25, 29],
        distance: 1.4,
        noise: 23,
        stamina: -14,
        text: [
          "你冲向半开的卷帘门。出口就在眼前，门后的人也正好占住那条直线。",
          "你贴着卷帘门底边滑出去。铁片刮过肩膀，追击线已经压到最后一截平台。"
        ],
        hint: "主门直线推进最多，也最容易在出口前被截回。"
      },
      forkliftBlock: {
        label: "推叉车卡住门轨",
        sub: "封住主门 · 巨响换距离",
        kind: "context",
        progress: [10, 13],
        distance: 3.5,
        noise: 20,
        stamina: -11,
        text: [
          "你把叉车硬推进门轨，卷帘门卡在叉架上。追击者被迫停步，刺耳的金属声在整个出货区炸开。",
          "叉车轮胎在地面上拖出一段黑印。主门被封死，你从侧台翻向最后出口。"
        ],
        hint: "封门能立刻拉远距离，但巨响会传遍最后一区。"
      },
      chainAnchor: {
        label: "背靠铁链缓一口气",
        sub: "降低噪声并恢复体力",
        kind: "quiet",
        progress: [0, 0],
        distance: -.4,
        noise: -20,
        stamina: 13,
        text: [
          "你背贴出货口铁链，把呼吸压进雨声里。追击声在叉车另一侧慢了下来。",
          "你停在卷帘门边数了两口气。噪声落下去，发抖的腿终于重新有劲。"
        ],
        hint: "停一步能换回体力，但追兵也会靠近。"
      }
    }
  };

  const WAREHOUSE_MODE = {
    key: "warehouse",
    id: "chase-baiqi-warehouse",
    hash: "#chase-baiqi-warehouse",
    recordKey: "woxi_chase_baiqi_warehouse_record_v1",
    recordLabel: "白起 · 废弃仓库追逃档案",
    heroKey: "baiqi",
    heroName: "白起",
    eyebrow: "CHASE / 废弃仓库",
    brand: "废弃仓库追逃",
    statusLabel: "与追击者的距离",
    startSeal: "03",
    startKicker: "STANDALONE / ABANDONED WAREHOUSE",
    startTitle: "废弃仓库追逃",
    startText: "装卸平台、货架迷宫、冷库管线区和出货闸门。窄货架会切断视线，铁皮地面会放大脚步；冒险穿过主通道，会让远距离追击者提前锁定你。",
    startNote: "货架断路、铁皮噪声与最后卷帘门共同决定结局。看破视线、藏住脚步，再借托盘、铁笼或叉车换路。",
    startNarration: "卷帘门在后方撞响。追击者站在装卸平台尽头，倒扣铁笼和积水把整条主通道照得很冷。",
    startHint: "不要一直跑主通道。钻货架窄缝，或者逼追兵绕到相邻过道。",
    controlsLabel: "当前仓库区域可选行动",
    hideLabel: "货垛与纸箱间屏息",
    hideCopy: "铁架会把每一次挪动都传出去。按住不放，等脚步越过相邻过道。",
    hideLeave: "撞开纸箱冲出去",
    outcomes: WAREHOUSE_OUTCOMES,
    roleLabels: WAREHOUSE_ROLE_LABELS,
    actionRoles: WAREHOUSE_ACTION_ROLES,
    scenes: withStageActions(WAREHOUSE_SCENES, WAREHOUSE_STAGE_ACTIONS),
    stageActions: WAREHOUSE_STAGE_ACTIONS
  };

  function withStageActions(sceneList, stageActions) {
    return sceneList.map(function (scene) {
      const copy = Object.assign({}, scene);
      copy.actions = stageActions[scene.id] || scene.actions;
      return copy;
    });
  }

  STREET_MODE.scenes = withStageActions(STREET_SCENES, STREET_STAGE_ACTIONS);
  STREET_MODE.stageActions = STREET_STAGE_ACTIONS;
  CASTLE_MODE.scenes = withStageActions(CASTLE_SCENES, CASTLE_STAGE_ACTIONS);
  CASTLE_MODE.stageActions = CASTLE_STAGE_ACTIONS;

  function emptyChaseRecord() {
    return {
      attempts: 0,
      escapes: 0,
      caught: 0,
      silent: 0,
      extreme: 0,
      exit: 0,
      midway: 0,
      bestDistance: 0,
      fastestEscape: null,
      bestScore: 0
    };
  }

  function loadChaseRecordByKey(recordKey) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(recordKey) || "null");
      return Object.assign(emptyChaseRecord(), parsed || {});
    } catch (error) {
      return emptyChaseRecord();
    }
  }

  function loadChaseRecord() {
    return loadChaseRecordByKey(CHASE_RECORD_KEY);
  }

  function loadChaseSummary() {
    const keys = [];
    Object.keys(CHASE_MODES || {}).forEach(function (sceneKey) {
      Object.keys(CHASE_MODES[sceneKey] || {}).forEach(function (heroKey) {
        const mode = CHASE_MODES[sceneKey][heroKey];
        if (mode && mode.recordKey && keys.indexOf(mode.recordKey) < 0) {
          keys.push(mode.recordKey);
        }
      });
    });
    return keys.reduce(function (summary, key) {
      const record = loadChaseRecordByKey(key);
      summary.runs += record.attempts || 0;
      summary.escapes += record.escapes || 0;
      summary.caught += record.caught || 0;
      summary.bestScore = Math.max(summary.bestScore, record.bestScore || 0);
      if (record.fastestEscape != null) {
        summary.fastest = summary.fastest == null
          ? record.fastestEscape
          : Math.min(summary.fastest, record.fastestEscape);
      }
      return summary;
    }, { runs: 0, escapes: 0, caught: 0, bestScore: 0, fastest: null });
  }

  function renderChaseStats() {
    const summary = loadChaseSummary();
    const values = {
      runs: summary.runs,
      escapes: summary.escapes,
      caught: summary.caught,
      score: summary.bestScore
    };
    Object.keys(values).forEach(function (key) {
      document.querySelectorAll(".cm-stat-" + key).forEach(function (node) {
        node.textContent = String(values[key]);
      });
    });
  }

  function formatChaseRecord() {
    const record = loadChaseRecord();
    if (!record.attempts) return CHASE_MODE.recordLabel + "：尚无记录";
    const fastest = record.fastestEscape == null ? "—" : record.fastestEscape + " 回合";
    return CHASE_MODE.recordLabel + "：" + record.escapes + " 次逃脱 / " + record.caught + " 次被擒" +
      " · 最快逃脱 " + fastest + " · 最远距离 " + Math.round(record.bestDistance) + " m";
  }

  function signed(value, suffix) {
    const rounded = Math.round(value * 10) / 10;
    if (!rounded) return "±0" + (suffix || "");
    return (rounded > 0 ? "+" : "") + rounded + (suffix || "");
  }

  function updateRunMetrics() {
    state.peakNoise = Math.max(state.peakNoise, state.noise);
    state.minStamina = Math.min(state.minStamina, state.stamina);
    state.bestDistance = Math.max(state.bestDistance, state.distance);
  }

  function itemDefinition(itemId) {
    const items = window.CHASE_ITEM_BY_ID || {};
    return items[itemId] || null;
  }

  function selectedLoadoutEntry(itemId) {
    return loadoutSelection.filter(function (entry) {
      return entry.id === itemId;
    })[0] || null;
  }

  function itemInputLocked() {
    return state.itemEventOpen || state.itemAutoQueue.length > 0;
  }

  function renderLoadout() {
    if (!loadoutGrid) return;
    const items = window.CHASE_ITEMS || [];
    loadoutGrid.innerHTML = items.map(function (item) {
      const selected = selectedLoadoutEntry(item.id);
      const full = loadoutSelection.length >= 2 && !selected;
      return '<article class="cm-loadout-card' + (selected ? " selected" : "") + '" data-item-card="' +
        item.id + '">' +
        '<span class="cm-loadout-mark">' + item.mark + '</span>' +
        '<div class="cm-loadout-card-copy"><b>' + item.name + '</b><p>' + item.preview + '</p>' +
        '<small>' + item.effect + '</small></div>' +
        '<div class="cm-loadout-modes">' +
        '<button type="button" data-item-mode="assist" data-item-id="' + item.id + '"' +
        (full ? " disabled" : "") + ' aria-pressed="' +
        (selected && selected.mode === "assist" ? "true" : "false") + '">我递给他</button>' +
        '<button type="button" data-item-mode="auto" data-item-id="' + item.id + '"' +
        (full ? " disabled" : "") + ' aria-pressed="' +
        (selected && selected.mode === "auto" ? "true" : "false") + '">他自己用</button>' +
        '</div>' +
        (selected
          ? '<button type="button" class="cm-loadout-remove" data-item-remove="' + item.id +
            '">撤下这件</button>'
          : "") +
        '</article>';
    }).join("");

    if (loadoutSummary) {
      loadoutSummary.textContent = loadoutSelection.length
        ? "已选 " + loadoutSelection.length + " / 2 件：" + loadoutSelection.map(function (entry) {
          const item = itemDefinition(entry.id);
          return (item ? item.name : entry.id) + (entry.mode === "assist" ? "（我递给他）" : "（他自己用）");
        }).join("、")
        : "未选择道具。可以直接开始，也可以带最多两件再走。";
    }
    if (loadoutStart) {
      loadoutStart.textContent = loadoutSelection.length
        ? "开始追逃 · 带 " + loadoutSelection.length + " 件道具"
        : "开始追逃 · 不带道具";
    }
  }

  function chooseLoadoutItem(itemId, mode) {
    if (!itemDefinition(itemId) || (mode !== "assist" && mode !== "auto")) return;
    const existing = selectedLoadoutEntry(itemId);
    if (existing) {
      existing.mode = mode;
    } else {
      if (loadoutSelection.length >= 2) return;
      loadoutSelection.push({ id: itemId, mode: mode });
    }
    renderLoadout();
  }

  function removeLoadoutItem(itemId) {
    const index = loadoutSelection.findIndex(function (entry) {
      return entry.id === itemId;
    });
    if (index >= 0) loadoutSelection.splice(index, 1);
    renderLoadout();
  }

  function openLoadout() {
    if (!loadout || !picker) return;
    state.itemEventOpen = false;
    state.itemAutoQueue = [];
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    picker.hidden = false;
    picker.classList.add("loadout-open");
    loadout.hidden = false;
    renderLoadout();
    const firstMode = loadoutGrid && loadoutGrid.querySelector("[data-item-mode]");
    if (firstMode) firstMode.focus();
  }

  function closeLoadout() {
    if (!picker) return;
    picker.classList.remove("loadout-open");
    if (loadout) loadout.hidden = true;
    if (pickerStart) pickerStart.focus();
  }

  function beginLoadedRun() {
    activeLoadout = loadoutSelection.map(function (entry) {
      return { id: entry.id, mode: entry.mode };
    });
    enterCombo(getComboMode(selection.hero, selection.scene));
  }

  function itemModeLabel(mode) {
    return mode === "assist" ? "我递给他" : "他自己用";
  }

  function itemEffectLine(item, entry) {
    let line = item.effect;
    if (item.id === "gap" && state.distance <= 1.8) {
      line += "。这一下会把你直接拖进他的手里";
    } else if (item.id === "capture") {
      line += "。反馈结束后直接进入处刑";
    }
    return line;
  }

  function renderItemHud() {
    if (!itemHud || !itemHudList) return;
    const items = state.itemLoadout || [];
    if (!items.length || state.ended || state.executing) {
      itemHud.hidden = true;
      itemHudList.innerHTML = "";
      return;
    }
    itemHud.hidden = false;
    itemHudList.innerHTML = items.map(function (entry) {
      const item = itemDefinition(entry.id);
      if (!item) return "";
      const used = !!entry.used;
      const auto = entry.mode === "auto";
      const status = used
        ? "已生效"
        : (auto ? "开局自动生效" : "等你亲手递过去");
      return '<div class="cm-item-hud-row' + (used ? " used" : "") + '">' +
        '<span class="cm-item-hud-mark">' + item.mark + '</span>' +
        '<span class="cm-item-hud-copy"><b>' + item.name + '</b><small>' +
        itemModeLabel(entry.mode) + " · " + status + '</small></span>' +
        (auto
          ? '<span class="cm-item-hud-auto">自动</span>'
          : '<button type="button" data-item-use="' + entry.id + '"' +
            (used || state.hidden || itemInputLocked() ? " disabled" : "") + '>' +
            (used ? "已交付" : "交付") + '</button>') +
        '</div>';
    }).join("");
  }

  function openItemEvent(entry, source) {
    if (!itemEvent || !entry || state.ended || state.executing) return false;
    const item = itemDefinition(entry.id);
    if (!item || entry.used) return false;
    const copy = window.CHASE_ITEM_COPY &&
      window.CHASE_ITEM_COPY[CHASE_MODE.heroKey] &&
      window.CHASE_ITEM_COPY[CHASE_MODE.heroKey][item.id];
    if (!copy) return false;
    pendingItemEvent = { entry: entry, source: source };
    state.itemEventOpen = true;
    itemEventKicker.textContent = source === "assist"
      ? "HUNTER ITEM / 你亲手递过去"
      : "HUNTER ITEM / 他自己取用";
    itemEventTitle.textContent = CHASE_MODE.heroName + " · " + item.name;
    itemEventCopy.textContent = copy[source === "assist" ? "assist" : "auto"];
    itemEventEffect.textContent = itemEffectLine(item, entry);
    itemEventContinue.textContent = item.id === "capture" ||
      (item.id === "gap" && state.distance <= 1.8)
      ? "拖进处刑"
      : "继续逃";
    itemEvent.hidden = false;
    controls.querySelectorAll("button").forEach(function (button) {
      button.disabled = true;
    });
    hotspot.hidden = true;
    interact.hidden = true;
    renderItemHud();
    window.setTimeout(function () {
      if (itemEventContinue && !itemEvent.hidden) itemEventContinue.focus();
    }, 30);
    return true;
  }

  function applyItemEffect(entry, source) {
    const item = itemDefinition(entry.id);
    if (!item || entry.used) return false;
    entry.used = true;
    state.itemUsed[entry.id] = source;
    const scene = sceneForProgress(state.progress);
    let progressDelta = 0;
    let distanceDelta = 0;
    let noiseDelta = 0;
    let caught = false;
    let note = itemModeLabel(source === "assist" ? "assist" : "auto");

    if (item.id === "trace") {
      state.traceTurns = Math.max(state.traceTurns, 3);
      noiseDelta = 5;
      note += "：位置暴露 3 回合；藏匿收益被压低，噪声增长更快。";
    } else if (item.id === "gap") {
      distanceDelta = -1.8;
      noiseDelta = 4;
      state.distance = clamp(state.distance + distanceDelta, 0, 9);
      caught = state.distance <= 0;
      note += "：追兵距离缩短 1.8 m" + (caught ? "，当场被截住。" : "。");
    } else if (item.id === "seal") {
      state.sealTurns = Math.max(state.sealTurns, 2);
      note += "：接下来 2 回合，每个阶段都有一条稳妥路线被封死。";
    } else if (item.id === "capture") {
      state.distance = 0;
      caught = true;
      note += "：锁扣合拢，追兵抓住你并直接转入处刑。";
    }

    state.noise = clamp(state.noise + noiseDelta, 0, 100);
    updateRunMetrics();
    recordRoute(
      scene,
      "item-" + item.id,
      item.name,
      "item",
      actualMetrics(progressDelta, distanceDelta, noiseDelta, 0),
      note
    );
    return caught;
  }

  function finishItemEvent() {
    if (!state.itemEventOpen || !pendingItemEvent) return;
    const current = pendingItemEvent;
    pendingItemEvent = null;
    state.itemEventOpen = false;
    itemEvent.hidden = true;
    const caught = applyItemEffect(current.entry, current.source);
    renderItemHud();
    if (caught) {
      endGame("caught",
        CHASE_MODE.heroName + "接受了这份契约。" + itemDefinition(current.entry.id).name +
        "合拢之后，他没有再给你继续逃的机会。");
      return;
    }
    scheduleNextAutoItem(110);
    render();
  }

  function triggerItem(itemId) {
    if (!state.active || state.ended || state.executing || state.hidden || itemInputLocked()) return;
    const entry = (state.itemLoadout || []).filter(function (item) {
      return item.id === itemId && item.mode === "assist" && !item.used;
    })[0];
    if (entry) openItemEvent(entry, "assist");
  }

  function scheduleNextAutoItem(delay) {
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    if (!state.itemAutoQueue.length || state.ended) return;
    state.itemAutoTimer = window.setTimeout(function () {
      state.itemAutoTimer = 0;
      while (state.itemAutoQueue.length && !state.ended) {
        const itemId = state.itemAutoQueue.shift();
        const entry = (state.itemLoadout || []).filter(function (item) {
          return item.id === itemId && item.mode === "auto" && !item.used;
        })[0];
        if (!entry) continue;
        if (openItemEvent(entry, "auto")) return;
      }
      render();
    }, delay == null ? 260 : delay);
  }

  function queueAutomaticItems() {
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    state.itemAutoQueue = (state.itemLoadout || []).filter(function (entry) {
      return entry.mode === "auto" && !entry.used;
    }).map(function (entry) {
      return entry.id;
    });
    if (state.itemAutoQueue.length) scheduleNextAutoItem(260);
    renderItemHud();
  }

  function actionMetrics(action) {
    if (action.hide) return "暴露归零 · 体力 +7 · 噪声随屏息变化";
    const range = action.progress || [0, 0];
    const low = Math.round(range[0] * ROUTE_GAIN_SCALE);
    const high = Math.round(range[1] * ROUTE_GAIN_SCALE);
    const progress = range[0] === range[1]
      ? signed(low, " m")
      : "+" + low + "～" + high + " m";
    return "出口 " + progress +
      " · 距离 " + signed(action.distance || 0, " m") +
      " · 噪声 " + signed(action.noise || 0) +
      " · 体力 " + signed(action.stamina || 0) +
      (action.spearLine ? " · 枪线截击" : "") +
      (action.sightLine ? " · 瞄准线截击" : "");
  }

  function actualMetrics(progress, distance, noise, stamina) {
    return "出口 " + signed(progress, " m") +
      " · 距离 " + signed(distance, " m") +
      " · 噪声 " + signed(noise) +
      " · 体力 " + signed(stamina);
  }

  function roleFor(sceneId, actionKey, action) {
    return (action && action.role) ||
      (ACTION_ROLES[sceneId] && ACTION_ROLES[sceneId][actionKey]) ||
      "steady";
  }

  function recordRoute(scene, actionKey, label, role, metrics, note) {
    state.routeLog.push({
      scene: scene.name,
      actionKey: actionKey,
      label: label,
      role: role,
      metrics: metrics,
      note: note || ""
    });
    if (role === "hide") {
      state.hideCount += 1;
    } else {
      state.actionsUsed[role] = (state.actionsUsed[role] || 0) + 1;
    }
  }

  function gradeRun(outcomeKey) {
    const progressScore = state.progress * .5;
    const quietScore = (100 - state.peakNoise) * .18;
    const staminaScore = state.minStamina * .15;
    const distanceScore = state.bestDistance / 9 * 17;
    const outcomeBonus = outcomeKey === "silent" ? 8 : (outcomeKey === "extreme" ? 4 : 0);
    const score = clamp(Math.round(progressScore + quietScore + staminaScore + distanceScore + outcomeBonus), 0, 100);
    const grade = score >= 82 ? "S" : (score >= 70 ? "A" : (score >= 56 ? "B" : (score >= 40 ? "C" : "D")));
    return { score: score, grade: grade };
  }

  function classifyOutcome(type) {
    if (type === "escape") {
      const silent = !state.finalGambit &&
        state.peakNoise <= 55 &&
        state.slipCount === 0 &&
        state.distance >= 2 &&
        state.minStamina >= 20;
      return silent ? "silent" : "extreme";
    }
    return state.progress >= 75 ? "exit" : "midway";
  }

  function tryFinalGambit() {
    state.finalGambit = true;
    const progressBefore = state.progress;
    const strongOpening = state.progress >= 82 &&
      state.distance >= 1.1 &&
      state.noise <= 72 &&
      state.stamina >= 8;
    const desperateOpening = state.progress >= 90 &&
      state.distance >= .7 &&
      state.noise <= 89 &&
      state.stamina >= 2;
    const finishScene = SCENES[SCENES.length - 1];

    if (strongOpening || desperateOpening) {
      state.progress = 100;
      state.distance = Math.max(state.distance, 1.2);
      recordRoute(
        finishScene,
        "final-gambit",
        "最后一搏 · 卡着铁门冲出去",
        "near",
        "出口 +" + Math.round(Math.max(0, 100 - progressBefore)) + " m · 依据此前路线判定成功",
        "此前保留的体力、噪声和距离足够撑到这道门。"
      );
      updateRunMetrics();
      endGame("escape", CHASE_MODE.finalGambitSuccess(strongOpening));
      return;
    }

    recordRoute(
      finishScene,
      "final-gambit",
      "最后一搏 · 没能穿过铁门",
      "near",
      "出口未完成 · 噪声 " + Math.round(state.noise) + " · 体力 " + Math.round(state.stamina),
      "此前的噪声、体力和路线没有留下足够空间。"
    );
    endGame("caught", CHASE_MODE.finalGambitFail);
  }

  function setVisual(mode) {
    visual.classList.remove("look-far", "look-close", "hide-mode");
    if (mode) visual.classList.add(mode);
  }

  const STREET_WATCHES = {
    entry: {
      frames: [
        { image: "generated/chase-baiqi-street-full-v2-mobile.webp", tag: "他在入口等你" }
      ]
    },
    flooded: {
      frames: [
        { image: "generated/chase-baiqi-watch-flooded-v1-mobile.webp", tag: "他停在黑水中央" },
        { image: "generated/chase-baiqi-watch-flooded-lean-v2-mobile.webp", tag: "他俯身盯住你，双靴踏进黑水" },
        { image: "generated/chase-baiqi-watch-flooded-turn-v2-mobile.webp", tag: "他转过身，雨声停了半拍" },
        { image: "generated/chase-baiqi-watch-flooded-lunge-v3-mobile.webp", tag: "黑水炸开，他已经逼近" },
        { image: "generated/chase-baiqi-watch-air-v1-mobile.webp", tag: "他从街灯上方落下来" }
      ]
    },
    gate: {
      frames: [
        { image: "generated/chase-baiqi-watch-gate-v1-mobile.webp", tag: "他站在铁门后" },
        { image: "generated/chase-baiqi-watch-gate-reach-v1-mobile.webp", tag: "他正在把门推开" },
        { image: "generated/chase-baiqi-watch-gate-step-v2-mobile.webp", tag: "他跨过门槛，铁门还在晃" }
      ]
    },
    finish: {
      frames: [
        { image: "generated/chase-baiqi-watch-gate-v1-mobile.webp", tag: "他堵住了最后一段路" },
        { image: "generated/chase-baiqi-watch-gate-reach-v1-mobile.webp", tag: "门后的人已经走近" },
        { image: "generated/chase-baiqi-watch-gate-step-v2-mobile.webp", tag: "他跨出门栏，最后一段路没了" }
      ]
    }
  };

  const CASTLE_WATCHES = {
    entry: {
      frames: [
        { image: "generated/chase-hanxin-castle-entry-v1-mobile.webp", tag: "韩信停在门厅尽头，枪锋封住中庭" }
      ]
    },
    gallery: {
      frames: [
        { image: "generated/chase-hanxin-castle-gallery-v1-mobile.webp", tag: "他从拱窗侧廊切入，枪尖压过长影" }
      ]
    },
    undercroft: {
      frames: [
        { image: "generated/chase-hanxin-castle-undercroft-v1-mobile.webp", tag: "他站在蓄水间石阶上，枪尖逼向侧沟" }
      ]
    },
    finish: {
      frames: [
        { image: "generated/chase-hanxin-castle-gate-v1-mobile.webp", tag: "韩信先一步守住最后一道闸门" }
      ]
    }
  };

  Object.assign(STREET_MODE, {
    watches: STREET_WATCHES,
    captureLines: lines.caught,
    shotDefault: "generated/chase-baiqi-street-full-v2-mobile.webp",
    shotClose: "generated/chase-baiqi-street-full-v2-mobile.webp",
    shotCloseTag: "白起 · 全身逼近",
    shotByScene: {
      entry: "generated/chase-baiqi-street-full-v2-mobile.webp",
      flooded: "generated/chase-baiqi-watch-flooded-v1-mobile.webp",
      gate: "generated/chase-baiqi-watch-gate-v1-mobile.webp",
      finish: "generated/chase-baiqi-watch-gate-v1-mobile.webp"
    },
    shotTagByScene: {
      entry: "白起 · 全身镜头",
      flooded: "他停在黑水中央",
      gate: "他堵住了出口",
      finish: "他堵住最后一段路"
    },
    dangerCopies: ["他在远处", "青色身影正在靠近", "靴声已经贴到背后", "他就在你身后"],
    pursuit: function () {
      state.distance -= .65;
      state.noise = clamp(state.noise - 3.5, 0, 100);
      if (state.noise >= 74) {
        state.distance -= state.noise >= 91 ? 2.5 : 1.55;
      }
    },
    finalGambitSuccess: function (strong) {
      return strong
        ? "你借前面留下的余地压进最后一道门缝。白起的钩镰擦过肩甲，没有扣住你。"
        : "你几乎是摔出铁门的。白起已经追到伸手可及的位置，但门缝还是先一步合上。";
    },
    finalGambitFail: "你在最后一刻扑向铁门。钩镰先扣住肩膀，把你从门缝前硬生生拖回雨里。",
    hideFailure: function () {
      return {
        message: "桶盖被你的肩膀顶响。外面的脚步停了。",
        hint: "白起就在桶前。",
        caught: "你没能压住那一下喘息。白起掀开桶盖时，甚至没有弯腰。"
      };
    },
    hideReleaseHint: "手指松开的一瞬漏出一点呼吸。桶外的脚步没有继续走。",
    hideButtonDone: "他从桶边走过去了",
    hideNextHint: function (scene) {
      return scene && scene.id === "flooded"
        ? "废车底盘替你换来一段距离，也让你沾了一身污水。"
        : "藏身处替你换来一段距离，但白起已经记住了这个角落。";
    },
    hideDefaultSuccess: function (scene) {
      return scene && scene.id === "flooded"
        ? "白起在车门外停了半步。你忍着机油味没有出声，直到那双靴子重新往远处走。"
        : "白起在藏身处旁停了半步。你硬撑着没有出声，直到那双靴子重新往远处走。";
    },
    hideAbort: function (scene) {
      return scene && scene.id === "flooded"
        ? "你从车底滚出去，肩膀撞在车门上。白起立刻从巷口折返。"
        : "你撞开藏身处的遮挡冲出去。响动让白起立刻从巷口折返。";
    }
  });

  Object.assign(CASTLE_MODE, {
    watches: CASTLE_WATCHES,
    captureLines: [
      "枪尾在湿石上停住。你还没来得及换路，枪杆已经从侧后压住肩膀。",
      "韩信没有问你要去哪。他只用枪尖挑开你的退路，把你按在拱窗长影里。"
    ],
    shotDefault: "generated/chase-hanxin-castle-entry-v1-mobile.webp",
    shotClose: "generated/chase-hanxin-castle-gate-v1-mobile.webp",
    shotCloseTag: "韩信 · 枪尖与双靴",
    shotByScene: {
      entry: "generated/chase-hanxin-castle-entry-v1-mobile.webp",
      gallery: "generated/chase-hanxin-castle-gallery-v1-mobile.webp",
      undercroft: "generated/chase-hanxin-castle-undercroft-v1-mobile.webp",
      finish: "generated/chase-hanxin-castle-gate-v1-mobile.webp"
    },
    shotTagByScene: {
      entry: "韩信 · 门厅持枪",
      gallery: "韩信 · 枪压长影",
      undercroft: "韩信 · 石阶上收紧枪线",
      finish: "韩信 · 闸前截门"
    },
    dangerCopies: ["枪声还在远处", "枪尾正在换向", "枪尖已经贴到背后", "他就在你的侧后"],
    pursuit: function () {
      state.distance -= .6;
      state.noise = clamp(state.noise - 3, 0, 100);
      if (state.noise >= 58) state.distance -= .55;
      if (state.noise >= 76) state.distance -= .9;
      if (state.noise >= 90) state.distance -= 1.3;
    },
    finalGambitSuccess: function (strong) {
      return strong
        ? "你借侧廊留下的空档切进闸后。韩信的枪尖擦过门框，没有来得及回挑。"
        : "你几乎是被铁闸带出去的。韩信追到枪尖可及的位置，闸链还是先一步绷断。";
    },
    finalGambitFail: "你扑向闸链，枪杆却先横在锁扣前。韩信把你从门槛拖回长廊，铁闸在身后合死。",
    hideFailure: function (scene) {
      return {
        message: scene && scene.id === "gallery"
          ? "帷幔被你的呼吸顶动。枪尖停在布面外。"
          : "湿砖响了一下。枪尾的敲击声停在藏身处外。",
        hint: "韩信已经确认你在这里。",
        caught: "你没能压住那一下喘息。枪杆挑开遮挡时，退路已经被封死。"
      };
    },
    hideReleaseHint: "手指松开的一瞬漏出呼吸。枪尾没有继续往远处敲。",
    hideButtonDone: "枪尾声已经走过去",
    hideNextHint: function (scene) {
      return scene && scene.id === "undercroft"
        ? "侧沟和水声替你拖住了枪线，也耗掉了体力。"
        : "藏身处替你换来一段距离，但韩信会记住这个角落。";
    },
    hideDefaultSuccess: function (scene) {
      return scene && scene.hide && scene.hide.success
        ? scene.hide.success
        : "枪尾从藏身处旁走过去。韩信没有回头。";
    },
    hideAbort: function (scene) {
      return scene && scene.id === "undercroft"
        ? "你撞开排水拱洞冲出去。枪尖立刻从中央石阶转向水声。"
        : "你撞开遮挡冲出去。枪尾的敲击声立刻折返。";
    }
  });

  const CHASE_HERO_CATALOG = {
    baiqi: {
      key: "baiqi",
      name: "白起",
      routeStyle: "断声围猎",
      rule: "听声辨位，噪声越高越容易被钩镰截住。",
      startHint: "压低噪声、留足体力，再借侧路躲开钩镰的收束。",
      captureLines: [
        "钩镰贴着地面收回来。你还没来得及换路，镰柄已经从侧后压住肩膀。",
        "白起没有问你要去哪。他只用钩镰挑开退路，把你按进墙边的阴影里。"
      ],
      dangerCopies: ["他在远处", "青色身影正在靠近", "靴声已经贴到背后", "他就在你身后"],
      pursuit: function () {
        state.distance -= .65;
        state.noise = clamp(state.noise - 3.5, 0, 100);
        if (state.noise >= 74) {
          state.distance -= state.noise >= 91 ? 2.5 : 1.55;
        }
      }
    },
    hanxin: {
      key: "hanxin",
      name: "韩信",
      routeStyle: "折线截杀",
      rule: "擅长直线截击，冒险冲刺会被枪线提前惩罚。",
      startHint: "少走冒险直线，先逼他换路，再用侧廊或窄巷切断枪线。",
      captureLines: [
        "枪尾在湿石上停住。你还没来得及换路，枪杆已经从侧后压住肩膀。",
        "韩信没有问你要去哪。他只用枪尖挑开退路，把你按进墙边的长影里。"
      ],
      dangerCopies: ["枪声还在远处", "枪尾正在换向", "枪尖已经贴到背后", "他就在你的侧后"],
      pursuit: function () {
        state.distance -= .6;
        state.noise = clamp(state.noise - 3, 0, 100);
        if (state.noise >= 58) state.distance -= .55;
        if (state.noise >= 76) state.distance -= .9;
        if (state.noise >= 90) state.distance -= 1.3;
      }
    },
    shouyue: {
      key: "shouyue",
      name: "守约",
      routeStyle: "视线封锁",
      rule: "占据长距离视线，在开阔直线提前压近；货架、侧室和窄巷能切断瞄准线。",
      startHint: "不要在主通道连续露头。借货架或夹角切断瞄准线，再逼他进入近身范围。",
      captureLines: [
        "远处的红点停在你肩后。你还没找到拐角，枪托已经从侧面压住退路。",
        "守约没有追得很急。他只用枪口封住最后一条直线，等你把自己送进射界。"
      ],
      dangerCopies: ["远处有条视线", "准星正在移动", "红点贴住了背后", "他已经把出口锁进射界"],
      pursuit: function () {
        state.distance -= .45;
        state.noise = clamp(state.noise - 2.5, 0, 100);
        if (state.noise >= 44) state.distance -= .35;
        if (state.noise >= 64) state.distance -= .7;
        if (state.noise >= 82) state.distance -= 1.15;
      }
    },
    zhugeliang: {
      key: "zhugeliang",
      name: "诸葛亮",
      routeStyle: "回声预判",
      rule: "借回声和路线习惯提前封口；重复同一条思路或连续制造明显声响，会被他先一步算到。",
      startHint: "不要连续走同一种路线。先用环境声藏住脚步，再在他的预判落点上突然折返。",
      captureLines: [
        "长柄在地面停住时，你已经踩进他预设的位置。羽冠后的冷光压下来，所有退路同时收成一格。",
        "诸葛亮没有急着追。他只用长影封住最后一条岔路，等你亲手走进那处早已算好的死角。"
      ],
      dangerCopies: ["长影还在远处", "他已经抬起了长柄", "你的退路正在被合并", "羽冠后的冷光贴住了背后"],
      pursuit: function () {
        state.distance -= .48;
        state.noise = clamp(state.noise - 2.7, 0, 100);
        if (state.noise >= 52) state.distance -= .38;
        if (state.noise >= 72) state.distance -= .78;
        if (state.noise >= 88) state.distance -= 1.05;
        if (state.stamina <= 28) state.distance -= .32;
      }
    }
  };

  const CHASE_SCENE_CATALOG = {
    street: {
      key: "street",
      name: "积水街",
      rule: "雨声、黑水、铁门巷与最后出口。"
    },
    castle: {
      key: "castle",
      name: "古堡",
      rule: "门厅、拱窗长廊、蓄水间与城门闸室。"
    },
    warehouse: {
      key: "warehouse",
      name: "废弃仓库",
      rule: "货架切断视线，铁皮放大脚步，侧过道与藏货点是唯一的安全距离。"
    }
  };

  const CROSS_ASSETS = {
    "baiqi:castle": {
      entry: "chase-baiqi-castle-entry-v1",
      gallery: "chase-baiqi-castle-gallery-v1",
      undercroft: "chase-baiqi-castle-undercroft-v1",
      finish: "chase-baiqi-castle-gate-v1"
    },
    "hanxin:street": {
      entry: "chase-hanxin-street-entry-v1",
      flooded: "chase-hanxin-street-flooded-v1",
      gate: "chase-hanxin-street-gate-v1",
      finish: "chase-hanxin-street-finish-v1"
    },
    "shouyue:street": {
      entry: "chase-shouyue-street-entry-v1",
      flooded: "chase-shouyue-street-flooded-v1",
      gate: "chase-shouyue-street-gate-v1",
      finish: "chase-shouyue-street-finish-v1"
    },
    "shouyue:castle": {
      entry: "chase-shouyue-castle-entry-v1",
      gallery: "chase-shouyue-castle-gallery-v1",
      undercroft: "chase-shouyue-castle-undercroft-v1",
      finish: "chase-shouyue-castle-finish-v1"
    },
    "baiqi:warehouse": {
      entry: "chase-baiqi-warehouse-entry-v1",
      racks: "chase-baiqi-warehouse-racks-v1",
      service: "chase-baiqi-warehouse-service-v1",
      finish: "chase-baiqi-warehouse-finish-v1"
    },
    "hanxin:warehouse": {
      entry: "chase-hanxin-warehouse-entry-v1",
      racks: "chase-hanxin-warehouse-racks-v1",
      service: "chase-hanxin-warehouse-service-v1",
      finish: "chase-hanxin-warehouse-finish-v1"
    },
    "shouyue:warehouse": {
      entry: "chase-shouyue-warehouse-entry-v1",
      racks: "chase-shouyue-warehouse-racks-v1",
      service: "chase-shouyue-warehouse-service-v1",
      finish: "chase-shouyue-warehouse-finish-v1"
    },
    "zhugeliang:street": {
      entry: "chase-zhugeliang-street-entry-v1",
      flooded: "chase-zhugeliang-street-flooded-v1",
      gate: "chase-zhugeliang-street-gate-v1",
      finish: "chase-zhugeliang-street-finish-v1"
    },
    "zhugeliang:castle": {
      entry: "chase-zhugeliang-castle-entry-v1",
      gallery: "chase-zhugeliang-castle-gallery-v1",
      undercroft: "chase-zhugeliang-castle-undercroft-v1",
      finish: "chase-zhugeliang-castle-finish-v1"
    },
    "zhugeliang:warehouse": {
      entry: "chase-zhugeliang-warehouse-entry-v1",
      racks: "chase-zhugeliang-warehouse-racks-v1",
      service: "chase-zhugeliang-warehouse-service-v1",
      finish: "chase-zhugeliang-warehouse-finish-v1"
    }
  };

  const COMBO_INTROS = {
    "baiqi:street": "雨已经把鞋底泡软，身后的铁钩却还在一寸寸刮过墙面。白起不急着扑上来，他只把你往积水最深、灯最暗的地方逼。水面每一次破开，都会替他报出你的位置；等你踩碎最后一块玻璃，钩镰会从背后卷住脚踝，把你拖回没有出口的巷底。",
    "hanxin:street": "长枪擦过湿砖的声音始终隔着半条街，像有人提前在你的退路上刻线。韩信不追你的脚步，他追的是你下一次露头。雨幕被枪尖挑开时，你已经能听见金属挤进肉里的闷响；只要敢沿直线多跑一步，枪锋就会从肩后贯到胸前。",
    "shouyue:street": "远处那点准星一直停在你的背心，雨越密，它越亮。守约不踏进近巷，只用一发发贴着耳廓飞过的子弹把你赶向开阔处。鞋边是被打碎的水泥，身后是越来越近的脚步；当你终于看见巷口，枪口已经封住那道光。",
    "baiqi:castle": "古堡门厅没有风，铁钩拖过石板的声响却像从墙里长出来。白起让每一条侧廊都亮起半截冷光，再把唯一的直路留给你。靴底一滑，他的靴跟就压在脊背上，铁钩沿肩胛撕开衣甲；那些拱窗只会照见你被拖进深处，不会照见出口。",
    "hanxin:castle": "长廊里的枪影比人先到。韩信借拱窗的阴影换位，每一次回声结束，枪尖都离喉咙更近。中央石阶看起来最短，却正对着他的截线；你刚把重心压上去，枪杆就从背后砸落，把你连人带甲钉在湿冷的台阶上。",
    "shouyue:castle": "地下蓄水间的每一次滴水都在替你倒计时。守约守在拱洞尽头，步枪的准星贴着水面移动，把你从一处石柱赶向下一处。冷雾里没有真正的死角；等你听见枪机复位，子弹已经穿开雾气，把出口前的最后一块石阶染黑。",
    "baiqi:warehouse": "货架把视线切成一条条窄缝，铁皮又把脚步放大成整座仓库的回声。白起拖着钩镰穿过装卸平台，根本不和你抢直线；他只要守住每个拐角，让你自己撞进倒下的铁笼。叉车边的积水映出他的靴尖时，肩上的钩已经咬住了衣领。",
    "hanxin:warehouse": "主通道顶灯坏了半边，长枪却在冷雾中露出一条完整的银线。韩信把货架拐角当成诱饵，故意让你听见远处脚步，再从前一排空架后横刺出来。枪锋划开纸箱与血肉的声音一样闷；你退得越急，身后的卷帘门就锁得越死。",
    "shouyue:warehouse": "冷库管线漏出的白雾贴着地面爬，守约的枪口就藏在雾后。货架尽头、叉车上方、出货口边缘，每一个可能逃开的缝隙都被准星提前封住。你踩过格栅时，回声把位置交给整座仓库；下一声枪响贴着耳侧落下，前面的门轨已经溅满血。",
    "zhugeliang:street": "雨声把整条积水街变成一盘会回响的棋。诸葛亮不急，他站在灯下让羽冠的长影越过巷口，再用每一步回声替你标出下一步。你以为甩开了他，转角却只有一扇慢慢合紧的铁门；长柄从背后落下时，积水里最后一道路也被压成了黑色。",
    "zhugeliang:castle": "古堡长廊里没有真正的死角，只有还没被他算到的那一格。诸葛亮让铁灯笼的影子横在门厅，让湿石阶的回声一次一次把你的位置送进深处。等你扑向铁闸，长柄已经先一步卡进锁扣；羽冠后的冷光贴住后背，闸门与退路在同一个声音里合死。",
    "zhugeliang:warehouse": "货架在冷雾里像一排排沉默的坐标，诸葛亮从左到右慢慢走，连你的呼吸都被铁皮地面传成回声。你躲过一次，下一次选择却更像他预先放在那里的答案。等卷帘门升起一半，他那道带着羽冠的长影已经先压在出口前；长柄扫过门轨，最后那点光也被断成两截。"
  };

  // The four routes are authored around the original hero. Cross combinations
  // rewrite narration without touching ids, class names, metrics or asset paths.
  function rewriteHeroNarrative(value, fromHero, toHero) {
    if (typeof value !== "string") return value;
    const hero = CHASE_HERO_CATALOG[toHero];
    if (!hero) return value;
    let text = value
      .replace(/白起|韩信|百里守约|守约|追击者/g, "\u0000CHASE_HERO\u0000")
      .replace(/钩镰线|长枪线|长枪轨迹|枪线|瞄准线/g, "\u0000CHASE_LINE\u0000")
      .replace(/钩镰|长枪|步枪|枪杆/g, "\u0000CHASE_WEAPON\u0000")
      .replace(/镰尖|枪尖|枪口/g, "\u0000CHASE_TIP\u0000")
      .replace(/镰锋|枪锋|准星|红点/g, "\u0000CHASE_SIGHT\u0000")
      .replace(/镰柄|枪尾|枪托/g, "\u0000CHASE_STOCK\u0000")
      .replace(/镰刃|枪光|钩光/g, "\u0000CHASE_GLINT\u0000")
      .replace(/枪声|链声/g, "\u0000CHASE_SOUND\u0000");
    const words = {
      baiqi: {
        line: "钩镰线",
        weapon: "钩镰",
        tip: "镰尖",
        sight: "镰锋",
        stock: "镰柄",
        glint: "钩光",
        sound: "链声"
      },
      hanxin: {
        line: "长枪线",
        weapon: "长枪",
        tip: "枪尖",
        sight: "枪锋",
        stock: "枪尾",
        glint: "枪光",
        sound: "枪声"
      },
      shouyue: {
        line: "瞄准线",
        weapon: "步枪",
        tip: "枪口",
        sight: "准星",
        stock: "枪托",
        glint: "准星反光",
        sound: "枪声"
      },
      zhugeliang: {
        line: "预判线",
        weapon: "长柄",
        tip: "柄端",
        sight: "长影",
        stock: "柄尾",
        glint: "羽冠后的冷光",
        sound: "回声"
      }
    }[toHero];
    text = text.replace(/\u0000CHASE_HERO\u0000/g, hero.name);
    text = text.replace(/\u0000CHASE_LINE\u0000/g, words.line);
    text = text.replace(/\u0000CHASE_WEAPON\u0000/g, words.weapon);
    text = text.replace(/\u0000CHASE_TIP\u0000/g, words.tip);
    text = text.replace(/\u0000CHASE_SIGHT\u0000/g, words.sight);
    text = text.replace(/\u0000CHASE_STOCK\u0000/g, words.stock);
    text = text.replace(/\u0000CHASE_GLINT\u0000/g, words.glint);
    text = text.replace(/\u0000CHASE_SOUND\u0000/g, words.sound);
    if (toHero === "baiqi") text = text.replace(/枪/g, "镰");
    else if (toHero === "hanxin" || toHero === "shouyue") text = text.replace(/镰/g, "枪");
    return text;
  }

  function rewriteNarrativeTree(value, fromHero, toHero) {
    if (typeof value === "string") return rewriteHeroNarrative(value, fromHero, toHero);
    if (Array.isArray(value)) {
      return value.map(function (item) {
        return rewriteNarrativeTree(item, fromHero, toHero);
      });
    }
    if (value && typeof value === "object") {
      const copy = {};
      Object.keys(value).forEach(function (key) {
        copy[key] = rewriteNarrativeTree(value[key], fromHero, toHero);
      });
      return copy;
    }
    return value;
  }

  function comboRecordKey(heroKey, sceneKey) {
    if (heroKey === "baiqi" && sceneKey === "street") return STREET_RECORD_KEY;
    if (heroKey === "hanxin" && sceneKey === "castle") return CASTLE_RECORD_KEY;
    if (heroKey === "baiqi" && sceneKey === "castle") return BAIQI_CASTLE_RECORD_KEY;
    if (heroKey === "hanxin" && sceneKey === "street") return HANXIN_STREET_RECORD_KEY;
    return "woxi_chase_" + heroKey + "_" + sceneKey + "_record_v1";
  }

  function comboId(heroKey, sceneKey) {
    if (heroKey === "baiqi" && sceneKey === "street") return STREET_MODE.id;
    if (heroKey === "hanxin" && sceneKey === "castle") return CASTLE_MODE.id;
    return "chase-" + heroKey + "-" + sceneKey;
  }

  function buildCrossMode(heroKey, sceneKey) {
    const sceneBase = sceneKey === "street"
      ? STREET_MODE
      : (sceneKey === "castle" ? CASTLE_MODE : WAREHOUSE_MODE);
    const hero = CHASE_HERO_CATALOG[heroKey];
    const scene = CHASE_SCENE_CATALOG[sceneKey];
    const assets = CROSS_ASSETS[heroKey + ":" + sceneKey];
    if (!assets) throw new Error("Missing chase assets for " + heroKey + " × " + sceneKey);
    const scenes = rewriteNarrativeTree(sceneBase.scenes, sceneBase.heroKey, heroKey);
    scenes.forEach(function (item) {
      Object.keys(item.actions || {}).forEach(function (actionKey) {
        const action = item.actions[actionKey];
        if (!action) return;
        delete action.spearLine;
        delete action.sightLine;
        if (action.kind === "risk" && heroKey === "hanxin") action.spearLine = true;
        if (action.kind === "risk" && heroKey === "shouyue") action.sightLine = true;
      });
    });
    const isCastle = sceneKey === "castle";
    const isWarehouse = sceneKey === "warehouse";
    const imagePath = function (level) {
      return "generated/" + assets[level] + "-mobile.webp";
    };
    const stageName = isWarehouse
      ? { entry: "装卸平台", racks: "货架迷宫", service: "冷库管线区", finish: "出货闸门" }
      : (isCastle
        ? { entry: "城堡门厅", gallery: "拱窗长廊", undercroft: "地下蓄水间", finish: "城门闸室" }
        : { entry: "旧街入口", flooded: "积水街心", gate: "铁门巷", finish: "出口" });
    const stageTag = isWarehouse
      ? { entry: "踩托盘现身", racks: "货架断线", service: "冷雾逼近", finish: "卷帘门封路" }
      : (isCastle
        ? { entry: "门厅截路", gallery: "侧廊换线", undercroft: "蓄水间逼近", finish: "闸前封门" }
        : { entry: "入口现身", flooded: "黑水围堵", gate: "铁门截路", finish: "出口逼近" });
    const watches = {};
    Object.keys(assets).forEach(function (level) {
      watches[level] = {
        frames: [{
          image: imagePath(level),
          tag: hero.name + " · " + stageTag[level]
        }]
      };
    });
    const shotByScene = {};
    Object.keys(assets).forEach(function (level) {
      shotByScene[level] = imagePath(level);
    });
    const heroStart = {
      baiqi: isWarehouse
        ? "装卸平台、货架迷宫、冷库管线区、出货闸门。白起不守一条固定直线，但铁皮会放大你的脚步；噪声越高，他循声收紧钩镰越快。"
        : sceneBase.startText,
      hanxin: isWarehouse
        ? "装卸平台、货架迷宫、冷库管线区、出货闸门。韩信会把主通道当成截击线；冒险冲直线会被枪锋提前压回，货架拐角才能让他换错方向。"
        : sceneBase.startText,
      shouyue: isWarehouse
        ? "装卸平台、货架迷宫、冷库管线区、出货闸门。守约会占据货架尽头和出货口，用长距离瞄准线提前压近；钻窄缝、切视线，才有机会把他拖进近身范围。"
        : sceneBase.startText,
      zhugeliang: isWarehouse
        ? "装卸平台、货架迷宫、冷库管线区和最后一道卷帘门。诸葛亮会借铁皮回声、叉车报警和冷雾长影预判你的下一格路线；重复同一种走法会被提前封口，临时折返和假坐标才能打乱他的收束。"
        : (isCastle
          ? "古堡门厅、拱窗长廊、地下蓄水间和城门闸室。诸葛亮会把湿石回声、帷幔长影和闸链声拼成一张封锁图；不要让他连续猜中两次，借侧廊夹角和假脚印把他的计算拖慢。"
          : "雨夜旧街、积水街心、铁门巷和最后出口。诸葛亮会借水声、灯下长影和巷口回声推算下一步；避开重复路线，利用垃圾桶盖、废车顶和窄巷制造假坐标，才能抢出他的收束。")
    }[heroKey];
    const heroNarration = heroKey === "zhugeliang"
      ? (isWarehouse
        ? "诸葛亮站在装卸平台尽头，银白羽冠被冷雾托起，长柄轻点铁皮地面。每一次回声落下，他都像在替你提前写好下一步。"
        : (isCastle
          ? "诸葛亮停在古堡门厅尽头，羽冠的长影越过湿石，长柄没有触地。拱窗外的冷光只照亮他的半张脸，退路却已经被影子切开。"
          : "诸葛亮从雨幕深处走来，银白羽冠后的冷光贴着旧街。长柄没有发出一点声音，积水却先替他报出了你的位置。"))
      : rewriteHeroNarrative(sceneBase.startNarration, sceneBase.heroKey, heroKey);
    const sceneKicker = isWarehouse
      ? "ABANDONED WAREHOUSE"
      : (isCastle ? "CASTLE UNDERCROFT" : "FLOODED STREET");
    const mode = Object.assign({}, sceneBase, {
      key: sceneKey,
      sceneKey: sceneKey,
      id: comboId(heroKey, sceneKey),
      hash: "#" + comboId(heroKey, sceneKey),
      recordKey: comboRecordKey(heroKey, sceneKey),
      recordLabel: hero.name + " · " + scene.name + "追逃档案",
      heroKey: heroKey,
      heroName: hero.name,
      eyebrow: "CHASE / 本人模式 · " + scene.name,
      brand: scene.name + "追逃",
      statusLabel: "与" + hero.name + "的距离",
      startSeal: heroKey === "baiqi" ? "03" : (heroKey === "hanxin" ? "04" : (heroKey === "shouyue" ? "05" : "06")),
      startKicker: "CROSS CHASE / " + sceneKicker,
      startTitle: scene.name + "追逃",
      startText: rewriteHeroNarrative(heroStart, sceneBase.heroKey, heroKey),
      startNote: "路线「" + hero.routeStyle + "」 · " + hero.rule + " 场景、追击规则、结局口吻和遭遇镜头都来自当前组合。",
      startNarration: heroNarration,
      startHint: hero.startHint,
      controlsLabel: "当前" + scene.name + "区域可选行动",
      hideLabel: sceneBase.hideLabel,
      hideCopy: rewriteHeroNarrative(sceneBase.hideCopy, sceneBase.heroKey, heroKey),
      hideLeave: sceneBase.hideLeave,
      outcomes: rewriteNarrativeTree(sceneBase.outcomes, sceneBase.heroKey, heroKey),
      roleLabels: rewriteNarrativeTree(sceneBase.roleLabels, sceneBase.heroKey, heroKey),
      actionRoles: sceneBase.actionRoles,
      scenes: scenes,
      captureLines: rewriteNarrativeTree(hero.captureLines, sceneBase.heroKey, heroKey),
      dangerCopies: hero.dangerCopies,
      pursuit: hero.pursuit,
      finalGambitSuccess: function (strong) {
        const exitName = isWarehouse ? "最后一道卷帘门" : (isCastle ? "最后一道铁闸" : "最后一道铁门");
        return strong
          ? (heroKey === "baiqi"
            ? "你借前面留下的余地压进" + exitName + "。白起的钩镰擦过肩甲，没有扣住你。"
            : (heroKey === "hanxin"
              ? "你借侧路留下的空档切进" + exitName + "。韩信的长枪擦过门框，没有来得及回挑。"
              : (heroKey === "shouyue"
                ? "你借货架和叉车切断了瞄准线，贴着" + exitName + "钻出去。守约的最后一枪只打中门框。"
                : "你从诸葛亮算好的下一格之外切进" + exitName + "。长柄擦过羽冠后的冷光，却慢了半拍。")))
          : (heroKey === "baiqi"
            ? "你几乎是摔出" + exitName + "的。白起已经追到伸手可及的位置，钩镰还是慢了半步。"
            : (heroKey === "hanxin"
              ? "你几乎是被" + exitName + "带出去的。韩信追到枪尖可及的位置，闸链还是先一步断开。"
              : (heroKey === "shouyue"
                ? "你几乎是滚出" + exitName + "的。守约已经追到射界边缘，最后一条瞄准线还是被门框截断。"
                : "你几乎是撞出" + exitName + "的。诸葛亮已经追到长柄可及的位置，羽冠后的冷光还是迟了一瞬。")));
      },
      finalGambitFail: heroKey === "baiqi"
        ? "你在最后一刻扑向出口。钩镰先扣住肩膀，把你从门缝前硬生生拖回" + (isWarehouse ? "货架区" : (isCastle ? "石廊" : "雨里")) + "。"
        : (heroKey === "hanxin"
          ? "你扑向出口，枪杆却先横在门前。韩信把你从门槛拖回" + (isWarehouse ? "出货区" : (isCastle ? "长廊" : "积水")) + "。"
          : (heroKey === "shouyue"
            ? "你刚把身体探进门缝，远处的枪声就把退路钉死。守约从货架尽头压过来，把你拖回" + (isWarehouse ? "出货平台" : (isCastle ? "闸室" : "积水")) + "。"
            : "你刚踏出门缝，长柄已经横在颈后。诸葛亮把你拖回" + (isWarehouse ? "冷雾货道" : (isCastle ? "铁闸阴影" : "黑水巷口")) + "，眼前只剩羽冠投下的一格黑影。")),
      hideFailure: function (failedScene) {
        return {
          message: failedScene && failedScene.hide && failedScene.hide.fail
            ? failedScene.hide.fail
            : "藏身处被你的呼吸顶响。外面的脚步停了。",
          hint: hero.name + "已经确认你在这里。",
          caught: "你没能压住那一下喘息。" + (heroKey === "baiqi" ? "钩镰" : (heroKey === "hanxin" ? "枪杆" : (heroKey === "shouyue" ? "枪口" : "长柄"))) + "挑开遮挡时，退路已经被封死。"
        };
      },
      hideReleaseHint: "手指松开的一瞬漏出呼吸。" + hero.name + "的脚步声没有继续往远处走。",
      hideButtonDone: hero.name + "已经从藏身处旁走过去",
      hideNextHint: function (hiddenScene) {
        if (hiddenScene && hiddenScene.id === "undercroft") {
          return "侧沟和水声替你拖住了追击，也耗掉了体力。";
        }
        if (hiddenScene && hiddenScene.id === "service") {
          return "冷雾和管线替你挡住视线，也拖慢了下一段脚步。";
        }
        return "藏身处换来一段距离，但" + hero.name + "已经记住这个角落。";
      },
      hideDefaultSuccess: function (hiddenScene) {
        if (hiddenScene && hiddenScene.hide && hiddenScene.hide.success) return hiddenScene.hide.success;
        return hero.name + "在藏身处旁停了半步。你硬撑着没有出声，直到脚步声重新走远。";
      },
      hideAbort: function (hiddenScene) {
        if (hiddenScene && hiddenScene.id === "undercroft") {
          return "你撞开排水拱洞冲出去。" + hero.name + "立刻从中央石阶转向水声。";
        }
        if (hiddenScene && hiddenScene.id === "service") {
          return "你撞开检修井冲出去。铁架回声让" + hero.name + "立刻转向管线区。";
        }
        return "你撞开遮挡冲出去。响动让" + hero.name + "立刻从侧路折返。";
      },
      watches: watches,
      shotDefault: imagePath("entry"),
      shotClose: imagePath("finish"),
      shotCloseTag: heroKey === "shouyue" ? "守约 · 头部饰品与双靴" : hero.name + " · 武器与双靴",
      shotByScene: shotByScene,
      shotTagByScene: Object.keys(assets).reduce(function (result, level) {
        result[level] = hero.name + " · " + stageName[level] + " · " + stageTag[level];
        return result;
      }, {}),
      pickerRule: "路线「" + hero.routeStyle + "」 · " + hero.rule + " " + scene.rule,
      pickerIntro: COMBO_INTROS[heroKey + ":" + sceneKey] || (hero.rule + " " + scene.rule)
    });
    return mode;
  }

  const CHASE_MODES = {
    street: { baiqi: STREET_MODE },
    castle: { hanxin: CASTLE_MODE },
    warehouse: {}
  };
  CHASE_MODES.street.hanxin = buildCrossMode("hanxin", "street");
  CHASE_MODES.castle.baiqi = buildCrossMode("baiqi", "castle");
  CHASE_MODES.street.shouyue = buildCrossMode("shouyue", "street");
  CHASE_MODES.castle.shouyue = buildCrossMode("shouyue", "castle");
  ["baiqi", "hanxin", "shouyue"].forEach(function (heroKey) {
    CHASE_MODES.warehouse[heroKey] = buildCrossMode(heroKey, "warehouse");
  });
  ["street", "castle", "warehouse"].forEach(function (sceneKey) {
    CHASE_MODES[sceneKey].zhugeliang = buildCrossMode("zhugeliang", sceneKey);
  });

  function getComboMode(heroKey, sceneKey) {
    const hero = CHASE_HERO_CATALOG[heroKey] ? heroKey : "baiqi";
    const scene = CHASE_SCENE_CATALOG[sceneKey] ? sceneKey : "street";
    return CHASE_MODES[scene][hero];
  }

  function resolveLegacyMode(value) {
    if (value === STREET_MODE || value === STREET_MODE.id || value === "chase-baiqi" || value === "street") {
      return getComboMode("baiqi", "street");
    }
    if (value === CASTLE_MODE || value === CASTLE_MODE.id || value === "chase-castle-hanxin" || value === "castle") {
      return getComboMode("hanxin", "castle");
    }
    if (value === "chase-hanxin-street") return getComboMode("hanxin", "street");
    if (value === "chase-baiqi-castle") return getComboMode("baiqi", "castle");
    if (value === "chase-shouyue-street") return getComboMode("shouyue", "street");
    if (value === "chase-shouyue-castle") return getComboMode("shouyue", "castle");
    if (value === "chase-baiqi-warehouse") return getComboMode("baiqi", "warehouse");
    if (value === "chase-hanxin-warehouse") return getComboMode("hanxin", "warehouse");
    if (value === "chase-shouyue-warehouse") return getComboMode("shouyue", "warehouse");
    if (value === "chase-zhugeliang-street") return getComboMode("zhugeliang", "street");
    if (value === "chase-zhugeliang-castle") return getComboMode("zhugeliang", "castle");
    if (value === "chase-zhugeliang-warehouse") return getComboMode("zhugeliang", "warehouse");
    return null;
  }

  function activateMode(mode) {
    const next = mode && mode.heroKey && mode.sceneKey ? mode : (resolveLegacyMode(mode) || getComboMode("baiqi", "street"));
    CHASE_MODE = next;
    CHASE_RECORD_KEY = next.recordKey;
    OUTCOMES = next.outcomes;
    ROLE_LABELS = next.roleLabels;
    ACTION_ROLES = next.actionRoles;
    SCENES = next.scenes;
    STAGE_ACTIONS = next.stageActions;
    SCENE_WATCHES = next.watches;
    if (window.__chaseAudio) window.__chaseAudio.setMode(next.heroKey, next.key);
    state.mode = next.id;
    state.heroKey = next.heroKey;
    state.sceneKey = next.key;
    const game = $("cmGame");
    if (game) {
      ["street", "castle", "warehouse"].forEach(function (sceneKey) {
        game.classList.toggle("cm-mode-" + sceneKey, next.key === sceneKey);
      });
      ["baiqi", "hanxin", "shouyue", "zhugeliang"].forEach(function (heroKey) {
        game.classList.toggle("cm-mode-" + heroKey, next.heroKey === heroKey);
      });
    }
    const setText = function (id, value) {
      const node = $(id);
      if (node) node.textContent = value;
    };
    setText("cmEyebrow", next.eyebrow);
    setText("cmBrand", next.brand);
    setText("cmStatusLabel", next.statusLabel);
    setText("cmStartSeal", next.startSeal);
    setText("cmStartKicker", next.startKicker);
    setText("cmStartTitle", next.startTitle);
    setText("cmStartText", next.startText);
    setText("cmStartNote", next.startNote);
    setText("cmHideLabel", next.hideLabel);
    setText("cmHideCopy", next.hideCopy);
    setText("cmLeaveHide", next.hideLeave);
    const controlsNode = $("cmControls");
    if (controlsNode) controlsNode.setAttribute("aria-label", next.controlsLabel);
    const hideNode = $("cmHidePanel");
    if (hideNode) hideNode.setAttribute("aria-label", next.hideLabel);
    if (shotImage) shotImage.setAttribute("alt", next.heroName + "追捕镜头");
  }

  function clearSceneWatch() {
    if (state.watchTimer) window.clearTimeout(state.watchTimer);
    state.watchTimer = 0;
    shot.classList.remove("encounter-cut");
    $("cmGame").classList.remove("encountering");
  }

  function showSceneWatch(scene) {
    const watch = SCENE_WATCHES[scene.id];
    if (!watch || !state.active || state.hidden || state.ended || state.executing ||
      itemInputLocked() || state.watchSeen[scene.id]) return;
    clearSceneWatch();
    state.watchSeen[scene.id] = true;
    const frame = pick(watch.frames);
    shotImage.setAttribute("src", frame.image);
    shotTag.textContent = frame.tag;
    shot.setAttribute("aria-hidden", "false");
    shot.classList.add("show", "encounter-cut");
    $("cmGame").classList.add("encountering");
    pulse();
    buzz([28, 45, 85]);
    state.watchTimer = window.setTimeout(function () {
      clearSceneWatch();
      if (state.active && !state.ended) render();
    }, 1900);
  }

  function sceneForProgress(progress) {
    const value = clamp(progress, 0, 100);
    return SCENES.filter(function (scene) {
      return value >= scene.min && value <= scene.max;
    })[0] || SCENES[SCENES.length - 1];
  }

  function branchDecks() {
    return HERO_ROUTE_PACKS[CHASE_MODE.key + ":" + CHASE_MODE.heroKey] ||
      BRANCH_PACKS[CHASE_MODE.key] ||
      [];
  }

  function actionsForScene(scene) {
    const decks = branchDecks();
    if (!decks.length || state.branchDepth <= 0) return scene.actions;
    const wave = clamp(state.branchWave, 0, decks.length - 1);
    return decks[wave].reduce(function (actions, action, index) {
      const key = "fork-" + wave + "-" + index;
      actions[key] = Object.assign({}, action, { waveIndex: wave });
      return actions;
    }, {});
  }

  function advanceBranch(choice, role) {
    const decks = branchDecks();
    const roleOrder = {
      street: ["steady", "near", "lure", "recon", "hide"],
      castle: ["flank", "cut", "listen", "feint", "hide"],
      warehouse: ["racks", "aisle", "quiet", "listen", "feint", "hide"]
    }[CHASE_MODE.key] || [];
    const roleStep = Math.max(0, roleOrder.indexOf(role));
    const wave = choice && choice.waveIndex != null ? choice.waveIndex : state.branchWave;
    state.branchWave = decks.length ? (wave + 1 + roleStep) % decks.length : 0;
    state.branchDepth += 1;
    state.lastBranchRole = role;
  }

  function renderActions(scene) {
    state.currentActions = actionsForScene(scene);
    let available = Object.keys(state.currentActions);
    let sealed = false;
    if (state.sealTurns > 0 && available.length > 1) {
      const safeRoles = { steady: 4, quiet: 3, aisle: 2, flank: 1 };
      const sealedKey = available.slice().sort(function (left, right) {
        const leftRole = roleFor(scene.id, left, state.currentActions[left]);
        const rightRole = roleFor(scene.id, right, state.currentActions[right]);
        return (safeRoles[rightRole] || 0) - (safeRoles[leftRole] || 0);
      })[0];
      available = available.filter(function (key) { return key !== sealedKey; });
      sealed = available.length > 0;
    }
    const actionViewId = scene.id + ":" + state.branchDepth + ":" + state.branchWave + ":" + state.sealTurns;
    const changed = state.renderedPhaseId !== actionViewId;
    controls.innerHTML = (sealed
      ? '<div class="cm-controls-alert">封口铁楔：一条稳妥路线已被封死 · 还剩 ' +
        state.sealTurns + ' 回合</div>'
      : "") + available.map(function (key, index) {
      const action = state.currentActions[key];
      const role = roleFor(scene.id, key, action);
      const wide = available.length % 2 === 1 && index === available.length - 1;
      const disabled = itemInputLocked() ||
        (action.minStamina != null && state.stamina < action.minStamina);
      return '<button type="button" class="cm-action ' + (action.kind || "") + (wide ? " wide" : "") + '"' +
        ' data-cm-action="' + key + '"' + (disabled ? " disabled" : "") + '>' +
        '<span class="cm-action-role ' + role + '">' + ROLE_LABELS[role] + '</span>' +
        '<strong>' + action.label + '</strong><small>' +
        (disabled ? "体力不足 · 先找恢复机会" : action.sub) + '</small>' +
        '<small class="cm-action-metrics">' + actionMetrics(action) + '</small></button>';
    }).join("");
    state.renderedPhaseId = actionViewId;
    if (changed && state.active) {
      controls.classList.remove("switching");
      void controls.offsetWidth;
      controls.classList.add("switching");
    }
  }

  function renderHotspot(scene) {
    const visible = state.active && !state.hidden && !state.ended && !state.executing &&
      !state.interactPhaseId && !itemInputLocked();
    hotspot.hidden = !visible;
    if (!scene.hotspot) {
      hotspot.hidden = true;
      return;
    }
    const used = !!state.hotspotsUsed[scene.id];
    hotspot.style.left = scene.hotspot.x;
    hotspot.style.top = scene.hotspot.y;
    hotspot.classList.toggle("used", used);
    hotspot.disabled = used;
    hotspotLabel.textContent = used ? "这里已经用过" : scene.hotspot.label;
    hotspot.setAttribute("aria-label", used ? scene.hotspot.label + "，已经使用" : "场景交互：" + scene.hotspot.label);
  }

  function openInteraction() {
    if (!state.active || state.ended || state.hidden || state.executing || itemInputLocked()) return;
    const scene = sceneForProgress(state.progress);
    if (!scene.hotspot || state.hotspotsUsed[scene.id]) return;
    state.interactPhaseId = scene.id;
    $("cmInteractTitle").textContent = scene.hotspot.title;
    $("cmInteractText").textContent = scene.hotspot.text;
    $("cmInteractGain").textContent = "机会：" + scene.hotspot.gain;
    $("cmInteractRisk").textContent = "代价：" + scene.hotspot.risk;
    interact.hidden = false;
    renderHotspot(scene);
  }

  function closeInteraction() {
    state.interactPhaseId = "";
    interact.hidden = true;
    render();
  }

  function performInteraction() {
    if (!state.interactPhaseId || !state.active || state.ended) return;
    const scene = SCENES.filter(function (item) { return item.id === state.interactPhaseId; })[0];
    if (!scene || !scene.hotspot || state.hotspotsUsed[scene.id]) {
      closeInteraction();
      return;
    }
    state.hotspotsUsed[scene.id] = true;
    state.interactPhaseId = "";
    interact.hidden = true;
    pulse();
    buzz([25, 35, 55]);

    if (CHASE_MODE.key === "street" && scene.id === "flooded") {
      enterHide(scene);
      return;
    }

    const effects = scene.hotspot.effects || {};
    const progress = effects.progress || 0;
    const distance = effects.distance || 0;
    const noise = effects.noise || 0;
    const stamina = effects.stamina || 0;
    state.progress = clamp(state.progress + progress, 0, 100);
    state.distance = clamp(state.distance + distance, 0, 9);
    state.noise = clamp(state.noise + noise, 0, 100);
    state.stamina = clamp(state.stamina + stamina, 0, 100);
    const role = CHASE_MODE.key === "castle" ? "feint" : "lure";
    recordRoute(scene, "hotspot", scene.hotspot.title, role,
      actualMetrics(progress, distance, noise, stamina), scene.hotspot.note || scene.hotspot.hint);
    if (scene.hotspot.shake !== false) overlay.classList.add("cm-shake");
    if (window.__chaseAudio) window.__chaseAudio.playStep("hotspot");
    finishTurn(scene.hotspot.success || scene.hotspot.title, scene.hotspot.hint);
  }

  function dangerCopy() {
    if (state.distance > 6.5) return CHASE_MODE.dangerCopies[0];
    if (state.distance > 3.5) return CHASE_MODE.dangerCopies[1];
    if (state.distance > 1.5) return CHASE_MODE.dangerCopies[2];
    return CHASE_MODE.dangerCopies[3];
  }

  function render() {
    updateRunMetrics();
    renderChaseStats();
    const progressLeft = Math.max(0, 100 - state.progress);
    const scene = sceneForProgress(state.progress);
    state.phaseId = scene.id;
    const showShot = state.active && !state.hidden && !state.ended && state.distance <= 4.2;
    const tension = state.active && !state.hidden && !state.ended && (state.distance <= 4.2 || state.noise >= 58);
    const critical = state.active && !state.hidden && !state.ended && (state.distance <= 2.2 || state.noise >= 82);
    if (window.__chaseAudio) {
      if (showShot) window.__chaseAudio.playVoice("02-close");
      if (critical) window.__chaseAudio.playVoice("03-hunted");
    }
    if (!state.hidden && !state.ended) {
      if (state.distance <= 2.2) setVisual("look-close");
      else if (state.distance <= 4.2) setVisual("look-far");
      else setVisual("");
    }
    visual.classList.toggle("danger", tension);
    visual.classList.toggle("critical", critical);
    shot.classList.toggle("show", showShot);
    if (showShot) {
      const close = state.distance <= 2.2;
      const nextShot = close
        ? CHASE_MODE.shotClose
        : (CHASE_MODE.shotByScene[scene.id] || CHASE_MODE.shotDefault);
      if (shotImage.getAttribute("src") !== nextShot) shotImage.setAttribute("src", nextShot);
      shotTag.textContent = close
        ? CHASE_MODE.shotCloseTag
        : (CHASE_MODE.shotTagByScene[scene.id] || CHASE_MODE.heroName + " · 全身镜头");
    }
    SCENES.forEach(function (item) { visual.classList.remove(item.visual); });
    visual.classList.add(scene.visual);
    sceneName.textContent = scene.name;

    $("cmTurnRead").textContent = "回合 " + Math.min(state.turn, MAX_TURNS) + " / " + MAX_TURNS;
    $("cmDistanceRead").textContent = Math.max(0, state.distance).toFixed(1) + " m";
    $("cmDistanceFill").style.width = clamp(state.distance / 9, 0, 1) * 100 + "%";
    $("cmDistanceFill").style.background = state.distance < 2.5
      ? "linear-gradient(90deg,#b83445,#ff6673)"
      : (state.distance < 4.5
        ? "linear-gradient(90deg,#c67826,#ffc46b)"
        : "linear-gradient(90deg,#20a99c,#5cf8e0)");
    $("cmNoiseRead").textContent = Math.round(state.noise);
    $("cmNoiseFill").style.width = clamp(state.noise, 0, 100) + "%";
    $("cmStaminaRead").textContent = Math.round(state.stamina);
    $("cmStaminaFill").style.width = clamp(state.stamina, 0, 100) + "%";
    $("cmExitRead").textContent = Math.ceil(progressLeft) + " m";
    $("cmEscapeFill").style.width = clamp(state.progress, 0, 100) + "%";
    $("cmDangerState").textContent = dangerCopy();
    $("cmStory").classList.toggle("high", tension);
    $("cmStory").classList.toggle("critical", critical);
    renderActions(scene);
    renderHotspot(scene);
    renderItemHud();
    showSceneWatch(scene);
  }

  function narrate(main, hint) {
    $("cmNarration").textContent = main;
    $("cmWhisper").textContent = hint || "";
  }

  function pulse() {
    const flash = $("cmFlash");
    flash.classList.remove("pulse");
    void flash.offsetWidth;
    flash.classList.add("pulse");
  }

  function buzz(pattern) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  }

  function heroMovesAfterNoise() {
    const noiseBefore = state.noise;
    CHASE_MODE.pursuit();
    if (CHASE_MODE.heroKey === "hanxin" && noiseBefore >= 58) {
      $("cmWhisper").textContent = noiseBefore >= 76
        ? "枪尾突然改了节奏。韩信听见响动，直接换成侧后截线。"
        : "枪尾敲击改变了方向。韩信听见了刚才的响动。";
    } else if (CHASE_MODE.heroKey === "baiqi" && state.noise >= 74) {
      $("cmWhisper").textContent = "雨声没有盖住你的动静，白起改变了方向。";
    } else if (CHASE_MODE.heroKey === "shouyue" && noiseBefore >= 44) {
      $("cmWhisper").textContent = noiseBefore >= 82
        ? "远处的红点已经停在出口方向。守约锁住了你最可能露头的直线。"
        : "枪声改变了方位。守约沿着开阔视线重新压近。";
    }
    state.bestDistance = Math.max(state.bestDistance, state.distance);
  }

  function finishTurn(message, hint) {
    state.turn += 1;
    state.traceTurns = Math.max(0, state.traceTurns - 1);
    state.sealTurns = Math.max(0, state.sealTurns - 1);
    heroMovesAfterNoise();
    updateRunMetrics();
    narrate(message, hint || "");

    if (state.progress >= 100) {
      endGame("escape");
      return;
    }
    if (state.distance <= 0) {
      endGame("caught");
      return;
    }
    if (state.turn > MAX_TURNS) {
      if (window.__chaseAudio) window.__chaseAudio.playVoice("04-last");
      tryFinalGambit();
      return;
    }
    state.hidden = false;
    state.hiddenSceneId = "";
    hidePanel.classList.remove("show");
    controls.style.display = "grid";
    render();
  }

  function runAction(action) {
    if (!state.active || state.ended || state.hidden || itemInputLocked()) return;
    const scene = sceneForProgress(state.progress);
    const actionMap = state.currentActions && state.currentActions[action]
      ? state.currentActions
      : actionsForScene(scene);
    const choice = actionMap[action];
    if (!choice) return;
    if (choice.minStamina != null && state.stamina < choice.minStamina) return;
    $("cmGame").classList.remove("cm-shake");
    void $("cmGame").offsetWidth;

    if (choice.hide) {
      enterHide(scene);
      return;
    }

    const range = choice.progress || [0, 0];
    let gain = range[0] + Math.random() * Math.max(0, range[1] - range[0]);
    let hint = choice.hint || "";
    let text = pick(choice.text || [choice.label]);
    const slipped = choice.slipAt != null && state.noise >= choice.slipAt && Math.random() < .55;
    let distanceDelta = (choice.distance || 0) - (slipped ? .7 : 0);
    let noiseDelta = (choice.noise || 0) + (slipped ? 8 : 0);
    const spearCut = choice.spearLine === true && CHASE_MODE.heroKey === "hanxin";
    const sightCut = choice.sightLine === true && CHASE_MODE.heroKey === "shouyue";
    if (spearCut) {
      gain *= .8;
      distanceDelta -= .85;
      noiseDelta += 6;
      hint = CHASE_MODE.id === "chase-castle-hanxin"
        ? "韩信的枪尖正等你走直线：推进被压回两成，距离和噪声额外受损。"
        : "韩信的长枪正等你走直线：推进被压回两成，距离和噪声额外受损。";
      state.distance = clamp(state.distance, 0, 9);
    }
    if (sightCut) {
      gain *= .82;
      distanceDelta -= .75;
      noiseDelta += 5;
      hint = "守约的瞄准线封住了开阔路线：推进被压低，距离和噪声额外受损。";
    }
    if (slipped) {
      state.slipCount += 1;
      gain *= .45;
      text = pick(choice.slipText || text);
      hint = choice.slipHint || hint;
    }
    if (state.traceTurns > 0) {
      gain *= .7;
      distanceDelta -= .45;
      noiseDelta += 6;
      hint = "追息香把位置暴露给追兵，稳妥路线也被压短。" + (hint || "");
    }

    gain *= ROUTE_GAIN_SCALE;
    state.progress = clamp(state.progress + gain, 0, 100);
    state.distance = clamp(state.distance + distanceDelta, 0, 9);
    state.noise = clamp(state.noise + noiseDelta, 0, 100);
    state.stamina = clamp(state.stamina + (choice.stamina || 0), 0, 100);
    const choiceRole = roleFor(scene.id, action, choice);
    recordRoute(
      scene,
      action,
      choice.label,
      choiceRole,
      actualMetrics(gain, distanceDelta, noiseDelta, choice.stamina || 0),
      spearCut
        ? "枪线截击：推进压低两成，额外损失距离与噪声。"
        : (sightCut
          ? "瞄准线截击：开阔路线让追兵提前压近。"
          : (slipped ? "失足：推进减半，额外增加噪声。" : hint))
    );
    advanceBranch(choice, choiceRole);
    if (window.__chaseAudio) window.__chaseAudio.playStep(action);

    if (choice.shake) {
      overlay.classList.add("cm-shake");
      buzz([35, 35, 70]);
    }
    if (choice.pulse) {
      pulse();
      buzz(45);
    }

    finishTurn(text, hint);
  }

  function enterHide(scene) {
    if (itemInputLocked()) return;
    const spot = scene || sceneForProgress(state.progress);
    state.hidden = true;
    state.holdCompleted = false;
    state.hiddenSceneId = spot.id;
    if (window.__chaseAudio) window.__chaseAudio.playStep("hide");
    controls.style.display = "none";
    hidePanel.classList.add("show");
    setVisual("hide-mode");
    $("cmBreathFill").style.width = "0%";
    $("cmBreathRead").textContent = "0%";
    holdButton.textContent = "按住屏息";
    narrate(
      spot.hide.copy,
      spot.hide.hint
    );
    render();
  }

  function beginHold(event) {
    if (!state.hidden || state.holdCompleted || state.ended || state.holdFrame || itemInputLocked()) return;
    if (event && event.cancelable) event.preventDefault();
    let breath = parseFloat($("cmBreathFill").style.width) || 0;
    state.holdLast = performance.now();
    holdButton.classList.add("holding");
    holdButton.textContent = "正在屏息…";

    const tick = function (now) {
      if (!state.hidden || state.ended) return;
      const dt = Math.min(80, now - state.holdLast);
      state.holdLast = now;
      breath = clamp(breath + dt * .034, 0, 100);
      state.noise = clamp(state.noise + dt * .0058 * (state.traceTurns > 0 ? 3.2 : 1), 0, 100);
      $("cmBreathFill").style.width = breath + "%";
      $("cmBreathRead").textContent = Math.round(breath) + "%";
      render();

      if (state.noise >= 99.5) {
        holdButton.classList.remove("holding");
        state.holdFrame = 0;
        const failedScene = sceneForProgress(state.progress);
        const failure = CHASE_MODE.hideFailure(failedScene);
        recordRoute(failedScene, "hide-failed", "屏息失败", "hide",
          actualMetrics(0, 0, 0, 0), "呼吸漏出，追兵确认了藏身处。");
        narrate(failure.message, failure.hint);
        buzz([20, 30, 20, 30, 120]);
        state.hidden = false;
        window.setTimeout(function () {
          endGame("caught", failure.caught);
        }, 260);
        return;
      }
      if (breath >= 100) {
        completeHide();
        return;
      }
      state.holdFrame = requestAnimationFrame(tick);
    };
    state.holdFrame = requestAnimationFrame(tick);
  }

  function endHold() {
    if (!state.holdFrame || state.holdCompleted || state.ended) return;
    cancelAnimationFrame(state.holdFrame);
    state.holdFrame = 0;
    holdButton.classList.remove("holding");
    holdButton.textContent = "继续按住屏息";
    state.noise = clamp(state.noise + 3, 0, 100);
    $("cmWhisper").textContent = CHASE_MODE.hideReleaseHint;
    render();
  }

  function completeHide() {
    const scene = SCENES.filter(function (item) { return item.id === state.hiddenSceneId; })[0] || sceneForProgress(state.progress);
    const tracedHide = state.traceTurns > 0;
    const hideDistance = tracedHide ? 1.2 : 3.8;
    const hideNoiseCut = tracedHide ? 18 : 38;
    cancelAnimationFrame(state.holdFrame);
    state.holdFrame = 0;
    state.holdCompleted = true;
    if (window.__chaseAudio) window.__chaseAudio.playStep("hide-complete");
    holdButton.classList.remove("holding");
    holdButton.textContent = CHASE_MODE.hideButtonDone;
    state.progress = clamp(state.progress + 4, 0, 100);
    state.distance = clamp(state.distance + hideDistance, 0, 9);
    state.noise = clamp(state.noise - hideNoiseCut, 0, 100);
    state.stamina = clamp(state.stamina + 7, 0, 100);
    const hideKey = Object.keys(scene.actions).filter(function (key) {
      return scene.actions[key].hide;
    })[0] || "hide";
    const hideAction = scene.actions[hideKey] || { label: "藏进阴影屏息" };
    recordRoute(scene, hideKey, hideAction.label, "hide",
      actualMetrics(4, 3.8, -38, 7), "屏息成功，" + CHASE_MODE.heroName + "从藏身处旁走过。");
    buzz(35);
    if (state.routeLog.length) {
      state.routeLog[state.routeLog.length - 1].metrics = actualMetrics(4, hideDistance, -hideNoiseCut, 7);
      if (tracedHide) state.routeLog[state.routeLog.length - 1].note = "追息香持续暴露位置，屏息只换来很短的安全距离。";
    }
    finishTurn(
      CHASE_MODE.hideDefaultSuccess(scene),
      (tracedHide ? "追息香还在烧，藏身位置已经暴露。" : "") + CHASE_MODE.hideNextHint(scene)
    );
  }

  function leaveHide() {
    if (!state.hidden || state.ended || itemInputLocked()) return;
    if (state.holdFrame) {
      cancelAnimationFrame(state.holdFrame);
      state.holdFrame = 0;
    }
    state.hidden = false;
    state.noise = clamp(state.noise + 26, 0, 100);
    state.stamina = clamp(state.stamina - 8, 0, 100);
    setVisual("");
    overlay.classList.add("cm-shake");
    pulse();
    buzz([25, 40, 70]);
    if (window.__chaseAudio) window.__chaseAudio.playStep("sprint");
    const hidingScene = SCENES.filter(function (item) { return item.id === state.hiddenSceneId; })[0] ||
      sceneForProgress(state.progress);
    recordRoute(hidingScene, "hide-abort", "提前冲出藏身处", "hide",
      actualMetrics(0, 0, 26, -8), "藏不住了，响动暴露了位置。");
    finishTurn(CHASE_MODE.hideAbort(hidingScene), "你争取到一点时间，也把准确位置交给了他。");
  }

  function saveRunRecord(outcomeKey) {
    const record = loadChaseRecord();
    if (state.recordSaved) return record;
    state.recordSaved = true;
    const score = gradeRun(outcomeKey);
    const elapsed = clamp(state.turn - 1, 1, MAX_TURNS);
    record.attempts += 1;
    if (outcomeKey === "silent" || outcomeKey === "extreme") {
      record.escapes += 1;
      record.fastestEscape = record.fastestEscape == null
        ? elapsed
        : Math.min(record.fastestEscape, elapsed);
    } else {
      record.caught += 1;
    }
    record[outcomeKey] = (record[outcomeKey] || 0) + 1;
    record.bestDistance = Math.max(record.bestDistance || 0, state.bestDistance);
    record.bestScore = Math.max(record.bestScore || 0, score.score);
    try {
      window.localStorage.setItem(CHASE_RECORD_KEY, JSON.stringify(record));
    } catch (error) {}
    return record;
  }

  function renderRouteRecap() {
    const list = $("cmRouteList");
    list.innerHTML = "";
    state.routeLog.slice(-10).forEach(function (entry) {
      const item = document.createElement("li");
      const title = document.createElement("b");
      const scene = document.createElement("span");
      const metrics = document.createElement("small");
      title.textContent = entry.label;
      scene.textContent = " · " + entry.scene + " · " +
        (ROLE_LABELS[entry.role] || (entry.role === "item" ? "契约道具" : "未知路线"));
      metrics.textContent = entry.metrics + (entry.note ? " · " + entry.note : "");
      item.appendChild(title);
      item.appendChild(scene);
      item.appendChild(metrics);
      list.appendChild(item);
    });
    if (!state.routeLog.length) {
      const item = document.createElement("li");
      item.textContent = "这一局还没有留下可复盘的路线。";
      list.appendChild(item);
    }
  }

  function showResult(type, customText) {
    const caught = type === "caught";
    const outcomeKey = classifyOutcome(type);
    const outcome = OUTCOMES[outcomeKey];
    const grade = gradeRun(outcomeKey);
    const record = saveRunRecord(outcomeKey);
    state.outcome = outcomeKey;
    renderChaseStats();

    $("cmEndModal").hidden = false;
    $("cmEndCard").classList.toggle("caught", caught);
    $("cmEndCard").setAttribute("data-outcome", outcomeKey);
    $("cmEndKicker").textContent = outcome.kicker;
    $("cmEndTitle").textContent = outcome.title;
    $("cmEndText").textContent = customText || outcome.copy;
    $("cmOutcomeBadge").textContent = outcome.title;
    $("cmResultGrade").textContent = "评价 " + grade.grade + " · " + grade.score + " 分";
    $("cmResultTurn").textContent = String(clamp(state.turn - 1, 1, MAX_TURNS));
    $("cmResultDistance").textContent = Math.max(0, Math.round(state.bestDistance)) + "m";
    $("cmResultEscape").textContent = Math.round(state.progress) + "%";
    $("cmResultNoise").textContent = String(Math.round(state.peakNoise));
    $("cmResultStamina").textContent = String(Math.round(state.minStamina));
    $("cmResultActions").textContent = String(state.routeLog.length);
    renderRouteRecap();
    $("cmRunRecord").textContent = "累计 " + record.attempts + " 局 · 逃脱 " + record.escapes +
      " / 被擒 " + record.caught + " · 最高评价 " + (record.bestScore || grade.score) + " 分";
    $("cmStartRecord").textContent = formatChaseRecord();
  }

  function enterExecution(customText) {
    if (state.executing) return;
    state.executing = true;
    state.distance = 0;
    if (window.__chaseAudio) {
      window.__chaseAudio.stopVoice();
      window.__chaseAudio.playVoice("05-execution");
    }
    setVisual("look-close");
    $("cmDangerState").textContent = CHASE_MODE.dangerCopies[3];
    narrate(pick(CHASE_MODE.captureLines), "追逃结束。正在接入处刑。");
    pulse();
    buzz([80, 50, 140]);

    const finishExecution = function () {
      state.executing = false;
      showResult("caught", customText);
    };

    window.setTimeout(function () {
      if (typeof window.__chaseBrutal === "function") {
        const brutalHeroKey = CHASE_MODE.heroKey === "shouyue"
          ? "baishouyue"
          : CHASE_MODE.heroKey;
        const started = window.__chaseBrutal(brutalHeroKey, CHASE_MODE.sceneKey, finishExecution);
        if (started) return;
      }
      finishExecution();
    }, 520);
  }

  function endGame(type, customText) {
    if (state.ended) return;
    state.ended = true;
    state.active = false;
    state.itemEventOpen = false;
    state.itemAutoQueue = [];
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    pendingItemEvent = null;
    if (itemEvent) itemEvent.hidden = true;
    if (itemHud) itemHud.hidden = true;
    clearSceneWatch();
    if (state.holdFrame) cancelAnimationFrame(state.holdFrame);
    state.holdFrame = 0;
    holdButton.classList.remove("holding");
    controls.style.display = "none";
    hidePanel.classList.remove("show");
    hotspot.hidden = true;
    interact.hidden = true;
    state.interactPhaseId = "";

    if (type === "caught") {
      enterExecution(customText || "");
      return;
    }
    state.distance = Math.max(state.distance, 2);
    setVisual("look-far");
    render();
    showResult("escape");
  }

  function resetGame() {
    clearSceneWatch();
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    if (window.__chaseAudio) window.__chaseAudio.beginRun(CHASE_MODE.heroKey, CHASE_MODE.key);
    Object.assign(state, {
      turn: 1,
      distance: 9,
      noise: 20,
      stamina: 100,
      progress: 0,
      bestDistance: 9,
      active: true,
      hidden: false,
      holdCompleted: false,
      hiddenSceneId: "",
      hotspotsUsed: {},
      phaseId: "entry",
      renderedPhaseId: "",
      ended: false,
      executing: false,
      interactPhaseId: "",
      watchSeen: {},
      watchTimer: 0,
      holdFrame: 0,
      holdLast: 0,
      peakNoise: 20,
      minStamina: 100,
      routeLog: [],
      actionsUsed: {},
      branchDepth: 0,
      branchWave: 0,
      currentActions: {},
      lastBranchRole: "",
      hideCount: 0,
      slipCount: 0,
      finalGambit: false,
      outcome: "",
      recordSaved: false,
      itemLoadout: activeLoadout.map(function (entry) {
        return { id: entry.id, mode: entry.mode, used: false };
      }),
      itemUsed: {},
      itemEventOpen: false,
      itemAutoQueue: [],
      itemAutoTimer: 0,
      traceTurns: 0,
      sealTurns: 0
    });
    pendingItemEvent = null;
    setVisual("");
    controls.style.display = "grid";
    hidePanel.classList.remove("show");
    interact.hidden = true;
    hotspot.hidden = true;
    $("cmEndModal").hidden = true;
    $("cmStartModal").hidden = true;
    if (itemEvent) itemEvent.hidden = true;
    $("cmBreathFill").style.width = "0%";
    $("cmBreathRead").textContent = "0%";
    $("cmStartRecord").textContent = formatChaseRecord();
    narrate(CHASE_MODE.startNarration, CHASE_MODE.startHint);
    render();
    if (window.__chaseAudio) window.__chaseAudio.playVoice("01-entry");
    queueAutomaticItems();
  }

  function formatComboRecord(mode) {
    const record = loadChaseRecordByKey(mode.recordKey);
    if (!record.attempts) return "尚无记录";
    const fastest = record.fastestEscape == null ? "—" : record.fastestEscape + " 回合";
    return record.escapes + " 次逃脱 / " + record.caught + " 次被擒 · 最快 " + fastest +
      " · 最远 " + Math.round(record.bestDistance) + " m";
  }

  function updatePicker() {
    if (!picker) return;
    renderChaseStats();
    Array.prototype.forEach.call(picker.querySelectorAll("[data-cm-hero]"), function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-cm-hero") === selection.hero ? "true" : "false");
    });
    Array.prototype.forEach.call(picker.querySelectorAll("[data-cm-scene]"), function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-cm-scene") === selection.scene ? "true" : "false");
    });
    const mode = getComboMode(selection.hero, selection.scene);
    const hero = CHASE_HERO_CATALOG[selection.hero];
    const scene = CHASE_SCENE_CATALOG[selection.scene];
    if (comboTitle) comboTitle.textContent = hero.name + " × " + scene.name;
    if (comboRule) comboRule.textContent = mode.pickerRule || (hero.rule + " " + scene.rule);
    if (comboIntro) comboIntro.textContent = mode.pickerIntro ||
      COMBO_INTROS[selection.hero + ":" + selection.scene] ||
      mode.pickerRule || (hero.rule + " " + scene.rule);
    if (comboRecord) comboRecord.textContent = formatComboRecord(mode);
    if (comboArt) comboArt.style.backgroundImage = "url(\"" + mode.shotByScene.entry + "\")";
    if (pickerStart) pickerStart.textContent = "下一步：选择道具 · " + hero.name + " × " + scene.name;
  }

  function selectCombo(heroKey, sceneKey) {
    if (CHASE_HERO_CATALOG[heroKey]) selection.hero = heroKey;
    if (CHASE_SCENE_CATALOG[sceneKey]) selection.scene = sceneKey;
    updatePicker();
  }

  function openPicker() {
    if (window.__chaseAudio) window.__chaseAudio.stopAll();
    document.querySelectorAll("#app .overlay.show").forEach(function (node) {
      if (node !== overlay) node.classList.remove("show");
    });
    clearSceneWatch();
    if (state.holdFrame) cancelAnimationFrame(state.holdFrame);
    state.holdFrame = 0;
    state.active = false;
    state.ended = true;
    state.executing = false;
    state.hidden = false;
    state.interactPhaseId = "";
    state.itemEventOpen = false;
    state.itemAutoQueue = [];
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    if (picker) picker.classList.remove("loadout-open");
    if (loadout) loadout.hidden = true;
    if (itemEvent) itemEvent.hidden = true;
    if (itemHud) itemHud.hidden = true;
    overlay.classList.add("show", "cm-picking");
    overlay.setAttribute("aria-hidden", "false");
    if (picker) picker.hidden = false;
    $("cmGame").setAttribute("aria-hidden", "true");
    $("cmEndModal").hidden = true;
    $("cmStartModal").hidden = true;
    interact.hidden = true;
    hotspot.hidden = true;
    updatePicker();
  }

  function enterCombo(modeOrHero, sceneKey) {
    let mode = modeOrHero && modeOrHero.heroKey && modeOrHero.sceneKey
      ? modeOrHero
      : resolveLegacyMode(modeOrHero);
    if (!mode && typeof modeOrHero === "string" && typeof sceneKey === "string") {
      mode = getComboMode(modeOrHero, sceneKey);
    }
    mode = mode || getComboMode(selection.hero, selection.scene);
    selection.hero = mode.heroKey;
    selection.scene = mode.sceneKey || mode.key;
    updatePicker();
    activateMode(mode);
    document.querySelectorAll("#app .overlay.show").forEach(function (node) {
      if (node !== overlay) node.classList.remove("show");
    });
    overlay.classList.add("show");
    overlay.classList.remove("cm-picking");
    overlay.setAttribute("aria-hidden", "false");
    if (picker) picker.hidden = true;
    if (loadout) loadout.hidden = true;
    if (picker) picker.classList.remove("loadout-open");
    if (itemEvent) itemEvent.hidden = true;
    if (itemHud) itemHud.hidden = true;
    $("cmGame").setAttribute("aria-hidden", "false");
    $("cmEndModal").hidden = true;
    $("cmStartModal").hidden = false;
    interact.hidden = true;
    hotspot.hidden = true;
    state.active = false;
    state.ended = false;
    state.executing = false;
    state.interactPhaseId = "";
    $("cmStartRecord").textContent = formatChaseRecord();
    clearSceneWatch();
    setVisual("");
    render();
  }

  function openChase(mode) {
    if (mode) enterCombo(mode);
    else openPicker();
  }

  function returnToPicker() {
    if (window.__chaseAudio) window.__chaseAudio.stopAll();
    clearSceneWatch();
    if (state.holdFrame) cancelAnimationFrame(state.holdFrame);
    state.holdFrame = 0;
    state.active = false;
    state.ended = true;
    state.executing = false;
    state.hidden = false;
    state.interactPhaseId = "";
    state.itemEventOpen = false;
    state.itemAutoQueue = [];
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    if (loadout) loadout.hidden = true;
    if (picker) picker.classList.remove("loadout-open");
    if (itemEvent) itemEvent.hidden = true;
    if (itemHud) itemHud.hidden = true;
    if (typeof closeInteraction === "function") {
      interact.hidden = true;
      state.interactPhaseId = "";
    }
    $("cmStartModal").hidden = true;
    $("cmEndModal").hidden = true;
    controls.style.display = "grid";
    hidePanel.classList.remove("show");
    hotspot.hidden = true;
    overlay.classList.add("show", "cm-picking");
    overlay.setAttribute("aria-hidden", "false");
    if (picker) picker.hidden = false;
    $("cmGame").setAttribute("aria-hidden", "true");
    updatePicker();
  }

  function chaseBack() {
    if (state.itemEventOpen) return;
    if (picker && picker.classList.contains("loadout-open")) {
      closeLoadout();
      return;
    }
    if (overlay.classList.contains("show") && !overlay.classList.contains("cm-picking")) {
      returnToPicker();
      return;
    }
    closeChase();
  }

  function closeChase() {
    if (window.__chaseAudio) window.__chaseAudio.stopAll();
    clearSceneWatch();
    state.itemEventOpen = false;
    state.itemAutoQueue = [];
    if (state.itemAutoTimer) window.clearTimeout(state.itemAutoTimer);
    state.itemAutoTimer = 0;
    pendingItemEvent = null;
    if (itemEvent) itemEvent.hidden = true;
    if (itemHud) itemHud.hidden = true;
    if (loadout) loadout.hidden = true;
    if (picker) picker.classList.remove("loadout-open");
    if (state.holdFrame) cancelAnimationFrame(state.holdFrame);
    state.holdFrame = 0;
    state.active = false;
    state.ended = true;
    overlay.classList.remove("show", "cm-picking");
    overlay.setAttribute("aria-hidden", "true");
    if (picker) picker.hidden = true;
    $("cmGame").setAttribute("aria-hidden", "true");
    selectOverlay.classList.add("show");
    try {
      if (/[?&]mode=chase-/.test(window.location.search) || /^#chase-/.test(window.location.hash)) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (error) {}
  }

  controls.addEventListener("click", function (event) {
    const button = event.target && event.target.closest ? event.target.closest("[data-cm-action]") : null;
    if (button && !button.disabled) runAction(button.getAttribute("data-cm-action"));
  });

  if (entryButton) entryButton.addEventListener("click", openPicker);
  if (pickerClose) pickerClose.addEventListener("click", closeChase);
  if (pickerStart) pickerStart.addEventListener("click", openLoadout);
  if (loadoutBack) loadoutBack.addEventListener("click", closeLoadout);
  if (loadoutStart) loadoutStart.addEventListener("click", beginLoadedRun);
  if (loadoutGrid) {
    loadoutGrid.addEventListener("click", function (event) {
      const modeButton = event.target && event.target.closest
        ? event.target.closest("[data-item-mode]")
        : null;
      const removeButton = event.target && event.target.closest
        ? event.target.closest("[data-item-remove]")
        : null;
      if (modeButton && !modeButton.disabled) {
        chooseLoadoutItem(modeButton.getAttribute("data-item-id"), modeButton.getAttribute("data-item-mode"));
      } else if (removeButton) {
        removeLoadoutItem(removeButton.getAttribute("data-item-remove"));
      }
    });
  }
  if (picker) {
    picker.addEventListener("click", function (event) {
      const heroButton = event.target && event.target.closest ? event.target.closest("[data-cm-hero]") : null;
      const sceneButton = event.target && event.target.closest ? event.target.closest("[data-cm-scene]") : null;
      if (heroButton) selectCombo(heroButton.getAttribute("data-cm-hero"), selection.scene);
      if (sceneButton) selectCombo(selection.hero, sceneButton.getAttribute("data-cm-scene"));
    });
  }
  if (itemHudList) {
    itemHudList.addEventListener("click", function (event) {
      const button = event.target && event.target.closest
        ? event.target.closest("[data-item-use]")
        : null;
      if (button && !button.disabled) triggerItem(button.getAttribute("data-item-use"));
    });
  }
  if (itemEventContinue) itemEventContinue.addEventListener("click", finishItemEvent);
  startButton.addEventListener("click", resetGame);
  againButton.addEventListener("click", resetGame);
  exitButton.addEventListener("click", chaseBack);
  backButton.addEventListener("click", returnToPicker);
  hotspot.addEventListener("click", openInteraction);
  $("cmInteractDo").addEventListener("click", performInteraction);
  $("cmInteractCancel").addEventListener("click", closeInteraction);
  leaveHideButton.addEventListener("click", leaveHide);
  holdButton.addEventListener("pointerdown", beginHold);
  holdButton.addEventListener("pointerup", endHold);
  holdButton.addEventListener("pointercancel", endHold);
  holdButton.addEventListener("pointerleave", endHold);
  shotImage.addEventListener("load", function () {
    shotImage.removeAttribute("data-retry");
  });
  shotImage.addEventListener("error", function () {
    const src = shotImage.getAttribute("src") || "";
    const retry = Number(shotImage.getAttribute("data-retry") || 0);
    if (!src || src.indexOf("?retry=") >= 0 || retry >= 2) return;
    shotImage.setAttribute("data-retry", String(retry + 1));
    window.setTimeout(function () {
      shotImage.src = src.split("?")[0] + "?retry=" + (retry + 1);
    }, 700 * (retry + 1));
  });

  window.addEventListener("keydown", function (event) {
    if (event.code === "Space" && state.hidden) beginHold(event);
    if (event.code === "Escape") {
      if (state.interactPhaseId) closeInteraction();
      else if (overlay.classList.contains("show")) chaseBack();
    }
  });
  window.addEventListener("keyup", function (event) {
    if (event.code === "Space" && state.hidden) endHold();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && state.hidden) endHold();
  });

  const chaseAssets = window.CHASE_GALLERY_ASSETS || [];
  const chaseQueue = [
    "generated/chase-baiqi-street-full-v2-mobile.webp",
    "generated/chase-scene-01-entry-mobile.webp",
    "generated/chase-baiqi-street-boots-v2-mobile.webp",
    "generated/chase-scene-02-flooded-mobile.webp",
    "generated/chase-castle-01-entry-mobile.webp",
    "generated/chase-castle-02-gallery-mobile.webp",
    "generated/chase-castle-03-undercroft-mobile.webp",
    "generated/chase-castle-04-gate-mobile.webp",
    "generated/chase-hanxin-castle-entry-v1-mobile.webp",
    "generated/chase-hanxin-castle-gallery-v1-mobile.webp",
    "generated/chase-hanxin-castle-undercroft-v1-mobile.webp",
    "generated/chase-hanxin-castle-gate-v1-mobile.webp"
  ].concat(chaseAssets.map(function (item) {
    return "generated/" + (item.p || item.f);
  })).filter(function (src, index, list) {
    return list.indexOf(src) === index;
  });
  let chasePreloading = 0;
  let chaseQueueIndex = 0;
  let chaseDeferredStarted = false;
  const CHASE_INITIAL_LIMIT = 6;
  function preloadNextChaseImage() {
    if (chaseQueueIndex >= chaseQueue.length) return;
    if (!chaseDeferredStarted && chaseQueueIndex >= CHASE_INITIAL_LIMIT) return;
    const concurrency = chaseDeferredStarted ? 1 : 2;
    if (chasePreloading >= concurrency) return;
    const image = new Image();
    const done = function () {
      chasePreloading = Math.max(0, chasePreloading - 1);
      preloadNextChaseImage();
    };
    chasePreloading += 1;
    image.decoding = "async";
    image.onload = done;
    image.onerror = done;
    image.src = chaseQueue[chaseQueueIndex++];
  }
  for (let i = 0; i < 2; i++) preloadNextChaseImage();
  setTimeout(function () {
    chaseDeferredStarted = true;
    preloadNextChaseImage();
  }, 10000);

  window.__chaseMode = {
    open: openPicker,
    openCombo: function (heroKey, sceneKey) {
      activeLoadout = [];
      loadoutSelection.length = 0;
      renderLoadout();
      enterCombo(heroKey, sceneKey);
    },
    openLoadout: openLoadout,
    closeLoadout: closeLoadout,
    setLoadout: function (entries) {
      activeLoadout = [];
      loadoutSelection.length = 0;
      (Array.isArray(entries) ? entries : []).slice(0, 2).forEach(function (entry) {
        if (!entry || !itemDefinition(entry.id) || selectedLoadoutEntry(entry.id)) return;
        loadoutSelection.push({
          id: entry.id,
          mode: entry.mode === "auto" ? "auto" : "assist"
        });
      });
      renderLoadout();
      return loadoutSelection.map(function (entry) { return Object.assign({}, entry); });
    },
    startLoadout: beginLoadedRun,
    chooseItem: chooseLoadoutItem,
    removeItem: removeLoadoutItem,
    useItem: triggerItem,
    finishItem: finishItemEvent,
    loadout: function () {
      return loadoutSelection.map(function (entry) { return Object.assign({}, entry); });
    },
    items: function () {
      return (window.CHASE_ITEMS || []).map(function (item) { return Object.assign({}, item); });
    },
    back: chaseBack,
    picker: updatePicker,
    close: closeChase,
    restart: resetGame,
    render: render,
    record: loadChaseRecord,
    state: state,
    maxTurns: MAX_TURNS,
    routeGainScale: ROUTE_GAIN_SCALE,
    selections: function () { return { hero: selection.hero, scene: selection.scene }; },
    modes: function () { return Object.keys(CHASE_MODES).reduce(function (result, sceneKey) {
      result[sceneKey] = Object.keys(CHASE_MODES[sceneKey]);
      return result;
    }, {}); },
    mode: function () { return CHASE_MODE.id; },
    hero: function () { return CHASE_MODE.heroKey; },
    scene: function () { return CHASE_MODE.sceneKey || CHASE_MODE.key; },
    routes: function (heroKey, sceneKey) {
      const decks = HERO_ROUTE_PACKS[sceneKey + ":" + heroKey] || BRANCH_PACKS[sceneKey] || [];
      return decks.map(function (deck) {
        return deck.map(function (action) {
          return { role: action.role, label: action.label, hint: action.hint };
        });
      });
    }
  };

  const params = new URLSearchParams(window.location.search);
  const requestedHero = params.get("hero");
  const requestedScene = params.get("scene");
  activateMode(requestedHero && requestedScene
    ? getComboMode(requestedHero, requestedScene)
    : STREET_MODE);
  const requestedMode = params.get("mode") || window.location.hash.replace(/^#/, "");
  if (resolveLegacyMode(requestedMode)) {
    window.setTimeout(function () { openChase(requestedMode); }, 180);
  }
})();
