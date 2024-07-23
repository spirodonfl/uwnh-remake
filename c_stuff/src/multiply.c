#include "stdint.h"
#include "add.h"

int32_t multiply(int32_t a, int32_t b) {
    for (int32_t i = 0; i < b; i++) {
        a = add(a, a);
    }

    return a;
}