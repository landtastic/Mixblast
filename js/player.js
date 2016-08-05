function handleAPILoaded() {
  gapi.client.setApiKey('AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM');
  $("#playlist-button").html('Save a Playlist');
  $('#search-button').attr('disabled', false);
  onYouTubeIframeAPIReady_renamed();
}

function onPlayerReady() {
	$("#prevbutton").click(function(){
	nextVideo(false); //back
	});
	$("#playpause").click(function(){
		playPause();
	});
	$("#nextbutton").click(function(){
		nextVideo(true);
	});
	//shuffle after search
	$("#shufflebutton").click(function(){

		if ($('#shufflebutton').hasClass('disabled')) {
			//e.preventDefault();
			return false;
		} else {
			shuffleIt();
		}
	});
	$("#search-button").html('Blast a Mix <img src="img/play-arrow.svg" id="play-arrow-icon">');
  	//if rss url in querystring, automate click
  	////if (getParameterByName('rss')) $('#search-button').trigger( "click" );
}
 // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
//for some reason, renaming onYouTubeIframeAPIReady fixes incomplete player object bug
function onYouTubeIframeAPIReady_renamed() {
	player = new YT.Player('player', { 
		//suggestedQuality: 'medium',
		height: '394',
		width: '700',
		//videoId: 'fgBLu387UM8',
		events: {
			'onReady': onPlayerReady,
			'onError': onPlayerError,
			'onStateChange': onPlayerStateChange
		},
		playerVars: {
			modestbranding: 1,
			enablejsapi : 1,
			iv_load_policy: 3,
			theme: 'dark',
			color: 'white',
			showinfo: 1,
			playsinline: 1
		}	});
	//console.log(player.loadVideoById);
}
function onPlayerError(event){
	$('#errormsg-txt').html('Whoops. Error: '+event.data+' (Unknown error, try refreshing page with ctrl + shift + r');
	 if (event.data == 150) {
	 	wrongSong();
		$('#errormsg-txt').hide();
	 } else {
		nextVideo(true);
		$('#errormsg-txt').hide();
	 }
}
function onPlayerStateChange(event) {
	//console.log(event.data);
	/*
	if ((event.data == 1) && (search.playcount == 0)) {
		setTimeout(function(){ 
			$('html, body').animate({
				scrollTop: $("#player").offset().top
			}, 500);
		 },5000);
		console.log('first vid done.')
	}
	*/
	if (event.data != 1) {
		$("#playpb").attr("src","img/media_play.svg");
	} else {
		$("#playpb").attr("src","img/media_pause.svg");
	}
	//if video is done, play next
	if(event.data === 0) {
		var totalvids = search.topvIdArray.length;
		if (search.playcount+1 < totalvids) {
			nextVideo(true);
		} else {
			search.playcount = -1;
		}
		//console.log(search.playcount+"<-search.playcount|totalvids->"+totalvids);
	}
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
	return "<div class='searchresult-div'><img id='thumb' src='"+ vThumb +"'></div> <div class='searchresult-title'>"+ notFoundString +"<a id='link' onclick='"+ vclick + "' title='"+ vTitle +"'>" + vTitle + 
		"</a></div><div id='searchresult-refresh'><img src='img/refresh-icon.svg' data-toggle='tooltip' title='Version Swap \n("+ search.listArray[c] +")' class='refreshb' id='"+c+"'><input id='swapcount' type='hidden' value="+ swapcount +"></div>";
}


function playPause() {
	if (player.getPlayerState() != 1) {
		 player.playVideo();
		 $("#playpb").attr("src","img/media_pause.svg");
	} else {
		player.pauseVideo();
		$("#playpb").attr("src","img/media_play.svg");
	}
}

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
	var i = add();
	if (player.loadVideoById) {
		player.loadVideoById(vidId);
		if (search.topvTitleArray[search.vidcount]) document.title = search.topvTitleArray[search.vidcount] +' - Mixblast';
		$("#favicon").attr("href", search.topvThumbArray[search.vidcount]);
	} else {
		$('#errormsg-txt').html('Whoops. Youtube API error, try refreshing page with ctrl + shift + r');
	//try to reload player.loadVideoById 5x if it's not present
		/*
		if (i < 5) {
			var tag = document.createElement('script');

			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			
			onYouTubeIframeAPIReady();
			setTimeout(function(){ player.loadVideoById(vidId) },1000);
			console.log('checking loadVideoById...'+i);
			//i++;
		}
		*/
		
		//console.log(player);
		//console.log(player.loadVideoById);
	}
}

function cuePlayer() {
	var i = add(); //(in advanced.js)
	//check if the player object is loaded
	if (player.cueVideoById) {
		player.cueVideoById(search.topvIdArray[0]);
	} else {
		/*
		//check for it 5x if it isn't
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		if (i < 5) {
			onYouTubeIframeAPIReady();
			setTimeout(function(){ cuePlayer(); },1000);
			console.log('checking...'+i);
			//i++;
		}
		*/
		console.log(player);
		console.log(player.cueVideoById);
	}
}
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


