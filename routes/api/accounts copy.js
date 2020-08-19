let mongoose = require("mongoose");
let router = require("express").Router();
let Account = mongoose.model("Account");
let auth = require("../auth");

function createAccount(destination, amount) {
  let account = new Account({balance:amount,id:destination});
  account.save();
  return account;
}

function deductAmount(account, amount) {
  account.balance = parseInt(account.balance) - parseInt(amount);
  account.save();
  return account;
}

function addAmount(account, amount) {
  account.balance = parseInt(account.balance) + parseInt(amount);
  account.save();
  return account;
}

router.get("/balance", auth.optional, (req, res, next) => {
  if (req.query.account_id) {
    Account.findOne({ id: req.query.account_id })
      .then((account) => {
        if (account) {
          res.status("200").send(account.balance);
        } else {
          res.status("404").send("0");
        }
      })
      .catch(next);
  }
});

router.post("/reset", (req, res, next) => {
  console.log("reset");
  Account.remove({}, (err, result) => {
    if (err) {
      return res.send(err);
    } else {
      return res.status(200).send("OK");
    }
  });
});

router.post("/event", (req, res, next) => {
  console.log(req.body);
  let type = req.body.type;
  let origin = req.body.origin ? req.body.origin : null;
  let amount = req.body.amount ? req.body.amount : null;
  let destination = req.body.destination ? req.body.destination : null;

  console.log(type);

  switch (type) {
    case "deposit":
      console.log(destination, amount);
      setTimeout(() => {
      Account.findOne({ id: destination }).then(async (account) => {
        if (account) {
          account = addAmount(account, amount);
          return res.status("201").json({
            destination: { id: account.id, balance: account.balance },
          });
        } else {
          account = await createAccount(destination,amount)
          return res.status("201").json({
            destination: { id: account.id, balance: account.balance },
          });
        }

      })
    }, 1000);
      break;
    case "withdraw":
      console.log(origin, amount);
      Account.findOne({ id: origin }).then((account) => {
        if (account) {
          account = deductAmount(account, amount);
          return res
            .status("201")
            .json({ origin: { id: account.id, balance: account.balance } });
        } else {
          res.status("404").send("0");
        }
      });

      break;
    case "transfer":
      console.log(origin, amount);
      Account.findOne({ id: origin }).then((account1) => {
        if (account1) {
          Account.findOne({ id: destination }).then((account2) => {
            if (account2) {
              account1 = deductAmount(account1, amount);
              account2 = addAmount(account2, amount);
            } else {
              account1 = deductAmount(account1, amount);
              account2 = createAccount(destination, amount);
            }
            return res.status("201").json({
              origin: { id: account1.id, balance: account1.balance },
              destination: { id: account2.id, balance: account2.balance },
            });
          });
        } else {
          return res.status("404").send("0");
        }
      });

      break;
  }
});
module.exports = router;
