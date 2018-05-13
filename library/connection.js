const settings = {
    host: 'weather-ml.database.windows.net',
    database: 'weather',
    user: 'rootuser',
    password: 'overdrive1!',
    options:{
      encrypt: true
    }
};
var connection = require('knex')({
  client: 'mssql',
  connection: settings
});
module.exports = connection;
