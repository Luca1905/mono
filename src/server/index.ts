import { readFileSync } from "node:fs";
import { inspect } from "node:util";
import { Server, utils } from "ssh2";
import type { Server as ServerType } from "ssh2";

const KEYS = utils.generateKeyPairSync("ed25519");

new Server(
  {
    banner: "mono knows all",
    hostKeys: [KEYS.private],
  },
  (client) => {
    console.log("Client connected!");

    client
      .on("authentication", (ctx) => {
        // console.log(ctx);
        ctx.accept();
      })
      .on("ready", () => {
        console.log("Client authenticated!");

        client.on("session", (accept, _reject) => {
          const session = accept();
          session.once("exec", (accept, _reject, info) => {
            console.log(`Client wants to execute: ${inspect(info.command)}`);
            const stream = accept();
            stream.stderr.write("Oh no, the dreaded errors!\n");
            stream.write("Just kidding about the errors!\n");
            stream.exit(0);
            stream.end();
          });
        });
      })
      .on("close", () => {
        console.log("Client disconnected");
      });
  },
).listen(0, "127.0.0.1", function (this: ServerType) {
  const addr = this.address();
  if (addr && typeof addr !== "string") {
    console.log(`Listening on port ${addr.port}`);
  } else {
    console.log("Listening");
  }
});
