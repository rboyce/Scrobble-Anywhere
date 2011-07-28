Util = {
	sortObject: function(o) {
		var sorted = {}, key, a = [];
		
		for(key in o) {
			if(o.hasOwnProperty(key)) {
				a.push(key);
			}
		}
		
		a.sort();
		
		for(key = 0; key < a.length; key++) {
			sorted[a[key]] = o[a[key]];
		}
		return sorted;
	},
	buildQuery: function(params) {
		var query = [], paramName;
		for(paramName in params) {
			query.push(encodeURIComponent(paramName) + '=' + encodeURIComponent(params[paramName]));
		}
		return query.join('&');
	}
};

Scrobbler = {
	apiKey: "3782aa8b2bedec1020e87ba55411533f",
	apiSecret: "0e9cdc350d10b96050b5cdfc68223418",
	// please be kind and don't steal these
	
	apiRoot: "http://ws.audioscrobbler.com/2.0/",
	
	getToken: function(callback) {
		var params = {method: "auth.getToken"};
		
		Scrobbler.makeRequest(params, callback);
	},
	
	getSession: function(token, callback) {
		var params = {
			method: "auth.getSession",
			token: token
		};
		
		Scrobbler.makeRequest(params, callback);
	},
	
	scrobble: function(artist, track, callback) {
		var params = {
			method: "track.scrobble",
			artist: artist,
			track: track,
			sk: safari.extension.settings.sessionKey
		};
		
		Scrobbler.makeRequest(params, callback);
	},
	
	makeRequest: function(params, callback) {
		params.api_key = Scrobbler.apiKey;
		params.api_sig = Scrobbler.signRequest(params);
		params.format = "json";
		
		var xhr = new XMLHttpRequest();
		xhr.open("POST", Scrobbler.apiRoot + '?' + Util.buildQuery(params), true);
		
		xhr.onreadystatechange = function(data) {
			if(xhr.readyState === 4 && xhr.status === 200) {
				if(callback) {
					callback(JSON.parse(xhr.responseText));
				}
			}
			else if(xhr.readyState === 4) {
				console.log("error");
				console.log(xhr);
				if(typeof callback === "function") {
					callback({
						error: "Last.fm appears to be unavailable.",
						status: xhr.status
					});
				}
			}
		};
		xhr.send();
	},
	
	signRequest: function(params) {
		if(typeof params !== "object") {
			params = [];
		}
		
		if(params.api_key === undefined) {
			params.api_key = Scrobbler.apiKey;
		}
		if(params.timestamp === undefined) {
			params.timestamp = Math.round((new Date()).getTime() / 1000);
		}
		
		var sortedParams = Util.sortObject(params);
		
		var sigString = "", paramName;
		for(paramName in sortedParams) {
			sigString += paramName + sortedParams[paramName];
		}
		return hex_md5(sigString + Scrobbler.apiSecret);
	}
};