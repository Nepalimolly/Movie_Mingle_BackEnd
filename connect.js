import mysql2 from "mysql2";

export const db = mysql2.createConnection({
  host: "sql3.freemysqlhosting.net",
  user: "sql3676952",
  password: "pCvu21PPn2",
  database: "sql3676952",
  port: 3306,
});
