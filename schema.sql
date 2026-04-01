DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS BlockLoaners;
DROP TABLE IF EXISTS FormResponses;

CREATE TABLE Students (
    id INT NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL
);

CREATE TABLE BlockLoaners (
    loanerNumber INT NOT NULL PRIMARY KEY,
    id INT NOT NULL,
    serialNumber TEXT NOT NULL,
    blStatus INT NOT NULL
);

CREATE TABLE FormResponses (
    checkedTime DATETIME NOT NULL PRIMARY KEY,
    blStatus INT NOT NULL,
    email TEXT NOT NULL,
    reason TEXT NOT NULL,
    blockLoaner INT NOT NULL,
    FOREIGN KEY (blockLoaner) REFERENCES BlockLoaners(loanerNumber)
);