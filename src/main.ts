
module Control {
    // requires 'toggleMode(boolean) : void' function

    // virtual keys that matter to this game.
    enum VK {
        W = 87, // 'w'
        A = 65, // 'a'
        S = 83, // 's'
        D = 68, // 'd'
        P = 80, // 'p'
        LEFT = 37, // left arrow
        RIGHT = 39, // right arrow
        UP = 38, // up arrow
        DOWN = 40, // down arrow
        SPACE = 32 // space bar
    };

    // http://stackoverflow.com/questions/1465374/javascript-event-keycode-constants
    // multiple keys must be tracked individually or it will mess up control
    let keys = [];
    let pause = true; // starts paused

    function keyUp(e: KeyboardEvent) {
        keys[e.keyCode] = false;
        // any key press if paused or only 'p' if not paused
        if (pause || (!pause && e.keyCode === VK.P)) {
            pause = !pause;
            toggleMode(pause);
        }
    };

    function keyDown(e: KeyboardEvent) {
        keys[e.keyCode] = true;
    };

    window.addEventListener("keyup", keyUp, true);
    window.addEventListener("keydown", keyDown, true);

    // these are OK to export.
    export let left = false;
    export let right = false;
    export let up = false;
    export let down = false;

    // we do not check keys on each key stroke and instead use this separate function
    // to enable synchronous checks and avoid potential key-press changes mid-frame.
    export function checkKeys() {
        left = keys[VK.LEFT] || keys[VK.A];
        right = keys[VK.RIGHT] || keys[VK.D];
        up = keys[VK.UP] || keys[VK.W];
        down = keys[VK.DOWN] || keys[VK.S] || keys[VK.SPACE];
    };

};


//
// CANVAS SETUP
//

module Setup {

    const canvas = <HTMLCanvasElement> document.getElementById("canvas");
    export const ctx = canvas.getContext("2d");

    export var W = window.innerWidth - 4;
    export var H = window.innerHeight - 4;
    export var debug = false;

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

    let background: ImageData = null;
    export function clearBackground() {
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

    export const FONT_H = 8;
    export const FONT_HEIGHT = FONT_H * 1.5 + 4;
    ctx.font = FONT_H + 'pt testFont';
}

//
// Game Logic
//

// animation intervals
const FPS = 30;
const TICK_MILI = 1000 / FPS; // milliseconds
const TICK_SECS = 1 / FPS; // seconds

const ship = new Ship(Setup.W / 2, Setup.H / 2);

let actors: Actor[] = [ship]; // initially only contains 'ship'

// populate game world with initial CheckPoints
for (let i = 0; i < 3; ++i)
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
};


function draw() {

    Setup.clearBackground();
    const d = Setup.drawer;
    for (let a of actors) {
        a.match(d);
    }

    d.drawHUD(ship.toString());
};

function GameMode() {
    // only looking at actions in here avoids excessive triggering of an action
    actions();

    draw();

    const old = actors;
    actors = []; // next frame will have new set of actors

    for (let a of old) {
        a.match(playerCollider);
    }

    for (let a of old) {
        a.tick(TICK_SECS);
        if (!a.dead())
            actors.push(a);
    }

};

//
// Game Mode Toggling
//

// this is hack due to delay of loading the font
// we just redraw the frame each second.
let old = setInterval(Setup.drawer.drawPaused, 1000);

function toggleMode(paused: boolean) {
    if (old !== null) {
        clearInterval(old);
    }
    if (paused) {
        old = null;
        Setup.drawer.drawPaused();
    } else {
        old = setInterval(GameMode, TICK_MILI);
    }
};
