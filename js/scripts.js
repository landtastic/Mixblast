function checkAuth(){gapi.auth.authorize({client_id:OAUTH2_CLIENT_ID,scope:OAUTH2_SCOPES,immediate:!0},handleAuthResult)}function handleAuthResult(e){e&&!e.error?($(".pre-auth").hide(),$(".post-auth").show(),loadAPIClientInterfaces()):($(".pre-auth").css("display","block !important"),$(".pre-auth").show(),gapi.client.load("youtube","v3",handleAPILoaded),$("#login-link").click(function(){gapi.auth.authorize({client_id:OAUTH2_CLIENT_ID,scope:OAUTH2_SCOPES,immediate:!1},handleAuthResult)}))}function loadAPIClientInterfaces(){gapi.client.load("youtube","v3",function(){handleAPILoaded()})}if("localhost"==document.location.hostname)var OAUTH2_CLIENT_ID="1069965346841-omq120306nl685roud6bvdut0dnka460.apps.googleusercontent.com";else var OAUTH2_CLIENT_ID="1069965346841-uggqc6vqcna4j32gfncdbaaq39elcc02.apps.googleusercontent.com";var OAUTH2_SCOPES=["https://www.googleapis.com/auth/youtube"];googleApiClientReady=function(){gapi.auth.init(function(){window.setTimeout(checkAuth,1)})};
function multiSearch(){editSearchTerm(0),search.vidObjArray={},search.topvIdArray=[],search.topvTitleArray=[],search.topvThumbArray=[],search.listArray=[],search.vidcount=0,search.playcount=0,search.done=!1,search.count||(search.count=0),$("#player-container").show(),$("#button-container").show(),$("#search-container").empty(),$("#errormsg").hide(),$("#advanced-container").hide(),$("#youtube-playlist-container").show(),$("#backToTop").show(),$("#mixbuilder-buttons").show(),$("#mixbuilder-bar").hide(),mixfile=$("#query").val(),localStorage.setItem("mixfile",JSON.stringify(mixfile)),search.topvIdArray&&(search.topvIdArray.length=0,search.topvTitleArray.length=0,search.topvThumbArray.length=0,search.listArray.length=0),pastBlasts.add($("#query").val());for(var e=$("#query").val().split(/\n/),t=0;t<e.length;t++){var a=e[t];/\S/.test(a)&&(a.match(/watch\?v=([a-zA-Z0-9\-_]+)/)&&(a=stripYoutubeUrls(a),console.log("youtube found. "+a)),search.listArray.push($.trim(a)))}var r=0,i=search.listArray.length;if(1>i){$("#errormsg-txt").html("Error. <br>No videos found. Please try again.");setTimeout(function(){$("#editplaylist").trigger("click")},1e3);return $("#errormsg").show(),!1}$.each(search.listArray,function(e){$("#search-container").append("<div class='searchresult "+e+"'></div>"),$.when(search(search.listArray[e],e)).done(function(){})}),r==i&&($("#playlist-button").attr("disabled",!1),$("#shufflebutton").removeClass("disabled"),search.done=!0),search.count++}function allSongsBy(e,t){if(!t)var t=$("#topSongs-num").val();$.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="+e+"&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+t+"&format=json&callback=?",function(t){if(!a)var a="";if(void 0!=t.toptracks&&void 0!=t.toptracks.track){$.each(t.toptracks.track,function(t,r){a+=e+" - "+r.name+"\n"}),void 0===search.count?($("#query").val(a),search.count=0):$("#query").val($("#query").val()+a),$("#search-button").trigger("click");var r=document.getElementById("query");setTimeout(function(){r.scrollTop=r.scrollHeight},1e3)}else $("#errormsg").show(),$("#errormsg-txt").html(": ( <br><br>Error loading videos by: "+e+"<br><br>Check spelling?")})}function dropdownSwitcher(){"drop-similarSongs"==search.dropVal?($("#mixbuilder-artist").show().addClass("col-sm-6"),$("#mixbuilder-song").show().addClass("col-sm-6"),$("#mixbuilder-album").hide(),$("#songNum").css("display","inline-block")):"drop-album"==search.dropVal?($("#mixbuilder-artist").show().addClass("col-sm-6").focus(),$("#mixbuilder-song").hide(),$("#mixbuilder-album").show().addClass("col-sm-6")):"drop-paste"==search.dropVal?(editTextList(),$("#mixbuilder-artist").hide(),$("#mixbuilder-song").hide(),$("#mixbuilder-album").hide()):($("#mixbuilder-artist").show().removeClass("col-sm-6").addClass("col-sm-12"),$("#mixbuilder-song").hide(),$("#mixbuilder-album").hide(),$("#songNum").css("display","inline-block")),$("#queryarea").is(":visible")&&$("#mixbuilder-buttons div").not(":eq(0)").show(),"drop-quickMix"==search.dropVal||"drop-topAlbums"==search.dropVal||"drop-album"==search.dropVal||"drop-paste"==search.dropVal?$("#songNum").hide():$("#songNum").show(),localStorage.setItem("dropdown-lastvalue",search.dropVal)}function editSearchTerm(){var e=$("#editplaylist").html(),t="205px";if($(document).width()<992){t="40px"}e.indexOf("Edit Playlist")>-1?($("#player-container").css({position:"fixed",bottom:"0px",right:"0px",width:"360px",height:"202.5px"}),$("#queryarea").show(),$("#query").animate({height:"345px"},"fast",function(){$("#related-container").show(),$("#related-more").show()}),$("#player-thumb-close").show(),$("#mixbuilder-bar").show(),$("#mixbuilder-buttons").show(),$("#editplaylist").html(e.replace("Edit Playlist","Close Playlist Editor"))):($("#related-container").hide(),$("#related-more").hide(),$("#query").show(),$("#queryarea").hide(),$("#player-container").css({position:"initial",width:"99.5vw",height:"364px"},function(){$("#mixbuilder-bar").hide()}),$("#query").animate({height:t},"fast"),$("#player-thumb-close").hide(),$("#mixbuilder-buttons").show(),$("#editplaylist").html(e.replace("Close Playlist Editor","Edit Playlist")))}function stripYoutubeUrls(e){return e=e.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/),void 0!==e[2]?e[2].split(/[^0-9a-z_\-]/i)[0]:e[0]}var search=function(e,t){var a=e,r=t,i=gapi.client.youtube.search.list({q:a,part:"snippet",maxResults:20});return i.execute(function(e){var t=e.result,a=[],i=[],s=[];t||console.log("bad search: "+r),$.each(t.items,function(e,t){var l=t.id.videoId,o=t.snippet.title;if(void 0!=t.snippet.thumbnails["default"].url)var n=t.snippet.thumbnails["default"].url;void 0===l&&(l="Not Found",o="Not Found. Try version refresh button: ",n="img/notfound.png"),a.push(l),i.push(o),s.push(n),search.vidObjArray[r]={vid:a,title:i,thumb:s},0===e&&(search.topvIdArray.push(l),search.topvTitleArray.push(o),search.topvThumbArray.push(n),1==search.topvIdArray.length&&1==search.count&&loadVid(search.topvIdArray[0],0,"medium"),createPlaylistItem(r,n,l,o),r++)})}),!0},mixBuilder={render:function(e,t,a){var r=$("#topSongs-num").val();"drop-topSongs"==search.dropVal?mixBuilder.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="+e+"&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+r+"&format=json&callback=?",e,t,a):"drop-similarSongs"==search.dropVal?mixBuilder.getJSON("http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="+e+"&track="+t+"&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+r+"&format=json&callback=?",e,t,a):"drop-topAlbums"==search.dropVal?mixBuilder.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist="+e+"&api_key=946a0b231980d52f90b8a31e15bccb16&limit=100&format=json&callback=?",e,t):"drop-album"==search.dropVal?mixBuilder.getJSON("http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist="+e+"&album="+a+"&api_key=946a0b231980d52f90b8a31e15bccb16&limit="+r+"&format=json&callback=?",e,t,a):"drop-quickMix"==search.dropVal?(mixBuilder.getJSON("http://developer.echonest.com/api/v4/playlist/static?api_key=KHXHOPL1UHQ0LU1ES&artist="+e+"&type=artist-radio&results=100",e,t),console.log("http://developer.echonest.com/api/v4/playlist/static?api_key=KHXHOPL1UHQ0LU1ES&artist="+e+"&type=artist-radio&results=100")):(console.log("dropdown not selected"),mixBuilder.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="+e+"&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&limit=100&format=json&callback=?",e,t,a)),showRelated.artists(e)},search:function(){"drop-similarSongs"==search.dropVal?mixBuilder.render($.trim($("#mixbuilder-artist").val()),$.trim($("#mixbuilder-song").val()),""):"drop-album"==search.dropVal?mixBuilder.render($.trim($("#mixbuilder-artist").val()),"",$.trim($("#mixbuilder-album").val())):mixBuilder.render($.trim($("#mixbuilder-artist").val()),"","")},getJSON:function(e,t,a){$.getJSON(e,function(e){mixBuilder.songlist="",void 0!=e.toptracks&&void 0!=e.toptracks.track?$.each(e.toptracks.track,function(e,a){mixBuilder.songlist+=t+" - "+a.name+"\n"}):void 0!=e.similartracks?(mixBuilder.songlist=t+" - "+a+"\n",$.each(e.similartracks.track,function(e,t){mixBuilder.songlist+=t.artist.name+" - "+t.name+"\n"})):void 0!=e.topalbums?(mixBuilder.songlist="",$.each(e.topalbums.album,function(e,a){mixBuilder.songlist+=t+" - "+a.name+" - album\n"})):void 0!=e.album?(mixBuilder.songlist="",$.each(e.album.tracks.track,function(e,t){mixBuilder.songlist+=t.artist.name+" - "+t.name+"\n"})):void 0!=e.response?$.each(e.response.songs,function(e,t){mixBuilder.songlist+=t.artist_name+" - "+t.title+"\n"}):($("#errormsg").show(),$("#errormsg-txt").html(": ( <br><br>Error loading videos for: "+t+"<br><br>Check spelling?"))}).done(function(){}).fail(function(){console.log("error"),$("#errormsg").show(),$("#errormsg-text").html(e+" : (() <br><br>Error loading videos for: "+t+"<br><br>Check spelling?")}).always(function(){if(void 0===search.count)$("#query").val(mixBuilder.songlist),search.count=0;else if(""==$.trim($("#query").val()))$("#query").val(mixBuilder.songlist);else{$("#query").val($("#query").val()+mixBuilder.songlist);var e=document.getElementById("query");setTimeout(function(){e.scrollTop=e.scrollHeight},1e3)}$("#queryarea").is(":visible")||$("#search-button").trigger("click")})}};$(".dropdown-menu li").click(function(e){var t=$(e.currentTarget);return search.dropVal=this.id,dropdownSwitcher(),t.closest(".btn-group").find('[data-bind="label"]').html(t.html()).end().children(".dropdown-toggle").dropdown("toggle"),!1}),$("#topSongs-num, #mixbuilder-artist, #mixbuilder-song, #mixbuilder-album").keypress(function(e){var t=e.which;13==t&&(mixBuilder.search(),$("#ui-id-1").hide())}),$("#mixbuilder-artist, #mixbuilder-song, #mixbuilder-album").click(function(){$(this).select(),this.setSelectionRange(0,9999)}),$("#mixbuilder-search-button").click(function(){mixBuilder.search()});var showRelated={artists:function(e){$("#related-container").show();var t;t=" Songs By A Related Artist:",$.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist="+e+"&limit=60&autocorrect=1&api_key=946a0b231980d52f90b8a31e15bccb16&format=json",function(a){var r,i="";a.similarartists?($.each(a.similarartists.artist,function(e,t){t.name?r=t.name.replace(/["']/g,"\\'"):console.log("related artist error"),i+='<a class="similar-artistButton" href="javascript:void(0);" onclick="showRelated.addSongs(\''+r+"')\">"+t.name+"</a>",e<a.similarartists.artist.length-1&&(i+=" ")}),$("#related-container").html("<br><hr class='similar-top'><span id='similarArtTitle'>Add <input id='similar-num' value='10' type='number' pattern='[0-9]*'' inputmode='numeric'></span><span id='addString'>"+t+"</span></span>&nbsp;"+i)):$("#related-container").html("<br><hr class='similar-top'>Error loading related artists: "+e)}),$("#related-more").show()},addSongs:function(e){return $("#mixbuilder-artist").val(e),allSongsBy(e,$("#similar-num").val()),!1}};$("#related-more").click(function(){"..."==$("#related-more").text()?($("#related-container").css({height:"auto"}),$("#related-more").text("Less...")):($("#related-container").css({height:"134px"}),$("#related-more").text("..."))}),$("#shuffletext").click(function(){var e=$("#query").val().split("\n");shuffle(e);for(var t="",a=0;a<e.length;a++)/\S/.test(e[a])&&(t+=e[a]+"\n");$("#query").val(t)}),$("#query-clear").click(function(){$("#query").val("")}),$("#editplaylist").click(function(){editSearchTerm(0)}),$("#player-thumb-close").click(function(){editSearchTerm(0)}),$("#closeAdvanced").click(function(){$("#advanced-container").slideToggle("fast")}),$(document).keydown(function(e){if(!$("input,textarea").is(":focus"))switch(e.which){case 37:nextVideo(!1);break;case 192:return void editSearchTerm(0);case 39:nextVideo(!0);break;case 32:playPause(),e.preventDefault();break;default:return}}),$("#backToTop").click(function(){return $("html, body").animate({scrollTop:0},"fast"),!1});
function handleAPILoaded(){gapi.client.setApiKey("AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM"),$("#playlist-button").html("Save a Playlist"),$("#mixbuilder-search-button").attr("disabled",!1),onYouTubeIframeAPIReady_renamed()}function onPlayerReady(){$("#prevbutton").click(function(){nextVideo(!1)}),$("#playpause").click(function(){playPause()}),$("#nextbutton").click(function(){nextVideo(!0)}),$("#shufflebutton").click(function(){shuffleIt()}),$("#search-button").html('Blast a Mix <img src="img/play-arrow.svg" id="play-arrow-icon">')}function onYouTubeIframeAPIReady_renamed(){player=new YT.Player("player",{height:"394",width:"700",events:{onReady:onPlayerReady,onError:onPlayerError,onStateChange:onPlayerStateChange},playerVars:{modestbranding:1,enablejsapi:1,iv_load_policy:3,theme:"dark",color:"white",showinfo:1,playsinline:1}})}function onPlayerError(e){$("#errormsg-txt").html("Whoops. Error: "+e.data+" (Unknown error, try refreshing page with ctrl + shift + r"),150==e.data?(wrongSong(),$("#errormsg-txt").hide()):(nextVideo(!0),$("#errormsg-txt").hide())}function onPlayerStateChange(e){if(1!=e.data?$("#playpb").attr("src","img/media_play.svg"):$("#playpb").attr("src","img/media_pause.svg"),0===e.data){var t=search.topvIdArray.length;search.playcount+1<t?nextVideo(!0):search.playcount=-1}}function createPlaylistItem(e,t,a,r,i){var s='loadVid("'+a+'"); search.vidcount='+e+";",l="";"Not Found"==a&&(s="editSearchTerm(0);",l="<input id='not-found' value='"+search.listArray[e]+"'> "),void 0===i&&(i=0),$(".searchresult."+e).html("<div class='searchresult-div'><img id='thumb' src='"+t+"'></div> <div class='searchresult-title'>"+l+"<a id='link' onclick='"+s+"' title='"+r+"'>"+r+"</a></div><div id='searchresult-refresh'><img src='img/refresh-icon.svg' data-toggle='tooltip' title='Version Swap \n("+search.listArray[e]+")' class='refreshb' id='"+e+"'><input id='swapcount' type='hidden' value="+i+"></div>")}function playPause(){1!=player.getPlayerState()?(player.playVideo(),$("#playpb").attr("src","img/media_pause.svg")):(player.pauseVideo(),$("#playpb").attr("src","img/media_play.svg"))}function nextVideo(e){var t=search.topvIdArray.length;e===!0?(search.vidcount++,search.playcount++,search.vidcount>=t&&(search.vidcount=0),$("#search-container").append($("#search-container div.searchresult:first"))):(search.vidcount--,search.playcount--,(search.vidcount<0||"undefined"==search.vidcount)&&(search.vidcount=t-1),$("#search-container").prepend($("#search-container div.searchresult:last"))),swapper=1;var a=search.topvIdArray[search.vidcount];a&&loadVid(a)}function loadVid(e){add();player.loadVideoById?(player.loadVideoById(e),search.topvTitleArray[search.vidcount]&&(document.title=search.topvTitleArray[search.vidcount]+" - Mixblast"),$("#favicon").attr("href",search.topvThumbArray[search.vidcount])):$("#errormsg-txt").html("Whoops. Youtube API error, try refreshing page with ctrl + shift + r")}function cuePlayer(){add();player.cueVideoById?player.cueVideoById(search.topvIdArray[0]):(console.log(player),console.log(player.cueVideoById))}function shuffleIt(){$("#search-container").empty(),search.count>1&&(search.vidcount=0);for(var e=search.topvIdArray.length,t=[],a=0;e>a;a++)t.push(a);var r=shuffle(t);$.isEmptyObject(search.prev_vidObjArray)&&(search.prev_vidObjArray=jQuery.extend(!0,{},search.vidObjArray)),search.topvIdArray.length=0,search.topvTitleArray.length=0,search.topvThumbArray.length=0;for(var i=0;e>i;i++){var s,l,o,n=r[i];search.prev_vidObjArray[n]?(s=search.prev_vidObjArray[n].vid[0],l=search.prev_vidObjArray[n].title[0],o=search.prev_vidObjArray[n].thumb[0]):(s="Not Found",l="Not Found.",o="img/notfound.png"),search.topvIdArray.push(s),search.topvTitleArray.push(l),search.topvThumbArray.push(o),$("#search-container").append("<div class='searchresult "+i+"'></div>"),createPlaylistItem(i,o,s,l);for(var c=0;c<search.prev_vidObjArray[0].vid.length;c++)search.vidObjArray[i]={vid:search.prev_vidObjArray[n].vid,title:search.prev_vidObjArray[n].title,thumb:search.prev_vidObjArray[n].thumb}}}function shuffle(e){for(var t,a,r=e.length;r;t=Math.floor(Math.random()*r),a=e[--r],e[r]=e[t],e[t]=a);return e}function wrongSong(){swapper>19&&(swapper=0),loadVid(search.vidObjArray[search.vidcount].vid[swapper]),swapper++}var tag=document.createElement("script");tag.src="https://www.youtube.com/iframe_api";var firstScriptTag=document.getElementsByTagName("script")[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);var player;$("#wrongsong").click(function(){wrongSong()});var swapper=1;$("#search-container").on("click",".refreshb",function(e){var t=this.id,a=$(this).nextAll("#swapcount").val();2==e.button?(a--,e.preventDefault()):a++;var r=search.vidObjArray[t].vid.length;a>=r&&(a=0),0>a&&(a=r-1);var i=search.vidObjArray[t].vid[a],s="loadVid('"+i+"'); search.vidcount="+t;("Not Found"===i||void 0===i)&&(s="editSearchTerm("+t+");");var l=search.vidObjArray[t].thumb[a],o=search.vidObjArray[t].title[a];createPlaylistItem(t,l,i,o,a);var n=search.topvIdArray.indexOf(search.topvIdArray[t]);-1!==n&&(search.topvIdArray[n]=i),$(this).nextAll("#swapcount").val(a)}),$("#pb-menu").on("click",".pb-module",function(){for(var e=pastBlasts.list(),t=0;t<e.length;t++)if(/\S/.test(e[t]))for(var a=e[t].split("\n"),r=0,i=a.length;i>r;r++)if(0===r&&a[r]==this.id){var s=$.trim(pastBlasts.allBlasts[t]),l=s.split("\n");l=l,l.shift(),s=l.join("\n"),$("#query").val(s),multiSearch()}}),$("#pb-menu").on("click",".pb-delete",function(e){pastBlasts["delete"](this.id),e.stopPropagation()});var infoBlast={display:function(){$("#pb-menu").animate({left:"-400px"},"fast"),$("#info-menu").animate({left:"0px"},"fast")},hide:function(){$("#pb-menu").animate({left:"-400px"},"fast"),$("#info-menu").animate({left:"-400px"},"fast")}},pastBlasts={needsUpdate:!0,list:function(){return pastBlasts.allBlasts?pastBlasts.allBlasts_len!=pastBlasts.allBlasts.length?(pastBlasts.allBlasts_len=pastBlasts.allBlasts.length,pastBlasts.needsUpdate=!1):pastBlasts.needsUpdate=!1:(pastBlasts.needsUpdate=!0,pastBlasts.allBlasts=JSON.parse(localStorage.getItem("pastBlasts")),null==pastBlasts.allBlasts&&(pastBlasts.allBlasts=[]),pastBlasts.allBlasts_len=pastBlasts.allBlasts.length),pastBlasts.allBlasts.sort().reverse()},display:function(){if(pastBlasts.needsUpdate){var e=pastBlasts.list();if(e.length<=0){var t=new Date;e=[t.toJSON()+"\n No History Yet. \n Playlists are auto-saved when you Blast a Mix."]}$("#pb-menu").html('<div id="pb-button"><img class="pb-button-big" src="img/past-blasts-icon.svg"> <span id="pb-text"></span></div>');for(var a=0,r=e.length;r>a;a++){for(var i=e[a].split("\n"),s="",l="",o="",n=0,c=4;c>n;n++){if(0===n){o=i[n];var d=i[n].split(/[-T:.]/);l=new Date(d[0]+"/"+d[1]+"/"+d[2]+" "+d[3]+":"+d[4]+":"+d[5]+" UTC");var u={weekday:"long",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"},p=l.toLocaleTimeString("en-us",u);i[n]='<span id="pb-date">'+p+"</span>"}i[n]&&(s+=i[n]+"<br>")}$("#pb-menu").append('<div class="pb-wrapper"><div class="pb-module line-clamp" id="'+o+'">'+s+'</div><a class="pb-delete" id="'+o+'" title="Delete"> &#9940; </a></div>')}}$("#pb-menu").show(),$("#pb-text").html("Recent Playlists"),$("#pb-menu").animate({left:"0px"},"fast"),$("#info-menu").animate({left:"-400px"},"fast")},hide:function(){$("#pb-menu").animate({left:"-400px"},"fast",function(){$("#pb-menu").hide()}),$("#pb-text").html("")},add:function(e){var t=pastBlasts.list();if(t.length>0)var a=t[0].split("\n").slice(1).join("\n");else{t=[];var a=""}if($.trim(a)!=$.trim(e)){var r=new Date;t.push(r.toJSON()+"\n"+e+"\n"),localStorage.setItem("pastBlasts",JSON.stringify(t)),pastBlasts.needsUpdate=!0}},"delete":function(e){for(var t=pastBlasts.list(),a=0;a<t.length;a++)if(/\S/.test(t[a]))for(var r=t[a].split("\n"),i=0,s=r.length;s>i;i++)0===i&&r[i]==e&&(t.splice(a,1),console.log("deleting:"+r[i]));localStorage.setItem("pastBlasts",JSON.stringify(t)),pastBlasts.needsUpdate=!0,pastBlasts.display()}};$(document).ready(function(){$("body").click(function(){pastBlasts.hide(),infoBlast.hide()}),$("#errormsg, #query").click(function(){$("#errormsg").hide()});var e=localStorage.getItem("mixfile"),t=JSON.parse(e);t&&""!=t&&$("#query").val(t);var a=localStorage.getItem("how_many_songs");isNaN($.trim(a))&&(a=40),null===a&&(a=40),$("#topSongs-num").val(a),$("#topSongs-num").blur(function(){how_many_songs=$("#topSongs-num").val(),localStorage.setItem("how_many_songs",how_many_songs)});var r=localStorage.getItem("dropdown-lastvalue");null!=r&&(search.dropVal=r,$("#mixbuilder-dropdown > button > span:nth-child(1)").text($("#"+r).text()),dropdownSwitcher());var i=localStorage.getItem("artist");$("#mixbuilder-artist").val(i),$("#mixbuilder-artist").blur(function(){artist=$("#mixbuilder-artist").val(),localStorage.setItem("artist",artist)});var s=localStorage.getItem("album");$("#mixbuilder-album").val(s),$("#mixbuilder-album").blur(function(){album=$("#mixbuilder-album").val(),localStorage.setItem("album",album)});var l=localStorage.getItem("last_similarArtist");$("#mixbuilder-artist").val(l),$("#mixbuilder-artist").blur(function(){l=$("#mixbuilder-artist").val(),localStorage.setItem("last_similarArtist",l)});var o=localStorage.getItem("last_similarSong");$("#mixbuilder-song").val(o),$("#mixbuilder-song").blur(function(){o=$("#mixbuilder-song").val(),localStorage.setItem("last_similarSong",o)}),$("#mixbuilder-artist").focus(),$("#mixbuilder-artist").select(),$("#search-button").click(function(){multiSearch()}),$("#playlist-button").click(function(){createPlaylist()}),$("#playlist-url").hide(),"ontouchstart"in window||$('[data-toggle="tooltip"]').tooltip(),$("#search-container").sortable({placeholder:"ui-state-highlight",update:function(){var e=$("#search-container").sortable("serialize",{key:"sort"});console.log(e)}}),$("#search-container").disableSelection();var n="mixblaster.webmaster@gmail.com";$("#emailme").append("<a href='mailto:"+n+"' target='_blank'>"+n+"</a>")});
function editTextList(){$("#mixbuilder-buttons").show(),$("#queryarea").show(),$("#query2").val($("#query").val()),$("#editplaylist").show(),$("#related-container").hide(),$("#related-more").hide(),$("#mixbuilder-search-button").show()}function addArtist(){var e=$("#query2"),t=e.val().split("\n"),a=[];$.each(t,function(e,t){a.push(newartist.val()+$.trim(t))});var r=a.join("\n");$("#query").val(r)}function removeNumbas(){var e=$("#query").val();if($("input#removenums").is(":checked")){prevtext_state=e;var t=e.split(/\n/);e="";for(var a=0;a<t.length;a++)/\S/.test(t[a])&&(e+=t[a].replace(/^\d+\s*[-\\.)#]?\s+/,"")+"\n");$("#query").val(e)}else $("#query").val(prevtext_state)}function removeParentheticals(){var e=$("#query").val();if($("input#removeparenths").is(":checked")){prevtext_state=e,e=e.replace(/ *\([^)]*\) */g," "),e=e.replace(/\[.*?\]/g," ");for(var t=e.split(/\n/),a=0;a<t.length;a++)/\S/.test(t[a])&&$("#query").val(e)}else $("#query").val(prevtext_state)}function magicSongExtractor(){}function readMultipleFiles(e){var t=e.target.files;if(t)for(var a,r=0;a=t[r];r++){var i=new FileReader;i.onload=function(){return function(e){var t=e.target.result,a=t.split("\n"),r=[],i="";if("#EXTM3U"==$.trim(a[0]))for(var s=1;s<a.length;s+=2)r=a[s].split(","),i=i+$.trim(r[1])+"\n",i=i.replace("(DatPiff Exclusive)",""),$("#query").val(i);else $("#query").val(t)}}(a),i.readAsText(a)}else alert("Failed to load files")}function getParameterByName(e){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var t=new RegExp("[\\?&]"+e+"=([^&#]*)"),a=t.exec(location.search);return null===a?"":decodeURIComponent(a[1].replace(/\+/g," "))}function parseXml(e){console.log(e),"error"==e.status&&($("#errormsg").show(),$("#errormsg-txt").html("Feed Error: "+e.message)),console.log(e.items),$("#query").val("");var t,a=!1,r=!1;$.each(e.items,function(e,i){if(rssfeed.indexOf("digitaldripped")>=0)t=i.link.substr(i.link.lastIndexOf("/")+1),t=t.replace(/[-]/g," "),t=t.substring(0,t.indexOf("."));else if(rssfeed.indexOf("hotnewhiphop")>=0)i.title.indexOf("- ")>=0||i.title.indexOf("Video")>=0?(t=i.title,t=t.replace("Video","")):t="";else if(rssfeed.indexOf("rapradar")>=0)t=i.title,t=i.title.replace(/New Video: |New Music: |New LP: |New Mixtape: /g,"");else if(rssfeed.indexOf("allhiphop")>=0)i.title.indexOf("“")>=0?(t=i.title,t=i.title.replace(/“|”|\[VIDEO\] |PREMIERE: |FRESH HEAT |HEATER OF THE DAY: /g,"")):t="";else if(rssfeed.indexOf("nah_right")>=0)t=i.title.replace(/Video: |Audio:/g,"");else if(rssfeed.indexOf("SouthernSweetTea")>=0)t=i.title.replace(/Video: |Audio: |Mixtape: |EP: /g,""),t=$.trim(t);else if(rssfeed.indexOf("worldstar")>=0)i.title.indexOf("- ")>=0||i.title.indexOf("Video")>=0?(t=i.title,t=$("<textarea/>").html(t).text(),t=t.replace("Video",""),r=!0):t="";else if(rssfeed.indexOf("stereogum")>=0)t=i.title.replace(/“|”/g,""),r=!0;else if(rssfeed.indexOf("AlbumOfTheYear")>=0)t=i.title,t=i.title.replace(/New Track: |Video: |Video: |Listen: |First Listen: /g,""),t=$("<textarea/>").html(t).text();else if(rssfeed.indexOf("metacritic")>=0)t=i.title,t=$("<textarea/>").html(t).text();else if(rssfeed.indexOf("tinymixtapes")>=0){a=!0,r=!0,t=i.content;var s=t.split("\n"),l=[];$.each(s,function(e,a){a.indexOf("- ")>=0?l.push(a.replace(/<br>/g,"").replace(/<p>/g,"").replace(/<\/p>/g,"\n")):t=""}),t=l.join("\n")}else rssfeed.indexOf("billboard.com")>=0?(t=i.content.replace(/ranks /g,""),t=t.replace("by","-"),t=t.substring(0,t.indexOf("#"))):t=i.title;t&&(console.log(t),$("#query").val($("#query").val()+t+"\r"))}),a&&($("input#removenums").prop("checked",!0),removeNumbas()),r&&($("input#removeparenths").prop("checked",!0),removeParentheticals())}function loadRSS(e){if(rssfeed=e,rssfeed){if($.ajax({type:"GET",url:"https://api.rss2json.com/v1/api.json?api_key=3lb8vdspv0hz80hzm1dnaziucnyg3jstk6nsirof&count=200&rss_url="+rssfeed,crossDomain:!0,dataType:"jsonp",success:parseXml}),history.pushState){var t=window.location.protocol+"//"+window.location.host+window.location.pathname+"?rss="+rssfeed;window.history.pushState({path:t},"",t)}$("#rss-dropdown").val(rssfeed)}}function findReplace(){var e=$("#find").val();e=new RegExp(e,"gi");var t=$("#replace").val(),a=$("#query2").val().split("\n"),r=[];$.each(a,function(a,i){r.push(i.replace(e,t))});var i=r.join("\n");$("#query").val(i),$("#query2").val($("#query").val())}$(document).ready(function(){rssfeed=getParameterByName("rss"),rssfeed&&loadRSS(rssfeed),$("#query2").val($("#query").val()),prevtext_state=$("#query").val()}),$("#advancedtext").click(function(){$("#advanced-container").slideToggle("fast"),editTextList()}),$("#pb-button").click(function(e){"0px"==$("#pb-menu").css("left")?pastBlasts.hide():(pastBlasts.display(),e.stopPropagation())}),$(".infolink").click(function(e){infoBlast.display(),e.stopPropagation()}),$("#rss-dropdown").change(function(){loadRSS($(this).val())}),$("#rss-button").click(function(){loadRSS($("#rss-dropdown").find(":selected").val())}),$("#addartist").focusout(function(){$("#query2").val($("#query").val())});var newartist=$("#addartist");$("#addartist").keyup(function(){addArtist()}),$("#addartist_button").click(function(){var e=result.val().split("\n"),t="";$.each(e,function(e,a){t+=newartist.val()+" "+a+"\n"})}),$("#frbutton").click(function(){findReplace()}),$("#removenums").click(function(){removeNumbas()}),$("#removeparenths").click(function(){removeParentheticals()}),$("#magic").click(function(){magicSongExtractor()}),$("#query").bind("paste",function(){var e=$(this);setTimeout(function(){var t=e.val();$("#query2").val(t),prevtext_state=t,$("input#removenums").prop("checked",!0),removeNumbas(),$("input#removeparenths").prop("checked",!0),removeParentheticals(),console.log(t)},100)}),document.getElementById("fileinput").addEventListener("change",readMultipleFiles,!1);var add=function(){var e=0;return function(){return e+=1}}(),delay=function(){var e=0;return function(t,a){clearTimeout(e),e=setTimeout(t,a)}}();$(function(){function e(e){return e.split(/\n\s*/)}function t(t){return e(t).pop()}function a(){var e=document.getElementById("query");console.log(e.value.substr(0,e.selectionStart).split("\n").length)}$("#mixbuilder-artist, #mixbuilder-song, #mixbuilder-album, #query").autocomplete({source:function(e,r){var i="AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM",s=t(e.term);$.ajax({url:"http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q="+s+"&key="+i+"&format=5&alt=json&callback=?",dataType:"jsonp",success:function(e){r($.map(e[1],function(e){return{label:e[0],value:e[0]}}))}}),a()},search:function(){var e=t(this.value);return e.length<2?!1:void 0},focus:function(t,a){var r=e(this.value);return r.pop(),r.push(a.item.value),this.value=r.join("\n"),r.pop(),!1},select:function(t,a){var r=e(this.value);r.pop(),r.push(a.item.value),r.push(""),this.value=r.join("\n");for(var i=t;i&&(13==i.keyCode&&i.stopPropagation(),i!=t.originalEvent);)i=t.originalEvent;return!1},appendTo:"#mixbuilder-bar"})});
function createPlaylist(){var e=gapi.client.youtube.playlists.insert({part:"snippet,status",resource:{snippet:{title:$("#playlist-title").val(),description:"Playlist created with Mixblast - http://mixbla.st \n"},status:{privacyStatus:"public"}}});e.execute(function(e){var t=e.result;console.log(t),t?(playlistId=t.id,$("#playlist-id").val(playlistId),$("#playlist-url-copy").val("http://youtube.com/playlist?list="+playlistId),$("#playlist-url").append('<a href="http://youtube.com/playlist?list='+playlistId+'" target="_blank">Click here to to view your playlist</a><br><br>'),$("#playlist-url").append('<a href="https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent("http://youtube.com/playlist?list="+playlistId)+'&p[images][0]=http://mixbla.st/img/mixblast-logo8.png" target="_blank">Blast your mix to Facebook</a><br><br>'),$("#playlist-title").val(t.snippet.title),multiAddVideosToPlaylist()):alert("Uh oh. Could not create playlist. Make sure you're signed in to Youtube. It should say (200 video limit) instead of (Sign in).\n\nIf you are logged in, try logging out of youtube.com, then refresh mixblast, then sign in again. Sorry 'bout that.\n\nMake sure your youtube account has a \"youtube channel.\" You can do this by creating at least one playlist on youtube.com. ")}),$("#playlist-url").show()}function multiAddVideosToPlaylist(){var e=0,t=search.topvIdArray.length+1;t>199&&(t=199);var a=setInterval(function(){$("#playlist-status").html("Generating YouTube Playlist... (Don't leave this page) "+e+" of "+search.topvIdArray.length),addToPlaylist(search.topvIdArray[e]),e++,e==t&&(clearInterval(a),$("#playlist-status").html("Done!"))},200);setTimeout(function(){window.scrollTo(0,document.body.scrollHeight)},700)}function addVideoToPlaylist(){addToPlaylist($("#video-id").val())}function addToPlaylist(e,t,a){var r={videoId:e,kind:"youtube#video"};void 0!=t&&(r.startAt=t),void 0!=a&&(r.endAt=a);var i=gapi.client.youtube.playlistItems.insert({part:"snippet",resource:{snippet:{playlistId:playlistId,resourceId:r}}});i.execute(function(e){$("#status").html("<pre>"+JSON.stringify(e.result)+"</pre>")})}var playlistId,channelId;
