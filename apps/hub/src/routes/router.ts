import { ruuviSave } from "./ruuvi";
import { router } from "../trpc";

export const appRouter = router({
  ruuviSave,
});

export type AppRouter = typeof appRouter;
