/*
 *  XHTTP JavaScript Client
 *  https://github.com/SOLFENIX/xhttp-js
 *
 *  Copyright (c) 2011-2013 James Watts (SOLFENIX)
 *  http://www.solfenix.com
 *
 *  This is FREE software, licensed under the GPL license
 *  http://www.gnu.org/licenses/gpl.html
 *
 *  This software implements the XHTTP protocol
 *  http://www.xhttp.org
 */

function XHttp( method, host, service, version, encoding ) {

	if ( arguments.length < 3 || ( typeof method !== 'string' || typeof host !== 'string' || typeof service !== 'string' ) ) throw new XException( XHttp.E_MISSING_ARGUMENTS, 106 );
	var request = new XRequest();
	request.setMethod( method );
	request.setHost( host );
	request.setMode( XRequest.MODE_SCHEMA );
	request.setService( service );
	if ( typeof version !== 'undefined' ) request.setVersion( version );
	if ( typeof encoding !== 'undefined' ) request.setEncoding( encoding );
	if ( request.isReady() ) {
		var response = new XResponse( request );
		if ( response.isComplete() ) {
			var status = response.getStatusCode();
			if ( status > 99 && status < 300 ) {
				var schema = response.getReturn();
				if ( schema ) {
					for ( var action = 0; action < schema.length; action++ ) {
						eval( 'this["' + schema[action][0] + '"] = function() { \
							var data    = this["' + schema[action][0] + '"]; \
							var request = new XRequest(); \
							request.setMethod( data.method ); \
							request.setHost( data.host ); \
							request.setService( data.service ); \
							request.setVersion( data.version ); \
							request.setAction( data.schema.action ); \
							request.setEncoding( data.encoding ); \
							var expectedArguments = data.schema.arguments; \
							if ( expectedArguments instanceof Array || ( typeof expectedArguments === "object" && typeof expectedArguments.length !== "undefined" ) ) { \
								var requiredArguments = []; \
								for ( var i = 0; i < expectedArguments.length; i++ ) { \
									if ( expectedArguments[i][2] == true ) requiredArguments.push( expectedArguments[i] ); \
								} \
								if ( arguments.length < requiredArguments.length ) throw new XException( XHttp.E_MISSING_ARGUMENTS, 106 ); \
								if ( arguments.length > 0 ) { \
									var found, j; \
									for ( var i = 0; i < expectedArguments.length; i++ ) { \
										found = false; \
										for ( j = 0; j < arguments.length; j++ ) { \
											if ( typeof arguments[j].isArgument !== "undefined" && ( arguments[j].nameOf() == expectedArguments[i][0] && arguments[j].typeOf() == expectedArguments[i][1] ) ) found = true; \
										} \
										if ( !found ) throw new XException( XHttp.E_INVALID_ARGUMENT, 107 ); \
									} \
								} \
							} \
							for ( var i = 0; i < arguments.length; i++ ) { \
								if ( typeof arguments[i].isArgument !== "undefined" ) request.addArgument( arguments[i].nameOf(), arguments[i].valueOf(), arguments[i].typeOf() ); \
							} \
							if ( request.isReady() ) { \
								var response = new XResponse( request ); \
								if ( response.isComplete() ) { \
									var status = response.getStatusCode(); \
									if ( status > 99 && status < 300 ) { \
										return response.getReturn(); \
									} else if ( status > 299 && status < 400 ) { \
										throw new XException( XHttp.E_REDIRECTION_EXCEPTION, 103 ); \
									} else if ( status > 399 && status < 500 ) { \
										throw new XException( XHttp.E_CLIENT_EXCEPTION, 104 ); \
									} else if ( status > 499 && status < 550 ) { \
										throw new XException( XHttp.E_SERVER_EXCEPTION, 105 ); \
									} else if ( status == 550 ) { \
										var exception = response.getException(); \
										if ( exception ) throw new XException( exception[0], exception[1] ); \
										throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 ); \
									} else if ( status == 551 ) { \
										throw new XException( XHttp.E_INCOMPATIBLE_VERSION, 109 ); \
									} \
									throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 ); \
								} \
								throw new XException( XHttp.E_NOT_COMPLETE, 102 ); \
							} \
							throw new XException( XHttp.E_NOT_READY, 101 ); \
						};' );
						this[schema[action][0]].method   = method;
						this[schema[action][0]].host     = host;
						this[schema[action][0]].service  = service;
						this[schema[action][0]].version  = request.getVersion();
						this[schema[action][0]].encoding = request.getEncoding();
						this[schema[action][0]].schema   = {
							action    : schema[action][0],
							exceptions: schema[action][1],
							arguments : schema[action][2],
							returns   : schema[action][3]
						};
					}
				}
			} else if ( status > 299 && status < 400 ) {
				throw new XException( XHttp.E_REDIRECTION_EXCEPTION, 103 );
			} else if ( status > 399 && status < 500 ) {
				throw new XException( XHttp.E_CLIENT_EXCEPTION, 104 );
			} else if ( status > 499 && status < 550 ) {
				throw new XException( XHttp.E_SERVER_EXCEPTION, 105 );
			} else if ( status == 550 ) {
				var exception = response.getException();
				if ( exception ) throw new XException( exception[0], exception[1] );
				throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
			} else if ( status == 551 ) {
				throw new XException( XHttp.E_INCOMPATIBLE_VERSION, 109 );
			} else {
				throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
			}
		} else {
			throw new XException( XHttp.E_NOT_COMPLETE, 102 );
		}
	} else {
		throw new XException( XHttp.E_NOT_READY, 101 );
	}
}

