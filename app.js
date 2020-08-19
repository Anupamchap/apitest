let http = require("http"),
  express = require("express"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  errorhandler = require("errorhandler"),
  mongoose = require("mongoose");

let isProduction = process.env.NODE_ENV === "production";

// Create global app object
let app = express();

app.use(cors());

// Normal express config defaults
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(__dirname + "/public"));

if (!isProduction) {
  app.use(errorhandler());
}

if (isProduction) {
  mongoose.connect("mongodb+srv://MongoAdmin:DevMongo700@ezejobs.5qr7e.mongodb.net/Apitest?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} else {
  mongoose
    .connect(
      "mongodb+srv://MongoAdmin:DevMongo700@ezejobs.5qr7e.mongodb.net/Apitest?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
    )
    .catch((err) => {
      console.error(err.stack);
      process.exit(1);
    });
  mongoose.set("debug", true);
}

require("./models/Account");

app.use(require("./routes"));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

let server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + server.address().port);
});
