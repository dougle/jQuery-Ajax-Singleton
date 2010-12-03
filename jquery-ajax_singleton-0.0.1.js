(function($){
	// grab the original method
	$.oajax = $.ajax;
	/* this array will keep our ajax references, timeout references
	and timeout callbacks across calls, settimeout is called 
	from a global scope so would lose ajax options */
	$.xhr_reference_index = [];
	
	// singleton wrapper to do some before and after work, calls oajax (defined above)
	$.ajax = function( origSettings ){
			// default our new options with some defaults and mix in with the normal ajax options
			var s = jQuery.extend(true, {singleton:false, delay:0, blocking:false, index_key:origSettings.url}, origSettings);
			
			// if there is a reference to this call already grab it
			xhr_ref = $.xhr_reference_index[s.index_key];
			
			// if singleton mode has been requested
			if(s.singleton){
				//cancel previous calls or abort this call and return
				if(undefined != xhr_ref){
					
					// choose to block current or cancel previous calls
					if(!s.blocking){
						// cancel previous calls
						if(undefined != xhr_ref.xhr) xhr_ref.xhr.abort();
						clearTimeout(xhr_ref.timer);
						$.clear_xhr_refs(s.index_key);
					}else{
						/* return the reference to the ajax call that is 
						   currently blocking this call
						*/ 
						return xhr_ref.xhr;
					}
				}
			}
			
			// make the call to the original method
			if(s.delay > 0){
				/* setup a blank reference container
				   Callback is so that we don't have to 
				   convert s to a json string and concat it into settimeout
				   we just pass in the reference index key
				   and it'll use this callback passing the settings object.
				   functions don't convert to json well (at all)
				*/
				$.xhr_reference_index[s.index_key] = {xhr:undefined,timer:undefined,
					callback:function(){
						$.xhr_reference_index[s.index_key].xhr = $.oajax(s);
					}};
					
				// no return ref for timeout stuff sorry
				$.xhr_reference_index[s.index_key].timer = setTimeout("$.xhr_reference_index['"+ s.index_key +"'].callback();", parseInt(s.delay));
				return $.xhr_reference_index[s.index_key].timer;
			}else{
				// we have nothing to do, the user wants another ajax call asap
				return $.oajax(s);
			}
		};
		
		// unset reference container
		$.clear_xhr_refs = function(key){
			$.xhr_reference_index[key] = undefined;
		}
})(jQuery);

/* this is to clear up refs after every ajax call has completed
   this is necessary to unblock subsequent calls
*/
$(document).ajaxComplete(function(e, xhr, s){
	$.clear_xhr_refs(s.index_key);
});