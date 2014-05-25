
var PI = Math.PI;
var TWO_PI = 2*Math.PI;
var Random = Math.random;

// CONSTANTS
var MAX_R = 32;
var MAX_POWER = 150;
var MAX_SPEED = 250;
var FIRE = 5;
var BRAKE = 0.8;

var SMOKE_COLOR = ['rgba(37,37,37,','rgba(21,21,21,'];
var SMOKE_F = 0.99;
var SMOKE_MAX = 5;

var GUE_F = 0.95;
var GUE_MAX = 30;
var GUE_COLOR = 'rgba(0,255,0,';

var CHECKPOINT_MAX = 9.99;
var CHECKPOINT_R = 30;

/*
 * Utils
 */

var fix = function(str,length){
	var tmp = str;
	while (tmp.length < length) {
    	tmp = ' ' + tmp;
	}
	return tmp;
};

var drawMissile = function(ctx){
	ctx.beginPath();
		ctx.moveTo(-4, -4);
		ctx.lineTo(-4, 4);
		ctx.lineTo(8, 4);
		ctx.lineTo(12, 0);
		ctx.lineTo(8, -4);
		ctx.lineJoin = 'miter';
	ctx.closePath();   	
};

var drawTriangle = function(ctx){
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

var Ship = function(x,y){

    var power = null;
	var p = { x:x, y:y };
	var v = { x:0, y:0 };
	var r = 0;

	this.getVel = function(){
		return Math.sqrt( Math.pow(v.x,2) + Math.pow(v.y,2) );
	};
	
	this.setVel = function(p){
		v.x = p*Math.cos( this.angle() );
        v.y = p*Math.sin( this.angle() );
   	};
    
    this.angle = function(){
		return TWO_PI/MAX_R*r;
	};
    
    this.draw = function(ctx){
        ctx.save();
		
		ctx.translate( p.x, p.y );
		ctx.rotate( this.angle() );
		
		//if engines on
        if( up && !down ){
        	ctx.save();
	        	ctx.beginPath();
				/*
	        	var size = (4+Math.random());
	        	var circ = Math.PI*2;
	        	ctx.arc(-4, 0, size, 0, circ, false);
				*/
				ctx.moveTo(-5, -4);
				ctx.lineTo(-5, 4);
				ctx.lineTo(-14-(Random()*2), 0);
				ctx.closePath();
				/*
				var gradient = ctx.createRadialGradient(-4,0,0,-4,0,size);
				gradient.addColorStop(0.4, "blue");
				//gradient.addColorStop(0.4, p.color);
				gradient.addColorStop(1, "white");
				ctx.fillStyle = gradient;
				*/
				ctx.fillStyle = "rgba(256, 236, 80, "+(Random()*0.5+0.5)+")";
				ctx.fill();
            ctx.restore();
            
            var xx = p.x-(Math.cos(this.angle())*17);
            var yy = p.y-(Math.sin(this.angle())*17);
            actors.push( new Smoke(xx,yy,Math.cos(this.angle()),Math.sin(this.angle())) );

        }

		drawTriangle(ctx);     
		
		ctx.fillStyle = '#ff2020';
		ctx.fill();
		
		if( up && down ){
			ctx.lineWidth = 4;
			ctx.lineJoin = 'round';
			ctx.strokeStyle = "rgba(80, 236, 256, "+(Random()*0.6+0.4)+")";
		}
		else{
			if( down ){
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
    };
    
    //controls
    this.left  = function() { r = (r-1) % MAX_R; };
    this.right = function() { r = (r+1) % MAX_R; };

    this.fire = function() {
        v.x += FIRE*Math.cos( this.angle() );
        v.y += FIRE*Math.sin( this.angle() );
        
        // when reaches limit starts to friction
        if( this.getVel() > MAX_SPEED ){
        	v.x *= 0.95;
        	v.y *= 0.95;
        }
    };
    
    this.brake = function(){
        v.x *= BRAKE;
        v.y *= BRAKE;
    };
    
    
    this.powerBrake = function(isOn){
    	if( !isOn && power !== null ){
    		// apply boost
        	this.setVel( power );
        	power = null;
        	return;
    	}
    	
    	if( isOn ){
	    	if( power === null ){
	    		// power brake speed to remember
	    		power = this.getVel();
	    		power = Math.min( power, MAX_POWER );
	    	}
	        this.brake();
       	}
    };
    
    
    this.tick = function(t,H,W){
        p.x = p.x + v.x*t;
	    p.y = p.y + v.y*t;
	    
	    this.bounds(H,W);
    };
    
    this.bounds = function(H,W){
		if( p.x < 0 ) p.x = W;
    	if( p.x > W ) p.x = 0;
    
    	if( p.y < 0 ) p.y = H;
    	if( p.y > H ) p.y = 0;
    };
    
    this.toString = function(){
    	var xx = (p.x).toFixed(1);
    	var yy = (p.y).toFixed(1);
    	var vv = this.getVel().toFixed(1);
		var pp = power !== null ? '('+power.toFixed(1)+')':''; 
    	return 'pos=('+fix(xx,6)+', '+fix(yy,6)+') vel='+fix(vv,6)+' '+pp;
    };

	this.dead = function(){
		return false;
	};
	
	this.collision = function(s){
		
	};
	
	this.radius = 7;
};


var Smoke = function(x,y,vx,vy){
	var p = { x: x+((Random()*5)-2), y: y+((Random()*5)-2) };
	var v = { x: (Random()*10+5)*vx, y: (Random()*10+5)*vy };
    var c = SMOKE_COLOR[Math.floor(Random()*SMOKE_COLOR.length)];
    var t = SMOKE_MAX;
    
    this.dead = function() {
		return t <= 0;
	}
    
    this.draw = function(ctx) {
        var size = 15-12*(t/SMOKE_MAX);
        
        ctx.save();
	        ctx.beginPath();
			ctx.arc(p.x, p.y, size,0, TWO_PI, false);
			ctx.fillStyle = c+(t/SMOKE_MAX+0.1)+')';
			ctx.fill();
			ctx.closePath();
		ctx.restore();
    };
    
    this.tick = function(time){
        t -= time;
        p.x = p.x + v.x*time;
	    p.y = p.y + v.y*time;
	    v.x *= SMOKE_F;
	    v.y *= SMOKE_F;
    };
    
    this.collision = function(s){
		
	};

};


var CheckPoint = function(){
	var t = CHECKPOINT_MAX;
	var x = Random()*(W-CHECKPOINT_R);
	var y = Random()*(H-CHECKPOINT_R);
	
	this.dead = function() {
		return t <= 0;
	}
	
	this.draw = function(ctx) {
        ctx.save();
	        ctx.beginPath();
			ctx.arc(x, y, CHECKPOINT_R, 0, TWO_PI, false);

			ctx.lineWidth = 3*(1-(t/CHECKPOINT_MAX))+1;
			ctx.strokeStyle = 'rgba(255,0,0,'+(1-(t/CHECKPOINT_MAX))+')';
			ctx.fillStyle = 'rgba(255,0,0,'+( t/CHECKPOINT_MAX)+')';
			ctx.fill();
			ctx.stroke();
			
			ctx.fillStyle = 'white';
			var text = t.toFixed(1);
			ctx.fillText( text, 
					x-ctx.measureText(text).width/2,
					y+(FONT_H*1.5)/2 );
		ctx.restore();
		

    };
    
    this.tick = function(time){
//XXX COLLISION!
        t -= time;
        
        if( this.dead() ){
        	actors.push( new CheckPoint() );
        	
        	var gues = Random()*4+4;
        	while( gues-- > 0 )
        		actors.push( new Gue(x,y) );
        }
    };
    
    this.collision = function(s){
	//	var d = Math.sqrt( Math.pow((s.x-x),2) + Math.pow((s.y-y),2) );
//		if( d < r+s.r )
			// collides
	};
    
};


var Gue = function(x,y){
	var angle = TWO_PI*Random();
	var p = { x: x, y: y };
	var v = { x: Math.cos(angle)*15, y: Math.sin(angle)*15 };
	
    var t = GUE_MAX;
    var s = Math.random()*20+10;
    
    this.dead = function() {
		return t <= 0;
	}
    
    this.draw = function(ctx) {
        var size = s-10*(t/GUE_MAX);
        
        ctx.save();
	        ctx.beginPath();
			ctx.arc(p.x, p.y, size,0, TWO_PI, false);
			ctx.fillStyle = GUE_COLOR+(t/GUE_MAX)+')';
			ctx.fill();
			ctx.closePath();
		ctx.restore();
    };
    
    this.tick = function(time){
        t -= time;
        p.x = p.x + v.x*time;
	    p.y = p.y + v.y*time;
	    v.x *= GUE_F;
	    v.y *= GUE_F;
    };
    
      this.collision = function(s){
//XXX COLLISION!

	//	var d = Math.sqrt( Math.pow((s.x-x),2) + Math.pow((s.y-y),2) );
//		if( d < r+s.r )
			// collides
	};

};


/*
			if( this.getVel() > 50 ){
				actors.push( new Spark(xx,yy,this.angle()-Math.PI) );	
			}
*/

/*
var Spark = function(x,y,angle){
	var p = { x: x+((Math.random()*5)-2), y: y+((Math.random()*5)-2) };
	var v = { x: Math.cos(angle)*10, y: Math.sin(angle)*10 };
    var f = 0.99;
    //var c = 'green';
    var t = 0.5;
    
    this.dead = function() {
		return t <= 0;
	}
    
    this.draw = function(ctx) {
        var size = 15-12*(t/T_MAX);
        
        ctx.save();
	        ctx.beginPath();
			ctx.arc(p.x, p.y, 1,0, TWO_PI, false);
			ctx.closePath();

			ctx.lineWidth = 3;
			ctx.strokeStyle = 'rgba(255,255,255,0.2)';
			ctx.fillStyle = 'yellow';
			ctx.fill();
			ctx.stroke();
		ctx.restore();
		

    };
    
    this.tick = function(){
        t -= 1/20;
        p.x = p.x + v.x*1/20;
	    p.y = p.y + v.y*1/20;
	    v.x *= f;
	    v.y *= f;
    };

};
*/