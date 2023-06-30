const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');



mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to DB Successfully");
})
// const connectDB = async () => {
    //     try {
        //         const conn = await mongoose.connect(process.env.MONGO_URI);
        //         console.log(`MongoDB Connected: ${conn.connection.host}`);
        //     } catch (error) {
            //         console.log(error);
            //         process.exit(1);
            //     }
            // }
            
            
            const userSchema = mongoose.Schema({
                username: {
                    type: String,
                    unique: true,
                }
            }, { versionKey: false })
            
            const User = mongoose.model("User", userSchema);
            
            const exerciseSchema = mongoose.Schema({
                username: String,
                description: String,
                duration: Number,
                date: Date,
                userid: String
                
            }, { versionKey: false })
            
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors())
app.use(express.urlencoded({ extended: true }))  //allows req.body 
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", async (req, res) => {
    const users = await User.find();
    res.send(users);
    
})

app.post("/api/users", async (req, res) => {
    const username = req.body.username;
    
    const founduser = await User.findOne({ username });
    if (founduser) {
        res.json(founduser);
    }
    
    const user = await User.create({
        username,
    })
    res.json(user);
})


app.get("/api/users/:_id/logs", async (req, res) => {
    let { from, to, limit } = req.query;
    const userid = req.params._id;
    
    
    const founduser = await User.findById(userid);
    if (!founduser) {
        res.json("message:User Not Found!");
    }
    
    
    let filter = { userid }
    let dateFilter = {};
    if (from) {
        dateFilter['$gte'] = new Date(from);
        
    }
    if (to) {
        dateFilter['$lte'] = new Date(to);
    }
    if (from || to) {
        filter.date = dateFilter
    }
    
    if (!limit) {
        limit = 100;
    }
    
    let exercises = await Exercise.find(filter).limit(limit);
    exercises = exercises.map((exercise) => {
        return {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
            
        }
        
    })
    
    res.json({
        username: founduser,
        count: exercises.length,
        _id: userid,
        log: exercises
    });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
    let { description, duration, date } = req.body;
    const userid = req.body[":_id"];
    
    
    
    if (!date) {
        date = new Date();
        // const utcdate = dateobj.getUTCMonth()+1 +"-"+ dateobj.getUTCDate() + "-"+ dateobj.getUTCFullYear();
        // const currdate = date == "" ? utcdate : date;
    }
    
    
    const founduser = await User.findById(userid);
    if (!founduser) {
        res.json("message:User Not Found!");
    }

    
    await Exercise.create({
        username: founduser,
        description,
        duration,
        date,
        userid,
    });
    
    
    res.send({
        username: founduser.username,
        description,
        duration,
        date: date.toDateString,
        _id: userid,
    });
})

// app.all('*', (req, res) => {
    //     res.json({ "every thing": "is awesome" })
    // })
    
    
    
const PORT = process.env.PORT || 3000;
    
const listener = app.listen(PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
// connectDB().then(() => {
    //     app.listen(PORT, () => {
        //         console.log("listening for requests");
        //     })
        // })
        