XHttp.prototype = new Object();

function XRequest() {

	var host     = null;
	var method   = 'POST';
	var version  = '*.*';
	var mode     = null;
	var service  = null;
	var action   = null;
	var encoding = 'x-user-defined';

	var query   = [];
	var args    = [];
	var headers = {};

	this.isReady = function() {
		return ( host && ( ( mode && service ) || ( service && action ) ) );
	};

	this.getHost = function() {
		return host;
	};

	this.setHost = function( value ) {
		host = value || host;
		return this;
	};

	this.getMethod = function() {
		return method;
	};

	this.setMethod = function( value ) {
		method = value || method;
		return this;
	};

	this.getVersion = function() {
		return version;
	};

	this.setVersion = function( value ) {
		version = value || version;
		return this;
	};

	this.getMode = function() {
		return mode;
	};

	this.setMode = function( value ) {
		mode = value || mode;
		return this;
	};

	this.getService = function() {
		return service;
	};

	this.setService = function( value ) {
		service = value;
		return this;
	};

	this.getAction = function() {
		return action;
	};

	this.setAction = function( value ) {
		action = value;
		return this;
	};

	this.getEncoding = function() {
		return encoding;
	};

	this.setEncoding = function( value ) {
		encoding = value || encoding;
		return this;
	};

	this.getQuery = function( value ) {
		value = value || '';
		return ( query.length > 0 ) ? value + query.join( '&' ) : '';
	};

	this.getArguments = function() {
		return args.join( ',' );
	};

	this.addArgument = function( name, value, type ) {
		query.push( encodeURIComponent( name ) + '=' + encodeURIComponent( value ) );
		args.push( encodeURIComponent( name ) + ';' + Number( type ) );
		return this;
	};

	this.clearArguments = function() {
		query = [];
		args  = [];
		return this;
	};

	this.getHeaders = function() {
		return headers;
	};

	this.addHeader = function( name, value ) {
		headers[name] = value;
		return this;
	};

	this.clearHeaders = function() {
		headers = [];
		return this;
	};
}

XRequest.prototype = new Object();

