const app = require('./app.js');

const PORT = 3010;

app.listen(PORT, (res)=>{
    console.info(`⚙️ sso-server app listening on port ${PORT}`);
    console.info(`Visit: http://localhost:${PORT}`);
});