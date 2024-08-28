import React from 'react';
import styles from '../styles/Home.module.css';

interface EncryptionSectionProps {
  message: string;
  setMessage: (message: string) => void;
  encryptMessage: () => void;
  decryptMessage: () => void;
  encryptedMessage: string;
  decryptedMessage: string;
}

export const EncryptionSection: React.FC<EncryptionSectionProps> = ({
  message,
  setMessage,
  encryptMessage,
  decryptMessage,
  encryptedMessage,
  decryptedMessage,
}) => {
  return (
    <div className={styles.card}>
      <h2>Encryption / Decryption</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
        className={styles.input}
      />
      <div className={styles.buttonGroup}>
        <button onClick={encryptMessage} className={`${styles.button} ${styles.encryptButton}`}>
          Encrypt
        </button>
        <button onClick={decryptMessage} className={`${styles.button} ${styles.decryptButton}`}>
          Decrypt
        </button>
      </div>
      {encryptedMessage && (
        <div className={styles.resultBox}>
          <strong className={styles.encryptedLabel}>Encrypted:</strong>
          <p className={styles.cryptoOutput}>{encryptedMessage.slice(0, 50)}...</p>
        </div>
      )}
      {decryptedMessage && (
        <div className={styles.resultBox}>
          <strong className={styles.decryptedLabel}>Decrypted:</strong>
          <p className={styles.cryptoOutput}>{decryptedMessage}</p>
        </div>
      )}
    </div>
  );
};