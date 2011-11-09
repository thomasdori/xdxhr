(function($) {
    "use strict";

    //Constants used as url.compareOrigin return value
    var origin = {'host':'host', 'protocol':'protocol', 'port':'port'},


        overWritejQueryAjax = function() {
                // Create the request object
                // (This is still attached to ajaxSettings for backward compatibility)
                $.ajaxSettings.xdr = function() {
                    return (window.XDomainRequest ?
                            new window.XDomainRequest() : null
                            );
                };
                // Determine support properties
                (function(xdr) {
                    $.extend($.support, { iecors: !!xdr });
                }($.ajaxSettings.xdr()));
                // Create transport if the browser can provide an xdr
                if ($.support.iecors) {
                    $.ajaxTransport(function(s) {
                        return {
                            send: function(headers, complete) {
                                var xdr = s.xdr();
                                xdr.onload = function() {
                                    complete(200, 'OK', { text: xdr.responseText }, headers);
                                };
                                xdr.onerror = s.error;
                                xdr.open(s.type, s.url);
                                xdr.send(s.data ? $.param(s.data) : null);
                            }
                        };
                    });
                }
            };

    /**
     * Initialization of jquery xdxhr plugin includes sending of given data.
     *
     * @constructor
     * @param {object}      options         The options including url, callback, type and everything else that could be used as an option for jQuery.ajax().
     */
    $.xdxhr = function(options) {
        var settings, compareOriginResult, types, errorHandlerCallback, errorHandler;

		//do jsonp request with default error handler
        errorHandlerCallback = function(){
         	options.dataType = "jsonp";
         	options.error = errorHandler;
			$.ajax(options);
        };
         
        errorHandler = options.error;

        settings = {
            'url': options.url,
            'success': options.success,
            'error': errorHandlerCallback,
            'type': options.type ? options.type : 'POST',
            'data': options.data
        };

        options = settings;

        types = {
	        "GET": "GET",
	        "POST": "POST"
        };

        if (!options.url || !options.success || !types.hasOwnProperty(options.type)) {
            return false;
        }


        if ((compareOriginResult = $.url(options.url).compareOrigin()) !== "") {
            //is not same origin

            //IE only allows POST and GET
            if (typeof(window.XDomainRequest) !== "undefined" && compareOriginResult !== origin.protocol && ((options.type === 'GET') || (options.type === 'POST' && !options.data))) {
                //client is IE8+
                //protocol is the same
                //no data that should be sent via POST
                overWritejQueryAjax();
            } else if (!(new XMLHttpRequest()).hasOwnProperty("withCredentials")) {
                //client does not support CORS
                options.dataType = "jsonp";
            } //else CORS is supported
        }

        $.ajax(options);

        return false;
    };

    $.url = function(strUrl) {
        //possible url: http://username:password@www.example.org:80/demo/example.php?country=at&city=vienna#history
        var credentials, hostbegin, protocol = "", user = "", password = "", host = "", port = "", path = "", search = "", fragment = "", href = "";

        //check if strUlr is not undefined and not empty
        if (strUrl) {
            href = strUrl;

            protocol = strUrl.substring(0, (strUrl.indexOf("://") > -1 ? strUrl.indexOf("://") : 0));

            credentials = strUrl.substring(protocol.length + 3, (strUrl.indexOf("@") > -1) ? strUrl.indexOf("@") : protocol.length + 3);
            user = (credentials.indexOf(":") > -1) ? credentials.split(':')[0] : credentials;
            password = (credentials.indexOf(":") > -1) ? credentials.split(':')[1] : "";

            hostbegin = protocol.length + 3 + (credentials.length > 0 ? credentials.length + 1 : 0);
            host = strUrl.substr(hostbegin, (strUrl.substring(hostbegin).indexOf("/") > -1) ? strUrl.substring(hostbegin).indexOf("/") : strUrl.length);

            port = host.substring(host.indexOf(":") > -1 ? host.indexOf(":") + 1 : host.length, host.length);

            host = (port.length > 0) ? host.split(':')[0] : host;

            path = strUrl.substring(hostbegin + host.length + (port.length > 0 ? port.length + 1 : 0 ) + 1, strUrl.length);

            search = strUrl.substring(strUrl.indexOf("?") > -1 ? strUrl.indexOf("?") + 1 : strUrl.length, strUrl.indexOf("#") > -1 ? strUrl.indexOf("#") : strUrl.length);

            path = (search.length > 0) ? path.split('?')[0] : path;

            fragment = strUrl.substring(strUrl.indexOf("#") > -1 ? strUrl.indexOf("#") + 1 : strUrl.length, strUrl.length);

            path = (fragment.length > 0) ? path.split('#')[0] : path;
        }

        return {
            'href': href,
            'protocol': protocol,
            'user': user,
            'password': password,
            'host': host,
            'port': port,
            'path': path,
            'search': search,
            'fragment':fragment,
            'compareOrigin': function(urlString) {
                var originUrl;

                if (typeof(urlString) === "undefined") {
                    originUrl = $.url(document.URL);
                } else if (typeof(urlString) === "string") {
                    originUrl = $.url(urlString);
                } else {
                    return null;
                }


                if (this.protocol !== originUrl.protocol) {
                    return origin.protocol;
                }

                if (this.port !== originUrl.port) {
                    return origin.port;
                }

                if (this.host !== originUrl.host) {
                    return origin.host;
                }

                return "";
            }
        };
    };

}($));