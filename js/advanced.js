//load rss from querystring on load
$(document).ready(function () {
	rssfeed = getParameterByName('rss');
	if (rssfeed) loadRSS(rssfeed);
	
	//load hidden query 2 textarea for manipulating text
	$("#query2").val($("#query").val());
	prevtext_state = $("#query").val();
});
$("#advanced").click(function(){
	$('#advanced-container').slideToggle("fast");
	editTextList();
});
$('#pb-button').click(function(e){
	if($('#pb-menu').css('left')=='0px'){
		pastBlasts.hide();
	}else{
		pastBlasts.display();
		e.stopPropagation();
	}
});
$(".infolink").click( function (e){
		infoBlast.display();
		e.stopPropagation();
});
$("#rss-dropdown").change(function() {
	loadRSS($(this).val());
});
$("#rss-button").click(function() {
	loadRSS($('#rss-dropdown').find(":selected").val());
});
$('#addartist').focusout(function() {
	$("#query2").val($("#query").val());
});

var newartist = $("#addartist");   
$('#addartist').keyup(function() {
	addArtist();
});
$("#addartist_button").click(function(){
	var arrayOfLines = result.val().split("\n");
	var newquery = '';
	//var newquery_arr = [];
	$.each(arrayOfLines, function(i, item) {
		newquery += newartist.val()+" "+item+"\n";
		//newquery_arr.push(newartist + $.trim(item));
	});
});
$("#frbutton").click(function(){
	findReplace();
});
$("#removenums").click(function(){
	removeNumbas();
});
$("#removeparenths").click(function(){
	removeParentheticals();
});
$("#magic").click(function(){
	magicSongExtractor();
});

//do stuff on paste
$("#query").bind("paste", function(){
	var elem = $(this);
	setTimeout(function() {
		var text = elem.val(); 
		//populate query2
		$("#query2").val(text);
		prevtext_state = text;
		$('input#removenums').prop('checked', true);
		removeNumbas();
		$('input#removeparenths').prop('checked', true);
		removeParentheticals();

		console.log(text);
	}, 100);
});

function editTextList() {
	$("#mixbuilder-buttons").css("visibility", "visible");
	$("#logo-wrapper").animate({ 'width':'50%', 'height':'50px', 'margin-bottom': '20px', 'margin-top': '20px' }, "fast");
	$("#query").show();
	$("#query2").val($("#query").val());
	$("#related-container").hide(); $("#related-more").hide();
    $("#mixbuilder-search-button").show();
}

function addArtist() {
	var query2 = $("#query2"); 
	var arrayOfLines = query2.val().split("\n");
	//var newquery = '';
	var newquery_arr = [];
	$.each(arrayOfLines, function(i, item) {
		//newquery += newartist.val()+" "+item+"\n";
		newquery_arr.push(newartist.val() + $.trim(item));
	});
	var newqt = newquery_arr.join("\n");
	$("#query").val(newqt);
	/*
	delay(function(){
		//$("#query2").val($("#query").val());
		alert('delay!');
	}, 1000 );
	*/
}

function removeNumbas() {
	var query = $("#query").val();
	if ($('input#removenums').is(':checked')) {
		prevtext_state = query;
		var lines = query.split(/\n/); 
		query = "";
		for (var i=0; i < lines.length; i++) {
		  if (/\S/.test(lines[i])) {
			query += lines[i].replace(/^\d+\s*[-\\.)#]?\s+/, "") + "\n"; 
		  }
		}
		$("#query").val(query);
	} else {
		$("#query").val(prevtext_state);
	}
}

function removeParentheticals() {
	var query = $("#query").val();
	if ($('input#removeparenths').is(':checked')) {
		prevtext_state = query;
		query = query.replace(/ *\([^)]*\) */g, " ");
		query = query.replace(/\[.*?\]/g, " ");
		//only get non-whitespace lines
		var lines = query.split(/\n/);
		for (var i=0; i < lines.length; i++) {
		  if (/\S/.test(lines[i])) {
			$("#query").val(query);
		  }
		}
	} else {
		$("#query").val(prevtext_state);
	}
}

function magicSongExtractor() {
	/*
	var query = $("#query").val();
	var re = /^(?:.*\\)?(.*) +\- +(.*)\..*g; 
	query = query.replace(re, "");
	$("#query").val(query);
	*/
}


