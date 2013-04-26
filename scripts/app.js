// Client-side scripts:

$(document).ready(function() {

	var app = function() {

		var self = this;
			
		//-----------------
		// Utilities
		//-----------------
		
		// Return str with trimmed whitespace at ends
		self.trim = function(str) {
			return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		};
		
		// Return latitude/longitude for item
		self.getLatLon = function(m) {
			return '%s1, -%s2'.replace('%s1', m.loc.y).replace('%s2', m.loc.x);
		};

		// Return marker popup text for item
		self.getPopupTxt = function(m) {
			return '%s1<br>%s2 %s3<br>(Zip pop %s4) '.replace('%s1', m.city).replace('%s2', m.state).replace('%s3', m.zip).replace('%s4', m.pop);
		};

		// Clear search input and output
		self.clearSearch = function() {
			$('#citySearch').val('');
			$('#cityList').html('');
		};

		//-----------------------
		// List rendering
		//-----------------------
		self.renderList = function(listSelector, data) {
			var markup = [];
			$.each(data, function( index, val)  { self.renderRow( index, val, markup); } );
			$(listSelector).html( markup );
			$(listSelector).listview( 'refresh' );
			self.bindNearSearch();
		};
	
		self.renderRow = function(index, val, markup) {
			var row = self.createRow( index, val );
			markup.push(row);
		};
	
		self.createRow = function(index, val) {	
			var rowTemplate = '<li><a class="zipClass" zip="%s4">%s1&nbsp;%s2&nbsp;&nbsp;%s3</a></li>';
			return rowTemplate.replace('%s1', val.city).replace('%s2', val.state).replace('%s3', val.zip).replace('%s4', val.zip);
		};

		//-------------------
		// Event listeners
		//--------------------
		self.bindCitySearch = function() {
		
			$('#citySearch').focus();
			
			$('#citySearch').keyup(function(event) {

				var txtIn = $('#citySearch').val();
				txtIn = APP.trim(txtIn).toUpperCase();
				//console.log(txtIn);
	
				$('#cityList').html('');	
				if (txtIn.length > 0){
	
					// REST: search
					$.getJSON( '/cities/' + txtIn, function(data) {
						APP.renderList('#cityList', data);
					});	
				}
			});
			
			$('#one').live( 'pageshow', function() {
				$('#citySearch').focus();
			});
		};
		
		//---------------------------------------------------------------
		// Render map centered on chosen Zip, with markers surrounding.
		//---------------------------------------------------------------
		self.drawMap = function(data) {
		
			var pinColor = ['FE7569', '00c000'];

			// Marker icon with shadow 
			var pinUrl = ["http://chart.apis.google.com/chart?chst=d_map_pin_letter_withshadow&chld=%E2%80%A2|" + pinColor[0],
						"http://chart.apis.google.com/chart?chst=d_map_pin_letter_withshadow&chld=%E2%80%A2|" + pinColor[1]  ];
		
			var zoomVal = 10;
			var theMap = $('#map_canvas');
	
			theMap.gmap( 'destroy' );
			theMap.gmap( { 'center': self.getLatLon(data[0]), 'zoom': zoomVal } );
			
			$.each( data, function(i, m) {
				var idx = (i === 0) ? 0 : 1;
				var marker = theMap.gmap('addMarker', { 'position': self.getLatLon(m), 'bounds': false, 'zoom': zoomVal, 
															'icon': pinUrl[idx] } ).click(function() {
					theMap.gmap( 'openInfoWindow', {'content': self.getPopupTxt(m) }, this);
				});	
				if (i === 0) { 
					// Pop central marker
					marker.triggerEvent( 'click' );
				}
			});
						
			$('#two').live( 'pageshow', function() {
				theMap.gmap('refresh');
			});
			
			$('#twoHead').html('Vicinity of %s1'.replace('%s1', data[0].zip));
			self.clearSearch();
		};
		
		//----------------------------
		// Start list click listener
		//----------------------------
		self.bindNearSearch = function() {

			$( '.zipClass' ).click(function(event) {

				// Grab 'zip' attribute value from clickee
				var val = event.target.attributes.zip.nodeValue;
	
				// REST search for zips near the chosen zip code
				$.getJSON('/near/zip/' + val, function(data) {
					APP.drawMap(data);
					$.mobile.changePage( "#two", { transition: "none"} );
				});
			});
		};
	};
	
	//--------------------------------------------------------------
	// Listen for city search clicks for life-cycle duration
	//--------------------------------------------------------------
	var APP =  new app();
	APP.bindCitySearch();

});	



