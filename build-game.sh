#!/usr/bin/env sh

ZIG_CONTAINER="uwnh-remake-zig"

if test "$1" = "--help" ; then
    echo "$0 [options]"
    echo "   options: ['--help'    | '-h' : Print this help message.                        ]"
    echo "            ['--verbose' | '-v' : Provide verbose output e.g: docker build output.]"
    exit 0
fi

if test "$1" = "--verbose" ; then
    docker build  -t "$ZIG_CONTAINER" --build-arg GROUP_ID="$(id -g)" --build-arg USER_ID="$(id -u)" .
else
    echo "Building a docker image, please wait it may take some time..."
    docker build -t "$ZIG_CONTAINER" --build-arg GROUP_ID="$(id -g)" --build-arg USER_ID="$(id -u)" . >/dev/null
fi

docker run                                    \
    --mount "type=bind,src=$(pwd)/,dst=/game" \
    --workdir "/game"                         \
    "$ZIG_CONTAINER"
