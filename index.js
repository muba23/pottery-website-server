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
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        //add products
        app.post('/addProducts', async(req, res)=>{
            const product = req.body;
            const result = await potteryCollection.insertOne(product);
            res.send(result);
        });

        // reviews
        app.post('/addReviews', async(req, res)=>{
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        app.get('/reviews', async(req, res)=>{
            const result = await reviewsCollection.find({}).toArray();
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
        app.get('/myOrders', async(req, res)=>{
            const email = req.query.email;
            const query = {email : email}
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //manage orders
        app.get('/manageOrders', async(req, res)=>{
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        });

        //update status
        app.put('/updateStatus/:id', (req, res)=>{
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = {_id: ObjectId(id)};
            ordersCollection.updateOne(filter, {$set: {status: updatedStatus},
            })
            .then(result =>{
                res.send(result);
            })
        })
        
        //delete order
        app.delete('/deleteOrder/:id', async(req, res)=>{
            const result = await ordersCollection.deleteOne({_id: ObjectId(req.params.id)});
            res.send(result);
        });

        app.get('/users/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email : email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })

        //user
        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        });

        app.put('/users', async(req, res)=>{
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async(req, res)=>{
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
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