function XResponse( request, callback ) {

	var complete = false;
	var error    = null;

	this.request  = new XMLHttpRequest();
	this.callback = callback || null;

	this.isComplete = function() {
		return complete;
	};

	this.getError = function() {
		return error;
	};

	this.getStatus = function() {
		return this.request.statusText;
	};

	this.getStatusCode = function() {
		return this.request.status;
	};

	this.getHeader = function( header ) {
		return this.request.getResponseHeader( header );
	};

	this.getException = function() {
		var header = this.request.getResponseHeader( 'Exception' );
		if ( header ) {
			var exception = header.split( /\s*;\s*/, 3 );
			exception[0]  = decodeURIComponent( exception[0] );
			exception[1]  = ( typeof exception[1] !== 'undefined' ) ? Number( exception[1] ) : 0;
			return exception;
		}
		return null;
	};

	this.getMessages = function() {
		return JSON.parse( this.request.getResponseHeader( 'X-Messages' ) );
	};

	this.getBody = function() {
		return this.request.responseText;
	};

	this.getReturn = function() {
		if ( !this.isComplete() ) throw new XException( XHttp.E_NOT_COMPLETE, 102 );
		var header = this.request.getResponseHeader( 'Return' );
		switch ( Number( header ) ) {
			case XHttp.TYPE_BOOLEAN : return Boolean( this.getBody() );
			case XHttp.TYPE_INTEGER : return Number( this.getBody() );
			case XHttp.TYPE_DOUBLE  : return Number( this.getBody() );
			case XHttp.TYPE_STRING  : return String( this.getBody() );
			case XHttp.TYPE_ARRAY   : return JSON.parse( this.getBody() );
			case XHttp.TYPE_STRUCT  : return JSON.parse( this.getBody() );
			case XHttp.TYPE_LAMBDA  : return new Function( this.getBody() );
			case XHttp.TYPE_BASE64  :
				return XBase64.decode( this.getBody() );
			case XHttp.TYPE_DATETIME: return new Date( this.getBody() );
			default: return null;
		}
	};

	this.getReturnType = function() {
		if ( !this.isComplete() ) throw new XException( XHttp.E_NOT_COMPLETE, 102 );
		return Number( this.request.getResponseHeader( 'Return' ) );
	};

	if ( request.isReady() ) {
		this.request.onerror = function( e ) {
			error = e;
			throw e;
		};
		this.request.open( request.getMethod(), request.getHost() + ( ( request.getMethod() != XRequest.POST ) ? request.getQuery( '?' ) : '' ), ( typeof callback === 'function' ) );
		this.request.setRequestHeader( 'Version', XHttp.VERSION );
		switch ( request.getMode() ) {
			case XRequest.MODE_VERSION:
				this.request.setRequestHeader( 'Mode', request.getMode() );
				this.request.setRequestHeader( 'Service', request.getService() + ';' + request.getVersion() );
				break;
			case XRequest.MODE_INFO:
				this.request.setRequestHeader( 'Mode', request.getMode() );
				this.request.setRequestHeader( 'Service', request.getService() + ';' + request.getVersion() );
				break;
			case XRequest.MODE_SCHEMA:
				this.request.setRequestHeader( 'Mode', request.getMode() );
				this.request.setRequestHeader( 'Service', request.getService() + ';' + request.getVersion() );
				if ( request.getAction() ) this.request.setRequestHeader( 'Action', request.getAction() );
				break;
			default:
				this.request.setRequestHeader( 'Service', request.getService() + ';' + request.getVersion() );
				this.request.setRequestHeader( 'Action', request.getAction() );
				this.request.setRequestHeader( 'Arguments', request.getArguments() );
		}
		this.request.setRequestHeader( 'Encoding', request.getEncoding() );
		if ( request.getMethod() == XRequest.POST ) {
			this.request.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded;charset=' + request.getEncoding() );
			this.request.setRequestHeader( 'Content-Length', request.getQuery().length );
		} else {
			this.request.setRequestHeader( 'Content-Type', 'text/plain;charset=' + request.getEncoding() );
		}
		var headers = request.getHeaders();
		for ( var header in headers ) this.request.setRequestHeader( header, headers[header] );
		this.request.onreadystatechange = function( e ) {
			if ( this.readyState == 4 ) {
				var response = {
					request: this,
					getBody: function() {
						return this.request.responseText;
					},
					getHeader: function( header ) {
						return this.request.getResponseHeader( header );
					},
					getStatus: function() {
						return this.request.status;
					},
					getMessages: function() {
						return JSON.parse( this.request.getResponseHeader( 'X-Messages' ) );
					}
				};
				if ( typeof callback === 'function' ) callback.call( response );
			}
		};
		this.request.overrideMimeType( 'text/plain;charset=' + request.getEncoding() );
		this.request.send( ( request.getMethod() == XRequest.POST ) ? request.getQuery() : null );
		complete = true;
	} else {
		throw new XException( XHttp.E_NOT_READY, 101 );
	}
}

XResponse.prototype = new Object();

