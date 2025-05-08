cmake_minimum_required(VERSION 3.16)
project(OttoArduinoTests LANGUAGES CXX)

Include(FetchContent)

FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0 # or a later release
)

FetchContent_MakeAvailable(Catch2)

set(EXECUTABLE_OUTPUT_PATH  ${PROJECT_SOURCE_DIR}/bin/)
add_executable(tests test.cpp)
target_include_directories(tests PRIVATE ../otto-blocky-pico)
target_link_libraries(tests PRIVATE Catch2::Catch2WithMain)
