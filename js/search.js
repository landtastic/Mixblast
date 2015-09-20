var search = function(query,counter) {
	var q = query;
	var c = counter;

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
	if (!searchObj) { console.log('bad search: '+c); }

	$.each(searchObj.items, function(i,x) {
		var vId = x.id.videoId;
		var vTitle = x.snippet.title;
		var vThumb = x.snippet.thumbnails.default.url;
		if (vId===undefined) {
			vId="Not Found"; vTitle="Not Found. Try version refresh button: "; vThumb="img/notfound.png"; 
		}

		vIdArr.push(vId);
		vTitleArr.push(vTitle);
		vThumbArr.push(vThumb);
		//global object of all the song results
		search.vidObjArray[c] = {
			vid:vIdArr,
			title:vTitleArr, 
			thumb:vThumbArr
		};

		//display list, use only first result of each
		if (i === 0) {
			renderPlaylist(c,vThumb,vId,vTitle);
			
			search.topvIdArray.push(vId);	
			search.topvTitleArray.push(vTitle);
			search.topvThumbArray.push(vThumb);
			//start the first video right away while the playlist loads

			if (search.topvIdArray.length == 1) {
				//only cue on the first search, keep the video running on subsequent searches
				//////if (count==1) cuePlayer();
				if (search.count==1) loadVid(search.topvIdArray[0], 0, "medium"); //ok nevermind, let's autoplay instead of cue
			} 

			c++;
		}
	});
  });	
};


function multiSearch() {
	//toggle edit playlist
	editSearchTerm(0);
	search.vidObjArray = {}; //, search.prev_vidObjArray = {};
	search.topvIdArray = []; search.topvTitleArray =[]; search.topvThumbArray = []; search.listArray = [];
	search.vidcount = 0; search.playcount = 0; search.done = false; 
	if (!search.count) search.count = 0;
	//show video player
	$('#player-container').show();
	$('#button-container').show();
	//erase previous search
	$('#search-container').empty();
	$('#errormsg').hide();
	$('#advanced-container').hide();
	$('#youtube-playlist-container').show();
	$('#ytPlayer-thumb-close').show();
	$('#shuffletext').hide();
	//$("#closebutton-thumb").html("<img src='"+ search.topvThumbArray[0] +"' id='thumb'>"); 
	if (search.topvIdArray) {
		search.topvIdArray.length = 0; search.topvTitleArray.length = 0; search.topvThumbArray.length = 0;
		search.listArray.length = 0;
	}
	pastBlasts.add($('#query').val());
	//var mobile_width = 666;
	//if ($(window).width() < mobile_width) $("#pb-icon" ).hide();

	//split texarea into lines
	var lines = $('#query').val().split(/\n/);
	//only get non-whitespace lines, push into listArray
	for (var i=0; i < lines.length; i++) {
	  if (/\S/.test(lines[i])) {
		search.listArray.push($.trim(lines[i]));
	  }
	}
	
	var x = 0;
	var searchnum = search.listArray.length;
	if ((searchnum < 1) || search.isDefaultMsg) { 
		$('#errormsg').show();
		$('#errormsg').html('Put a list of songs into the textbox. <br>(Use the MixBuilder to add songs or just type a list)');
		editSearchTerm(0); 
		return false; 
	}

	//$("#query").animate({height:'200px'},200);
	//$("#logo").animate({height:'0px',width:'100%',marginBottom:'20px'});

	(function setInterval_afterDone(){

		/* do search function */
		if (search.listArray[x]) { search(search.listArray[x],x); }// else { console.log('error: ILB'); return false;}
		
		x++;
		
		//if(ready2search==true) waittime = 300; //wait for player to animate in
		
		var waittime = 600; 
		var timerId = setTimeout(setInterval_afterDone, waittime);
		if(x==searchnum) {
			//ready the playlist button
			$('#playlist-button').attr('disabled', false);
			$("#shufflebutton").removeClass("disabled");

			search.done = true;
			//ytPlayer.cuePlaylist(search.topvIdArray);
			/////todo: start with vidObjArray[vidcount].vid[0]

			clearTimeout(timerId);
		}
	})();
	search.count++;
}

function mixBuilder(artistName,trackName) {
	console.log(artistName + '|' + trackName)
	if (search.isDefaultMsg) $('#query').val('');
	$('#errormsg').hide();
	$("#related-container" ).show();
	if (search.dropVal == 'drop-similarSongs') {
		similarTrackPlaylist($.trim(artistName),$.trim(trackName));
		search.isDefaultMsg = false;
	} else if (search.dropVal == 'drop-topSongs'){
		allSongsBy($.trim(artistName));
		search.isDefaultMsg = false;
	} else {
		similarArtistPlaylist($.trim(artistName));
		search.isDefaultMsg = false;
	}
	//var needsUpdate = true;
	//if (needsUpdate) 
		showRelated.artists(artistName);
}

