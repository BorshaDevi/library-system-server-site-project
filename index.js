const express = require('express')
const cors=require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port =process.env.PORT || 5000

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://library-system-project-6ab71.web.app",
    "https://library-system-project-6ab71.firebaseapp.com",
  ],
  credentials: true,
}


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  
};
// middle
app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser());



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
    const categoryCollection = client.db("addBookDB").collection("bookCategories");
    const borrowCollection = client.db("addBookDB").collection("borrow");

    
   const verify=(req,res,next)=>{
    const token=req.cookies?.token
     if(!token){
      return res.send('token not ok')
     }
   }

    app.get('/borrowedBook/:email',async(req,res)=>{
      const email=req.params.email
      const query={userEmail:email}
      const result = await borrowCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/details/:id',async(req,res)=>{
      const Id=req.params.id
      const query = { _id: new ObjectId(Id) };
      const result = await bookCollection.findOne(query);
      
      res.send(result)
    })
       
   app.get('/categoryName/:category',async(req,res)=>{
      const catebook=req.params.category
      const query = {category : catebook };
      const result= await bookCollection.find(query).toArray();
      
      res.send(result)
   })

   app.get('/category',async(req,res)=>{
        const result=await categoryCollection.find().toArray()
       
        res.send(result)
   })
   app.get('/allBooks',async(req,res)=>{
    const cursor =  await bookCollection.find().toArray();
    
    res.send(cursor)
   })

  app.get('/updateID/:id',async(req,res)=>{
    const Id=req.params.id
    const query = { _id: new ObjectId(Id) };
    const result = await bookCollection.findOne(query);
    
    res.send(result)
  })

   app.post('/books',async(req,res)=>{
    const books=req.body;
    const result = await  bookCollection.insertOne(books);
   
    res.send(result)
   })
   app.post('/borrow',async(req,res)=>{
        const borrow=req.body
        const query={
          email:borrow.email,
          bookNumber:borrow.bookNumber
        }
        const borrowAlready=await borrowCollection.findOne(query)
        // console.log(borrowAlready)
        if(borrowAlready){
          return res.send('already borrow a book')
        }
        const result=await borrowCollection.insertOne(borrow)
        const updateBookNumber=await bookCollection.updateOne({bookName :(borrow.bookName)},{$inc:{bookNumber:-1}})
        // console.log(updateBookNumber)
        res.send(result)

   })
   
   
   app.put('/update/:id',async(req,res)=>{
    const Id=req.params.id
    const user=req.body
    
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
    
    res.send(result)
   })
   
   app.post('/token',async(req,res)=>{
       const user=req.body
      //  console.log(user)
       const token=jwt.sign(user, process.env.DB_Token, { expiresIn: '1h' });
      
      
      //  console.log(token)
       res.cookie('token',token,cookieOptions).send('success')
   })
    app.post('/logout',async(req,res)=>{
      const user=req.body
      // console.log(user)
      res.clearCookie('token',{...cookieOptions,maxAge:0}).send('logout')

    })

    app.delete('/delete/:bookName',async(req,res)=>{
      const bookName=req.params.bookName
      const query={bookName:bookName}
      const findData=await borrowCollection.findOne(query)
      if(!findData){
        return res.send('Book is not found')
      }
      const updateBookNumber=await bookCollection.updateOne({bookName:(query.bookName)},{$inc:{bookNumber:1}} )
      const result = await borrowCollection.deleteOne(query);
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