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
var Setup;
(function (Setup) {
    var canvas = document.getElementById("canvas");
    Setup.ctx = canvas.getContext("2d");
    Setup.W = window.innerWidth - 4;
    Setup.H = window.innerHeight - 4;
    Setup.debug = false;
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
                        Setup.W = parseInt(value);
                        break;
                    case 'h':
                        Setup.H = parseInt(value);
                        break;
                    case 'd':
                    case 'debug':
                        Setup.debug = (value.toLowerCase() === 'true');
                    default:
                        break;
                }
            }
        }
    }
    Setup.ctx.canvas.width = Setup.W;
    Setup.ctx.canvas.height = Setup.H;
    var background = null;
    function clearBackground() {
        if (background !== null) {
            Setup.ctx.putImageData(background, 0, 0);
        }
        else {
            Setup.ctx.fillStyle = "#222244";
            Setup.ctx.fillRect(0, 0, Setup.W, Setup.H);
            for (var i = 0; i < 150; ++i) {
                var x = Math.random() * Setup.W;
                var y = Math.random() * Setup.H;
                var s = Math.random() + 1;
                Setup.ctx.save();
                Setup.ctx.beginPath();
                Setup.ctx.arc(x, y, s, 0, TWO_PI, false);
                Setup.ctx.fillStyle = '#EDD879';
                Setup.ctx.fill();
                Setup.ctx.restore();
            }
            background = Setup.ctx.getImageData(0, 0, Setup.W, Setup.H);
        }
    }
    Setup.clearBackground = clearBackground;
    ;
    Setup.FONT_H = 8;
    Setup.FONT_HEIGHT = Setup.FONT_H * 1.5 + 4;
    Setup.ctx.font = Setup.FONT_H + 'pt testFont';
})(Setup || (Setup = {}));
var FPS = 30;
var TICK_MILI = 1000 / FPS;
var TICK_SECS = 1 / FPS;
var ship = new Ship(Setup.W / 2, Setup.H / 2);
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
function draw() {
    Setup.clearBackground();
    var d = Setup.drawer;
    for (var _i = 0; _i < actors.length; _i++) {
        var a = actors[_i];
        a.match(d);
    }
    d.drawHUD(ship.toString());
}
;
function GameMode() {
    actions();
    draw();
    var old = actors;
    actors = [];
    for (var _i = 0; _i < old.length; _i++) {
        var a = old[_i];
        a.match(playerCollider);
    }
    for (var _a = 0; _a < old.length; _a++) {
        var a = old[_a];
        a.tick(TICK_SECS, Setup.H, Setup.W);
        if (!a.dead())
            actors.push(a);
    }
}
;
var old = setInterval(Setup.drawer.drawPaused, 1000);
function toggleMode(paused) {
    if (old !== null) {
        clearInterval(old);
    }
    if (paused) {
        old = null;
        Setup.drawer.drawPaused();
    }
    else {
        old = setInterval(GameMode, TICK_MILI);
    }
}
;
