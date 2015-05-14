window.xpw = (function () {
	function a2hex(str) {
		var arr = [];
		for (var i = 0, l = str.length; i < l; i ++) {
			var hex = Number(str.charCodeAt(i)).toString(16);
			if(hex.length < 2)
				hex = '0'+hex;
			if(hex.length==2)
				arr.push(hex);
		}
		return arr.join('');
	}
	
	function hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
	}
	
	var xpw = {
		serialTransmit: function (args) {
			if (typeof args === "undefined")
				return;
			var line = (args.line == '1' || args.line == '2') ? args.line : '1';
			if (typeof args.message === "undefined") {
				if (typeof args.callback !== "undefined")
					args.callback({success: false,
								error: "No Message to send"});
				return;
			}
			else {
				// Setup the status action with group=Line
				var postMsg = "group=Line&optionalGroupInstance=";	
				// Here we add the optionalGroupInstance which is 1 or 2 (the Line)
				postMsg += line;	
				// We're going to transmit in hex, note the space after Hex Transmit!
				postMsg +="&optionalItem=Transmitter&action=Hex Transmit ";		
				// After the space we add the string we want to send (in hex)
				postMsg += String(a2hex(args.message));	
				xmlhttp=new XMLHttpRequest();
				
				if (typeof args.callback !== "undefined")
					xmlhttp.onreadystatechange=function() {
						if (xmlhttp.readyState==4) 
							if (xmlhttp.status==200)
								args.callback({success:true});
							else
								args.callback({success:false});
					}

				xmlhttp.open("POST", "/action/status", true);					// This is the URL for Status Actions
				xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xmlhttp.send(postMsg);											// Send!
			}
		},
		serialReceive: function (args) {
			if (typeof args === "undefined")
				return;
			var line = (args.line == '1' || args.line == '2') ? args.line : '1';
			var postMsg = "group=Line&optionalGroupInstance=";
			postMsg += line;
			postMsg += "&optionalItem=Receiver&action=Hex Receive";
	
			xmlhttp=new XMLHttpRequest();
	
			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							var xmlDoc=xmlhttp.responseXML;
							var message = xmlDoc.getElementsByTagName("message");
							var result = xmlDoc.getElementsByTagName("result");
				
							if(result[0].childNodes[0].nodeValue=="Succeeded") {
								var textIn = "";
								if(message[0] && message[0].childNodes.length >0) {
									textIn = message[0].childNodes[0].nodeValue;
									textIn = textIn.replace(/\s+/g,'');
									textIn = hex2a(textIn);
								}
								args.done({success:true, message:textIn});
							} else {
								args.done({success:false});
							}
						} else {
							args.done({success:false});
						}
					}
				}
			}
	
			xmlhttp.open("POST", "/action/status", true);					// This is the URL for Status Actions
			xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlhttp.send(postMsg);
		}
	};
	
	return xpw;

}());