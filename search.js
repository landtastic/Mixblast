function handleAPILoaded() {
  $('#search-button').attr('disabled', false);
  $("#search-button").html('Search');
  //$('#playlist-button').attr('disabled', false);
  $("#playlist-button").html('Create a New Playlist');
}
//global arrays
var	topvIdArray = [];
var vidObjArray = {};
var searchArray = [];

function search(query,c) {
    var q = query;
    var request = gapi.client.youtube.search.list({
    q: q,
    part: 'snippet'
	//order: 'viewCount'
  });
  
  request.execute(function(response) {
	var searchObj = response.result;
	//these arrays will hold the top 5 results of each line
	var vIdArr=[], vTitleArr=[], vThumbArr=[];
	if (!searchObj) console.log('bad search: '+c);
	$.each(searchObj.items, function(i,x) {
		var vId = x.id.videoId;
		var vUrl = "http://www.youtube.com/watch?v=" + vId;
		var vTitle = x.snippet.title;
		var vThumb = x.snippet.thumbnails.default.url;
		if (vId==undefined) {
			var vId="Not Found",vTitle="Not Found. Click to edit search term: "+q,vThumb="img/notfound.png"; 
			var vUrl = "javascript:editSearchTerm(query,"+(c+1)+")";
		}

		vIdArr.push(vId);
		vTitleArr.push(vTitle);
		vThumbArr.push(vThumb);
		//global object of all the song results
		vidObjArray[c] = {
			'id':vIdArr, 
			'title':vTitleArr, 
			'thumb':vThumbArr
		};
		//display list, use only first result of each 
 		if (i == 0) {
			$( "#search-container" ).append("<div class='swapzone' id='"+c+"'><img src='img/refreshb.png' id='refreshb'></div><div id='thumbzone'><img id='thumb' src='"+ vThumb +"'> <a id='link' href='"+ vUrl + "' target='_blank'>" + vTitle + "</a></div>");
			//put top ids into global array
			topvIdArray.push(vId);
			c++;
		}
	});
  });
}
/*
$.when( search(query,c) ).done( function() {
	alert('callback')
} ); 
*/

var searchnum;
var allowAutoScroll = true, weScrollin = false;
function multiSearch() {
	//ready the playlist button
	$('#playlist-button').attr('disabled', false);
	//erase previous search
	$( "#search-container" ).html("");
	topvIdArray.length = 0;
	searchArray.length = 0;
	//split texarea into lines
	var lines = $('#query').val().split(/\n/);
	//only get non-whitespace lines, push into searchArray
	for (var i=0; i < lines.length; i++) {
	  if (/\S/.test(lines[i])) {
	    searchArray.push($.trim(lines[i]));
	  }
	}
	
	var x = 0;
	searchnum = searchArray.length;
	if (searchnum < 1) { alert('Put some search terms in the search box'); return false; }
	//use setInterval because it helps retain the order
	//var interval = setInterval(function() {
	//self-invoking function better than setInterval? 
	!function setInterval_afterDone(){
		//do search function
		search(searchArray[x],x);
		
		if (allowAutoScroll==true) window.scrollTo(0,document.body.scrollHeight);
		//if (allowAutoScroll==true) {
		//	$('html,body').animate({ scrollTop: $(document).height() }, 100); //careful, this locks the scrollbar if the speed is too high
			//console.log('wtf');
		//}
		weScrollin = true;
		x++;
		//if (x==searchnum+1) alert("Loop complete");
		var timerId = setTimeout(setInterval_afterDone, 300);
		if(x==searchnum) {
			//clearInterval(interval);
			clearTimeout(timerId);
			//scroll to bottom
			if (allowAutoScroll==true) var t=setTimeout(function(){window.scrollTo(0,document.body.scrollHeight)},700);
			//reset allowAutoScroll
			allowAutoScroll = true;
			weScrollin = false;
		}
	}();
	//}, 200);
		
}
//if user scrolls up, stop auto-scroll
var lastScrollTop = 0;
$(window).scroll(function(event){
   var st = $(this).scrollTop();
   //console.log('st:'+st);
   //console.log('last st:'+lastScrollTop);
   if (st > lastScrollTop){
       // downscroll 
   } else {
      if (weScrollin) allowAutoScroll = false;
   }
   lastScrollTop = st;
   //console.log('as:'+allowAutoScroll);
   //console.log('wescrollin:'+weScrollin);
});

