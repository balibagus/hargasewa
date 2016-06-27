var map;
    var geocoder;
    var bounds = new google.maps.LatLngBounds();
    var markersArray = [];
      
    // setting marker untuk marker asal dan tujuan
    var destinationIcon = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000";
    var originIcon = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000";
 
    // tentukan terlebih dahulu letak petanya 
    function initialize() {
      var opts = {
        center: new google.maps.LatLng(-7.25009,112.744331),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById('map'), opts);
      geocoder = new google.maps.Geocoder();
 
      // setting agar texfield pada kolom asal dan juga tujuan dapat memanggil fungsi autocomplete
      var asal = new google.maps.places.Autocomplete((document.getElementById('origins')),{ types: ['geocode'] });
      var tujuan = new google.maps.places.Autocomplete((document.getElementById('destinations')),{ types: ['geocode'] });
    }
 
    /*      
    menghitung jarak dari data yg dikirim dari form
    disini saya setting untuk mode DRIVING dan menggunakan jalan raya atau juga tol,
    jika ingin mengganti konfigurasinya, silahkan ganti false dengan true
    */
    function calculateDistances() {
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
      { 
        origins: [document.getElementById("origins").value],
        destinations: [document.getElementById("destinations").value],
        travelMode: google.maps.TravelMode.DRIVING, 
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, callback);
    }
      
    // responde dari Googlemaps Distance Matrix akan diolah dan di kirim ke output HTML
    function callback(response, status) {
      if (status != google.maps.DistanceMatrixStatus.OK) {
        alert('Error was: ' + status);
      } else {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        deleteOverlays();
 
        for (var i = 0; i < origins.length; i++) {
          var results = response.rows[i].elements;
          addMarker(origins[i], false);
          for (var j = 0; j < results.length; j++) {
            addMarker(destinations[j], true);
          }
    
          /*          
            disini perhitungan tarif, pertama hilangkan dulu 'km'
            dan ubah tanda desimal koma dengan titik. 
          */
          var str = results[0].distance.text;
          var distance = str.replace(' km', '');
          var distance = distance.replace(',','.');
 
          /*          
            jumlah kilometer dikalikan dengan 7500 
            setelah itu hasilnya kita konversikan kedalam format kurs rupiah
          */
          var tarif = "Rp."+ formatNumber(distance * 7500+25000)+",-"; 
          document.getElementById("billing").value = tarif;
          document.getElementById("distance").value = results[0].distance.text;
    
        }
      }
    }
    // fungsi sederhana untuk mengkonversi bilangan bulat menjadi format kurs rupiah
    function formatNumber (num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")
    }
 
    // menampilkan marker untuk origin dan juga destination
    function addMarker(location, isDestination) {
      var icon;
      if (isDestination) {
        icon = destinationIcon;
      } else {
        icon = originIcon;
      }
      geocoder.geocode({'address': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          bounds.extend(results[0].geometry.location);
          map.fitBounds(bounds);
          var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            icon: icon
          });
          markersArray.push(marker);
        } else {
          alert("Terjadi kesalahan: "
            + status);
        }
      });
    }
      
    // menghapus koordinat marker sebelumnya dan menggantinya dengan koordinat yang baru
    function deleteOverlays() {
      if (markersArray) {
        for (i in markersArray) {
          markersArray[i].setMap(null);
        }
        markersArray.length = 0;
      }
    }
