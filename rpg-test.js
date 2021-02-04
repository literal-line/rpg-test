// rpg-test by Literal Line
// more at quique.gq

var RPG_TEST = (function () {
  'use strict';

  var canvas = document.createElement('canvas');
  var stage = canvas.getContext('2d');
  var gameSettings = {
    version: 'v0.1-20210203-2021est',
    authors: ['Literal Line'], // in case you mod or whatever
    width: 768,
    height: 432,
    widthCSS: '768px',
    heightCSS: '432px',
    bg: '#000000',
    aa: false // leave this off to keep images c r i s p
  };

  var setupMouseEventListeners = function () {
    document.addEventListener('mousemove', function (e) {
      var coords = getMousePos(canvas, e);
      mouse.x = coords.x;
      mouse.y = coords.y;
    });
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
    canvas.addEventListener('mousedown', function (e) {
      if (e.button === 0) {
        mouse.down = true;
        mouseClick();
      }
    });
    canvas.addEventListener('mouseup', function (e) {
      if (e.button === 0) mouse.down = false;
    });
    canvas.addEventListener('mouseleave', function () {
      mouse.down = false;
    });
  };

  var setupCanvas = function () {
    canvas.width = gameSettings.width;
    canvas.height = gameSettings.height;
    canvas.style.width = gameSettings.widthCSS;
    canvas.style.height = gameSettings.heightCSS;
    canvas.style.background = gameSettings.bg;
    canvas.style.imageRendering = gameSettings.aa ? 'auto' : 'pixelated';
    canvas.style.imageRendering = gameSettings.aa ? 'auto' : '-moz-crisp-edges';
    stage.imageSmoothingEnabled = gameSettings.aa;
    stage.textRendering = 'auto';

    if (window.location.search === '?fullscreen') {
      fullscreen();
      window.addEventListener('resize', fullscreen);
      window.addEventListener('orientationchange', fullscreen);
    }
  };

  var fullscreen = function () {
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  };

  var setupAudio = function () { // prevents sfx from interrupting sound in other tabs on certain browsers
    for (var a in audio) {
      audio[a].volume = 0.5;
    }

    audio.silence.addEventListener('ended', function () {
      audio.silence.play();
    });
    document.addEventListener('mousedown', function () {
      audio.silence.play();
    });
  };

  var mouseClick = function () { // prevents buttons from being clicked when click-dragging
    mouse.click = true;
    setTimeout(function () {
      mouse.click = false;
    }, 10);
  };

  var mouse = { // mouse data
    x: 0,
    y: 0,
    down: false,
    click: false // <-- will briefly become true when mouseClick() is called
  };

  var assets = { // images/audio
    logo: './assets/logo.png',
    itemDrops: './assets/itemDrops.png',
    tilesetMap: './assets/tilesetMap.png',
    tilesetMapIcons: './assets/tilesetMapIcons.png',
    tilesetGrass: './assets/tilesetGrass.png',
    weaponAssassin: './assets/weaponAssassin.png',
    accessory: './assets/accessory.png',
    soundSilence: './assets/5-seconds-of-silence.mp3',
    soundClick: './assets/click.wav',
    soundClick2: './assets/click2.wav',
    soundClick3: './assets/click3.wav',
    soundAccessory: './assets/compose.wav',
    soundError: './assets/casherror.wav'
  };

  var sprites = { // image to img
    logo: newImage(assets.logo),
    itemDrops: newImage(assets.itemDrops),
    tilesetMap: newImage(assets.tilesetMap),
    tilesetMapIcons: newImage(assets.tilesetMapIcons),
    tilesetGrass: newImage(assets.tilesetGrass),
    weaponAssassin: newImage(assets.weaponAssassin),
    accessory: newImage(assets.accessory)
  };

  var audio = {
    silence: new Audio(assets.soundSilence),
    click: newWav(assets.soundClick),
    click2: newWav(assets.soundClick2),
    click3: newWav(assets.soundClick3),
    accessory: newWav(assets.soundAccessory),
    error: newWav(assets.soundError)
  };

  var colors = [ // color pallete for text. idk why im using this, just want consistent colors i guess...
    // slightly modified from here: https://lospec.com/palette-list/pineapple-32
    '#43002a',
    '#890027',
    '#d9243c',
    '#ff6157',
    '#ffb762',
    '#c76e46',
    '#73392e',
    '#34111f',
    '#000000',
    '#375340',
    '#458239',
    '#9cb93b',
    '#ffd832',
    '#ff823b',
    '#d1401f',
    '#7c191a',
    '#310c1b',
    '#833f34',
    '#eb9c6e',
    '#ffdaac',
    '#ffffff',
    '#bfc3c6',
    '#6d8a8d',
    '#293b49',
    '#041528',
    '#033e5e',
    '#1c92a7',
    '#c1f9ff',
    '#ffe0dc',
    '#ff88a9',
    '#c03b94',
    '#601761'
  ];

  var getMousePos = function (c, e) { // gets mouse pos on canvas by taking actual canvas position on document into account
    var rect = c.getBoundingClientRect();
    var scaleX = gameSettings.width / rect.width;
    var scaleY = gameSettings.height / rect.height;
    return {
      x: Math.floor(e.clientX * scaleX - rect.left * scaleX),
      y: Math.floor(e.clientY * scaleY - rect.top * scaleY)
    };
  };

  var drawLine = function (sx, sy, dx, dy, color, width) { // draw a line but easier
    stage.strokeStyle = colors[color];
    stage.lineWidth = width;
    stage.beginPath();
    stage.moveTo(sx, sy);
    stage.lineTo(dx, dy);
    stage.stroke();
  };

  var drawDottedLine = function (sx, sy, dx, dy, color) { // draw dotted line made up of evenly-spaced dots
    var maxDots = Math.floor(Math.sqrt(Math.pow(dx - sx, 2) + Math.pow(dy - sy, 2)) / 10);
    stage.fillStyle = colors[color];
    for (var i = 1; i < maxDots; i++) {
      stage.fillRect(Math.floor(sx + (dx - sx) / maxDots * i), Math.floor(sy + (dy - sy) / maxDots * i), 3, 3);
    }
  };

  var drawText = function (obj) { // more uniform way of drawing text
    stage.fillStyle = colors[obj.color || 20];
    stage.strokeStyle = colors[obj.outlineColor || 8];
    stage.lineWidth = obj.outlineWidth || 2;
    stage.font = (obj.size || 24) + 'px Zelda DX';
    if (obj.outline) stage.strokeText(obj.text, obj.center ? obj.x - stage.measureText(obj.text).width / 2 : obj.x, obj.y);
    stage.fillText(obj.text, obj.center ? obj.x - stage.measureText(obj.text).width / 2 : obj.x, obj.y);
  };

  var CButton = function (obj) { // constructor for buttons
    this.text = obj.text;
    this.color = obj.color || 20;
    this.x = obj.x;
    this.y = obj.y;
    this.width = obj.width || 150;
    this.height = obj.height || 75;
    this.bgColor = obj.bgColor || colors[8];
    this.bgHoverColor = obj.bgHoverColor || hexToRgba(colors[2], 0.25);
    this.border = obj.border;
    this.borderColor = obj.borderColor || 1;
    this.borderWidth = obj.borderWidth || 2;
    this.hover = obj.hover; // <-- will call this function on hover
    this.notHover = obj.notHover; // <-- will call this function on !hover
    this.click = obj.click; // <-- will call this function on click
    this.noClickSound = obj.noClickSound ? true : false;
    this.id = obj.id;
  };

  CButton.prototype.draw = function () { // draw proto (might change name later...)
    var mx = mouse.x;
    var my = mouse.y;
    var x = this.x;
    var y = this.y;
    var width = this.width;
    var height = this.height;
    if (this.border) {
      stage.lineWidth = this.borderWidth;
      stage.strokeStyle = colors[this.borderColor];
      stage.strokeRect(x - width / 2, y - height / 2, width, height);
    }
    stage.fillStyle = this.bgColor;
    stage.fillRect(x - width / 2, y - height / 2, width, height);

    if (mx >= x - width / 2 && mx < x + width / 2 && my >= y - height / 2 && my < y + height / 2) {
      stage.fillStyle = this.bgHoverColor;
      stage.fillRect(x - width / 2, y - height / 2, width, height);
      if (this.hover) this.hover();
      if (mouse.click) {
        if (!this.noClickSound) audio.click.play();
        mouse.click = false;
        this.click();
      }
    } else if (this.notHover) this.notHover();
    if (this.text) drawText({ text: this.text, color: this.color, x: x, y: y + 5, center: true });
  };

  var game = (function () {
    var STATE = 'title'; // keeps track of game state; which functions run during which state is determined by a switch statement at the end of this IIFE

    var teamData = { // data for each stickman (will change later)
      member1: { class: 'Member 1', weapon: '', acc1: '', acc2: '' }, //  placeholder classes for the newGame screen
      member2: { class: 'Member 2', weapon: '', acc1: '', acc2: '' },
      member3: { class: 'Member 3', weapon: '', acc1: '', acc2: '' },
      member4: { class: 'Member 4', weapon: '', acc1: '', acc2: '' }
    };

    var classList = ['Assassin', 'Ninja', 'Nunchaku-ka', 'Monk', 'Mage', 'Gunner']; // this array seems to be working ok for now...

    var tilesets = { // tile spritesheets
      map: sprites.tilesetMap,
      mapIcons: sprites.tilesetMapIcons,
      grass: sprites.tilesetGrass
    };

    var mapData = {
      width: 144,
      bg: [
        'dddddd45a0000455ag0000000gb076ddddddddddddddddddddddddddddd8000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'dddddddd45a0000g45a00g00076gbdddddddddddddddddddddddddddddd8000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'dddddddddd4555a00045555556076ddddddd12223dddd122223ddddddddb000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'ddddddddeeee00455ag0000000gbddddd122c00092222c00009223dddddb000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'dddddeeeee000000b455a0g00076dddd1c000000000000000000093ddddb000075555a0000000075555555a000000000000000000000000000000000000000000000000000000000',
        'ddddeee00000000045a045555568ddd1c00000000000000000000092222c00008ddddb0000000767675a4a4a00000000000000000000000000000000000000000000000000000000',
        'ddeee0000000000000455a0g0009222c000000000000000000000000000000008ddddb0755555676e8gbe4a4a0000000000000000000000000000000000000000000000000000000',
        'dee0000000000000000008000g000gb0000000000000000000000075555a00008ddddb767555556ee92cee4500000000000000000000000000000000000000000000000000000000',
        'ee00000000000000000004555a0000b000000000000000000000008ddddb00008jjjj4676dddddeeeeeeeee000000000000000555550000000000000000000000000000000000000',
        '2222300000dd000000000000045a076000045a00000000000000008ddddb00008jjjj456dddddddeeeeeeed000000000000000000000000000000000000000000000000000000000',
        '000093000dd0d0000000012300045600000004555555555555a0076ddddb00076jjjjdddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '00000b000000000000000b093000000000000000000000000045560jjjj45556ijjjjiddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '555556000000000000000b009230000000000000000000000000007jjjj55556diiiidddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '000000000000000000001cg00092223000000000000000000000008iiiidddddddddddddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '00000000000000007551c0012223009355a00000755a00000000009222223ddddddddddd12222223ddddddd000000000000000000000000000000000000000000000000000000000',
        '0007555555a007556ddbg12c000930g8dd4a00076dd455555a007a0000008dddddddddddb0075a08ddddddd000000000000000000000000000000000000000000000000000000000',
        '5556dddddd4556dddddb0b00g00093093dd45556ddddddddd455645555556ddddddddddd4a08gb08ddddddd000000000000000000000000000000000000000000000000000000000'
      ],
      fg: [
        '000000000800700000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000060006007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000700000300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000077700000077770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000001101000700070000000070000007777007000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000011100010000000000000700000000000000000077000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000111030000000700007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000010101077000000070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000007077070007700070070000770007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000001000100100000000020000070000070007077707707777007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '001000000001000000000000001000000000100000000000000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '100000100000000000001070000000000000001101110101010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000100000000001111000700010000000000000000110001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000001111110000007000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000110111100007000000077000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '110000000001100000000000070000000000100000000000000100000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000070000700070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      ],
      lvls: {
        'Inn': {
          x: 25,
          y: 230,
          before: 0,
          inn: true,
          dot: true,
          visible: true
        },
        'Plains 1': {
          x: 100,
          y: 225,
          before: ['Inn'],
          line: true,
          dot: true,
          visible: true
        },
        'Plains 2': {
          x: 160,
          y: 205,
          before: ['Plains 1'],
          line: true,
          dot: true,
          visible: true
        },
        'Plains 3': {
          x: 115,
          y: 145,
          before: ['Plains 2'],
          line: true,
          dot: true,
          visible: true
        },
        'Lake': {
          x: 178,
          y: 145,
          before: ['Plains 5'],
          line: true,
          dot: true,
          visible: true
        },
        'Beach 1': {
          x: 80,
          y: 110,
          before: ['Plains 3'],
          line: true,
          dot: true,
          visible: true
        },
        'Beach 2': {
          x: 105,
          y: 70,
          before: ['Beach 1'],
          line: true,
          dot: true,
          visible: true
        },
        'Plains 4': {
          x: 230,
          y: 170,
          before: ['Plains 2'],
          line: true,
          dot: true,
          visible: true
        },
        'Plains 5': {
          x: 190,
          y: 100,
          before: ['Plains 3', 'Plains 4'],
          line: true,
          dot: true,
          visible: true
        },
        'Castle Gate': {
          x: 290,
          y: 155,
          before: ['Plains 4'],
          line: true,
          dot: true,
          visible: true
        },
        'Cave 1': {
          x: 312,
          y: 106,
          before: ['Castle Gate'],
          line: true,
          dot: false,
          visible: true
        },
        'Cave 2': {
          x: 392,
          y: 42,
          before: ['Cave 1'],
          line: false,
          dot: false,
          visible: true
        },
        'Cliff 1': {
          x: 315,
          y: 65,
          before: ['Cave 2'],
          line: true,
          dot: true,
          visible: true
        },
        'Cliff 2': {
          x: 262,
          y: 40,
          before: ['Cliff 1'],
          line: true,
          dot: true,
          visible: true
        },
        'Cliff 3': {
          x: 200,
          y: 30,
          before: ['Cliff 2'],
          line: true,
          dot: true,
          visible: true
        },
        'Lodge': {
          x: 152,
          y: 11,
          before: ['Cliff 3'],
          line: true,
          dot: false,
          visible: true
        },
        'Castle': {
          x: 360,
          y: 155,
          before: ['Castle Gate'],
          line: true,
          visible: true,
          dot: false
        },
      }
    };

    var levelMaps = { // different maps
      title: [
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000',
        '222230000000000000000000000000000000000000012222',
        '555552222300000000000000000000000000001222255555',
        '555555555522223000000000000000000122225555555555',
        '555555555555555222222222222222222555555555555555',
        '555555555555555555555555555555555555555555555555',
        '555555555555555555555555555555555555555555555555',
        '555555555555555555555555555555555555555555555555'
      ],
      land: [ /* bruh */]
    };

    var levelData = {
      'title': {
        tileset: tilesets.grass,
        data: levelMaps.title
      }
    };

    var items = { // all items
      dagger0: { name: 'Dagger', type: 'weapon', lvl: 0, class: 'Assassin', dmgType: 'Physical', attackMin: 1, attackMax: 2, imageColumn: 0 },
      daggerPhysical1: { name: 'Stone Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Physical', attackMin: 4, attackMax: 6, imageColumn: 0 },
      daggerBurn1: { name: 'Flame Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Burn', attackMin: 2, attackMax: 3, eAttackMin: 2, eAttackMax: 3, magic: 10, imageColumn: 1 },
      daggerShock1: { name: 'Electric Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Shock', attackMin: 2, attackMax: 3, eAttackMin: 1, eAttackMax: 6, magic: 10, imageColumn: 2 },
      daggerFreeze1: { name: 'Ice Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Freeze', attackMin: 2, attackMax: 3, eAttackMin: 3, eAttackMax: 3, magic: 15, imageColumn: 3 },
      daggerPoison1: { name: 'Poison Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Poison', attackMin: 2, attackMax: 3, eAttackMin: 1, eAttackMax: 1, magic: 15, imageColumn: 4 },
      daggerPhysical2: { name: 'Iron Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Physical', attackMin: 8, attackMax: 10, imageColumn: 0 },
      daggerBurn2: { name: 'Glowing Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Burn', attackMin: 5, attackMax: 7, eAttackMin: 5, eAttackMax: 6, magic: 12, imageColumn: 1 },
      daggerShock2: { name: 'Thunder Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Shock', attackMin: 5, attackMax: 7, eAttackMin: 1, eAttackMax: 15, magic: 12, imageColumn: 2 },
      daggerFreeze2: { name: 'Frozen Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Freeze', attackMin: 5, attackMax: 7, eAttackMin: 8, eAttackMax: 10, magic: 20, imageColumn: 3 },
      daggerPoison2: { name: 'Toxic Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Poison', attackMin: 5, attackMax: 7, eAttackMin: 1, eAttackMax: 2, magic: 20, imageColumn: 4 },
      card0: { name: 'Placeholder card', type: 'accessory', lvl: 0, tooltip: ['Nothing. Nothing at', 'all.'], imageColumn: 0 },
      cardQuick1: { name: 'Quick card', type: 'accessory', lvl: 1, tooltip: 'Attack interval -10%', imageColumn: 0 },
      cardSniper1: { name: 'Sniper card', type: 'accessory', lvl: 1, tooltip: 'Attack distance +25', imageColumn: 1 },
      cardOnigiri1: { name: 'Onigiri card', type: 'accessory', lvl: 1, tooltip: 'Onigiri drop +25%', imageColumn: 2 },
      cardLum1: { name: 'Lum\'s card', type: 'accessory', lvl: 1, tooltip: ['Umeboshi onigiri drop', '+15%'], imageColumn: 3 }
    };

    var inventoryData = {
      weapons: [0, 0, 0, 0],
      //accessories: [0, 0, 0, 0, 0, 0, 0, 0],
      backpack: [ // array of items in backpack
        { name: 'dagger0', type: 'weapon', accessories: [0, 0] }, 0, 0, 0, 0, 0,
        { name: 'daggerPhysical1', type: 'weapon', accessories: [0, 0] }, { name: 'daggerBurn1', type: 'weapon', accessories: [0, 0] }, { name: 'daggerShock1', type: 'weapon', accessories: [0, 0] }, { name: 'daggerFreeze1', type: 'weapon', accessories: [0, 0] }, { name: 'daggerPoison1', type: 'weapon', accessories: [0, 0] }, 0,
        { name: 'daggerPhysical2', type: 'weapon', accessories: [0, 0] }, { name: 'daggerBurn2', type: 'weapon', accessories: [0, 0] }, { name: 'daggerShock2', type: 'weapon', accessories: [0, 0] }, { name: 'daggerFreeze2', type: 'weapon', accessories: [0, 0] }, { name: 'daggerPoison2', type: 'weapon', accessories: [0, 0] }, 0,
        { name: 'card0', type: 'accessory' }, { name: 'cardQuick1', type: 'accessory' }, { name: 'cardSniper1', type: 'accessory' }, { name: 'cardOnigiri1', type: 'accessory' }, { name: 'cardLum1', type: 'accessory' }, 0
      ]
    };

    var invalidState = function () { // if current game state has no case in switch statement
      drawText({ text: 'ERROR:', size: 48, color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2, center: true });
      drawText({ text: 'REQUESTED STATE "' + STATE + '"', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 40, center: true });
      drawText({ text: 'DOES NOT EXIST!', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 60, center: true });
      drawText({ text: 'Actual gameplay coming soon... ;)', color: 12, x: gameSettings.width / 2, y: gameSettings.height - 60, center: true });
    };

    var level = (function () { // i cant do physics
      var levelCanvas = document.createElement('canvas');
      var levelStage = levelCanvas.getContext('2d');

      var initLevel = function (level) { // draw the level using data from an array
        level = levelData[level];
        var levelWidth = Math.floor(gameSettings.width / 16);
        var levelHeight = Math.floor(gameSettings.height / 16);
        var tileset = level.tileset;
        var data = level.data;
        levelCanvas.width = levelWidth * 16;
        levelCanvas.height = levelHeight * 16;
        for (var y = 0; y < levelHeight; y++) {
          for (var x = 0; x < levelWidth; x++) {
            var curTile = parseInt(data[y].charAt(x)) * 16;
            if (curTile) levelStage.drawImage(tileset, curTile, 0, 16, 16, x * 16, y * 16, 16, 16);
          }
        }
      };

      var drawLevel = function () {
        stage.drawImage(levelCanvas, 0, 0);
      };

      return (function () {
        var oldLevel;

        return function (level) {
          if (oldLevel !== level) initLevel(level);
          drawLevel();
          oldLevel = level;
        }
      })();
    })();

    var map = (function (mapData) { // draw map using similar method to level drawing
      var mapCanvas = document.createElement('canvas');
      var mapStage = mapCanvas.getContext('2d');
      var tileset = {
        bg: tilesets.map,
        fg: tilesets.mapIcons
      };
      var mapHeight = 17;
      var offset = 0;
      var scrollRight = gameSettings.width - 125;
      var scrollLeft = 125;
      var offsetLimit = mapData.width * 16 - gameSettings.width;
      var tiles = {
        bg: mapData.bg,
        fg: mapData.fg
      };
      var lvls = mapData.lvls;
      var lvlButtons = {};
      var hovering = [];

      var initButtons = function () {
        for (var l in lvls) { // create level buttons
          var cur = lvls[l];
          lvlButtons[l] = new CButton({
            x: cur.x,
            y: cur.y,
            width: 21,
            height: 21,
            bgColor: 'rgba(0, 0, 0, 0)',
            bgHoverColor: 8,
            border: false,
            borderColor: 1,
            borderWidth: 1,
            id: l,
            hover: function () {
              hovering.push(this.id);
              this.border = true;
            },
            notHover: function () {
              this.border = false;
            },
            click: function () {
              // bruh
            }
          });
        }
      };

      var initMap = function () { // draw map once
        mapCanvas.width = mapData.width * 16;
        mapCanvas.height = mapHeight * 16;
        for (var y = 0; y < mapHeight; y++) {
          for (var x = 0; x < mapData.width; x++) {
            var curBg = tiles.bg[y].charAt(x + Math.floor(offset / 16));
            var curFg = tiles.fg[y].charAt(x + Math.floor(offset / 16));
            var curBgTile = (isNaN(parseInt(curBg)) ? convertBase(curBg, 36, 10) : parseInt(curBg)) * 16;
            var curFgTile = (isNaN(parseInt(curFg)) ? convertBase(curFg, 36, 10) : parseInt(curFg)) * 16;
            if (curBgTile) mapStage.drawImage(tileset.bg, curBgTile, 0, 16, 16, x * 16, y * 16, 16, 16); // draw bg
            if (curFgTile) mapStage.drawImage(tileset.fg, curFgTile, 0, 16, 16, x * 16, y * 16, 16, 16); // draw fg
          }
        }
      };

      var drawMap = function () { // draw map image
        stage.drawImage(mapCanvas, 0 - offset, 0);
      };

      var drawLevels = function () { // draw map levels
        hovering = [];
        for (var l in lvlButtons) {
          var cur = lvlButtons[l];
          var lvl = mapData.lvls[cur.id];
          if (lvl.visible) {
            var before = lvl.before;
            cur.x = lvls[l].x - offset;
            if (before && lvl.line) for (var i = 0; i < before.length; i++) drawDottedLine(cur.x, cur.y, mapData.lvls[before[i]].x - offset, mapData.lvls[before[i]].y, 20);
            cur.draw();
            stage.fillStyle = lvl.inn ? colors[19] : colors[1];
            if (lvl.dot) stage.fillRect(cur.x - 4, cur.y - 4, 8, 8);
          }
        }
        if (hovering[0]) { // this feels like a really weird way to do this but it works ¯\_(ツ)_/¯
          var textWidth = stage.measureText(hovering[0]).width;
          drawText({ text: hovering[0], size: 16, x: mouse.x - textWidth / 2 < 0 ? textWidth / 2 : mouse.x, y: mouse.y < 20 ? 10 : mouse.y - 8, center: true });
        }
      };

      var doScrolling = function () { // mouse scrolling
        if (mouse.y > 0 && mouse.y < mapHeight * 16) { // if within y bounds of map, allow scroll
          if (mouse.x > scrollRight && mouse.x <= gameSettings.width) offset += ms * ((mouse.x - scrollRight) / 100); // <-- shit math
          if (mouse.x < scrollLeft && mouse.x >= 0 && offset > 0) offset -= ms * ((scrollLeft - mouse.x) / 100);
        }
        if (offset < 0) offset = 0;
        if (offset > offsetLimit) offset = offsetLimit;

        drawText({ text: (offset === 0 ? '' : '<<'), x: 20, y: gameSettings.height / 4, center: true }); // left/right scroll indicators
        drawText({ text: (offset === offsetLimit ? '' : '>>'), x: gameSettings.width - 20, y: gameSettings.height / 4, center: true });
      };

      return {
        init: function () {
          initButtons();
          initMap();
        },
        draw: function () {
          drawMap();
          drawLevels();
          doScrolling();
        }
      }
    })(mapData);

    var inventoryBar = (function () { // unfinished crap
      var buttons = {
        inventory: []
      };

      var info = [];
      var isHovering = false;
      var cursorItem = 0;

      var itemSlotHover = function () {
        isHovering = true;
        var section = this.id[0];
        var slotId = this.id[1];
        var item;

        if (section === 'accessories') {
          var weapon = inventoryData.weapons[Math.floor(slotId / 2)];
          item = weapon ? items[weapon.accessories[slotId % 2].name] : 0
        } else {
          item = items[inventoryData[section][slotId].name];
        }

        if (item) {
          switch (item.type) {
            case 'weapon':
              var accessories = inventoryData[section][slotId].accessories.filter(Boolean).length;

              info = [
                item.name + ' ' + item.lvl,
                item.dmgType + ' type ' + item.type,
                item.attackMin + '-' + item.attackMax + ' hit dmg'
              ];

              if (item.eAttackMin || item.eAttackMax || item.magic) {
                info.push(
                  item.eAttackMin + '-' + item.eAttackMax + ' elemental dmg',
                  item.magic + ' elemental cost'
                );
              }

              if (accessories > 0) info.push('&' + accessories + (accessories > 1 ? ' accessories attached' : ' accessory attached'));
              break;
            case 'accessory':
              info = [
                item.name + ' ' + item.lvl,
                item.type.capitalize(),
              ];

              if (Array.isArray(item.tooltip)) { // multi-line tooltip
                item.tooltip.forEach(function (cur) {
                  info.push(cur);
                });
              } else {
                info.push(item.tooltip);
              }
              break;
          }
        } else {
          info = [];
        }
      };

      var itemSlotClick = function () {
        var section = this.id[0];
        var slotId = this.id[1];
        if (section === 'accessories' && cursorItem.type === 'accessory') {
          var accSlot = slotId % 2;
          var weaponSlot = Math.floor(slotId / 2);
          var weapon = inventoryData.weapons[weaponSlot];
          if (weapon) {
            weapon.accessories[accSlot] = cursorItem;
            cursorItem = 0;
            audio.accessory.play();
          } else {
            audio.error.play();
          }
        } else if ((section === 'weapons' && (cursorItem.type === 'weapon' || !cursorItem)) || section === 'backpack') {
          if (section === 'weapons') audio.click3.play();
          inventoryData[section][slotId] = [cursorItem, cursorItem = inventoryData[section][slotId]][0];
        } else {
          audio.error.play();
        }
      };

      var drawBg = function (color) {
        stage.fillStyle = colors[color];
        stage.fillRect(0, gameSettings.height - 160, gameSettings.width, 160);
      };

      var drawCursor = function () {
        if (cursorItem) {
          var item = items[cursorItem.name];
          var currentSpritesheet;
          switch (item.type) {
            case 'weapon':
              currentSpritesheet = sprites['weapon' + item.class];
              break;
            case 'accessory':
              currentSpritesheet = sprites.accessory;
              break;
          }
          var imageRow = item.lvl * 24;
          stage.drawImage(currentSpritesheet, item.imageColumn * 24, imageRow, 24, 24, mouse.x - 12, mouse.y - 12, 24, 24);
        }
      };

      var drawInfo = function () {
        drawText({ text: 'weapon', size: 10, color: 20, x: 180, y: gameSettings.height - 112, outline: true });
        drawText({ text: 'accessories', size: 10, color: 20, x: 180, y: gameSettings.height - 72, outline: true });
        if (isHovering) {
          for (var i = 0; i < info.length; i++) {
            var cur = info[i]; // should be using a foreach loop hnugbmnhbtfhmcvyb
            var curColor = 20;
            var curOutlineColor = 8;
            var curOutlineWidth = 3;
            if (cur.charAt(0) === '&') {
              cur = cur.slice(1);
              curColor = 2;
              curOutlineColor = 2;
              curOutlineWidth = 1;
            }
            drawText({
              text: cur,
              size: (i ? 13 : 16),
              color: curColor,
              x: gameSettings.width - 475,
              y: gameSettings.height - 142 + i * 25 + (i ? 5 : 0),
              outline: true,
              outlineColor: curOutlineColor,
              outlineWidth: curOutlineWidth
            });
          }
        }
      };

      var drawItemSlots = function () {
        isHovering = false;

        for (var i = 0; i < buttons.inventory.length; i++) {
          var currentSlot, currentItem, currentItemData, imageRow, currentSpritesheet, section, slotId;
          currentSlot = buttons.inventory[i];
          section = currentSlot.id[0];
          slotId = currentSlot.id[1];
          currentSlot.draw();

          if (section === 'accessories') {
            var weapon = inventoryData.weapons[Math.floor(slotId / 2)];
            currentItem = weapon ? weapon.accessories[slotId % 2] : 0;
          } else {
            currentItem = inventoryData[section][slotId];
          }
          currentItemData = items[currentItem.name];
          imageRow = currentItemData ? currentItemData.lvl * 24 : 0;

          switch (currentItem.type) {
            case 'weapon':
              currentSpritesheet = sprites['weapon' + currentItemData.class];
              break;
            case 'accessory':
              currentSpritesheet = sprites.accessory;
              break;
          }

          if (currentItem) stage.drawImage(currentSpritesheet, currentItemData.imageColumn * 24, imageRow, 24, 24, currentSlot.x - 12, currentSlot.y - 12, 24, 24);
        }
      };

      var setupWeaponButtons = function () {
        for (var i = 0; i < 4; i++) { // weapons
          buttons.inventory.push(new CButton({
            x: 20 + i * 45,
            y: gameSettings.height - 100,
            width: 35,
            height: 35,
            border: false,
            hover: itemSlotHover,
            click: itemSlotClick,
            noClickSound: true,
            id: ['weapons', i]
          }));
        }
      };

      var setupAccessoryButtons = function () {
        var i = 0;
        for (var x = 0; x < 4; x++) { // accessories
          for (var y = 0; y < 2; y++) {
            buttons.inventory.push(new CButton({
              x: 20 + x * 45,
              y: gameSettings.height - 60 + y * 40,
              width: 35,
              height: 35,
              border: false,
              hover: itemSlotHover,
              click: itemSlotClick,
              noClickSound: true,
              id: ['accessories', i]
            }));
            i++;
          }
        }
      };

      var setupBackpackButtons = function () {
        var i = 0;
        for (var y = 0; y < 4; y++) { // backpack
          for (var x = 0; x < 6; x++) {
            buttons.inventory.push(new CButton({
              x: gameSettings.width - 220 + x * 40,
              y: gameSettings.height - 140 + y * 40,
              width: 35,
              height: 35,
              border: false,
              hover: itemSlotHover,
              click: itemSlotClick,
              id: ['backpack', i]
            }));
            i++;
          }
        }
      };

      var initButtons = function () {
        setupWeaponButtons();
        setupAccessoryButtons();
        setupBackpackButtons();
      };
      initButtons();

      return function () {
        drawBg(23);
        drawItemSlots();
        drawInfo();
        drawCursor();
      }
    })();

    var title = (function () { // title screen
      var buttons = {
        begin: new CButton({
          text: 'New Game',
          x: gameSettings.width / 2,
          y: gameSettings.height / 2,
          width: 235,
          height: 36,
          click: function () {
            STATE = 'newGame';
          }
        }),
        credits: new CButton({
          text: 'Credits',
          x: gameSettings.width / 2,
          y: gameSettings.height / 2 + 50,
          width: 235,
          height: 36,
          click: function () {
            STATE = 'credits';
          }
        }),
        website: new CButton({
          text: 'More Games...',
          x: gameSettings.width / 2,
          y: gameSettings.height / 2 + 100,
          width: 235,
          height: 36,
          click: function () {
            open('https://quique.gq/');
          }
        })
      };

      return function () {
        drawText({
          text: gameSettings.version,
          color: 20,
          size: 16,
          x: 0,
          y: gameSettings.height
        });
        drawText({
          text: 'a game by Literal Line',
          color: 14,
          size: 16,
          x: gameSettings.width / 2,
          y: 115,
          center: true
        });
        stage.drawImage(sprites.logo, gameSettings.width / 2 - sprites.logo.width / 2, 40, 217, 61);

        for (var b in buttons) if (buttons[b]) buttons[b].draw();
      };
    })();

    var credits = (function () { // credits screen
      var buttons = {
        back: new CButton({
          text: 'Return to menu',
          x: gameSettings.width / 2,
          y: gameSettings.height - 50,
          width: 250,
          height: 36,
          click: function () {
            STATE = 'title';
          }
        }),
        sr: new CButton({
          text: 'Stick Ranger',
          color: 2,
          x: 650,
          y: gameSettings.height / 2 + 25,
          width: 205,
          height: 25,
          click: function () {
            open('https://dan-ball.jp/en/javagame/ranger/');
          }
        }),
        lospec: new CButton({
          text: 'lospec.com',
          color: 2,
          x: 450,
          y: gameSettings.height / 2 + 55,
          width: 170,
          height: 25,
          click: function () {
            open('https://lospec.com/palette-list/pineapple-32');
          }
        })
      };

      return function () {
        drawText({
          text: 'Credits',
          color: 14,
          size: 54,
          x: gameSettings.width / 2,
          y: 80,
          center: true
        });
        drawText({
          text: '• Coding and game engine by Literal Line',
          x: 15,
          y: gameSettings.height / 2
        });
        drawText({
          text: "• Sound effects from Dan Ball's",
          x: 15,
          y: gameSettings.height / 2 + 30
        });
        drawText({
          text: '• Color pallete from lospec.com',
          x: 15,
          y: gameSettings.height / 2 + 60
        });
        drawText({
          text: '  (slightly modified)',
          x: 15,
          y: gameSettings.height / 2 + 90
        });

        for (var b in buttons) if (buttons[b]) buttons[b].draw();
      };
    })();

    var newGame = (function () { // team creation screen
      var selectedMember = 1;
      var selectedClass;
      var checklist = [false, false, false, false]; // bool array for checking if each team member has been selected a class
      var buttons = {
        members: {
          m1: new CButton({
            x: gameSettings.width / 2 - 225,
            y: gameSettings.height / 2 - 25,
            width: 50,
            height: 50,
            border: true,
            click: function () {
              selectedMember = 1;
            }
          }),
          m2: new CButton({
            x: gameSettings.width / 2 - 75,
            y: gameSettings.height / 2 - 25,
            width: 50,
            height: 50,
            border: true,
            click: function () {
              selectedMember = 2;
            }
          }),
          m3: new CButton({
            x: gameSettings.width / 2 + 75,
            y: gameSettings.height / 2 - 25,
            width: 50,
            height: 50,
            border: true,
            click: function () {
              selectedMember = 3;
            }
          }),
          m4: new CButton({
            x: gameSettings.width / 2 + 225,
            y: gameSettings.height / 2 - 25,
            width: 50,
            height: 50,
            border: true,
            click: function () {
              selectedMember = 4;
            }
          })
        },
        classes: {
          c1: new CButton({
            x: gameSettings.width / 2 - 300,
            y: gameSettings.height / 2 + 70,
            width: 40,
            height: 40,
            border: true,
            click: function () {
              selectedClass = 1;
              updateTeamData();
            }
          }),
          c2: new CButton({
            x: gameSettings.width / 2 - 180,
            y: gameSettings.height / 2 + 70,
            width: 40,
            height: 40,
            border: true,
            click: function () {
              selectedClass = 2;
              updateTeamData();
            }
          }),
          c3: new CButton({
            x: gameSettings.width / 2 - 60,
            y: gameSettings.height / 2 + 70,
            width: 40,
            height: 40,
            border: true,
            click: function () {
              selectedClass = 3;
              updateTeamData();
            }
          }),
          c4: new CButton({
            x: gameSettings.width / 2 + 60,
            y: gameSettings.height / 2 + 70,
            width: 40,
            height: 40,
            border: true,
            click: function () {
              selectedClass = 4;
              updateTeamData();
            }
          }),
          c5: new CButton({
            x: gameSettings.width / 2 + 180,
            y: gameSettings.height / 2 + 70,
            width: 40,
            height: 40,
            border: true,
            click: function () {
              selectedClass = 5;
              updateTeamData();
            }
          }),
          c6: new CButton({
            x: gameSettings.width / 2 + 300,
            y: gameSettings.height / 2 + 70,
            width: 40,
            height: 40,
            border: true,
            click: function () {
              selectedClass = 6;
              updateTeamData();
            }
          })
        },
        back: new CButton({
          text: 'Back',
          color: 20,
          x: gameSettings.width / 2 - 200,
          y: gameSettings.height - 40,
          height: 36,
          click: function () {
            selectedMember = 1;
            selectedClass = undefined;
            checklist = [false, false, false, false];
            teamData.member1.class = 'Member 1';
            teamData.member2.class = 'Member 2';
            teamData.member3.class = 'Member 3';
            teamData.member4.class = 'Member 4';
            STATE = 'title';
          }
        }),
        begin: new CButton({
          text: 'Begin',
          x: gameSettings.width / 2 + 200,
          y: gameSettings.height - 40,
          height: 36,
          click: function () {
            if (checklist.every(Boolean)) STATE = 'map'; // will only continue if all team members have been selected a class
          }
        })
      };

      var updateTeamData = function () {
        teamData['member' + selectedMember].class = classList[selectedClass - 1];
        checklist[selectedMember - 1] = true;
      };

      return function () {
        drawText({ text: 'New Game', color: 14, size: 54, x: gameSettings.width / 2, y: 80, center: true });
        drawText({ text: 'Create your team:', color: 14, size: 20, x: gameSettings.width / 2, y: 120, center: true });

        for (var b in buttons.members) {
          var cur = buttons.members[b];
          var memberNumber = parseInt(b.slice(-1));

          cur.borderColor = memberNumber === selectedMember ? 2 : 20;
          drawText({
            text: teamData['member' + memberNumber].class,
            size: 16,
            x: cur.x,
            y: cur.y + 50,
            center: true
          });
          cur.draw();
        }
        for (var b in buttons.classes) {
          var cur = buttons.classes[b];
          var classNumber = parseInt(b.slice(-1));

          cur.borderColor = classNumber === selectedClass ? 2 : 20;
          drawText({ text: classList[classNumber - 1], size: 16, x: cur.x, y: cur.y + 50, center: true });
          cur.draw();
          stage.drawImage(sprites.itemDrops, (classNumber + 1) * 8, 0, 8, 8, cur.x - 16, cur.y - 16, 32, 32); // draw class's weapon drop icon on top of button
        }
        buttons.begin.color = checklist.every(Boolean) ? 10 : 1; // turns green when all team members have been selected a class
        buttons.back.draw();
        buttons.begin.draw();
      };
    })();

    var lastDelta = 0;
    var fps;
    var ms;

    return {
      init: function () {
        map.init();
      },
      loop: function (delta) {
        ms = delta - lastDelta; // calculate frame interval
        fps = Math.floor(1000 / ms); // not actually fps, just frame interval converted into screen refresh rate
        stage.clearRect(0, 0, gameSettings.width, gameSettings.height); // clear screen

        switch (STATE) { // run functions based on game state
          case 'title':
            level('title');
            title();
            break;
          case 'credits':
            level('title');
            credits();
            break;
          case 'newGame':
            level('title');
            newGame();
            break;
          case 'map':
            map.draw();
            inventoryBar();
            break;
          default:
            invalidState(); // if current state does not exist...
        }

        drawText({ text: 'FPS: ' + fps, size: 16, x: 0, y: 12 });
        /*drawText({ text: 'MS: ' + ms, x: 0, y: 40 });*/
        lastDelta = delta;
        requestAnimationFrame(game.loop); // and again and again and again and again and again and again...
      }
    }
  })();

  var init = function () {
    console.log('rpg-test ' + gameSettings.version);
    console.log('authors: ' + gameSettings.authors);
    setupMouseEventListeners();
    setupCanvas();
    setupAudio();
    game.init();
  };

  return {
    go: function () { // called once document body loads
      init();
      document.body.appendChild(canvas);
      requestAnimationFrame(game.loop);
    }
  };
})();


// misc functions

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function convertBase(value, from_base, to_base) { // i know you can convert base 36 to 10 and whatever without this but i like it so im gonna use it
  var range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
  var from_range = range.slice(0, from_base);
  var to_range = range.slice(0, to_base);

  var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
    if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `' + digit + '` for base ' + from_base + '.');
    return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
  }, 0);

  var new_value = '';
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || '0';
}

function newImage(src) {
  var img = document.createElement('img');
  img.src = src;
  return img;
}

function newWav(src) {
  var audio = new Audio(src);
  audio.setAttribute('type', 'audio/x-wav');
  return audio;
}

function hexToRgba(hex, opacity) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? 'rgba(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ', ' + opacity + ')'
    : null;
}
