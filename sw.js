/* 离线缓存: 首页秒开 + 整包后台打包进手机, 装到主屏幕后没网也能玩 */
const CACHE = 'woxi-web-aa5dd55a7e';
const ALL = ["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png","./brutal-scenes.js","./brutal-gallery.js","./chase-mode.css","./chase-mode.js","./chase-street-baiqi.html","./generated/baiqi-defeat.jpg","./generated/baishouyue-defeat.jpg","./generated/black-pet.png","./generated/brutal-belly-baishouyue-01.jpg","./generated/brutal-belly-baishouyue-02.jpg","./generated/brutal-belly-baishouyue-03.jpg","./generated/brutal-belly-hanxin-01.jpg","./generated/brutal-belly-hanxin-02.jpg","./generated/brutal-belly-hanxin-03.jpg","./generated/brutal-belly-lan-01.jpg","./generated/brutal-belly-lan-02.jpg","./generated/brutal-belly-lan-03.jpg","./generated/brutal-belly-zhugeliang-01.jpg","./generated/brutal-belly-zhugeliang-02.jpg","./generated/brutal-belly-zhugeliang-03.jpg","./generated/brutal-chain-baiqi-01a.jpg","./generated/brutal-chain-baiqi-01b.jpg","./generated/brutal-chain-lan-01b.jpg","./generated/brutal-chain-shenzui-01a.jpg","./generated/brutal-chain-shenzui-01b.jpg","./generated/brutal-chain-zhugeliang-01a.jpg","./generated/brutal-chain-zhugeliang-01b.jpg","./generated/brutal-chest-baishouyue-01.jpg","./generated/brutal-chest-baishouyue-02.jpg","./generated/brutal-chest-baishouyue-03.jpg","./generated/brutal-chest-hanxin-01.jpg","./generated/brutal-chest-hanxin-02.jpg","./generated/brutal-chest-hanxin-03.jpg","./generated/brutal-chest-lan-01.jpg","./generated/brutal-chest-lan-02.jpg","./generated/brutal-chest-lan-03.jpg","./generated/brutal-chest-zhugeliang-01.jpg","./generated/brutal-chest-zhugeliang-02.jpg","./generated/brutal-chest-zhugeliang-03.jpg","./generated/brutal-cmd102-baishouyue-01a.jpg","./generated/brutal-cmd102-baishouyue-01b.jpg","./generated/brutal-cmd102-baishouyue-02a.jpg","./generated/brutal-cmd102-baishouyue-03a.jpg","./generated/brutal-cmd102-baishouyue-03b.jpg","./generated/brutal-cmd102-baishouyue-04b.jpg","./generated/brutal-cmd102-baishouyue-05a.jpg","./generated/brutal-cmd102-baishouyue-05b.jpg","./generated/brutal-cmd102-baishouyue-06a.jpg","./generated/brutal-cmd102-baishouyue-06b.jpg","./generated/brutal-cmd102-baishouyue-07a.jpg","./generated/brutal-cmd102-baishouyue-07b.jpg","./generated/brutal-cmd102-baishouyue-08a.jpg","./generated/brutal-cmd102-baishouyue-08b.jpg","./generated/brutal-cmd102-baishouyue-09a.jpg","./generated/brutal-cmd102-baishouyue-09b.jpg","./generated/brutal-cmd102-baishouyue-10a.jpg","./generated/brutal-cmd102-baishouyue-10b.jpg","./generated/brutal-cmd102-hanxin-01a.jpg","./generated/brutal-cmd102-hanxin-01b.jpg","./generated/brutal-cmd102-hanxin-02a.jpg","./generated/brutal-cmd102-hanxin-02b.jpg","./generated/brutal-cmd102-hanxin-03a.jpg","./generated/brutal-cmd102-hanxin-03b.jpg","./generated/brutal-cmd102-hanxin-04a.jpg","./generated/brutal-cmd102-hanxin-04b.jpg","./generated/brutal-cmd102-hanxin-05a.jpg","./generated/brutal-cmd102-hanxin-05b.jpg","./generated/brutal-cmd102-hanxin-06a.jpg","./generated/brutal-cmd102-hanxin-06b.jpg","./generated/brutal-cmd102-hanxin-07a.jpg","./generated/brutal-cmd102-hanxin-07b.jpg","./generated/brutal-cmd102-hanxin-08a.jpg","./generated/brutal-cmd102-hanxin-08b.jpg","./generated/brutal-cmd102-hanxin-09a.jpg","./generated/brutal-cmd102-hanxin-09b.jpg","./generated/brutal-cmd102-hanxin-10a.jpg","./generated/brutal-cmd102-hanxin-10b.jpg","./generated/brutal-headlock-baiqi-02a.jpg","./generated/brutal-headlock-baiqi-02b.jpg","./generated/brutal-headlock-lan-02a.jpg","./generated/brutal-headlock-lan-02b.jpg","./generated/brutal-headlock-shenzui-02a.jpg","./generated/brutal-headlock-shenzui-02b.jpg","./generated/brutal-headlock-zhugeliang-02a.jpg","./generated/brutal-headlock-zhugeliang-02b.jpg","./generated/brutal-leg-baiqi-01.jpg","./generated/brutal-leg-baiqi-02.jpg","./generated/brutal-leg-baiqi-03.jpg","./generated/brutal-leg-baiqi-04.jpg","./generated/brutal-leg-baiqi-05.jpg","./generated/brutal-leg-baiqi-06.jpg","./generated/brutal-leg-baiqi-07.jpg","./generated/brutal-leg-baiqi-08.jpg","./generated/brutal-leg-baiqi-09.jpg","./generated/brutal-leg-baiqi-10.jpg","./generated/brutal-leg-baishouyue-01.jpg","./generated/brutal-leg-baishouyue-02.jpg","./generated/brutal-leg-baishouyue-03.jpg","./generated/brutal-leg-baishouyue-04.jpg","./generated/brutal-leg-baishouyue-05.jpg","./generated/brutal-leg-baishouyue-06.jpg","./generated/brutal-leg-baishouyue-07.jpg","./generated/brutal-leg-baishouyue-08.jpg","./generated/brutal-leg-baishouyue-09.jpg","./generated/brutal-leg-baishouyue-10.jpg","./generated/brutal-leg-hanxin-01.jpg","./generated/brutal-leg-hanxin-02.jpg","./generated/brutal-leg-hanxin-03.jpg","./generated/brutal-leg-hanxin-04.jpg","./generated/brutal-leg-hanxin-05.jpg","./generated/brutal-leg-hanxin-06.jpg","./generated/brutal-leg-hanxin-07.jpg","./generated/brutal-leg-hanxin-08.jpg","./generated/brutal-leg-hanxin-09.jpg","./generated/brutal-leg-hanxin-10.jpg","./generated/brutal-leg-lan-01.jpg","./generated/brutal-leg-lan-02.jpg","./generated/brutal-leg-lan-03.jpg","./generated/brutal-leg-lan-04.jpg","./generated/brutal-leg-lan-05.jpg","./generated/brutal-leg-lan-06.jpg","./generated/brutal-leg-lan-07.jpg","./generated/brutal-leg-lan-08.jpg","./generated/brutal-leg-lan-09.jpg","./generated/brutal-leg-lan-10.jpg","./generated/brutal-leg-zhugeliang-01.jpg","./generated/brutal-leg-zhugeliang-02.jpg","./generated/brutal-leg-zhugeliang-03.jpg","./generated/brutal-leg-zhugeliang-04.jpg","./generated/brutal-leg-zhugeliang-05.jpg","./generated/brutal-leg-zhugeliang-06.jpg","./generated/brutal-leg-zhugeliang-07.jpg","./generated/brutal-leg-zhugeliang-08.jpg","./generated/brutal-leg-zhugeliang-09.jpg","./generated/brutal-leg-zhugeliang-10.jpg","./generated/chase-baiqi-castle-entry-v1-mobile.webp","./generated/chase-baiqi-castle-entry-v1.jpg","./generated/chase-baiqi-castle-gallery-v1-mobile.webp","./generated/chase-baiqi-castle-gallery-v1.jpg","./generated/chase-baiqi-castle-gate-v1-mobile.webp","./generated/chase-baiqi-castle-gate-v1.jpg","./generated/chase-baiqi-castle-undercroft-v1-mobile.webp","./generated/chase-baiqi-castle-undercroft-v1.jpg","./generated/chase-baiqi-street-boots-v2-mobile.webp","./generated/chase-baiqi-street-boots-v2.jpg","./generated/chase-baiqi-street-close-mobile.webp","./generated/chase-baiqi-street-close.jpg","./generated/chase-baiqi-street-face-mobile.webp","./generated/chase-baiqi-street-face.jpg","./generated/chase-baiqi-street-full-v2-mobile.webp","./generated/chase-baiqi-street-full-v2.jpg","./generated/chase-baiqi-warehouse-entry-v1-mobile.webp","./generated/chase-baiqi-warehouse-entry-v1.jpg","./generated/chase-baiqi-warehouse-finish-v1-mobile.webp","./generated/chase-baiqi-warehouse-finish-v1.jpg","./generated/chase-baiqi-warehouse-racks-v1-mobile.webp","./generated/chase-baiqi-warehouse-racks-v1.jpg","./generated/chase-baiqi-warehouse-service-v1-mobile.webp","./generated/chase-baiqi-warehouse-service-v1.jpg","./generated/chase-baiqi-watch-air-v1-mobile.webp","./generated/chase-baiqi-watch-air-v1.jpg","./generated/chase-baiqi-watch-flooded-lean-v1.jpg","./generated/chase-baiqi-watch-flooded-lean-v2-mobile.webp","./generated/chase-baiqi-watch-flooded-lean-v2.jpg","./generated/chase-baiqi-watch-flooded-lunge-v3-mobile.webp","./generated/chase-baiqi-watch-flooded-lunge-v3.jpg","./generated/chase-baiqi-watch-flooded-turn-v2-mobile.webp","./generated/chase-baiqi-watch-flooded-turn-v2.jpg","./generated/chase-baiqi-watch-flooded-v1-mobile.webp","./generated/chase-baiqi-watch-flooded-v1.jpg","./generated/chase-baiqi-watch-gate-reach-v1-mobile.webp","./generated/chase-baiqi-watch-gate-reach-v1.jpg","./generated/chase-baiqi-watch-gate-step-v2-mobile.webp","./generated/chase-baiqi-watch-gate-step-v2.jpg","./generated/chase-baiqi-watch-gate-v1-mobile.webp","./generated/chase-baiqi-watch-gate-v1.jpg","./generated/chase-castle-01-entry-mobile.webp","./generated/chase-castle-01-entry.jpg","./generated/chase-castle-02-gallery-mobile.webp","./generated/chase-castle-02-gallery.jpg","./generated/chase-castle-03-undercroft-mobile.webp","./generated/chase-castle-03-undercroft.jpg","./generated/chase-castle-04-gate-mobile.webp","./generated/chase-castle-04-gate.jpg","./generated/chase-hanxin-castle-entry-v1-mobile.webp","./generated/chase-hanxin-castle-entry-v1.jpg","./generated/chase-hanxin-castle-gallery-v1-mobile.webp","./generated/chase-hanxin-castle-gallery-v1.jpg","./generated/chase-hanxin-castle-gate-v1-mobile.webp","./generated/chase-hanxin-castle-gate-v1.jpg","./generated/chase-hanxin-castle-undercroft-v1-mobile.webp","./generated/chase-hanxin-castle-undercroft-v1.jpg","./generated/chase-hanxin-street-entry-v1-mobile.webp","./generated/chase-hanxin-street-entry-v1.jpg","./generated/chase-hanxin-street-finish-v1-mobile.webp","./generated/chase-hanxin-street-finish-v1.jpg","./generated/chase-hanxin-street-flooded-v1-mobile.webp","./generated/chase-hanxin-street-flooded-v1.jpg","./generated/chase-hanxin-street-gate-v1-mobile.webp","./generated/chase-hanxin-street-gate-v1.jpg","./generated/chase-hanxin-warehouse-entry-v1-mobile.webp","./generated/chase-hanxin-warehouse-entry-v1.jpg","./generated/chase-hanxin-warehouse-finish-v1-mobile.webp","./generated/chase-hanxin-warehouse-finish-v1.jpg","./generated/chase-hanxin-warehouse-racks-v1-mobile.webp","./generated/chase-hanxin-warehouse-racks-v1.jpg","./generated/chase-hanxin-warehouse-service-v1-mobile.webp","./generated/chase-hanxin-warehouse-service-v1.jpg","./generated/chase-mobile-dynamic-stage4.png","./generated/chase-mobile-execution-preview.png","./generated/chase-mobile-execution-v3.png","./generated/chase-mobile-fullbody-preview.png","./generated/chase-mobile-preview.png","./generated/chase-mobile-stage-options-v2.png","./generated/chase-scene-01-entry-mobile.webp","./generated/chase-scene-01-entry.jpg","./generated/chase-scene-02-flooded-mobile.webp","./generated/chase-scene-02-flooded.jpg","./generated/chase-scene-03-gate-mobile.webp","./generated/chase-scene-03-gate.jpg","./generated/chase-scene-04-exit-mobile.webp","./generated/chase-scene-04-exit.jpg","./generated/chase-shouyue-castle-entry-v1-mobile.webp","./generated/chase-shouyue-castle-entry-v1.jpg","./generated/chase-shouyue-castle-finish-v1-mobile.webp","./generated/chase-shouyue-castle-finish-v1.jpg","./generated/chase-shouyue-castle-gallery-v1-mobile.webp","./generated/chase-shouyue-castle-gallery-v1.jpg","./generated/chase-shouyue-castle-undercroft-v1-mobile.webp","./generated/chase-shouyue-castle-undercroft-v1.jpg","./generated/chase-shouyue-street-entry-v1-mobile.webp","./generated/chase-shouyue-street-entry-v1.jpg","./generated/chase-shouyue-street-finish-v1-mobile.webp","./generated/chase-shouyue-street-finish-v1.jpg","./generated/chase-shouyue-street-flooded-v1-mobile.webp","./generated/chase-shouyue-street-flooded-v1.jpg","./generated/chase-shouyue-street-gate-v1-mobile.webp","./generated/chase-shouyue-street-gate-v1.jpg","./generated/chase-shouyue-warehouse-entry-v1-mobile.webp","./generated/chase-shouyue-warehouse-entry-v1.jpg","./generated/chase-shouyue-warehouse-finish-v1-mobile.webp","./generated/chase-shouyue-warehouse-finish-v1.jpg","./generated/chase-shouyue-warehouse-racks-v1-mobile.webp","./generated/chase-shouyue-warehouse-racks-v1.jpg","./generated/chase-shouyue-warehouse-service-v1-mobile.webp","./generated/chase-shouyue-warehouse-service-v1.jpg","./generated/chase-street-night-bg-mobile.webp","./generated/chase-street-night-bg.jpg","./generated/chase-warehouse-01-loading-mobile.webp","./generated/chase-warehouse-01-loading.jpg","./generated/chase-warehouse-02-racks-mobile.webp","./generated/chase-warehouse-02-racks.jpg","./generated/chase-warehouse-03-service-mobile.webp","./generated/chase-warehouse-03-service.jpg","./generated/chase-warehouse-04-shutter-mobile.webp","./generated/chase-warehouse-04-shutter.jpg","./generated/drag-baiqi-1.jpg","./generated/drag-baiqi-2.jpg","./generated/drag-baishouyue-1.jpg","./generated/drag-baishouyue-2.jpg","./generated/drag-baishouyue-3.jpg","./generated/drag-baishouyue-4.jpg","./generated/drag-baishouyue-5.jpg","./generated/drag-baishouyue-6.jpg","./generated/drag-hanxin-1.jpg","./generated/drag-hanxin-2.jpg","./generated/drag-hanxin-3.jpg","./generated/drag-hanxin-4.jpg","./generated/drag-kai-1.jpg","./generated/drag-kai-2.jpg","./generated/drag-kuangtie-1.jpg","./generated/drag-kuangtie-2.jpg","./generated/drag-kuangtie-3.jpg","./generated/drag-laixiao-1.jpg","./generated/drag-laixiao-2.jpg","./generated/drag-laixiao-3.jpg","./generated/drag-laixiao-4.jpg","./generated/drag-laixiao-5.jpg","./generated/drag-lan-1.jpg","./generated/drag-lan-2.jpg","./generated/drag-lan-3.jpg","./generated/drag-lan-4.jpg","./generated/drag-shenzui-1.jpg","./generated/drag-shenzui-2.jpg","./generated/drag-shenzui-3.jpg","./generated/drag-shenzui-4.jpg","./generated/drag-shenzui-5.jpg","./generated/drag-yao-1.jpg","./generated/drag-yao-2.jpg","./generated/drag-yao-3.jpg","./generated/drag-yao-4.jpg","./generated/drag-zhaoyun-1.jpg","./generated/drag-zhaoyun-2.jpg","./generated/drag-zhaoyun-3.jpg","./generated/drag-zhaoyun-4.jpg","./generated/drag-zhaoyun-5.jpg","./generated/drag-zhugeliang-1.jpg","./generated/drag-zhugeliang-2.jpg","./generated/drag-zhugeliang-3.jpg","./generated/drag-zhugeliang-4.jpg","./generated/exec-baiqi.jpg","./generated/exec-baishouyue.jpg","./generated/exec-hanxin.jpg","./generated/exec-kai.jpg","./generated/exec-kuangtie.jpg","./generated/exec-laixiao.jpg","./generated/exec-lan.jpg","./generated/exec-shenzui.jpg","./generated/exec-yao.jpg","./generated/exec-zhaoyun.jpg","./generated/exec-zhugeliang.jpg","./generated/exec2-baiqi.jpg","./generated/exec2-kai.jpg","./generated/exec2-laixiao.jpg","./generated/exec2-lan.jpg","./generated/exec2-yao.jpg","./generated/exec2-zhugeliang.jpg","./generated/exec3-baiqi.jpg","./generated/exec3-baishouyue.jpg","./generated/exec3-hanxin.jpg","./generated/exec3-kai.jpg","./generated/exec3-kuangtie.jpg","./generated/exec3-laixiao.jpg","./generated/exec3-lan.jpg","./generated/exec3-shenzui.jpg","./generated/exec3-yao.jpg","./generated/exec3-zhaoyun.jpg","./generated/exec3-zhugeliang.jpg","./generated/exec4-baiqi.jpg","./generated/exec4-baishouyue.jpg","./generated/exec4-hanxin.jpg","./generated/exec4-kai.jpg","./generated/exec4-kuangtie.jpg","./generated/exec4-laixiao.jpg","./generated/exec4-lan.jpg","./generated/exec4-shenzui.jpg","./generated/exec4-yao.jpg","./generated/exec4-zhaoyun.jpg","./generated/exec4-zhugeliang.jpg","./generated/exec5-baiqi.jpg","./generated/exec5-baishouyue.jpg","./generated/exec5-hanxin.jpg","./generated/exec5-kai.jpg","./generated/exec5-kuangtie.jpg","./generated/exec5-laixiao.jpg","./generated/exec5-lan.jpg","./generated/exec5-shenzui.jpg","./generated/exec5-yao.jpg","./generated/exec5-zhaoyun.jpg","./generated/exec5-zhugeliang.jpg","./generated/flyer-baiqi-1.jpg","./generated/flyer-baiqi-2.jpg","./generated/flyer-baishouyue-1.jpg","./generated/flyer-baishouyue-2.jpg","./generated/flyer-hanxin-1.jpg","./generated/flyer-hanxin-2.jpg","./generated/flyer-kai-1.jpg","./generated/flyer-kai-2.jpg","./generated/flyer-kuangtie-1.jpg","./generated/flyer-kuangtie-2.jpg","./generated/flyer-laixiao-1.jpg","./generated/flyer-laixiao-2.jpg","./generated/flyer-lan-1.jpg","./generated/flyer-lan-2.jpg","./generated/flyer-shenzui-1.jpg","./generated/flyer-shenzui-2.jpg","./generated/flyer-yao-1.jpg","./generated/flyer-yao-2.jpg","./generated/flyer-zhaoyun-1.jpg","./generated/flyer-zhaoyun-2.jpg","./generated/flyer-zhugeliang-1.jpg","./generated/flyer-zhugeliang-2.jpg","./generated/hanxin-defeat.jpg","./generated/kai-defeat.jpg","./generated/kuangtie-defeat.jpg","./generated/laixiao-defeat.jpg","./generated/lan-defeat.jpg","./generated/package-brick.jpg","./generated/package-cesspool.jpg","./generated/package-cremate.jpg","./generated/package-feed.jpg","./generated/package-firework.jpg","./generated/package-scatter.jpg","./generated/package-shelf.jpg","./generated/package-simple.jpg","./generated/package-skeleton.jpg","./generated/package-soap.jpg","./generated/package-spittoon.jpg","./generated/package-urinal.jpg","./generated/package-wine.jpg","./generated/pose4-baiqi-01-v1.jpg","./generated/pose4-baiqi-01-v2.jpg","./generated/pose4-baiqi-02-v1.jpg","./generated/pose4-baiqi-02-v2.jpg","./generated/pose4-baiqi-03-v1.jpg","./generated/pose4-baiqi-03-v2.jpg","./generated/pose4-baiqi-04-v1.jpg","./generated/pose4-baiqi-04-v2.jpg","./generated/pose4-baishouyue-01-v1.jpg","./generated/pose4-baishouyue-01-v2.jpg","./generated/pose4-baishouyue-02-v1.jpg","./generated/pose4-baishouyue-02-v2.jpg","./generated/pose4-baishouyue-03-v1.jpg","./generated/pose4-baishouyue-03-v2.jpg","./generated/pose4-baishouyue-04-v1.jpg","./generated/pose4-baishouyue-04-v2.jpg","./generated/pose4-zhugeliang-01-v1.jpg","./generated/pose4-zhugeliang-01-v2.jpg","./generated/pose4-zhugeliang-02-v1.jpg","./generated/pose4-zhugeliang-02-v2.jpg","./generated/pose4-zhugeliang-03-v1.jpg","./generated/pose4-zhugeliang-03-v2.jpg","./generated/pose4-zhugeliang-04-v1.jpg","./generated/pose4-zhugeliang-04-v2.jpg","./generated/pose7-hanxin-01-final.jpg","./generated/pose7-hanxin-02-final.jpg","./generated/pose7-hanxin-03-base.jpg","./generated/pose7-hanxin-03-v2.jpg","./generated/pose7-hanxin-03-v3.jpg","./generated/pose7-hanxin-03-v4.jpg","./generated/pose7-hanxin-04-final-mobile.webp","./generated/pose7-hanxin-04-final.jpg","./generated/pose7-hanxin-05-final.jpg","./generated/pose7-hanxin-06-base.jpg","./generated/pose7-hanxin-06-v2.jpg","./generated/pose7-hanxin-07-base.jpg","./generated/pose7-hanxin-07-v2.jpg","./generated/pose7-hanxin-07-v3.jpg","./generated/relic-1.jpg","./generated/relic-2.jpg","./generated/relic-3.jpg","./generated/shenzui-defeat.jpg","./generated/sign-1.jpg","./generated/sign-2.jpg","./generated/stomp-baiqi-1.jpg","./generated/stomp-baiqi-2.jpg","./generated/stomp-baishouyue-1.jpg","./generated/stomp-hanxin-1.jpg","./generated/stomp-hanxin-2.jpg","./generated/stomp-kai-1.jpg","./generated/stomp-kai-2.jpg","./generated/stomp-kuangtie-1.jpg","./generated/stomp-kuangtie-2.jpg","./generated/stomp-lan-1.jpg","./generated/stomp-lan-2.jpg","./generated/stomp-shenzui-1.jpg","./generated/stomp-zhaoyun-1.jpg","./generated/stomp-zhaoyun-2.jpg","./generated/stomp-zhugeliang-1.jpg","./generated/wreath-2.jpg","./generated/wreath-3.jpg","./generated/wreath.jpg","./generated/yao-defeat.jpg","./generated/zhaoyun-defeat.jpg","./generated/zhugeliang-defeat.jpg"];
const CHASE = ["./generated/chase-baiqi-castle-entry-v1-mobile.webp","./generated/chase-baiqi-castle-gallery-v1-mobile.webp","./generated/chase-baiqi-castle-gate-v1-mobile.webp","./generated/chase-baiqi-castle-undercroft-v1-mobile.webp","./generated/chase-baiqi-street-boots-v2-mobile.webp","./generated/chase-baiqi-street-close-mobile.webp","./generated/chase-baiqi-street-face-mobile.webp","./generated/chase-baiqi-street-full-v2-mobile.webp","./generated/chase-baiqi-warehouse-entry-v1-mobile.webp","./generated/chase-baiqi-warehouse-finish-v1-mobile.webp","./generated/chase-baiqi-warehouse-racks-v1-mobile.webp","./generated/chase-baiqi-warehouse-service-v1-mobile.webp","./generated/chase-baiqi-watch-air-v1-mobile.webp","./generated/chase-baiqi-watch-flooded-lean-v2-mobile.webp","./generated/chase-baiqi-watch-flooded-lunge-v3-mobile.webp","./generated/chase-baiqi-watch-flooded-turn-v2-mobile.webp","./generated/chase-baiqi-watch-flooded-v1-mobile.webp","./generated/chase-baiqi-watch-gate-reach-v1-mobile.webp","./generated/chase-baiqi-watch-gate-step-v2-mobile.webp","./generated/chase-baiqi-watch-gate-v1-mobile.webp","./generated/chase-castle-01-entry-mobile.webp","./generated/chase-castle-02-gallery-mobile.webp","./generated/chase-castle-03-undercroft-mobile.webp","./generated/chase-castle-04-gate-mobile.webp","./generated/chase-hanxin-castle-entry-v1-mobile.webp","./generated/chase-hanxin-castle-gallery-v1-mobile.webp","./generated/chase-hanxin-castle-gate-v1-mobile.webp","./generated/chase-hanxin-castle-undercroft-v1-mobile.webp","./generated/chase-hanxin-street-entry-v1-mobile.webp","./generated/chase-hanxin-street-finish-v1-mobile.webp","./generated/chase-hanxin-street-flooded-v1-mobile.webp","./generated/chase-hanxin-street-gate-v1-mobile.webp","./generated/chase-hanxin-warehouse-entry-v1-mobile.webp","./generated/chase-hanxin-warehouse-finish-v1-mobile.webp","./generated/chase-hanxin-warehouse-racks-v1-mobile.webp","./generated/chase-hanxin-warehouse-service-v1-mobile.webp","./generated/chase-scene-01-entry-mobile.webp","./generated/chase-scene-02-flooded-mobile.webp","./generated/chase-scene-03-gate-mobile.webp","./generated/chase-scene-04-exit-mobile.webp","./generated/chase-shouyue-castle-entry-v1-mobile.webp","./generated/chase-shouyue-castle-finish-v1-mobile.webp","./generated/chase-shouyue-castle-gallery-v1-mobile.webp","./generated/chase-shouyue-castle-undercroft-v1-mobile.webp","./generated/chase-shouyue-street-entry-v1-mobile.webp","./generated/chase-shouyue-street-finish-v1-mobile.webp","./generated/chase-shouyue-street-flooded-v1-mobile.webp","./generated/chase-shouyue-street-gate-v1-mobile.webp","./generated/chase-shouyue-warehouse-entry-v1-mobile.webp","./generated/chase-shouyue-warehouse-finish-v1-mobile.webp","./generated/chase-shouyue-warehouse-racks-v1-mobile.webp","./generated/chase-shouyue-warehouse-service-v1-mobile.webp","./generated/chase-street-night-bg-mobile.webp","./generated/chase-warehouse-01-loading-mobile.webp","./generated/chase-warehouse-02-racks-mobile.webp","./generated/chase-warehouse-03-service-mobile.webp","./generated/chase-warehouse-04-shutter-mobile.webp","./generated/pose7-hanxin-04-final-mobile.webp"];
const CORE = ALL.slice(0, 11).concat(CHASE);

