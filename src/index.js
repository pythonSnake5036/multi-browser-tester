const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const webdriver = require("selenium-webdriver");
const browserSync = require("browser-sync");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(7007, () => {
  console.log("Listening on port 7007");
});

const bsAddress = process.argv[2];

console.log(bsAddress);

const driver = new webdriver.Builder()
  .usingServer("http://localhost:4444/")
  .withCapabilities({'browserName': 'chrome'})
  .build();

var bs = null;

app.put("/seturl", async (req, res) => {
  console.log(`Setting URL to: ${req.body.url}`);

  if (bs) bs.exit();

  bs = browserSync.create();
  bs.init({
    proxy: req.body.url,
    open: false,
    cors: true,
    socket: {
      domain: `${bsAddress}/browser-sync`
    }
  });
  await driver.get(`${bsAddress}`);
});

async function exitHandler(options, exitCode) {
  await driver.quit();
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
