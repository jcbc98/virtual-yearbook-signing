// Copyright 2010 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var canvas;
var context;

// Begin JCBC personalizations
var canvasWidth = 600;
var canvasHeight = 800;
var colorBlue = "blue";
var colorYellow = "#DAA520";
// End JCBC personalizations

var clickX = new Array();
var clickY = new Array();
var clickColor = new Array();
var clickDrag = new Array();
var paint = false;
var curColor = colorBlue;

// JCBC addition for saving the canvas as an image
var dataURL;

/**
* Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
*/
function prepareCanvas()
{
	// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
	var canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d", { alpha: false }); // Grab the 2d canvas context
	
	// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
	//     context = document.getElementById('canvas').getContext("2d");
	
	// Add mouse and touch events
	
	var press = function (e) {
		// Mouse down location
		var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft;
		var mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
		paint = true;
		addClick(mouseX, mouseY, false);
		redraw();
	};

	var drag = function (e) {
		var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft;
		var mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
				
		if (paint) {
			addClick(mouseX, mouseY, true);
			redraw();
		}
		// Prevent the whole page from dragging if on mobile
		e.preventDefault();
	};

	var release = function () {
		paint = false;
		redraw();
	};

	var cancel = function () {
		paint = false;
	};

	// Add mouse event listeners to canvas element
	canvas.addEventListener("mousedown", press, false);
	canvas.addEventListener("mousemove", drag, false);
	canvas.addEventListener("mouseup", release);
	canvas.addEventListener("mouseout", cancel, false);

	// Add touch event listeners to canvas element
	canvas.addEventListener("touchstart", press, false);
	canvas.addEventListener("touchmove", drag, false);
	canvas.addEventListener("touchend", release, false);
	canvas.addEventListener("touchcancel", cancel, false);
}

/**
* Adds a point to the drawing array.
* @param x
* @param y
* @param dragging
*/
function addClick(x, y, dragging)
{
	clickX.push(x);
	clickY.push(y);
	clickColor.push(curColor);
	clickDrag.push(dragging);
}

/**
* Clears the canvas.
*/
function clearCanvas()
{
	context.clearRect(0, 0, canvasWidth, canvasHeight);
}

/**
* Redraws the canvas.
*/
function redraw()
{
	clearCanvas();
	var i = 0;
	for(; i < clickX.length; i++)
	{		
		context.beginPath();
		context.lineWidth = 5;
		if(clickDrag[i] && i){
			context.moveTo(clickX[i-1], clickY[i-1]);
		}else{
			context.moveTo(clickX[i], clickY[i]);
		}
		context.lineTo(clickX[i], clickY[i]);
		context.closePath();
		context.strokeStyle = clickColor[i];
		context.lineJoin = "round";
		context.stroke();
		
	}
	context.restore();
	
	context.globalAlpha = 1; // No IE support
	
}


/**/


/** Begin JCBC Additions
*/
// Simple button toggling
function toggleColor(thebutton)
{
	if (curColor == colorBlue) {
		curColor = colorYellow;
		thebutton.value = "GOLDENROD";
	}
	else {
		curColor = colorBlue;
		thebutton.value = "BLUE";
	}
}
// Reset page back to beginning, as if reloaded
function startOver() {
	clickX = new Array();
	clickY = new Array();
	clickColor = new Array();
	clickDrag = new Array();
	paint = false;
	clearCanvas();
	var save_btn = document.getElementById('saveButton');
	save_btn.disabled = false;
	save_btn.value = "Save to gallery";
	var image_div = document.getElementById('imagefile');
	image_div.innerHTML = "";
}
// Save canvas to server-side image
function saveToGallery() {
	dataURL = canvas.toDataURL();
	var save_btn = document.getElementById('saveButton');
	save_btn.disabled = true;
	save_btn.value = "Saving...";
	$.ajax({
  		type: "POST",
 		url: "capture.php",
  		data: { 
     			imgBase64: dataURL
		},
		success: function(response){
			if (response.substr(0,6) == "images") {
				save_btn.value = "Saved!"
				var image_div = document.getElementById('imagefile');
				image_div.innerHTML = "<a href='"+response+"'>See your image</a>";
			} else {
				save_btn.value = "Unable to save. Please try again."
				save_btn.disabled = false;
			}
	        }
	      }
	);
}

/** End JCBC additions
*/
