
L.Control.Printer = L.Control.extend({
	options: {
		position: 'bottomright'
	},
	
	_lang: {
		"sv": {
			exampleLabel: "Ett exempel"
		},
		"en": {
			exampleLabel: "An example"
		}
	},
	
	_setLang: function(langCode) {
		langCode = langCode || smap.config.langCode;
		if (this._lang) {
			this.lang = this._lang ? this._lang[langCode] : null;			
		}
	},

	initialize: function(options) {
		L.setOptions(this, options);
		this._setLang(options.langCode);
	},

	onAdd: function(map) {
		this.map = map;
		
		this._container = L.DomUtil.create('div', 'leaflet-control-printer'); // second parameter is class name
		L.DomEvent.disableClickPropagation(this._container);
		
		this.$container = $(this._container);
		
		return this._container;
	},

	onRemove: function(map) {}
});

/*
 * This code lets us skip "new" before the
 * Class name when instantiating it.
 */
//L.control.printer = function (options) {
//	return new L.Control.Printer(options);
//};