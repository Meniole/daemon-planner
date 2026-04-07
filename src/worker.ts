import { createPlugin } from "@ubiquity-os/plugin-sdk";
import type { Options } from "@ubiquity-os/plugin-sdk";
import type { Manifest } from "@ubiquity-os/plugin-sdk/manifest";
import { LOG_LEVEL, LogLevel } from "@ubiquity-os/ubiquity-os-logger";
import { ExecutionContext } from "hono";
import { env } from "hono/adapter";
import manifest from "../manifest.json" with { type: "json" };
import { runPlugin } from "./index";
import type { SupportedEvents } from "./types/context";
import { envSchema } from "./types/env";
import type { Env } from "./types/env";
import { pluginSettingsSchema } from "./types/plugin-input";
import type { PluginSettings } from "./types/plugin-input";

export default {
  async fetch(request: Request, environment: Env, executionCtx?: ExecutionContext) {
    const decodedEnv = env<Env>(request as never);
    return createPlugin<PluginSettings, Env, null, SupportedEvents>(
      (context) => {
        return runPlugin(context);
      },
      manifest as Manifest,
      {
        settingsSchema: pluginSettingsSchema as unknown as Options["settingsSchema"],
        envSchema: envSchema as unknown as Options["envSchema"],
        postCommentOnError: false,
        logLevel: (decodedEnv.LOG_LEVEL as LogLevel) || LOG_LEVEL.INFO,
        kernelPublicKey: decodedEnv.KERNEL_PUBLIC_KEY,
        bypassSignatureVerification: decodedEnv.NODE_ENV === "local",
      }
    ).fetch(request, env, executionCtx);
  },
};
