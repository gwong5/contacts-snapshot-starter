DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  salted_password VARCHAR NOT NULL
);

DROP TABLE IF EXISTS contacts;

CREATE TABLE contacts (
  id SERIAL,
  user_id INTEGER,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL
);

