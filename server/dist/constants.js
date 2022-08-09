"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORGET_PASSWORD_PREFIX = exports.COOKIE_NAME = exports.__port__ = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV === 'production';
exports.__port__ = process.env.APP_PORT;
exports.COOKIE_NAME = 'qid';
exports.FORGET_PASSWORD_PREFIX = 'forget-password:';
//# sourceMappingURL=constants.js.map