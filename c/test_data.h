#ifndef TEST_DATA_H
#define TEST_DATA_H

typedef unsigned int uint32_t;

static const uint32_t test_data[] = {
    0x00000001,
    0x00000002,
    0x00000003,
    0x00000004,
    0x00000005,
    0x00000045,
    0x00010f2c,
    0x000001a4,
    0x0000029a
};
static const unsigned int test_data_len = sizeof(test_data)/sizeof(uint32_t);

#endif
