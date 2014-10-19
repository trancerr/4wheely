var myMap,
	myPlacemark,
	attempt = 1,
	loc, run = 0,
	jsontext = '',
	contact = '',
	attempt=0,
	isConnected,
	ws;
// объект для коннекта 
// он знает состояние статуса соединения
var myWS = {
	status:0,
	connect : function (username,password){
		_connect = this;
		ws = new WebSocket("ws://mini-mdt.wheely.com?username="+username+"&password="+password);
		ws.onopen = function() {  
			//$("#log").append("Connection opened - " + attempt + "<br/>");
			console.log("Connection status " + _connect.status);
			_connect.status=1;
			console.log("Connection status " + _connect.status);
			isConnected=1;
			console.log("Connection isConnected " + isConnected);
			
			console.log("Connection opened #" + attempt + "");
			ws.send(JSON.stringify({
				"lat": 55.373703,
				"lon": 37.474764
			}));
		};
		ws.onerror = function() {  
			//$("#log").append("Connection opened - " + attempt + "<br/>");
			console.log("Connection error");
			this.status = 0;
		};
	},
	getStatus : function() {
		return this.status;
	}
}

App = Ember.Application.create();
App.Router.map(function() {
  this.resource('about');
  this.resource('map');
});
App.IndexController = Ember.Controller.extend({
//	content: {}, -- ObjectController
	actions:{
		handleSubmit: function () {
			myWS.connect(this.get('username'),this.get('password'));
			console.log("get status: "+myWS.getStatus());
			console.log("get isConnected: " + isConnected); // состояние коннекта - при успешном коннекте должна открыться карта
			this.transitionToRoute('map'); 
		}
	}
});
App.MapRoute = Ember.Route.extend({
  model: function() {
		ymaps.ready(init);
	    function init(){     
    	    myMap = new ymaps.Map("map", {
        	    center: [55.4, 37.5],
            	zoom: 11
        	});
   		}
		if (!run) {
			start();
		}
  }
});
App.MapController = Ember.Controller.extend({
//	content: {}, -- ObjectController
	actions:{
		handleSubmit: function () {
			ws.close();
			run = 0;
			//console.log("get status: "+myWS.getStatus());
			this.transitionToRoute('index'); 
		}
	}
});

function start(username,password){	
	ws.onmessage = function(evt) { 
		//$("#msg").append("<p>"+evt.data+"</p>"); 
		jsontext = evt.data;
		locations = JSON.parse(jsontext);
			//$("#msg").append("<p>"+locations +"</p>");
			myMap.geoObjects.remove(myPlacemark);		
			//for (var i = 0; i < locations.length; i++) {
				var i = 0;
				
				if (run) {
					id_prev = loc.id;
					lat_prev = loc.lat;
					lon_prev =loc.lon;
				}
				
				loc = locations[i];
				//$("#msg").append("<span style='font-size:8px'>" + loc.id + ":" + loc.lat + ":" + loc.lon + "</span><br>");
				console.log("message id:" + loc.id + " lat:" + loc.lat + " lon:" + loc.lon + "");
				 
				id_cur = loc.id;
				lat_cur = loc.lat;
				lon_cur = loc.lon;
			
				myPlacemark = new ymaps.Placemark([loc.lat, loc.lon], { 
				    hintContent: loc.id, 
				    balloonContent: loc.id 
				});
				myMap.geoObjects.add(myPlacemark);
				
				if (run) {
					//$("#msg").append("["+ lat_prev + ":" + lon_prev + "] [" + lat_cur + ":" + lon_cur +"]<br>");
					console.log("line ["+ lat_prev + ":" + lon_prev + "] [" + lat_cur + ":" + lon_cur +"]");
					var myPolyline = new ymaps.Polyline([
							// Указываем координаты вершин ломаной.
							[lat_prev, lon_prev],
							[lat_cur, lon_cur]
						], {
							// Описываем свойства геообъекта.
							// Содержимое балуна.
							balloonContent: "Ломаная линия"
						}, {
							// Задаем опции геообъекта.
							// Отключаем кнопку закрытия балуна.
							balloonCloseButton: false,
							// Цвет линии.
							strokeColor: "#000000",
							// Ширина линии.
							strokeWidth: 1,
							// Коэффициент прозрачности.
							strokeOpacity: 1
						});
				
					// Добавляем линии на карту.
					myMap.geoObjects
						.add(myPolyline);
				}
				run = 1;
	};
	
    ws.onclose = function(){
        //try to reconnect in 5 seconds
		//$("#log").append("Connection closed...");
		console.log("Connection closed...");
		attempt++;
		console.log("Connection may be restart...");
        //setTimeout(function(){start()}, 1000);    	
	};
}
