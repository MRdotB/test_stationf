const debugF = (err, res) => {
	const reset = '\x1b[0m';
	const red = '\x1b[31m';
	if (process.env.NODE_ENV === 'development') {
		console.log(red, 'Debug: 💀', err, reset);
		res.status(500).json({err: err});
	} else {
		res.status(500).json({err: 'An unexpected error has occurred'});
	}
};

const errHandler = () => {
	return (req, res, next) => {
		if (!req.debug) {
			req.errHandler = debugF;
		}
		next();
	};
};

module.exports = errHandler;
