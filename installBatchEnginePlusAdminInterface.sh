#! /bin/bash
cd
git clone https://github.com/michwii/GratisssAdminInterface
git clone https://github.com/michwii/GratisssBatchEngine
cd GratisssAdminInterface
mkdir config
sudo forever start main.js
cd ..

