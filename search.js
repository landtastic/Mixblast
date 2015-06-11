var vidObjArray = {};
var prev_vidObjArray = {};
var	topvIdArray = [], topvTitleArray=[], topvThumbArray=[];
var searchArray = [];
var vidcount = 0;
var playcount = 0;
var searchcount = 0;

function onPlayerReady() {
	$("#search-button").html('Blast a Mix &#9658;');
  	//if rss url in querystring, automate click
  	////if (getParameterByName('rss')) $('#search-button').trigger( "click" );
}
function onPlayerError(event){
     console.log('Whoops. Error: '+event.data);
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
		var totalvids = topvIdArray.length;
		if (playcount+1 < totalvids) {
			nextVideo(true);
		} else {
			playcount = -1;
		}
		console.log(playcount+"<-playcount|totalvids->"+totalvids);
    }
}

function handleAPILoaded() {
  gapi.client.setApiKey('AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM');
  $("#playlist-button").html('Save a Playlist');
  $('#search-button').attr('disabled', false);
  onYouTubeIframeAPIReady_removed_callback();
}

//changed the name of this function so iframe api doesn't callback
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
			var vId="Not Found",vTitle="Not Found. Try version refresh button: ",vThumb="img/notfound.png"; 
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

			if (topvIdArray.length == 1) {
				//only cue on the first search, keep the video running on subsequent searches
				if (searchcount==1) cuePlayer();
			} 

			c++;
		}
	});
  });    
}

function cuePlayer() {
	var i = add(); //(in advanced.js)
	//check if the ytPlayer object is loaded
	if (ytPlayer.cueVideoById) {
		ytPlayer.cueVideoById(topvIdArray[0]);
	} else {
		//check for it 5x if it isn't
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		if (i < 5) {
			onYouTubeIframeAPIReady_removed_callback();
			setTimeout(function(){ cuePlayer(); },1000);
    		console.log('checking...'+i)
    		//i++;
    	}
	}
}

var searchnum;
function multiSearch() {

	searchdone = false;
	//hide text form
	$("#text-container" ).slideToggle("fast");
	//show video player
	$('#player-container').slideToggle("fast");
	$('#button-container').show();
	$('#youtube-playlist-container').show();
	//erase previous search
	$( "#search-container" ).empty();
	//$('#related-container').hide();
	$('#errormsg').hide();
	$("#editplaylist").html($("#editplaylist").html().replace("Close Editor","Edit Playlist"));
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
	if (searchnum < 1) { 
		$('#errormsg').show();
		$('#errormsg').html('Put a list of songs into the textbox. <br>(Load songs by artist, copy and paste a text list, or type)');
		editSearchTerm(0); 
		return false; 
	}

	$("#query").animate({height:'200px',width:'575px'},200);
	$("#logo").animate({height:'0px',width:'100%',marginBottom:'20px'});

	(function setInterval_afterDone(){

		/* do search function */
		if (searchArray[x]) { search(searchArray[x],x); } else { console.log('error: ILB'); return false;}
		
		x++;
		
		//if(ready2search==true) waittime = 300; //wait for player to animate in
		
		var waittime = 600; 
		var timerId = setTimeout(setInterval_afterDone, waittime);
		if(x==searchnum) {
			//ready the playlist button
			$('#playlist-button').attr('disabled', false);
			$("#shufflebutton").removeClass("disabled");

			searchdone = true;
			//ytPlayer.cuePlaylist(topvIdArray);
			/////todo: start with vidObjArray[vidcount].vid[0]

			clearTimeout(timerId);
		}
	})();
	searchcount++;
}

