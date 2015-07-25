function handleAPILoaded() {
  gapi.client.setApiKey('AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM');
  $("#playlist-button").html('Save a Playlist');
  $('#search-button').attr('disabled', false);
  onYouTubeIframeAPIReady_removed_callback();
}
//changed the name of this function so iframe api doesn't callback
function onYouTubeIframeAPIReady_removed_callback() {
    ytPlayer = new YT.Player('ytPlayer', { 
    	suggestedQuality: 'medium',
    	//height: '368',
    	//width: '600',
    	//videoId: 'Oi1BcouEmio',
    	//videoId: 'fgBLu387UM8',
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onPlayerStateChange
        }
    });
}
function onPlayerReady() {
	$("#search-button").html('Blast a Mix <img src="img/play-arrow.svg">');
  	//if rss url in querystring, automate click
  	////if (getParameterByName('rss')) $('#search-button').trigger( "click" );
}
function onPlayerError(event){
     console.log('Whoops. Error: '+event.data);
     waterbug.log('Whoops. Error: '+event.data);
     if (event.data == 150) {
     	wrongSong();
     } else {
		nextVideo(true);
     }
}
function onPlayerStateChange(event) {
	if (event.data != 1) {
        $("#playpb").attr("src","img/media_play.png");
    } else {
        $("#playpb").attr("src","img/media_pause.png");
    }
	//if video is done, play next
    if(event.data === 0) {
		var totalvids = search.topvIdArray.length;
		if (search.playcount+1 < totalvids) {
			nextVideo(true);
		} else {
			search.playcount = -1;
		}
		console.log(search.playcount+"<-search.playcount|totalvids->"+totalvids);
		waterbug.log(search.playcount+"<-search.playcount|totalvids->"+totalvids+' waterbug!');
    }
	waterbug.log(event.data+' waterbug!');
}

function renderPlaylist(c,vThumb,vId,vTitle) {
	$("#search-container").append("<div class='searchresult'>"+createPlaylistItem(c,vThumb,vId,vTitle)+"</div>");
}
function createPlaylistItem(c,vThumb,vId,vTitle,swapcount) {
	var vclick = "loadVid(\""+vId+"\"); search.vidcount="+c+";";
	var notFoundString = '';
	if (vId == "Not Found") {
		vclick = "editSearchTerm(0);";
		notFoundString = "<input id='not-found' value='"+ search.listArray[c] +"'> ";
	}
	if (swapcount === undefined) swapcount = 0;
	return "<div class='searchresult-div' style='width:10%'><img id='thumb' src='"+ vThumb +"'></div> <div class='searchresult-title'>"+ notFoundString +"<a id='link' onclick='"+ vclick + "' title='"+ vTitle +"'>" + vTitle + 
		"</a></div><div id='searchresult-refresh' style='width:5%'><img src='img/refreshb.png' class='refreshb' id='"+c+"' title='Version Swap'><input id='swapcount' type='hidden' value="+ swapcount +"></div>";
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
	var totalvids = search.topvIdArray.length;
	if (next===true) {
		search.vidcount++; search.playcount++;
		if (search.vidcount >= totalvids) search.vidcount = 0;
		$('#search-container').append($('#search-container div.searchresult:first'));
	} else { 
		search.vidcount--; search.playcount--;
		if ((search.vidcount < 0) || (search.vidcount=='undefined')) search.vidcount = totalvids-1;
		$('#search-container').prepend($('#search-container div.searchresult:last'));
	}
	//reset global swap count
	swapper = 1;
	
	var thevideoid = search.topvIdArray[search.vidcount];
	if (thevideoid) loadVid(thevideoid);
}

function loadVid(vidId) {
	ytPlayer.loadVideoById(vidId, 0, "medium");
	//$("#ytPlayer").attr("src", "http://www.youtube.com/embed/" + vidId);
	//ytPlayer.playVideo();
	//ytPlayer.loadVideoByUrl('http://www.youtube.com/v/'+ vidId +'?version=3');
	if (search.topvTitleArray[search.vidcount]) document.title = search.topvTitleArray[search.vidcount] +' - Mixblast';
}

