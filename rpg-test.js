// rpg-test by Literal Line
// more at quique.gq

var RPG_TEST = (function () {
  'use strict';

  var canvas = document.createElement('canvas');
  var stage = canvas.getContext('2d');
  var gameSettings = {
    version: 'v0.1-20210121-2029est',
    authors: ['Literal Line'], // in case you mod or whatever
    width: 768,
    height: 432,
    widthCSS: '768px',
    heightCSS: '432px',
    bg: '#000000',
    aa: false // leave this off to keep images c r i s p
  };

  var setupEventListeners = function () {
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

  var setupCanvas = function() {
    canvas.width = gameSettings.width;
    canvas.height = gameSettings.height;
    canvas.style.width = gameSettings.widthCSS;
    canvas.style.height = gameSettings.heightCSS;
    canvas.style.background = gameSettings.bg;
    canvas.style.imageRendering = gameSettings.aa ? 'auto' : 'pixelated';
    canvas.style.imageRendering = gameSettings.aa ? 'auto' : '-moz-crisp-edges';
    stage.imageSmoothingEnabled = gameSettings.aa;
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
    soundClick: './assets/click.wav'
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
    click: newWav(assets.soundClick)
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

  var init = function () {
    console.log('rpg-test ' + gameSettings.version);
    console.log('authors: ' + gameSettings.authors);
    setupEventListeners();
    setupCanvas();
  };

  var getMousePos = function (c, e) { // gets mouse pos on canvas by taking actual canvas position on document into account
    var rect = c.getBoundingClientRect();
    var scaleX = gameSettings.width / rect.width;
    var scaleY = gameSettings.height / rect.height;
    return {
      x: Math.floor(e.clientX * scaleX - rect.left * scaleX),
      y: Math.floor(e.clientY * scaleY - rect.top * scaleY)
    };
  };

  var drawLine = function (startX, startY, endX, endY) { // draw a line but easier ¯\_(ツ)_/¯
    stage.beginPath();
    stage.moveTo(startX, startY);
    stage.lineTo(endX, endY);
    stage.stroke();
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
    this.borderColor = obj.borderColor || 1;
    this.bgColor = obj.bgColor || 8;
    this.bgHoverColor = obj.bgHoverColor || 2;
    this.border = obj.border;
    this.hover = obj.hover; // <-- will call this function on hover
    this.click = obj.click; // <-- will call this function on click
    this.id = obj.id;
  };

  CButton.prototype.draw = (function () { // draw proto (might change name later...)
    audio.click.volume = 0.5;

    return function () {
      var mx = mouse.x;
      var my = mouse.y;
      var x = this.x;
      var y = this.y;
      var width = this.width;
      var height = this.height;
      if (this.border) {
        stage.lineWidth = 2;
        stage.strokeStyle = colors[this.borderColor];
        stage.strokeRect(x - width / 2, y - height / 2, width, height);
      }
      stage.fillStyle = colors[this.bgColor];
      stage.fillRect(x - width / 2, y - height / 2, width, height);

      if (mx >= x - width / 2 && mx <= x + width / 2 && my >= y - height / 2 && my <= y + height / 2) {
        stage.fillStyle = hexToRgba(colors[this.bgHoverColor], 0.25);
        stage.fillRect(x - width / 2, y - height / 2, width, height);
        if (this.hover) this.hover();
        if (mouse.click) {
          audio.click.play();
          mouse.click = false;
          this.click();
        }
      }
      if (this.text)
        drawText({
          text: this.text,
          color: this.color,
          x: x,
          y: y + 5,
          center: true
        });
    };
  })();

  var gameLoop = (function () {
    var STATE = 'title'; // keeps track of game state. which functions run during which state is determined by a switch statement at the end of this IIFE

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

    var mapData = { // the chunky soup you ordered sir...
      width: 144,
      bg: [
        'dddddd45ag00000g04a0000000b076ddddddddddddddddddddddddddddd8000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'dddddddd45a0g0000g455a000760bdddddddddddddddddddddddddddddd8000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'dddddddddd4555a00000045556076ddddddd12223dddd122223ddddddddb000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'ddddddddeeee00455a000000000bddddd122c00092222c00009223dddddb000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        'dddddeeeee000000b455a0000076dddd1c000000000000000000093ddddb000075555a0000000075555555a000000000000000000000000000000000000000000000000000000000',
        'ddddeee00000000045a045555568ddd1c00000000000000000000092222c00008ddddb0000000767675a4a4a00000000000000000000000000000000000000000000000000000000',
        'ddeee0000000000000455a0g0009222c000000000000000000000000000000008ddddb0755555676e8gbe4a4a0000000000000000000000000000000000000000000000000000000',
        'dee0000000000000000008000g000gb0000000000000000000000075555a00008ddddb767555556ee92cee4500000000000000000000000000000000000000000000000000000000',
        'ee00000000000000000004555ag000b000000000000000000000008ddddb00008jjjj4676dddddeeeeeeeee000000000000000555550000000000000000000000000000000000000',
        '222230000000000000000000045a076000045a00000000000000008ddddb00008jjjj456dddddddeeeeeeed000000000000000000000000000000000000000000000000000000000',
        '00009300000000000000012300045600000004555555555555a0076ddddb00076jjjjdddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '00000b000000000000000b093000000000000000000000000045560jjjj45556ijjjjiddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '555556000000000000000b009230000000000000000000000000007jjjj55556diiiidddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '000000000000000000001c0g0092223000000000000000000000008iiiidddddddddddddddddddddddddddd000000000000000000000000000000000000000000000000000000000',
        '00000000000000007551c00000g0009355a00000755a00000000009222223ddddddddddd12222223ddddddd000000000000000000000000000000000000000000000000000000000',
        '0007555555a007556ddbg000000000g8dd4a00076dd455555a007a0000008dddddddddddb0075a08ddddddd000000000000000000000000000000000000000000000000000000000',
        '5556dddddd4556dddddb000g0000g0093dd45556ddddddddd455645555556ddddddddddd4a08gb08ddddddd000000000000000000000000000000000000000000000000000000000'
      ],
      fg: [
        '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000077700000077770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000100000000000000000070000707777007000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000100000000000000000700000000000000000077000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000011030000000000007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000101000000000077000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000070070000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000020000000000000007077707707777007000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '001000000000000000000000001000000000100000000000000770000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '100000100000000000001000000000000000001101110101010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000100000000000011000000010000000000000000110001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000001110000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000011100000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000001100000000000000000000000100000000000000100000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      ]
    };

    var levelMaps = { // different maps
      title: [
        [
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
        ]
      ],
      land: [ /* bruh */]
    };

    var levelData = [
      {
        name: 'title',
        tileset: tilesets.grass,
        data: levelMaps.title,
        multiple: false // will pick random map if set to true (intended for actual levels later on...)
      }
    ];

    var items = { // all items
      daggerStarter0: { name: 'Butter Knife', type: 'weapon', lvl: 0, class: 'Assassin', dmgType: 'Physical', attackMin: 1, attackMax: 2, imageColumn: 0 },
      daggerPhysical1: { name: 'Stone Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Physical', attackMin: 2, attackMax: 4, imageColumn: 0 },
      daggerBurn1: { name: 'Glowing Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Burn', attackMin: 2, attackMax: 3, eAttackMin: 2, eAttackMax: 3, magic: 10, imageColumn: 1 },
      daggerShock1: { name: 'Electric Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Shock', attackMin: 2, attackMax: 3, eAttackMin: 1, eAttackMax: 6, magic: 10, imageColumn: 2 },
      daggerFreeze1: { name: 'Frozen Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Freeze', attackMin: 2, attackMax: 3, eAttackMin: 3, eAttackMax: 3, magic: 15, imageColumn: 3 },
      daggerPoison1: { name: 'Poison Dagger', type: 'weapon', lvl: 1, class: 'Assassin', dmgType: 'Poison', attackMin: 2, attackMax: 3, eAttackMin: 1, eAttackMax: 1, magic: 15, imageColumn: 4 },
      daggerPhysical2: { name: 'Iron Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Physical', attackMin: 8, attackMax: 10, imageColumn: 0 },
      daggerBurn2: { name: 'Flame Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Burn', attackMin: 5, attackMax: 7, eAttackMin: 5, eAttackMax: 6, magic: 12, imageColumn: 1 },
      daggerShock2: { name: 'Thunder Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Shock', attackMin: 5, attackMax: 7, eAttackMin: 1, eAttackMax: 15, magic: 12, imageColumn: 2 },
      daggerFreeze2: { name: 'Ice Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Freeze', attackMin: 5, attackMax: 7, eAttackMin: 8, eAttackMax: 10, magic: 20, imageColumn: 3 },
      daggerPoison2: { name: 'Toxic Knife', type: 'weapon', lvl: 2, class: 'Assassin', dmgType: 'Poison', attackMin: 5, attackMax: 7, eAttackMin: 1, eAttackMax: 2, magic: 20, imageColumn: 4 },
      card0: { name: 'Placeholder card', type: 'accessory', lvl: 0, tooltip: ['Nothing. Nothing at', 'all.'], imageColumn: 0 },
      cardQuick1: { name: 'Quick card', type: 'accessory', lvl: 1, tooltip: 'Attack speed -10%', imageColumn: 0 },
      cardSniper1: { name: 'Sniper card', type: 'accessory', lvl: 1, tooltip: 'Attack distance +25', imageColumn: 1 },
      cardOnigiri1: { name: 'Onigiri card', type: 'accessory', lvl: 1, tooltip: 'Onigiri drop +25%', imageColumn: 2 },
      cardLum1: { name: 'Lum\'s card', type: 'accessory', lvl: 1, tooltip: ['Umeboshi onigiri drop', '+15%'], imageColumn: 3 }
    };

    var inventoryData = {
      m1: { weapon: 0, acc1: 0, acc2: 0 },
      m2: { weapon: 0, acc1: 0, acc2: 0 },
      m3: { weapon: 0, acc1: 0, acc2: 0 },
      m4: { weapon: 0, acc1: 0, acc2: 0 },
      backpack: [ // array of items in backpack
        'daggerStarter0', 0, 0, 0, 0, 0,
        'daggerPhysical1', 'daggerBurn1', 'daggerShock1', 'daggerFreeze1', 'daggerPoison1', 0,
        'daggerPhysical2', 'daggerBurn2', 'daggerShock2', 'daggerFreeze2', 'daggerPoison2', 0,
        'card0', 'cardQuick1', 'cardSniper1', 'cardOnigiri1','cardLum1', 0
      ]
    };

    var invalidState = function () { // if current game state has no case in switch statement
      drawText({ text: 'ERROR:', size: 48, color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2, center: true });
      drawText({ text: 'REQUESTED STATE "' + STATE + '"', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 40, center: true });
      drawText({ text: 'DOES NOT EXIST!', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 60, center: true });
      drawText({ text: 'Actual gameplay coming soon... ;)', color: 12, x: gameSettings.width / 2, y: gameSettings.height - 60, center: true });
    };

    var level = (function () { // draw level and eventually draw stickmen once i figure out the physics
      /*var Stickman = function (obj) {
        this.joints = {
          shoulders: { x: 0, y: 0 },
          elbowRight: { x: 0, y: 0, rot: 0 },
          elbowLeft: { x: 0, y: 0, rot: 0 },
          handRight: { x: 0, y: 0, rot: 0 },
          handLeft: { x: 0, y: 0, rot: 0 },
          hips: { x: 0, y: 0, rot: 0 },
          kneeRight: { x: 0, y: 0, rot: 0 },
          kneeLeft: { x: 0, y: 0, rot: 0 },
          footRight: { x: 0, y: 0, rot: 0 },
          footLeft: { x: 0, y: 0, rot: 0 }
        };
      };

      Stickman.prototype.doPhysics = function () {
        // bruh
      };

      Stickman.prototype.draw = function () { // this works and will probably stay here a while...
        var joints = this.joints;
        stage.strokeStyle = colors[20];
        stage.lineWidth = 1;
        drawLine(joints.shoulders.x, joints.shoulders.y, joints.hips.x, joints.hips.y);
        stage.beginPath();
        stage.moveTo(joints.handLeft.x, joints.handLeft.y);
        stage.lineTo(joints.elbowLeft.x, joints.elbowLeft.y);
        stage.lineTo(joints.shoulders.x, joints.shoulders.y);
        stage.lineTo(joints.elbowRight.x, joints.elbowRight.y);
        stage.lineTo(joints.handRight.x, joints.handRight.y);
        stage.stroke();

        stage.beginPath();
        stage.moveTo(joints.footLeft.x, joints.footLeft.y);
        stage.lineTo(joints.kneeLeft.x, joints.kneeLeft.y);
        stage.lineTo(joints.hips.x, joints.hips.y);
        stage.lineTo(joints.kneeRight.x, joints.kneeRight.y);
        stage.lineTo(joints.footRight.x, joints.footRight.y);
        stage.stroke();

        stage.strokeRect(joints.shoulders.x - 2, joints.shoulders.y - 8, 5, 5);
      };

      var stickmen = {
        stickman1: new Stickman() // he has no friends
      };*/

      var renderLevel = function (level) { // draw the level using data from an array
        level = levelData[level];
        var horizontal = Math.floor(gameSettings.width / 16);
        var vertical = Math.floor(gameSettings.height / 16);
        var tileset = level.tileset;
        var data = level.multiple ? randomInt(5) : level.data[0]; // pick random level 0-4 unless there is only one (e.g. title screen) 
        for (var y = 0; y < vertical; y++) {
          for (var x = 0; x < horizontal; x++) {
            stage.drawImage(
              tileset,
              parseInt(data[y].charAt(x)) * 16,
              0,
              16,
              16,
              x * 16,
              y * 16,
              16,
              16);
          }
        }
      };

      /*var renderStickmen = function () {
        for (var s in stickmen) {
          stickmen[s].doPhysics();
          stickmen[s].draw();
        }
      };*/

      return function (level) {
        renderLevel(level);
        //renderStickmen(); // bruh
      };
    })();

    var map = (function () { // draw map using similar method to level drawing
      var horizontal = Math.floor(gameSettings.width / 16) + 1;
      var vertical = Math.floor(gameSettings.height / 16) - 10;
      var offset = 0;
      var tileset = {
        bg: tilesets.map,
        fg: tilesets.mapIcons
      };
      var scrollRight = gameSettings.width - 125;
      var scrollLeft = 125;

      return function (mapData) {
        var offsetLimit = mapData.width * 16 - gameSettings.width;
        var bgTiles = mapData.bg;
        var fgTiles = mapData.fg;

        for (var y = 0; y < vertical; y++) {
          for (var x = 0; x < horizontal; x++) {
            var curBg = bgTiles[y].charAt(x + Math.floor(offset / 16));
            var curFg = fgTiles[y].charAt(x + Math.floor(offset / 16));
            var curBgTile = (isNaN(parseInt(curBg)) ? convertBase(curBg, 36, 10) : parseInt(curBg)) * 16;
            var curFgTile = (isNaN(parseInt(curFg)) ? convertBase(curFg, 36, 10) : parseInt(curFg)) * 16;
            if (curBgTile) stage.drawImage(tileset.bg, curBgTile, 0, 16, 16, x * 16 - (Math.floor(offset) % 16), y * 16, 16, 16); // draw bg
            if (curFgTile) stage.drawImage(tileset.fg, curFgTile, 0, 16, 16, x * 16 - (Math.floor(offset) % 16), y * 16, 16, 16); // draw fg
          }
        }
        if (mouse.y > 0 && mouse.y < vertical * 16) { // if within y bounds of map, allow scroll
          if (mouse.x > scrollRight && mouse.x < gameSettings.width) offset += ms * ((mouse.x - scrollRight) / 100); // <-- shit math
          if (mouse.x < scrollLeft && mouse.x > 0 && offset > 0) offset -= ms * ((scrollLeft - mouse.x) / 100);
        }
        if (offset < 0) offset = 0;
        if (offset > offsetLimit) offset = offsetLimit;

        drawText({ text: (offset === 0 ? '' : '<<'), x: 20, y: gameSettings.height / 4, center: true }); // left/right scroll indicators
        drawText({ text: (offset === offsetLimit ? '' : '>>'), x: gameSettings.width - 20, y: gameSettings.height / 4, center: true });
      }
    })();

    var inventoryBar = (function () { // unfinished crap
      var buttons = {
        backpack: []
      };

      var info = [];
      var isHovering = false;
      var cursorItem = 0;

      var drawBg = function (color) {
        stage.fillStyle = colors[color];
        stage.fillRect(0, gameSettings.height - 160, gameSettings.width, 160);
      };

      var drawCursor = function() {
        if (cursorItem) {
          var item = items[cursorItem];
          var currentSpritesheet = sprites[item.type === 'weapon' ? item.type + item.class : item.type];
          var imageRow = item.lvl * 24;
          stage.drawImage(currentSpritesheet, item.imageColumn * 24, imageRow, 24, 24, mouse.x - 12, mouse.y - 12, 24, 24);
        }
      };

      var drawInfo = function () {
        if (isHovering) {
          for (var i = 0; i < info.length; i++) {
            drawText({
              text: info[i],
              size: (i ? 13 : 16),
              color: 20,
              x: gameSettings.width - 475,
              y: gameSettings.height - 142 + i * 25 + (i ? 5 : 0),
              outline: true,
              outlineColor: 8,
              outlineWidth: 3
            });
          }
        }
      };

      var drawBackpack = function () {
        isHovering = false;
        for (var i = 0; i < buttons.backpack.length; i++) {
          var currentSlot = buttons.backpack[i];
          var currentItem = items[inventoryData.backpack[i]];
          currentSlot.draw();
          if (currentItem) {
            var currentSpritesheet = sprites[(currentItem.type === 'weapon' ? currentItem.type + currentItem.class : currentItem.type)];
            var imageRow = currentItem.lvl * 24;
            stage.drawImage(currentSpritesheet, currentItem.imageColumn * 24, imageRow, 24, 24, currentSlot.x - 12, currentSlot.y - 12, 24, 24);
          }
        }
      };

      var setupButtons = function () {
        var i = 0;
        for (var y = 0; y < 4; y++) {
          for (var x = 0; x < 6; x++) {
            buttons.backpack.push(new CButton({
              x: gameSettings.width - 220 + x * 40,
              y: gameSettings.height - 140 + y * 40,
              width: 35,
              height: 35,
              border: false,
              hover: function () {
                isHovering = true;
                var item = items[inventoryData.backpack[this.id]];
                if (item) {
                  switch(item.type) {
                    case 'weapon':
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
                      break;
                    case 'accessory':
                      info = [
                        item.name + ' ' + item.lvl,
                        item.type.capitalize(),
                      ];

                      if (Array.isArray(item.tooltip)) { // multi-line tooltip
                        item.tooltip.forEach(function(cur) {
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
              },
              click: function () {
                inventoryData.backpack[this.id] = [cursorItem, cursorItem = inventoryData.backpack[this.id]][0];
              },
              id: i
            }));
            i++;
          }
        }
      };
      setupButtons();

      return function () {
        drawBg(23);
        drawBackpack();
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
    return function (delta) {
      ms = delta - lastDelta; // calculate frame interval
      fps = Math.floor(1000 / ms); // not actually fps, just frame interval converted into screen refresh rate
      stage.clearRect(0, 0, gameSettings.width, gameSettings.height); // clear screen

      switch (STATE) { // run functions based on game state
        case 'title':
          level(0);
          title();
          break;
        case 'credits':
          level(0);
          credits();
          break;
        case 'newGame':
          level(0);
          newGame();
          break;
        case 'map':
          map(mapData);
          inventoryBar();
          break;
        default:
          invalidState(); // if current state does not exist...
      }

      drawText({ text: 'FPS: ' + fps, x: 0, y: 20 });
      /*drawText({ text: 'MS: ' + ms, x: 0, y: 40 });*/
      lastDelta = delta;
      requestAnimationFrame(gameLoop); // and again and again and again and again and again and again...
    };
  })();

  return {
    go: function () { // called once document body loads
      init();
      document.body.appendChild(canvas);
      requestAnimationFrame(gameLoop);
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
