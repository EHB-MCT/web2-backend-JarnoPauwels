const express = require('express');
var cors = require('cors')
const bodyParser = require('body-parser');
const {
    MongoClient,
    ObjectId
} = require('mongodb');

//Create the mongo client to use
const client = new MongoClient(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});

// Return all challenges from the database
app.get('/coursedata', async (req, res) => {

    try {
        //connect to the db
        await client.connect();

        //retrieve the challenges collection data
        const colli = client.db('courseproject').collection('coursedata');
        const chs = await colli.find({}).toArray();

        //Send back the data with the response
        res.status(200).send(chs);
    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});


// save data
app.post('/coursedata', async (req, res) => {

    if (!req.body.user || !req.body.score) {
        res.status(400).send('Bad request: missing name, points or course');
        return;
    }

    try {
        //connect to the db
        await client.connect();

        //retrieve the coursedata collection data
        const colli = client.db('courseproject').collection('coursedata');

        // Validation for double coursedata
        const coursedata = await colli.findOne({
            user: req.body.user,
            score: req.body.score,
            game: req.body.game,
            desc: req.body.desc,
            img: req.body.img
        });
        if (coursedata) {
            res.status(400).send('Bad request: challenge already exists with ' + 'name ' + req.body.name + 'points ' + req.body.points + 'cousre ' + req.body.course);
            return;
        }
        // Create the new challenge object
        let newData = {
            user: req.body.user,
            score: req.body.score,
            game: req.body.game,
            desc: req.body.desc,
            img: req.body.img
        }

        // Insert into the database
        let insertResult = await colli.insertOne(newData);

        //Send back successmessage
        res.status(201).json(newData);
        return;
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

app.delete('/coursedata/:id', async (req,res) => {
    //id is located in the query: req.params.id
    try{
        //connect to the db
        await client.connect();

        //retrieve the challenge collection data
        const colli = client.db('courseproject').collection('coursedata');

        //only look for a challenge with this ID
        const query = { _id: ObjectId(req.params.id) };

        const challenge = await colli.deleteOne({ _id: ObjectId(req.params.id) });

        if(challenge){
            //Send back the file
            res.status(200).send(challenge);
            return;
        }else{
            res.status(400).send('err');
        }
      
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})