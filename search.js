var vidObjArray = {};
var prev_vidObjArray = {};
var	topvIdArray = [], topvTitleArray=[], topvThumbArray=[];
var searchArray = [];
var vidcount = 0;
var searchcount = 0;

function onPlayerReady() {
	$("#search-button").html('Blast a Mix');
}
function onPlayerError(event){
     console.log('Error: '+event.data);
}
function onPlayerStateChange(event) {
	if (event.data != 1) {
        $("#playpb").attr("src","img/media_play.png");
    } else {
        $("#playpb").attr("src","img/media_pause.png");
    }
	/*
	(function titleMarquee() {
	    document.title = documentTitle = documentTitle.substring(1) + documentTitle.substring(0,1);
	    setTimeout(titleMarquee, 200);
	})();*/
	//if video is done, play next
    if(event.data === 0) {
    	//vidcount++;
		//ytPlayer.loadVideoById(topvIdArray[vidcount]);
		nextVideo(true);
    }
}

function handleAPILoaded() {
  gapi.client.setApiKey('AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM');
  $("#playlist-button").html('Save a Playlist');
  $('#search-button').attr('disabled', false);
  onYouTubeIframeAPIReady_removed_callback();
}

//change the name of this function so iframe api doesn't callback
function onYouTubeIframeAPIReady_removed_callback() {
    ytPlayer = new YT.Player('ytPlayer', { 
    	height: '368',
    	width: '600',
    	//videoId: 'Oi1BcouEmio',
    	videoId: 'fgBLu387UM8',
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onPlayerStateChange
        }
    });
}

function search(query,c) {

    var q = query;
    var c = c;

    var request = gapi.client.youtube.search.list({
    q: q,
    part: 'snippet',
    maxResults: 20
	//order: 'viewCount'
  });
  
  request.execute(function(response) {
	var searchObj = response.result;
	//these arrays will hold the top 20 results of each one in the loop
	var vIdArr=[], vTitleArr=[], vThumbArr=[];
	if (!searchObj) {return; console.log('bad search: '+c);} 

	$.each(searchObj.items, function(i,x) {
		var vId = x.id.videoId;
		var vTitle = x.snippet.title;
		var vThumb = x.snippet.thumbnails.default.url;
		if (vId==undefined) {
			var vId="Not Found",vTitle="Not Found. Try song reload button or edit search term: "+q,vThumb="img/notfound.png"; 
		}

		vIdArr.push(vId);
		vTitleArr.push(vTitle);
		vThumbArr.push(vThumb);
		//global object of all the song results
		vidObjArray[c] = {
			'vid':vIdArr,
			'title':vTitleArr, 
			'thumb':vThumbArr
		};

		//display list, use only first result of each
		if (i == 0) {
			renderPlaylist(c,vThumb,vId,vTitle);
			
			//put top ids into global array
			topvIdArray.push(vId);	
			topvTitleArray.push(vTitle);
			topvThumbArray.push(vThumb);
			//start the first video right away while the playlist loads
			//if ((topvIdArray.length > 0) && (c == 0) && (ready2search == true)) {
			if (topvIdArray.length == 1) {
				//console.log(ytPlayer);
				if (searchcount==1) cuePlayer();
			} 

			c++;
		}
	});
  });    
}

function cuePlayer() {
	var i = add();
	//check if the ytPlayer object is loaded
	//if ($("#ytPlayer").is("iframe")) {
	if (ytPlayer.cueVideoById) {
		ytPlayer.cueVideoById(topvIdArray[0]);
		//console.log('heyyyy, it\'s a frame.'+i)
	} else {
		//check for it 5x if it isn't
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		if (i < 5) {
			onYouTubeIframeAPIReady();
			setTimeout(function(){ cuePlayer(); },1000);
    		console.log('checking...'+i)
    		i++;
    	}
	}
}

var add = (function () {
    var counter = 0;
    return function () {return counter += 1;}
})();

var searchnum;
function multiSearch() {

	//hide text form
	$("#text-container" ).toggle();
	//show video player
	$('#player-container').toggle();
	//erase previous search
	$( "#search-container" ).empty();
	topvIdArray.length = 0; topvTitleArray.length = 0; topvThumbArray.length = 0;
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
	if (searchnum < 1) { alert('Put a list of songs in the search box');editSearchTerm(0); return false; }

	(function setInterval_afterDone(){

		/* do search function */
		search(searchArray[x],x);
		
		x++;
		
		//if(ready2search==true) waittime = 300; //wait for player to animate in
		
		var waittime = 300; 
		var timerId = setTimeout(setInterval_afterDone, waittime);
		if(x==searchnum) {
			//ready the playlist button
			$('#playlist-button').attr('disabled', false);
			clearTimeout(timerId);
		}
	})();
	searchcount++;
}