function renderPlaylist(c,vThumb,vId,vTitle) {
	$("#search-container").append("<div class='searchresult'>"+createPlaylistItem(c,vThumb,vId,vTitle)+"</div>");
}
function createPlaylistItem(c,vThumb,vId,vTitle,swapcount) {
	var vclick = "loadVid(\""+vId+"\"); vidcount="+c+";"
	var notFoundString = '';
	if (vId == "Not Found") {
		var vclick = "editSearchTerm(0);";
		notFoundString = "<input id='not-found' value='"+ searchArray[c] +"'> ";
	}
	var swapcount;
	if (swapcount == undefined) swapcount = 0;
	return "<div class='searchresult-div' style='width:10%'><img id='thumb' src='"+ vThumb +"'></div> <div class='searchresult-title'>"+ notFoundString +"<a id='link' onclick='"+ vclick + "' title='"+ vTitle +"'>" + vTitle + 
		"</a></div><div id='searchresult-refresh' style='width:5%'><img src='img/refreshb.png' class='refreshb' id='"+c+"' title='Version Swap'><input id='swapcount' type='hidden' value="+ swapcount +"></div>";
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
		vidcount++; playcount++;
		if (vidcount >= totalvids) vidcount = 0;
		$('#search-container').append($('#search-container div.searchresult:first'));
	} else { 
		vidcount--; playcount--;
		if ((vidcount < 0) || (vidcount=='undefined')) vidcount = totalvids-1;
		$('#search-container').prepend($('#search-container div.searchresult:last'));
	}
	//reset global swap count
	swapper = 1;
	
	var thevideoid = topvIdArray[vidcount];
	if (thevideoid) loadVid(thevideoid);
}

function loadVid(vidId) {
	ytPlayer.loadVideoById(vidId);
	if (topvTitleArray[vidcount]) document.title = topvTitleArray[vidcount] +' - Mixblast';
}

$('#ytPlayer').on('ended',function(){
	console.log('ended:'+ $(this)[0]);
    //$(this)[0].play();
});

function allSongsBy(artistName) {
	var song_num = $("#play_songsby").val();
	$('#query').val('Loading list: '+ song_num +' videos by '+ artistName + '...');
	$("#related-container" ).show();
	showRelated(artistName);
     $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="+artistName+"&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+ song_num +"&format=json&callback=?", function(data) {
        var songlist = '';
        if (data.toptracks.track) {
	        $.each(data.toptracks.track, function(i, item) {
	            songlist += artistName + " - " + item.name + "\n";
	        });
	        $('#query').val(songlist);
	         //$('#search-button').trigger( "click" );
		} else {
			$('#query').val(': ( \n\nError loading videos by: '+artistName+'\n\nCheck spelling?'); 
	    }
    });
}
$("#playallsongsby-artist, #play_songsby").keypress(function (e) {
 var key = e.which;
 if(key == 13) {
    allSongsBy($("#playallsongsby-artist").val());
    return false;  
 }
});  
$("#playall-button").click(function(){
	allSongsBy($("#playallsongsby-artist").val());
});

function showRelated(artistName) {
     $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + artistName + "&limit=20&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&format=json", function(data) {

        var artistList = '';
        if (data.similarartists) {
	        $.each(data.similarartists.artist, function(i, item) {
	        	if (item.name) {
	        		var curArtist = item.name.replace(/["']/g, "\\'");
	        	} else {
	        		$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+artistName); 
	        	}
	            artistList += '<a href="javascript:void(0);" onclick="$(\'#playallsongsby-artist\').val(\''+ curArtist +'\');allSongsBy(\''+ curArtist +'\');return false;">' + item.name + '</a>';
	            if (i < data.similarartists.artist.length-1) artistList += " &bull; "
	        });
	        $("#related-container").html("<br><hr class='similar-top'><span id='similarArtTitle'>Similar Artists:</span> "+artistList);
		} else {
			$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+artistName); 
	    }
    });
}

$("#shuffletext").click(function(){
	var lines = $('#query').val().split("\n");
	shuffle(lines);
	//var randomlines = lines.join("\n");
	var randomlines = '';
	for (var i=0; i < lines.length; i++) {
		if (/\S/.test(lines[i])) {
    		randomlines += lines[i] + '\n';
    		//if (i != lines.length) randomlines += '\n';
    	}
	}
	//randomlines = randomlines.replace(/^(\r\n)|(\n)/,'');
	$('#query').val(randomlines);

});
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
	//clear out top arrays
	topvIdArray.length = 0; topvTitleArray.length = 0; topvThumbArray.length = 0;
	for (var c = 0; c < shuffleindex; c++) {
		var randumb_num = shuffled_idArr[c];
		//make sure this isn't undefined
		if (prev_vidObjArray[randumb_num]) {
			var shId=prev_vidObjArray[randumb_num].vid[0];
			var shTitle=prev_vidObjArray[randumb_num].title[0];
			var shThumb=prev_vidObjArray[randumb_num].thumb[0]; 
		} else {
			var shId="Not Found",shTitle="Not Found.",shThumb="img/notfound.png"; 
		}
		//push new top arrays
		topvIdArray.push(shId);
		topvTitleArray.push(shTitle);
		topvThumbArray.push(shThumb);

		renderPlaylist(c,shThumb,shId,shTitle);

		for (var xx = 0; xx < prev_vidObjArray[0].vid.length; xx++) { 
			vidObjArray[c] = {
			'vid': prev_vidObjArray[randumb_num].vid,
			'title': prev_vidObjArray[randumb_num].title, 
			'thumb': prev_vidObjArray[randumb_num].thumb
			};
		}
	}
}

