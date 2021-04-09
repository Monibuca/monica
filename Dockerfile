FROM golang

RUN go env -w GO111MODULE=on
RUN go env -w GOPROXY=https://goproxy.cn,direct

RUN apt-get update
RUN apt-get install -y git python jq curl vim

RUN curl -sL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get update && apt-get install -y nodejs
RUN npm install gulp yarn -g

RUN npm i -g --unsafe-perm=true @langhuihui/monica

# Monica:3000 Gateway:8081 GB28181:5060 RTMP:1935  Jessica:8080
# RTP:58200-58300 Cluster:2019 HDL:2020 RTSP:554
EXPOSE 3000 8081 1935 5060 8080 58200-58300 2019 2020 554

CMD [ "monica" ]