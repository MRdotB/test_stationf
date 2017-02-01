const express = require('express');
const bp = require('body-parser');
const errHandler = require('./middleware/errHandler');
const {Room, Reservation} = require('./Models');

require('./db');

const app = express();

app
	.use(bp.json())
	.use(errHandler())
	.use(express.static('build'));

app.get('/equipements', (req, res) => {
	Room.collection.distinct('equipements.name', (err, equipements) => {
		if (err) {
			req.errHandler(err, res);
		} else {
			res.json(equipements);
		}
	});
});

function available(reservations, start, end) {
	const s = new Date(start).getTime();
	const e = new Date(end).getTime();
	for (let i = 0; i < reservations.length; i++) {
		const start = reservations[i].start.getTime();
		const end = reservations[i].end.getTime();
		if ((s >= start && s <= end) || (e >= start && e <= end)) {
			return false;
		}
	}
	return true;
}

// should be GET VERB
app.post('/rooms', (req, res) => {
	const {capacity, equipements, start, end} = req.body;
	const search = {capacity: {$gt: capacity}};
	if (equipements.length > 0) {
		search['equipements.name'] = {$all: equipements.split(',')};
	}

	Room
		.find(search)
		.populate('reservations')
		.exec((err, rooms) => {
			if (err) {
				req.errHandler(err, res);
			} else {
				const filteredRooms = rooms.filter(room => {
					let isAvailable = false;
					if (room.reservations.length > 0) {
						isAvailable = available(room.reservations, start, end);
					}
					return (room.reservations.length === 0 || isAvailable);
				}).map(room => {
					room.reservation = null;
					return room;
				});
				res.json(filteredRooms);
			}
		});
});

app.post('/reservation', (req, res) => {
	const {name, roomId, start, end} = req.body;
	const reservation = new Reservation({_room: roomId, name, start, end});

	reservation.save(null);
	Room.update({_id: roomId}, {$push: {reservations: reservation._id}}, (err, resa) => {
		if (err) {
			req.errHandler(err, res);
		} else {
			res.status(201).json({created: true, reservation: resa});
		}
	});
});

app.listen(4242);
