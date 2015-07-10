var vidObjArray = {}, prev_vidObjArray = {};
var	topvIdArray = [], topvTitleArray =[], topvThumbArray = [], searchArray = [];
var vidcount = 0, playcount = 0, searchcount = 0;
var mobile_width = 666;

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

//var searchnum;
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
	//$("#closebutton-thumb").html("<img src='"+ topvThumbArray[0] +"' id='thumb'>"); 
	topvIdArray.length = 0; topvTitleArray.length = 0; topvThumbArray.length = 0;
	searchArray.length = 0;

	pastBlasts.add($('#query').val());
	if ($(window).width() < mobile_width) $("#pb-icon" ).hide();

	//split texarea into lines
	var lines = $('#query').val().split(/\n/);
	//only get non-whitespace lines, push into searchArray
	for (var i=0; i < lines.length; i++) {
	  if (/\S/.test(lines[i])) {
	    searchArray.push($.trim(lines[i]));
	  }
	}
	
	var x = 0;
	var searchnum = searchArray.length;
	if (searchnum < 1) { 
		$('#errormsg').show();
		$('#errormsg').html('Put a list of songs into the textbox. <br>(Load songs by artist, copy and paste a text list, or type)');
		editSearchTerm(0); 
		return false; 
	}

	//$("#query").animate({height:'200px',width:'595px'},200);
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

