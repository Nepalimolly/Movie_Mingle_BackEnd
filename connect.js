import mysql2 from "mysql2";

export const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Lukadon1996$",
  database: "social",
  port: 3306,
});
