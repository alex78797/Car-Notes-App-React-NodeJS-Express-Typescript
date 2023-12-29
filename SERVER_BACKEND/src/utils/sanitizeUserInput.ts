import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import validator from "validator";

/**
 * @param userInput
 * @returns A sanitized user input.
 */
export function sanitizeUserInput(userInput: string | object) {
  if (typeof userInput === "object") {
    for (const key in userInput) {
      if (typeof userInput[key] === "string") {
        const window = new JSDOM("").window;
        const purify = DOMPurify(window);
        const sanitizedInput: string = purify.sanitize(userInput[key]);
        const trimedInput: string = validator.trim(sanitizedInput);
        const escapedInput: string = validator.escape(trimedInput);
        const whitelistedInput: string = validator.blacklist(
          escapedInput,
          "\\[\\]"
        );
        userInput[key] = whitelistedInput;
      }
    }
  } else if (typeof userInput === "string") {
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    const sanitizedInput: string = purify.sanitize(userInput);
    const trimedInput: string = validator.trim(sanitizedInput);
    const escapedInput: string = validator.escape(trimedInput);
    const whitelistedInput: string = validator.blacklist(
      escapedInput,
      "\\[\\]"
    );
    userInput = whitelistedInput;
  }

  return userInput;
}
