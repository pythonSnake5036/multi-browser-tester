const { parseArgs } = require("node:util");
const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const webdriver = require("selenium-webdriver");
const browserSync = require("browser-sync");

const {
  values: {browser, hub, address}
} = parseArgs({
  options: {
    browser: {
      type: "string",
      multiple: true
    },
    hub: {
      type: "string"
    },
    address: {
      type: "string"
    }
  }
})

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(7007, () => {
  console.log("Listening on port 7007");
});

const drivers = (browser ?? []).map(browser => new webdriver.Builder()
  .usingServer(hub)
  .withCapabilities({browserName: browser})
  .build()
);

var bs = null;

app.put("/seturl", async (req, res) => {
  console.log(`Setting URL to: ${req.body.url}`);

  if (bs) bs.exit();

  bs = browserSync.create();
  bs.init({
    port: 3000,
    proxy: req.body.url,
    open: false,
    cors: true,
    socket: {
      domain: address
    },
    middleware: [
      function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    ],
    logLevel: "debug",
  });
  drivers.forEach(driver => driver.get(address));
});

async function exitHandler(options, exitCode) {
  await Promise.all(drivers.map(driver => driver.quit()));
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
