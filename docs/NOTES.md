# What is this?

A general markdown file to dump notes that are needed to understands things not easily picked up.

### Exporting enums

In order to get enums out so they can be referenced by whatever is using the WASM output, we copy enums.zig and put it into scripts/copied_game_enums.zig. Then our output_enum_getters.zig needs to get updated so it exports out whatever enums you want to make available.

That output file writes to a file BACK INTO the main game directory called enumgetters.zig. Why?

That way we don't have to write a function to return each entry in an enum list. It does it for us. We update the enums and, by nature of doing so, we get an automated export mechanism that iterates over every enum field that you tell it to in output_enum_getters.zig and then a function for each field is built for you.

This makes available functions like: enumgetters_Components_Movement, for example, which returns a u16 to the ID of that actual enum field.