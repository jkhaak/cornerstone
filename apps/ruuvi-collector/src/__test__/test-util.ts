import { exhausted } from "../model/utils";

export type TestValues<Input, Expected> = [Input, Expected];

export type TestValuesBuffer = TestValues<Buffer, number>;
export type TestValuesHex = TestValues<string, number>;
export type TestValuesNumber = TestValues<number, number>;

export const inputNumberMethods = ["UInt8", "Int8", "UInt16BE"] as const;
export const inputStringMethods = ["hex"] as const;

function isInputNumberMethod(inputMethod: string): inputMethod is InputNumberMethod {
  return inputNumberMethods.includes(inputMethod as InputNumberMethod);
}

function isInputStringMethod(inputMethod: string): inputMethod is InputStringMethod {
  return inputStringMethods.includes(inputMethod as InputStringMethod);
}

export type InputNumberMethod = (typeof inputNumberMethods)[number];
export type InputStringMethod = (typeof inputStringMethods)[number];
export type InputTypes = InputNumberMethod | InputStringMethod;

export type InputConfigString = {
  readonly inputType: "string";
  readonly inputMethod: InputStringMethod;
};
export type InputConfigNumber = {
  readonly inputType: "number";
  readonly inputMethod: InputNumberMethod;
  readonly allocSize: number;
};
export type InputConfig = InputConfigString | InputConfigNumber;

export const testWith =
  <T>(fn: (b: Buffer) => T) =>
  ([input, expected]: TestValuesBuffer) => {
    expect(fn(input)).toBe(expected);
  };

export function createTestValues(inputMethod: InputStringMethod): InputConfigString;
export function createTestValues(inputMethod: InputNumberMethod): InputConfigNumber;
export function createTestValues(inputMethod: InputNumberMethod | InputStringMethod): InputConfig {
  if (isInputStringMethod(inputMethod)) {
    return {
      inputType: "string",
      inputMethod,
    };
  } else if (isInputNumberMethod(inputMethod)) {
    return {
      inputType: "number",
      inputMethod,
      allocSize: inputMethod === "UInt16BE" ? 2 : 1,
    };
  }
  throw new Error("exhausted input methods");
}

export function toBuffer(
  inputConfig: InputConfigNumber
): (tv: TestValues<number, number>) => TestValuesBuffer;
export function toBuffer(
  inputConfig: InputConfigString
): (tv: TestValues<string, number>) => TestValuesBuffer;
export function toBuffer(
  inputConfig: InputConfig
): (tv: TestValues<string | number, number>) => TestValuesBuffer {
  return ([input, expected]) => {
    if (inputConfig.inputType === "string" && typeof input === "string") {
      return [Buffer.from(input, "hex"), expected];
    }
    if (inputConfig.inputType === "number" && typeof input === "number") {
      const buf = Buffer.alloc(inputConfig.allocSize);
      switch (inputConfig.inputMethod) {
        case "Int8":
          buf.writeInt8(input);
          break;
        case "UInt8":
          buf.writeUInt8(input);
          break;
        case "UInt16BE":
          buf.writeUInt16BE(input);
          break;
        default:
          exhausted(inputConfig);
      }
      return [buf, expected];
    }
    throw new Error("inputConfig inputType exhausted");
  };
}
