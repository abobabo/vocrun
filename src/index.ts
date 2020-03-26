import * as path from 'path';
import express = require('express');
import bodyParser = require('body-parser');
import cors = require('cors');
import cookieParser = require('cookie-parser');

const app = express();
const server = require('http').Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, './')));

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '../index.html'));
});

server.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});

app.use((error, request, response, next) => {
  console.log(error);
  response
    .status(error.status || 500)
    .json({ error: error.message, status: 500 });
});
