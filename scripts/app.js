// Client-side scripts:

$(document).ready(function() {

	APP = new function() {

		var self = this;
			
		//-----------------
		// Utilities
		//-----------------
		self.trim = function(str) {
			return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		}

		//-----------------
		// REST requestors
		//-----------------
//		self.nearZip = function() {   
//			$.getJSON("/near/zip/27526", function(data) {
//				self.renderList('#nearList', data);
//			});
//		};

//		self.citiesVarina = function() {	
//			$.getJSON("/cities/varina", function(data) {
//				self.renderList('#nearList', data);
//			});
//		};
	
//		self.nearLatLon = function() {	
//			$.getJSON("/near/lat/35.579952/lon/78.790807", function(data) {	
//				self.renderList('#nearList', data);	
//			});
//		};

		//-----------------
		// Result rendering
		//-----------------
	
		self.renderList = function(listSelector, data) {
			var markup = [];
			$.each(data, function(index, val) {self.renderRow(index, val, markup);});
			$(listSelector).html(markup);
			$(listSelector).listview('refresh');
			self.bindNearSearch();
		}
	
		self.renderRow = function(index, val, markup) {
			var row = self.createRow(index, val);
			markup.push(row);
			//console.log(row);
			//console.log('%s. %s, %s %s (%s,%s)', index, val.city, val.state, val.zip, val.loc.y, val.loc.x);
		}
	
		self.createRow = function(index, val) {	
			var row = '<li><a class="zipClass" zip="%s4">%s1&nbsp;%s2&nbsp;&nbsp;%s3</a></li>';
			return row.replace('%s1', val.city).replace('%s2', val.state).replace('%s3', val.zip).replace('%s4', val.zip);
		};

		//-------------------
		// Event listeners
		//--------------------
		self.bindCitySearch = function() {

			$('#citySearch').keyup(function(event) {

				var txtIn = $('#citySearch').val();
				txtIn = APP.trim(txtIn);
				console.log(txtIn);
	
				$('#cityList').html('');	
				if (txtIn.length > 0){
	
					// REST: search
					$.getJSON('/cities/' + txtIn, function(data) {
						APP.renderList('#cityList', data);
					});	
				}
			});
		}
		
		// Render map centered on chosen Zip, with map pins surrounding.
		self.drawMap = function(data) {
		
			var theMap = $('#map_canvas');
			var template = '%s1, -%s2';
			var latLon = template.replace('%s1', data[0].loc.y).replace('%s2', data[0].loc.x);
	
			console.log(latLon);
		//	theMap.gmap('destroy');
			theMap.html('');
			theMap.gmap( { 'center': latLon, 'zoom': 8 } );
			
			$.each( data, function(i, m) {
				var zipText = '%s1<br>%s2 %s3<br>(%s4)'.replace('%s1', m.city).replace('%s2', m.state).replace('%s3', m.zip).replace('%s4', m.pop);
				latLon = template.replace('%s1', m.loc.y).replace('%s2', m.loc.x);
				
				theMap.gmap('addMarker', { 'position': latLon, 'bounds': true, 'zoom': 8 } ).click(function() {
					$('#map_canvas').gmap( 'openInfoWindow', {'content': zipText }, this);
				});
					
			});
			
			$('#two').live('pageshow', function() {
				theMap.gmap('refresh');
			});
				
			self.clearSearch();
		}
		
		// Clear search input and output
		self.clearSearch = function() {
			$('#citySearch').val('');
			$('#cityList').html('');
		}

		// Start list click listener
		self.bindNearSearch = function() {

			$('.zipClass').click(function(event) {

				// Grab 'zip' attribute value from clickee
				var val = event.target.attributes['zip'].nodeValue;
	
				// REST: search
				$.getJSON('/near/zip/' + val, function(data) {
				//	self.renderList('#cityList', data);
					APP.drawMap(data);
					$.mobile.changePage( "#two", { transition: "none"} );
				});
			});
		};
	};

	// Listen for city search clicks for duration of life-cycle
	APP.bindCitySearch();

});	



