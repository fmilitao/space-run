
// NOTE: all public fields should be read-only outside their class.

// CONSTANTS
const PI = Math.PI;
const TWO_PI = 2 * Math.PI;
const Random = Math.random;

const MAX_R = 32;
const MAX_POWER = 150;
const MAX_SPEED = 250;
const FIRE = 5;
const BRAKE = 0.9;

const SMOKE_COLOR = ['rgba(37,37,37,', 'rgba(21,21,21,'];
const SMOKE_F = 0.99;
const SMOKE_MAX = 5;

const GUE_F = 0.98;
const GUE_MAX = 30;
const GUE_COLOR = 'rgba(0,255,0,';

const CHECKPOINT_MAX = 9.99;
const CHECKPOINT_R = 30;

const SPARK_T = 3;
const SPARK_F = 0.99;
const SPARK_SIZE = 1;

const POINTS_MAX = 3;

const TRIANGLE: [number, number][] = [[-5, -5], [-5, 5], [15, 0]];
const MISSILE: [number, number][] = [[-4, -4], [-4, 4], [8, 4], [12, 0], [8, -4]];

// case analysis of all Actors
interface MatchActor<T> {
    caseGue(g: Gue): T;
    caseShip(s: Ship): T;
    caseSpark(s: Spark): T;
    caseSmoke(s: Smoke): T;
    casePoints(p: Points): T;
    caseCheckPoint(cp: CheckPoint): T;
};

//
// WORLD SETUP
//

module World {

    export const FONT_H = 8;
    export const FONT_HEIGHT = FONT_H * 1.5 + 4;

    var ctx: CanvasRenderingContext2D;

    export var W = window.innerWidth - 4;
    export var H = window.innerHeight - 4;
    export var debug = false;

    export function init() {
        const canvas = <HTMLCanvasElement> document.getElementById("canvas");
        ctx = canvas.getContext("2d");
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
        ctx.font = FONT_H + 'pt testFont';
    };

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

