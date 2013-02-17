// Client-side scripts:

	APP = new function() {
	
		var self = this;

		self.helloMauget = function () {
			alert('Hello');
		};

		self.nearZip = function() {   
			$.getJSON("/near/zip/27526", function(data) {
				var markup = '';
				$.each(data, function(index, val) {self.renderRow(index, val, markup);});
				$('#nearList').html('');
				$('#nearList').append(markup);
				$('#nearList').listview("refresh");
			});
		};

		self.citiesVarina = function() {	
			$.getJSON("/cities/varina", function(data) {
				var markup = '';
				$.each(data, function(index, val) {self.renderRow(index, val, markup);});
				$('#nearList').html('');
				$('#nearList').append(markup);
				$('#nearList').listview("refresh");
			});
		};
		
		self.nearLatLon = function() {	
			$.getJSON("/near/lat/35.579952/lon/78.790807", function(data) {	
				var markup = '';
				$.each(data, function(index, val) {self.renderRow(index, val, markup);});
				$('#nearList').html('');
				$('#nearList').append(markup);
				$('#nearList').listview("refresh");
			});
		};
		
		self.renderRow = function(index, val, markup) {
				var row = self.createRow(index, val);
				markup = markup + row;
				//$(row).appendTo('#nearList');
				//console.log(row);
				//console.log('%s. %s, %s %s (%s,%s)', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
		}
		
		self.createRow = function(index, val) {	
			var row = '<li><a href=".">%s1&nbsp;%s2&nbsp;&nbsp;%s3</a><li>';
			return row.replace('%s1', val.city).replace('%s2', val.state).replace('%s3', val.zip);
		};

	};
