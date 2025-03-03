.PHONY= profile install-deps configure build-bin run all

BUILD_TYPE ?= Debug
DEV_ENV ?= dev

# Backend build commands
profile:
	conan profile detect --force

install-deps:
	conan install . --output-folder build --build=missing --settings=build_type=${BUILD_TYPE}

clean:
	rm -rf ./build

configure:
	cd build && cmake .. -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake -DCMAKE_BUILD_TYPE=${BUILD_TYPE}

build-bin:
	 cmake --build build

run:
	DEV_ENV=${DEV_ENV} ./build/neolink

build-run: build-bin run

clean-build: clean install-deps configure build-bin

# Frontend build commands

build-web:
	cd web && npm i && rm -rf dist && npm run build

run-build-web:
	cd web && (test -d node_modules || npm i) &&  (test -d dist ||  npm run build) && npm run preview

run-web:
	cd web && (test -d node_modules || npm i) && npm run dev


all: profile install-deps configure build run
