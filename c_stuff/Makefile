# For wasm
# run `make clean`
# run `make run -e arch=wasm32 -e abi=wasi`

src_dir = src
bin_dir = bin
obj_dir = bin/obj
# output binary name without extension
bin_name_base = main

# run `zig targets | jq -r '.os | join(", ")'`
os = linux
# run `zig targets | jq -r '.arch | join(", ")`
arch = x86_64
# run `zig targets | jq -r '.abi | join(", ")`
abi = musl
# debug or release
mode = debug

ifeq ($(arch),wasm32)
	target = $(arch)-$(abi) # wasm32 doesn't have an os
else
	target = $(arch)-$(os)-$(abi)
endif
cc = ~/zig-linux-x86_64-0.11.0/zig cc -target $(target)
cflags = -std=c2x -Wall -Wextra -Werror
includes = 

ifeq ($(mode),debug)
	cflags += -g
else ifeq ($(mode),release)
	# O3 = optimize this
	# s = no debug symbols (s = strip)
	cflags += -O3 -s
endif

ifeq ($(os),windows)
	bin_name = $(bin_name_base).exe
	abi = gnu # windows doesn't support musl
else ifeq ($(os),wasm32)
	bin_name = $(bin_name_base).wasm
else
	bin_name = $(bin_name_base)
endif

default: help

help:
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  help      Show this help message"
	@echo "  run       Build and run the program"
	@echo "  build     Build the program"
	@echo "  clean     Remove the build directory"
	@echo ""
	@echo "To build for wasm, run"
	@echo "> make clean"
	@echo "> make run -e arch=wasm32 -e abi=wasi"

run: build
ifeq ($(arch),wasm32)
	@wasmtime $(bin_dir)/$(bin_name)
else
	@$(bin_dir)/$(bin_name)
endif

build: $(bin_dir)/$(bin_name)

mkdirs:
	@mkdir -p $(bin_dir)
	@mkdir -p $(obj_dir)

src_files = $(wildcard $(src_dir)/*.c)
ifeq ($(os),windows)
	obj_files = $(patsubst $(src_dir)/%.c,$(obj_dir)/%.obj,$(src_files))
else
	obj_files = $(patsubst $(src_dir)/%.c,$(obj_dir)/%.o,$(src_files))
endif

ifeq ($(os),windows)
$(obj_dir)/%.obj: $(src_dir)/%.c
	$(cc) $(cflags) $(includes) -c $< -o $@
else
$(obj_dir)/%.o: $(src_dir)/%.c
	$(cc) $(cflags) $(includes) -c $< -o $@
endif

$(bin_dir)/$(bin_name): mkdirs $(obj_files)
	$(cc) $(cflags) $(includes) $(obj_files) -o $@

# PHONY = do not cache (run every time), makefile magic
.PHONY: clean
clean:
	@rm -rf $(bin_dir)