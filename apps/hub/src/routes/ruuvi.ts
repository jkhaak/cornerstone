import { apiEventSchema } from "../model/ruuvi";
import { publicProcedure } from "../trpc";
import { createDataEvent } from "../model/ruuvi";
import * as ruuviService from "../service/ruuvi";

export const ruuviSave = publicProcedure.input(apiEventSchema).mutation(async (opts) => {
  const { input } = opts;

  const data = await createDataEvent(input);
  const result = await ruuviService.handle(data);
  return result;
});
