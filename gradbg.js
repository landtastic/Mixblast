document.addEventListener('DOMContentLoaded', function() {
    //!! written by paintbycode, not me
    //==============================================================
    //FUNCTION TO CREATE RANDOM INTEGER
    //==============================================================
    function getRandomInt(min, max) {
        return Math.floor((Math.random() * max) + min);
    }


    //==============================================================
    //CLICK FUNCTION TO LOAD NEW GRADIENT
    //==============================================================
    //document.querySelector(".change-gradient").addEventListener('click', function() {
    $( document ).ready(function() {
        //document.querySelector(".greeting").style.display = 'none';

        //==============================================================
        //FADE IN FUNCTION USED FOR GRADIENT & COLOUR OVERLAY INFO
        //==============================================================
        var gradBg = document.querySelector(".gradient-background");

        function fadeIn(el, ms) {
            var opacity = 0,
                interval = 10,
                gap = interval / ms;
            el.style.opacity = opacity;
            el.style.display = 'inline-block';

            function func() {
                opacity += gap;
                el.style.opacity = opacity;
                if (opacity >= 1) {
                    window.clearInterval(fading);
                }
            }
            var fading = window.setInterval(func, interval);
        }
        fadeIn(gradBg, 400);


        //==============================================================
        //RGB GENERATOR
        //==============================================================  
        //random 0 to 255 number for rgb values
        var redTop = getRandomInt(0, 255);
        var greenTop = getRandomInt(0, 255);
        var blueTop = getRandomInt(0, 255);
        var rgbTop = "rgb(" + redTop + "," + greenTop + "," + blueTop + ")";

        var redBottom = getRandomInt(0, 255);
        var greenBottom = getRandomInt(0, 255);
        var blueBottom = getRandomInt(0, 255);
        var rgbBottom = "rgb(" + redBottom + "," + greenBottom + "," + blueBottom + ")";
      
      
        //==============================================================
        //REVERSE RGB VALUE FOR CONTRAST TEXT COLOUR
        //==============================================================  
        //get the 'reverse' value for the displayed rgb value
        function reverseRgb(rgbValue) {
            var revRgbValue = 255 - rgbValue;
            return revRgbValue;
        }

        var reverseRedTop = reverseRgb(redTop);
        var reverseGreenTop = reverseRgb(greenTop);
        var reverseBlueTop = reverseRgb(blueTop);
        var reverseRgbTop = "rgb(" + reverseRedTop + "," + reverseGreenTop + "," + reverseBlueTop + ")";

        var reverseRedBottom = reverseRgb(redBottom);
        var reverseGreenBottom = reverseRgb(greenBottom);
        var reverseBlueBottom = reverseRgb(blueBottom);
        var reverseRgbBottom = "rgb(" + reverseRedBottom + "," + reverseGreenBottom + "," + reverseBlueBottom + ")";


        //==============================================================
        //CONVERT RGB TO HEX
        //==============================================================
        //convert rgb to hex
        function rgbToHex(rgbValue) {
            //convert passed number to hexadecimal
            var rgbConverted = rgbValue.toString(16);
            //prefix a "0" if required
            return rgbConverted.length == 1 ? "0" + rgbConverted : rgbConverted;
        };

        var redHexTop = rgbToHex(redTop);
        var greenHexTop = rgbToHex(greenTop);
        var blueHexTop = rgbToHex(blueTop);
        var hexTop = "#" + redHexTop + "" + greenHexTop + "" + blueHexTop;

        var redHexBottom = rgbToHex(redBottom);
        var greenHexBottom = rgbToHex(greenBottom);
        var blueHexBottom = rgbToHex(blueBottom);
        var hexBottom = "#" + redHexBottom + "" + greenHexBottom + "" + blueHexBottom;


        //==============================================================
        //CONVERT RGB TO HSL
        //==============================================================
        //function to convert rgb to hsl
        function rgbToHsl(r, g, b) {
                r /= 255, g /= 255, b /= 255;
                var max = Math.max(r, g, b),
                    min = Math.min(r, g, b);
                var h, s, l = (max + min) / 2;
                if (max == min) {
                    h = s = 0; // achromatic
                } else {
                    var d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r:
                            h = (g - b) / d + (g < b ? 6 : 0);
                            break;
                        case g:
                            h = (b - r) / d + 2;
                            break;
                        case b:
                            h = (r - g) / d + 4;
                            break;
                    }
                    h /= 6;
                }
                return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
            }
            //splice the returned value from the function into three
        var hslTop = rgbToHsl(redTop, greenTop, blueTop).slice(0, 3);
        var hueTop = hslTop[0];
        var saturationTop = hslTop[1];
        var lightnessTop = hslTop[2];

        //splice the returned value from the function into three
        var hslBottom = rgbToHsl(redBottom, greenBottom, blueBottom).slice(0, 3);
        var hueBottom = hslBottom[0];
        var saturationBottom = hslBottom[1];
        var lightnessBottom = hslBottom[2];


        //==============================================================
        //SETTING TEXT VALUES
        //==============================================================
        /*
        document.querySelector(".colour-info-top .rgb").textContent = rgbTop;
        document.querySelector(".colour-info-bottom .rgb").textContent = rgbBottom;
        document.querySelector(".colour-info-top .hex").textContent = hexTop;
        document.querySelector(".colour-info-bottom .hex").textContent = hexBottom;
        document.querySelector(".colour-info-top .hsl").textContent = "hsl(" + hueTop + "," + saturationTop + "%" + "," + lightnessTop + "%" + ")";
        document.querySelector(".colour-info-bottom .hsl").textContent = "hsl(" + hueBottom + "," + saturationBottom + "%" + "," + lightnessBottom + "%" + ")";
        */

        //==============================================================
        //SETTING COLOUR VALUES
        //==============================================================
        //set it so that if the buttons are at the bottom they are the bottom colours
/*
        document.querySelector(".change-gradient").style.backgroundColor = reverseRgbTop;
        document.querySelector(".change-gradient").style.color = rgbTop;
        
        document.querySelector(".info").style.backgroundColor = reverseRgbTop;
        document.querySelector(".info").style.color = rgbTop;
*/

        //document.querySelector("#search-button").style.backgroundColor = reverseRgbTop;
        //document.querySelector("#playlist-button").style.backgroundColor = reverseRgbTop;

        //==============================================================
        //SETTING THE MAIN GRADIENT
        //==============================================================
        document.querySelector(".gradient-background").style.backgroundImage = "linear-gradient(to bottom, " + rgbTop + "," + rgbBottom + ")";


        //==============================================================
        //SETTING BG TO BOTTOM COLOUR SO ITS NOT A JARRING FADE IN
        //==============================================================
        //bottom is used so that on ios devices the bottom colour shows
        //through the bottom menu bar for continuity
        document.querySelector("body").style.background = rgbBottom;




    });


});