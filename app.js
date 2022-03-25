const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");



// it might be delete in future
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://screamgyor:screamgyor@cluster0.lhuhv.mongodb.net/hodlinfoDB");
const itemSchema = {
  name:String,
  buy:Number,
  sell:Number,
  volume:Number,
  last:Number,
  base_unit:String
}

const Item = mongoose.model("Item", itemSchema);

function add(item){
    const newentry = new Item ({
      name:item[1].name,
      buy:item[1].buy,
      sell:item[1].sell,
      volume:item[1].volume,
      last:item[1].last,
      base_unit:item[1].base_unit
    });
    if(item){
      newentry.save();
      console.log("added");
    }
}





function addAPI(){
  https.get('https://api.wazirx.com/api/v2/tickers', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      var dataObj=JSON.parse(data);
      var arr=[];
      for(var x in dataObj)
      {
        arr.push([x,dataObj[x]]);
      }
      arr.sort(function(a,b){
        return b[1].high - a[1].high;
      })
      for(var i=0;i<10;i++)
      {
        add(arr[i]);
      }
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

app.get("/",(req,res)=>{
  Item.find({}, function(err, founditems){
    if(founditems.length==0)
    {
      addAPI();
      res.redirect("/");
    }
    else{
      res.render("index",{items:founditems});
    }
  })
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log('server is running in port Successfully')
});
