'use strict';
const express = require('express');
const DbHelper = require('./src/DbHelper')

// init express
const app = new express();
const port = 3001;

app.use(express.json());

//GET /api/test
app.get('/api/hello', (req,res)=>{
  let message = {
    message: 'Hello World!'
  }
  let dbHelper = new DbHelper("./code/server/devDB");
  // dbHelper.dropTables();
  dbHelper.createTables();
  return res.status(200).json(message);
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;