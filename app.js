import express from 'express';
import router from './api.js';
import fileUpload from 'express-fileupload';

const app = express();
const port = 3000;

app.use(express.json());
app.use(fileUpload());
app.use('/api',router)

app.listen(port,() => {
    console.log(`App started on port ${port}`);
})