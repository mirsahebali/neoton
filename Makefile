.PHONY= profile install-deps configure build run all

BUILD_TYPE ?= Debug

profile:
	conan profile detect --force

install-deps:
	conan install . --output-folder build --build=missing --settings=build_type=${BUILD_TYPE}

configure:
	cd build && cmake .. -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake -DCMAKE_BUILD_TYPE=${BUILD_TYPE}

build:
	cmake --build build

run:
	./build/neolink



all: profile install-deps configure build run
