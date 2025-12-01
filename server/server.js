const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();



const app = express();
app.use(express.json());
app.use(cors());



app.get('/',(req,res)=> {
console.log('asdasdas')
res.json({msg:'recived'})
})

const repairsRouter = require('./routes/Repairs');
const hataksRouter = require('./routes/Hataks')



// routes

app.use('/api/repairs', repairsRouter);
app.use('/api/hataks', hataksRouter)

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, )
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error(err));
