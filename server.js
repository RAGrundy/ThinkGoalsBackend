const Express = require("express");
const BodyParser = require("body-parser");
const MilestoneCalculator = require('./milestonecalculator');

const MongoClient = require("mongodb").MongoClient;

const CONNECTION_URL = "mongodb+srv://<User>:<Password>@cluster0.okyqr.mongodb.net/<Database>?retryWrites=true&w=majority";
const DATBASE_NAME = "ThinkGoals";

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var database, collection;

app.listen(5000, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db(DATBASE_NAME);
        console.log("Connected to '" + DATBASE_NAME + "' !");
    });
});

app.get("", (request, response) => {
    response.send("Welcome to the root of the ThinkGoals API");
});

app.get("/cardbalance", async (request, response) => {
    let cif = request.query.cifkey;

    if (typeof cif !== 'undefined' && cif) {
        collection = database.collection("CardBalance");
        const [cardBalanceSchedule] = await Promise.all([
            collection.find({ CifKey: cif }).toArray()
        ]);
        collection = database.collection("SavingGoals");
        const [savingsGoal] = await Promise.all([
            collection.find({ CifKey: cif }).toArray()
        ])
        if (cardBalanceSchedule && savingsGoal) {
            if (savingsGoal.length > 0) {
                MilestoneCalculator.CalculateMilestones(cardBalanceSchedule, savingsGoal);
            }
            response.send(JSON.stringify(cardBalanceSchedule));
        }
    }
    else {
        return response.status(400).send("cif not provided");
    }
});

app.get("/savinggoals", (request, response) => {
    let cif = request.query.cifkey;

    if (typeof cif !== 'undefined' && cif) {
        collection = database.collection("SavingGoals");
        collection.find({ CifKey: cif }).toArray((error, result) => {
            if (error) {
                return response.status(500).send(error);
            }
            response.send(result);
        });
    }
    else {
        return response.status(400).send("cif not provided");
    }
});

app.post("/savinggoals", (request, response) => {
    collection = database.collection("SavingGoals");
    collection.updateOne({ CifKey: request.body.CifKey }, {
        $set:
        {
            CifKey: request.body.CifKey,
            StartDate: request.body.StartDate.$date,
            StartAmount: request.body.StartAmount,
            EndAmount: request.body.EndAmount,
            EndDate: request.body.EndDate.$date,
            SavingsName: request.body.SavingsName
        }
    }, { upsert: true }, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});