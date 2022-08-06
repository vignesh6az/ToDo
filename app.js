//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require ("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin_av:Test123@cluster0.tbkco.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema ={
    name: String
}

const listSchema ={
    name:String,
    items:[itemsSchema]
}

const Item = mongoose.model("item", itemsSchema);

const List = mongoose.model("list", listSchema);

const item1 = new Item({
    name:"Welcome to todo list"
})

const item2 = new Item({
    name:"Hit + to add new item"
})

const item3 = new Item({
    name:"<= Hit this to delete items"
})

const defaultItems =[item1,item2,item3];

app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
    if (foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("saved default items to database");
            }
        });
        res.redirect("/");
    }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    });
});

app.post("/", function(req, res){
const itemName = req.body.newItem;
const listName = req.body.list;
const item = new Item({
    name:itemName
});
    if (listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        })
    }    
});

app.post("/delete",function(req,res){
    const id = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(id,function(err){
            if(!err){
                  console.log ("removed checked item")
            }
            res.redirect("/");
        });  
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
});

app.get("/:customListName",function(req,res){
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({name:customListName},function(err,foundList){
    if(!err){
        if(!foundList){
            const list = new List({
                name:customListName,
                items: defaultItems
               });
            
               list.save();
               res.redirect("/"+customListName);
        }else{
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});  
        }
    }
   });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
