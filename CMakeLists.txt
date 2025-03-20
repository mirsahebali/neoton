cmake_minimum_required(VERSION 3.15)

project(neolink LANGUAGES CXX)

# Set the C++ standard (adjust as needed)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Locate required packages
find_package(Drogon REQUIRED)
find_package(cpp-jwt REQUIRED)
find_package(SQLite3 REQUIRED)
find_package(spdlog REQUIRED)

message(STATUS "Building with CMake version: ${CMAKE_VERSION}")

# Define absolute paths for source directories
set(SRC_DIR ${CMAKE_CURRENT_SOURCE_DIR}/src)

# Glob all source files from each directory
file(GLOB SRC_FILES CONFIGURE_DEPENDS ${SRC_DIR}/*.cc)

# Create the executable target and add all sources
add_executable(
    ${PROJECT_NAME}
    ${SRC_FILES})

# Specify include directories for the target
target_include_directories(${PROJECT_NAME} PRIVATE ${SRC_DIR})

# Link against required libraries (using boost::boost as specified)
target_link_libraries(${PROJECT_NAME} Drogon::Drogon cpp-jwt::cpp-jwt  SQLite::SQLite3 spdlog::spdlog)
