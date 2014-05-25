
var TWO_PI = 2*Math.PI;

var fix = function(str,length){
	var tmp = str;
	while (tmp.length < length) {
    	tmp = ' ' + tmp;
	}
	return tmp;
};

/*
 * Shapes
 */

var drawMissile = function(ctx){
	ctx.beginPath();
		ctx.moveTo(-4, -4);
		ctx.lineTo(-4, 4);
		ctx.lineTo(8, 4);
		ctx.lineTo(12, 0);
		ctx.lineTo(8, -4);
		ctx.lineJoin = 'miter';
	ctx.closePath();   	
}

var drawTriangle = function(ctx){
	ctx.beginPath();
		ctx.moveTo(-5, -5);
		ctx.lineTo(-5, 5);
		ctx.lineTo(15, 0);
		ctx.lineJoin = 'miter';
	ctx.closePath();	
}

/*
var drawViper = function(ctx){	 	
	ctx.beginPath();
		ctx.lineJoin = 'miter';
		ctx.moveTo(-5, 5);
		ctx.lineTo( 0, 5);
		ctx.lineTo(10, 0);
		ctx.lineTo( 0, -5);
		ctx.lineTo(-5, -5);
		ctx.lineTo(-5, 5);

		ctx.moveTo(-5, -15);
		ctx.lineTo(-5, 15);
		ctx.lineTo(25, 0);
	ctx.closePath();  
} */

/*
 * Actors
 */

var Ship = function(x,y){
	var MAX_R = 32;
	var MAX_POWER = 150;
	var MAX_SPEED = 250;
	var FIRE = 5;
	var BRAKE = 0.8;

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
				ctx.lineTo(-14-(Math.random()*2), 0);
				ctx.closePath();
				/*
				var gradient = ctx.createRadialGradient(-4,0,0,-4,0,size);
				gradient.addColorStop(0.4, "blue");
				//gradient.addColorStop(0.4, p.color);
				gradient.addColorStop(1, "white");
				ctx.fillStyle = gradient;
				*/
				ctx.fillStyle = "rgba(256, 236, 80, "+(Math.random()*0.5+0.5)+")";
				ctx.fill();
            ctx.restore();
            
            var xx = p.x-(Math.cos(this.angle())*17);
            var yy = p.y-(Math.sin(this.angle())*17);
            actors.push( new Smoke(xx,yy,Math.cos(this.angle()),Math.sin(this.angle())) );

/*
			if( this.getVel() > 50 ){
				actors.push( new Spark(xx,yy,this.angle()-Math.PI) );	
			}
*/

        }

		drawTriangle(ctx);     
		
		ctx.fillStyle = '#ff2020';
		ctx.fill();
		
		if( up && down ){
			ctx.lineWidth = 4;
			ctx.lineJoin = 'round';
			ctx.strokeStyle = "rgba(80, 236, 256, "+(Math.random()*0.6+0.4)+")";
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
    
    
    var power = null;
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
	        v.x *= 0.8;
	        v.y *= 0.8;
       	}
    };
    
    
    this.tick = function(H,W){
        p.x = p.x + v.x*1/20;
	    p.y = p.y + v.y*1/20;
	    
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
	}
};

var SMOKE_COLOR0 = 'rgba(37,37,37,';
var SMOKE_COLOR1 = 'rgba(21,21,21,';
var T_MAX = 5;

var Smoke = function(x,y,vx,vy){
	var p = { x: x+((Math.random()*5)-2), y: y+((Math.random()*5)-2) };
	var v = { x: (Math.random()*10+5)*vx, y: (Math.random()*10+5)*vy };
    var f = 0.99;
    var c = Math.random() > 0.5 ? SMOKE_COLOR0 : SMOKE_COLOR1;
    var t = T_MAX;
    
    this.dead = function() {
		return t <= 0;
	}
    
    this.draw = function(ctx) {
        var size = 15-12*(t/T_MAX);
        
        ctx.save();
	        ctx.beginPath();
			ctx.arc(p.x, p.y, size,0, TWO_PI, false);
			ctx.fillStyle = c+(t/T_MAX+0.1)+')';
			ctx.fill();
			ctx.closePath();
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

var C_MAX = 9.99;
var CheckPoint = function(){
	var t = C_MAX;
	var r = 30;
	var x = Math.random()*(W-r)+r;
	var y = Math.random()*(H-r)+r;
	
	this.dead = function() {
		return t <= 0;
	}
	
	this.draw = function(ctx) {
        ctx.save();
	        ctx.beginPath();
			ctx.arc(x, y, r, 0, TWO_PI, false);

			ctx.lineWidth = 3*(1-(t/C_MAX))+1;
			ctx.strokeStyle = 'rgba(255,0,0,'+(1-(t/C_MAX))+')';
			ctx.fillStyle = 'rgba(255,0,0,'+( t/C_MAX)+')';
			ctx.fill();
			ctx.stroke();
			
			ctx.fillStyle = 'white';
			var text = t.toFixed(1);
			ctx.fillText( text, 
					x-ctx.measureText(text).width/2,
					y+(FONT_H*1.5)/2 );
		ctx.restore();
		

    };
    
    this.tick = function(){
//XXX COLLISION!
        t -= 1/20;
        
        if( this.dead() ){
        	actors.push( new CheckPoint() );
        	
        	var gues = Math.random()*4+4;
        	while( gues-- > 0 )
        		actors.push( new Gue(x,y) );
        }
    };
    
};

var G_MAX = 30;
var Gue = function(x,y){
	var angle = TWO_PI*Math.random();
	var p = { x: x, y: y };
	var v = { x: Math.cos(angle)*15, y: Math.sin(angle)*15 };
    var f = 0.95;
    var c = 'green';
    var t = G_MAX;
    var s = Math.random()*20+10;
    
    this.dead = function() {
		return t <= 0;
	}
    
    this.draw = function(ctx) {
        var size = s-10*(t/G_MAX);
        
        ctx.save();
	        ctx.beginPath();
			ctx.arc(p.x, p.y, size,0, TWO_PI, false);
			ctx.fillStyle = 'rgba(0,255,0,'+(t/G_MAX)+')';
			ctx.fill();
			ctx.closePath();
		ctx.restore();
    };
    
    this.tick = function(){
//XXX COLLISION!

        t -= 1/20;
        p.x = p.x + v.x*1/20;
	    p.y = p.y + v.y*1/20;
	    v.x *= f;
	    v.y *= f;
    };

};

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