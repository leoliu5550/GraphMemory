import fs from "fs"
import path from "path"

const memoryDir = path.resolve("./memory_database")
console.log(memoryDir)
if (!fs.existsSync(memoryDir)){
    fs.mkdirSync(memoryDir, {recursive: true})
}