const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const browserSync = require("browser-sync");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(7007, () => {
  console.log("Listening on port 7007");
});

var bs = null;

app.put("/seturl", (req, res) => {
  console.log(`Setting URL to: ${req.body.url}`);

  if (bs) bs.exit();

  bs = browserSync.create();
  bs.init({
    proxy: req.body.url,
    open: false
  })
});
