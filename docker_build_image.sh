#!/bin/bash

sudo docker build -t monibuca/monica -f Dockerfile .

# sudo docker run -itd --name monica-ist \
# -p 3000:3000 \
# -p 1935:1935 \
# -p 5060:5060 \
# -p 554:554 \
# -p 2019:2019 \
# -p 2020:2020 \
# -p 8080:8080 \
# -p 8081:8081 \
# -p 58200-58300/udp:58200-58300 \
# monibuca/monica