function XArgument( name, value, type ) {

	this.isArgument = true;
	this.name       = ( typeof name !== 'undefined' ) ? name : '';
	this.value      = ( typeof value !== 'undefined' ) ? value : null;
	this.type       = ( typeof type !== 'undefined' ) ? type : XHttp.TYPE_NULL;

	this.nameOf = function() {
		return this.name;
	};

	this.valueOf = function() {
		return this.value;
	};

	this.typeOf = function() {
		return this.type;
	};
}

XArgument.prototype = new Object();

function XNull( name ) {

	this.name  = name || '';
	this.value = null;
	this.type  = XHttp.TYPE_NULL;
}

XNull.prototype = new XArgument();

function XBoolean( name, value ) {

	this.name  = name || '';
	this.value = ( typeof value === 'boolean' ) ? value : false;
	this.type  = XHttp.TYPE_BOOLEAN;
}

XBoolean.prototype = new XArgument();

function XInteger( name, value ) {

	this.name  = name || '';
	this.value = ( typeof value === 'number' ) ? value : 0;
	this.type  = XHttp.TYPE_INTEGER;
}

XInteger.prototype = new XArgument();

function XDouble( name, value ) {

	this.name  = name || '';
	this.value = ( typeof value === 'number' ) ? value : 0.0;
	this.type  = XHttp.TYPE_DOUBLE;
}

XDouble.prototype = new XArgument();

function XString( name, value ) {

	this.name  = name || '';
	this.value = ( typeof value === 'string' ) ? value : '';
	this.type  = XHttp.TYPE_STRING;
}

XString.prototype = new XArgument();

function XArray( name, value ) {

	this.name  = name || '';
	this.value = ( value instanceof Array ) ? JSON.stringify( value ) : '[]';
	this.type  = XHttp.TYPE_ARRAY;
}

XArray.prototype = new XArgument();

function XLambda( name, value ) {

	this.name  = name || '';
	this.value = ( typeof value === 'function' ) ? value.toString() : '';
	this.type  = XHttp.TYPE_LAMBDA;
}

XLambda.prototype = new XArgument();

function XStruct( name, value ) {

	this.name  = name || '';
	this.value = ( typeof value === 'object' && value !== null ) ? JSON.stringify( value ) : '{}';
	this.type  = XHttp.TYPE_STRUCT;
}

XStruct.prototype = new XArgument();

function XBase64( name, value ) {

	this.name  = name || '';
	this.value = XBase64.encode( value || '' );
	this.type  = XHttp.TYPE_BASE64;
}

XBase64.prototype = new XArgument();

function XDateTime( name, value ) {

	this.name  = name || '';
	this.value = XDateTime.format( ( value instanceof Date ) ? value : new Date() );
	this.type  = XHttp.TYPE_DATETIME;
}

XDateTime.prototype = new XArgument();

function XException( message, code ) {

	this.name    = 'XException';
	this.message = message || '';
	this.code    = code || 0;
}

Error.prototype.code = 0;
XException.prototype = new Error();

XHttp.VERSION = '1.0';
XHttp.SCHEMA  = 'http://www.xhttp.org/schema';

XHttp.E_NOT_READY             = 'Cannot process response if request not ready'; // 101
XHttp.E_NOT_COMPLETE          = 'Cannot return value of incomplete response'; // 102
XHttp.E_REDIRECTION_EXCEPTION = 'Redirection exception'; // 103
XHttp.E_CLIENT_EXCEPTION      = 'Client exception'; // 104
XHttp.E_SERVER_EXCEPTION      = 'Server exception'; // 105
XHttp.E_MISSING_ARGUMENTS     = 'Missing required arguments'; // 106
XHttp.E_INVALID_ARGUMENT      = 'Invalid argument passed'; // 107
XHttp.E_UNKNOWN_EXCEPTION     = 'Unknown exception'; // 108
XHttp.E_INCOMPATIBLE_VERSION  = 'Incompatible protocol version'; // 109

XHttp.TYPE_NULL     = 0;
XHttp.TYPE_BOOLEAN  = 1;
XHttp.TYPE_INTEGER  = 2;
XHttp.TYPE_DOUBLE   = 3;
XHttp.TYPE_STRING   = 4;
XHttp.TYPE_ARRAY    = 5;
XHttp.TYPE_STRUCT   = 6;
XHttp.TYPE_LAMBDA   = 7;
XHttp.TYPE_BASE64   = 8;
XHttp.TYPE_DATETIME = 9; // ISO 8601 format

