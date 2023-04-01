import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import mongoose from "mongoose";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('https://listapi-id7r.onrender.com/api/todos').then(res => {
      setTodos(res.data);
    }).catch(err => {
      setError('Error fetching todos');
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://listapi-id7r.onrender.com/api/todos', {
        _id: new mongoose.Types.ObjectId().toString(),
        title: title,
        completed: false
      });
      setTodos([...todos, res.data]);
      setTitle('');
      setError('');
    } catch (error) {
      setError('Error adding todo');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
    try {
      await axios.put(`https://listapi-id7r.onrender.com/api/todos/${reorderedItem._id}`, {
        ...reorderedItem,
        order: result.destination.index
      });
      setError('');
    } catch (error) {
      setError('Error updating todo');
    }
  }

  const handleToggleComplete = async (id, completed) => {
    const newTodos = [...todos];
    const todo = newTodos.find(todo => todo._id === id);
    todo.completed = !completed;
    setTodos(newTodos);
    try {
      await axios.put(`https://listapi-id7r.onrender.com/api/todos/${id}`, {
        ...todo,
        completed: todo.completed
      });
      setError('');
    } catch (error) {
      setError('Error updating todo');
    }
  }
  return (
    <div className="app">
      <h1 className="app__title">Todo List</h1>
      <form className="app__form" onSubmit={handleSubmit}>
        <input className="app__input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a todo" />
        <button className="app__button" type="submit">Add Todo</button>
      </form>
      {error && <div className="app__error">{error}</div>}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <ul className="app__list" ref={provided.innerRef} {...provided.droppableProps}>
              {todos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided) => (
                    <li
                      className={`app__item ${todo.completed ? 'app__item--completed' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleComplete(todo._id, todo.completed)}
                      />
                      <span className={todo.completed ? 'app__text--completed' : 'app__text'}>
                        {todo.title}
                      </span>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
export default App;
