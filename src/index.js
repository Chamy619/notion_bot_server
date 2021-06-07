const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const {connect} = require('./database/database.js');
connect();

const userRouter = require('./router/userRouter.js');
app.use('/api/user', userRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));