function cuePlayer() {
	var i = add(); //(in advanced.js)
	//check if the ytPlayer object is loaded
	if (ytPlayer.cueVideoById) {
		ytPlayer.cueVideoById(search.topvIdArray[0]);
	} else {
		//check for it 5x if it isn't
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		if (i < 5) {
			onYouTubeIframeAPIReady_removed_callback();
			setTimeout(function(){ cuePlayer(); },1000);
    		console.log('checking...'+i);
    		//i++;
    	}
	}
}
//shuffle after search
$("#shufflebutton").click(function(){

	if ($('#shufflebutton').hasClass('disabled')) {
		//e.preventDefault();
		return false;
	} else {
		shuffleIt();
	}
});
function shuffleIt() {
	$("#search-container").empty();
	if (search.count>1) search.vidcount = 0;

	var shuffleindex = search.topvIdArray.length;
	//random array of numbers to use as keys
	var numlist = [];
	for (var i = 0; i < shuffleindex; i++) {
    	numlist.push(i);
	}
	var shuffled_idArr = shuffle(numlist);

	//copy video object, create previous copy
	if ($.isEmptyObject(search.prev_vidObjArray)) {
		search.prev_vidObjArray = jQuery.extend(true, {}, search.vidObjArray);
	}
	//clear out top arrays
	search.topvIdArray.length = 0; search.topvTitleArray.length = 0; search.topvThumbArray.length = 0;
	for (var c = 0; c < shuffleindex; c++) {
		var randumb_num = shuffled_idArr[c];
		var shId, shTitle, shThumb;
		//make sure this isn't undefined
		if (search.prev_vidObjArray[randumb_num]) {
			shId=search.prev_vidObjArray[randumb_num].vid[0];
			shTitle=search.prev_vidObjArray[randumb_num].title[0];
			shThumb=search.prev_vidObjArray[randumb_num].thumb[0]; 
		} else {
			shId="Not Found"; shTitle="Not Found."; shThumb="img/notfound.png"; 
		}
		//push new top arrays
		search.topvIdArray.push(shId);
		search.topvTitleArray.push(shTitle);
		search.topvThumbArray.push(shThumb);

		renderPlaylist(c,shThumb,shId,shTitle);

		for (var xx = 0; xx < search.prev_vidObjArray[0].vid.length; xx++) { 
			search.vidObjArray[c] = {
			vid: search.prev_vidObjArray[randumb_num].vid,
			title: search.prev_vidObjArray[randumb_num].title, 
			thumb: search.prev_vidObjArray[randumb_num].thumb
			};
		}
	}
}

