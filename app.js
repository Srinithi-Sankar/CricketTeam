const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbpath = path.join(__dirname, 'cricketTeam.db')

const app = express()

app.use(express.json())

let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`Db Error: ${error.message}`)
    process.exit(1)
  }
}

initialize()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const a = `SELECT
               *
               FROM
               cricket_team;`
  const b = await db.all(a)
  response.send(
    b.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const a = `SELECT
               *
               FROM
               cricket_team
               WHERE
               player_id=${playerId};`
  const b = await db.get(a)
  response.send(convertDbObjectToResponseObject(b))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `
                INSERT INTO
                cricket_team (player_name,jersey_number,role)
                VALUES (
                    '${playerName}' ,
                    ${jerseyNumber},
                    '${role}'
                );`
  const b = await db.run(postPlayerQuery)

  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
    UPDATE
    cricket_team
    SET 
    player_name ='${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
    WHERE
    player_id=${playerId};`

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE 
    FROM
    cricket_team
    WHERE
    player_id=${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
