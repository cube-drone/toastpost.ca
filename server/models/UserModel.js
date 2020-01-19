const Sequelize = require('sequelize-cockroachdb');
const Op = Sequelize.Op;

module.exports = async ({database}) => {

    const User = database.define('trio', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },

        // email
        // password (hashed)
        //

        created_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW}
        updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW}
    });
    
    // force should only be true if you're clearing the database
    let force=false;

    await User.sync({force});

    return User;
};