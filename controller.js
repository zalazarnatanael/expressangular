var mysql = require('mysql');

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

//Open connection to MySql
connection.connect();

module.exports = {
  /**
  	* Create a new user
  	*
  	*/
  createUser: function(user_name, callback) {
  	connection.query('INSERT INTO user (user_name, creation_date) VALUES(:user_name, NOW())', {'user_name': user_name}, callback);
  },
  /**
  	* Get user
  	* @param {String} user_name
  	* @param {Function} callback
  	*/
  getUser: function(user_name, callback) {
  	connection.query("SELECT * FROM user WHERE user_name = :user_name", { 'user_name': user_name }, callback);
  },
  /**
  	* Get topic by user
  	* @param {Int} user_id
  	* @param {Function} callback
  	*/
  getTopicByUser: function(user_id, callback) {
	connection.query("SELECT topic_name, id FROM user_topic LEFT JOIN topic ON topic_id = id WHERE user_id=:user_id", {'user_id': user_id}, callback);
  },
  /**
  	* Get topic not suscribed 
  	* @param {Int} user_id
  	* @param {Function} callback
  	*/
  getTopicNotSubscribed: function(user_id,callback) {
  	connection.query("SELECT t.id, t.topic_name, ut.topic_id FROM topic t LEFT JOIN user_topic ut ON ut.topic_id = t.id AND ut.user_id = :user_id WHERE ut.topic_id IS NULL", {'user_id': user_id}, callback);
  },
  /**
  	* Set subscription on topic
  	* @param {Int} user_id
  	* @param {Int} topic_id
  	* @param {Function} callback
  	*/
  setSubscriptionTopic: function(user_id, topic_id, callback) {
  	connection.query("INSERT INTO user_topic (user_id, topic_id, creation_date) VALUES (:user_id, :topic_id, NOW())", {'user_id': user_id, 'topic_id': topic_id}, callback);
  },
  /**
  	* Get topic by name
  	* @param {String} topic_name
  	* @param {Function} callback
  	*/
  getTopicByName: function(topic_name, callback) {
  	connection.query("SELECT id FROM topic WHERE topic_name=:topic_name", {'topic_name': topic_name}, callback);
  },
  /**
  	* Set a new message
  	* @param {Object} data
  	* @param {Function} callback
  	*/
  setMessage: function(data, callback) {
  	connection.query("INSERT INTO message (topic_id, user_id, mensaje, title, creation_date, message_id ) VALUES (:topic_id, :user_id, :mensaje, :title, NOW(), :message_id)", data, callback);
  },
  /**
  	* Get messages
  	* @param {Int} user_id
  	* @param {Function} callback
  	*/
  getMessage: function(user_id, callback){
  	connection.query("SELECT m.id, t.topic_name, m.topic_id, m.title, m.mensaje, m.message_id, m.user_id, u.user_name FROM message m INNER JOIN user_topic ut ON ut.user_id=:user_id AND ut.topic_id = m.topic_id INNER JOIN topic t ON t.id = m.topic_id LEFT JOIN user u ON u.id = m.user_id", {'user_id': user_id}, callback);
  }
};