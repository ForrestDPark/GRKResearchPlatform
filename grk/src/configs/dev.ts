import { MESSAGES } from "@nestjs/core/constants";

const SERVER_DOMAIN = 'localhost';
const SERVER_PORT = 3000;
const SERVER_URL = `http://${SERVER_DOMAIN}:${SERVER_PORT}`;
export default {
    logLevel: 'debug',
    dbInfo: 'http://dev-mysql:3306',
    MESSAGES :'GRK RESEARCH PLATFORM',
    WEATHER_API_URL : 'http://api.openweathermap.org/data/2.5/forecast',
    WEATHER_API_KEY : '2f7291653dec89bb534b465e3669b92a',
    SERVER_DOMAIN : SERVER_DOMAIN,
    SERVER_PORT :SERVER_PORT,
    SERVER_URL :SERVER_URL,
    DB_TYPE:'mongodb',

    // DBtype -> postgreSQL , mySQL, Oracle, mongodb, sqlite 
    UserDB_type : 'sqlite'
    // UserDB_type : 'mongodb'
}