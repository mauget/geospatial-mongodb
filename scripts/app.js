	
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
				
				$.each(data, function(index, val) {
					console.log('%s. %s, %s %s (%s,%s)', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
				});
			});
		};

		self.citiesVarina = function() {
			
			$.getJSON("/cities/varina", function(data) {
				//console.log(JSON.stringify(data));
			//	var items = '';
				$.each(data, function(index, val) {
					 $('#nearList').append(createRow(index, val));
					console.log('%s. %s, %s %s (%s,%s)', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
				});
			//	$('#nearList').html(items);	
			});
		};
		
		self.createRow = function(index, val) {
			var row = ('<div class="ui-block-a">%s</div><div class="ui-block-b">%s</div><div class="ui-block-c">%s</div><div class="ui-block-d">%s</div><div class="ui-block-e">(%s,%s)</div>', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
			return row;
		};

		self.nearLatLon = function() {
			
			$.getJSON("/near/lat/35.579952/lon/78.790807", function(data) {
				//console.log(JSON.stringify(data));
				var items = jQuery.parseJSON(data);
							
				$.each(data, function(index, val) {
					console.log('%s. %s, %s %s (%s,%s)', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
				});
			});
		};

	};
