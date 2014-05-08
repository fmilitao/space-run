/*
 * KEYS
 */

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

var Ship = function(x,y){
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
		
		//if engines on
        if( up ){
        	ctx.save();
	        	ctx.beginPath();
				ctx.moveTo(-5, -4);
				ctx.lineTo(-5, 4);
				ctx.lineTo(-15, 0);
				ctx.closePath();
//FFD3E820
				ctx.fillStyle = "rgba(256, 236, 80, "+(Math.random()*0.5+0.5)+")";
				//ctx.fillStyle = 'yellow';// FIXME 100+random(156)
				ctx.fill();
            ctx.restore();
        }
        
		
		ctx.beginPath();
			ctx.moveTo(-5, -5);
			ctx.lineTo(-5, 5);
			ctx.lineTo(15, 0);
			ctx.lineJoin = 'miter';
		ctx.closePath();
		
		ctx.lineWidth = 2;
		ctx.fillStyle = 'green';
		ctx.fill();
		ctx.strokeStyle = 'white';
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
    
    this.bounds = function(){
		if( p.x < 0 ) p.x = W;
    	if( p.x > W ) p.x = 0;
    
    	if( p.y < 0 ) p.y = H;
    	if( p.y > H ) p.y = 0;
    }
    
    this.toString = function(){
    	return 'x: '+p.x+', y: '+p.y;
    }

}

/*
 * MAIN LOOP
 */

var ship = new Ship(canvas.width/2,canvas.height/2);

var draw = function() {

	ctx.fillStyle = "#333333";
	ctx.fillRect(0, 0, W, H);

	ship.draw();

	ctx.save();
	var h = 12;
	ctx.font = h+'pt monospace';
	ctx.fillStyle = 'white';
	//ctx.strokeStyle = 'white';
	ctx.lineWidth = 1;
	
	//var txt = 'The time is: '+(new Date().toString());
	var txt = ship.toString();
	//var m = ctx.measureText(txt);
	ctx.fillText(txt, 2, h+2); //canvas.height-2);
	//ctx.strokeText(txt, 2, h);
	ctx.restore();
	
	//drawP(); //TODO hidden particles
};


// animation intervals
var fps = 30;
var interval = 1000 / fps;
setInterval(function(){
	draw();
	ship.tick();
	ship.bounds();
}, interval);

// input is read with this speed
setInterval(actions, 1000 / 15);
	
	
	/*
	window.onload = function(){
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	//Make the canvas occupy the full page
	var W = window.innerWidth, H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;
	*/
	var particles = [];
	var mouse = {};
	
	//Lets create some particles now
	var particle_count = 1;
	for(var i = 0; i < particle_count; i++)
	{
		particles.push(new particle());
	}
	
	//finally some mouse tracking
	canvas.addEventListener('mousemove', track_mouse, false);
	
	function track_mouse(e)
	{
		//since the canvas = full page the position of the mouse 
		//relative to the document will suffice
		mouse.x = e.pageX;
		mouse.y = e.pageY;
	}
	
	function particle()
	{
		//speed, life, location, life, colors
		//speed.x range = -2.5 to 2.5 
		//speed.y range = -15 to -5 to make it move upwards
		//lets change the Y speed to make it look like a flame
		this.speed = {x: -2.5+Math.random()*5, y: -10+Math.random()*10};
		//location = mouse coordinates
		//Now the flame follows the mouse coordinates
		if(mouse.x && mouse.y)
		{
			this.location = {x: mouse.x, y: mouse.y};
		}
		else
		{
			this.location = {x: W/2, y: H/2};
		}
		//radius range = 10-30
		this.radius = 15+Math.random()*4;
		//life range = 20-30
		this.life = 20+Math.random()*10;
		this.remaining_life = this.life;
		//colors
		this.r = 200+Math.round(Math.random()*55);
		this.g = Math.round(Math.random()*255);
		this.b = Math.round(Math.random()*255);
	}
	
	function drawP()
	{
		//Painting the canvas black
		//Time for lighting magic
		//particles are painted with "lighter"
		//In the next frame the background is painted normally without blending to the 
		//previous frame
		//ctx.globalCompositeOperation = "source-over";
		//ctx.fillStyle = "black";
		//ctx.fillRect(0, 0, W, H);
		ctx.save();
		ctx.globalCompositeOperation = "lighter"; // FIXME important ----
		
		for(var i = 0; i < particles.length; i++)
		{
			var p = particles[i];
			
			// FIXME important -----
			ctx.beginPath();
			//changing opacity according to the life.
			//opacity goes to 0 at the end of life of a particle
			p.opacity = Math.round(p.remaining_life/p.life*100)/100
			//a gradient instead of white fill
			
			var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
			gradient.addColorStop(0, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
			gradient.addColorStop(0.5, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
			gradient.addColorStop(1, "rgba("+p.r+", "+p.g+", "+p.b+", 0)");
			ctx.fillStyle = gradient;
			ctx.arc(p.location.x, p.location.y, p.radius,0, Math.PI*2, false);
			ctx.fill();
			// FIXME important -------
			
			//lets move the particles
			p.remaining_life--;
			p.radius--;
			//p.location.x += p.speed.x;
			//p.location.y += p.speed.y;
			
			//regenerate particles
			if(p.remaining_life < 0 || p.radius < 0)
			{
				//a brand new particle replacing the dead one
				particles[i] = new particle();
			}
		}
		ctx.restore();
	}

	
	
	
	
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