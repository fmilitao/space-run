//
// Game Mode Toggling
//

// animation intervals
const FPS = 30;
const TICK_MILI = 1000 / FPS; // milliseconds
const TICK_SECS = 1 / FPS; // seconds

const toggleMode = (() => {
    let old = null;
    return (paused: boolean) => {
        if (old !== null) {
            clearInterval(old);
        }
        if (paused) {
            old = null;
            World.drawer.drawPaused();
        } else {
            old = setInterval(GameMode, TICK_MILI);
        }
    };
})();

window.onload = (ev: Event) => {
    // remove dummy element used to load the font before use
    let tmp = document.getElementById('dummy');
    tmp.parentNode.removeChild(tmp);

    // initialize canvas, and world constants
    World.init();
    // initializes ship and actors list
    init();
    // start paused
    toggleMode(true);
};

//
// Control Stuff
//

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
// Game Logic
//

var ship: Ship;
var actors: Actor[];

function init() {
    ship = new Ship(World.W / 2, World.H / 2);
    actors = [ship];

    // populate game world with initial CheckPoints
    for (let i = 0; i < 3; ++i)
        actors.push(new CheckPoint());
};

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

    World.clearBackground();
    const d = World.drawer;
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
