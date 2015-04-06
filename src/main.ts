/*
 * KEYS
 */

// multiple keys must be tracked individually or it will mess up control
var keys = [];
var keyControl = (key, down) => { keys[key] = down; };

function funkU(e) {
    keyControl(e.keyCode, false);
    if (pause || (!pause && e.keyCode === 80)) // 'p' key
        pause = !pause;
};

function funkD(e) {
    keyControl(e.keyCode, true);
};

window.addEventListener("keyup", funkU, true);
window.addEventListener("keydown", funkD, true);

var left = false;
var right = false;
var up = false;
var down = false;

var pause = true;
var debug = false;

// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
var checkKeys = function() {
    left = keys[37] || keys[65]; // left, 'a'
    right = keys[39] || keys[68]; // right, 'd'
    up = keys[38] || keys[87]; // up, 'w'
    down = keys[40] || keys[83] || keys[32]; // down, 's', space
};

/*
 * CANVAS SETUP
 */

var canvas = <HTMLCanvasElement> document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var W = window.innerWidth - 4;
var H = window.innerHeight - 4;

// override default canvas size
var parameters = document.URL.split('?');
if (parameters.length > 1) {
    parameters = parameters[1].split('&');
    for (var i = 0; i < parameters.length; ++i) {
        var tmp = parameters[i].split('=');
        if (tmp.length > 1) {
            var option = tmp[0];
            var value = tmp[1];
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

var ship = new Ship(W / 2, H / 2);

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
}

var actors = [];

actors.push(ship);

var cp = 3;
while (cp-- > 0)
    actors.push(new CheckPoint());

var background = null;
function clearBackground(ctx) {
    if (background !== null) {
        ctx.putImageData(background, 0, 0);
    } else {
        // draws background and stores it for later
        ctx.fillStyle = "#222244";
        ctx.fillRect(0, 0, W, H);
        for (var i = 0; i < 150; ++i) {
            var x = Math.random() * W;
            var y = Math.random() * H;
            var s = Math.random() + 1

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, s, 0, TWO_PI, false);
            ctx.fillStyle = '#EDD879';
            ctx.fill();
            ctx.restore();
        }
        background = ctx.getImageData(0, 0, W, H);
    }
}

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

    for (var i = 0; i < msg.length; ++i) {
        var txt = msg[i];
        ctx.fillText(txt,
            (W / 2) - (ctx.measureText(txt).width / 2),
            (H / 2 - (FONT_HEIGHT * msg.length / 2)) + (FONT_HEIGHT * i));
    }
}

function draw() {

    clearBackground(ctx);

    for (var i = 0; i < actors.length; ++i) {
        actors[i].draw(ctx);
    }

    // HUD elements
    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, W, FONT_H * 1.5 + 4);

    ctx.fillStyle = 'white';
    ctx.lineWidth = 1;

    var txt = ship.toString();
    ctx.fillText(txt, 4, FONT_H * 1.5 + 2);
    ctx.restore();

};

// animation intervals
const fps = 30;
const interval = 1000 / fps;
const time = 1 / 20;
const tick = 1 / 30;

setInterval(function() {
    actions();

    draw();

    if (pause) {
        drawPaused();
        return;
    }

    const tmp = actors;
    actors = [];

    for (var i = 0; i < tmp.length; ++i) {
        tmp[i].collision(ship);
    }

    for (var i = 0; i < tmp.length; ++i) {
        tmp[i].tick(time, H, W);
        if (!tmp[i].dead())
            actors.push(tmp[i]);
    }

}, interval);
