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
	search.vidObjArray = {}; //, search.prev_vidObjArray = {};
	search.topvIdArray = []; search.topvTitleArray =[]; search.topvThumbArray = []; search.listArray = [];
	search.vidcount = 0; search.playcount = 0; search.done = false;
	if (!search.count) search.count = 0;
	//hide text form
	$("#text-container" ).hide();
	//show video player
	$('#player-container').show();
	$('#button-container').show();
	$('#youtube-playlist-container').show();
	//erase previous search
	$( "#search-container" ).empty();
	//$('#related-container').hide();
	$('#errormsg').hide();
	$("#editplaylist").html($("#editplaylist").html().replace("Close Editor","Edit Playlist"));
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
	if (searchnum < 1) { 
		$('#errormsg').show();
		$('#errormsg').html('Put a list of songs into the textbox. <br>(Load songs by artist, copy and paste a text list, load an RSS Feed, or type)');
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
    $("#ui-id-1").hide();
    //return false;  
 }
});  
$("#playallsongsby-artist").click(function(){
	$(this).focus();$(this).select();this.setSelectionRange(0, 9999);
});
$("#playall-button").click(function(){
	allSongsBy($("#playallsongsby-artist").val());
});

function showRelated(artistName) {
     $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + artistName + "&limit=20&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&format=json", function(data) {
     	var curArtist;
        var artistList = '';
        if (data.similarartists) {
	        $.each(data.similarartists.artist, function(i, item) {
	        	if (item.name) {
	        		curArtist = item.name.replace(/["']/g, "\\'");
	        	} else {
	        		$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+artistName); 
	        	}
	            artistList += '<a href="javascript:void(0);" onclick="$(\'#playallsongsby-artist\').val(\''+ curArtist +'\');allSongsBy(\''+ curArtist +'\');return false;">' + item.name + '</a>';
	            if (i < data.similarartists.artist.length-1) artistList += " &bull; ";
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


$("#editplaylist").click(function(){
	editSearchTerm(0);
});
$(".closebutton").click(function(){
	$("#text-container" ).slideToggle("fast");
	$('#player-container').slideToggle("fast");
	//if ($(window).width() < mobile_width) $("#pb-icon" ).hide();
	//$("#query").animate({height:'240px'},200);
	//$("#logo").animate({height:'0px',width:'100%',marginBottom:'20px'});
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