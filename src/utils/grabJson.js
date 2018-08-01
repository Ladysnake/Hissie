import fs from "fs";

export default function grabJson(path) {
    return JSON.parse(fs.readFileSync(path));
}