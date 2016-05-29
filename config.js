module.exports = {
    messagesToFetch: 50,
    rateLimit: 1000,
    maxMessageLength: 1000,
    ip: "localhost",
    port: "8080",
    dbhost: "localhost",
    dbport: "2702",
    dbname: "chatty",
    dbUrl: function(){
        return "mongodb://" + this.dbhost + ":" + this.dbport + "/" + this.dbname;
    }
}
