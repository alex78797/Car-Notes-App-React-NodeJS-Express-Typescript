"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
// save the port number from the .env file
const port = process.env.PORT;
// some extra security
app.use((0, helmet_1.default)());
// needed to send/receive json to/from the client
app.use(express_1.default.json());
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map