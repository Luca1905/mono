import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { inspect } from "node:util";

import { Server, utils } from "ssh2";

const KEYS_PATH = {
  private: new URL("../../.ssh/mono_ed25519", import.meta.url),
  public: new URL("../../.ssh/lca_ed25519.pub", import.meta.url),
};

const allowedUser = Buffer.from("lca");
const allowedPassword = Buffer.from("password123");
const allowedPubKey = utils.parseKey(readFileSync(KEYS_PATH.public));

function checkValue(input, allowed) {
  const autoReject = input.length !== allowed.length;
  if (autoReject) {
    // Prevent leaking length information by always making a comparison with the
    // same input when lengths don't match what we expect ...
    allowed = input;
  }
  const isMatch = timingSafeEqual(input, allowed);
  return !autoReject && isMatch;
}

new Server(
  {
    hostKeys: [readFileSync(KEYS_PATH.private)],
  },
  (client) => {
    console.log("Client connected!");

    client
      .on("authentication", (ctx) => {
        let allowed = true;
        if (!checkValue(Buffer.from(ctx.username), allowedUser))
          allowed = false;

        switch (ctx.method) {
          case "password":
            if (!checkValue(Buffer.from(ctx.password), allowedPassword))
              return ctx.reject();
            break;
          case "publickey":
            if (
              ctx.key.algo !== allowedPubKey.type ||
              !checkValue(ctx.key.data, allowedPubKey.getPublicSSH()) ||
              (ctx.signature &&
                allowedPubKey.verify(ctx.blob, ctx.signature, ctx.hashAlgo) !==
                  true)
            ) {
              return ctx.reject();
            }
            break;
          default:
            return ctx.reject();
        }

        if (allowed) ctx.accept();
        else ctx.reject();
      })
      .on("ready", () => {
        console.log("Client authenticated!");

        client.on("session", (accept, reject) => {
          const session = accept();
          session.once("exec", (accept, reject, info) => {
            console.log("Client wants to execute: " + inspect(info.command));
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
).listen(0, "127.0.0.1", function () {
  console.log("Listening on port " + this.address().port);
});
