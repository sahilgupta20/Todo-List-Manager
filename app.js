const express = require("express")
var cors = require('cors');
const { db, Todos, notes } = require("./db")
const route = express();



route.use(express.urlencoded({extended: true}))
route.use(express.json())

route.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

route.use(express.static(__dirname + "/public_static"))
//route.use("/todos", todoRoute)
//route.set("port", (process.env.PORT || 3999))
const port = process.env.PORT || 3999



route.get("/todo", (req,res)=>{
    Todos.findAll({
        attributes : ['id', 'title', 'description', 'status', 'priority', 'due']
    }).then((todos) => res.send(todos)).catch((err)=> "data cannot be fetched");

    
})

route.get("/todo/:id", (req,res)=>{
    if(isNaN(Number(req.params.id))) {
        return res.status(404).send({
            error : "id must be an integer"
        })    
    }

const todo =  Todos.findbyId(req.params.id)

if(!todo){
    return res.status(404).send({
        error : "No Todo found with id = " + req.params.id,
    })
}
});

route.get("/todo/:id/notes", (req,res) =>{
    id = req.params.id;
    notes.findAll({
        attributes:["note"],
       where : {
           Todoid : id
       }
    }).then((data) => res.send(data)).catch((err)= "Data at " + id + "cannot be fetched.")
})




// route.post("/todo", (req,res)=>{
//  if(typeof req.body.title !== "string"){

//      return res.status(400).send({
//          error: "Title name not provided"
//      })
//  }
//  if (typeof req.body.description!== "string") {

//      return res.status(400).send({
//          error: "Description not provided"
//      })
//  }

//   if (typeof req.body.dueDate !== "Date") {
//       return res.status(400).send({
//           error: "Date not provided"
//       })
//   }
//   if(typeof req.body.priority !== (low || medium || high)) {
//       return res.status(400).send({
//           error: "Priority not provided"
//       })
//   }
  
   
  route.post("/todo", async (req,res)=>{
      //console.log("line 85",req.body)
      let data = req.body;
    //   d = { "title": "a", "description": "b", "due": "20-20-20" }

    //   const x = await Todos.create(d);

    //   console.log(x);

    //   return res.send("this").status(200);

      Todos.create(data).then((val)=>{
          //console.log(val.dataValues);
          if(data.note !=""){
              let noteContent = {
                  note: data.note,
                  Todoid: val.dataValues.id
              }
              notes.create(noteContent).then(()=> res.send("")).catch((err)=> "Data cannot be added.");
          }
                 
              
            else {
                return res.send("");
            }
          
        });
  });

//   res.status(201).send({
//       success: "New Title has been added", id: newTodo.id
//   })


route.post("/todo/:id/notes", (req,res)=>{
    id = req.params.id;
    data= req.body;
    data.Todoid = Number(id);
    Todos.findAll({
        attributes:["id"]
    
    }).then((arr)=> {
        for(let item of arr){
            if(item.id==id){
                notes.create(data).then(()=> res.send("")).catch((err)=> err)
                return
            }
        }
        res.status(404)
        res.send({error : "ID is not valid"})
    })
})
route.patch("/todo/:id", (req,res)=>{
     
    let data = req.body;
    let taskid = req.params.id;

    Todos.findOne({
        where: {
            id: taskid
        }
    }).then((item)=>{
        item.dueDate = data.due;
        item.status = data.status;
        item.priority = data.priority;

        item.save().then(()=>{
            res.send("")
        }).catch((err)=> err)
    })

})


db.sync().then(()=> {
    route.listen(route.get("port"))
}).catch((err)=>{
    console.log(err)
})