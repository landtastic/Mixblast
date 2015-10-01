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
			search.topvIdArray.push(vId);	
			search.topvTitleArray.push(vTitle);
			search.topvThumbArray.push(vThumb);
			//start the first video right away while the playlist loads

			if (search.topvIdArray.length == 1) {
				//only cue on the first search, keep the video running on subsequent searches
				//////if (count==1) cuePlayer();
				if (search.count==1) loadVid(search.topvIdArray[0], 0, "medium"); //ok nevermind, let's autoplay instead of cue
			} 

			renderPlaylist(c,vThumb,vId,vTitle);
			c++;
		}
	});
  });	
};


function multiSearch() {

	//first time search/search from mixbuilder if textarea blank
	if (($('#mixbuilder-search-button').is(':hidden')) || (search.isDefaultMsg && (rssfeed===''))) {
		//alert(search.isDefaultMsg);
		$("#mixbuilder-search-button").show();
		$("#query").show().val('');
		mixBuilder.fromFirstField = true;
		mixBuilder.search();
		$("#query").hide();
		return;
	}
	mixBuilder.fromFirstField = false;
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
	$("#mixbuilder-search-button").show();
	//$('#shuffletext').hide();
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
		$("#query").val($("#query").prop("defaultValue")).css("color", "#999");
		var t=setTimeout(function(){$('#editplaylist').trigger( "click" );},1000);
		search.isDefaultMsg = true;
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

var mixBuilder = {
	render : function (artistName,trackName) {
		console.log(artistName + '|' + trackName + ':' + search.isDefaultMsg)
		if (search.isDefaultMsg) $('#query').val('');
		$('#errormsg').hide();
		if (!mixBuilder.fromFirstField) $("#related-container" ).show();
		var song_num = $("#topSongs-num").val();
		if (search.dropVal == 'drop-topSongs') {
			//similarTrackPlaylist($.trim(artistName),$.trim(trackName));
			mixBuilder.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="+artistName+"&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+ song_num +"&format=json&callback=?",artistName,trackName)
			search.isDefaultMsg = false;
		} else if (search.dropVal == 'drop-similarSongs'){
			mixBuilder.getJSON("http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="+artistName+"&track="+trackName+"&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+ song_num +"&format=json&callback=?",artistName,trackName)
			search.isDefaultMsg = false;
		} else {
			mixBuilder.getJSON("http://developer.echonest.com/api/v4/playlist/static?api_key=KHXHOPL1UHQ0LU1ES&artist="+artistName+"&type=artist-radio&results="+ song_num,artistName,trackName);
			search.isDefaultMsg = false;
		}
		//var needsUpdate = true;
		//if (needsUpdate) 
			showRelated.artists(artistName);
	},
	search : function () {
		if (search.dropVal == 'drop-topSongs') {
			mixBuilder.render($.trim($("#topSongs-artist").val()),'');
		} else if (search.dropVal == 'drop-similarSongs') {
			mixBuilder.render($.trim($("#similarSongs-artist").val()),$.trim($("#similarSongs-song").val()));
		} else {
			mixBuilder.render($.trim($("#similarSongs-artistOnly").val()),'');
		}
	},
	getJSON : function(apiURL,artistName,trackName) {
		//var song_num = $("#topSongs-num").val();
		$.getJSON(apiURL, function(data) {
			//if (!mixBuilder.songlist) mixBuilder.songlist = '';
			mixBuilder.songlist = '';
			if ((data.toptracks != undefined) && (data.toptracks.track != undefined)) {
				$.each(data.toptracks.track, function(i, item) {
					mixBuilder.songlist += artistName + " - " + item.name + "\n";
				});
			} else if (data.similartracks != undefined) {
				$.each(data.similartracks.track, function(i, item) {
					mixBuilder.songlist += item.artist.name + " - " + item.name + "\n";
				});
			} else if (data.response != undefined) {
				$.each(data.response.songs, function(i, item) {
					mixBuilder.songlist += item.artist_name + " - " + item.title + "\n";
				});
			} else {
				$('#errormsg').show();
				$('#errormsg').html(': ( <br><br>Error loading videos for: '+artistName+'<br><br>Check spelling?');
			}
		})
		.done(function() {
			console.log( "second success" );
		})
		.fail(function() {
			console.log( "error" );
			$('#errormsg').html(': (() <br><br>Error loading videos for: '+artistName+'<br><br>Check spelling?');
		})
		.always(function() {
			//overwrite text list if first search
			if ((search.count === undefined)) {
				$('#query').val(mixBuilder.songlist);
				search.count = 0;
			} else if (($.trim($("#query").val()) == '') || search.isDefaultMsg) {
				$('#query').val(mixBuilder.songlist);
			} else {
				//add to list
				$('#query').val($('#query').val() + mixBuilder.songlist);
				var textarea = document.getElementById('query');
				if (!search.isDefaultMsg) var t=setTimeout(function(){textarea.scrollTop = textarea.scrollHeight;},1000);
			}
			 //$('#search-button').trigger( "click" );
			console.log('hey ' + mixBuilder.fromFirstField);
			if (mixBuilder.fromFirstField) multiSearch();
		});
	},
	fromFirstField : true
};

//legacy codefix
function allSongsBy(artistName) {
        var song_num = $("#topSongs-num").val();
        $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="+artistName+"&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+ song_num +"&format=json&callback=?" , function( data ) {
        	if (!songlist) var songlist= '';
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

 	if (mixBuilder.fromFirstField == true) {
 		multiSearch();
 	} else {
 		mixBuilder.search();
 	}

	$("#ui-id-1").hide();
	//return false;  
 }
});  
$("#topSongs-artist, #topSongs-num, #similarSongs-artist, #similarSongs-song, #similarSongs-artistOnly").click(function (e){
	$(this).select();this.setSelectionRange(0, 9999);
});

