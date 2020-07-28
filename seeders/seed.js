var mongoose = require('mongoose');
var transaction = require('../models/transaction');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/budget', {
  useNewUrlParser: true,
});

const seed = [
  {
    name: 'birthday',
    value: 20,
    date: new Date(Date.now()),
  },
  {
    name: 'tacos',
    value: -50,
    date: new Date(Date.now()),
  },
  {
    name: 'initial deposit',
    value: 100,
    date: new Date(Date.now()),
  },
];

transaction
  .deleteMany({})
  .then(() => transaction.collection.insertMany(seed))
  .then(data => {
    console.log(data.result.n + ' records inserted!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
