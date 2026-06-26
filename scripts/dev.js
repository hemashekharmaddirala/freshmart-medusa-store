const { spawn } = require("node:child_process")

const isWindows = process.platform === "win32"
const npm = isWindows ? "cmd.exe" : "npm"

const commands = [
  ["backend", "npm.cmd run dev --workspace=@dtc/backend"],
  ["storefront", "npm.cmd run dev --workspace=@dtc/storefront"],
]

const children = new Map()
let shuttingDown = false

function stopAll(signal = "SIGTERM") {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children.values()) {
    if (!child.killed) {
      child.kill(signal)
    }
  }
}

for (const [name, command] of commands) {
  const args = isWindows
    ? ["/d", "/s", "/c", command]
    : command.replace(/^npm\.cmd/, "npm").split(" ")

  const child = spawn(npm, args, {
    cwd: process.cwd(),
    stdio: "inherit",
  })

  children.set(name, child)

  child.on("exit", (code, signal) => {
    children.delete(name)

    if (shuttingDown) {
      return
    }

    stopAll()
    process.exitCode = code ?? (signal ? 1 : 0)
  })

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`)
    stopAll()
    process.exitCode = 1
  })
}

process.on("SIGINT", () => {
  stopAll("SIGINT")
})

process.on("SIGTERM", () => {
  stopAll("SIGTERM")
})
