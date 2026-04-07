import jwt from 'jsonwebtoken';

const secret = 'your-super-secret-jwt-token-with-at-least-32-characters-long';

const anonPayload = {
    role: 'anon',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
};

const servicePayload = {
    role: 'service_role',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
};

const anonToken = jwt.sign(anonPayload, secret, { algorithm: 'HS256' });
const serviceToken = jwt.sign(servicePayload, secret, { algorithm: 'HS256' });

console.log("ANON_KEY=" + anonToken);
console.log("SERVICE_ROLE_KEY=" + serviceToken);
