import forge from 'node-forge';

export const encryptVoteSelection = (candidateId, publicKeyPem) => {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encrypted = publicKey.encrypt(candidateId.toString(), 'RSA-OAEP', {
      md: forge.md.sha1.create(),
      mgf1: {
        md: forge.md.sha1.create()
      }
    });
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error("Encryption failed", error);
    throw new Error("Failed to encrypt vote securely.");
  }
};
