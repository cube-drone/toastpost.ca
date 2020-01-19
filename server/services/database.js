require('url');

var Sequelize = require('sequelize');

module.exports = ({databaseUri}) => {

    let earl = new URL(databaseUri);

    // Connect to postgreSQL through Sequelize.
    var sequelize = new Sequelize(earl.pathname.substring(1), earl.username, earl.password, {
        host: earl.hostname,
        dialect: 'postgres',
        port: earl.port,
        logging: false
    });

    return sequelize;
};