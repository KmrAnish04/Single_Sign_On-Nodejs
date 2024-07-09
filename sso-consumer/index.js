const app = require('./app.js');

const PORT = 3020;

app.listen(PORT, (res)=>{
    console.info(`⚙️ sso-consumer listening on ${PORT} ✅`);
    console.log(`visit: http://localhost/${PORT}`);
});