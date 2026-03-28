import Mongoose from 'mongoose';

const { CONNECTION } = process.env;
Mongoose.Promise = global.Promise;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
export default async () => {
  return Mongoose.connect(`${CONNECTION}`, options);
};
