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
				if (typeof args.done !== "undefined")
					args.done({success: false,
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
				var xmlhttp=new XMLHttpRequest();

				if (typeof args.done !== "undefined")
					xmlhttp.onreadystatechange=function() {
						if (xmlhttp.readyState==4)
							if (xmlhttp.status==200)
								args.done({success:true});
							else
								args.done({success:false});
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

			var xmlhttp=new XMLHttpRequest();

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
		},
		getLineConfig: function(args) {
			if (typeof args === "undefined")
				return;
			var line = (args.line == '1' || args.line == '2') ? args.line : '1';
			var xmlhttp=new XMLHttpRequest();

			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							var config = {};
							var xmlDoc=xmlhttp.responseXML;
							var items = xmlDoc.getElementsByTagName("configitem");

							for(var i=0;i<items.length;i++){
								if(items[i].getElementsByTagName("value")[0].childNodes.length > 0) {
									config[items[i].getAttribute('name')] = items[i].getElementsByTagName("value")[0].childNodes[0].nodeValue;
								}
							}

							args.done({success:true, lineConfig:config});
						} else {
							args.done({success:false});
						}
					}
				}
			}

			var postMsg = "optionalGroupList=Line:"+line;

			xmlhttp.open("POST", "/export/config", true);					// This is the URL for Status Actions
			xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlhttp.send(postMsg);
		},
		setLineConfig: function(args) {
			if (typeof args === "undefined" || typeof args.line === "undefined" || typeof args.items === "undefined")
				return;
			var line = (args.line == '1' || args.line == '2') ? args.line : '1';
			var xmlhttp=new XMLHttpRequest();

			var postMsg = "<?xml version=\"1.0\" standalone=\"yes\"?><!-- Automatically generated XML --><!DOCTYPE configrecord [  <!ELEMENT configrecord (configgroup+)><!ELEMENT configgroup (configitem+)><!ELEMENT configitem (value+)><!ELEMENT value (#PCDATA)><!ATTLIST configrecord version CDATA #IMPLIED><!ATTLIST configgroup name CDATA #IMPLIED><!ATTLIST configgroup instance CDATA #IMPLIED><!ATTLIST configitem name CDATA #IMPLIED><!ATTLIST configitem instance CDATA #IMPLIED><!ATTLIST value name CDATA #IMPLIED>]><configrecord version = \"0.1.0.1\"><configgroup name = \"Line\" instance = \""+line+"\">";

			for(var name in args.items) {
				postMsg += "<configitem name = \""+name+"\"><value>"+args.items[name]+"</value></configitem>";
			}
			postMsg+="</configgroup></configrecord>"

			var fd = new FormData();
			fd.append("configrecord", postMsg);

			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							var config = {};
							var xmlDoc=xmlhttp.responseXML;
							var result = xmlDoc.getElementsByTagName("result");

							if(result[0].childNodes[0].nodeValue=="Succeeded") {
								args.done({success:true});
							} else {
								args.done({success:false});
							}
						}
					}
				}
			}
			xmlhttp.open("POST", "/import/config", true);					// This is the URL for Status Actions
			xmlhttp.send(fd);
		},
		getGpioStatus: function(args) {
			var xmlhttp=new XMLHttpRequest();

			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							var status = [];
							var xmlDoc=xmlhttp.responseXML;
							var items = xmlDoc.getElementsByTagName("statusitem");

							for(var i=0;i<items.length;i++){
								var config = {}
								config["gpio"] = items[i].getAttribute("instance")
								if(items[i].getElementsByTagName("value").length > 0) {
									for(var j=0;j<items[i].getElementsByTagName("value").length;j++) {
										var val = items[i].getElementsByTagName("value")[j].childNodes[0].nodeValue;
										switch (items[i].getElementsByTagName("value")[j].getAttribute("name")) {
											case "Usage":
												config["isOutput"] = val == "Output";
												config["enabled"] = (val == "Output") || (val == "Input");
												break;
											case "Assert":
												config["assertLow"] = val != "High";
												break;
											case "Value":
												config["isAsserted"] = val == "1";
												break;
										}
									}
								}
								status.push(config);
							}
							args.done({success:true, status:status});
						} else {
							args.done({success:false});
						}
					}
				}
			}

			var postMsg = "optionalGroupList=CPM CPs";

			xmlhttp.open("POST", "/export/status", true);					// This is the URL for Status Actions
			xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlhttp.send(postMsg);

		},
		setGpio: function(args) {
			if (typeof args === "undefined" || typeof args.gpio === "undefined" || typeof args.command === "undefined")
				return;
			var postMsg = "group=CPM CPs&optionalItem=CP&optionalItemInstance=";
			postMsg += args.gpio+"&action=";

			switch (args.command) {
				case "disable":
					postMsg += "Usage Unused";
					break;
				case "input":
					postMsg += "Usage Input";
					break;
				case "output":
					postMsg += "Usage Output";
					break;
				case "assert":
					postMsg += "Value 1";
					break;
				case "unassert":
					postMsg += "value 0";
					break;
			}

			var xmlhttp=new XMLHttpRequest();

			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							var xmlDoc=xmlhttp.responseXML;
							var result = xmlDoc.getElementsByTagName("result");

							if(result[0].childNodes[0].nodeValue=="Succeeded") {
								args.done({success:true});
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
