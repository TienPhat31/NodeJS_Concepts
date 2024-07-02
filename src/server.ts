import app from './app';
import connectDB from './config/Mongo.database';
require('dotenv').config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
