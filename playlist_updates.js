// Some variables to remember state.
var playlistId, channelId;

// Create a public playlist.
function createPlaylist() {
  var request = gapi.client.youtube.playlists.insert({
    part: 'snippet,status',
    resource: {
      snippet: {
        title: $('#playlist-title').val(),
        description: 'Playlist created with Mixblast - http://l4nd.com/mixblast'
      },
      status: {
        privacyStatus: 'public'
      }
    }
  });
  request.execute(function(response) {
    var result = response.result;
	
    if (result) {
      playlistId = result.id;
      $('#playlist-id').val(playlistId);
      $('#playlist-url-copy').val('http://youtube.com/playlist?list='+playlistId);
      //$('#playlist-url').append('<iframe width="560" height="315" src="//www.youtube.com/embed/videoseries?list='+playlistId+'" frameborder="0" allowfullscreen></iframe><br>');
      $('#playlist-url').append('<a href="http://youtube.com/playlist?list='+playlistId+'" target="_blank">Click here to to view your playlist</a><br><br>');
      $('#playlist-url').append('<a href="https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent('http://youtube.com/playlist?list='+playlistId)+'&p[images][0]=http://l4nd.com/mixblast/img/mixblast-logo4.png" target="_blank">Blast your mix to Facebook</a><br><br>');

      $('#playlist-title').val(result.snippet.title);

	  
  		multiAddVideosToPlaylist();
		
    } else {
      alert("Uh oh. Could not create playlist. \n\nMake sure your youtube account has a \"youtube channel.\" You can do this by creating at least one playlist on youtube.com. \n\nOr try logging out of youtube and logging in again, then refresh mixblast. Sorry 'bout that.");
    }
  });
  
  $("#playlist-url").show();
}

function multiAddVideosToPlaylist() {
	//add topvIdArray to playlist, setInterval to stagger api requests
	var x = 0;
	var interval = setInterval(function() {
		$('#playlist-status').html('Generating YouTube Playlist... (Don\'t leave this page) '+x+' of '+topvIdArray.length);
		addToPlaylist(topvIdArray[x]);
		x++;
		if(x==topvIdArray.length+1) {
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
