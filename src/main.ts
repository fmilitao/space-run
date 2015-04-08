/*
 * KEYS
 */

// http://stackoverflow.com/questions/1465374/javascript-event-keycode-constants
// multiple keys must be tracked individually or it will mess up control
var keys = [];
var keyControl = (key, down) => { keys[key] = down; };

// virtual keys that matter to us.
enum VK {
  W = 87,
  A = 65,
  S = 83,
  D = 68,
  P = 80,
  LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40,
  SPACE = 32
};

function keyUp(e : KeyboardEvent) {
    keyControl(e.keyCode, false);
    // any key if paused or  'p' (80) key code if not paused.
    if (pause || (!pause && e.keyCode === VK.P))
        pause = !pause;
};

function keyDown(e : KeyboardEvent) {
    keyControl(e.keyCode, true);
};

window.addEventListener("keyup", keyUp, true);
window.addEventListener("keydown", keyDown, true);

// these are OK to export.
var left = false;
var right = false;
var up = false;
var down = false;

var pause = true;
var debug = false;

// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
// we do not check keys on each key stroke and instead use this separate function
// to enable synchronous checks and avoid potential key-pressed changes mid-frame.
function checkKeys() {
    left = keys[37] || keys[65]; // left, 'a'
    right = keys[39] || keys[68]; // right, 'd'
    up = keys[38] || keys[87]; // up, 'w'
    down = keys[40] || keys[83] || keys[32]; // down, 's', space
};

/*
module Test {
  export var t = 0;
}

import ttt = Test.t;

console.log( ttt + 0 );
*/

/*
 * CANVAS SETUP
 */

const canvas = <HTMLCanvasElement> document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var W = window.innerWidth - 4;
var H = window.innerHeight - 4;

//TODO add these options to the README.md file.
// override default canvas size
let parameters = document.URL.split('?');
if (parameters.length > 1) {
    parameters = parameters[1].split('&');
    for (let i = 0; i < parameters.length; ++i) {
        let tmp = parameters[i].split('=');
        if (tmp.length > 1) {
            let option = tmp[0];
            let value = tmp[1];
            switch (option) {
                case 'w':
                    W = parseInt(value);
                    break;
                case 'h':
                    H = parseInt(value);
                    break;
                case 'p':
                    pause = (value.toLowerCase() === 'true');
                case 'd':
                case 'debug':
                    debug = (value.toLowerCase() === 'true');
                default: // no other options
                    break;
            }
        }
    }
}

ctx.canvas.width = W;
ctx.canvas.height = H;

/*
 * MAIN LOOP
 */

const ship = new Ship(W / 2, H / 2);

function actions() {
    checkKeys();
    if (left)
        ship.left();
    if (right)
        ship.right();

    if (up && down)
        ship.powerBrake(true);
    else {
        ship.powerBrake(false);
        if (up)
            ship.fire();
        if (down)
            ship.brake();
    }
};

let actors : Actor[] = [];

actors.push(ship);

let cp = 3;
while (cp-- > 0)
    actors.push(new CheckPoint());

let background : ImageData = null;
function clearBackground(ctx : CanvasRenderingContext2D) {
    if (background !== null) {
        ctx.putImageData(background, 0, 0);
    } else {
        // draws background once, and stores it for later
        ctx.fillStyle = "#222244";
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 150; ++i) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const s = Math.random() + 1

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, s, 0, TWO_PI, false);
            ctx.fillStyle = '#EDD879';
            ctx.fill();
            ctx.restore();
        }
        background = ctx.getImageData(0, 0, W, H);
    }
};

const FONT_H = 8;
const FONT_HEIGHT = FONT_H * 1.5 + 4;
ctx.font = FONT_H + 'pt testFont';

const msg = [
    '-- Game Paused --',
    'Press any key to continue.',
    '',
    '-- Objective --',
    'Pop all circle thingies...',
    'Warning: green gue slows you down.',
    '',
    '-- Controls --',
    '       Left: a OR <left arrow>            ',
    '      Right: d OR <right arrow>           ',
    '    Engines: w OR <up arrow>              ',
    '      Brake: s OR space OR <down arrow>   ',
    "Power-Brake: hold 'fire engines' & 'brake'"
];

function drawPaused() {
    clearBackground(ctx);

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'white';
    ctx.lineWidth = 1;

    for (let i = 0; i < msg.length; ++i) {
        const txt = msg[i];
        ctx.fillText(txt,
            (W / 2) - (ctx.measureText(txt).width / 2),
            (H / 2 - (FONT_HEIGHT * msg.length / 2)) + (FONT_HEIGHT * i));
    }
};

function draw() {

    clearBackground(ctx);

    for (let i = 0; i < actors.length; ++i) {
        actors[i].draw(ctx);
    }

    // HUD elements
    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, W, FONT_H * 1.5 + 4);

    ctx.fillStyle = 'white';
    ctx.lineWidth = 1;

    const txt = ship.toString();
    ctx.fillText(txt, 4, FONT_H * 1.5 + 2);
    ctx.restore();

};

// animation intervals
const fps = 30;
const interval = 1000 / fps; // milliseconds
const tick = 1 / fps; // seconds

setInterval(function() {
    actions();

    draw();

    if (pause) {
        drawPaused();
        return;
    }

    const old: Actor[] = actors;
    actors = []; // next frame will have new set of actors

    for (let a of old) {
        a.collision(ship);
    }

    for (let a of old) {
        a.tick(tick, H, W);
        if (!a.dead())
            actors.push(a);
    }

}, interval);
