
// multiple keys must be tracked individually or it will mess up control
var keys = [];
var keyControl = function(key, down) { keys[key] = down; };
window.addEventListener("keyup", function(e) { keyControl(e.keyCode, false); }, true);
window.addEventListener("keydown", function(e) { keyControl(e.keyCode, true); }, true);

var left = false;
var right = false;
var up = false;
var down = false;

var rot = 0;
var brake = false;


// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
var checkKeys = function() {
	left = keys[37] || keys[65]; // left, 'a'
	right = keys[39] || keys[68]; // right, 'd'
	up = keys[38] || keys[87]; // up, 'w'
	down = keys[40] || keys[83] || keys[32]; // down, 's', space
};


/*
 * SHIP
 */

var actions = function() {
	checkKeys();
	if (left) ship.left();
	if (right) ship.right();
	if (up) ship.fire();
	if (down) ship.brake();
}

function Ship(x,y){
	var p = { x:x, y:y };
	var v = { x:0, y:0 };
	var r = 0;
	var MAX_R = 16;
	var TWO_PI = 2*Math.PI;

    this.angle = function(){
		return TWO_PI/MAX_R*r;
	};
    
    this.draw = function(){
        ctx.save();
		ctx.translate( p.x, p.y );
		ctx.rotate( this.angle() );
		
		ctx.beginPath();
		ctx.moveTo(-5, -5);
		ctx.lineTo(-5, 5);
		ctx.lineTo(15, 0);
		ctx.lineJoin = 'miter';
		ctx.closePath();
		
		ctx.lineWidth = 1;
		ctx.fillStyle = 'green';
		ctx.fill();
		ctx.strokeStyle = 'black';
		ctx.stroke();
		
		ctx.restore();
    };
    
    //controls
    this.left  = function() { r = (r-1) % MAX_R; };
    this.right = function() { r = (r+1) % MAX_R; };

    this.fire = function() {
        v.x += 15*Math.cos( this.angle() );
        v.y += 15*Math.sin( this.angle() );
    };
    
    this.brake = function(){
        v.x *= 0.8;
        v.y *= 0.8;
    };
    
    this.tick = function(){
        p.x = p.x + v.x*1/20;
	    p.y = p.y + v.y*1/20;
    };

}

/*
 * CANVAS SETUP
 */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var W = 800; //window.innerWidth;
var H = 400; //window.innerHeight;

// set canvas dimensions using just javascript
ctx.canvas.width = W;
ctx.canvas.height = H;

var rectWidth = 150;
var rectHeight = 75;

// translate context to center of canvas
//ctx.translate(canvas.width / 2, canvas.height / 2);

// rotate 45 degrees clockwise
//ctx.rotate(Math.PI / 4);

var draw = function() {

	ctx.fillStyle = "#333333";
	ctx.fillRect(0, 0, W, H);

	ship.draw();

	ctx.font = '40pt monospace';
	ctx.fillStyle = 'blue';
	ctx.fillText('Hello World!', 150, 100);
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 1;
	ctx.strokeText('Hello World!', 150, 100);
};
/*
// quadratic curve
context.quadraticCurveTo(230, 200, 250, 120);

// bezier curve
context.bezierCurveTo(290, -40, 300, 200, 400, 150);
*/
// line 2
//      ctx.lineTo(500, 90);

//ctx.fillStyle = 'blue';
//ctx.fillRect(rectWidth / -2, rectHeight / -2, rectWidth, rectHeight);

/*
var particles = [];
for(var i = 0; i < 5; i++)
{
particles.push(new create_particle());
}

function create_particle()
{
//Random position on the canvas
this.x = Math.random()*W;
this.y = Math.random()*H;

//Lets add random velocity to each particle
this.vx = Math.random()*20-10;
this.vy = Math.random()*20-10;

//Random colors
var r = Math.random()*255>>0;
var g = Math.random()*255>>0;
var b = Math.random()*255>>0;
this.color = "rgba("+r+", "+g+", "+b+", 0.5)";

//Random size
this.radius = Math.random()*20+20;
}

//var x = 100; var y = 100;

var draw = function()
{
//Moving this BG paint code insde draw() will help remove the trail
//of the particle
//Lets paint the canvas black
//But the BG paint shouldn't blend with the previous frame
ctx.globalCompositeOperation = "source-over";
//Lets reduce the opacity of the BG paint to give the final touch
ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
ctx.fillRect(0, 0, W, H);

//Lets blend the particle with the BG
ctx.globalCompositeOperation = "lighter";

//Lets draw particles from the array now
for(var t = 0; t < particles.length; t++)
{
var p = particles[t];

ctx.beginPath();

//Time for some colors

var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
gradient.addColorStop(0, "white");
gradient.addColorStop(0.4, "white");
gradient.addColorStop(0.4, p.color);
gradient.addColorStop(1, "black");

ctx.fillStyle = gradient;
ctx.arc(p.x, p.y, p.radius, Math.PI*2, false);
ctx.fill();

//Lets use the velocity now
p.x += p.vx;
p.y += p.vy;

//To prevent the balls from moving out of the canvas
if(p.x < -50) p.x = W+50;
if(p.y < -50) p.y = H+50;
if(p.x > W+50) p.x = -50;
if(p.y > H+50) p.y = -50;
}
}
*/
var ship = new Ship(canvas.width/2,canvas.height/2);

// animation intervals
var fps = 30;
var interval = 1000 / fps;
setInterval(function(){
	draw();
	ship.tick();
}, interval);

setInterval(actions, 1000 / 15);
// input is read with this speed
