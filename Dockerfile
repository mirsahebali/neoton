FROM debian:12.9

RUN apt update -y && apt upgrade -y

RUN apt install build-essential curl git gcc g++ cmake libjsoncpp-dev uuid-dev zlib1g-dev openssl libssl-dev libsqlite3-dev libhiredis-dev pipx -y

RUN pipx install conan

RUN mkdir -p /opt/neolink

WORKDIR /opt/neolink

ENV PATH=${PATH}:/root/.local/bin

ENV PATH=${PATH}:${HOME}/.local/bin

COPY . .

EXPOSE 8080

RUN make profile

RUN make install-deps

RUN make configure

RUN make build-bin

CMD ["make", "run"]
