import express from 'express';
import axios from 'axios';
import cors from 'cors';
import redis from 'redis';
import mongoose from 'mongoose';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect("mongodb://localhost:27017/taskE", { useNewUrlParser: true, useUnifiedTopology: true });

const photoSchema = new mongoose.Schema({
  albumId: Number,
  title: String,
  url: String,
  thumbnailUrl: String
})

const Photo = mongoose.model('photo', photoSchema);

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

app.get('/', async (req, res) => {
  const cacheResults = await redisClient.get('test');
  if (cacheResults) {
    return res.json(JSON.parse(cacheResults));
  } else {
    const data = await Photo.find();
    // const { data } = await axios.get(
        // 'http://localhost:3001/test'
    // );
    redisClient.setEx('test', 30, JSON.stringify(data));
    res.json(data);
  }
})

app.listen(3002, function() {
  console.log('Listening on port 3002');
});

export default app;
