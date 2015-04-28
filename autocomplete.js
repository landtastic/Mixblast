/* AutoComplete */
$("#playallsongsby-artist").autocomplete({
    source: function(request, response){
        /* google geliştirici kimliği (zorunlu değil) */
        var apiKey = 'AI39si7ZLU83bKtKd4MrdzqcjTVI3DK9FvwJR6a4kB_SW_Dbuskit-mEYqskkSsFLxN5DiG1OBzdHzYfW0zXWjxirQKyxJfdkg';
        ////AIzaSyDlcHPnr5gJr1_pBSvVSRtFudfpIUppfjM
        /* aranacak kelime */
        var query = request.term;
        /* youtube sorgusu */
        $.ajax({
            url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q="+query+"&key="+apiKey+"&format=5&alt=json&callback=?",  
            dataType: 'jsonp',
            success: function(data, textStatus, request) { 
               response( $.map( data[1], function(item) {
                    return {
                        label: item[0],
                        value: item[0]
                    }
                }));
            }
        });
    },
    /* seçilene işlem yapmak için burayı kullanabilirsin */
    select: function( event, ui ) {
        $.youtubeAPI(ui.item.label);
    }
});

/* Butona Basınca Arama */
$('button#submit').click(function(){
    var value = $('input#playallsongsby-artist').val();
        $.youtubeAPI(value);
});

/* Youtube Arama Fonksiyonu */
$.youtubeAPI = function(kelime){
    var sonuc = $('#sonuc');
    sonuc.html('Arama gerçekleştiriliyor...');
    $.ajax({
        type: 'GET',
        url: 'http://gdata.youtube.com/feeds/api/videos?q=' + kelime + '&max-results=15&v=2&alt=jsonc',
        dataType: 'jsonp',
        success: function( veri ){
            if( veri.data.items ){
                sonuc.empty();
                $.each( veri.data.items, function(i, data) {
                    sonuc.append('<div class="youtube">\
                        <img src="' + data.thumbnail.sqDefault + '" alt="" />\
                        <h3><a href="javascript:void(0)" onclick="$.youtubePlay(\'' + data.id + '\', \'' + data.content[5] + '\')">' + data.title + '</a></h3>\
                        <p>' + data.description + '</p>\
                    </div>\
                    <div class="youtubeOynat" id="' + data.id + '"></div>');
                });
            }
            else {
                sonuc.html('<div class="hata"><strong>' + kelime + '</strong> ile ilgili hiç video bulunamadı!</div>');
            }
        }
    });
}

/* Youtube Video Oynatma Fonksiyonu */
$.youtubePlay = function(yid, frame){
    $('.youtubeOynat').slideUp().empty();
    $('#'+yid).slideDown().html('<iframe src="'+ frame +'&autoplay=1" style="width: 100%; box-sizing: border-box; height: 300px" />');
}