XHttp.CUSTOM  = 0;
XHttp.INFO    = 1;
XHttp.CONFIRM = 2;
XHttp.WARNING = 3;
XHttp.ERROR   = 4;

XHttp.RETURN_TYPE = null;

XHttp.version = function( method, host, service ) {
	if ( arguments.length < 3 || ( typeof method !== 'string' || typeof host !== 'string' || typeof service !== 'string' ) ) throw new XException( XHttp.E_MISSING_ARGUMENTS, 106 );
	var request = new XRequest();
	request.setMethod( method );
	request.setHost( host );
	request.setMode( XRequest.MODE_VERSION );
	request.setService( service );
	if ( request.isReady() ) {
		var response = new XResponse( request );
		if ( response.isComplete() ) {
			var status = response.getStatusCode();
			if ( status > 99 && status < 300 ) {
				return response.getReturn();
			} else if ( status > 299 && status < 400 ) {
				throw new XException( XHttp.E_REDIRECTION_EXCEPTION, 103 );
			} else if ( status > 399 && status < 500 ) {
				throw new XException( XHttp.E_CLIENT_EXCEPTION, 104 );
			} else if ( status > 499 && status < 550 ) {
				throw new XException( XHttp.E_SERVER_EXCEPTION, 105 );
			} else if ( status == 550 ) {
				var exception = response.getException();
				if ( exception ) throw new XException( exception[0], exception[1] );
				throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
			} else if ( status == 551 ) {
				throw new XException( XHttp.E_INCOMPATIBLE_VERSION, 109 );
			}
			throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
		}
		throw new XException( XHttp.E_NOT_COMPLETE, 102 );
	}
	throw new XException( XHttp.E_NOT_READY, 101 );
};

XHttp.info = function( method, host, service, version ) {
	if ( arguments.length < 3 || ( typeof method !== 'string' || typeof host !== 'string' || typeof service !== 'string' ) ) throw new XException( XHttp.E_MISSING_ARGUMENTS, 106 );
	var request = new XRequest();
	request.setMethod( method );
	request.setHost( host );
	request.setMode( XRequest.MODE_INFO );
	request.setService( service );
	if ( typeof version === 'string' ) request.setVersion( version );
	if ( request.isReady() ) {
		var response = new XResponse( request );
		if ( response.isComplete() ) {
			var status = response.getStatusCode();
			if ( status > 99 && status < 300 ) {
				var info = response.getReturn();
				return {
					get: function( name ) {
						if ( typeof name === 'string' ) {
							name = name.toLowerCase();
							for ( var i = 0; i < info.length; i++ ) {
								if ( info[i][0].toLowerCase() == name ) return info[i][1];
							}
						}
						return null;
					},
					set: function( name, value ) {
						if ( typeof name === 'string' ) {
							name = name.toLowerCase();
							for ( var i = 0; i < info.length; i++ ) {
								if ( info[i][0].toLowerCase() == name ) {
									info[i][1] = value;
									return this;
								}
							}
							info.push( [ name, value ] );
							return this;
						}
						return false;
					}
				};
			} else if ( status > 299 && status < 400 ) {
				throw new XException( XHttp.E_REDIRECTION_EXCEPTION, 103 );
			} else if ( status > 399 && status < 500 ) {
				throw new XException( XHttp.E_CLIENT_EXCEPTION, 104 );
			} else if ( status > 499 && status < 550 ) {
				throw new XException( XHttp.E_SERVER_EXCEPTION, 105 );
			} else if ( status == 550 ) {
				var exception = response.getException();
				if ( exception ) throw new XException( exception[0], exception[1] );
				throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
			} else if ( status == 551 ) {
				throw new XException( XHttp.E_INCOMPATIBLE_VERSION, 109 );
			}
			throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
		}
		throw new XException( XHttp.E_NOT_COMPLETE, 102 );
	}
	throw new XException( XHttp.E_NOT_READY, 101 );
};

