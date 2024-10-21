package common

import "../js"

MAX_TOTAL_MARKET_GOODS :: 24

EnumMarket :: enum i32 {
    Name,
    ID,
    TotalGoods,
    Goods,
    AdjustedGoodsPrices,
}

rom_total_market_array_size :: proc() -> i32 {
    size: i32 = 0

    // Name, ID, TotalGoods
    size += 3

    // Goods
    size += MAX_TOTAL_MARKET_GOODS

    // AdjustedGoodsPrices
    size += MAX_TOTAL_MARKET_GOODS

    return MAX_TOTAL_MARKET_GOODS
}

add_good_to_market :: proc(market_id: i32, good_id: i32) {
    // If current total goods + 1 >= MAX_TOTAL_MARKET_GOODS, error out
    // Iterate over existing goods. If array index = 0, available, fill slot
}

get_good_price_from_market :: proc(market_id: i32, good_id: i32) -> i32 {
    // If good price in market = 0 then get base prices from goods data
    return -1
}