// rpg-test by Literal Line
// more at quique.gq

var RPG_TEST = (function () {
  'use strict';

  var canvas = document.createElement('canvas');
  var stage = canvas.getContext('2d');
  var gameSettings = {
    version: 'v0.1-20210111-924est',
    authors: ['Literal Line'], // incase you mod or whatever
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
    canvas.addEventListener('mousedown', function () {
      mouse.down = true;
      mouseClick();
    });
    canvas.addEventListener('mouseup', function () {
      mouse.down = false;
    });
    addEventListener('blur', function () {
      mouse.down = false;
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
    tilesetGrass: './assets/tilesetGrass.png',
    soundClick: './assets/click.wav'
  };

  var sprites = { // image to img
    logo: newImage(assets.logo),
    itemDrops: newImage(assets.itemDrops),
    tilesetMap: newImage(assets.tilesetMap),
    tilesetGrass: newImage(assets.tilesetGrass)
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
    '#273b2d',
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
    '#fffff4',
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
    console.log('Authors: ' + gameSettings.authors);
    canvas.width = gameSettings.width;
    canvas.height = gameSettings.height;
    canvas.style.width = gameSettings.widthCSS;
    canvas.style.height = gameSettings.heightCSS;
    canvas.style.background = gameSettings.bg;
    stage.imageSmoothingEnabled = gameSettings.aa;
    setupEventListeners();
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
    stage.font = (obj.size || 24) + 'px Zelda DX';
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
    this.border = obj.border;
    this.run = obj.run; // <-- will call this function when clicked
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
        stage.fillStyle = hexToRgba(colors[2], 0.25);
        stage.fillRect(x - width / 2, y - height / 2, width, height);
        if (mouse.click) {
          audio.click.play();
          mouse.click = false;
          this.run();
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
      member1: { class: 'Member 1' }, //  placeholder classes for the newGame screen
      member2: { class: 'Member 2' },
      member3: { class: 'Member 3' },
      member4: { class: 'Member 4' }
    };

    var classList = ['Assassin', 'Ninja', 'Nunchaku-ka', 'Monk', 'Mage', 'Gunner']; // this array seems to be working ok for now...

    var tilesets = { // tile spritesheets
      map: sprites.tilesetMap,
      grass: sprites.tilesetGrass
    };

    var mapData = [ // big chunky soup
      'DDDDDD45A000000000000000000076000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'DDDDDDDD45A00000000000000000B0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'DDDDDDDDDD4555A000000000000760000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'DDDDDDD122C000455A000000000B00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'DDDD122C000000000455A000007600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'DDD1C0000000000000004555556000000000000000000000000000000000000000000005555000000000000000000000000000000000000000000000000000000000000000000000',
      'D12C00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'DB0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'DB0000000000000000000000000000000000000000005555550000000000000000000000000000000000000000000000000005555500000000000000000000000000000000000000',
      '22223000000000000000075A000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0000930000000000000008DB000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '00000B0000000000000008D4A00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '5555560000000000000008DDB00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0000000000000000000076DD455550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '000000000000000075556DDDDD0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0007555555A007556DDDDDDDDDDD00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '5556DDDDDD4556DDDDDDDDDDDDDDDDD00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    ];

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

    var mouseBounds = function () { // mouse pos will stick to canvas border when out of bounds
      if (mouse.x < 0) mouse.x = 0;
      if (mouse.x > gameSettings.width) mouse.x = gameSettings.width;
      if (mouse.y < 0) mouse.y = 0;
      if (mouse.y > gameSettings.height) mouse.y = gameSettings.height;
    };

    var invalidState = function () { // if current game state has no case in switch statement
      drawText({ text: 'ERROR:', size: 48, color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2, center: true });
      drawText({ text: 'REQUESTED STATE "' + STATE + '"', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 40, center: true });
      drawText({ text: 'DOES NOT EXIST!', color: 2, x: gameSettings.width / 2, y: gameSettings.height / 2 + 60, center: true });
      drawText({ text: 'Actual gameplay coming soon... ;)', color: 12, x: gameSettings.width / 2, y: gameSettings.height - 60, center: true });
    };

    var level = (function () { // draw level and eventually draw stickmen once i figure out the physics
      var Stickman = function (obj) {
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
      };

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

      var renderStickmen = function () {
        for (var s in stickmen) {
          stickmen[s].doPhysics();
          stickmen[s].draw();
        }
      };

      return function (level) {
        renderLevel(level);
        //renderStickmen(); // bruh
      };
    })();

    var map = (function () { // draw map using similar method to level drawing
      var horizontal = Math.floor(gameSettings.width / 16) + 1;
      var vertical = Math.floor(gameSettings.height / 16) - 10;
      var offset = 0;
      var offset2 = 0;
      var tileset = tilesets.map;

      return function (mapData) {
        for (var y = 0; y < vertical; y++) {
          for (var x = 0; x < horizontal; x++) {
            var cur = mapData[y].charAt(x + Math.floor(offset / 16));
            stage.drawImage(
              tileset,
              (isNaN(parseInt(cur)) ? parseInt('0x' + cur) : parseInt(cur)) * 16, // check for hex digit
              0,
              16,
              16,
              x * 16 - (offset % 16),
              y * 16,
              16,
              16
            );
          }
        }
        if (mouse.x > gameSettings.width - 100) offset += ms / 2; // <-- frame interval used to get same move speed on any monitor refresh rate (rpg-test esports gaming team with 300hz monitors soon??)
        if (mouse.x < 100 && offset > 0) offset -= ms / 2; // same frame interval method as above ^^^
        if (offset < 0) offset = 0;
      };
    })();

    var title = (function () { // title screen
      var buttons = {
        begin: new CButton({
          text: 'New Game',
          x: gameSettings.width / 2,
          y: gameSettings.height / 2,
          width: 235,
          height: 36,
          run: function () {
            STATE = 'newGame';
          }
        }),
        credits: new CButton({
          text: 'Credits',
          x: gameSettings.width / 2,
          y: gameSettings.height / 2 + 50,
          width: 235,
          height: 36,
          run: function () {
            STATE = 'credits';
          }
        }),
        website: new CButton({
          text: 'More Games...',
          x: gameSettings.width / 2,
          y: gameSettings.height / 2 + 100,
          width: 235,
          height: 36,
          run: function () {
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
          run: function () {
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
          run: function () {
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
          run: function () {
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
            run: function () {
              selectedMember = 1;
            }
          }),
          m2: new CButton({
            x: gameSettings.width / 2 - 75,
            y: gameSettings.height / 2 - 25,
            width: 50,
            height: 50,
            border: true,
            run: function () {
              selectedMember = 2;
            }
          }),
          m3: new CButton({
            x: gameSettings.width / 2 + 75,
            y: gameSettings.height / 2 - 25,
            width: 50,
            height: 50,
            border: true,
            run: function () {
              selectedMember = 3;
            }
          }),
          m4: new CButton({
            x: gameSettings.width / 2 + 225,
            y: gameSettings.height / 2 - 25,
            width: 50,
            height: 50,
            border: true,
            run: function () {
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
            run: function () {
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
            run: function () {
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
            run: function () {
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
            run: function () {
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
            run: function () {
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
            run: function () {
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
          run: function () {
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
          run: function () {
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
      mouseBounds();

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
