const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers
  const customer = users.find(customer => customer.username === username)

  if(!customer){
    return res.status(404).json({error: "Customer not found"})
  }

  req.customer = customer
  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userExists = users.find(user => user.username === username);

  if(userExists){
    return res.status(400).json({error: 'User already exists'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)

  return res.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { customer } = req

  return res.status(200).json(customer.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body
  const { customer } = req

  const todo ={
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  customer.todos.push(todo)

  return res.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { customer } = req
  const {title, deadline} = req.body
  const {id} = req.params


  const user = customer.todos.find(todo => todo.id === id)

  if(!user){
    return res.status(404).json({error: 'Todo not found'})
  }
  user.title = title
  user.deadline = new Date(deadline)
  return res.json(user)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { customer } = req
  const { id } = req.params

  const todo = customer.todos.find(todo => todo.id === id)

  if(!todo){
    return res.status(404).json({error: "Todo not exist"})
  }

  todo.done = true

  return res.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { customer } = req
  const { id } = req.params

  const todoIndex = customer.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1){
    return res.status(404).json({error: 'Todo not found'})
  }

  customer.todos.splice(todoIndex, 1)

  return res.status(204).json()
});

module.exports = app;