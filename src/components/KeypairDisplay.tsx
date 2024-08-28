import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

interface KeyPairDisplayProps {
  keyPair: { publicKey: string; privateKey: string } | null;
}

export const KeyPairDisplay: React.FC<KeyPairDisplayProps> = ({ keyPair }) => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  if (!keyPair) return null;

  return (
    <div className={styles.keyPairDisplay}>
      <h2>Key Pair</h2>
      <div className={styles.keyInfo}>
        <p>
          <strong className={styles.publicKey}>Public Key:</strong>
          <span className={styles.keyValue}>{keyPair.publicKey}</span>
        </p>
        <p>
          <strong className={styles.privateKey}>Private Key:</strong>
          {showPrivateKey ? (
            <span className={styles.keyValue}>{keyPair.privateKey}</span>
          ) : (
            <span className={styles.keyValue}>••••••••••••••••</span>
          )}
          <button
            onClick={() => setShowPrivateKey(!showPrivateKey)}
            className={`${styles.button} ${styles.toggleButton}`}
          >
            {showPrivateKey ? 'Hide' : 'Show'}
          </button>
        </p>
      </div>
    </div>
  );
};