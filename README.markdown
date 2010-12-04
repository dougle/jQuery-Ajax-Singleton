jQuery Ajax Singleton Plugin
============================

This plugin's only function is to reduce ajax traffic in certain situations, a more efficient way of doing some UI features.

With this plugin loaded in the normal way (after jquery):
	<script src="/javascripts/jquery-ajax_singleton.js" type="text/javascript"></script>

And with a keyup event on a text element:
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

When we press a key, say "u", we get an ajax call that will wait half a second (delay:500) for another key to be pressed, if not it will request projects.json as normal. If another key is pressed, say "p" the first event trigger (key u), which could be 340ms into it's delay, will be canceled and no ajax will be called, key p will now start it's delay, after 500ms a normal ajax request is made, but if another key is pressed the ajax is canceled and another delay is started, we can continue like this untill a delay is exhausted and a request is made and successful.

The previous example was cancelling ajax requests (non blocking), if we want the user to click a button to retrieve the projects, where double clicking (or other abuse) would request the .json file twice, we can set blocking:true in the ajax options:
	$('a#filter-go').keyup(function(e){
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
				
				blocking:true
				}
		);
	});

This would simply make the first request as normal, but do nothing for all subsequent requests for this url until the first ajax request returned successful.

This might not be good to restrict by url, some other project related ajax could be happening on the page so the following event handler specifies an index key (index_key:'project_list_filter') to use for this ajax driven feature:
	$('a#filter-go').keyup(function(e){
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

Usage:
------

$.ajax(options || {})

Options:
    **singleton**:- boolean, default false
                Turns this functionality on or explicitly off.
    **delay**:- integer, default 0
                The number of seconds before an ajax request is called,
                provided it has not been blocked.
    **blocking**:- boolean, default false
                Switch between blocking and non blocking (aborting) mode
    **index_key**:- string, default the request url
                Assigns a key to this and subsequent requests, used for
                avoiding conflicts between ajax requests to the same url
                for different purposes.

Known Issues
------------
* For delayed initial requests (this first call with delay:500) this will not return an xmlHTTPrequest reference, this is because setTimeout is executing the $.ajax request in the window scope and cannot pass back the value to your function. However, subsequent requests that will be blocked will pass back the reference.

