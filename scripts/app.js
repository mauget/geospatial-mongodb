	
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
				
				$('#nearList').html('');
				$.each(data, function(index, val) {
					//console.log('%s. %s, %s %s (%s,%s)', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
					var row = self.createRow(index, val);
					$(row).appendTo('#nearList');
					console.log(row);
				});
				$('#nearList').trigger('create');
			});
		};

		self.citiesVarina = function() {
			
			$.getJSON("/cities/varina", function(data) {
				$('#nearList').html('');	
				$.each(data, function(index, val) {
					var row = self.createRow(index, val);
					$(row).appendTo('#nearList');
					console.log(row);
				});
				$('#nearList').trigger('create');
			});
		};
		
		self.createRow = function(index, val) {
		
			var row = '<div class="ui-block-a">%s1</div><div class="ui-block-b">%s2</div><div class="ui-block-c">%s3</div><div class="ui-block-d">%s4</div><div class="ui-block-e">(%s5,%s6)</div>';
			
			var row1 = row.replace('%s1', Number(index) + 1);
			var row2 = row1.replace('%s2', val.city);
			var row3 = row2.replace('%s3', val.state);
			var row4 = row3.replace('%s4', val.zip);
			var row5 = row4.replace('%s5', val.loc.y);
			var row6 = row5.replace('%s6', val.loc.x);
			return row6;
		};

		self.nearLatLon = function() {
			
			$.getJSON("/near/lat/35.579952/lon/78.790807", function(data) {
				$('#nearList').html('');	
				$.each(data, function(index, val) {
					var row = self.createRow(index, val);
					$(row).appendTo('#nearList');
					console.log(row);
				});
				$('#nearList').trigger('create');
			});
		};

	};
