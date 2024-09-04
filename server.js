const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

//Connect to Mongo
let dbName = "Web"
mongoose.connect(`mongodb link`)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

//get files from the client folder
const clientPath = path.join(__dirname, 'Client');
app.use(express.static(clientPath));

//schema and model for user
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    confirmPassword: String,
    todos: [{ text: String }]
});

const User = mongoose.model('User', UserSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/register', (req, res) => {
    res.sendFile(path.join(clientPath, 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(clientPath, 'login.html'));
});

app.get('/todos', (req,res) =>{
    res.sendFile(path.join(clientPath,'todos.html'));
});

const ConnectedStatusSchema = new mongoose.Schema({
    isConnected: { type: Boolean, default: false }
});

const ConnectedStatus = mongoose.model('ConnectedStatus', ConnectedStatusSchema);

app.post('/register', async (req, res) => {
    try {
        //check if there is any user connected
        const isConnectedUser = await ConnectedStatus.findOne({ isConnected: true });
        if (isConnectedUser) {
            return res.status(400).json({ message: 'A user is already connected. Please logout first.' });
        }
        const { username, email, password, confirmPassword } = req.body;

        //check if passwords match and length is at least 8 characters
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        //check if the user already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        //create new user
        const newUser = new User({
            username,
            email,
            password
        });

        //save new user to the database
        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        //get email and password from the request body
        const { email, password } = req.body;

        //first check if the user exists in the database
        const user = await User.findOne({ email });

        //return error msg if user not exist or password not match
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        //to prevent registeration when any user connected
        await updateConnectedStatus(true);

        const userTodos = user.todos.map(todo => todo.text);
        return res.status(200).json({ 
            message: 'Login successful', 
            email: user.email, 
            username: user.username,
            todos: userTodos
        });
    } catch (error) {
        return res.status(500).json({ message: 'Login failed. Please try again.' });
    }
});

app.post('/logout', async (req, res) => {
    try {
        //to allow registeration
        await updateConnectedStatus(false);
        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Logout failed. Please try again.' });
    }
});

//function to update the status of isConnected
async function updateConnectedStatus(isConnected) {
    const connectedStatus = await ConnectedStatus.findOne();
    if (connectedStatus) {
        connectedStatus.isConnected = isConnected;
        await connectedStatus.save();
    } else {
        await ConnectedStatus.create({ isConnected });
    }
}

const TodoSchema = new mongoose.Schema({
    email: String,
    text: String
});


app.route('/todos')

.get(async (req, res) => {
    const { email } = req.query;
    try {
        //find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ todos: user.todos });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
})
.post(async (req, res) => {
    try {
        const { email, todos } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        //replace the todos in the user db
        user.todos = todos.map(todoText => ({ text: todoText }));

        //save the updated todos
        await user.save();
        res.status(200).json({ message: 'Todos saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save todos' });
    }
});

app.get('/todos/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ todos: user.todos });
    } catch (error) {
        console.error('Error fetching todos:', error);
        return res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));