# xPico Wi-Fi WebAPI Javascript library

## Summary
A Javascript library that makes it easy to use the xPico Wi-Fi's WebAPI to access the hardware features of the xPico Wi-Fi.
For example, you can send and receive data from the serial ports, update configuration, and toggle GPIOs (future) with simple
calls. The library takes care of all the HTTP transactions and XML building and parsing for you.

Please note, this library uses a new feature, Web to Serial, which is in Alpha on versions 1.4 of the xPico Wi-Fi. Please see the Lantronix wiki for more details: http://wiki.lantronix.com/developer/XPicoWiFi/WebAPItoDevice

## Samples
### serial.html 
This file shows how to send data to the serial port by clicking on a color. It also reads data from the serial port and displays it on
the webpage. It has a sample of reading the configuration of the serial port and also setting the configuration of the serial port.

## How-To

Download the `xpwLib.js` file (or the minified version to save filesystem space). Add it to the header of your HTML file like this:

```
<script src="xpwLib.js"></script>
```

This will load the `xpw` object which contains a number of functions to access the xPico Wi-Fi WebAPI.

## Available functions

### Send data to the serial port

```
xpw.serialTransmit({
		line: "1",		// could also be "2", if ommitted or some other value, defaults to "1"
		message: "This will go out to the serial port\r\n",			// required
		callback: function(data) {
				// Do something, data is an object with a boolean called success:
				// {success: true}
			}
		});
```

### Receive data from the serial port

```
xpw.serialReceive({
		line: "1",		// could also be "2", if ommitted or some other value, defaults to "1"
		done: function(data) {			// optional
				// Do something, data is an object with the following:
				// { success: true|false, message:The data that came from the serial port}
			}
	});
```

### Get serial port configuration

```
xpw.getLineConfig({
		line: "1",		// could also be "2", if ommitted or some other value, defaults to "1"
		done: function(data) {				// optional 
				// Do something, data is an object with the following:
				// { success: true|false, 
				//   lineConfig: 			//    Another object with the serial port data, for example:
				//  { 
				//		Baud Rate: "115200 bits per second",
				//		Data Bits: "8",
				//		Flow Control: "None",
				//		Gap Timer: "<Four Character Periods>",
				//		Parity: "None",
				//		Protocol: "None",
				//		State: "Enabled",
				//		Stop Bits: "1",
				//		Threshold: "56 bytes"
				//	}
				// }
			}
	});
```

### Set serial port configuration

```
xpw.setLineConfig({
		line: "1", 		// Must be "1" or "2"
		items: {		// Required object with the properties that need to change, for example:
					{ Protocol: "None",
					  Baud Rate: "9600 bits per second"}	// Available items are the same as returned by the getLineConfig
				},
		done: function(data) {			// optional
				// Do something, data is an object with the following:
				// { success: true|false, message:The data that came from the serial port}
			}		
})
```