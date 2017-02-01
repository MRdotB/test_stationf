const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
	name: String,
	description: String,
	capacity: Number,
	equipements: [{name: String}],
	reservations: [{type: Schema.Types.ObjectId, ref: 'Reservation'}]
});

const reservationSchema = new Schema({
	_room: {type: Schema.Types.ObjectId, ref: 'Room'},
	name: String,
	start: Date,
	end: Date
});

const Room = mongoose.model('Room', roomSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = {Room, Reservation};
