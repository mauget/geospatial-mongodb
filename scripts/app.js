// Client-side scripts:

$(document).ready(function() {

	$('#citySearch').keyup(function(event) {
	
		var txtIn = event.target.val();
		console.log(txtIn);
		event.target.html('');
		
		if (txtIn.length > 1){
		
			// REST: search
			$.getJSON('/cities/' + txtIn, function(data) {
				APP.renderList('#cityList', data);
			});			
		}
	});

});

APP = new function() {
	
	var self = this;
		
		self.nearZip = function() {   
			$.getJSON("/near/zip/27526", function(data) {
				self.renderList('#nearList', data);
			});
		};

		self.citiesVarina = function() {	
			$.getJSON("/cities/varina", function(data) {
				self.renderList('#nearList', data);
			});
		};
		
		self.nearLatLon = function() {	
			$.getJSON("/near/lat/35.579952/lon/78.790807", function(data) {	
				self.renderList('#nearList', data);
			});
		};
		
		self.renderList = function(listSelector, data) {
			var markup = [];
			$.each(data, function(index, val) {self.renderRow(index, val, markup);});
			$(listSelector).html(markup);
			$(listSelector).listview('refresh');
		}
		
		self.renderRow = function(index, val, markup) {
				var row = self.createRow(index, val);
				markup.push(row);
				//console.log(row);
				//console.log('%s. %s, %s %s (%s,%s)', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
		}
		
		self.createRow = function(index, val) {	
			var row = '<li><a href=".">%s1&nbsp;%s2&nbsp;&nbsp;%s3</a></li>';
			return row.replace('%s1', val.city).replace('%s2', val.state).replace('%s3', val.zip);
		};

};
