jQuery Ajax Singleton Plugin
============================

This plugin's only function is to reduce ajax traffic in certain situations, a more efficient way of doing some UI features.
Previous to this i was using setTimeout and clearTimeout for each ajax call, in short i was using timeouts more and more and getting bored of setting them up every time.

With this plugin loaded in the normal way (after jquery):
	<script src="/javascripts/jquery-ajax_singleton.js" type="text/javascript"></script>

And with a keyup event on a text input element that makes an ajax request with the additional options `singleton:true` and `delay:500`:

	$('input#filter').keyup(function(e){
		$.ajax({url:'/projects.json',
				data:{q:$(this).val()},
				success:function( data ) {
					$('ul#projects li').remove();
					data.each(function(i, project){
						$('ul#projects').append('<li>'+ project.title +'</li>');
					});
				},
				type: "GET",
				dataType: 'json',
	
				singleton:true,
				delay:500
				}
		);
	});

When we press a key, say "u", we get an ajax call that will wait half a second (`delay:500`) for another key to be pressed, if not it will request projects.json as normal. If another key is pressed, say "p" the first event trigger (key u), which could be 340ms into it's delay, will be canceled and no ajax will be called, key p will now start it's delay, after 500ms a normal ajax request is made, but if another key is pressed the ajax is canceled and another delay is started, we can continue like this until a delay is exhausted and a successful request is made.

The previous example was cancelling ajax requests (non blocking), if we want the user to click a button to retrieve the projects, where double clicking (or other abuse) would request the .json file more than once, we can set `blocking:true` in the ajax options:

	$('a#filter-go').click(function(e){
		$.ajax({url:'/projects.json',
				data:{q:$('input#filter').val()},
				success:function( data ) {
					$('ul#projects li').remove();
					data.each(function(i, project){
						$('ul#projects').append('<li>'+ project.title +'</li>');
					});
				},
				type: "GET",
				dataType: 'json',
	
				singleton:true,
				delay:0,
				
				blocking:true
				}
		);
	});

This would simply make the first request as normal (instantly as i have removed the delay in this example), but do nothing for all subsequent requests for this url until the first ajax request returned successful.

References are kept according to the URL the ajax is calling, this might not be a good idea, some other project related ajax could be happening on the page so the following event handler specifies a unique (to this ajax feature) index key (`index_key:'project_list_filter'`):

	$('a#filter-go').click(function(e){
		$.ajax({url:'/projects.json',
				data:{q:$('input#filter').val()},
				success:function( data ) {
					$('ul#projects li').remove();
					data.each(function(i, project){
						$('ul#projects').append('<li>'+ project.title +'</li>');
					});
				},
				type: "GET",
				dataType: 'json',
	
				singleton:true,
				delay:500,
				
				blocking:true,
				index_key:'project_list_filter'
				}
		);
	});

Now the projects filter will only call once for the first button click and not interfere with anything else on the page, (like a project info window or something)


I originally made this to use with the autocomplete in [jQuery UI](http://jqueryui.com/)  
Setting it up to trigger after three characters was cool, but it would fire and hit the DB after every character! Noooo!

My Implementation:

		$('input#project_lookup').autocomplete({delay:0, minLength:3,
			source:function( request, response ) {
				$.ajax({url:'/projects.json',
						  data:{q:request.term},
						  response_callback:response,
						  success:function( data ) {
								this.response_callback( $.map( data, function( item ) {
									return {label: item.name, value: item.id}
								}));
						  },
						  type: "GET",
						  dataType: 'json',
						  singleton:true,
						  delay:500,
						  index_key:input.attr('id')
				});
			}
		});
	
As you can see i'm passing autocomplete's `response` callback into the ajax settings (`response_callback:response`), this way after setTimeout (at global scope) the callback is available in the success handler via `this.response_callback()`

Notice i turned autocomplete's delay off so i could cancel my own delays, this has given me an interuptable autocomplete that waits for the user to stop typing before it goes and gets the results.


Usage:
------

	$.ajax(options || {})

**Options:**

**singleton**:- boolean, default false  
 Turns this functionality on or explicitly off.

**delay**:- integer, default 0  
 The number of miliseconds before an ajax request is called,  
 provided it has not been blocked.

**blocking**:- boolean, default false  
 Switch between blocking and non blocking (aborting) mode.

**index_key**:- string, default the request url  
 Assigns a key to this and subsequent requests, used for  
 avoiding conflicts between ajax requests to the same url  
 for different purposes.  

Known Issues
------------
* For delayed initial requests (the first call with delay:500) this will not return an xmlHTTPrequest reference, this is because setTimeout is executing the $.ajax request in the window scope and cannot pass back the value to your function. However, subsequent requests with blocking:true **will** pass back the reference.
* Does not work for getJSON and the other ajax shortcut methods, the projects example above shows my getJSON call converted to longhand $.ajax to make use of this plugin, check out: [$.get](http://api.jquery.com/jQuery.get/) [$.getJSON](http://api.jquery.com/jQuery.getJSON/) [$.getScript](http://api.jquery.com/jQuery.getScript/) [$.post](http://api.jquery.com/jQuery.post/)

Contributing
------------
All comments and bug reports are welcome, this plugin will be kept up-to-date and improved with my new features as and when i stumble across them. Forks and pull requests are also welcome.