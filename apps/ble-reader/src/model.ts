import { z } from "zod";

export const ConfigSchema = z.object({
  mqtt: z.object({
    url: z.string(),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
  daemon: z
    .object({
      pidfile: z.string().optional(),
      user: z
        .object({
          uid: z.number(),
          gid: z.number(),
        })
        .optional(),
    })
    .optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

const daemonDefaults = {
  daemon: {
    user: {
      uid: 1000,
      gid: 1000,
    },
  },
};