XHttp.schema = function( method, host, service, action, version ) {
	if ( arguments.length < 3 || ( typeof method !== 'string' || typeof host !== 'string' || typeof service !== 'string' ) ) throw new XException( XHttp.E_MISSING_ARGUMENTS, 106 );
	var request = new XRequest();
	request.setMethod( method );
	request.setHost( host );
	request.setMode( XRequest.MODE_SCHEMA );
	request.setService( service );
	if ( typeof action === 'string' ) request.setAction( action );
	if ( typeof version === 'string' ) request.setVersion( version );
	if ( request.isReady() ) {
		var response = new XResponse( request );
		if ( response.isComplete() ) {
			var status = response.getStatusCode();
			if ( status > 99 && status < 300 ) {
				var schema = response.getReturn();
				if ( typeof action === 'string' ) {
					return {
						action    : schema[0],
						exceptions: schema[1],
						arguments : schema[2],
						returns   : schema[3]
					};
				}
				var data = [];
				for ( var i = 0; i < schema.length; i++ ) data.push( {
					action    : schema[i][0],
					exceptions: schema[i][1],
					arguments : schema[i][2],
					returns   : schema[i][3]
				} );
				return data;
			} else if ( status > 299 && status < 400 ) {
				throw new XException( XHttp.E_REDIRECTION_EXCEPTION, 103 );
			} else if ( status > 399 && status < 500 ) {
				throw new XException( XHttp.E_CLIENT_EXCEPTION, 104 );
			} else if ( status > 499 && status < 550 ) {
				throw new XException( XHttp.E_SERVER_EXCEPTION, 105 );
			} else if ( status == 550 ) {
				var exception = response.getException();
				if ( exception ) throw new XException( exception[0], exception[1] );
				throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
			} else if ( status == 551 ) {
				throw new XException( XHttp.E_INCOMPATIBLE_VERSION, 109 );
			}
			throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
		}
		throw new XException( XHttp.E_NOT_COMPLETE, 102 );
	}
	throw new XException( XHttp.E_NOT_READY, 101 );
};

XHttp.perform = function( method, host, service, action, args, version ) {
	if ( arguments.length < 4 || ( typeof method !== 'string' || typeof host !== 'string' || typeof service !== 'string' || typeof action !== 'string' ) ) throw new XException( XHttp.E_MISSING_ARGUMENTS, 106 );
	var request = new XRequest();
	request.setMethod( method );
	request.setHost( host );
	request.setService( service );
	request.setAction( action );
	if ( typeof version !== 'undefined' ) request.setVersion( version );
	if ( args instanceof Array || ( typeof args === 'object' && typeof args.length !== 'undefined' ) ) {
		for ( var i = 0; i < args.length; i++ ) {
			if ( typeof args[i].isArgument !== 'undefined' ) request.addArgument( args[i].nameOf(), args[i].valueOf(), args[i].typeOf() );
		}
	}
	if ( request.isReady() ) {
		var response = new XResponse( request );
		if ( response.isComplete() ) {
			var status = response.getStatusCode();
			if ( status > 99 && status < 300 ) {
				XHttp.RETURN_TYPE = response.getReturnType();
				return response.getReturn();
			} else if ( status > 299 && status < 400 ) {
				throw new XException( XHttp.E_REDIRECTION_EXCEPTION, 103 );
			} else if ( status > 399 && status < 500 ) {
				throw new XException( XHttp.E_CLIENT_EXCEPTION, 104 );
			} else if ( status > 499 && status < 550 ) {
				throw new XException( XHttp.E_SERVER_EXCEPTION, 105 );
			} else if ( status == 550 ) {
				var exception = response.getException();
				if ( exception ) throw new XException( exception[0], exception[1] );
				throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
			} else if ( status == 551 ) {
				throw new XException( XHttp.E_INCOMPATIBLE_VERSION, 109 );
			}
			throw new XException( XHttp.E_UNKNOWN_EXCEPTION, 108 );
		}
		throw new XException( XHttp.E_NOT_COMPLETE, 102 );
	}
	throw new XException( XHttp.E_NOT_READY, 101 );
};

XRequest.CONNECT = 'CONNECT';
XRequest.OPTIONS = 'OPTIONS';
XRequest.HEAD    = 'HEAD';
XRequest.GET     = 'GET';
XRequest.POST    = 'POST';
XRequest.PUT     = 'PUT';
XRequest.DELETE  = 'DELETE';
XRequest.TRACE   = 'TRACE';

