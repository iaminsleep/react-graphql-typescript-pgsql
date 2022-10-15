import { EmailPasswordInput } from "./EmailPasswordInput"

export const validateRegister = (options: EmailPasswordInput) => {
    // email field validation
    if(!options.email.includes('@')) { 
        return [{ 
            field: 'email', 
            message: 'Invalid email'
        }];
    }

    // username field validation
    if(options.login.length <= 2) { 
        return [{ 
            field: 'login', 
            message: 'Username length must be greater than 2.'
        }];
    }

    // username not containing @ validation
    if(options.login.includes('@')) { 
        return [{ 
            field: 'login', 
            message: 'Prohibited symbol'
        }];
    }

    // password field validation
    if(options.password.length <= 4) { 
        return [{ 
            field: 'password', 
            message: 'Password length must be greater than 4.'
        }];
    }

    return null; // to be consistent return null if neither of situations happen
}