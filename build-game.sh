#!/usr/bin/env sh

ZIG_CONTAINER="uwnh-remake-zig"

if test "$1" = "--help" -o "$1" = "-h" ; then
    echo "$0 [options] [-- <zig_command>]"
    echo "   options: ['--help'    | '-h' : Print this help message.                              ]"
    echo "            ['--silent'  | '-s' : Suppress all output except for the container its self.]"
    echo "            ['--verbose' | '-v' : Provide verbose output e.g: docker build output.      ]"
    echo "   <zig_command> : Execute command custom command in the Zig container e.g 'zig build-lib -rdynamic'"
    exit 0
fi

if test "$1" = "--verbose" -o "$1" = "-v" ; then
    docker build  -t "$ZIG_CONTAINER"   \
        --build-arg GROUP_ID="$(id -g)" \
        --build-arg USER_ID="$(id -u)" .
else
    echo "Building a docker image, please wait it may take some time..."
    docker build -t "$ZIG_CONTAINER"    \
        --build-arg GROUP_ID="$(id -g)" \
        --build-arg USER_ID="$(id -u)" . >/dev/null
fi

zig_command=$(echo "$*" | sed -e 's/.*\s*--\s\+//g')

echo "$zig_command"

if test -n "$zig_command" ; then
    docker run                                    \
        --mount "type=bind,src=$(pwd)/,dst=/game" \
        --workdir "/game"                         \
        "$ZIG_CONTAINER" $zig_command
else
    docker run                                    \
        --mount "type=bind,src=$(pwd)/,dst=/game" \
        --workdir "/game"                         \
        "$ZIG_CONTAINER"
fi
