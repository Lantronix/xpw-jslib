## Summary
A Javascript library that makes it easy to use the xPico Wi-Fi's WebAPI to access the hardware features of the xPico Wi-Fi.
For example, you can send and receive data from the serial ports, update configuration, and toggle GPIOs (future) with simple
calls. The library takes care of all the HTTP transactions and XML building and parsing for you.

## Samples
### serial.html 
This file shows how to send data to the serial port by clicking on a color. It also reads data from the serial port and displays it on
the webpage. It has a sample of reading the configuration of the serial port and also setting the configuration of the serial port.

## How-To

Download the `xpwLib.js` file (or the minified version to save filesystem space). Add it to the header of your HTML file like this:
```<script src="xpwLib.js"></script>```

This will load the `xpw` object which contains a number of functions to access the xPico Wi-Fi WebAPI.

## Available functions
