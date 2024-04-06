const { Client } = require("pg");
const express = require("express");
const morgan = require("morgan"); // Some nice logging


// const PORT = process.env.PORT || 8080;
// const DB_USER = process.env.DB_USER || "hgcpzbsv";
// const DB_HOST = process.env.DB_HOST || "ella.db.elephantsql.com";
// const DB_NAME = process.env.DB_NAME || "******;
// const DB_PW = process.env.DB_PW || "*****;
// const DB_PORT = process.env.DB_PORT || 5432;


if (!process.env.DB_NAME || !process.env.DB_PW || !process.env.DB_USER) {
  console.warn("Husk at sætte databasenavn, password og user via env vars.");
  console.warn("Eksempel på at sætte databasenavn i terminalen:");
  console.warn(`export DB_NAME="spot-prisen"`);
  console.warn("Lige nu er databasenavn sat til:", DB_NAME);
} else {
  console.log("Postgres database:", DB_NAME);
  console.log("Postgres user:", DB_USER);
}


const app = express();
const client = new Client({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PW,
  port: DB_PORT
});
client.connect();

app.use(express.text());
app.use(express.static("public"))
app.use(morgan("combined"));

/*
 * Her defineres API'en.
 * API: Gennemsnitspris per time (2021) til landing-page
 */


app.post("/api/diagram1", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT AVG ("spotpris_dkk_mwh"), EXTRACT(HOUR FROM tidspunkt_dk) AS HOUR FROM spotpris GROUP BY hour ORDER BY hour`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});



// El-afgifter 
app.post("/api/elafgift", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT * FROM elafgift`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});






// Transmission, system-tarif og balancetarif for 2021 (sammenlagt)
app.post("/api/tarif_sum", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT SUM(COALESCE(transmission,0) + COALESCE(system_tarif,0) + COALESCE(balance_tarif,0)) FROM tariffer WHERE periode = '2021-01-01'`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }


});








// Ugentlige gennemsnints max- og minpris 
app.post("/api/diagram2", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT AVG(avg_max_endelig_pris) AS max_avg_weekly, AVG(avg_min_endelig_pris) AS min_avg_weekly, week_nr FROM total_max_min_weekly GROUP BY week_nr ORDER BY week_nr;
    `;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});

// Hourly gennemsnitspris (2021)
app.post("/api/avg_timepris", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT AVG (dk_sum_samlet_gennemsnit.dk_sum_samlet_gennemsnit), EXTRACT(HOUR FROM tidspunkt) AS HOUR FROM dk_sum_samlet_gennemsnit GROUP BY hour ORDER BY hour`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});






app.get("/api/hello", async (req, res) => {
  res.json({ "message": "Hello, World!" });
})

// Web-serveren startes.
app.listen(PORT, () => console.log(`Serveren kører på http://localhost:${PORT}`));