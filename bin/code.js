// NOTE: all public fields should be read-only outside their class.
var PI = Math.PI;
var TWO_PI = 2 * Math.PI;
var Random = Math.random;
var MAX_R = 32;
var MAX_POWER = 150;
var MAX_SPEED = 250;
var FIRE = 5;
var BRAKE = 0.9;
var SMOKE_COLOR = ['rgba(37,37,37,', 'rgba(21,21,21,'];
var SMOKE_F = 0.99;
var SMOKE_MAX = 5;
var GUE_F = 0.98;
var GUE_MAX = 30;
var GUE_COLOR = 'rgba(0,255,0,';
var CHECKPOINT_MAX = 9.99;
var CHECKPOINT_R = 30;
var SPARK_T = 3;
var SPARK_F = 0.99;
var SPARK_SIZE = 1;
var POINTS_MAX = 3;
var TRIANGLE = [[-5, -5], [-5, 5], [15, 0]];
var MISSILE = [[-4, -4], [-4, 4], [8, 4], [12, 0], [8, -4]];
var Setup;
(function (Setup) {
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
    function drawPath(path) {
        Setup.ctx.beginPath();
        var _a = path[0], x = _a[0], y = _a[1];
        Setup.ctx.moveTo(x, y);
        for (var i = 0; i < path.length; ++i) {
            _b = path[i], x = _b[0], y = _b[1];
            Setup.ctx.lineTo(x, y);
        }
        Setup.ctx.lineJoin = 'miter';
        Setup.ctx.closePath();
        var _b;
    }
    ;
    Setup.drawer = {
        drawHUD: function (shipStatus) {
            Setup.ctx.save();
            Setup.ctx.fillStyle = "rgba(0,0,0,0.3)";
            Setup.ctx.fillRect(0, 0, Setup.W, Setup.FONT_H * 1.5 + 4);
            Setup.ctx.fillStyle = 'white';
            Setup.ctx.lineWidth = 1;
            Setup.ctx.fillText(shipStatus, 4, Setup.FONT_H * 1.5 + 2);
            Setup.ctx.restore();
        },
        drawPaused: function () {
            Setup.clearBackground();
            Setup.ctx.fillStyle = "rgba(0,0,0,0.5)";
            Setup.ctx.fillRect(0, 0, Setup.W, Setup.H);
            Setup.ctx.fillStyle = 'white';
            Setup.ctx.lineWidth = 1;
            for (var i = 0; i < MSG.length; ++i) {
                var txt = MSG[i];
                Setup.ctx.fillText(txt, (Setup.W / 2) - (Setup.ctx.measureText(txt).width / 2), (Setup.H / 2 - (Setup.FONT_HEIGHT * MSG.length / 2)) + (Setup.FONT_HEIGHT * i));
            }
        },
        caseGue: function (g) {
            var df = g.t / GUE_MAX;
            Setup.ctx.save();
            Setup.ctx.beginPath();
            Setup.ctx.arc(g.p.x, g.p.y, g.s, 0, TWO_PI, false);
            Setup.ctx.fillStyle = GUE_COLOR + df + ')';
            Setup.ctx.fill();
            Setup.ctx.closePath();
            Setup.ctx.restore();
        },
        caseShip: function (s) {
            Setup.ctx.save();
            var angle = s.angle();
            Setup.ctx.translate(s.p.x, s.p.y);
            Setup.ctx.rotate(angle);
            if (Control.up && !Control.down) {
                Setup.ctx.save();
                Setup.ctx.beginPath();
                Setup.ctx.moveTo(-5, -4);
                Setup.ctx.lineTo(-5, 4);
                Setup.ctx.lineTo(-14 - (Random() * 2), 0);
                Setup.ctx.closePath();
                Setup.ctx.fillStyle = "rgba(256, 236, 80, " + (Random() * 0.5 + 0.5) + ")";
                Setup.ctx.fill();
                Setup.ctx.restore();
                var xx = s.p.x - (Math.cos(angle) * 17);
                var yy = s.p.y - (Math.sin(angle) * 17);
                actors.push(new Smoke(xx, yy, Math.cos(angle), Math.sin(angle)));
            }
            drawPath(TRIANGLE);
            Setup.ctx.fillStyle = '#ff2020';
            Setup.ctx.fill();
            if (Control.up && Control.down) {
                Setup.ctx.lineWidth = 4;
                Setup.ctx.lineJoin = 'round';
                Setup.ctx.strokeStyle = "rgba(80, 236, 256, " + (Random() * 0.6 + 0.4) + ")";
            }
            else {
                if (Control.down) {
                    Setup.ctx.lineWidth = 3;
                    Setup.ctx.strokeStyle = 'rgba(255,20,20,0.2)';
                }
                else {
                    Setup.ctx.lineWidth = 2;
                    Setup.ctx.strokeStyle = '#ffbbbb';
                }
            }
            Setup.ctx.stroke();
            Setup.ctx.restore();
        },
        casePoints: function (p) {
            var df = (p.t / POINTS_MAX);
            Setup.ctx.save();
            Setup.ctx.fillStyle = (Random() < 0.5 ? 'rgba(255,255,0' : 'rgba(255,255,255') + ',' + (df + 0.1) + ')';
            var text = p.val;
            Setup.ctx.font = p.s + 'pt testFont';
            Setup.ctx.fillText(text, p.x - Setup.ctx.measureText(text).width / 2, p.y + (Setup.FONT_H * 1.5) / 2);
            Setup.ctx.restore();
        },
        caseSpark: function (s) {
            Setup.ctx.save();
            Setup.ctx.beginPath();
            Setup.ctx.arc(s.p.x, s.p.y, SPARK_SIZE, 0, TWO_PI, false);
            Setup.ctx.closePath();
            Setup.ctx.lineWidth = 2;
            Setup.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            Setup.ctx.fillStyle = 'rgba(255,255,0,' + ((s.t / SPARK_T) + 0.1) + ')';
            Setup.ctx.fill();
            Setup.ctx.stroke();
            Setup.ctx.restore();
        },
        caseSmoke: function (s) {
            var df = (s.t / SMOKE_MAX);
            var size = 15 - 12 * df;
            Setup.ctx.save();
            Setup.ctx.beginPath();
            Setup.ctx.arc(s.p.x, s.p.y, size, 0, TWO_PI, false);
            Setup.ctx.fillStyle = s.c + (df + 0.01) + ')';
            Setup.ctx.fill();
            Setup.ctx.closePath();
            Setup.ctx.restore();
        },
        caseCheckPoint: function (cp) {
            var df = cp.t / CHECKPOINT_MAX;
            Setup.ctx.save();
            Setup.ctx.beginPath();
            Setup.ctx.arc(cp.p.x, cp.p.y, cp.r, 0, TWO_PI, false);
            Setup.ctx.lineWidth = 3 * (df) + 1;
            Setup.ctx.strokeStyle = 'rgba(' + Math.round(255 * (1 - df)) + ',' + Math.round(255 * df)
                + ',128,' + (df < 0.5 ? (1 - df) : df) + ')';
            Setup.ctx.fillStyle = 'rgba( 0,' + Math.round(255 * (1 - df))
                + ',' + Math.round(255 * df) + ',' + (df < 0.5 ? (1 - df) : df) + ')';
            Setup.ctx.fill();
            Setup.ctx.stroke();
            if (Setup.debug) {
                Setup.ctx.fillStyle = (df < 0.5 ? 'yellow' : 'white');
                var text = cp.t.toFixed(1);
                Setup.ctx.fillText(text, cp.p.x - Setup.ctx.measureText(text).width / 2, cp.p.y + (Setup.FONT_H * 1.5) / 2);
            }
            Setup.ctx.restore();
        }
    };
})(Setup || (Setup = {}));
var collides = function (ship, p, r) {
    var xx = ship.p.x - p.x;
    var yy = ship.p.y - p.y;
    var rr = ship.radius + r;
    if (xx * xx + yy * yy > rr * rr)
        return false;
    var p0 = ship.rot(5, -5);
    var p1 = ship.rot(-5, 5);
    var p2 = ship.rot(15, 0);
    return inters(p0, p1, p, r) ||
        inters(p1, p2, p, r) ||
        inters(p2, p0, p, r);
};
function inters(p0, p1, c, cw) {
    var x0 = c.x;
    var y0 = c.y;
    var x1 = p0.x;
    var y1 = p0.y;
    var x2 = p1.x;
    var y2 = p1.y;
    var n = Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1));
    var d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    var dist = n / d;
    if (dist > cw)
        return false;
    var d1 = Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
    if ((d1 - cw) > d)
        return false;
    var d2 = Math.sqrt(Math.pow(x0 - x2, 2) + Math.pow(y0 - y2, 2));
    if ((d2 - cw) > d)
        return false;
    return true;
}
;
function fix(str, length) {
    var tmp = str;
    while (tmp.length < length) {
        tmp = ' ' + tmp;
    }
    return tmp;
}
;
var playerCollider = {
    caseGue: function (g) {
        if (collides(ship, g.p, g.s)) {
            ship.slowdown(0.8 + (1 - 0.8) * (1 - g.t / GUE_MAX));
        }
    },
    caseCheckPoint: function (cp) {
        if (collides(ship, cp.p, cp.r)) {
            var val = cp.t * 10;
            ship.addPoints(val);
            cp.t = 0;
            var sp = Random() * 10 + 10;
            while (sp-- > 0)
                actors.push(new Spark(cp.p.x, cp.p.y, Random() * TWO_PI));
            actors.push(new CheckPoint());
            actors.push(new Points(cp.p.x, cp.p.y, ('+' + val.toFixed(1) + '!')));
        }
    },
    caseShip: function (s) { },
    caseSpark: function (s) { },
    caseSmoke: function (s) { },
    casePoints: function (p) { },
};
var Ship = (function () {
    function Ship(x, y) {
        this.power = null;
        this.p = { x: x, y: y };
        this.v = { x: 0, y: 0 };
        this.r = 0;
        this.score = 0;
        this.timer = 0;
        this.max = 0;
        this.radius = 15;
    }
    Ship.prototype.rot = function (x, y) {
        var cos_angle = Math.cos(this.angle());
        var sin_angle = Math.sin(this.angle());
        return {
            x: (x * cos_angle - y * sin_angle) + this.p.x,
            y: (x * sin_angle + y * cos_angle) + this.p.y
        };
    };
    Ship.prototype.addPoints = function (p) {
        this.score += p;
        this.timer += 3;
    };
    Ship.prototype.getVel = function () {
        return Math.sqrt(Math.pow(this.v.x, 2) + Math.pow(this.v.y, 2));
    };
    Ship.prototype.setVel = function (pow) {
        this.v.x = pow * Math.cos(this.angle());
        this.v.y = pow * Math.sin(this.angle());
    };
    Ship.prototype.addVel = function (pow) {
        this.v.x += pow * Math.cos(this.angle());
        this.v.y += pow * Math.sin(this.angle());
    };
    Ship.prototype.angle = function () {
        return TWO_PI / MAX_R * this.r;
    };
    Ship.prototype.match = function (m) {
        m.caseShip(this);
    };
    Ship.prototype.left = function () {
        this.r = (this.r - 1) % MAX_R;
    };
    Ship.prototype.right = function () {
        this.r = (this.r + 1) % MAX_R;
    };
    Ship.prototype.fire = function () {
        this.v.x += FIRE * Math.cos(this.angle());
        this.v.y += FIRE * Math.sin(this.angle());
        if (this.getVel() > MAX_SPEED) {
            this.slowdown(GUE_F);
        }
    };
    Ship.prototype.brake = function () {
        this.v.x *= BRAKE;
        this.v.y *= BRAKE;
    };
    Ship.prototype.slowdown = function (friction) {
        this.v.x *= friction;
        this.v.y *= friction;
    };
    Ship.prototype.powerBrake = function (isOn) {
        if (!isOn && this.power !== null) {
            this.addVel(this.power);
            this.power = null;
            return;
        }
        if (isOn) {
            if (this.power === null) {
                this.
                    power = 0;
            }
            var tmp = this.getVel();
            this.brake();
            tmp -= this.getVel();
            this.power += tmp;
        }
    };
    Ship.prototype.tick = function (t, H, W) {
        this.p.x += this.v.x * t;
        this.p.y += this.v.y * t;
        this.timer -= t;
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
    };
    Ship.prototype.bounds = function (H, W) {
        if (this.p.x < 0)
            this.p.x = W;
        if (this.p.x > W)
            this.p.x = 0;
        if (this.p.y < 0)
            this.p.y = H;
        if (this.p.y > H)
            this.p.y = 0;
    };
    Ship.prototype.dead = function () {
        return false;
    };
    Ship.prototype.toString = function () {
        var score = 'score: ' + fix(this.score.toFixed(1), 5) + ' '
            + (this.timer > 0 ? 'timeout: ' + this.timer.toFixed(1) + 's' : '(max: ' + this.max.toFixed(1) + ')');
        if (!Setup.debug)
            return score;
        var xx = (this.p.x).toFixed(1);
        var yy = (this.p.y).toFixed(1);
        var vv = this.getVel().toFixed(1);
        var pp = this.power !== null ? '(' + this.power.toFixed(1) + ')' : '';
        return score + ' pos=(' + fix(xx, 6) +
            ', ' + fix(yy, 6) + ') vel=' + fix(vv, 6) + ' ' + pp;
    };
    return Ship;
})();
var CheckPoint = (function () {
    function CheckPoint() {
        this.t = CHECKPOINT_MAX;
        var x = Random() * (Setup.W - CHECKPOINT_R * 2) + CHECKPOINT_R;
        var y = Random() * (Setup.H - CHECKPOINT_R * 2) + CHECKPOINT_R;
        this.p = { x: x, y: y };
        this.r = (1 - this.t / CHECKPOINT_MAX) * CHECKPOINT_R + 2;
    }
    CheckPoint.prototype.dead = function () {
        return this.t <= 0;
    };
    CheckPoint.prototype.match = function (m) {
        m.caseCheckPoint(this);
    };
    CheckPoint.prototype.tick = function (time) {
        if (this.dead())
            return;
        this.t -= time;
        this.r = (1 - this.t / CHECKPOINT_MAX) * CHECKPOINT_R + 2;
        if (this.dead()) {
            actors.push(new CheckPoint());
            var gues = Random() * 4 + 2;
            while (gues-- > 0)
                actors.push(new Gue(this.p.x, this.p.y));
        }
    };
    return CheckPoint;
})();
var Smoke = (function () {
    function Smoke(x, y, vx, vy) {
        this.c = SMOKE_COLOR[Math.floor(Random() * SMOKE_COLOR.length)];
        this.p = { x: x + ((Random() * 5) - 2), y: y + ((Random() * 5) - 2) };
        this.v = { x: (Random() * 10 + 5) * vx, y: (Random() * 10 + 5) * vy };
        this.t = SMOKE_MAX;
    }
    Smoke.prototype.dead = function () {
        return this.t <= 0;
    };
    Smoke.prototype.match = function (m) {
        m.caseSmoke(this);
    };
    Smoke.prototype.tick = function (time) {
        this.t -= time;
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= SMOKE_F;
        this.v.y *= SMOKE_F;
    };
    return Smoke;
})();
var Gue = (function () {
    function Gue(x, y) {
        this.angle = TWO_PI * Random();
        this.size = Random() * 20 + 30;
        this.speed = Random() * 20;
        this.p = { x: x, y: y };
        this.v = { x: Math.cos(this.angle) * this.speed, y: Math.sin(this.angle) * this.speed };
        this.t = GUE_MAX;
        this.s = this.size - 10 * (this.t / GUE_MAX);
    }
    Gue.prototype.dead = function () {
        return this.t <= 0;
    };
    Gue.prototype.match = function (m) {
        m.caseGue(this);
    };
    Gue.prototype.tick = function (time) {
        this.t -= time;
        this.s = this.size - 10 * (this.t / GUE_MAX);
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= GUE_F;
        this.v.y *= GUE_F;
    };
    return Gue;
})();
var Points = (function () {
    function Points(x, y, val, s) {
        this.x = x;
        this.y = y;
        this.val = val;
        this.s = s;
        this.p = { x: x, y: y };
        this.t = POINTS_MAX;
        if (s === undefined)
            this.s = Setup.FONT_H;
    }
    Points.prototype.dead = function () {
        return this.t <= 0;
    };
    Points.prototype.match = function (m) {
        m.casePoints(this);
    };
    Points.prototype.tick = function (time) {
        this.t -= time;
    };
    return Points;
})();
var Spark = (function () {
    function Spark(x, y, angle) {
        this.p = { x: x + ((Random() * 5) - 2), y: y + ((Random() * 5) - 2) };
        this.v = { x: Math.cos(angle) * 12, y: Math.sin(angle) * 12 };
        this.t = SPARK_T;
    }
    Spark.prototype.dead = function () {
        return this.t <= 0;
    };
    Spark.prototype.match = function (m) {
        m.caseSpark(this);
    };
    Spark.prototype.tick = function (time) {
        this.t -= time;
        this.p.x += this.v.x * time;
        this.p.y += this.v.y * time;
        this.v.x *= SPARK_F;
        this.v.y *= SPARK_F;
    };
    return Spark;
})();
