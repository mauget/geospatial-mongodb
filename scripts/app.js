	
//	$(document).ready(function() {
//	  // Handler for .ready() called.
//	});
		
	APP = new function() {
	
		var self = this;

		self.helloMauget = function () {
			alert('Hello');
		};

		self.nearZip = function() {
		    
			$.getJSON("/near/zip/27526", function(data) {
				console.log(JSON.stringify(data));
			});
		};

		self.citiesVarina = function() {
			
			$.getJSON("/cities/varina", function(data) {
				console.log(JSON.stringify(data));
			alert(data[0].city);
				var items = jQuery.parseJSON(data);
				$.each(items, function(i,rec) {
					$('#nearList1').html(rec.city);
					$('#nearList2').html(rec.state);
					$('#nearList3').html(rec.zip);
					$('#nearList4').html(rec.loc.y);
					$('#nearList5').html(rec.loc.x);
				});
			});
		};

		self.nearLatLon = function() {
			
			$.getJSON("/near/lat/35.579952/lon/78.790807", function(data) {
				console.log(JSON.stringify(data));
				var items = jQuery.parseJSON(data);
			
				$.each(items, function(i,rec) {
					$('#nearList1').html(rec.city);
					$('#nearList2').html(rec.state);
					$('#nearList3').html(rec.zip);
					$('#nearList4').html(rec.loc.y);
					$('#nearList5').html(rec.loc.x);
				});
			});
		};

	};