function shuffle(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

$("#wrongsong").click(function(){
	wrongSong();
});

var swapper = 1; //next song
function wrongSong() {
	if (swapper > 19) swapper = 0;
	loadVid(vidObjArray[vidcount].vid[swapper]);
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
    var swaplen = vidObjArray[thisid].vid.length;
    if (swapcount >= swaplen) swapcount = 0;
    if (swapcount < 0) swapcount = swaplen-1;

	var top5id = vidObjArray[thisid].vid[swapcount];
	var top5click = "loadVid('"+top5id+"');vidcount="+thisid;

	if ((top5id == "Not Found") || (top5id == undefined)) var top5click = "editSearchTerm("+thisid+");";
	var top5thumb = vidObjArray[thisid].thumb[swapcount];
	var top5title = vidObjArray[thisid].title[swapcount];

	$(this).parent().parent().html(createPlaylistItem(thisid,top5thumb,top5id,top5title,swapcount));
	//replace current vId in global topvIdArray
	var index = topvIdArray.indexOf(topvIdArray[thisid]);
	if (index !== -1) {
		topvIdArray[index] = top5id;
	}
	$(this).nextAll('#swapcount').val(swapcount);
});


$("#editplaylist").click(function(){
	editSearchTerm(0);
});
$(".closebutton").click(function(){
	$("#text-container" ).slideToggle("fast");
	$('#player-container').slideToggle("fast");
	$("#query").animate({height:'240px',width:'575px'},200);
	$("#logo").animate({height:'0px',width:'100%',marginBottom:'20px'});
	$("#editplaylist").html($("#editplaylist").html().replace("Close Editor","Edit Playlist"));
});
$("#closeAdvanced").click(function(){
	$('#advanced-container').slideToggle("fast");
});

$(document).keydown(function(e) {
	//allow arrow keys if an input is focused
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

var pastBlasts = {
	blastItem : [],
	list : function() {
		alert(this);
		alert(this.blastItem);
		localStorage["blastItem"] = JSON.stringify(blastItem);
		var storedBlasts = JSON.parse(localStorage["blastItem"]);
	},
	addBlast : function() {
		blastItem.push();
	}
}

$(document).ready(function() {
	//email link
	var antiSpamString = "mixblaster"+"."+"webmaster"+"@"+"gma"+"il"+"."+"c"+"om";
	$( "#emailme" ).append("<a href='mai"+"lto:"+antiSpamString+"'>"+antiSpamString+"</a>");
	
	//hide playlist url until button is clicked
	$("#playlist-url").hide();
	$(".closebutton").hide();

 	//autosave
	var autosave = localStorage.getItem('mixfile');
	var mixtext = JSON.parse(autosave);
	$("#query").val(mixtext);
	$("#query").focus(function() {
		$(this).animate({height:'345px',width:'575px'},200);
	});
	$("#query").blur(function() {
	 	mixfile = $('#query').val();
	 	localStorage.setItem('mixfile', JSON.stringify(mixfile));
	 	console.log(mixfile);
	});

	var songnum_text = localStorage.getItem('how_many_songs');
	if ($.trim(songnum_text) == '') songnum_text = 100;
	$("#play_songsby").val(songnum_text);
	$("#play_songsby").blur(function() {
		how_many_songs = $('#play_songsby').val();
		localStorage.setItem('how_many_songs', how_many_songs);
		console.log(how_many_songs)
	});
	var artist_text = localStorage.getItem('artist');
	$("#playallsongsby-artist").val(artist_text);
	$("#playallsongsby-artist").blur(function() {
		artist = $('#playallsongsby-artist').val();
		localStorage.setItem('artist', artist);
		console.log(artist)
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


});