	
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
				//console.log(JSON.stringify(data));
				$.each(data.items, function(i,item) {
					console.log(item.city);
				});
			});
		};

		self.citiesVarina = function() {
			
			$.getJSON("/cities/varina", function(data) {
				console.log(JSON.stringify(data));
				$.each(data.items, function(i,item) {
					$('#nearList1').html(item.city);
					$('#nearList2').html(item.state);
					$('#nearList3').html(item.zip);
				//	$('#nearList4').html(item.loc.y);
				//	$('#nearList5').html(item.loc.x);
				});
			});
		};

		self.nearLatLon = function() {
			
			$.getJSON("/near/lat/35.579952/lon/78.790807", function(data) {
				console.log(JSON.stringify(data));
				$.each(data.items, function(i,item) {
					$('#nearList1').html(item.city);
					$('#nearList2').html(item.state);
					$('#nearList3').html(item.zip);
				//	$('#nearList4').html(item.loc.y);
				//	$('#nearList5').html(item.loc.x);
				});
			});
		};

	};
