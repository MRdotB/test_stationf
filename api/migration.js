const db = require('./db');
const {Room, Reservation} = require('./Models');
const data = require('./rooms.json');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	Room.insertMany(data.rooms)
		.then(rooms => {
			const roomId = rooms[0]._id;
			const firstR = new Reservation({name: 'lol', _room: roomId, start: new Date(), end: new Date()});
			firstR.save(err => {
				if (err) {
					console.log(err);
				}
			});
			Room.update({_id: roomId}, {$push: {reservations: firstR._id}}, (err, model) => {
				if (err) {
					console.log(err);
				}
				console.log(model);
			});
			process.exit();
		})
		.catch(err => console.log(err));
});
