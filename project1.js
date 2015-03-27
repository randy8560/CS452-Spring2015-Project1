/*
	Randy Parisi
	Project1
	Description: 2d shape game
*/

var canvas;
var gl;

var NumVertices  = 3;
var NumVerticesObject  = 4;

var points = [];
var colors = [];

var xpos = -.25;
var ypos = -.25;

var xO = [];
var yO = [];
var tmpX;
var tmpY;
var yTimer = -1;

var d = new Date();
var n = d.getTime();

var pressCounter = 0;
var pressCounterMax = 8;

var targets = 4;

var triBuffer;
var cubeBuffer;

var cBuffer
var cBuffer2

var program;

var translationMat4Player = mat4(); 
var translationMat4Object = mat4(); 

//Need to add a check for duplicates
function numGen(){
	for(var i = 0; i < 4; i++){
		tmpX = ((Math.floor(Math.random(n) * 4) + 1) / 2) - 1.25;
		tmpY = ((Math.floor(Math.random(n) * 4) + 1) / 2) - 1.25;
		
		//Prevent from spawning on player
		while(tmpX == xpos && tmpY == ypos){
			tmpX = ((Math.floor(Math.random(n) * 4) + 1) / 2) - 1.25;
			tmpY = ((Math.floor(Math.random(n) * 4) + 1) / 2) - 1.25;
		}
		
		xO[i] = tmpX;
		yO[i] = tmpY;
	}
}

function startTimer () {
    setTimeout(stopTimer,10);
}

function stopTimer () {
	yTimer += .012;
	startTimer();
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
    //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	startTimer();
	
	translationMat4Player = translate(xpos,ypos,0);

	//Keys
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	
	numGen();
	
	//Triangle and Colors
    points = new Float32Array([-.25, -.25,0,1, 0, .25, 0,1,.25, -.25,0,1]);
	//points = new Float32Array([-.5, -.5,0,1, -.25, 0, 0,1,0, -.5,0,1]);
	colors = new Float32Array([1,0,0,1,0,0,1,0,0,1,0,0]);
	
	//Cube and Colors
	pointsObj = new Float32Array([-.5/8, -.5/8,0,1,
										     .5/8,-.5/8, 0,1,
											 .5/8,.5/8,0,1,
											 -.5/8,.5/8,0,1]);
	colorsObj = new Float32Array([.58,.76,.3,.58,.76,.3,.58,.76,.3,.58,.76,.3]);
											 
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
	//Triangle
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    triBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, triBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


	//Cube
    cBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsObj), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    cubeBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsObj), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	translationMat4z = gl.getUniformLocation(program, "translationMatrix"); 

    render();
}

  var filter = 0;
    var currentlyPressedKeys = {};
    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
		if(yTimer <= 1){
			if (String.fromCharCode(event.keyCode) == "A") {
				xpos -= .5;
			}
			if (String.fromCharCode(event.keyCode) == "D") {
				xpos += .5;
			}
			if (String.fromCharCode(event.keyCode) == "W") {
				ypos += .5;
			}
			if (String.fromCharCode(event.keyCode) == "S") {
				ypos -= .5;
			}
			if (String.fromCharCode(event.keyCode) == "1") {
				xpos = 0;
				ypos = 0;
			}
			pressCounter++;
			CheckPos();
		}
		//Restrict Position
		xpos = xpos > .75 ? xpos = .75 : xpos = xpos;
		xpos = xpos < -.75 ? xpos = -.75 : xpos = xpos;
		ypos = ypos > .75 ? ypos = .75 : ypos = ypos;
		ypos = ypos < -.75 ? ypos = -.75 : ypos = ypos;
    }
	
    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }

	function CheckPos(){
		for(var i = 0; i < 4; i++){
			if(xpos == xO[i] && ypos == yO[i]){
				xO[i] = -2;
				yO[i] = -2;
				targets--;
			}
		}
	}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT);
	
	//Player
	translationMat4Player = translate(xpos,ypos,0);
	gl.uniformMatrix4fv(translationMat4z,false,flatten(translationMat4Player));
	gl.bindBuffer( gl.ARRAY_BUFFER, triBuffer );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
	gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	
	//Timer
	translationMat4Object = translate(1,yTimer,0);
	gl.uniformMatrix4fv(translationMat4z,false,flatten(translationMat4Object));
	gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer2 );
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
	
	gl.drawArrays( gl.TRIANGLE_FAN, 0, NumVerticesObject );	
	
	//Need to generalize for randomness
	for(var i = 0; i < 4; i++)
	{
		translationMat4Object = translate(xO[i],yO[i],0);
		gl.uniformMatrix4fv(translationMat4z,false,flatten(translationMat4Object));
		gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
		var vPosition = gl.getAttribLocation( program, "vPosition" );
		gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer2 );
	    var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );
		
		gl.drawArrays( gl.TRIANGLE_FAN, 0, NumVerticesObject );
	}

    requestAnimFrame( render );
}

