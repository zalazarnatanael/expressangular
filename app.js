var express = require('express');
var app = express();
var mysql = require('mysql');
var Q = require('Q');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

//Settings connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database : 'base_natanael',
});

//QueryFormat
connection.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

//Open connect to MySql
connection.connect();


app.get('/login/:user_name', function(req, res){
    var user_name = req.params.user_name;

    connection.query("SELECT * FROM user WHERE user_name = :user_name", { 'user_name': user_name }, function(err, rows){
        if (rows[0]) res.json(rows[0].id);
        else {
            connection.query('INSERT INTO user (user_name, creation_date) VALUES(:user_name, NOW())', {'user_name': user_name}, function(err, result){
                if (err) throw err;
                res.json(result.insertId);
            });
        }
    });
});

app.get('/topic/:user_id', function(req, res){
    var user_id = req.params.user_id;
    connection.query("SELECT topic_name, id FROM user_topic LEFT JOIN topic ON topic_id = id WHERE user_id=:user_id", {'user_id': user_id}, function(err, rows){
        res.json(rows);
    });
});

app.get('/topic/subscribe/:user_id', function(req, res){
    var user_id = req.params.user_id;
    connection.query("SELECT t.id, t.topic_name, ut.topic_id FROM topic t LEFT JOIN user_topic ut ON ut.topic_id = t.id AND ut.user_id = :user_id WHERE ut.topic_id IS NULL", {'user_id': user_id}, function(err, rows){
        res.json(rows);
    });
});

app.post('/topic/subscribe', function(req,res){
    connection.query("INSERT INTO user_topic (user_id, topic_id, creation_date) VALUES (:user_id, :topic_id, NOW())", req.body, function(err, result){
        if (err) throw err;
        res.json(true);
    });
});

app.get('/topic/by_name/:topic_name', function(req, res){
    var topic_name = req.params.topic_name;
    connection.query("SELECT id FROM topic WHERE topic_name=:topic_name", {'topic_name': topic_name}, function(err,rows){
        if (err) throw err;
        res.json(rows[0]);
    });
});

app.post('/new_message', function(req, res){
    connection.query("INSERT INTO message (topic_id, user_id, mensaje, title, creation_date, message_id ) VALUES (:topic_id, :user_id, :mensaje, :title, NOW(), :message_id)", req.body, function(err,result){
        if (err) throw err;
        res.json(true);
    });
});

app.get('/get_messages/:user_id', function(req, res){
    var user_id = req.params.user_id;
    connection.query("SELECT m.id, t.topic_name, m.topic_id, m.title, m.mensaje, m.message_id, m.user_id, u.user_name FROM message m INNER JOIN user_topic ut ON ut.user_id=:user_id AND ut.topic_id = m.topic_id INNER JOIN topic t ON t.id = m.topic_id LEFT JOIN user u ON u.id = m.user_id", {'user_id': user_id}, function(err,rows){
        if (err) throw err;
        res.json(rows);
    });
});

app.listen(3000);
console.log("Running on port 3000");
