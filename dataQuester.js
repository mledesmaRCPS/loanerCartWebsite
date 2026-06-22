const fs = require('fs');
const express = require('express');
const service = express();
const mysql = require('mysql');
const { request } = require('https');
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const connection = mysql.createConnection(credentials);

connection.connect(error => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});

service.use((request, response, next) => {
    response.set('Access-Control-Allow-Origin', '*');
    next();
});
service.options('*', (request, response) => {
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    response.sendStatus(200);
});
//THIS SHOULD BE FOR GETTING ALL BLOCK LOANERS AND WHO CHECKED THEM OUT LAST

//RECIEVE ALL INSERTS HERE
function rowOfStudent(row) {
    return {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        username: row.username,
    }
}
function rowOfBL(row) {
  return {
    loanerNumber: row.loanerNumber,
    id: row.id,
    serialNumber: row.serialNumber,
    blStatus: row.blStatus,
  }
}
function rowOfResponses(row) {
  return {
    checkedTime: row.checkedTime,
    blStatus: row.blStatus,
    email: row.email,
    reason: row.reason,
    blockLoaner: row.blockLoaner,
  }
}

function rowOfLoanerStatuses(row) {
  return {
    loanerNumber: row.loanerNumber,
    inOut: row.blStatus,
    firstName: row.first_name,
    lastName: row.last_name,
    checkedTime: row.checkedTime,
  }
}

function rowOfConfirmedStudent(row) {
  return {
    username: row.username,
  }
}

service.use(express.json());
/*
THERE ARE ONLY GET REQUESTS FROM HERE ON OUT
*/
// GET ALL BLOCK LOANERS
service.get('/block-loaners', (request, response) => {
  const query = "SELECT * FROM BlockLoaners;";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok:true,
        results: rows.map(rowOfBL)
      })
    }
  });
});
// GET ALL BLOCK LOANERS THAT ARE IN
service.get('/block-loaners-in', (request, response) => {
  const query = "SELECT * FROM BlockLoaners WHERE blStatus = 1";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok: true,
        results: rows.map(rowOfBL),
      });
    }
  });
})

// GET ALL BLOCK LOANERS THAT ARE OUT
service.get('/block-loaners-out', (request, response) => {
  const query = "SELECT * FROM BlockLoaners WHERE blStatus = 0";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok: true,
        results: rows.map(rowOfBL),
      });
    }
  });
});

// GET ALL STUDENTS
service.get('/students', (request, response) => {
  const query = "SELECT * FROM Students;";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok:true,
        results: rows.map(rowOfStudent)
      })
    }
  });
});
// GET STUDENT BY USERNAME
service.get('/students/:username', (request, response) => {
  const query = "SELECT username FROM Students WHERE username = ? LIMIT 1;";
  params = [request.params.username];

  connection.query(query, params, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok:true,
        results: rows.map(rowOfConfirmedStudent)
      })
    }
  });
});

// GET ALL FORM RESPONSES
service.get('/form-responses', (request, response) => {
  const query = "SELECT * FROM FormResponses;";
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok:true,
        results: rows.map(rowOfResponses)
      })
    }
  });
});

// GET ALL BLOCK LOANERS AND WHO CHECK THEM OUT OR IF THEY ARE IN WITH TIMES
service.get('/blockLoaners', (request, response) => {
  const query = "SELECT bl.loanerNumber, bl.blStatus, st.first_name, st.last_name, fr.checkedTime FROM BlockLoaners bl INNER JOIN FormResponses fr on bl.loanerNumber = fr.blockLoaner INNER JOIN Students st on fr.email = st.email;"
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok:true,
        results: rows.map(rowOfLoanerStatuses)
      })
    }
  });
});

/*
ASK ABOUT HOW THE LATE RETURNER THINGS WORK, DOSE IT GO INTO THE NEXT DAY AND WHAT DOES
RE-ELIGIBLE MEAN
CAN I EVEN CONNECT THIS APP WITH GOOGLE APIS TO LOCK CERTAIN LAPTOPS?
*/


/*
THERE ARE POST REQUESTS FROM HERE ON OUT
*/