//swap button
var swapcount = 1;
$('#search-container').delegate('div', 'click', function () {
	if (swapcount > 4) swapcount = 0;
	var thisid = this.id;
	//if user clicks in "thumbzone" it throws an error, so just change thisid to 0
	if (isNaN(thisid)) thisid = 0;
	var top5id = vidObjArray[thisid].id[swapcount];
	var top5url = "http://www.youtube.com/watch?v=" + top5id;
	if (top5id == "Not Found") var top5url = "javascript:editSearchTerm(query,"+(+thisid + 1)+")";
	var top5thumb = vidObjArray[thisid].thumb[swapcount];
	var top5title = vidObjArray[thisid].title[swapcount];
	$(this).next('#thumbzone').html('<img id="thumb" src="'+ top5thumb +'"> <a id="link" href="' + top5url + '" target="_blank">'+top5title+'</a>');

	//replace current searchterm in textarea
	var txtar = $('#query').val();
	var txtlines = txtar.split(/\n/);
	swapStr = txtlines[thisid];
	OGswapStr = searchArray[thisid];
	if (top5id == "Not Found") top5title = OGswapStr;
	txtar = txtar.replace(swapStr,top5title);
	$('#query').val(txtar);

	//replace current vId in global topvIdArray
	var index = topvIdArray.indexOf(topvIdArray[thisid]);
	if (index !== -1) {
		topvIdArray[index] = top5id;
	}
	swapcount++;
});

function readMultipleFiles(evt) {
    //retrieve all the files from the FileList object
    var files = evt.target.files;
	
    if (files) {
        for (var i = 0, f; f = files[i]; i++) {
            var r = new FileReader();
            r.onload = (function (f) {
                return function (e) {
                    var contents = e.target.result;
                    //alert(contents);
					var lines = contents.split("\n");
					var songArray = [];
					var songStr = '';
					//if it is an m3u, parse it
					if ($.trim(lines[0]) == '#EXTM3U') {
						//read every other line
						for (var i=1; i < lines.length; i+=2) {
							var songArray = lines[i].split(",");
							songStr = songStr + $.trim(songArray[1]) + "\n";
							//remove useless keywords
							songStr = songStr.replace("(DatPiff Exclusive)","");
							$("#query").val(songStr);
						}
					} else {
						$("#query").val(contents);
					}
                };
            })(f);
            r.readAsText(f);
        }
    } else {
        alert("Failed to load files");
    }
}
document.getElementById('fileinput').addEventListener('change', readMultipleFiles, false);


function editSearchTerm(tarea,lineNum) {
    lineNum--; // array starts at 0
    var lines = tarea.value.split("\n");
    // calculate start/end
    var startPos = 0, endPos = tarea.value.length;
    for(var x = 0; x < lines.length; x++) {
        if(x == lineNum) {
            break;
        }
        startPos += (lines[x].length+1);
    }
    var endPos = lines[lineNum].length+startPos;
    // do selection
    // Chrome / Firefox
    if(typeof(tarea.selectionStart) != "undefined") {
        tarea.focus();
        tarea.selectionStart = startPos;
        tarea.selectionEnd = endPos;
        return true;
    }
    // IE
    if (document.selection && document.selection.createRange) {
        tarea.focus();
        tarea.select();
        var range = document.selection.createRange();
        range.collapse(true);
        range.moveEnd("character", endPos);
        range.moveStart("character", startPos);
        range.select();
        return true;
    }
    return false;
	scrollToLine(tarea, lineNum);
}
function scrollToLine(tarea, lineNum) {
  var lineHeight = parseInt(tarea.css('line-height'));
  tarea.scrollTop(lineNum * lineHeight);      
}

//hide example text onfocus
$("#query")
  .focus(function() {
        if (this.value === this.defaultValue) {
            this.value = '';
        }
  })
  .blur(function() {
        if (this.value === '') {
            this.value = this.defaultValue;
        }
});
//yoyu'll have a blast
$('#haveablast').mouseover(function() {
	$('#videoprofessor').fadeIn();
	//console.log($('#videoprofessor').css('display') == 'none');
});
$('#haveablast').mouseout(function() {
	$('#videoprofessor').fadeOut();
	//console.log($('#videoprofessor').css('display') == 'none');
});

$(document).ready(function() {
	//email link
	var antiSpamString = "mixblaster"+"."+"webmaster"+"@"+"gma"+"il"+"."+"c"+"om";
	$( "#emailme" ).append("<a href='mai"+"lto:"+antiSpamString+"'>"+antiSpamString+"</a>");
	
	//hide playlist url until button is clicked
	$("#playlist-url").hide();
	
	$("#videoprofessor").click(function(){
		$("#videoprofessor").hide();
	});
});


!function(doc) {
	//set viewport for iphone and ipad
	var viewport = document.getElementById('viewport');
	if ( navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
		doc.getElementById("viewport").setAttribute("content", "initial-scale=0.48");
		$("#filee").hide();
		$("#logo").width("100%");
	} else if ( navigator.userAgent.match(/iPad/i) ) {
		doc.getElementById("viewport").setAttribute("content", "initial-scale=1.0");
		$("#filee").hide();
	}	
}(document);
