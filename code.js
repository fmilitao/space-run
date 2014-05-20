
/*
 * SHIP
 */

var Ship = function(x,y){
	var p = { x:x, y:y };
	var v = { x:0, y:0 };
	var r = 0;
	var MAX_R = 16;
	var TWO_PI = 2*Math.PI;

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
	        	var size = (4+Math.random());
	        	var circ = Math.PI*2;
	        	ctx.arc(-4, 0, size, 0, circ, false);
				/*
				ctx.moveTo(-5, -4);
				ctx.lineTo(-5, 4);
				ctx.lineTo(-15, 0);
				*/
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
        }

		ctx.beginPath();
			ctx.moveTo(-4, -4);
			ctx.lineTo(-4, 4);
			ctx.lineTo(8, 4);
			ctx.lineTo(12, 0);
			ctx.lineTo(8, -4);
			ctx.lineJoin = 'miter';
		ctx.closePath();        
		
		/*
		ctx.beginPath();
			ctx.moveTo(-5, -5);
			ctx.lineTo(-5, 5);
			ctx.lineTo(15, 0);
			ctx.lineJoin = 'miter';
		ctx.closePath();
		*/
		
		ctx.lineWidth = 2;
		ctx.fillStyle = '#ff2020';
		ctx.fill();
		
		if( up && down )
			ctx.strokeStyle = 'yellow';
		else
			ctx.strokeStyle = '#ffbbbb';
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
    
    
    var power = null;
    this.powerBrake = function(isOn){
    	if( !isOn && power !== null ){
    		// apply boost
    		v.x = power*Math.cos( this.angle() );
        	v.y = power*Math.sin( this.angle() );
        	power = null;
        	
        	return;
    	}
    	
    	if( isOn ){
	    	if( power === null ){
	    		// power brake speed to remember
	    		power = Math.sqrt( Math.pow(v.x,2) + Math.pow(v.y,2) );
	    		power = Math.min( power, 200 );
	    	}
	        v.x *= 0.8;
	        v.y *= 0.8;
       	}
    };
    
    
    this.tick = function(){
        p.x = p.x + v.x*1/20;
	    p.y = p.y + v.y*1/20;
    };
    
    this.bounds = function(H,W){
		if( p.x < 0 ) p.x = W;
    	if( p.x > W ) p.x = 0;
    
    	if( p.y < 0 ) p.y = H;
    	if( p.y > H ) p.y = 0;
    };
    
    this.toString = function(){
    	return 'x: '+p.x.toFixed(2)+', y: '+p.y.toFixed(2);
    };

};