function renderPlaylist(c,vThumb,vId,vTitle) {

	//var vclick = 'ytPlayer.loadVideoById('+vId+'\');vidcount='+c+';renderEntirePlaylistFromIndex('+c+',\''+vThumb+'\',\''+vId+'\',\''+vTitle+'\');'
	var vclick = "ytPlayer.loadVideoById(\""+vId+"\"); vidcount="+c+";"
	//console.log(vclick);
	if (vId == "Not Found") var vclick = "editSearchTerm(0);";
	//vidcount = c;
	$("#search-container").append("<div class='searchresult'><img src='img/refreshb.png' class='refreshb' id='"+c+"' alt='Version Swap'><img id='thumb' src='"+ vThumb +"'> <a id='link' onclick='"+ vclick + "' title='"+ vTitle +"'>" + vTitle + "</a><input id='swapcount' type='hidden' value='1'></div>");
}

function renderEntirePlaylistFromIndex(){
	$("#search-container").empty();

	var vidindex = topvIdArray.length;
	var numlistarr = [];
	for (var i = 0; i < vidindex; i++) {
    	numlistarr.push(i);
	}
	var newArray = [];

	var i = vidcount;//Math.ceil(array.length/2);
	//console.log(numlistarr);
	var j = i - 1;

	while (j >= 0)
	{
	    newArray.push(numlistarr[j--]);
	    if (i < numlistarr.length) newArray.push(numlistarr[i++]);
	}

	//console.log(newArray.length + " items: " + newArray.toString());

	for (var c = 0; c < newArray.length; c++) {
		var newnum = newArray[c];
		renderPlaylist(c,vidObjArray[c].thumb[newnum],vidObjArray[c].vid[newnum],vidObjArray[c].title[newnum]);
	}

}

$("#prevbutton").click(function(){
	nextVideo(false); //back
});

$("#playpause").click(function(){
    playPause();
});

function playPause() {
	if (ytPlayer.getPlayerState() != 1) {
         ytPlayer.playVideo();
         $("#playpb").attr("src","img/media_pause.png");
    } else {
        ytPlayer.pauseVideo();
        $("#playpb").attr("src","img/media_play.png");
    }
}

$("#nextbutton").click(function(){
	nextVideo(true);
});

function nextVideo(next) {

	var totalvids = topvIdArray.length;
	if (next==true) {
		vidcount++; 
		if (vidcount >= totalvids) vidcount = 0;
		$('#search-container').append($('#search-container div:first'));
	} else { 
		vidcount--;
		if ((vidcount < 0) || (vidcount=='undefined')) vidcount = totalvids-1;
		$('#search-container').prepend($('#search-container div:last'));
	}
	swapper = 1;
	var thevideoid = topvIdArray[vidcount];
	ytPlayer.loadVideoById(thevideoid);
	if (topvTitleArray[vidcount]) document.title = topvTitleArray[vidcount] +' - Mixblast';
}

