// Some variables to remember state.
var playlistId, channelId;

// Create a public playlist.
function createPlaylist() {
  var request = gapi.client.youtube.playlists.insert({
	part: 'snippet,status',
	resource: {
	  snippet: {
		title: $('#playlist-title').val(),
		description: 'Playlist created with Mixblast - http://mixbla.st \n' //+ $('#query').val()
	  },
	  status: {
		privacyStatus: 'public'
	  }
	}
  });
  request.execute(function(response) {
	var result = response.result;
console.log(result);	
	if (result) {
	  playlistId = result.id;
	  $('#playlist-id').val(playlistId);
	  $('#playlist-url-copy').val('http://youtube.com/playlist?list='+playlistId);
	  $('#playlist-url').append('<a href="http://youtube.com/playlist?list='+playlistId+'" target="_blank">Click here to to view your playlist</a><br><br>');
	  $('#playlist-url').append('<a href="https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent('http://youtube.com/playlist?list='+playlistId)+'&p[images][0]=http://mixbla.st/img/mixblast-logo8.png" target="_blank">Blast your mix to Facebook</a><br><br>');

	  $('#playlist-title').val(result.snippet.title);

	  
  		multiAddVideosToPlaylist();
		
	} else {
	  alert("Uh oh. Could not create playlist. Make sure you're signed in to Youtube. It should say (200 video limit) instead of (Sign in).\n\nIf you are logged in, try logging out of youtube.com, then refresh mixblast, then sign in again. Sorry 'bout that.\n\nMake sure your youtube account has a \"youtube channel.\" You can do this by creating at least one playlist on youtube.com. ");
	}
  });
  
  $("#playlist-url").show();
}

function multiAddVideosToPlaylist() {
	//add topvIdArray to playlist, setInterval to stagger api requests
	var x = 0;
	var plLimit = search.topvIdArray.length+1;
	if (plLimit > 199) plLimit = 199;
	var interval = setInterval(function() {
		$('#playlist-status').html('Generating YouTube Playlist... (Don\'t leave this page) '+x+' of '+search.topvIdArray.length);
		addToPlaylist(search.topvIdArray[x]);
		x++;
		if(x==plLimit) {
			clearInterval(interval);
			$('#playlist-status').html('Done!');
			//alert("Loop complete");
		}
	}, 200);//500
	//scroll to bottom
	var t=setTimeout(function(){window.scrollTo(0,document.body.scrollHeight)},700);
}


// Add a video id from a form to a playlist.
function addVideoToPlaylist() {
  addToPlaylist($('#video-id').val());
}

// Add a video to a playlist.
function addToPlaylist(id, startPos, endPos) {
  var details = {
	videoId: id,
	kind: 'youtube#video'
  }
  if (startPos != undefined) {
	details['startAt'] = startPos;
  }
  if (endPos != undefined) {
	details['endAt'] = endPos;
  }
  var request = gapi.client.youtube.playlistItems.insert({
	part: 'snippet',
	resource: {
	  snippet: {
		playlistId: playlistId,
		resourceId: details
	  }
	}
  });
  request.execute(function(response) {
	$('#status').html('<pre>' + JSON.stringify(response.result) + '</pre>');
  });
}