function allSongsBy(artistName) {
	var song_num = $("#topSongs-num").val();
	$.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="+artistName+"&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+ song_num +"&format=json&callback=?", function(data) {
		if (!songlist) var songlist = '';
		if ((data.toptracks != undefined) && (data.toptracks.track != undefined)) {
			$.each(data.toptracks.track, function(i, item) {
				songlist += artistName + " - " + item.name + "\n";
			});

			if (search.count === undefined) {
				$('#query').val(songlist);
				search.count = 0;
			} else {
				$('#query').val($('#query').val() + songlist);
			}
			
			 //$('#search-button').trigger( "click" );
			var textarea = document.getElementById('query');
			if (!search.isDefaultMsg) var t=setTimeout(function(){textarea.scrollTop = textarea.scrollHeight;},1000);
		} else {
			$('#errormsg').show();
			$('#errormsg').html(': ( <br><br>Error loading videos by: '+artistName+'<br><br>Check spelling?');
		}
	});
	
}
function similarTrackPlaylist(artistName,trackName) {
	var song_num = $("#topSongs-num").val();
	 $.getJSON("http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="+$.trim(artistName)+"&track="+$.trim(trackName)+"&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+ song_num +"&format=json&callback=?", function(data) {
		if (!songlist) var songlist = '';
		if (data.similartracks != undefined) {
			$.each(data.similartracks.track, function(i, item) {
				songlist += item.artist.name + " - " + item.name + "\n";
			});
			if ($.trim(songlist) == '') {
				$('#errormsg').show();
				$('#errormsg').html(': ( <br><br>Error loading similar songs for: '+ artistName +' - '+ trackName +'. <br><br>Check spelling?'); 
			}
			if (search.count === undefined) {
				$('#query').val(songlist);
				search.count = 0;
			} else {
				$('#query').val($('#query').val() + songlist);
			}
			var textarea = document.getElementById('query');
			if (!search.isDefaultMsg) var t=setTimeout(function(){textarea.scrollTop = textarea.scrollHeight;},1000);
		} else {
			$('#errormsg').show();
			$('#errormsg').html(': ( <br><br>Error loading similar songs. <br><br>Check spelling?'); 
		}
	});	
}
function similarArtistPlaylist(artistName) {
	var song_num = $("#topSongs-num").val();
	$.getJSON("http://developer.echonest.com/api/v4/playlist/static?api_key=KHXHOPL1UHQ0LU1ES&artist="+$.trim(artistName)+"&type=artist-radio&results="+ song_num, function(data) {
		if (!songlist) var songlist = '';
		if (data.response != undefined) {
			$.each(data.response.songs, function(i, item) {
				songlist += item.artist_name + " - " + item.title + "\n";
			});
			if ($.trim(songlist) == '') {
				$('#errormsg').show();
				$('#errormsg').html(': ( <br><br>Error loading similar songs for: '+ artistName +'. <br><br>Check spelling?'); 
			}
			if (search.count === undefined) {
				$('#query').val(songlist);
				search.count = 0;
			} else {
				$('#query').val($('#query').val() + songlist);
			}
			var textarea = document.getElementById('query');
			if (!search.isDefaultMsg) var t=setTimeout(function(){textarea.scrollTop = textarea.scrollHeight;},1000);
		} else {
			$('#errormsg').show();
			$('#errormsg').html(': ( <br><br>Error loading similar songs. <br><br>Check spelling?'); 
		}
	});	
}
$('.dropdown-menu li').click(function( event ){
	var $target = $( event.currentTarget );
	search.dropVal = this.id;
	if (search.dropVal == 'drop-topSongs'){
		$('#similarSongs-artist').hide();
		$('#similarSongs-song').hide();
		$('#topSongs-artist').show();
		$('#similarSongs-artistOnly').hide();
	} else if (search.dropVal == 'drop-similarSongs') {
		$('#similarSongs-artist').show();
		$('#similarSongs-song').show();
		$('#topSongs-artist').hide();
		$('#similarSongs-artistOnly').hide();
	} else {
		$('#similarSongs-artist').hide();
		$('#similarSongs-song').hide();
		$('#topSongs-artist').hide();
		$('#similarSongs-artistOnly').show();
	}

	$target.closest( '.btn-group' )
		.find( '[data-bind="label"]' ).html( $target.html() )
			.end()
		.children( '.dropdown-toggle' ).dropdown( 'toggle' );

		return false;
});
$("#topSongs-artist, #topSongs-num, #similarSongs-artist, #similarSongs-song, #similarSongs-artistOnly").keypress(function (e) {
 var key = e.which;
 if(key == 13) {
 	if (search.dropVal == 'drop-topSongs') {
		mixBuilder($("#topSongs-artist").val(),'');
	} else if (search.dropVal == 'drop-similarSongs') {
		mixBuilder($("#similarSongs-artist").val(),$("#similarSongs-song").val());
	} else {
		mixBuilder($("#similarSongs-artistOnly").val(),'')
	}
	$("#ui-id-1").hide();
	//return false;  
 }
});  
$("#topSongs-artist, #topSongs-num, #similarSongs-artist, #similarSongs-song, #similarSongs-artistOnly").click(function (e){
	$(this).select();this.setSelectionRange(0, 9999);
});

