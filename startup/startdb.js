const { Client } = require('pg');

const bcrypt = require('bcrypt');

module.exports = async () => {
    const client = new Client();
    await client.connect();

    const checkUsersTable = async () => {
        // Check if theres a users table present
        const query = 'SELECT  EXISTS (SELECT * FROM information_schema.tables WHERE table_name = $1)';
        const queryValue = ['users'];
        try {
            const usersDb = await client.query(query, queryValue);
            // Create a Users table if non exists
            if (usersDb.rows[0].exists === false) {
                // hash the admin password in our env variable, to be used for the admin user in our DB
                const salt = await bcrypt.genSalt(10);
                const adminPassword = await bcrypt.hash(process.env.ADMINPASSWORD, salt);

                const createUserTable = 'CREATE TABLE Users(userid SMALLSERIAL PRIMARY KEY, firstname varchar (50) not null, lastname varchar (50) not null, email varchar (50) UNIQUE not null, password text not null, gender varchar (50) not null, jobrole varchar (50) not null, department varchar (50) not null, address text not null, admin boolean not null default false)';
                client.query(createUserTable)
                    .then(() => console.log('Created User Table'))
                    .catch(() => console.log('Something failed while Creating User Table'));

                // insert Admin User
                const text = 'INSERT INTO users(firstname, lastname, email, password, gender, jobrole, department, address, admin) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
                const values = ['Ore', 'Akinwole', 'oreakinwole@gmail.com', adminPassword, 'male', 'backend', 'software', '14, Sobo arobiodu street, G.R.A, Ikeja', true];
                client.query(text, values)
                    .then(() => console.log('Inserted Admin User'))
                    .catch(() => console.log('something failed with inserting Admin User'));
            }
        } catch (err) {
            console.log(err);
        }
    };

    // incase users table is present, but no Admin User
    const checkForAdmin = async () => {
        // check if an admin user is present in users table
        const adminUser = await client.query('SELECT * FROM users where admin = true');
        // if no admin user, insert one
        if (adminUser.rowCount === 0) {
            // hash the admin password in our env variable, to be used for the admin user in our DB
            const salt = await bcrypt.genSalt(10);
            const adminPassword = await bcrypt.hash(process.env.ADMINPASSWORD, salt);
            const text = 'INSERT INTO users(firstname, lastname, email, password, gender, jobrole, department, address, admin) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
            const values = ['Ore', 'Akinwole', 'toyosi@gmail.com', adminPassword, 'male', 'backend', 'software', '14, Sobo arobiodu street, G.R.A, Ikeja', true];
            client.query(text, values)
                .then(() => console.log('Inserted Admin User'))
                .catch((err) => console.log('Error inserting Admin User', err));
        }
    };

    const checkForArticTb = async () => {
        // Check if theres a article table present
        const query = 'SELECT  EXISTS (SELECT * FROM information_schema.tables WHERE table_name = $1)';
        const queryValue = ['articles'];
        const articleTb = await client.query(query, queryValue);

        if (articleTb.rows[0].exists === false) {
            const createArticleTable = 'CREATE TABLE Articles(articleid SMALLSERIAL PRIMARY KEY, title varchar (50) not null, article text not null, comments json[], createdon timestamp not null default current_date)';
            client.query(createArticleTable)
                .then(() => console.log('Created Article Table'))
                .catch(() => console.log('Something failed while creating Article Table'));
        }
    };

    const checkForGifsTb = async () => {
        // Check if theres a article table present
        const query = 'SELECT  EXISTS (SELECT * FROM information_schema.tables WHERE table_name = $1)';
        const queryValue = ['gifs'];
        const gifsTb = await client.query(query, queryValue);

        if (gifsTb.rows[0].exists === false) {
            const createGifTable = 'CREATE TABLE Gifs(gifid SMALLSERIAL PRIMARY KEY, title varchar (50) not null, imageurl text not null, comments json[], createdon timestamp not null default current_date)';
            client.query(createGifTable)
                .then(() => console.log('Created Gif Table'))
                .catch(() => console.log('Something failed while creating Gif Table'));
        }
    };

    await checkUsersTable();
    await checkForAdmin();
    await checkForArticTb();
    await checkForGifsTb();
};