function shuffle(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

$("#wrongsong").click(function(){
	wrongSong();
});

var swapper = 1; //next song
function wrongSong() {
	if (swapper > 19) swapper = 0;
	loadVid(search.vidObjArray[search.vidcount].vid[swapper]);
	swapper++;
}

//song refresh button
$('#search-container').on('click contextmenu', '.refreshb', function(event) {

    var thisid = this.id;
    var swapcount = $(this).nextAll('#swapcount').val();
	if( event.button == 2 ) { 
	  swapcount--;
	  event.preventDefault();
	} else {
	  swapcount++;
	}
    var swaplen = search.vidObjArray[thisid].vid.length;
    if (swapcount >= swaplen) swapcount = 0;
    if (swapcount < 0) swapcount = swaplen-1;

	var top5id = search.vidObjArray[thisid].vid[swapcount];
	var top5click = "loadVid('"+top5id+"'); search.vidcount="+thisid;

	if ((top5id === "Not Found") || (top5id === undefined)) top5click = "editSearchTerm("+thisid+");";
	var top5thumb = search.vidObjArray[thisid].thumb[swapcount];
	var top5title = search.vidObjArray[thisid].title[swapcount];

	$(this).parent().parent().html(createPlaylistItem(thisid,top5thumb,top5id,top5title,swapcount));
	//replace current vId in global search.topvIdArray
	var index = search.topvIdArray.indexOf(search.topvIdArray[thisid]);
	if (index !== -1) {
		search.topvIdArray[index] = top5id;
	}
	$(this).nextAll('#swapcount').val(swapcount);
});

$('#pb-button').click(function(){
    if($('#pb-menu').css('left')=='0px'){
    	pastBlasts.hide();
    }else{
    	pastBlasts.display();
    }
});
$('#pb-button').hover(
  function() { $('#pb-text').html('Blasts from the Past'); }, function() { /*$('#pb-text').html('');*/ }
);
$('#pb-menu').on('click', '.pb-module', function(event) {
	var thisBlast = $(this).html();
	var lines = thisBlast.split('<br>');
	lines.splice(0,1);
	thisBlast = lines.join('\n');
	$("#text-container").show(); $('#player-container').hide();
	//$("#query").animate({height:'345px'},200);

    $("#query").val($.trim(thisBlast));
});
$('#pb-menu').on('click', '.pb-delete', function(event) {
	pastBlasts.delete(this.id);
});

var pastBlasts = {
	list : function() {
		return localStorage.getItem("pastBlasts");
	},
	display : function() {
		//var openCount = new add(); 
		//console.log(openCount);
		//if (search.count===undefined) {
			var blasts = pastBlasts.list();
	    	if (blasts === null) {
	    		var date = new Date();
		        blasts = [date.toJSON()+'\n No History Yet. \n Playlists are auto-saved when you Blast a Mix.'];
		    } else {
		        blasts = JSON.parse(blasts);
				if (blasts) blasts.sort().reverse();
		    }
		    $('#pb-menu').html('');
		    for (var i=0, max=blasts.length; i<max; i++) {
		    	var blastArr = blasts[i].split('\n');
		    	var thisBlast = '';
		    	var thisDate = '';
		    	var date_id = '';
		    	for (var ii=0, maxx=blastArr.length; ii<maxx; ii++) {
		    		if (ii === 0) {
		    			date_id = blastArr[ii];
		    			var arr = blastArr[ii].split(/[-T:.]/);
	    				thisDate = new Date(arr[0] + '/' + arr[1] + '/' + arr[2] + ' ' + arr[3] + ':' + arr[4] + ':' + arr[5] + ' UTC');
						var options = {weekday: "long", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"};
		    			var dateString = thisDate.toLocaleTimeString("en-us", options);
		    			blastArr[ii] = '<span id="pb-date">' + dateString + '</span>'; 
		    		}
		    		thisBlast += blastArr[ii] + '<br>';
		    	}
	    		$('#pb-menu').append('<div class="pb-wrapper"><div class="pb-module line-clamp">' + thisBlast + '</div><a class="pb-delete" id="'+ date_id +'" title="Delete"> &#9940; </a></div>'); //title="'+ thisBlast.replace("<br>", "|") +'"
			}
		//}
		$('#pb-text').html('Blasts from the Past');
		$('#pb-menu').animate({left: '0px'}, 'fast');
	},
	hide : function() {
		$('#pb-menu').animate({left: '-400px'}, 'fast');
		$('#pb-text').html('');
	},
	add : function(pl_text) {
		var blasts = pastBlasts.list();
    	if (!blasts) {
	        blasts = [];
	    } else {
	        blasts = JSON.parse(blasts);
	    }
		var date = new Date();
		blasts.push(date.toJSON() + '\n' + pl_text + '\n');
		localStorage.setItem("pastBlasts", JSON.stringify(blasts));
	},
	delete : function(date_id) {
		var blasts = JSON.parse(pastBlasts.list());
		for (var i=0; i < blasts.length; i++) {
		  if (/\S/.test(blasts[i])) {
	    	var blastArr = blasts[i].split('\n');
			for (var ii = 0, len = blastArr.length; ii < len; ii++) {
				if (ii === 0) {
					if (blastArr[ii] == date_id) {
						blasts.splice(i,1);
						console.log('deleting:'+ blastArr[ii]);
					}
				}
			}
          }
        }
	    localStorage.setItem("pastBlasts", JSON.stringify(blasts));
	    pastBlasts.display();
	}
};


$(document).ready(function() {

   $("#body-container, #query, .gradient-background, #foot-wrap").click(function(e) {
		pastBlasts.hide();
    });

 	//autosave
	var autosave = localStorage.getItem('mixfile');
	var mixtext = JSON.parse(autosave);
	$("#query").val(mixtext);
	//$("#query").focus(function() {
		//$(this).animate({height:'345px'},200);
	//});
	$("#query").blur(function() {
	 	mixfile = $('#query').val();
	 	localStorage.setItem('mixfile', JSON.stringify(mixfile));
	 	console.log(mixfile);
	});

	var songnum_text = localStorage.getItem('how_many_songs');
	if ($.trim(songnum_text) === '') songnum_text = 100;
	$("#play_songsby").val(songnum_text);
	$("#play_songsby").blur(function() {
		how_many_songs = $('#play_songsby').val();
		localStorage.setItem('how_many_songs', how_many_songs);
	});
	var artist_text = localStorage.getItem('artist');
	$("#playallsongsby-artist").val(artist_text);
	$("#playallsongsby-artist").blur(function() {
		artist = $('#playallsongsby-artist').val();
		localStorage.setItem('artist', artist);
	});

	$("#search-button").click(function(){
		multiSearch();
		$("#shufflebutton").addClass("disabled");
	 	mixfile = $('#query').val();
	 	localStorage.setItem('mixfile', JSON.stringify(mixfile));
	 	console.log(mixfile);
	});
	$("#playlist-button").click(function(){
		createPlaylist();
	});

	//hide playlist url until button is clicked
	$("#playlist-url").hide();

	//email link
	var antiSpamString = "mixblaster"+"."+"webmaster"+"@"+"gma"+"il"+"."+"c"+"om";
	$( "#emailme" ).append("<a href='mai"+"lto:"+antiSpamString+"' target='_blank'>"+antiSpamString+"</a>");

});
