"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__pass__ = exports.__user__ = exports.__port__ = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV === 'production';
exports.__port__ = process.env.APP_PORT;
exports.__user__ = process.env.DB_USER;
exports.__pass__ = process.env.DB_PASS;
//# sourceMappingURL=constants.js.map