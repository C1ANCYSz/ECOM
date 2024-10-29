const mongoose = require('mongoose');   
const app = require('./app');

const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/ecom').then(() => {
    console.log('Database connected successfully');
}
).catch((err) => {
console.log(err);
});

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);
});


