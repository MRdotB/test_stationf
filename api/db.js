const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/stationf');

module.exports = mongoose.connection;
