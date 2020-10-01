const express = require('express');
const cors = require('cors');
const groupRouter = require('./routers/groupRouter');

const app = express();

app.use(express.json());
app.use(cors());

app.use(groupRouter);

module.exports = app;
