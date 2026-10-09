import database from "mysql2/promise";

export const db = database.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"test",
    port:3306
});

export function Connection_status(){
    db.getConnection().then(e => {
        console.log("MySQL connected!");
        e.release();})
        .catch(er => {
            console.error("MySQL connection failed:", er);
  });
}