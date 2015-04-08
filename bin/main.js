/*
 * KEYS
 */
var keys = [];
var keyControl = function (key, down) { keys[key] = down; };
var VK;
(function (VK) {
    VK[VK["W"] = 87] = "W";
    VK[VK["A"] = 65] = "A";
    VK[VK["S"] = 83] = "S";
    VK[VK["D"] = 68] = "D";
    VK[VK["P"] = 80] = "P";
    VK[VK["LEFT"] = 37] = "LEFT";
    VK[VK["RIGHT"] = 39] = "RIGHT";
    VK[VK["UP"] = 38] = "UP";
    VK[VK["DOWN"] = 40] = "DOWN";
    VK[VK["SPACE"] = 32] = "SPACE";
})(VK || (VK = {}));
;
function keyUp(e) {
    keyControl(e.keyCode, false);
    if (pause || (!pause && e.keyCode === VK.P))
        pause = !pause;
}
;
function keyDown(e) {
    keyControl(e.keyCode, true);
}
;
window.addEventListener("keyup", keyUp, true);
window.addEventListener("keydown", keyDown, true);
var left = false;
var right = false;
var up = false;
var down = false;
var pause = true;
var debug = false;
var checkKeys = function () {
    left = keys[37] || keys[65];
    right = keys[39] || keys[68];
    up = keys[38] || keys[87];
    down = keys[40] || keys[83] || keys[32];
};
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var W = window.innerWidth - 4;
var H = window.innerHeight - 4;
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
                default:
                    break;
            }
        }
    }
}
ctx.canvas.width = W;
ctx.canvas.height = H;
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
;
var actors = [];
actors.push(ship);
var cp = 3;
while (cp-- > 0)
    actors.push(new CheckPoint());
var background = null;
function clearBackground(ctx) {
    if (background !== null) {
        ctx.putImageData(background, 0, 0);
    }
    else {
        ctx.fillStyle = "#222244";
        ctx.fillRect(0, 0, W, H);
        for (var i = 0; i < 150; ++i) {
            var x = Math.random() * W;
            var y = Math.random() * H;
            var s = Math.random() + 1;
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
;
var FONT_H = 8;
var FONT_HEIGHT = FONT_H * 1.5 + 4;
ctx.font = FONT_H + 'pt testFont';
var msg = [
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
        ctx.fillText(txt, (W / 2) - (ctx.measureText(txt).width / 2), (H / 2 - (FONT_HEIGHT * msg.length / 2)) + (FONT_HEIGHT * i));
    }
}
;
function draw() {
    clearBackground(ctx);
    for (var i = 0; i < actors.length; ++i) {
        actors[i].draw(ctx);
    }
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, W, FONT_H * 1.5 + 4);
    ctx.fillStyle = 'white';
    ctx.lineWidth = 1;
    var txt = ship.toString();
    ctx.fillText(txt, 4, FONT_H * 1.5 + 2);
    ctx.restore();
}
;
var fps = 30;
var interval = 1000 / fps;
var time = 1 / 20;
var tick = 1 / 30;
setInterval(function () {
    actions();
    draw();
    if (pause) {
        drawPaused();
        return;
    }
    var tmp = actors;
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
