[Home](../README.md)

# Robo Web Editor 

This project is a web-based Blockly editor used to control and program hobby robots.
Currently this targets the open source [OttoDiy robot](https://www.ottodiy.com/).

[![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

## Editor Application Developer guide

The code editor is an angular web application with all the logic running from the browser, no server.

To build the application first restore the dependencies by running the below from the repo root.

```bash
npm install
```

And then run the angular development server using:
```bash
npm run start
```

The application should then be served from [http://localhost:3000/](http://localhost:3000/).

The firmware for compatible robots (Bluetooth communication layer and per-robot variants) now lives in a separate repository.

## Todo list

- editor, handle disconnects, maybe show toast on connect/disconnect