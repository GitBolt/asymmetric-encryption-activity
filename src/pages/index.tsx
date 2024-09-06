import { useState, useEffect } from 'react';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';
import styles from '@/styles/Home.module.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const encode = (message: string) => {
  const encoder = new TextEncoder();
  const messageUint8 = encoder.encode(message);
  return messageUint8;
};

const decode = (data: Uint8Array) => {
  const decoder = new TextDecoder();
  const decodedMessage = decoder.decode(data);
  return decodedMessage;
};

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

interface State {
  keyPair: KeyPair | null;
  message: string;
  encryptedMessage: string;
  decryptedMessage: string;
  signature: string;
  verificationResult: boolean | null;
  nonce: string;
}

export default function Home() {
  const [state, setState] = useState<State>({
    keyPair: null,
    message: '',
    encryptedMessage: '',
    decryptedMessage: '',
    signature: '',
    verificationResult: null,
    nonce: '',
  });
  const [sessionId, setSessionId] = useState<string>('');
  const [customSessionId, setCustomSessionId] = useState<string>('');
  const [inputEncryptedMessage, setInputEncryptedMessage] = useState('');
  const [inputSignature, setInputSignature] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = Math.floor(Math.random() * 10).toString();
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const pollInterval = setInterval(async () => {
      const response = await fetch(`/api/state?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.keyPair) {
        setState(prevState => ({ ...prevState, keyPair: data.keyPair }));
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [sessionId]);

  const updateState = async (newState: Partial<State>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  
    if (newState.keyPair) {
      await fetch(`/api/state?sessionId=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyPair: newState.keyPair }),
      });
    }
  };

  const generateKeyPair = async () => {
    const kp = new Keypair();
    updateState({ keyPair: {
      publicKey: kp.publicKey.toBase58(),
      privateKey: bs58.encode(kp.secretKey),
    } });
  };

  const generateNonce = () => {
    return nacl.randomBytes(nacl.box.nonceLength);
  };

  const encryptMessage = () => {
    if (!state.keyPair) return;
    const nonce = generateNonce();
    const curve25519PrivateKey = ed2curve.convertSecretKey(bs58.decode(state.keyPair.privateKey));
    const curve25519PublicKey = ed2curve.convertPublicKey(bs58.decode(state.keyPair.publicKey));
    if (!curve25519PublicKey) return
    const messageUint8 = encode(state.message);
    const encrypted = nacl.box(messageUint8, nonce, curve25519PublicKey, curve25519PrivateKey);
    
    const encryptedWithNonce = new Uint8Array(nonce.length + encrypted.length);
    encryptedWithNonce.set(nonce);
    encryptedWithNonce.set(encrypted, nonce.length);
    
    updateState({ 
      encryptedMessage: bs58.encode(encryptedWithNonce),
      nonce: bs58.encode(nonce)
    });
  };

  const decryptMessage = () => {
    if (!state.keyPair) return;
    const curve25519PrivateKey = ed2curve.convertSecretKey(bs58.decode(state.keyPair.privateKey));
    const curve25519PublicKey = ed2curve.convertPublicKey(bs58.decode(state.keyPair.publicKey));

    if (!curve25519PublicKey) return;
    
    const decodedMessage = bs58.decode(inputEncryptedMessage);
    if (decodedMessage.length <= nacl.box.nonceLength) {
      updateState({ decryptedMessage: 'Invalid encrypted message' });
      setIsModalOpen(true);
      return;
    }

    const nonce = decodedMessage.slice(0, nacl.box.nonceLength);
    const encryptedData = decodedMessage.slice(nacl.box.nonceLength);

    const decrypted = nacl.box.open(
      encryptedData,
      nonce,
      curve25519PublicKey,
      curve25519PrivateKey
    );
    
    if (decrypted) {
      updateState({ decryptedMessage: decode(decrypted) });
      setIsModalOpen(true);
    } else {
      updateState({ decryptedMessage: 'Decryption failed' });
      setIsModalOpen(true);
    }
  };

  const signMessage = () => {
    if (!state.keyPair) return;
    const encodedMessage = encode(state.message);
    const signature = nacl.sign.detached(encodedMessage, bs58.decode(state.keyPair.privateKey));
    updateState({ signature: bs58.encode(signature) });
  };

  const verifySignature = () => {
    if (!state.keyPair) return;
    const encodedMessage = encode(state.message);
    const verified = nacl.sign.detached.verify(
      encodedMessage,
      bs58.decode(inputSignature),
      bs58.decode(state.keyPair.publicKey)
    );
    updateState({ verificationResult: verified });
  };

  const joinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSessionId) {
      setSessionId(customSessionId);
    }
  };

  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handleCopy = (text: string) => {
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Asymmetric Encryption Demo</h1>
      
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h2>Keypair</h2>
            <button onClick={generateKeyPair} className={styles.button}>
              Generate New Key Pair
            </button>
            <div className={styles.keyInfo}>
              <p>
                <strong className={styles.publicKey}>Public Key:</strong>
                <span className={styles.keyValue}>{state.keyPair?.publicKey}</span>
              </p>
              <p>
                <strong className={styles.privateKey}>Private Key:</strong>
                <span className={styles.keyValue}>
                  {showPrivateKey ? state.keyPair?.privateKey : '•••••••••••••••••••••••••••••••••••••••••••••••••'}
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className={`${styles.button} ${styles.toggleButton}`}
                  >
                    {showPrivateKey ? 'Hide' : 'Show'}
                  </button>
                </span>
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Session</h2>
            <div className={styles.currentSession}>
              <h3>Current Session ID:</h3>
              <p className={styles.sessionId}>{sessionId}</p>
            </div>
            <form onSubmit={joinSession} className={styles.joinSessionForm}>
              <input
                type="text"
                value={customSessionId}
                onChange={(e) => setCustomSessionId(e.target.value)}
                placeholder="Enter single digit session ID"
                className={styles.input}
                maxLength={1}
                pattern="\d"
              />
              <button type="submit" className={`${styles.button} ${styles.joinButton}`}>
                Join Session
              </button>
            </form>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h2>Encryption / Decryption / Signature</h2>
            <input
              type="text"
              value={state.message}
              onChange={(e) => updateState({ message: e.target.value })}
              placeholder="Enter message"
              className={styles.input}
            />
            <div className={styles.buttonGroup}>
              <button onClick={encryptMessage} className={`${styles.button} ${styles.encryptButton}`}>Encrypt</button>
              <button onClick={signMessage} className={`${styles.button} ${styles.signButton}`}>Sign</button>
            </div>
            {state.encryptedMessage && (
              <div className={styles.resultBox}>
                <strong>Encrypted Message:</strong>
                <p className={styles.cryptoOutput}>{state.encryptedMessage}</p>
                <CopyToClipboard text={state.encryptedMessage} onCopy={() => handleCopy('encryptedMessage')}>
                  <button className={styles.copyButton}>
                    {copiedText === 'encryptedMessage' ? 'Copied!' : 'Copy'}
                  </button>
                </CopyToClipboard>
              </div>
            )}
            {state.signature && (
              <div className={styles.resultBox}>
                <strong>Signature:</strong>
                <p className={styles.cryptoOutput}>{state.signature}</p>
                <CopyToClipboard text={state.signature} onCopy={() => handleCopy('signature')}>
                  <button className={styles.copyButton}>
                    {copiedText === 'signature' ? 'Copied!' : 'Copy'}
                  </button>
                </CopyToClipboard>
              </div>
            )}
            <input
              type="text"
              value={inputEncryptedMessage}
              onChange={(e) => setInputEncryptedMessage(e.target.value)}
              placeholder="Enter encrypted message to decrypt"
              className={styles.input}
            />
            <button onClick={decryptMessage} className={`${styles.button} ${styles.decryptButton}`}>Decrypt</button>
            <input
              type="text"
              value={inputSignature}
              onChange={(e) => setInputSignature(e.target.value)}
              placeholder="Enter signature to verify"
              className={styles.input}
            />
            <button onClick={verifySignature} className={`${styles.button} ${styles.verifyButton}`}>Verify Signature</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Decrypted Message</h2>
            <p className={styles.decryptedMessage}>{state.decryptedMessage}</p>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {state.verificationResult !== null && (
        <div className={styles.verificationResultBox}>
          <h2>Signature Verification Result:</h2>
          <p className={state.verificationResult ? styles.validResult : styles.invalidResult}>
            {state.verificationResult ? 'Valid' : 'Invalid'}
          </p>
        </div>
      )}
    </div>
  );
}