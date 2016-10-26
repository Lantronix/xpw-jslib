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

	function unescapeHTML(html) {
		var htmlNode = document.createElement("div");
  	htmlNode.innerHTML = html;
  	if(htmlNode.innerText)
    	return htmlNode.innerText; // IE
  	else
    	return htmlNode.textContent;
	}

	function escapeXML(str) {
		return str.replace(/&/g,'&#38;').replace(/</g,'&#60;').replace(/>/g,'&#62;');
	}

	var xmlHeader = "<?xml version=\"1.0\" standalone=\"yes\"?><!-- Automatically generated XML --><!DOCTYPE configrecord [  <!ELEMENT configrecord (configgroup+)><!ELEMENT configgroup (configitem+)><!ELEMENT configitem (value+)><!ELEMENT value (#PCDATA)><!ATTLIST configrecord version CDATA #IMPLIED><!ATTLIST configgroup name CDATA #IMPLIED><!ATTLIST configgroup instance CDATA #IMPLIED><!ATTLIST configitem name CDATA #IMPLIED><!ATTLIST configitem instance CDATA #IMPLIED><!ATTLIST value name CDATA #IMPLIED>]><configrecord version = \"0.1.0.1\">"

	var xpw = {
		serialTransmit: function (args) {
			if (typeof args === "undefined")
				return;
			var line = (args.line == '1' || args.line == '2' || args.line == 'CDC_ACM') ? args.line : '1';
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
			var line = (args.line == '1' || args.line == '2' || args.line == 'CDC_ACM') ? args.line : '1';
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
		serialTransact: function(args) {
			if (typeof args === "undefined")
				return;
			var line = (args.line == '1' || args.line == '2' || args.line == 'CDC_ACM') ? args.line : '1';
			if (typeof args.message === "undefined") {
				if (typeof args.done !== "undefined")
					args.done({success: false, error: "No Message to send"});
				return;
			} else {
				// Setup the status action with group=Line
				var postMsg = "group=Line&optionalGroupInstance=";
				// Here we add the optionalGroupInstance which is 1 or 2 (the Line)
				postMsg += line;
				// We're going to transmit in hex, note the space after Hex Transmit!
				postMsg +="&action=Command ";
				if (typeof args.n !== "undefined") {
					postMsg +="n="+args.n+" ";
				}
				if (typeof args.m !== "undefined") {
					postMsg +="m="+args.m+" ";
				}
				if (typeof args.t !== "undefined") {
					postMsg +="t="+args.t+" ";
				}
				// After the space we add the string we want to send (in hex)
				postMsg += String(a2hex(args.message));
				var xmlhttp=new XMLHttpRequest();

				if (typeof args.done !== "undefined")
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

				xmlhttp.open("POST", "/action/status", true);					// This is the URL for Status Actions
				xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xmlhttp.send(postMsg);											// Send!
			}
		},
		getLineConfig: function(args) {
			if (typeof args === "undefined")
				return;
			var line = (args.line == '1' || args.line == '2' || args.line == 'CDC_ACM') ? args.line : '1';
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
			var line = (args.line == '1' || args.line == '2' || args.line == 'CDC_ACM') ? args.line : '1';
			var xmlhttp=new XMLHttpRequest();

			var postMsg = xmlHeader+"<configgroup name = \"Line\" instance = \""+line+"\">";

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
											case "Mode":
											  config["pullup"] = val == "Weak Pullup";
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
					postMsg += "Value 0";
					break;
				case "assertHigh":
					postMsg += "Assert High";
					break;
				case "assertLow":
					postMsg += "Assert Low";
					break;
				case "push-pull":
					postMsg += "Mode Push-Pull";
					break;
				case "pullup":
					postMsg += "Mode Weak Pullup";
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
		},
		startScan: function() {
			var xmlhttp=new XMLHttpRequest();
			xmlhttp.open("POST", "/", true);
			xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlhttp.send("ajax=WLANScanSSID&ssid=&Scan=Scan&iehack=")
		},
		getScanResults: function(args) {
			var xmlhttp=new XMLHttpRequest();

			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
						if (xmlhttp.readyState==4) {
							if (xmlhttp.status==200) {
								var data = [];
								var xmlDoc=xmlhttp.responseXML;
								var items = xmlDoc.getElementsByTagName("network");

								for(var i=0;i<items.length;i++){
									var network = {}
									network["ssid"] = items[i].getElementsByTagName("ssid")[0].childNodes[0].nodeValue;
									network["bssid"] = items[i].getElementsByTagName("bssid")[0].childNodes[0].nodeValue;
									network["channel"] = items[i].getElementsByTagName("channel")[0].childNodes[0].nodeValue;
									network["rssi"] = items[i].getElementsByTagName("rssi")[0].childNodes[0].nodeValue;
									network["flags"] = items[i].getElementsByTagName("flags")[0].childNodes[0].nodeValue;
									data.push(network);
								}
								args.done({success:true, networks:data});
							} else {
								args.done({success:false});
							}
						}
					}
				}
			var d = new Date();
			xmlhttp.open("GET", "/ajax/quickconnect/results?"+d.getTime(), true);
			xmlhttp.send();
		},
		getWlanProfiles: function(args) {
			var xmlhttp=new XMLHttpRequest();

			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							var data = [];
							var xmlDoc=xmlhttp.responseXML;
							if (xmlDoc == null) {
								args.done({success:false, profiles: []});
								return;
							}
							var items = xmlDoc.getElementsByTagName("configgroup");

							for(var i=0;i<items.length;i++){
								var profile = {}
								profile["name"] = items[i].getAttribute("instance");
								data.push(profile);
							}
							args.done({success:true, profiles:data})
						} else {
							args.done({success:false, profiles: []});
						}
					}
				}
			}

			xmlhttp.open("POST", "/export/config", true);					// This is the URL for Status Actions
			xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlhttp.send("optionalGroupList=WLAN Profile");
		},
		addWlanProfile: function(args) {
			if (typeof args === "undefined")
				return;
			var postMsg = xmlHeader+"<configgroup name=\"WLAN Profile\" instance=\""+args.network.ssid+"\">";
			postMsg+="<configitem name =\"Basic\"><value name=\"Network Name\">"+unescapeHTML(args.network.ssid)+"</value><value name=\"State\">Enabled</value></configitem><configitem name = \"Security\">";
			if (~args.network.flags.indexOf('WPA2')) {
				postMsg+="<value name = \"Suite\">WPA2</value><value name = \"WPAx Key Type\">Passphrase</value><value name = \"WPAx Passphrase\">"+args.password+"</value><value name = \"WPAx Encryption\">";
				if (~args.network.flags.indexOf('CCMP')) {
					postMsg+="CCMP</value>";
				} else {
					postMsg+="TKIP</value>";
				}
			} else if (~args.network.flags.indexOf('WPA')) {
				postMsg+="<value name = \"Suite\">WPA</value><value name = \"WPAx Key Type\">Passphrase</value><value name = \"WPAx Passphrase\">"+args.password+"</value><value name = \"WPAx Encryption\">TKIP</value>";
			} else if (~args.network.flags.indexOf('WEP')) {
				postMsg+="<value name = \"Suite\">WEP</value><value name = \"WEP Key Size\">";
				if (args.password.length == 10) {
					postMsg+="40";
				} else {
					postMsg+="104";
				}
				postMsg+="</value><value name = \"WEP TX Key Index\">1</value><value name = \"WEP Key 1 Key\">"+args.password+"</value>";
			} else {
				postMsg+="<value name = \"Suite\">None</value>";
			}
			postMsg+="</configitem></configgroup></configrecord>";
			var xmlhttp=new XMLHttpRequest();
			var fd = new FormData();
			fd.append("configrecord", postMsg);
			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							args.done({success:true})
						} else {
							args.done({success:false});
						}
					}
				}
			}

			xmlhttp.open("POST", "/import/config", true);
			xmlhttp.send(fd);
		},
		deleteWlanProfile: function(args) {
			if (typeof args === "undefined")
				return;
			var postMsg = xmlHeader+"<configgroup name = \"XML Import Control\"><configitem name = \"WLAN Profile delete\"><value name=\"name\">";
			postMsg+=escapeXML(args.profile.name)+"</value></configitem></configgroup></configrecord>";
			var xmlhttp=new XMLHttpRequest();
			var fd = new FormData();
			fd.append("configrecord", postMsg);

			if (typeof args.done !== "undefined") {
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4) {
						if (xmlhttp.status==200) {
							args.done({success:true})
						} else {
							args.done({success:false});
						}
					}
				}
			}

			xmlhttp.open("POST", "/import/config", true);
			xmlhttp.send(fd);
		}
	};

	return xpw;

}());
