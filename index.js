const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9yewv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('pottery_service');
        const potteryCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        //add products
        app.post('/addProducts', async(req, res)=>{
            const product = req.body;
            const result = await potteryCollection.insertOne(product);
            res.send(result);
        });

        //get products
        app.get('/products', async(req, res) =>{
            const result = await potteryCollection.find({}).toArray();
            res.send(result);
        });

        //get Single product
        app.get('/singleProduct/:id', async(req, res)=>{
            const result = await potteryCollection.find({_id:ObjectId(req.params.id)}).toArray();
            res.send(result[0]);
        });

        //place order
        app.post('/placeOrder', async(req, res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            console.log(result);
            res.json(result);
        });

        //my orders
        app.get('/myOrders/:email', async(req, res)=>{
            const result = await ordersCollection.find({email: req.params.email}).toArray();
            res.send(result);
        })
    }
    finally{
        // await client.close()
    }
}

run().catch(console.dir);

app.use(cors());
app.get('/', (req, res) => {
  res.send('Pottery Service Server')
})

app.listen(port, () => {
  console.log(`Listening ${port}`)
})