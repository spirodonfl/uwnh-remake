#include "stdint.h"
#include "stdio.h"
#include "math.h"
#include "add.h"
#include "multiply.h"

int32_t distance_between(int32_t a, int32_t b) {
    // Equation: (a * a) + (b * b) = sqrt(c)
    // x = vec1.x - vec2.x; y = vec1.y - vec2.y; (x * x) + (y * y), etc...
    int32_t stuff = add(multiply(a, a), multiply(b, b));
    printf("%d\n", stuff);
    if (stuff <= 0) {
        printf("you're dumb");
        return 0;
    }
    return sqrt(stuff);
}