require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// connect to MongoDB
mongoose.connect(process.env.MONGOURL + "/listsDB", { useNewUrlParser: true });
const todoSchema = new mongoose.Schema({
    _id: String,
    title: { type: String, required: true },
    completed: { type: Boolean, required: true },
    order: { type: Number, required: true }
  });
  
  const Todo = mongoose.model('Todo', todoSchema);
  
  app.use(express.json());
  
  // Define the GET and POST endpoints for todos
  app.get('/api/todos', async (req, res) => {
    try {
      const todos = await Todo.find();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching todos' });
    }
  });
  
  app.post('/api/todos', async (req, res) => {
    try {
      const { title, completed } = req.body;
      const order = req.body.order || 0;
      const newTodo = new Todo({
        _id: new mongoose.Types.ObjectId(),
        title,
        completed,
        order
      });
      const savedTodo = await newTodo.save();
      res.json(savedTodo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.put('/api/todos/:id', async (req, res) => {
    try {
        console.log(req.params.id);
        // console.log(req.params._id);
      const todo = await Todo.findByIdAndUpdate(req.params.id, {
        $set: {
          title: req.body.title,
          completed: req.body.completed,
          order: req.body.order
        }
      }, { new: true });
      const str = CircularJSON.stringify(todo);
      res.json(str);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: 'Unable to update todo' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });