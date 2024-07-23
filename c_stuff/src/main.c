#include "stdio.h"
#include "stdint.h"
#include "add.h"
#include "multiply.h"
#include "distance_between.h"

int main() {
    int32_t res = add(2, 2);
    printf("%d\n", res);
    int32_t mul = multiply(2, 2);
    printf("%d\n", mul);
    int32_t dis = distance_between((0 - 3), (0 - 3));
    printf("%d\n", dis);
}