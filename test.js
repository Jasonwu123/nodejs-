'use strict'

const scanPorts = require("./scanPorts")

scanPorts('127.0.0.1', 1, 1024, (ports) => {
    console.log("open ports: ", ports)
})