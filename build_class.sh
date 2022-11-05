#!/usr/bin/bash

root_dir=$(pwd)
test_dir=$root_dir/tests
# tests
#   print
echo "compiling $test_dir/print"
cd $test_dir/print
javac -sourcepath . */*.java
#   basic
echo "compiling $test_dir/basic"
cd $test_dir/basic
javac -sourcepath . **.java
javac -sourcepath . */*.java
