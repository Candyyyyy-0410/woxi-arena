(function () {
  "use strict";

  const VOICE_BASE = "audio/voice-v1/";
  const SFX_BASE = "audio/sfx-v1/";
  const VOICE_SLOTS = ["01-entry", "02-close", "03-hunted", "04-last", "05-execution"];
  const HEROES = ["baiqi", "hanxin", "shouyue", "zhugeliang"];
  const VOICE_VOLUME = .78;
  const DUCKED_VOICE_VOLUME = .36;
  const SFX_VOLUME = .34;

  const SFX_LIBRARY = {
    "shoe-leather-step-a": SFX_BASE + "shoe-leather-step-a.mp3",
    "shoe-leather-step-b": SFX_BASE + "shoe-leather-step-b.mp3",
    "shoe-leather-wood": SFX_BASE + "shoe-leather-wood.mp3",
    "boot-run-pavement": SFX_BASE + "boot-run-pavement.mp3",
    "boot-step-puddle": SFX_BASE + "boot-step-puddle.mp3",
    "boot-step-mud": SFX_BASE + "boot-step-mud.mp3",
    "boot-step-hobnail": SFX_BASE + "boot-step-hobnail.mp3",
    "boot-step-hollow-metal": SFX_BASE + "boot-step-hollow-metal.mp3",
    "footstep-metal": SFX_BASE + "footstep-metal.mp3",
    "boot-gravel-slide": SFX_BASE + "boot-gravel-slide.mp3",
    "boot-kick-log": SFX_BASE + "boot-kick-log.mp3",
    "boot-step-spur": SFX_BASE + "boot-step-spur.mp3"
  };

  const SCENE_SFX = {
    street: [
      "shoe-leather-step-a",
      "shoe-leather-step-b",
      "boot-step-mud",
      "boot-step-puddle",
      "boot-run-pavement"
    ],
    castle: [
      "boot-step-hobnail",
      "shoe-leather-wood",
      "boot-step-spur",
      "boot-step-mud",
      "boot-run-pavement"
    ],
    warehouse: [
      "footstep-metal",
      "boot-step-hollow-metal",
      "boot-gravel-slide",
      "boot-kick-log",
      "boot-run-pavement"
    ]
  };

  const voiceNodes = {};
  const sfxNodes = {};
  const played = Object.create(null);
  let currentHero = "";
  let currentScene = "";
  let activeVoice = null;
  let activeVoiceSlot = "";
  let duckTimer = 0;
  let unlocked = false;
  let failedVoiceLoads = 0;
  let failedSfxLoads = 0;

  function canUseAudio() {
    return typeof window !== "undefined" && typeof window.Audio === "function";
  }

  function makeAudio(src, volume) {
    if (!canUseAudio()) return null;
    try {
      const node = new window.Audio(src);
      node.preload = "auto";
      node.volume = volume;
      if (typeof node.load === "function") node.load();
      return node;
    } catch (error) {
      return null;
    }
  }

  function ensureVoiceNodes(heroKey) {
    if (!HEROES.includes(heroKey)) return;
    if (!voiceNodes[heroKey]) {
      voiceNodes[heroKey] = {};
      VOICE_SLOTS.forEach(function (slot) {
        const node = makeAudio(VOICE_BASE + heroKey + "-" + slot + ".wav", VOICE_VOLUME);
        if (!node) return;
        node.addEventListener("error", function () {
          failedVoiceLoads += 1;
        });
        voiceNodes[heroKey][slot] = node;
      });
    }
  }

  function ensureSfxNode(name) {
    if (sfxNodes[name] || !SFX_LIBRARY[name]) return;
    const node = makeAudio(SFX_LIBRARY[name], SFX_VOLUME);
    if (!node) return;
    node.addEventListener("error", function () {
      failedSfxLoads += 1;
    });
    sfxNodes[name] = node;
  }

  function ensureSceneSfx(sceneKey) {
    (SCENE_SFX[sceneKey] || []).forEach(ensureSfxNode);
  }

  function stopNode(node) {
    if (!node) return;
    try {
      node.pause();
      node.currentTime = 0;
    } catch (error) {}
  }

  function clearDuckTimer() {
    if (duckTimer) window.clearTimeout(duckTimer);
    duckTimer = 0;
  }

  function restoreVoiceVolume() {
    clearDuckTimer();
    if (activeVoice) {
      try {
        activeVoice.volume = VOICE_VOLUME;
      } catch (error) {}
    }
  }

  function stopVoice() {
    clearDuckTimer();
    stopNode(activeVoice);
    activeVoice = null;
    activeVoiceSlot = "";
  }

  function stopAll() {
    stopVoice();
    Object.keys(voiceNodes).forEach(function (heroKey) {
      Object.keys(voiceNodes[heroKey]).forEach(function (slot) {
        stopNode(voiceNodes[heroKey][slot]);
      });
    });
    Object.keys(sfxNodes).forEach(function (name) {
      stopNode(sfxNodes[name]);
    });
  }

  function resetPlayed() {
    Object.keys(played).forEach(function (slot) {
      delete played[slot];
    });
  }

  function setMode(heroKey, sceneKey) {
    const nextHero = HEROES.includes(heroKey) ? heroKey : "baiqi";
    const nextScene = SCENE_SFX[sceneKey] ? sceneKey : "street";
    if (currentHero !== nextHero || currentScene !== nextScene) {
      stopAll();
      resetPlayed();
    }
    currentHero = nextHero;
    currentScene = nextScene;
    ensureVoiceNodes(currentHero);
    ensureSceneSfx(currentScene);
  }

  function unlock() {
    unlocked = true;
  }

  function beginRun(heroKey, sceneKey) {
    setMode(heroKey, sceneKey);
    stopAll();
    resetPlayed();
    unlocked = true;
  }

  function playVoice(slot) {
    if (!unlocked || !currentHero || !VOICE_SLOTS.includes(slot) || played[slot]) return false;
    ensureVoiceNodes(currentHero);
    const node = voiceNodes[currentHero] && voiceNodes[currentHero][slot];
    played[slot] = true;
    if (!node) return false;

    stopVoice();
    activeVoice = node;
    activeVoiceSlot = slot;
    clearDuckTimer();
    try {
      node.pause();
      node.currentTime = 0;
      node.volume = VOICE_VOLUME;
      node.onended = function () {
        if (activeVoice !== node) return;
        activeVoice = null;
        activeVoiceSlot = "";
        restoreVoiceVolume();
      };
      const playback = node.play();
      if (playback && typeof playback.catch === "function") playback.catch(function () {});
    } catch (error) {
      if (activeVoice === node) {
        activeVoice = null;
        activeVoiceSlot = "";
      }
      return false;
    }
    return true;
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function sfxForAction(actionHint) {
    const hint = String(actionHint || "").toLowerCase();
    if (/puddle|water|undercar|culvert|gutter|stir|sink/.test(hint)) return "boot-step-puddle";
    if (/kick|block|collapse|throw|crate|barrel|chain|pipe|shutter|wreck/.test(hint)) {
      return currentScene === "warehouse" ? "boot-kick-log" : "boot-step-mud";
    }
    if (/run|sprint|dash|rush/.test(hint)) return "boot-run-pavement";
    if (/gravel|drag|slide/.test(hint)) return "boot-gravel-slide";
    if (/metal|aisle|rack|dock|gate/.test(hint) && currentScene === "warehouse") {
      return pick(["footstep-metal", "boot-step-hollow-metal"]);
    }
    return pick(SCENE_SFX[currentScene] || SCENE_SFX.street);
  }

  function playStep(actionHint) {
    if (!unlocked || !currentScene) return false;
    const name = sfxForAction(actionHint);
    ensureSfxNode(name);
    const node = sfxNodes[name];
    if (!node) return false;

    try {
      node.pause();
      node.currentTime = 0;
      node.volume = SFX_VOLUME;
      node.playbackRate = .94 + Math.random() * .12;
      if (activeVoice) {
        activeVoice.volume = DUCKED_VOICE_VOLUME;
        clearDuckTimer();
        duckTimer = window.setTimeout(restoreVoiceVolume, 430);
      }
      const playback = node.play();
      if (playback && typeof playback.catch === "function") playback.catch(function () {});
      return true;
    } catch (error) {
      return false;
    }
  }

  function debug() {
    return {
      mode: { hero: currentHero, scene: currentScene },
      played: Object.assign({}, played),
      activeVoice: activeVoiceSlot,
      unlocked: unlocked,
      failedVoiceLoads: failedVoiceLoads,
      failedSfxLoads: failedSfxLoads,
      voiceSlots: VOICE_SLOTS.slice(),
      voiceHeroes: HEROES.slice(),
      sceneSfx: Object.assign({}, SCENE_SFX),
      sfxLibrary: Object.assign({}, SFX_LIBRARY)
    };
  }

  window.__chaseAudio = {
    unlock: unlock,
    setMode: setMode,
    beginRun: beginRun,
    playVoice: playVoice,
    playStep: playStep,
    stopVoice: stopVoice,
    stopAll: stopAll,
    debug: debug
  };
})();
