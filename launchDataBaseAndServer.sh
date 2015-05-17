#! /bin/bash
forever stopall
forever start main.js
mongod --dbpath="./data" --port 27017
