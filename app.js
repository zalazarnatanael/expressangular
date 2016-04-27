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

app.get('/topics/:user_id', function(req, res){
    var user_id = req.params.user_id;
    console.log('user_id: ', user_id);
    connection.query("SELECT topic_name FROM user_topic LEFT JOIN topic ON topic_id = id WHERE user_id=:user_id", {'user_id': user_id}, function(err, rows){
        console.log('rows: ', rows);
        res.json(rows);
    });

});

app.listen(3000);
console.log("Running on port 3000");
