import { serve } from "bun";
import { v4 as uuidv4 } from "uuid";
import database from "bun:sqlite";
import * as fs from "fs";

const db = database.open("game.db");

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        score INTEGER DEFAULT 0
    );
`);
db.run(`
    CREATE TABLE IF NOT EXISTS keys (
        key TEXT PRIMARY KEY,
        username TEXT,
        FOREIGN KEY(username) REFERENCES users(username)
    )
`);

// db.query(`UPDATE users SET score = score + ? WHERE username = ?`, [points, username]).run();
// const new_score = db.query("SELECT score FROM users WHERE username = ?", [username]).get().score;

const output_string_buffers = [];
const output_array_buffers = [];
const wasmCode = fs.readFileSync("./wasm_game.wasm");
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule, {
    env: {
        memory: new WebAssembly.Memory({
            initial: 512,
            maximum: 2048
        }),
        js_console_log: (ptr, len) => {
            const bytes = new Uint8Array(wasm.exports.memory.buffer, ptr, len);
            const message = new TextDecoder('utf-8').decode(bytes);
            console.log(message);
        },
        js_output_string_buffer: (ptr, len) => {
            const bytes = new Uint8Array(wasm.exports.memory.buffer, ptr, len);
            const message = new TextDecoder('utf-8').decode(bytes);
            output_string_buffers.push(message);
            const MAX_STRING_BUFFER_ENTRIES = 200;
            if (output_string_buffers.length > MAX_STRING_BUFFER_ENTRIES) {
                output_string_buffers.shift();
            }
        },
        js_output_array_buffer: (ptr, len) => {
            const array = new Int32Array(wasm.exports.memory.buffer, ptr, len);
            output_array_buffers.push(array);
            const MAX_STRING_ARRAY_ENTRIES = 200;
            if (output_array_buffers.length > MAX_STRING_ARRAY_ENTRIES) {
                output_array_buffers.shift();
            }
        }
    }
});
// Access exports
const exports = wasmInstance.exports;
console.log("Exports are ready");
console.log(exports.initialize_game());

serve({
    port: 3333,
    async fetch(req)
    {
        const url = new URL(req.url);
        let body;

        if (req.method === "POST")
        {
            body = await req.json();
        }

        if (url.pathname === "/generatekey")
        {
            const { username } = body;
            const key = uuidv4();

            db.run(`INSERT OR IGNORE INTO users (username) VALUES (?)`, [username]);
            db.run(`INSERT INTO keys (key, username) VALUES (?, ?)`, [key, username]);

            return new Response(JSON.stringify({ key }), {
                header: { "Content-Type": "application/json" }
            });
        }
        else if (url.pathname === "/validatekey" && req.method === "POST")
        {
            const { key, username } = body;
            const result = db.query("SELECT username FROM keys WHERE key = ?", [key]).get();

            if (result && result.username === username)
            {
                db.run("DELETE FROM keys WHERE key = ?", [key]);

                return new Response(JSON.stringify({
                    success: true,
                    message: "Key validated, access granted!"
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
            else
            {
                return new Response(JSON.stringify({
                    success: true,
                    message: "Invalid key or username mismatch"
                }), {
                    header: { "Content-Type": "application/json" }
                });
            }
        }
        return new Response("Not found", { status: 404 });
    }
});