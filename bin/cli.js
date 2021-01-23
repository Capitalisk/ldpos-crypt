#!/usr/bin/env node

const crypto = require('crypto');
const CIPHER_ALGORITHM = 'aes-192-cbc';
const CIPHER_IV = Buffer.alloc(16, 0);

let command = process.argv[2];
let password = process.argv[3];
let tooManyArguments = !!process.argv[5];

function logUsage() {
  console.log('Usage:');
  console.log('  ldpos-crypt encrypt "password" "plaintext"');
  console.log('  ldpos-crypt decrypt "password" "ciphertext"');
}

if (tooManyArguments) {
  console.error('Too many arguments provided.');
  logUsage();
  process.exit(1);
}

if (!command) {
  logUsage();
  process.exit(0);
}

if (command === 'encrypt') {
  let plaintext = process.argv[4];
  if (!password || !plaintext) {
    console.error('Too few arguments provided.');
    logUsage();
    process.exit(1);
  }

  let key = crypto.scryptSync(password, 'salt', 24);
  let iv = Buffer.alloc(16, 0);
  let cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  console.log(encrypted);
} else if (command === 'decrypt') {
  let ciphertext = process.argv[4];
  let decrypted;
  try {
    let cipherKey = password ? crypto.scryptSync(password, 'salt', 24) : undefined;
    let decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, cipherKey, CIPHER_IV);
    decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
  } catch (error) {
    console.error('Failed to decrypt ciphertext. Check that password and ciphertext are correct.');
    process.exit(1);
  }

  console.log(decrypted);
} else {
  console.error(`Command ${command} was invalid`);
}
