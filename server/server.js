const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path')


const app = express();
app.use(express.json());
app.use(cors());



// app.get('/',(req,res)=> {
// console.log('asdasdas')
// res.json({msg:'recived'}) 
// })


app.use(express.static(path.join(__dirname, 'public')));

const repairsRouter = require('./routes/Repairs');

const zadikRouter = require('./routes/ZadikList')

// routes

app.use('/api/repairs', repairsRouter);
// app.use('/api/zadik',)

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI,)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error(err));
