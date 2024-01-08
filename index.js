const mysql = require('mysql2')
const express = require('express')
const cors = require('cors')
const app = express()

const connection = mysql.createConnection(

  {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'ex_swaggwe'
  }
)

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

app.post('/attractions', async (req, res) => {
  try {
    const { name, detail, coverimage, latitude, longitude } = req.body;

    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO attractions (name, detail, coverimage, latitude, longitude) VALUES (?,?,?,?,?)',
        [name, detail, coverimage, latitude, longitude],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    const insertedAttraction = {
      name,
      detail,
      coverimage,
      latitude,
      longitude,
    };

    res.status(201).json(insertedAttraction);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.put('/attractions', async (req, res) => {
  try {
    const { id, name, detail, coverimage, latitude, longitude } = req.body;

    const result = await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE attractions SET name=?, detail=?, coverimage=?, latitude=?, longitude=? WHERE id=?',
        [name, detail, coverimage, latitude, longitude, id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/attractions/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // ตรวจสอบว่า ID นี้มีในฐานข้อมูลหรือไม่
    const checkQuery = 'SELECT * FROM attractions WHERE id = ?';
    const checkResult = await new Promise((resolve, reject) => {
      connection.query(checkQuery, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // ถ้าไม่พบ ID ในฐานข้อมูล
    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    // ดำเนินการลบ
    const deleteQuery = 'DELETE FROM attractions WHERE id = ?';
    const deleteResult = await new Promise((resolve, reject) => {
      connection.query(deleteQuery, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.status(200).json(deleteResult);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})