
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

/*
 * Utils
 */

var collides = function(ship, p, r) {
    var xx = ship.p.x - p.x;
    var yy = ship.p.y - p.y;
    var rr = ship.radius + r;

    if (xx * xx + yy * yy > rr * rr)
        return false;

    var p0 = ship.rot(5, -5); // FIXME: this is bad style
    var p1 = ship.rot(-5, 5);
    var p2 = ship.rot(15, 0);

    return inters(p0, p1, p, r) ||
        inters(p1, p2, p, r) ||
        inters(p2, p0, p, r);
}

// from: http://www.gamedev.net/community/forums/topic.asp?topic_id=304578
function inters(p0 : PosXY, p1 : PosXY, c : PosXY, cw : number) {
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

function fix(str, length) {
    var tmp = str;
    while (tmp.length < length) {
        tmp = ' ' + tmp;
    }
    return tmp;
};

var drawMissile = function(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(-4, 4);
    ctx.lineTo(8, 4);
    ctx.lineTo(12, 0);
    ctx.lineTo(8, -4);
    ctx.lineJoin = 'miter';
    ctx.closePath();
};

var drawTriangle = function(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(-5, 5);
    ctx.lineTo(15, 0);
    ctx.lineJoin = 'miter';
    ctx.closePath();
};

/*
 * Actors
 */


interface PosXY {
    x: number;
    y: number;
}

interface Actor {
    dead(): boolean;
    tick(time: number, H?: number, W?: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    collision(s : Ship) : void;
}

class Ship implements Actor {

    protected power: number; // nullable
    protected p: PosXY;
    protected v: PosXY;
    protected r: number;
    protected score: number;
    protected timer: number;
    protected max: number;
    protected radius: number;

    constructor(x: number, y: number) {

        this.power = null; // crap, union don't work well on fields.
        this.p = { x: x, y: y };
        this.v = { x: 0, y: 0 };
        this.r = 0;

        this.score = 0;
        this.timer = 0;
        this.max = 0;

        this.radius = 15;
    }

    rot(x: number, y: number) {
        var cos_angle = Math.cos(this.angle());
        var sin_angle = Math.sin(this.angle());
        return {
            x: (x * cos_angle - y * sin_angle) + this.p.x,
            y: (x * sin_angle + y * cos_angle) + this.p.y
        };
    }

    points(p: number) {
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

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.translate(this.p.x, this.p.y);
        ctx.rotate(this.angle());

        //if engines on
        if (up && !down) {
            ctx.save();
            ctx.beginPath();

            ctx.moveTo(-5, -4);
            ctx.lineTo(-5, 4);
            ctx.lineTo(-14 - (Random() * 2), 0);
            ctx.closePath();

            ctx.fillStyle = "rgba(256, 236, 80, " + (Random() * 0.5 + 0.5) + ")";
            ctx.fill();
            ctx.restore();

            var xx = this.p.x - (Math.cos(this.angle()) * 17);
            var yy = this.p.y - (Math.sin(this.angle()) * 17);
            actors.push(new Smoke(xx, yy, Math.cos(this.angle()), Math.sin(this.angle())));

        }

        drawTriangle(ctx);

        ctx.fillStyle = '#ff2020';
        ctx.fill();

        if (up && down) {
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.strokeStyle = "rgba(80, 236, 256, " + (Random() * 0.6 + 0.4) + ")";
        }
        else {
            if (down) {
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

    tick(t: number, H: number, W: number) {
        this.p.x += this.v.x * t;
        this.p.y += this.v.y * t;

        this.timer -= tick; // FIXME: why not using 't' ??
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

        this.bounds(H, W);
    }

    bounds(H: number, W: number) { // FIXME bad style
        if (this.p.x < 0) this.p.x = W;
        if (this.p.x > W) this.p.x = 0;

        if (this.p.y < 0) this.p.y = H;
        if (this.p.y > H) this.p.y = 0;
    }

    dead() {
        return false;
    }

    collision(s) {
        // never collides with self
    }

    toString() {
        var score = 'score: ' + fix(this.score.toFixed(1), 5) + ' '
            + (this.timer > 0 ? 'timeout: ' + this.timer.toFixed(1) + 's' : '(max: ' + this.max.toFixed(1) + ')');
        if (!debug)
            return score;

        var xx = (this.p.x).toFixed(1);
        var yy = (this.p.y).toFixed(1);
        var vv = this.getVel().toFixed(1);
        var pp = this.power !== null ? '(' + this.power.toFixed(1) + ')' : '';
        return score + ' pos=(' + fix(xx, 6) +
            ', ' + fix(yy, 6) + ') vel=' + fix(vv, 6) + ' ' + pp;
    }

}

class CheckPoint implements Actor {

    protected t: number;
    protected p: PosXY;
    protected r: number;

    constructor() {
        this.t = CHECKPOINT_MAX;
        const x = Random() * (W - CHECKPOINT_R * 2) + CHECKPOINT_R;
        const y = Random() * (H - CHECKPOINT_R * 2) + CHECKPOINT_R;
        this.p = { x: x, y: y };
        this.r = (1 - this.t / CHECKPOINT_MAX) * CHECKPOINT_R + 2;
    }

    dead() {
        return this.t <= 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const df = this.t / CHECKPOINT_MAX; // from 1 to 0

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.r, 0, TWO_PI, false);

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
            var text = this.t.toFixed(1);
            ctx.fillText(text,
                this.p.x - ctx.measureText(text).width / 2,
                this.p.y + (FONT_H * 1.5) / 2);
        }
        ctx.restore();

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

    collision(s) {
        if (collides(s, this.p, this.r)) {
            var val = this.t * 10;
            s.points(val);
            this.t = 0; // dies

            var sp = Random() * 10 + 10;
            while (sp-- > 0)
                actors.push(new Spark(this.p.x, this.p.y, Random() * TWO_PI));

            actors.push(new CheckPoint());
            actors.push(new Points(this.p.x, this.p.y, ('+' + val.toFixed(1) + '!')));
        }
    }

}


class Smoke implements Actor {

    protected c: string;
    protected p: PosXY;
    protected v: PosXY;
    protected t: number;

    constructor(x: number, y: number, vx: number, vy: number) {
        this.c = SMOKE_COLOR[Math.floor(Random() * SMOKE_COLOR.length)];

        this.p = { x: x + ((Random() * 5) - 2), y: y + ((Random() * 5) - 2) };
        this.v = { x: (Random() * 10 + 5) * vx, y: (Random() * 10 + 5) * vy };
        this.t = SMOKE_MAX;
    }

    dead() {
        return this.t <= 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const df = (this.t / SMOKE_MAX);
        const size = 15 - 12 * df;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, size, 0, TWO_PI, false);
        ctx.fillStyle = this.c + (df + 0.01) + ')';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    tick(time: number) {
        this.t -= time;
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= SMOKE_F;
        this.v.y *= SMOKE_F;
    }

    collision(s) {
        // never collides
    }

}

class Gue implements Actor {

    protected angle: number;
    protected size: number;
    protected speed: number;
    protected p: PosXY;
    protected v: PosXY;
    protected t: number;
    protected s: number;

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

    draw(ctx: CanvasRenderingContext2D) {
        const df = this.t / GUE_MAX;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.s, 0, TWO_PI, false);
        ctx.fillStyle = GUE_COLOR + df + ')';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    tick(time: number) {
        this.t -= time;
        this.s = this.size - 10 * (this.t / GUE_MAX);
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= GUE_F;
        this.v.y *= GUE_F;
    }


    collision(ship) {
        if (collides(ship, this.p, this.s)) {
            ship.slowdown(0.8 + (1 - 0.8) * (1 - this.t / GUE_MAX));
        }
    }

}


class Points implements Actor {

    protected p: PosXY;
    protected t: number;

    constructor(
        protected x: number,
        protected y: number,
        protected val: string,
        protected s?: number) {
        this.p = { x: x, y: y };
        this.t = POINTS_MAX;
        if (s === undefined)
            this.s = FONT_H;
    }

    dead() {
        return this.t <= 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const df = (this.t / POINTS_MAX);

        ctx.save();
        ctx.fillStyle = (Random() < 0.5 ? 'rgba(255,255,0' : 'rgba(255,255,255') + ',' + (df + 0.1) + ')';
        const text = this.val;
        ctx.font = this.s + 'pt testFont';
        ctx.fillText(text,
            this.x - ctx.measureText(text).width / 2,
            this.y + (FONT_H * 1.5) / 2);
        ctx.restore();
    }

    tick(time: number) {
        this.t -= time;
    }

    collision(s) {
        // never collides
    }
}


class Spark implements Actor {

    protected p: PosXY;
    protected v: PosXY;
    protected t: number;

    constructor(x: number, y: number, angle: number) {
        this.p = { x: x + ((Random() * 5) - 2), y: y + ((Random() * 5) - 2) };
        this.v = { x: Math.cos(angle) * 12, y: Math.sin(angle) * 12 };
        this.t = SPARK_T;
    }

    dead() {
        return this.t <= 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const df = (this.t / SPARK_T);

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, SPARK_SIZE, 0, TWO_PI, false);
        ctx.closePath();

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.fillStyle = 'rgba(255,255,0,' + (df + 0.1) + ')';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    tick(time: number) {
        this.t -= time;
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= SPARK_F;
        this.v.y *= SPARK_F;
    }

    collision(s) {
        // never collides
    }
}