//load .txt or .m3u playlist
function readMultipleFiles(evt) {
	//retrieve all the files from the FileList object
	var files = evt.target.files;
	
	if (files) {
		for (var i = 0, f; f = files[i]; i++) {
			var r = new FileReader();
			r.onload = (function (f) {
				return function (e) {
					var contents = e.target.result;
					//alert(contents);
					var lines = contents.split("\n");
					var songArray = [];
					var songStr = '';
					//if it is an m3u, parse it
					if ($.trim(lines[0]) == '#EXTM3U') {
						//read every other line
						for (var i=1; i < lines.length; i+=2) {
							songArray = lines[i].split(",");
							songStr = songStr + $.trim(songArray[1]) + "\n";
							//remove useless keywords
							songStr = songStr.replace("(DatPiff Exclusive)","");
							$("#query").val(songStr);
						}
					} else {
						$("#query").val(contents);
					}
				};
			})(f);
			r.readAsText(f);
		}
		search.isDefaultMsg = false;
	} else {
		alert("Failed to load files");
	}
}
document.getElementById('fileinput').addEventListener('change', readMultipleFiles, false);

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function parseXml(data) {
	if ($('#mixbuilder-search-button').is(':hidden')) {
		$("#logo-wrapper").animate({ 'width':'50%', 'height':'50px', 'marginBottom': '20px', 'marginTop': '20px' }, "fast");
		$("#query").show();
    	$("#mixbuilder-search-button").show();
	}
	$("#query").val("");
	var stripNums = false;
	var stripParen = false;
	var searchTerms;
	$.each(data.responseData.feed.entries, function (i, e) {
		if (rssfeed.indexOf('digitaldripped') >= 0) {
			searchTerms = e.link.substr(e.link.lastIndexOf("/") + 1);
			searchTerms = searchTerms.replace(/[-]/g," ");
			searchTerms = searchTerms.substring(0, searchTerms.indexOf('.'));
		} else if (rssfeed.indexOf('hotnewhiphop') >= 0) {
			if ((e.title.indexOf('- ') >= 0) || (e.title.indexOf('Video') >= 0)) { searchTerms = e.title; searchTerms = searchTerms.replace('Video',''); } else { searchTerms=''; }
		} else if (rssfeed.indexOf('rapradar') >= 0) {
			searchTerms = e.title; searchTerms = e.title.replace(/New Video: |New Music: |New LP: |New Mixtape: /g,''); 
		} else if (rssfeed.indexOf('allhiphop') >= 0) {
			if (e.title.indexOf('“') >= 0) { searchTerms = e.title; searchTerms = e.title.replace(/“|”|\[VIDEO\] |PREMIERE: |FRESH HEAT |HEATER OF THE DAY: /g,''); } else { searchTerms=''; }
		} else if (rssfeed.indexOf('nah_right') >= 0) {
			searchTerms = e.title.replace(/Video: |Audio:/g,'');
		} else if (rssfeed.indexOf('SouthernSweetTea') >= 0) {
			searchTerms = e.title.replace(/Video: |Audio: |Mixtape: |EP: /g,''); searchTerms = $.trim(searchTerms);
		} else if (rssfeed.indexOf('worldstar') >= 0) {
			if ((e.title.indexOf('- ') >= 0) || (e.title.indexOf('Video') >= 0)) { 
				searchTerms = e.title; searchTerms = $("<textarea/>").html(searchTerms).text();
				searchTerms = searchTerms.replace('Video',''); stripParen = true;}
			else { searchTerms=''; }
		} else if (rssfeed.indexOf('stereogum') >= 0) {
				searchTerms = e.title.replace(/“|”/g,'');
				stripParen = true;
		} else if (rssfeed.indexOf('AlbumOfTheYear') >= 0) {
				searchTerms = e.title; searchTerms = e.title.replace(/New Track: |Video: |Video: |Listen: |First Listen: /g,''); searchTerms = $("<textarea/>").html(searchTerms).text(); 
		} else if (rssfeed.indexOf('metacritic') >= 0) {
				searchTerms = e.title; searchTerms = $("<textarea/>").html(searchTerms).text();
		} else if (rssfeed.indexOf('tinymixtapes') >= 0) {
			stripNums = true; stripParen = true;
			searchTerms = e.content;
			var lines = searchTerms.split('\n');
			var cleanlines = [];
			//lines.splice(0,3);
			$.each(lines, function(i, item) {
			   if (item.indexOf('- ') >= 0) {
				cleanlines.push(item.replace(/<br>/g,'').replace(/<p>/g,'').replace(/<\/p>/g,'\n'));
			   } else { searchTerms=''; }
			});
			searchTerms = cleanlines.join('\n');
		} else if (rssfeed.indexOf('billboard.com') >= 0) {
			searchTerms = e.content.replace(/ranks /g,'');
			searchTerms = searchTerms.replace('by','-');
			searchTerms = searchTerms.substring(0, searchTerms.indexOf('#'));
			//searchTerms = e.description + ' - ' + e.title.replace(/^\d+\s*[-\\:)#]?\s+/, "");
		} else {
			searchTerms = e.title;
		}

		if (searchTerms) {
			console.log(searchTerms);
			$("#query").val($("#query").val()+searchTerms+'\r');
		}
	});
	if (stripNums) { $('input#removenums').prop('checked', true); removeNumbas(); }
	if (stripParen) { $('input#removeparenths').prop('checked', true); removeParentheticals(); }
}
function loadRSS(rssfeedurl) {
	rssfeed = rssfeedurl;
	if (!rssfeed) return;

	$.ajax({
		type: 'GET',
		url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=100&output=json&q='+rssfeed,
		crossDomain: true,
		dataType: 'jsonp',
		success: parseXml
	});

	if (history.pushState) {
		var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?rss="+rssfeed;
		window.history.pushState({path:newurl},'',newurl);
	}
	$('#rss-dropdown').val(rssfeed);
}
function findReplace() {
	var find = $("#find").val();
	find = new RegExp(find, "gi");
	var replace = $("#replace").val();   
	var arrayOfLines = $("#query2").val().split("\n");
	var newquery_arr = [];
	$.each(arrayOfLines, function(i, item) {
	   newquery_arr.push(item.replace(find, replace));
	});
	var newqt = newquery_arr.join("\n");
	$("#query").val(newqt);
	$("#query2").val($("#query").val());
}
var add = (function () {
	var counter = 0;
	return function () {return counter += 1;};
})();

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
	clearTimeout (timer);
	timer = setTimeout(callback, ms);
  };
})();

