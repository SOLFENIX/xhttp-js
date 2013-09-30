XHTTP JavaScript Client
=======================

The **XHTTP JavaScript Client** allows you to connect to a server which interprets the [Extended Hypertext Transfer Protocol](http://xhttp.org) (XHTTP).

To use the *XHTTP* client in your web application first include it in the ```HEAD``` of the document:

```html
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<title>My Site</title>
		<script type="text/javascript" src="path/to/xhttp.js"></script>
	</head>
	<body>

		<!-- your content here -->

	</body>
</html>
```

To create an *XHTTP* request we'll use the ```XRequest``` class. This creates a request object, using ```setHost( String host )``` for the node to connect to, ```setService( String service )``` for the service to call, ```setAction( String action )``` for the action to perform, and ```setArguments( Array arguments )``` to define the arguments to pass to the action, for example:

```javascript
var request = new XRequest();
request.setHost( 'http://www.solfenix.com/xnode?value=33' );
request.setService( 'example;*.*' );
request.setAction( 'foo' );
request.setArguments( [ new XInteger( 'value', 33 ) ] );
```

When defining the arguments to pass to an action there exist classes for each data type available, these are:

* **XNull:** Discriminated null value. Defaults to an empty value (no value).
* **XBoolean:** Boolean logical value (1 or 0). Defaults to 0.
* **XInteger:** Whole number. Defaults to 0.
* **XDouble:** Double precision floating point number. Defaults to 0.0.
* **XString:** String of characters. Defaults to an empty value (no value).
* **XArray:** Array of values, storing no keys. Defaults to []. *
* **XStruct:** Associative array or object. Defaults to {}. *
* **XLambda:** Anonymous or named function. Defaults to {}. *
* **XBase64:** Base64-encoded binary data. Defaults to an empty value (no value).
* **XDateTime:** Date and time in [ISO-8601](http://en.wikipedia.org/wiki/ISO_8601) format. Defaults to the current date and time.

Each class construct expects *2* arguments, the "name" of the argument, and the "value".

Creating a request object doesn't send the petition to the server until you create an ```XResponse``` object. The ```XResponse``` object can handle a single ```XRequest``` object or an array of multiple ```XRequest``` objects. Each ```XRequest``` object has an ```isReady( void )``` method to check that the request is ready to send and isn't missing require values, such as the "host" or the "service".

Once processed by the ```XResponse``` object, the ```isComplete( Number index )``` method specifies if the response could complete the request successfully. And finally, the ```getReturn( Number index )``` gets the value returned by the action, for example:

```javascript
var response = new XResponse( request );

if ( request.isReady() )
{
	if ( response.isComplete() )
	{
		var result = response.getReturn();
	}
}
```

In the case of handling multiple requests, each method of the ```XResponse``` object expects the index of the array of requests to access the data of the specific request.

Handling requests and responses can be a tedious process. However, *XHTTP* provides the functionality of exposing the schema for a service. This allows implementations to provide the option to build a remote API. The **XHTTP JavaScript Client** provides this specific functionality through the ```schema( String method, String host, String service, String action, String version )``` method of the ```XHttp``` object, for example:

```javascript
var example = XHttp.schema( XRequest.GET, 'http://www.solfenix.com/xnode', 'example', '1.*' );
```

The example object is now an API which models the "example" schema, so we can now call the "foo" action as a method of this object:

```javascript
var result = example.foo( new XInteger( 'value', 33 ) );
```

Requirements
------------

* JavaScript 8+

Documentation
-------------

Additional information about the *Extended Hypertext Transfer Protocol* (XHTTP) can be found here: [http://xhttp.org](http://xhttp.org)

Support
-------

For support, bugs and feature requests, please use the [issues](https://github.com/SOLFENIX/xhttp-js/issues) section of this repository.

Contributing
------------

If you'd like to contribute new features, enhancements or bug fixes to the code base just follow these steps:

* Create a [GitHub](https://github.com/signup/free) account, if you don't own one already
* Then, [fork](https://help.github.com/articles/fork-a-repo) the [XHTTP JavaScript Client](https://github.com/SOLFENIX/xhttp-js) repository to your account
* Create a new [branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository) from the *develop* branch in your forked repository
* Modify the existing code, or add new code to your branch
* When ready, make a [pull request](http://help.github.com/send-pull-requests/) to the main repository

There may be some discussion reagrding your contribution to the repository before any code is merged in, so be prepared to provide feedback on your contribution if required.

A list of contributors to the **XHTTP JavaScript Client** can be found [here](https://github.com/SOLFENIX/xhttp-js/contributors).

License
-------

Copyright 2011-2013 James Watts (SOLFENIX). All rights reserved.

Licensed under the GPL. Redistributions of the source code included in this repository must retain the copyright notice found in each file.

