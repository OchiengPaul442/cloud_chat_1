<!DOCTYPE html>
<html lang="en">

<body>
    <strong>
        <h1>Description</h1>
    </strong>
    <p>This is a chat room application that makes use of the power of socket.io. It contains a registration system for
        new users and also a login system for authorized users to join the many chat rooms offered. </p>
    <strong>
        <h1>Technology Used</h1>
    </strong>
    <ul>
        <strong>core</strong>
        <ul>
            <li>Socket.io</li>
        </ul>
        <strong>Front End</strong>
        <ul>
            <li>HTML 5</li>
            <li>CSS 3</li>
            <li>JavaScript</li>
            <li>jQuery</li>
            <li>Ajax</li>
            <li>Bootstrap 5</li>
        </ul>
        <strong>Back End</strong>
        <ul>
            <li>Node.js</li>
            <li>Express.js</li>
        </ul>
        <strong>Relational Database</strong>
        <ul>
            <li>MySQL</li>
        </ul>
    </ul>
    <strong>
        <h1>Installation</h1>
    </strong>
    <p>
        To be able to run the application on your machine, you'll first have to install the dependencies through the
        command-line tool:
    </p>
    <span>
        <ul>
            <li>
                npm install
            </li>
        </ul>
    </span>
    <strong>
        <h1>Configuring MySQL Database Locally</h1>
    </strong>
    <p>Inside the main directory, you will find a folder named DB.</p>
    <ul>
        <li>Enter the DB folder</li>
        <li>Start the MySQL command line tool and log in: mysql -u root -p.</li>
        <li>With the mysql command line tool running, enter the command source live_chat.sql. this will run the schema
            file and all of the queries in it thus creating the database for you.</li>
        <li>Close out the MySQL command line tool: exit.</li>
    </ul>
    <strong>
        <h1>Usage</h1>
    </strong>
    <p>
        To start the application, type the following in the command-line tool:
    </p><span>
        <ul>
            <li>
                npm start
            </li>
        </ul>
    </span>
    <p>then navigate to http://localhost:3000 in any browser to view the application.</p>
    <p>In the login screen, you can either sign up to create your login information or use the existing testing login
        information:</p>
    <ul>
        <li>Username: guest</li>
        <li>Password: guest</li>
    </ul>
    <p>This is the signup screen, fill in all the information and your account will be created! Users will be able to
        chat with different people who are also logged into the same chat room and their chats will be confidential to
        only the users in a specific chat room.</p>
    <strong>
        <h1>SQL DUMP</h1>
    </strong>
    <p>An SQL dump is a file that contains a record of the table structure and the data from a database. It can be used
        to create a backup of the database or to transfer the data to a different database.</p>
    <p>The following snippets show:</p>
    <ul>
        <li>It als show phpMyAdmin and the database with the respective tables</li>
        <li>The sql command to create a messages table</li>
        <li>The sql command to create a user_details table</li>
        <li>Also show the setting of the primary key in each of the the created tables</li>
    </ul>
</body>

</html>
 <strong>
     <h1>PREVIEW</h1>
</strong>

![Screenshot_20221219_013502](https://user-images.githubusercontent.com/97807374/208871280-8b61b16c-d5be-4855-98c9-a9266663ff80.png)

![image](https://user-images.githubusercontent.com/97807374/208873526-55758470-00ce-4ecf-8df8-4a37e3cfbecc.png)

![image](https://user-images.githubusercontent.com/97807374/210648027-71b73ed7-a8f4-4f55-b477-27846d7c679b.png)

