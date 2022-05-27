const mongoose = require('mongoose');
const mongo_url = `mongodb://${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB}?maxPoolSize=${process.env.MONGO_POOL_SIZE}`;

//Making MongoDB Connection using mongoose
exports.connect = () => {
    mongoose
        .connect(mongo_url)
        .then(() => {
            console.log('Successfully connected to mongo database');
        })
        .catch((error) => {
            console.log('Mongo connection failed. exiting now...');
            console.error(error);
            process.exit(1);
        });
};
