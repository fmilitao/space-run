var Control;
(function (Control) {
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
    var keys = [];
    var pause = true;
    function keyUp(e) {
        keys[e.keyCode] = false;
        if (pause || (!pause && e.keyCode === VK.P)) {
            pause = !pause;
            toggleMode(pause);
        }
    }
    ;
    function keyDown(e) {
        keys[e.keyCode] = true;
    }
    ;
    window.addEventListener("keyup", keyUp, true);
    window.addEventListener("keydown", keyDown, true);
    Control.left = false;
    Control.right = false;
    Control.up = false;
    Control.down = false;
    function checkKeys() {
        Control.left = keys[VK.LEFT] || keys[VK.A];
        Control.right = keys[VK.RIGHT] || keys[VK.D];
        Control.up = keys[VK.UP] || keys[VK.W];
        Control.down = keys[VK.DOWN] || keys[VK.S] || keys[VK.SPACE];
    }
    Control.checkKeys = checkKeys;
    ;
})(Control || (Control = {}));
;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var W = window.innerWidth - 4;
var H = window.innerHeight - 4;
var debug = false;
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
var MSG = [
    '-- Game Paused --',
    'Press any key to continue.',
    '',
    '-- Objective --',
    'Pop all circular gue...',
    'Warning: green gue slows you down.',
    '',
    '-- Controls --',
    '       Left: a OR <left arrow>            ',
    '      Right: d OR <right arrow>           ',
    '    Engines: w OR <up arrow>              ',
    '      Brake: s OR space OR <down arrow>   ',
    "Power-Brake: hold 'fire engines' & 'brake'"
];
var FPS = 30;
var TICK_MILI = 1000 / FPS;
var TICK_SECS = 1 / FPS;
var ship = new Ship(W / 2, H / 2);
var actors = [ship];
for (var i = 0; i < 3; ++i)
    actors.push(new CheckPoint());
function actions() {
    Control.checkKeys();
    if (Control.left)
        ship.left();
    if (Control.right)
        ship.right();
    if (Control.up && Control.down)
        ship.powerBrake(true);
    else {
        ship.powerBrake(false);
        if (Control.up)
            ship.fire();
        if (Control.down)
            ship.brake();
    }
}
;
function drawPaused() {
    clearBackground(ctx);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'white';
    ctx.lineWidth = 1;
    for (var i = 0; i < MSG.length; ++i) {
        var txt = MSG[i];
        ctx.fillText(txt, (W / 2) - (ctx.measureText(txt).width / 2), (H / 2 - (FONT_HEIGHT * MSG.length / 2)) + (FONT_HEIGHT * i));
    }
}
;
function draw() {
    clearBackground(ctx);
    for (var _i = 0; _i < actors.length; _i++) {
        var a = actors[_i];
        a.draw(ctx);
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
function GameMode() {
    actions();
    draw();
    var old = actors;
    actors = [];
    for (var _i = 0; _i < old.length; _i++) {
        var a = old[_i];
        a.collision(ship);
    }
    for (var _a = 0; _a < old.length; _a++) {
        var a = old[_a];
        a.tick(TICK_SECS, H, W);
        if (!a.dead())
            actors.push(a);
    }
}
;
var old = setInterval(drawPaused, 1000);
function toggleMode(paused) {
    if (old !== null) {
        clearInterval(old);
    }
    if (paused) {
        old = null;
        drawPaused();
    }
    else {
        old = setInterval(GameMode, TICK_MILI);
    }
}
;
