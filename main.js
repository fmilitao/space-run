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


var W = window.innerWidth-4;
var H = window.innerHeight-4;

// override default canvas size
var parameters = document.URL.split('?');
if( parameters.length > 1 ){
	parameters = parameters[1].split('&');
	for( var i=0;i<parameters.length;++i ){
    	var tmp = parameters[i].split('=');
    	if( tmp.length > 1 ){
    		var option = tmp[0];
    		var value = tmp[1];
    		switch( option ){
    			case 'w':
    				W = parseInt(value);
    				break;
    			case 'h':
    				H = parseInt(value);
    				break;
    			default: // not other options for now.
    				break;
    		}
    	}
	}
}


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

var actors = [];

for( var i=0 ; i<150 ; ++i ){
	actors.push( new Star( Math.random()*W, Math.random()*H, Math.random()+1 ) );
}
actors.push( ship );

var draw = function() {

	// clean old frame
	ctx.fillStyle = "#222244";
	ctx.fillRect(0, 0, W, H);

	for( var i=0; i<actors.length; ++i ){
		actors[i].draw(ctx);
	} 

    // HUD elements
	ctx.save();
		var h = 8;

		ctx.fillStyle = "rgba(0,0,0,0.3)";
		ctx.fillRect(0, 0, W, h*1.5+4);

		ctx.font = h+'pt testFont';
		ctx.fillStyle = 'white';
		//ctx.strokeStyle = 'white';
		ctx.lineWidth = 1;
		
		//var txt = 'The time is: '+(new Date().toString());
		var txt = 'Player One ('+ship.toString()+')';
		//var m = ctx.measureText(txt);
		ctx.fillText(txt, 2, h*1.5+2);
		//ctx.strokeText(txt, 2, h);
	ctx.restore();

};

// animation intervals
var fps = 30;
var interval = 1000 / fps;

setInterval(function(){
	draw();
	
	var tmp = actors;
	actors = [];
	for( var i=0; i<tmp.length; ++i ){
		tmp[i].tick(H,W);
		if( !tmp[i].dead() )
			actors.push( tmp[i] );
	}
	
}, interval);

// input is read with this speed
setInterval(actions, 1000 / 15);
