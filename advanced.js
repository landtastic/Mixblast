//load rss from querystring on load
$(document).ready(function () {
    rssfeed = getParameterByName('rss');
    if (rssfeed) loadRSS(rssfeed);
});

$("#advanced").click(function(){
    $('#advanced-container').slideToggle("fast");
    //hidden query textarea, fill with data to manipulate
    $("#query2").val($("#query").val());
});
$(".infolink").click(function(){
    what();
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
var query2 = $("#query2"); 
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
    var query = $("#query").val();
    query = query.replace(/ *\([^)]*\) */g, "");
    query = query.replace(/\[.*\] /g, "");
    $("#query").val(query);
});
$("#magic").click(function(){
    magicSongExtractor();
});

$("#query").bind("paste", function(){
    var elem = $(this);

    setTimeout(function() {
        // gets the copied text after a specified time (100 milliseconds)
        $('input#removenums').attr('checked', 'checked');
        removeNumbas();
        var text = elem.val(); 
        console.log(text);
    }, 100);
});

function addArtist() {
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
    var prev_query = query;
    if ($('input#removenums').is(':checked')) {
 //       $('input#removenums').attr('checked', false);
 //       $("#query").val(prev_query);
        console.log($('input#removenums').is(':checked'));
    }
//    } else {
        query = query.replace(/\d+\./g, ""); 
        query = query.replace(/\d+\s/g, ""); 
        query = query.replace(/\d+#/g, ""); 
        //only get non-whitespace lines
        var lines = query.split(/\n/);
        for (var i=0; i < lines.length; i++) {
          if (/\S/.test(lines[i])) {
            $("#query").val(query);
          }
        }
        $('input#removenums').attr('checked', 'checked');
  //  }
}

function magicSongExtractor() {
    /*
    var query = $("#query").val();
    var re = /^(?:.*\\)?(.*) +\- +(.*)\..*g; 
    query = query.replace(re, "");
    $("#query").val(query);
    */
}

function what() {
    alert('What\'s the point of this?\n\nMixblast searches Youtube for lots of videos all at once, and gathers them for you into a playlist.\n\nCopy and paste a plain text list, or load an RSS feed. Mixblast will search each line of text for the top video.\n\nIf a video is the wrong version, click the refresh icon next to it. Make sure each line of text only has the artist and song title, and no other junk. The advanced options will help you with that. \n\nWelp, see ya later.')
}

var demoOn = false;
function showDemo(){
    var demoarray = ["Booty work - t-pain", "Legowelt Memphis Rap Mix II The Legend Continues", "Led Zeppelin - The Ocean", "Ty$ - The Man", "little black egg the nightcrawlers", "Dr. Dre - The Next Episode", "Love - The Red Telephone", 
    "Bangladesh - 100", "the velvet underground & nico full album", "cool reggae chameleon (extended mix)", "Wamp Wamp ft Slim Thug    Clipse", "Feelies - Crazy Rhythms -album", "hologram - the urinals", "Blow the Whistle  Too Short", 
    "Karate Chop - Future", "kanye west - mercy", "moon duo - scars", "d4l - laffy taffy", "fm$ - new boyz official", "danny glover - young thug", "The Germs- Lexicon Devil", "left, right - dj mustard audio", "Planet of the Dreamers - Jacuzzi Boys", 
    "She Cracked - Modern Lovers", "numbers on the boards - pusha t", "imaginary person - ty segall", "my sunshine - ty segall", "lean wit it, rock wit it - dem franchize boyz", "vitamin c - can", "up my alley - gucci mane", "health - die slow", 
    "I'm straight - Modern Lovers", "Led Zeppelin - Out on the Tiles", "I Found That Essence Rare - Gang Of Four", "There But for the Grace of God Go I - The Gories", "You Set The Scene - Love", "Today Was a Good Day - Ice Cube", 
    "Crosstown Traffic - Jimi Hendrix", "Popul Vuh - In den Garten Pharoas", "Can - Oh Yeah, Paperhouse, Spray", "Faust - Giggy Smile", "Amon Duul II - Chewing Gum Telegram", "Gila - Aggresson", "Neu! -  Hallogallo", 
    "Dzyan - Electric Silence, For Earthly Thinking", "A.R. & Machines - Globus", "Amon Duul II - Archangel's Thunderbird", "Can -Dying Butterfly", "Faust - Knochentanz", "Cluster - Live In Der Fabrik", "Guru Guru - Stone In", 
    "Neu! - Negativland", "Walter Wegmuller - Der Wagen", "Sergius Golowin - Der Hoch-Zeit", "microphones - universe", "Television - Marquee Moon", "Rappin 4-tay - Playaz Club", "Bam Bam - Sister Nancy","ZZ Top - Thug",
    "Baauer Ft Rae sremmurd one touch","Jae Murphy - You Playin"];
    shuffle(demoarray);
    firsttwenty_arr = demoarray.splice(0, 20);
    var demotext =  firsttwenty_arr.join("\n");
    var prevtext = JSON.parse(localStorage.getItem('mixfile'));
    if (demoOn == false) {
        $("#query").val(demotext);
        demoOn = true;
    } else {
        $("#query").val(prevtext);
        demoOn = false;
    }
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
							var songArray = lines[i].split(",");
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
    } else {
        alert("Failed to load files");
    }
}
document.getElementById('fileinput').addEventListener('change', readMultipleFiles, false);


function editSearchTerm(lineNumber) {
	$("#text-container" ).slideToggle("fast");
	$('#player-container').slideToggle("fast");
	$(".closebutton").show();
	
    var input = $("#query");
    var lineHeight = 1.14;
    input.scrollTop(lineNumber * lineHeight);
    window.scrollTo(0, 0);
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function parseXml(data) {
	$("#query").val("");
	$.each(data.responseData.feed.entries, function (i, e) {
		if (rssfeed.indexOf('digitaldripped') >= 0) {
			var searchTerm = e.link.substr(e.link.lastIndexOf("/") + 1);
			searchTerm = searchTerm.replace(/[-]/g," ");
			searchTerm = searchTerm.substring(0, searchTerm.indexOf('.'));
        } else if (rssfeed.indexOf('hotnewhiphop') >= 0) {
            if ((e.title.indexOf('- ') >= 0) || (e.title.indexOf('Video') >= 0)) { searchTerm = e.title; searchTerm = searchTerm.replace('Video',''); }
        } else if (rssfeed.indexOf('nah_right') >= 0) {
            searchTerm = e.title.replace(/Video: |Audio:/g,'');
        } else if (rssfeed.indexOf('SouthernSweetTea') >= 0) {
            searchTerm = e.title.replace(/Video: |Audio: |Mixtape: |EP: /g,''); searchTerm = $.trim(searchTerm);
        } else if (rssfeed.indexOf('worldstar') >= 0) {
            if ((e.title.indexOf('- ') >= 0) || (e.title.indexOf('Video') >= 0)) { searchTerm = e.title; searchTerm = searchTerm.replace('Video',''); }
        } else {
			var searchTerm = e.title;
		}

        if (searchTerm) {
            $("#query").val($("#query").val()+searchTerm+'\r');
        }
	});
}
function loadRSS(rssfeedurl) {
    rssfeed = rssfeedurl;
    if (rssfeed==''||rssfeed==undefined||!rssfeed) return;

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
    var find = new RegExp(find, "gi");
    var replace = $("#replace").val();   
    var arrayOfLines = query2.val().split("\n");
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
    return function () {return counter += 1;}
})();

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();