/* AutoComplete */
$(function() {
	function split( val ) {
	  return val.split( /\n\s*/ );
	}
	function extractLast( term ) {
	  return split( term ).pop();
	}
	$("#mixbuilder-artist, #mixbuilder-song, #mixbuilder-album, #query").autocomplete({
		source: function(request, response){
			var apiKey = 'AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM';
			var query = extractLast( request.term );
			$.ajax({
				url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q="+query+"&key="+apiKey+"&format=5&alt=json&callback=?",
				dataType: 'jsonp',
				success: function(data, textStatus, request) { 
				   response( $.map( data[1], function(item) {
						return {
							label: item[0],
							value: item[0]
						};
					}));
				}
			});
		},
		search: function() {
		  // custom minLength
		  var term = extractLast( this.value );
		  if ( term.length < 2 ) {
			return false;
		  }
		},
		focus: function( event, ui ) {
		  //var menu = $(this).data("ui-autocomplete").menu.element;
		  //var focused = menu.find("li:has(a.ui-state-focus)");
		  //focused.css('background-color', 'rgba(0,0,0,0.5)');
		  var terms = split( this.value );
		  terms.pop();
		  terms.push( ui.item.value );
		  this.value = terms.join( "\n" );
		  terms.pop();
		  return false;
		},
		select: function( event, ui ) {
		  var terms = split( this.value );
		  // remove the current input
		  terms.pop();
		  // add the selected item
		  terms.push( ui.item.value );
		  // add placeholder to get the \n-and-space at the end
		  terms.push( "" );
		  this.value = terms.join( "\n" );
			var originalEvent = event;
			while (originalEvent) {
				if (originalEvent.keyCode == 13) originalEvent.stopPropagation();

				if (originalEvent == event.originalEvent) break;
				originalEvent = event.originalEvent;
			}
		  return false;
		},
		appendTo: "#mixbuilder-bar"
	});
});