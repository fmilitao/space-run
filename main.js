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

var W = 800; //window.innerWidth-4;
var H = window.innerHeight-4;

ctx.canvas.width = W;
ctx.canvas.height = H;

/*
 * MAIN LOOP
 */

var ship = new Ship( W/2, H/2 );

var actions = function() {
	checkKeys();
	if(left)
		ship.left();
	if(right)
		ship.right();
	
	if(up && down) 
		ship.powerBrake(true);
	else{
		ship.powerBrake(false);
		if(up)
			ship.fire();
		if(down)
			ship.brake();
	}
}

var stars = new Array(150);
for(var i=0;i<stars.length;++i){
	stars[i] = {x : Math.random()*W, y : Math.random()*H, s: Math.random()+1 };
}

var draw = function() {

	ctx.fillStyle = "#111111";
	ctx.fillRect(0, 0, W, H);

	for(var i=0;i<stars.length;++i){
		ctx.beginPath();
		var p = stars[i];
		ctx.arc(p.x, p.y, p.s,0, Math.PI*2, false);
		ctx.fillStyle = '#EDD879';
		ctx.fill();
		
	}

	ship.draw(ctx);

    // HUD elements
	ctx.save();
	var h = 12;
	ctx.font = h+'pt monospace';
	ctx.fillStyle = 'white';
	//ctx.strokeStyle = 'white';
	ctx.lineWidth = 1;
	
	//var txt = 'The time is: '+(new Date().toString());
	var txt = ship.toString();
	//var m = ctx.measureText(txt);
	ctx.fillText(txt, 2, h+2);
	//ctx.strokeText(txt, 2, h);
	ctx.restore();

};

// animation intervals
var fps = 30;
var interval = 1000 / fps;

setInterval(function(){
	draw();
	ship.tick();
	ship.bounds(H,W);
}, interval);

// input is read with this speed
setInterval(actions, 1000 / 15);