$('#pb-menu').on('click', '.pb-module', function(event) {
	$("#query").show(); $("#text-container").show(); $('#player-container').hide(); 
	var blasts = pastBlasts.list();
	for (var i=0; i < blasts.length; i++) {
	  if (/\S/.test(blasts[i])) {
		var blastArr = blasts[i].split('\n');
		for (var ii = 0, len = blastArr.length; ii < len; ii++) {
			if (ii === 0) {
				if (blastArr[ii] == this.id) {
					//blasts.splice(i,1);
					var thisBlast = $.trim(pastBlasts.allBlasts[i]);
					var thisBlastArr = thisBlast.split('\n');
					thisBlastArr = thisBlastArr; thisBlastArr.shift();
					//console.log(thisBlastArr);
					thisBlast = thisBlastArr.join('\n');
					$("#query").val(thisBlast);
				}
			}
		}
	  }
	}
});
$('#pb-menu').on('click', '.pb-delete', function(event) {
	pastBlasts.delete(this.id);
	event.stopPropagation();
});

var infoBlast = {
	display : function() {
		$('#pb-menu').animate({left: '-400px'}, 'fast');
		$('#info-menu').animate({left: '0px'}, 'fast');
	},
	hide : function() {
		$('#pb-menu').animate({left: '-400px'}, 'fast');
		$('#info-menu').animate({left: '-400px'}, 'fast');
		//event.stopPropagation(); // this is for $("body").click(function(e) {
	}
}

