var express = require('express');
var app = express();
var controller = require('./controller');

var bodyParser = require('body-parser');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());


app.get('/login/:user_name', function(req, res){
    var user_name = req.params.user_name;
    controller.getUser(user_name, function(err, rows){
        if (err) throw err;
        if (rows[0]) {
            res.json({'id': rows[0].id, 'name': user_name});
        } else {
            //Create user if this not exist
            controller.createUser(user_name, function(err, result){
                if (err) throw err;
                res.json({'id': result.insertId, 'name': user_name});
            });            
        }
    });
});

app.get('/topic/:user_id', function(req, res){
    var user_id = req.params.user_id;
    controller.getTopicByUser(user_id,  function(err, rows){
        res.json(rows);
    });    
});

app.get('/topic/subscribe/:user_id', function(req, res){
    var user_id = req.params.user_id;
    controller.getTopicNotSubscribed(user_id,  function(err, rows){
        res.json(rows);
    });        
});

app.post('/topic/subscribe/', function(req,res){
    controller.setSubscriptionTopic(req.body.user_id, req.body.topic_id,  function(err, result){
        if (err) throw err;
        res.json(true);
    });    
    
});

app.get('/topic/by_name/:topic_name', function(req, res){
    var topic_name = req.params.topic_name;
    controller.getTopicByName(topic_name,  function(err,rows){
        if (err) throw err;
        res.json(rows[0]);
    });        
});

app.post('/new_message', function(req, res){
    controller.setMessage(req.body,  function(err,result){
        if (err) throw err;
        res.json(true);
    });
});

app.get('/get_messages/:user_id', function(req, res){
    var user_id = req.params.user_id;
    controller.getMessage(user_id,  function(err,rows){
        if (err) throw err;
        res.json(rows);
    });
});

app.listen(3000);
console.log("Running on port 3000");
