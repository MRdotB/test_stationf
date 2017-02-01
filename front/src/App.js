import React, {Component} from 'react';
import moment from 'moment';
import NumericInput from 'react-numeric-input';
import DateTime from 'react-datetime';
import Modal from 'react-modal';

import '../node_modules/react-datetime/css/react-datetime.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			start: moment(),
			duration: 1,
			end: moment().add(1, 'hours'),
			name: '',
			equipements: [],
			rooms: [],
			capacity: 1,
			modalIsOpen: false,
			current: {}
		};
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleDurationChange = this.handleDurationChange.bind(this);
		this.handleCapacityChange = this.handleCapacityChange.bind(this);
		this.handleCheck = this.handleCheck.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.handleBookRoom = this.handleBookRoom.bind(this);
	}
	componentDidMount() {
		fetch('/equipements', {
			method: 'GET',
			headers: {'Content-Type': 'application/json'}
		})
			.then(res => res.json())
			.then(res => {
				const equipements = res.map(equipement => {
					return {
						name: equipement,
						checked: false
					};
				});
				this.setState({equipements}, this.fetchRooms);
			})
			.catch(err => console.log(err));
	}
	fetchRooms() {
		const {name, capacity} = this.state;
		const equipements = this.state.equipements.reduce((acc, equip) => {
			if (equip.checked) {
				acc.push(equip.name);
			}
			return acc;
		}, []).join(',');
		const start = this.state.start._d;
		const end = this.state.end._d;
		const body = JSON.stringify({
			start, end, name, equipements, capacity
		});
		fetch('/rooms', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body
		})
			.then(res => res.json())
			.then(res => this.setState({rooms: res}))
			.catch(err => console.log(err));
	}
	handleBookRoom(e) {
		e.preventDefault();
		const start = this.state.start._d;
		const end = this.state.end._d;
		const roomId = this.state.current.id;
		const name = 'default';
		const body = JSON.stringify({
			name, start, end, roomId
		});
		fetch('/reservation', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body
		})
			.then(res => res.json())
			.then(() => {
				this.closeModal();
				this.fetchRooms();
			})
			.catch(err => console.log(err));
	}
	updateEnd() {
		const end = this.state.start.clone().add(this.state.duration, 'hours');
		this.setState({end}, this.fetchRooms());
	}
	handleDateChange(date) {
		this.setState({start: date}, this.updateEnd);
	}
	handleDurationChange(e) {
		this.setState({duration: e}, this.updateEnd);
	}
	handleCapacityChange(e) {
		this.setState({capacity: e}, this.fetchRooms());
	}
	handleCheck(e) {
		const equipements = this.state.equipements.map(equipement => {
			if (equipement.name === e.target.name) {
				equipement.checked = !equipement.checked;
			}
			return equipement;
		});
		this.setState({equipements}, this.fetchRooms());
	}
	openModal(name, id) {
		this.setState({current: {name, id}}, () => {
			this.setState({modalIsOpen: true});
		});
	}
	closeModal() {
		this.setState({modalIsOpen: false});
	}
	render() {
		const styles = {
			modal: {content: {
				top: '50%',
				left: '50%',
				right: 'auto',
				bottom: 'auto',
				marginRight: '-50%',
				transform: 'translate(-50%, -50%)'
			}},
			header: {
				padding: '10px 0',
				backgroundColor: '#000',
				color: '#fff',
				textAlign: 'center'
			},
			search: {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				height: '20vh',
				minHeight: '250px',
				backgroundColor: 'lightgrey'
			},
			labelBox: {
				display: 'flex',
				flexDirection: 'column',
				margin: '0 10px'
			},
			equipements: {
				display: 'flex',
				flexDirection: 'row'
			},
			container: {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'center',
				alignItems: 'center',
				margin: '20px'
			},
			room: {
				border: '1px solid #ddd',
				borderRadius: '4px',
				padding: '4px',
				margin: '4px',
				width: '200px',
				height: '200px',
				cursor: 'pointer'
			}
		};
		const from = this.state.start.format('MMMM Do YYYY, h:mm:ss a');
		const to = this.state.end.format('MMMM Do YYYY, h:mm:ss a');
		return (
		<div>
			<Modal
				isOpen={this.state.modalIsOpen}
				onRequestClose={this.closeModal}
				style={styles.modal}
				contentLabel="Example Modal">
				<form>
					<p>{this.state.current.name}</p>
					<p>from: {from}</p>
					<p>to: {to}</p>
					<button onClick={this.handleBookRoom}>Book this room</button>
				</form>
			</Modal>

			<div style={styles.header}>
				<h1>Reservation</h1>
			</div>
			<div style={styles.search}>
				<div>
					<label>Date(from):</label>
					<DateTime value={this.state.start} onChange={this.handleDateChange}/>
				</div>
				<div style={styles.labelBox}>
					<label>Duration(hours):</label>
					<NumericInput min={1} max={10} value={this.state.duration} onChange={this.handleDurationChange}/>
				</div>
				<div style={styles.labelBox}>
					<label>Capacity:</label>
					<NumericInput min={1} value={this.state.capacity} onChange={this.handleCapacityChange}/>
				</div>
				<div>
					<label>Equipements:</label>
					<div style={styles.equipements}>
						{this.state.equipements.length > 0 && this.state.equipements.map((equipement, i) => (
							<div key={i}>
								<input onChange={this.handleCheck} name={equipement.name} value={equipement.checked} type="checkbox"/><label>{equipement.name}</label>
							</div>
						))}
					</div>
				</div>
			</div>
			<div style={styles.container}>
				{this.state.rooms.length > 0 ? this.state.rooms.map(room => (
					<div onClick={() => this.openModal(room.name, room._id)} style={styles.room} key={room._id}>
						<h3>{room.name}</h3>
						<p>{room.description}</p>
						<p>capacity: <b>{room.capacity}</b></p>
						<ul>
							{room.equipements.map(e => <li key={e._id}>{e.name}</li>)}
						</ul>
					</div>
				)) : <p>No rooms fit your search</p>}
			</div>
		</div>
		);
	}
}

export default App;
