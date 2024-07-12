import app from './app';
import connectDB from './config/Mongo.database';
import { PORT } from './config/const';

connectDB();

export = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