$("#mixbuilder-search-button").click(function(){
 	if (search.dropVal == 'drop-topSongs') {
		mixBuilder($("#topSongs-artist").val(),'');
	} else if (search.dropVal == 'drop-similarSongs') {
		mixBuilder($("#similarSongs-artist").val(),$("#similarSongs-song").val());
	} else {
		mixBuilder($("#similarSongs-artistOnly").val(),'');
	}
});


var showRelated =  {
	artists : function(artistName) {
		$.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + artistName + "&limit=40&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&format=json", function(data) {
			var curArtist;
			var artistList = '';
			if (data.similarartists) {
				$.each(data.similarartists.artist, function(i, item) {
					if (item.name) {
						curArtist = item.name.replace(/["']/g, "\\'");
					} else {
						$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+artistName); 
					}
					artistList += '<a class="similar-artistButton" href="javascript:void(0);" onclick="showRelated.addSongs(\''+ curArtist +'\')">' + item.name + '</a>';
					if (i < data.similarartists.artist.length-1) artistList += " ";
				});
				$("#related-container").html("<br><hr class='similar-top'><span id='similarArtTitle'>Add <span id='similarNum'>"+ $("#topSongs-num").val() +"</span> Songs By A Similar Artist:</span> "+artistList);
			} else {
				$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+artistName); 
			}
		});
	},
	addSongs : function(curArtist) {
		$('#topSongs-artist').val(curArtist);
		allSongsBy(curArtist,null,false);
		return false;
	}
};

$('#topSongs-num').keyup(function () {
  $('#similarNum').text($(this).val());
});

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
//todo: undo clear list
$("#query-clear").click(function(){
	$("#query").val('');
});

$("#editplaylist").click(function(){
	editSearchTerm(0);
});
$("#ytPlayer-thumb-close").click(function(){
	editSearchTerm(0);
});
$("#closeAdvanced").click(function(){
	$('#advanced-container').slideToggle("fast");
});

function editSearchTerm(lineNumber) {
	var mobile_width = 795, vidTop = '-72px', vidWidth = '100%', thumbTop = '0px', queryHeight = '222px';
	if ($(window).width() < mobile_width) { 
		vidTop = '-100px'; vidWidth = '100%'; thumbTop = '0px'; 
	}
	var toggleEditText = $("#editplaylist").html();
	if (toggleEditText.indexOf("Edit Playlist") > -1) {
		$("#editplaylist").html(toggleEditText.replace("Edit Playlist","Close Editor"));
		$("#player-container").animate({top: thumbTop, right: '21px', width: '95px', height: '71px'}, 'fast');
		$('#query').animate({height: '345px'}, 'fast');
		$("#related-container").show();
		$("#ytPlayer-thumb-close").show();
		$('#mixbuilder-bar').css("visibility", "visible");
		$("#blast-button-container").css("visibility", "visible");
		$("#shuffletext").show();
	} else if (toggleEditText.indexOf("Close Editor") > -1) {
		$("#editplaylist").html(toggleEditText.replace("Close Editor","Edit Playlist"));
		$('#player-container').animate({top: vidTop, right: '0px', width: vidWidth, height: '364px'}, 'fast', function() {
			$('#mixbuilder-bar').css("visibility", "hidden");
  		});
		$('#query').animate({height: queryHeight}, 'fast');
		$("#related-container").hide();
		$("#ytPlayer-thumb-close").hide();
		$("#blast-button-container").css("visibility", "hidden");
		$("#shuffletext").hide();
	}
	/*
	var input = $("#query");
	var lineHeight = 1.14;
	input.scrollTop(lineNumber * lineHeight);
	window.scrollTo(0, 0);
	*/
}

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