    const MSG = [
        'SPACE RUN',
        '',
        '',
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

    function drawPath(path: [number, number][]) {
        ctx.beginPath();
        let [x, y] = path[0];
        ctx.moveTo(x, y);

        for (let i = 0; i < path.length; ++i) {
            [x, y] = path[i];
            ctx.lineTo(x, y);
        }

        ctx.lineJoin = 'miter';
        ctx.closePath();
    };

    // draws all stuff in this game
    export const drawer = {

        // HUD elements
        drawHUD: (shipStatus: string) => {
            ctx.save();

            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(0, 0, W, FONT_H * 1.5 + 4);

            ctx.fillStyle = 'white';
            ctx.lineWidth = 1;

            ctx.fillText(shipStatus, 4, FONT_H * 1.5 + 2);
            ctx.restore();
        },

        // pause screen
        drawPaused: () => {
            clearBackground();

            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = 'white';
            ctx.lineWidth = 1;

            for (let i = 0; i < MSG.length; ++i) {
                const txt = MSG[i];
                if( i === 0 ){
                  ctx.font = 40 + 'pt testFont';
                }else{
                  ctx.font = FONT_H + 'pt testFont';
                }
                ctx.fillText(txt,
                    (W / 2) - (ctx.measureText(txt).width / 2),
                    (H / 2 - (FONT_HEIGHT * MSG.length / 2)) + (FONT_HEIGHT * i));
            }

        },

        //
        // Actor Case Analysis
        //

        caseGue: (g: Gue) => {
            const df = g.t / GUE_MAX;
            ctx.save();
            ctx.beginPath();
            ctx.arc(g.p.x, g.p.y, g.s, 0, TWO_PI, false);
            ctx.fillStyle = GUE_COLOR + df + ')';
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        },

        // main player ship, with effects based on Control status
        caseShip: (s: Ship) => {
            ctx.save();
            const angle = s.angle();

            ctx.translate(s.p.x, s.p.y);
            ctx.rotate(angle);

            //if engines on
            if (Control.up && !Control.down) {
                ctx.save();
                ctx.beginPath();

                ctx.moveTo(-5, -4);
                ctx.lineTo(-5, 4);
                ctx.lineTo(-14 - (Random() * 2), 0);
                ctx.closePath();

                ctx.fillStyle = "rgba(256, 236, 80, " + (Random() * 0.5 + 0.5) + ")";
                ctx.fill();
                ctx.restore();

                const xx = s.p.x - (Math.cos(angle) * 17);
                const yy = s.p.y - (Math.sin(angle) * 17);
                actors.push(new Smoke(xx, yy, Math.cos(angle), Math.sin(angle)));

            }

            drawPath(s.shape);

            ctx.fillStyle = '#ff2020';
            ctx.fill();

            if (Control.up && Control.down) {
                ctx.lineWidth = 4;
                ctx.lineJoin = 'round';
                ctx.strokeStyle = "rgba(80, 236, 256, " + (Random() * 0.6 + 0.4) + ")";
            }
            else {
                if (Control.down) {
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'rgba(255,20,20,0.2)';
                }
                else {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#ffbbbb';
                }
            }
            ctx.stroke();

            ctx.restore();
        },

        // ??
        casePoints: (p: Points) => {
            const df = (p.t / POINTS_MAX);

            ctx.save();
            ctx.fillStyle = (Random() < 0.5 ? 'rgba(255,255,0' : 'rgba(255,255,255') + ',' + (df + 0.1) + ')';
            const text = p.val;
            ctx.font = p.s + 'pt testFont';
            ctx.fillText(text,
                p.x - ctx.measureText(text).width / 2,
                p.y + (FONT_H * 1.5) / 2);
            ctx.restore();
        },

        // Sparks for when the Gue explodes
        caseSpark: (s: Spark) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(s.p.x, s.p.y, SPARK_SIZE, 0, TWO_PI, false);
            ctx.closePath();

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.fillStyle = 'rgba(255,255,0,' + ((s.t / SPARK_T) + 0.1) + ')';
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        },

        // growing smoke dust
        caseSmoke: (s: Smoke) => {
            const df = (s.t / SMOKE_MAX);
            const size = 15 - 12 * df;

            ctx.save();
            ctx.beginPath();
            ctx.arc(s.p.x, s.p.y, size, 0, TWO_PI, false);
            ctx.fillStyle = s.c + (df + 0.01) + ')';
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        },

        // growing CheckPoint circle
        caseCheckPoint: (cp: CheckPoint) => {
            const df = cp.t / CHECKPOINT_MAX; // from 1 to 0

            ctx.save();
            ctx.beginPath();
            ctx.arc(cp.p.x, cp.p.y, cp.r, 0, TWO_PI, false);

            ctx.lineWidth = 3 * (df) + 1;
            ctx.strokeStyle = 'rgba(' + Math.round(255 * (1 - df)) + ',' + Math.round(255 * df)
            + ',128,' + (df < 0.5 ? (1 - df) : df) + ')';
            //'rgba(0,255,0,'+(1-df)+')';
            ctx.fillStyle = 'rgba( 0,' + Math.round(255 * (1 - df))
            + ',' + Math.round(255 * df) + ',' + (df < 0.5 ? (1 - df) : df) + ')';
            ctx.fill();
            ctx.stroke();

            if (debug) {
                ctx.fillStyle = (df < 0.5 ? 'yellow' : 'white');
                const text = cp.t.toFixed(1);
                ctx.fillText(text,
                    cp.p.x - ctx.measureText(text).width / 2,
                    cp.p.y + (FONT_H * 1.5) / 2);
            }
            ctx.restore();
        }
    };

};

//
// Utils
//

function collides(ship: Ship, p: PosXY, r: number): boolean {
    const xx = ship.p.x - p.x;
    const yy = ship.p.y - p.y;
    const rr = ship.radius + r;

    if (xx * xx + yy * yy > rr * rr)
        return false;

    const tmp = ship.shape.map(x => ship.rot(x[0], x[1]));

    for (let i = 0; i < tmp.length; ++i) {
        if (inters(tmp[i], tmp[(i + 1) % tmp.length], p, r))
            return true;
    }

    return false;
}

// from: http://www.gamedev.net/community/forums/topic.asp?topic_id=304578
function inters(p0: PosXY, p1: PosXY, c: PosXY, cw: number) {
    const x0 = c.x;
    const y0 = c.y;
    const x1 = p0.x;
    const y1 = p0.y;
    const x2 = p1.x;
    const y2 = p1.y;

    const n = Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1));
    const d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    const dist = n / d;
    if (dist > cw)
        return false;

    const d1 = Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
    if ((d1 - cw) > d)
        return false;

    const d2 = Math.sqrt(Math.pow(x0 - x2, 2) + Math.pow(y0 - y2, 2));
    if ((d2 - cw) > d)
        return false;

    return true;
};

function fix(str : string, length : number) : string {
    var tmp = str;
    while (tmp.length < length) {
        tmp = ' ' + tmp;
    }
    return tmp;
};

//
// Collision Handler
//