var pastBlasts = {

	needsUpdate : true,

	list : function() {
		if (!pastBlasts.allBlasts) {
			pastBlasts.needsUpdate = true;
			//console.log(/*pastBlasts.allBlasts +*/' creating!!');
			pastBlasts.allBlasts = JSON.parse(localStorage.getItem("pastBlasts"));
			if(pastBlasts.allBlasts == null) pastBlasts.allBlasts = [];
			pastBlasts.allBlasts_len = pastBlasts.allBlasts.length;
		} else if (pastBlasts.allBlasts_len != pastBlasts.allBlasts.length) {
			pastBlasts.allBlasts_len = pastBlasts.allBlasts.length;
			pastBlasts.needsUpdate = false;
		} else {
			pastBlasts.needsUpdate = false;
		}
		return pastBlasts.allBlasts.sort().reverse();
	},
	display : function() {
		if (pastBlasts.needsUpdate) {
			var blasts = pastBlasts.list();
			if (blasts.length <= 0) {
				var date = new Date();
				blasts = [date.toJSON()+'\n No History Yet. \n Playlists are auto-saved when you Blast a Mix.'];
			} else {
				//if (blasts) blasts.sort().reverse();
			}
			$('#pb-menu').html('<div id="pb-button"><img class="pb-button-big" src="img/past-blasts-icon.svg"> <span id="pb-text"></span></div>');
			for (var i=0, max=blasts.length; i<max; i++) {
				var blastArr = blasts[i].split('\n');
				var thisBlast = '';
				var thisDate = '';
				var date_id = '';
				for (var ii=0, maxx=4; ii<maxx; ii++) { //old: maxx=blastArr.length
					if (ii === 0) {
						date_id = blastArr[ii];
						var arr = blastArr[ii].split(/[-T:.]/);
						thisDate = new Date(arr[0] + '/' + arr[1] + '/' + arr[2] + ' ' + arr[3] + ':' + arr[4] + ':' + arr[5] + ' UTC');
						var options = {weekday: "long", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"};
						var dateString = thisDate.toLocaleTimeString("en-us", options);
						blastArr[ii] = '<span id="pb-date">' + dateString + '</span>'; 
					}
					if (blastArr[ii]) {
						thisBlast += blastArr[ii] + '<br>';
					}
				}
				$('#pb-menu').append('<div class="pb-wrapper"><div class="pb-module line-clamp" id="'+ date_id +'">' + thisBlast + '</div><a class="pb-delete" id="'+ date_id +'" title="Delete"> &#9940; </a></div>'); //title="'+ thisBlast.replace("<br>", "|") +'"
			}
		}
		$('#pb-menu').show();
		$('#pb-text').html('Recent History');
		$('#pb-menu').animate({left: '0px'}, 'fast');
		$('#info-menu').animate({left: '-400px'}, 'fast');
	},
	hide : function() {
		$('#pb-menu').animate({left: '-400px'}, 'fast', function(){
        	$('#pb-menu').hide();
    	});
		$('#pb-text').html('');
	},
	add : function(pl_text) {
		var blasts = pastBlasts.list();
		if (!blasts) {
			blasts = [];
			var lastBlast = '';
		} else {
			var lastBlast = blasts[0].split("\n").slice(1).join("\n");
			//blasts = JSON.parse(blasts);
		}
		//don't add duplicate if same blast is blasted twice
		if ($.trim(lastBlast) != $.trim(pl_text)) {
			var date = new Date();
			blasts.push(date.toJSON() + '\n' + pl_text + '\n');
			localStorage.setItem("pastBlasts", JSON.stringify(blasts));
			pastBlasts.needsUpdate = true;
		}
	},
	delete : function(date_id) {
		var blasts = pastBlasts.list();
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
		pastBlasts.needsUpdate = true;
		pastBlasts.display();
	}
};


$(document).ready(function() {

	//hide pastBlasts if user clicks background
   	$("body").click(function(e) {
		pastBlasts.hide();
		infoBlast.hide();
		//$("#errormsg").hide();
	});
	$("#errormsg, #query").click(function(e) {
		$("#errormsg").hide();
	});

	var autosave = localStorage.getItem('mixfile');
	var mixtext = JSON.parse(autosave);
	if ((mixtext) && (mixtext != "")) {
		$("#query").val(mixtext); //search.isDefaultMsg = false;
	} else {
		//search.isDefaultMsg = true;
	}
	var songnum_text = localStorage.getItem('how_many_songs');
	if (isNaN($.trim(songnum_text))) songnum_text = 40; if (songnum_text === null) songnum_text = 40;
	$("#topSongs-num").val(songnum_text);
	$("#topSongs-num").blur(function() {
		how_many_songs = $('#topSongs-num').val();
		localStorage.setItem('how_many_songs', how_many_songs);
	});

	var dropdown_selected = localStorage.getItem('dropdown-lastvalue');
	if (dropdown_selected != null) {
	 	search.dropVal = dropdown_selected;
	 	$("#mixbuilder-dropdown > button > span:nth-child(1)").text($('#'+ dropdown_selected).text());
	 	dropdownSwitcher();
	} 
	 //''$('#'+ dropdown_selected).trigger('click');

	var artist_text = localStorage.getItem('artist');
	$("#mixbuilder-artist").val(artist_text);
	$("#mixbuilder-artist").blur(function() {
		artist = $('#mixbuilder-artist').val();
		localStorage.setItem('artist', artist);
	});
	var album_text = localStorage.getItem('album');
	$("#mixbuilder-album").val(album_text);
	$("#mixbuilder-album").blur(function() {
		album = $('#mixbuilder-album').val();
		localStorage.setItem('album', album);
	});
	var last_similarArtist = localStorage.getItem('last_similarArtist');
	$("#mixbuilder-artist").val(last_similarArtist);
	$("#mixbuilder-artist").blur(function() {
		last_similarArtist = $('#mixbuilder-artist').val();
		localStorage.setItem('last_similarArtist', last_similarArtist);
	});
	var last_similarSong = localStorage.getItem('last_similarSong');
	$("#mixbuilder-song").val(last_similarSong);
	$("#mixbuilder-song").blur(function() {
		last_similarSong = $('#mixbuilder-song').val();
		localStorage.setItem('last_similarSong', last_similarSong);
	});
	/*
	var last_similarArtist_quickMix = localStorage.getItem('last_similarArtist_quickMix');
	$("#mixbuilder-artistOnly").val(last_similarArtist_quickMix);
	$("#similarSongs-artistOnly").blur(function() {
		last_similarArtist = $('#similarSongs-artistOnly').val();
		localStorage.setItem('last_similarArtist_quickMix', last_similarArtist);
	});
*/
	$("#mixbuilder-artist").focus();
	$("#mixbuilder-artist").select();

	$("#search-button").click(function(){
		multiSearch();
		$("#shufflebutton").addClass("disabled");
	 	mixfile = $('#query').val();
	 	localStorage.setItem('mixfile', JSON.stringify(mixfile));
	 	//console.log(mixfile);
	});
	$("#playlist-button").click(function(){
		createPlaylist();
	});

	//hide playlist url until button is clicked
	$("#playlist-url").hide();

	//$('input[name=topSongs-num]').val($('#topSongs-num').val());
	if(!('ontouchstart' in window)) {
		$('[data-toggle="tooltip"]').tooltip();
	}

	$( "#search-container" ).sortable({
    	placeholder: "ui-state-highlight",
    	update: function( event, ui ) {
        	var sorted = $( "#search-container" ).sortable( "serialize", { key: "sort" } );
        	console.log(sorted);
        	//$.post( "form/order.php",{ 'choices[]': sorted});
        }
    });
	$( "#search-container" ).disableSelection();

	//email link
	var antiSpamString = "mixblaster"+"."+"webmaster"+"@"+"gma"+"il"+"."+"c"+"om";
	$( "#emailme" ).append("<a href='mai"+"lto:"+antiSpamString+"' target='_blank'>"+antiSpamString+"</a>");

});