let pcRunning = false;

function pcCount() {
  return caches.open(CACHE).then(function (c) {
    let done = 0;
    return Promise.all(ALL.map(function (u) {
      return c.match(u).then(function (h) { if (h) done++; });
    })).then(function () { return done; });
  });
}

function pcTell(state) {
  return pcCount().then(function (done) {
    const msg = { type: 'wc', state: state, done: done, total: ALL.length };
    return self.clients.matchAll({ includeUncontrolled: true }).then(function (cs) {
      cs.forEach(function (cl) { try { cl.postMessage(msg); } catch (e) {} });
    });
  }).catch(function () {});
}

/* 单张图最多等 ms 毫秒, 卡死就掐掉重试, 免得整个打包僵住 */
function pcFetch(u, ms) {
  return new Promise(function (resolve, reject) {
    let done = false;
    const ctrl = ('AbortController' in self) ? new AbortController() : null;
    const t = setTimeout(function () {
      if (done) return;
      done = true;
      if (ctrl) { try { ctrl.abort(); } catch (e) {} }
      reject(new Error('timeout ' + u));
    }, ms);
    fetch(u, { credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined }).then(function (r) {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(r);
    }).catch(function (e) {
      if (done) return;
      done = true;
      clearTimeout(t);
      reject(e);
    });
  });
}