// checks collisions with ship
const playerCollider: MatchActor<void> = {

    caseGue: (g: Gue) => {
        if (collides(ship, g.p, g.s)) {
            ship.slowdown(0.8 + (1 - 0.8) * (1 - g.t / GUE_MAX));
        }
    },

    caseCheckPoint: (cp: CheckPoint) => {
        if (collides(ship, cp.p, cp.r)) {
            const val = cp.t * 10;
            ship.addPoints(val);
            cp.t = 0; // dies

            let sp = Random() * 10 + 10;
            while (sp-- > 0)
                actors.push(new Spark(cp.p.x, cp.p.y, Random() * TWO_PI));

            actors.push(new CheckPoint());
            actors.push(new Points(cp.p.x, cp.p.y, ('+' + val.toFixed(1) + '!')));
        }
    },

    // these never collide with ship:
    caseShip: (s: Ship) => { },
    caseSpark: (s: Spark) => { },
    caseSmoke: (s: Smoke) => { },
    casePoints: (p: Points) => { },
};

/*
* Actors
*/


interface PosXY {
    x: number;
    y: number;
};

interface Actor {
    dead(): boolean;
    tick(time: number): void;
    match<T>(m: MatchActor<T>): T;
};

class Ship implements Actor {

    public power: number; // nullable
    public p: PosXY;
    public v: PosXY;
    public r: number;
    public score: number;
    public timer: number;
    public max: number;
    public radius: number;
    public shape : [number,number][];

    constructor(x: number, y: number) {

        this.power = null; // crap, union doesn't work well with fields.
        this.p = { x: x, y: y };
        this.v = { x: 0, y: 0 };
        this.r = 0;

        this.score = 0;
        this.timer = 0;
        this.max = 0;

        this.radius = 15;
        this.shape = TRIANGLE;
    }

    rot(x: number, y: number) {
        var cos_angle = Math.cos(this.angle());
        var sin_angle = Math.sin(this.angle());
        return {
            x: (x * cos_angle - y * sin_angle) + this.p.x,
            y: (x * sin_angle + y * cos_angle) + this.p.y
        };
    }

    addPoints(p: number) {
        this.score += p;
        this.timer += 3;
    }

    getVel() {
        return Math.sqrt(Math.pow(this.v.x, 2) + Math.pow(this.v.y, 2));
    }

    setVel(pow: number) {
        this.v.x = pow * Math.cos(this.angle());
        this.v.y = pow * Math.sin(this.angle());
    }

    addVel(pow: number) {
        this.v.x += pow * Math.cos(this.angle());
        this.v.y += pow * Math.sin(this.angle());
    }

    angle() {
        return TWO_PI / MAX_R * this.r;
    }

    left() {
        this.r = (this.r - 1) % MAX_R;
    }

    right() {
        this.r = (this.r + 1) % MAX_R;
    }

    fire() {
        this.v.x += FIRE * Math.cos(this.angle());
        this.v.y += FIRE * Math.sin(this.angle());

        // when reaches limit starts to friction
        if (this.getVel() > MAX_SPEED) {
            this.slowdown(GUE_F);
        }
    }

    brake() {
        this.v.x *= BRAKE;
        this.v.y *= BRAKE;
    }

    slowdown(friction: number) {
        this.v.x *= friction;
        this.v.y *= friction;
    }

    powerBrake(isOn: boolean) {
        if (!isOn && this.power !== null) {
            // apply boost
            //this.setVel( power );
            this.addVel(this.power);
            this.power = null;
            return;
        }

        if (isOn) {
            if (this.power === null) {
                this.// power brake speed to remember
                power = 0; //this.getVel();
                //power = Math.min( power, MAX_POWER );
            }
            var tmp = this.getVel();
            this.brake();
            tmp -= this.getVel();
            this.power += tmp;
        }
    }

    tick(t: number) {
        this.p.x += this.v.x * t;
        this.p.y += this.v.y * t;

        this.timer -= t;
        const H = World.H;
        const W = World.W;

        if (this.timer <= 0) {
            if (this.score > 0) {
                if (this.max >= this.score)
                    actors.push(new Points(W / 2, H / 2, 'SCORE RESET', 40));
                else
                    actors.push(new Points(W / 2, H / 2, 'NEW RECORD!!', 50));
                this.max = Math.max(this.max, this.score);
                this.score = 0;
            }
            this.timer = 0;
        }

        // World bounds checking
        if (this.p.x < 0) this.p.x = W;
        if (this.p.x > W) this.p.x = 0;

        if (this.p.y < 0) this.p.y = H;
        if (this.p.y > H) this.p.y = 0;
    }

    dead() {
        return false;
    }