$("#shufflebutton").click(function(){

	$("#search-container").empty();
	if (searchcount>1) vidcount = 0;

	var shuffleindex = topvIdArray.length;
	//random array of numbers to use as keys
	var numlist = [];
	for (var i = 0; i < shuffleindex; i++) {
    	numlist.push(i);
	}
	var shuffled_idArr = shuffle(numlist);

	//copy video object, create previous copy
	if ($.isEmptyObject(prev_vidObjArray)) {
		prev_vidObjArray = jQuery.extend(true, {}, vidObjArray);
		//console.log('new prev obj:'+prev_vidObjArray);
	}
	
	topvIdArray.length = 0;

	for (var c = 0; c < shuffleindex; c++) {
		var randumb_num = shuffled_idArr[c];

		topvIdArray.push(prev_vidObjArray[randumb_num].vid[0]);
		topvTitleArray.push(prev_vidObjArray[randumb_num].title[0]);
		topvThumbArray.push(prev_vidObjArray[randumb_num].thumb[0]);

		renderPlaylist(c,prev_vidObjArray[randumb_num].thumb[0],prev_vidObjArray[randumb_num].vid[0],prev_vidObjArray[randumb_num].title[0]);

		for (var xx = 0; xx < prev_vidObjArray[0].vid.length; xx++) { 
			vidObjArray[c] = {
			'vid': prev_vidObjArray[randumb_num].vid,
			'title': prev_vidObjArray[randumb_num].title, 
			'thumb': prev_vidObjArray[randumb_num].thumb
			};
		}
	}

});
function shuffle(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var swapper = 1; //next song
$("#wrongsong").click(function(){
	if (swapper > 19) swapper = 0;
	ytPlayer.loadVideoById(vidObjArray[vidcount].vid[swapper]);
	swapper++;
});

//song refresh button
$('#search-container').on('contextmenu click', '.refreshb', function(event) {

    var thisid = this.id;
    //var swapcount = $(this).parent().closest('input[id=swapcount]').val();
    var swapcount = $(this).nextAll('#swapcount').val();
    var swaplen = vidObjArray[thisid].vid.length;
    //console.log('swaplen:'+swaplen);
    if (swapcount > swaplen-1) swapcount = 0;

	var top5id = vidObjArray[thisid].vid[swapcount];
	var top5click = "ytPlayer.loadVideoById('"+top5id+"');vidcount="+thisid;

	if ((top5id == "Not Found") || (top5id == undefined)) var top5click = "editSearchTerm("+thisid+");";
	var top5thumb = vidObjArray[thisid].thumb[swapcount];
	var top5title = vidObjArray[thisid].title[swapcount];
	
	if( event.button == 2 ) { 
	  swapcount--;
	  if (swapcount < 0) swapcount = swaplen-1;
	  event.preventDefault();
	} else {
	  swapcount++;
	}

	console.log(swapcount);
	$(this).parent().html('<img src="img/refreshb.png" class="refreshb" id="'+thisid+'"><img id="thumb" src="'+top5thumb+'"> <a id="link" onclick="'+top5click+'" title="'+top5title+'">'+top5title+'</a><input id="swapcount" type="hidden" value="'+swapcount+'">');

	//replace current vId in global topvIdArray
	var index = topvIdArray.indexOf(topvIdArray[thisid]);
	if (index !== -1) {
		topvIdArray[index] = top5id;
	}
});


$("#editplaylist").click(function(){
	editSearchTerm(0);
});
$(".closebutton").click(function(){
	$("#text-container" ).slideToggle();
	$('#player-container').slideToggle();
});

$(document).keydown(function(e) {
	if($("input,textarea").is(":focus")) return; 
    switch(e.which) {
        case 37: nextVideo(false);// left
        break;

        case 192: editSearchTerm(0);// `
        return;

        case 39: nextVideo(true);// right
        break;

        case 32: playPause();// space
        e.preventDefault();
        break;

        default: return; // exit this handler for other keys
    }
    //e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).ready(function() {
	//email link
	var antiSpamString = "mixblaster"+"."+"webmaster"+"@"+"gma"+"il"+"."+"c"+"om";
	$( "#emailme" ).append("<a href='mai"+"lto:"+antiSpamString+"'>"+antiSpamString+"</a>");
	
	//hide playlist url until button is clicked
	$("#playlist-url").hide();
	$(".closebutton").hide();

	//load query 2 for manipulating text
	$("#query2").val($("#query").val());

 	//autosave
	// Retrieve the object from storage onReady
	var autosave = localStorage.getItem('mixfile');
	// parses the string (btw. its UTF-8)
	var mixtext = JSON.parse(autosave);
	//modifies the textarea with the id="inputTextArea" 
	$("#query").val(mixtext);
	// Autosave on keystroke works in offline mode
	//$("#query").change (function(){  //this worked for textarea
	$("#query").blur(function() {
		 // pulls the value from the textarea (made it global var)
	 	mixfile = $('#query').val();
	 	// sets the file string to hold the data
	 	localStorage.setItem('mixfile', JSON.stringify(mixfile));
	 	console.log(mixfile);
	});
	$("#search-button").click(function(){
		multiSearch();
	 	mixfile = $('#query').val();
	 	localStorage.setItem('mixfile', JSON.stringify(mixfile));
	 	console.log(mixfile);
	});
	$("#playlist-button").click(function(){
		createPlaylist();
	});

});