function runPrecache() {
  if (pcRunning) return;
  pcRunning = true;
  caches.open(CACHE).then(function (c) {
    const missing = [];
    return Promise.all(ALL.map(function (u) {
      return c.match(u).then(function (h) { if (!h) missing.push(u); });
    })).then(function () {
      if (!missing.length) { pcRunning = false; return pcTell('done'); }
      let idx = 0, doneN = ALL.length - missing.length, failed = 0;
      pcTell('running');
      function one() {
        if (idx >= missing.length) return Promise.resolve();
        const u = missing[idx++];
        let tries = 0;
        function attempt() {
          tries++;
          return pcFetch(u, 30000).then(function (r) {
            if (!r || !r.ok) throw new Error('bad ' + u);
            return c.put(u, r.clone());
          }).then(function () {
            doneN++;
            if (doneN % 4 === 0 || doneN >= ALL.length) pcTell('running');
            return one();
          }).catch(function () {
            if (tries < 3) {
              return new Promise(function (res) { setTimeout(res, 700 * tries); }).then(attempt);
            }
            failed++;
            return one();
          });
        }
        return attempt();
      }
      const ws = [];
      for (let i = 0; i < 4; i++) ws.push(one());
      return Promise.all(ws).then(function () {
        pcRunning = false;
        return pcTell(failed ? 'error' : 'done');
      });
    });
  }).catch(function () { pcRunning = false; pcTell('error'); });
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('woxi-web-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); }).then(function () { runPrecache(); })
  );
});

self.addEventListener('message', function (e) {
  const d = e.data || {};
  if (d.type === 'wc-start') runPrecache();
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    // 手机上优先用本地缓存(秒开), 同时后台悄悄拉一次最新页面; 断网就吃缓存
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match('./index.html').then(function (hit) {
          const net = fetch(req, { cache: 'no-store' }).then(function (r) {
            if (r && r.ok) return c.put('./index.html', r.clone()).then(function () { return r; });
            return r;
          });
          if (hit) { e.waitUntil(net.catch(function () {})); return hit; }
          return net.catch(function () {
            return c.match('./index.html').then(function (f) {
              return f || new Response('离线, 而且缓存里还没有这一版。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
            });
          });
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        return fetch(req, { cache: 'no-cache' }).then(function (r) {
          if (r && r.ok) c.put(req, r.clone());
          return r;
        }).catch(function () {
          return new Response('', { status: 503, statusText: 'offline asset unavailable' });
        });
      });
    })
  );
});