const express = require('express')
const cors=require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port =process.env.PORT || 5000


// middle
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://library-system-project-6ab71.web.app",
      "https://library-system-project-6ab71.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.uqcmivv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    const bookCollection = client.db("addBookDB").collection("books");
       
   

   
   app.get('/allBooks/:email',async(req,res)=>{
    const cursor =  await bookCollection.find().toArray();
    console.log(cursor)
    res.send(cursor)
   })

  app.get('/updateID/:id',async(req,res)=>{
    const Id=req.params.id
    const query = { _id: new ObjectId(Id) };
    const result = await bookCollection.findOne(query);
    console.log(result)
    res.send(result)
  })

   app.post('/books',async(req,res)=>{
    const books=req.body;
    const result = await  bookCollection.insertOne(books);
    console.log(result)
    res.send(result)
   })
   
   app.put('/update/:id',async(req,res)=>{
    const Id=req.params.id
    const user=req.body
    console.log(user)
    const filter = { _id: new ObjectId(Id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
          bookName:user.bookName,
          image:user.image,
          category:user.category,
          authorName:user.authorName,
          rating:user.rating,
      },
    };
    const result = await bookCollection.updateOne(filter, updateDoc, options);
    console.log(result)
    res.send(result)
   })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/',async(req,res)=>{
    res.send('This is library')
})
app.listen(port,() => {
    console.log(`this is  form ${port}`)
})