//UPLOAD INFORMATION ABOUT BLOCK LOANER
service.post('/blockLoaners', (request, response) => {
  if (request.body.hasOwnProperty('loanerNumber') &&
  request.body.hasOwnProperty('id') &&
  request.body.hasOwnProperty('serialNumber') &&
  request.body.hasOwnProperty('blStatus')) {
    //PUT THE PARAMETERS HERE IN SAME ORDER
    const parameters = [
      parseInt(request.body.loanerNumber),
      parseInt(request.body.id),
      request.body.serialNumber,
      parseInt(request.body.blStatus)
    ];
    
    //PUT THE QUERY HERE IN THE SAME ORDER
    const query = 'INSERT INTO BlockLoaners (loanerNumber, id, serialNumber, blStatus) VALUES (?, ?, ?, ?)';
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      }
      else {
        response.json({
          ok: true,
          result: result.insertId,
        });
      }
    });
  }
  else {
    response.status(400);
    response.json({
      ok: false,
      results: 'YOU DIDN"T PUT IN THE CORRECT VALUES FOR BLOCK LOANERS, CHECK THEM AGAIN!!!',
    });
  }
});
//UPLOAD INFORMATION ABOUT A SUTDENT
service.post('/students', (request, response) => {
  if (request.body.hasOwnProperty('id') &&
  request.body.hasOwnProperty('email') &&
  request.body.hasOwnProperty('first_name') &&
  request.body.hasOwnProperty('last_name') &&
  request.body.hasOwnProperty('username')) {
    const parameters = [
      parseInt(request.body.id),
      request.body.email,
      request.body.first_name,
      request.body.last_name,
      request.body.username
    ];
    const query = 'INSERT INTO Students (id, email, first_name, last_name, username) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      }
      else {
        response.json({
          ok: true,
          result: result.insertId,
        });
      }
    });
  }
  else {
    response.status(400);
    response.json({
      ok: false,
      results: 'YOU DIDN"T PUT IN THE CORRECT VALUES FOR STUDENTS, CHECK THEM AGAIN!!!',
    });
  }
});
//UPLOAD FORM RESPONSES
service.post('/formResponses', (request, response) => {
  if (request.body.hasOwnProperty('blStatus') &&
      request.body.hasOwnProperty('email') &&
      request.body.hasOwnProperty('reason') &&
      request.body.hasOwnProperty('blockLoaner')) {
    const parameters = [
      parseInt(request.body.blStatus),
      request.body.email,
      request.body.reason,
      parseInt(request.body.blockLoaner)
    ];
    const query = 'INSERT INTO FormResponses (checkedTime, blStatus, email, reason, blockLoaner) VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?)';
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      }
      else {
        response.json({
          ok: true,
          result: result.insertId,
        });
      }
    });
  }
  else {
    response.status(400);
    response.json({
      ok: false,
      results: result.blStatus,
    });
  }
});

/*
THIS IS WHERE THE PATCH REQUESTS START, SHOULD BE UPDATING BLOCK LOANERS IN CASE THEY BREAK,
AND OTHER THINGS I WILL THINK OF AT SOME POINT
*/

//THIS IS FOR UPDATING THE STATUS OF A BLOCK LOANER FOR CHECK INS AND CHECK OUTS
service.patch('/blockLoanerOut/:loanerNumber', (request, response) => {
  const parameters = [
    parseInt(request.params.loanerNumber)
  ];

  const query = 'UPDATE BlockLoaners SET blStatus = 0 WHERE loanerNumber = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok: true,
        results: 'Loaner status updated successfully!'
      })
    }
  })
})

service.patch('/blockLoanerIn/:loanerNumber', (request, response) => {
  const parameters = [
    parseInt(request.params.loanerNumber)
  ];

  const query = 'UPDATE BlockLoaners SET blStatus = 1 WHERE loanerNumber = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok: true,
        results: 'Loaner status updated successfully!'
      })
    }
  })
})

// THIS IS FOR UPDATING AN ENTIRE BLOCK LOANER IN CASE IT BREAKS OR SOMETHING
service.patch('/blockLoaners/:loanerNumber', (request, response) => {
  const parameters = [
    parseInt(request.body.loanerNumber),
    parseInt(request.body.id),
    request.body.serialNumber,
    parseInt(request.body.blStatus),
    parseInt(request.params.loanerNumber)
  ];

  const query = 'UPDATE BlockLoaners SET loanerNumber = ?, id = ?, serialNumber = ?, blStatus = ? WHERE loanerNumber = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    }
    else {
      response.json({
        ok: true,
        results: 'BLOCK LOANER UPDATED SUCCESSFULLY!!!'
      });
    }
  });
});


// PORT THE PROGRAM IS ALIVE ON

const port = 8079;
service.listen(port, () => {
  console.log(`I am alive on port ${port}!`);
});
