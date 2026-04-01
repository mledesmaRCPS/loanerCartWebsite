-- Drop database and user if they exist
DROP DATABASE IF EXISTS blockloanerDB;
DROP USER IF EXISTS blockLoan_user@localhost;

-- Create the database and user for the block loaner application
CREATE DATABASE blockloanerDB CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER blockLoan_user@localhost IDENTIFIED WITH mysql_native_password BY 'READACTED';
GRANT ALL PRIVILEGES ON blockloanerDB.* TO blockLoan_user@localhost;