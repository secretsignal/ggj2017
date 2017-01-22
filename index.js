'use strict';

var _unit = require('./classes/unit');

var _unit2 = _interopRequireDefault(_unit);

var _interface = require('./classes/interface');

var _interface2 = _interopRequireDefault(_interface);

var _player = require('./classes/player');

var _player2 = _interopRequireDefault(_player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FRAME = 20;
var ENEMY_SPAWN_RATE = 1000;
var RELOAD_TIME = 200;
var ui = new _interface2.default();
var player = new _player2.default(ui);
player.go(ui.center.x, ui.center.y);
player.color = '#CCCCCC';
player.bold = true;
player.canShoot = true;

var explosion = new _unit2.default(ui);
explosion.dead = true;

var missles = [];
var enemies = [];
var bubbles = [];
var score = 0;

setInterval(function () {
  ui.clear();
  player.draw();

  if (player.y > ui.rows) {
    player.y = ui.rows;
  }

  if (player.y < 2) {
    player.y = 2;
  }

  bubbles.forEach(function (bubble, i) {
    bubble.move(-1, 0);
    bubble.draw();
  });

  missles.forEach(function (missle, i) {
    missle.move(1, 0);
    missle.draw();

    var enemy = missle.collides(enemies);

    if (enemy) {
      enemy.killed = 1;
      enemy.color = '#ffae00';
      enemy.shape = "★";
      missle.dead = true;
      ENEMY_SPAWN_RATE -= 5;
      process.stdout.write('\x07'); // DING
      score++;
    }
    if (missle.dead) {
      missles.splice(i, 1);
    }
  });

  enemies.forEach(function (enemy, i) {
    // move with speed
    enemy.move(); //(1, 0);
    enemy.draw();

    if (enemy.dead) {
      enemies.splice(i, 1);
    }
    if (enemy.killed == 3) enemy.dead = true;
    if (enemy.killed < 3) enemy.killed++;
  });

  ui.cursor.goto(0, 0);
  ui.cursor.hex("#10e2f5");
  ui.write('\u2591\u2591  LAZER GUN KILLS: '); //${score}
  ui.cursor.hex("#ffcc00");
  ui.write(' ' + score + ' ');
  ui.cursor.hex("#10e2f5");
  ui.write("  ░░");
  ui.cursor.reset();

  var w = ["~~-", "~^", "~~-~", "---", "..", ".", "._", "___---", "-.....", "_--.", "~-~-~", "~-~-^~~^", "~~^^~^~"];
  var waves = [];

  var ws = "";
  do {
    ws += w[Math.floor(Math.random() * w.length)];
  } while (ws.length <= ui.columns - 5);

  if (waves.length > ui.columns) {
    waves = waves.slice(0, ui.columns);
  }
  ui.cursor.goto(0, 3);
  ui.cursor.hex("#10e2f5");
  ui.write(ws);
  ui.cursor.reset();
}, FRAME);

ui.onKey('right', function () {
  player.move(5, 0);
});
ui.onKey('down', function () {
  player.move(0, 1);
});
ui.onKey('up', function () {
  player.move(0, -1);
});
ui.onKey('left', function () {
  player.move(-5, 0);
});

ui.onKey('space', function () {
  if (!player.canShoot) return;
  player.canShoot = false;

  var missle = new _unit2.default(ui);
  missle.go(player.x + 19, player.y + 4);
  missle.color = "#FF0000";
  missle.shape = "░░░░░░░░░"; //'- ▬▬▬▬ ░░░░░░░░░  ▬▬ι═══════ﺤ    -═══════ι';
  missle.bold = true;
  missle.dieOnExit = true;

  missles.push(missle);

  setTimeout(function () {
    player.canShoot = true;
  }, RELOAD_TIME);
});

(function loop() {
  var bubble = new _unit2.default(ui);
  bubble.go(ui.columns, Math.random() * ui.rows);
  bubble.shape = "o";
  bubble.color = "#10e2f5";
  bubble.dieOnExit = true;
  bubble.speed = 1;
  bubbles.push(bubble);

  setTimeout(loop, ENEMY_SPAWN_RATE);

  var enemy = new _unit2.default(ui);
  enemy.go(Math.random() * ui.output.columns, Math.random() * ui.output.rows + 2);
  enemy.shape = 'くコ:彡';
  enemy.color = ["#e84db0", "#FF00FF", "#AA00CC", "#AA00AA"][Math.floor(Math.random() * 3)];
  enemy.dieOnExit = true;
  enemy.speed = function () {
    return [Math.random() > 0.9 ? -0.5 : -0.25, 0.01];
  };
  enemies.push(enemy);
})();

process.on('exit', function () {
  ui.cursor.horizontalAbsolute(0).eraseLine();
  ui.cursor.show();
});