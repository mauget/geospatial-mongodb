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

		//-----------------
		// Result rendering
		//-----------------
	
		self.renderList = function(listSelector, data) {
			var markup = [];
			$.each(data, function(index, val) {self.renderRow(index, val, markup);});
			$(listSelector).html(markup);
			$(listSelector).listview('refresh');
			self.bindNearSearch();
				
			//var latLon = new google.maps.LatLng( Number( data[0].loc.y ), -Number( data[0].loc.x )  );
			//var latLon = '%s1, -%s2';
			//latLng.replace('%s1', data[0].loc.y).replace('%s2', data[0].loc.x);
			
			var latLon = '39.115733, -94.627139';
			console.log(latLon);
			$('#map_canvas').gmap({'center': latLon});
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

		self.bindNearSearch = function() {

			$('.zipClass').click(function(event) {

				// Grab 'zip' attribute value from clickee
				var val = event.target.attributes['zip'].nodeValue;
	
				// REST: search
				$.getJSON('/near/zip/' + val, function(data) {
					self.renderList('#cityList', data);
				});
			});
		};

	};

	// Listen for city search clicks from now-on
	APP.bindCitySearch();
	
	/*
	$(function() {
		// Also works with: var latLon = '59.3426606750, 18.0736160278';
		//var latLon = new google.maps.LatLng(59.3426606750, 18.0736160278);
		// {y" : 39.115733, "x" : 94.627139 }
		var latLon = '39.115733, -94.627139';
		$('#map_canvas').gmap({'center': latLon});
    });
    */
	
	/*
	$('#map_canvas').gmap().bind('init', function(ev, map) {
		$('#map_canvas').gmap('addMarker', {'position': '57.7973333,12.0502107', 'bounds': true}).click(function() {
			$('#map_canvas').gmap('openInfoWindow', {'content': 'Hello World!'}, this);
		});
	});
	*/

});	



