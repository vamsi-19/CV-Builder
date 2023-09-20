import express from "express";
import router from "./api.js";
import cors from "cors";
import ip from "ip";
import fileUpload from "express-fileupload";

const app = express();
const port = 3000;
app.use(express.json());
app.use(fileUpload({limits:{fileSize:5000000},abortOnLimit:true}));
app.use('/api',router);
app.set('trust-proxy',true)

app.listen(port,()=>{
    app.use(cors({
        origin:[`http://localhost:${port}`,`http://${ip.address()}:${port}`],
        methods: ['GET','POST']
      }))
});