    toString() {
        var score = 'score: ' + fix(this.score.toFixed(1), 5) + ' '
            + (this.timer > 0 ? 'timeout: ' + this.timer.toFixed(1) + 's' : '(max: ' + this.max.toFixed(1) + ')');
        if (!World.debug)
            return score;

        var xx = (this.p.x).toFixed(1);
        var yy = (this.p.y).toFixed(1);
        var vv = this.getVel().toFixed(1);
        var pp = this.power !== null ? '(' + this.power.toFixed(1) + ')' : '';
        return score + ' pos=(' + fix(xx, 6) +
            ', ' + fix(yy, 6) + ') vel=' + fix(vv, 6) + ' ' + pp;
    }

    match<T>(m: MatchActor<T>): T {
        return m.caseShip(this);
    }

};

class CheckPoint implements Actor {

    public t: number;
    public p: PosXY;
    public r: number;

    constructor() {
        this.t = CHECKPOINT_MAX;
        const x = Random() * (World.W - CHECKPOINT_R * 2) + CHECKPOINT_R;
        const y = Random() * (World.H - CHECKPOINT_R * 2) + CHECKPOINT_R;
        this.p = { x: x, y: y };
        this.r = (1 - this.t / CHECKPOINT_MAX) * CHECKPOINT_R + 2;
    }

    dead() {
        return this.t <= 0;
    }

    tick(time: number) {
        if (this.dead()) // already dead
            return;

        this.t -= time;
        this.r = (1 - this.t / CHECKPOINT_MAX) * CHECKPOINT_R + 2;

        if (this.dead()) { // just died
            actors.push(new CheckPoint());

            var gues = Random() * 4 + 2;
            while (gues-- > 0)
                actors.push(new Gue(this.p.x, this.p.y));
        }
    }

    match<T>(m: MatchActor<T>): T {
        return m.caseCheckPoint(this);
    }

};


class Smoke implements Actor {

    public c: string;
    public p: PosXY;
    public v: PosXY;
    public t: number;

    constructor(x: number, y: number, vx: number, vy: number) {
        this.c = SMOKE_COLOR[Math.floor(Random() * SMOKE_COLOR.length)];

        this.p = { x: x + ((Random() * 5) - 2), y: y + ((Random() * 5) - 2) };
        this.v = { x: (Random() * 10 + 5) * vx, y: (Random() * 10 + 5) * vy };
        this.t = SMOKE_MAX;
    }

    dead() {
        return this.t <= 0;
    }

    tick(time: number) {
        this.t -= time;
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= SMOKE_F;
        this.v.y *= SMOKE_F;
    }

    match<T>(m: MatchActor<T>): T {
        return m.caseSmoke(this);
    }

};

class Gue implements Actor {

    public angle: number;
    public size: number;
    public speed: number;
    public p: PosXY;
    public v: PosXY;
    public t: number;
    public s: number;

    constructor(x: number, y: number) {
        this.angle = TWO_PI * Random();
        this.size = Random() * 20 + 30;
        this.speed = Random() * 20;

        this.p = { x: x, y: y };
        this.v = { x: Math.cos(this.angle) * this.speed, y: Math.sin(this.angle) * this.speed };
        this.t = GUE_MAX;
        this.s = this.size - 10 * (this.t / GUE_MAX);
    }

    dead() {
        return this.t <= 0;
    }

    tick(time: number) {
        this.t -= time;
        this.s = this.size - 10 * (this.t / GUE_MAX);
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= GUE_F;
        this.v.y *= GUE_F;
    }

    match<T>(m: MatchActor<T>): T {
        return m.caseGue(this);
    }

};


class Points implements Actor {

    public p: PosXY;
    public t: number;

    constructor(
        public x: number,
        public y: number,
        public val: string,
        public s?: number) {
        this.p = { x: x, y: y };
        this.t = POINTS_MAX;
        if (s === undefined)
            this.s = World.FONT_H;
    }

    dead() {
        return this.t <= 0;
    }

    tick(time: number) {
        this.t -= time;
    }

    match<T>(m: MatchActor<T>): T {
        return m.casePoints(this);
    }

};


class Spark implements Actor {

    public p: PosXY;
    public v: PosXY;
    public t: number;

    constructor(x: number, y: number, angle: number) {
        this.p = { x: x + ((Random() * 5) - 2), y: y + ((Random() * 5) - 2) };
        this.v = { x: Math.cos(angle) * 12, y: Math.sin(angle) * 12 };
        this.t = SPARK_T;
    }

    dead() {
        return this.t <= 0;
    }

    tick(time: number) {
        this.t -= time;
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= SPARK_F;
        this.v.y *= SPARK_F;
    }

    match<T>(m: MatchActor<T>): T {
        return m.caseSpark(this);
    }

};