$("#mixbuilder-search-button").click(function(){
	mixBuilder.search();
});


var showRelated =  {
	artists : function(artistName) {
		var addString;
		/*
		if (search.dropVal == 'drop-topSongs') {
			//add top songs by 
			$("addString").html(" Top Songs By A Similar Artist: ");
			//+ $("#topSongs-num").val() +
		} else if (search.dropVal == 'drop-similarSongs'){
			$("addString").html(" Songs Similar To (This doesn't work right now, change the dropdown above)");
		} else {
			//add quick mix
			$("addString").html(" Song QuickMix Based On Related Artist: ");
		}
*/
		addString = " Songs By A Related Artist:";
		$.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + artistName + "&limit=40&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&format=json", function(data) {
			var curArtist;
			var artistList = '';
			if (data.similarartists) {
				$.each(data.similarartists.artist, function(i, item) {
					if (item.name) {
						curArtist = item.name.replace(/["']/g, "\\'");
					} else {
						//$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+artistName); 
					}
					artistList += '<a class="similar-artistButton" href="javascript:void(0);" onclick="showRelated.addSongs(\''+ curArtist +'\')">' + item.name + '</a>';
					if (i < data.similarartists.artist.length-1) artistList += " ";
				});
				$("#related-container").html("<br><hr class='similar-top'><span id='similarArtTitle'>Add <span id='similarNum'>"+ $("#topSongs-num").val() +"</span><span id='addString'>"+ addString +"</span></span>&nbsp;" + artistList);
			} else {
				$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+artistName); 
			}
		});
	},
	addSongs : function(curArtist) {
		$('#topSongs-artist').val(curArtist);
		allSongsBy(curArtist,null,false);
		//mixBuilder.render($.trim(curArtist),'');
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
	search.isDefaultMsg = true;
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
	var mobile_width = 795, vidTop = '-72px', vidWidth = '100%', thumbTop = '0px', queryHeight = '200px';
	if ($(window).width() < mobile_width) { 
		vidTop = '-100px'; vidWidth = '100%'; thumbTop = '0px'; queryHeight = '180px';
	}
	var toggleEditText = $("#editplaylist").html();
	if (toggleEditText.indexOf("Edit Playlist") > -1) {
		$("#player-container").animate({top: thumbTop, right: '21px', width: '160px', height: '90px'}, 'fast');
		$('#query').animate({height: '345px'}, 'fast');
		$("#related-container").show();
		$("#ytPlayer-thumb-close").show();
		$("#blast-button-container").css("visibility", "visible");
		$('#mixbuilder-bar').css("visibility", "visible");
		$("#shuffletext").show();
		$("#query-clear").show();
		$("#editplaylist").html(toggleEditText.replace("Edit Playlist","Close Editor"));
	} else {
		$("#query").show();
		$("#logo").animate({marginTop: "2%",'marginBottom': '10px'}, "fast");
		$('#player-container').animate({top: vidTop, right: '0px', width: vidWidth, height: '364px'}, 'fast', function() {
			$('#mixbuilder-bar').css("visibility", "hidden");
			$("#blast-button-container").css("visibility", "hidden");
  		});
		$('#query').animate({height: queryHeight}, 'fast');
		$("#related-container").hide();
		$("#ytPlayer-thumb-close").hide();
		$("#shuffletext").hide();
		$("#editplaylist").html(toggleEditText.replace("Close Editor","Edit Playlist"));
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