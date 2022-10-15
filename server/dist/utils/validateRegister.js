"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (!options.email.includes('@')) {
        return [{
                field: 'email',
                message: 'Invalid email'
            }];
    }
    if (options.login.length <= 2) {
        return [{
                field: 'login',
                message: 'Username length must be greater than 2.'
            }];
    }
    if (options.login.includes('@')) {
        return [{
                field: 'login',
                message: 'Prohibited symbol'
            }];
    }
    if (options.password.length <= 4) {
        return [{
                field: 'password',
                message: 'Password length must be greater than 4.'
            }];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map