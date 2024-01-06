const mysql = require('mysql2')
const connection = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'ex_swaggwe'
  }
)

const express = require('express')
const cors = require('cors')
const app = express()

const swaggerUi = require('swagger-ui-express')
const fs = require("fs")
const YAML = require('yaml')
const file = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const port = 5000
app.use(cors());
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/attractions', (req, res) => {
  connection.query(
    'SELECT * FROM attractions',
    function (err, result) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json(result);
      }
    }
  )
})

app.get('/attractions/:id', (req, res) => {
  id = req.params.id
  connection.query(
    'SELECT * FROM attractions WHERE id=?', [id],
    function (err, result) {
      if (result.length > 0) {
        res.json(result[0])
      } else {
        res.json({ massage: 'not found data' })
      }

    }
  )

})

app.post('/attractions', (req, res) => {
  const { name, detail, coverimage, latitude, longitude } = req.body;

  connection.query(
    'INSERT INTO attractions (name, detail, coverimage, latitude, longitude) VALUES (?,?,?,?,?)',
    [name, detail, coverimage, latitude, longitude],
    function (err, result) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      }

      const insertedAttraction = {
        name,
        detail,
        coverimage,
        latitude,
        longitude
      };

      res.status(201).json(insertedAttraction);
    }
  );
});

app.put('/attractions', (req, res) => {
  const { id, name, detail, coverimage, latitude, longitude } = req.body;
  connection.query(
    'UPDATE attractions SET name=?, detail=?, coverimage=?, latitude=?, longitude=? WHERE id=?',
    [name, detail, coverimage, latitude, longitude, id],
    function (err, result) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(201).json(result);
      }
    }
  );
});

app.delete('/attractions/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'DELETE FROM attractions WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {

        return res.status(500).json({ error: 'Internal Server Error' });
      }
      else {
        res.status(200).json(result);
      }


    }
  );
});



app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})