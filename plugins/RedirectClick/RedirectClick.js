L.Control.RedirectClick = L.Control.extend({
	
	options: {
		position: 'bottomright', // just an example
		btnID: "redirect-click-btn", //plugin ID which can be used with jquery e.g.
		displayName : 'Snedbild',
		toolbarIndex: 4,
		url: "http://kartor.helsingborg.se/urbex/sned_2011.html?p=true&xy=${x};${y}",
		overrideName: "snedbild",
		btnLabel: "Snedbild",
		btnHover: "Verktyg för att se snedbilder",
		buttonId: "redirect-snedbild",
		buttonCss: "ui-icon-arrowstop-1-s",
		mouseMoveText: "Klicka i kartan för att redirect till snedbild",
		mouseMoveSubtext: "",
		addToMenu: false
		
	},
	
	_lang: {
		"sv": {
			modalTitle: "Lager i kartan"
		},
		"en": {
			modalTitle: "Layers in the map"
		}
	},
	
	loadProj4: function(){
		Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
		Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
		Proj4js.defs["GOOGLE"] = Proj4js.defs["EPSG:3857"];
		Proj4js.defs["EPSG:900913"] = Proj4js.defs["EPSG:3857"];
		Proj4js.defs["EPSG:3008"] = "+proj=tmerc +lat_0=0 +lon_0=13.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
		Proj4js.defs["EPSG:3006"] = "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
		Proj4js.defs["EPSG:3021"] = "+proj=tmerc +lat_0=0 +lon_0=15.8062845294444 +k=1.00000561024+x_0=1500064.274 +y_0=-667.711 +ellps=GRS80 +units=m";
	},
	
	_setLang: function(langCode) {
		langCode = langCode || smap.config.langCode || navigator.language.split("-")[0] || "en";
		if (this._lang) {
			this.lang = this._lang ? this._lang[langCode] : null;			
		}
	},

	initialize: function(options) {
		L.setOptions(this, options);
		this._setLang(options.langCode);
	},

	onAdd: function(map) {
		var self = this;
		this.map = map;
		
		// this.loadProj4();
		
		this._container = L.DomUtil.create('div', 'leaflet-control-RedirectClick');
		L.DomEvent.disableClickPropagation(this._container);
		
		this.$container = $(this._container);
		
		self._createButton();
		
		return this._container;
	},

	addHooks: function () {
		var map = this._map;

		if (map) {
			map.getContainer().focus();
			this._tooltip = new L.Tooltip(this._map);
			this._tooltip.updateContent({
				text: this.options.mouseMoveText,
				//subtext: this.options.mouseMoveSubtext
			});

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},
	
	removeHooks: function () {
		if (this._map) {
			if(this._tooltip){					
				this._tooltip.dispose();
				this._tooltip = null;
				this._map.off('mousemove', this._onMouseMove, this);
				this._map.off( "click" );
			}
		}
	},
	
	removeBtnClass: function(){
		$("#"+this.options.btnID+"").removeClass("redirect-click-btn-on");
	},
	
	addBtnClass: function(){
		$("#"+this.options.btnID+"").addClass("redirect-click-btn-on");
	},
		
	_projectEPSG: function (evt) {
		//creating source and destination Proj4js objects
		//once initialized, these may be re-used as often as needed
		var source = new Proj4js.Proj('EPSG:4326');    	//source coordinates will be in Longitude/Latitude
		var dest = new Proj4js.Proj('EPSG:3008');     	//destination coordinates in WGS84, south of Leaflet
		
		var lfproj = L.Proj;
				
		//transforming point coordinates
		var p = new Proj4js.Point(evt.latlng.lng, evt.latlng.lat);   //any object will do as long as it has 'x' and 'y' properties
		Proj4js.transform(source, dest, p);     		//do the transformation.  x and y are modified in place	

		evt.latlng.lat = p.x; //Must proj x to this (117252 or 13.123);
		evt.latlng.lng = p.y; //Must proj y to this (6165717 or 55.456);
		return evt	
	},
	
	_onMouseMove: function (e) {
		this._tooltip.updatePosition(e.latlng);
	},
	
	_addEvents: function(){
		this.addHooks();
		return false;
	},
	
	_createButton: function() {
		var self = this;
		if(self.options.addToMenu) {
		            
            smap.cmd.addToolButton( "", "fa fa-external-link", function () {
	            var snedbildBtn = L.control.menu({});
	            				
	    		snedbildBtn.addButton(this.options.btnID, this.options.btnLabel, this.options.buttonCss, function(){return false;});
	    		
	    		$("#"+this.options.btnID+"").on('click',function(){
	    					
	    			if(self._tooltip){
	    				self.removeHooks();
	    				self.removeBtnClass();
	    				
	    			}else {
	    				self.addHooks();
	    				self.addBtnClass();
	    				self._map.on("click", function(e){
	    					self.removeBtnClass();						
	    					var evt = self._projectEPSG(e);
	    					self.onDone(evt);
	    					self.removeHooks();
	    				});
	    			}
    		});
    		
    		self.$container = $(this._container);
            return false;
            },null);
        }

        else {
            
            var $btn = $('<button id="'+ self.options.btnID +'" title="' + self.options.btnLabel + '" class="btn btn-default"><span class="fa fa-external-link"></span></button>');
            $btn.on("click", function () {
				if(self._tooltip){
					self.removeHooks();
					self.removeBtnClass();
					
				}else {
					self.addHooks();
					self.addBtnClass();
					self._map.on("click", function(e){
						self.removeBtnClass();						
						var evt = self._projectEPSG(e);
						self.onDone(evt);
						self.removeHooks();
					});
				}

                return false;
            });
            self.$container.append($btn);
        }
	},
	
	onRemove: function(map) {
		this.$container.empty();
	},
	
	onDone : function(e) {
		var url = this.options.url;
		if (url) {
			var x = parseInt(e.latlng.lat),
				y = parseInt(e.latlng.lng);
			url = url.replace(/\${x}/g, x).replace(/\${y}/g, y); 

		}
		window.open(url, this.options.btnLabel);
	},
});

// Do something when the map initializes
//L.Map.addInitHook(function () {
//	if (this.options.attributionControl) {
//		this.attributionControl = (new L.Control.MyPlugin()).addTo(this);
//	}
//});


/*
 * This code just makes removes the need for
 * using "new" when instantiating the class. It
 * is a Leaflet convention and should be there.
 */
L.control.redirectclick = function(options) {
	return new L.Control.RedirectClick(options);
};