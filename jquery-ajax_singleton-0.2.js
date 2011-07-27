/**
 * jQuery AJAX Singleton
 * https://github.com/TiuTalk/jQuery-Ajax-Singleton
 *  
 * Inspired by Daniel Craig - https://github.com/dougle/jQuery-Ajax-Singleton
 * 
 * Created by Thiago Belem <contato@thiagobelem.net>
 */
(function($) {
	
	// Copia o método antido de AJAX
	$.oldAjax = $.ajax;
	
	// Array para a lista de requisições ajax
	var ajaxRequests = [];
	
	$.ajax = function(options) {

		var defaults = {
			singleton: false,
			delay: 0,
			blocking: false, 
			key: options.url,
			complete: function() {
				if (ajaxRequests[this.key])
					ajaxRequests[this.key] = undefined;
			},
			onRequest: function() { }
		};

		var plugin = this;

		plugin.settings = {};

		plugin.init = function() {
			plugin.settings = $.extend({}, defaults, options);
			
			var request = ajaxRequests[plugin.settings.key];
			
			// Se for uma chamada singleton e a chamada já existir
			if (plugin.settings.singleton && (request != undefined)) {
				
				// Se estiver bloqueando chamadas seguintes
				if (plugin.settings.blocking) {
						
					// Retorna a chamada inicial
					return request.xhr;
						
				} else {
					// Cancela a chamada anterior
					if (request.xhr != undefined)
						request.xhr.abort();
						
					// Remove o timeout da chamada anterior
					clearTimeout(request.timeout);
					
					// Remove a chamada anterior da lista de chamadas
					ajaxRequests[plugin.settings.key] = undefined;
				}
			}

			// Se houver delay
			if (plugin.settings.delay > 0) {
				
				ajaxRequests[plugin.settings.key] = {
					xhr: undefined,
					timeout: setTimeout(function() {
						// Executa o callback
						if ($.isFunction(plugin.settings.onRequest))
							plugin.settings.onRequest();

						// Roda o chamada AJAX
						ajaxRequests[plugin.settings.key].xhr = $.oldAjax(plugin.settings);
					})
				};
				
				return ajaxRequests[plugin.settings.key].timeout;
				
			} else {
				// Roda o chamada AJAX
				$.oldAjax(plugin.settings);
			}
		};

		plugin.init();
	};
	
})(jQuery);
