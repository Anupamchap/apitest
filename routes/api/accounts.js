let mongoose = require("mongoose");
let router = require("express").Router();
let Account = mongoose.model("Account");
let auth = require("../auth");

router.get("/balance", auth.optional, (req, res, next) => {
  if (req.query.account_id) {
    Account.findOne({ id: req.query.account_id })
      .then((account) => {
        if (account) {
          res.status("200").send(account.balance.toString());
        } else {
          res.status("404").send("0");
        }
      })
      .catch(next);
  }
});

router.post("/reset", (req, res, next) => {
  Account.remove({}, (err, result) => {
    if (err) {
      return res.send(err);
    } else {
      return res.status(200).send("OK");
    }
  });
});

router.post("/event", (req, res, next) => {
  let type = req.body.type;
  let origin = req.body.origin ? req.body.origin : null;
  let amount = req.body.amount ? req.body.amount : null;
  let destination = req.body.destination ? req.body.destination : null;

  switch (type) {
    case "deposit":
      Account.findOneAndUpdate(
        { id: destination },
        {
          $inc: {
            balance: amount,
          },
        },
        { upsert: true, new: true }
      ).then((account) => {
        return res.status("201").json({
          destination: { id: account.id, balance: account.balance },
        });
      });
      break;
    case "withdraw":
      Account.findOneAndUpdate(
        { id: origin },
        {
          $inc: {
            balance: -amount,
          },
        },
        { new: true }
      ).then((account) => {
        if (account) {
          return res.status("201").json({
            origin: { id: account.id, balance: account.balance },
          });
        } else {
          res.status("404").send("0");
        }
      });
      break;
    case "transfer":
      Account.findOneAndUpdate(
        { id: origin },
        {
          $inc: {
            balance: -amount,
          },
        },
        { new: true }
      ).then((account1) => {
        if (account1) {
          Account.findOneAndUpdate(
            { id: destination },
            {
              $inc: {
                balance: amount,
              },
            },
            { upsert: true, new: true }
          ).then((account2) => {
            return res.status("201").json({
              origin: { id: account1.id, balance: account1.balance },
              destination: { id: account2.id, balance: account2.balance },
            });
          });
        } else {
          res.status("404").send("0");
        }
      });    
      break;
  }
});
module.exports = router;
