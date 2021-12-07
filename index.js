const express = require('express');
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

    if (!req.body.name || !req.body.points || !req.body.course) {
        res.status(400).send('Bad request: missing name, points or course');
        return;
    }

    try {
        //connect to the db
        await client.connect();

        //retrieve the challenge collection data
        const colli = client.db('courseproject').collection('coursedata');

        // Validation for double challenges
        const challenge = await colli.findOne({
            name: req.body.name,
            points: req.body.points,
            course: req.body.course
        });
        if (challenge) {
            res.status(400).send('Bad request: challenge already exists with ' + 'name ' + req.body.name + 'points ' + req.body.points + 'cousre ' + req.body.course);
            return;
        }
        // Create the new challenge object
        let newData = {
            user: req.body.name,
            score: req.body.score,
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

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})