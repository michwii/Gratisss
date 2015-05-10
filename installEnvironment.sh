#! /bin/bash
sudo apt-get update
sudo apt-get install curl
sudo curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
sudo apt-get install -y git
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/debian "$(lsb_release -sc)"/mongodb-org/3.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
git clone https://github.com/michwii/UnJourUnEchantillon
cd UnJourUnEchantillon
sudo npm install
sudo npm install forever -g
sudo forever start main.js