XRequest.MODE_PERFORM = 'perform';
XRequest.MODE_VERSION = 'version';
XRequest.MODE_INFO    = 'info';
XRequest.MODE_SCHEMA  = 'schema';

XBase64.CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
XBase64.encode = function( input ) {
	var output = '', i = 0, chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	input = XBase64.encodeUTF8( input );
	while ( i < input.length ) {
		chr1 = input.charCodeAt( i++ );
		chr2 = input.charCodeAt( i++ );
		chr3 = input.charCodeAt( i++ );
		enc1 = chr1 >> 2;
		enc2 = ( ( chr1 & 3 ) << 4 ) | ( chr2 >> 4 );
		enc3 = ( ( chr2 & 15 ) << 2 ) | ( chr3 >> 6 );
		enc4 = chr3 & 63;
		if ( isNaN( chr2 ) ) {
			enc3 = enc4 = 64;
		} else if ( isNaN( chr3 ) ) {
			enc4 = 64;
		}
		output = output + XBase64.CHARS.charAt( enc1 ) + XBase64.CHARS.charAt( enc2 ) + XBase64.CHARS.charAt( enc3 ) + XBase64.CHARS.charAt( enc4 );
	}
	return output;
};
XBase64.decode = function( input ) {
	var output = '', i = 0, chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	input = input.replace( /[^A-Za-z0-9\+\/\=]/g, '' );
	while ( i < input.length ) {
		enc1 = XBase64.CHARS.indexOf( input.charAt( i++ ) );
		enc2 = XBase64.CHARS.indexOf( input.charAt( i++ ) );
		enc3 = XBase64.CHARS.indexOf( input.charAt( i++ ) );
		enc4 = XBase64.CHARS.indexOf( input.charAt( i++ ) );
		chr1 = ( enc1 << 2 ) | ( enc2 >> 4 );
		chr2 = ( ( enc2 & 15 ) << 4 ) | ( enc3 >> 2 );
		chr3 = ( ( enc3 & 3 ) << 6 ) | enc4;
		output = output + String.fromCharCode( chr1 );
		if ( enc3 != 64 ) output = output + String.fromCharCode( chr2 );
		if ( enc4 != 64 ) output = output + String.fromCharCode( chr3 );
	}
	return XBase64.decodeUTF8( output );
};
XBase64.encodeUTF8 = function( input ) {
	input      = input.replace( /\r\n/g, "\n" );
	var output = '';
	for ( var n = 0; n < input.length; n++ ) {
		var c = input.charCodeAt( n );
		if ( c < 128 ) {
			output += String.fromCharCode( c );
		} else if ( ( c > 127 ) && ( c < 2048 ) ) {
			output += String.fromCharCode( ( c >> 6 ) | 192 );
			output += String.fromCharCode( ( c & 63 ) | 128 );
		} else {
			output += String.fromCharCode( ( c >> 12 ) | 224 );
			output += String.fromCharCode( ( ( c >> 6 ) & 63) | 128 );
			output += String.fromCharCode( ( c & 63 ) | 128 );
		}
	}
	return output;
};
XBase64.decodeUTF8 = function( input ) {
	var output = '', i = 0, c = c1 = c2 = 0;
	while ( i < input.length ) {
		c = input.charCodeAt( i );
		if ( c < 128 ) {
			output += String.fromCharCode( c );
			i++;
		} else if ( ( c > 191 ) && ( c < 224 ) ) {
			c2 = input.charCodeAt( i+1 );
			output += String.fromCharCode( ( ( c & 31 ) << 6 ) | ( c2 & 63 ) );
			i += 2;
		} else {
			c2 = input.charCodeAt( i+1 );
			c3 = input.charCodeAt( i+2 );
			output += String.fromCharCode( ( ( c & 15 ) << 12 ) | ( ( c2 & 63 ) << 6 ) | ( c3 & 63 ) );
			i += 3;
		}
	}
	return output;
};

XDateTime.format = function( date ) {
	function pad( n ) {
		return ( n < 10 ) ? '0' + n : n;
	}
	return date.getUTCFullYear() + '-' + pad( date.getUTCMonth() + 1 ) + '-' + pad( date.getUTCDate() ) + 'T' + pad( date.getUTCHours() ) + ':' + pad( date.getUTCMinutes() ) + ':' + pad( date.getUTCSeconds() ) + 'Z';
};

