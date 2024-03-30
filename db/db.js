const mongoose = require('mongoose');

// MongoDB connection URL
const mongoURI = 'mongodb+srv://JasonS:Jason123_@cluster0.0jtdhi6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connection options
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

// Establish the connection
mongoose.connect(mongoURI, options)
	.then(() => {
		console.log('Connected to MongoDB');
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error.message);

		// Handle specific error conditions
		if (error.name === 'MongoNetworkError') {
			console.error('Network error occurred. Check your MongoDB server.');
		} else if (error.name === 'MongooseServerSelectionError') {
			console.error('Server selection error. Ensure'
				+ ' MongoDB is running and accessible.');
		} else {
			// Handle other types of errors
			console.error('An unexpected error occurred:', error);
		}
	});

// Handling connection events
const db = mongoose.connection;

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 }
  });
  
module.exports = mongoose.model('User', userSchema);

