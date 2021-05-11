module.exports = {
    writeCredential: writeCredential
    };

const fetch = require('node-fetch');
const jose = require('node-jose');

function checkStatus(response) {
    if (!response.ok) {
        throw Error('checkStatus: ' + response.status + ' ' + response.statusText);
    }
    return response;
}

async function decryptPayload(privateKey, payload) {
    const key = await jose.JWK.asKey(
        `-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`, 
        'pem', 
        {alg: "RSA-OAEP-256", enc: "A256GCM"}
    );
    const decrypt = await jose.JWE.createDecrypt(key).decrypt(payload);
    const result = decrypt.plaintext.toString();
    return result;
}

async function encryptPayload(publicKey, payload) {
    const key = await jose.JWK.asKey(
        `-----BEGIN PUBLIC KEY-----${publicKey}-----END PUBLIC KEY-----`, 
        'pem', 
        {alg: "RSA-OAEP-256"}
    );    
    const options = {
        contentAlg: 'A256GCM',
        compact: true,
        fields: {"iat": Math.round(new Date().getTime() / 1000)}
    };
    const result = await jose.JWE.createEncrypt(options, key).update(Buffer.from(payload, 'utf8')).final();
    return result;
}

function headers(binding, namespace, init) {
    const result = new fetch.Headers(init);
    result.set('Authorization', `Basic ${Buffer.from(`${binding.username}:${binding.password}`).toString('base64')}`);
    result.set('sapcp-credstore-namespace', namespace);
    return result;
}

async function fetchAndDecrypt(privateKey, url, method, headers, body) {
    const result = await fetch(url, {method, headers, body})
        .then(checkStatus)
        .then(response => response.text())
        .then(payload => decryptPayload(privateKey, payload))
        .then(JSON.parse);
    return result;
}

async function writeCredential(binding, namespace, type, credName, credValue, credUser = '') {
    let credential = {
        name: credName,
        value: credValue,
        username: credUser
    };
    return fetchAndDecrypt(
        binding.encryption.client_private_key,
        `${binding.url}/${type}`, 
        "post", 
        headers(binding, namespace, {"Content-Type": "application/jose"}), 
        await encryptPayload(binding.encryption.server_public_key, JSON.stringify(credential))
    );
}