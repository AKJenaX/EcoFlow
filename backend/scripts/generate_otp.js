import speakeasy from 'speakeasy';

const secret = process.argv[2];
if (!secret) {
  console.error('Please provide a secret key as an argument.');
  process.exit(1);
}

const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log(token);
