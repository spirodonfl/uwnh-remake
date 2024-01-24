FROM ubuntu

ARG USER_ID
ARG GROUP_ID

RUN DEBIAN_FRONTEND=noninteractive
RUN apt-get update &&                                              \
    apt-get install -y --allow-downgrades --allow-remove-essential \
        --allow-change-held-packages                               \
        wget                                                       \
        curl                                                       \
        build-essential                                            \
    && apt-get clean

RUN addgroup --gid $GROUP_ID user
RUN adduser --disabled-password --gecos '' --uid $USER_ID --gid $GROUP_ID user

RUN mkdir /toolchain
RUN chown -R $USER_ID:$GROUP_ID /toolchain

USER user

WORKDIR /toolchain
RUN echo "Fetching toolchain: zig-linux-x86_64-0.11.0"
RUN curl --proto '=https' --tlsv1.2 -sSf https://ziglang.org/download/0.11.0/zig-linux-x86_64-0.11.0.tar.xz | tar -Jxf -
ENV PATH ${PATH}:/toolchain/zig-linux-x86_64-0.11.0

# RUN chown ${USER}:${USER} -R /toolchain
RUN chmod +x /toolchain/zig-linux-x86_64-0.11.0/zig

VOLUME /game
WORKDIR /game

CMD ["zig", "build"]
