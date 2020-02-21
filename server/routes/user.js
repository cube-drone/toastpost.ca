

module.exports = ({app, UserModel}) => {

    app.get('/authenticated', async(req, res)=>{

    });

    app.get('/user', async(req, res) => {
        try{
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({}));
        } catch (err){
            console.error(err);
            res.send(err);
        }
    });

};