var config = {};

//Socket
config.socket_port = 9187;

//Static HTML Server
config.static_dir = "./public";//Static Server doc_root
config.static_port = 8081;//Static Server port

//Web Page Test
config.wpt_url = 'www.webpagetest.org';
config.wpt_key = 'A.559d4ae5af277d98b7ba0857515714cd';

//Bitly
config.bitly_id = "3d4a4e7c2c8cfa6e6d357f93bc83a13220feb899";
config.bitly_secret = "0404717faef381a7d60ad7a0d3aca3ffedbf5373";
config.bitly_access_token = 'b8e564b879029ff16c9c08f3b212affbb60f7ec7';

module.exports = config;