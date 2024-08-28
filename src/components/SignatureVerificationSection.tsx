import React from 'react';
import styles from '../styles/Home.module.css';

interface SignatureVerificationSectionProps {
  publicKey: string | undefined;
  message: string;
  setMessage: (message: string) => void;
  signature: string;
  verificationResult: boolean | null;
  signMessage: () => void;
  verifySignature: () => void;
}

export const SignatureVerificationSection: React.FC<SignatureVerificationSectionProps> = ({
  publicKey,
  message,
  setMessage,
  signature,
  verificationResult,
  signMessage,
  verifySignature
}) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.subtitle}>Signature Verification</h2>
      <p className={styles.publicKeyDisplay}>Public Key: {publicKey}</p>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter the message to sign"
        className={styles.input}
      />
      <div className={styles.buttonGroup}>
        <button onClick={signMessage} className={`${styles.button} ${styles.signButton}`}>
          Sign Message
        </button>
        <button onClick={verifySignature} className={`${styles.button} ${styles.verifyButton}`}>
          Verify Signature
        </button>
      </div>
      {signature && (
        <div className={styles.resultBox}>
          <strong>Signature:</strong>
          <p className={styles.signature}>{signature}</p>
        </div>
      )}
      {verificationResult !== null && (
        <div className={styles.resultBox}>
          <strong className={styles.verificationLabel}>Verification Result:</strong>
          <p className={verificationResult ? styles.validResult : styles.invalidResult}>
            {verificationResult ? 'Valid' : 'Invalid'}
          </p>
        </div>
      )}
    </div>
  );
};