#! /bin/bash
#On commence par installer la database MongoDB
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/debian "$(lsb_release -sc)"/mongodb-org/3.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
#On lance la database
sudo service mongod start
#FIN -- On commence par installer la database MongoDB
#On install NodeJS
sudo apt-get install curl
sudo curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
#FIN -- On install NodeJS
#On install Git
sudo apt-get install -y git
#FIN -- On install Git
#On va chercher les sources du projet
git clone https://github.com/michwii/UnJourUnEchantillon
#FIN -- On va chercher les sources du projet
#On installe les dependances npm du projet
cd UnJourUnEchantillon
sudo npm install
sudo npm install forever -g
#FIN On installe les dependances npm du projet
#On lance le server nodeJS en mode service
sudo forever start main.js