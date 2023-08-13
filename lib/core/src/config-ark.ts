import fs from "node:fs";
import type { Type } from "arktype";

export declare function parseConfig<T extends Type>(path: string, schema: T): T;

// export declare function parseConfig<B extends z.Schema, Schema extends z.ZodType<BO, z.ZodTypeDef, BI>, BI extends z.input<B> & ZodChildren<BI>, BO extends z.output<B> & ZodChildren<BO>>(path: string, schema: Schema): BO
// export declare function parseConfig<T>(path: string, schema: z.Schema<T>): T
// export declare function parseConfig<T extends z.ZodType>(path: string, schema: z.input<T>): z.output<T>
// export declare function parseConfig<T extends z.ZodTypeAny>(path: string, schema: T): T
//   let rawString: string;
//   let obj: unknown;

//   try {
//     rawString = fs.readFileSync(path, "utf-8");
//   } catch (e: unknown) {
//     throw new Error(`Could not read config file at ${path}`);
//   }

//   try {
//     obj = JSON.parse(rawString) as unknown;
//   } catch (e: unknown) {
//     throw new Error(`Could not parse config file at ${path}`);
//   }

//   const result = schema.safeParse(obj);

//   if (!result.success) {
//     throw new Error("Invalid config file");
//   }

//   return result.data;
// }
