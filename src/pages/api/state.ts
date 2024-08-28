import { NextApiRequest, NextApiResponse } from 'next';

interface SharedState {
  keyPair: { publicKey: string; privateKey: string } | null;
}

let sharedStates: { [key: string]: SharedState } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req;
  const sessionId = query.sessionId as string;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  switch (method) {
    case 'GET':
      res.status(200).json({ keyPair: sharedStates[sessionId]?.keyPair || null });
      break;
    case 'POST':
      if (body.keyPair) {
        sharedStates[sessionId] = { 
          ...sharedStates[sessionId],
          keyPair: body.keyPair 
        };
        res.status(200).json({ keyPair: sharedStates[sessionId].keyPair });
      } else {
        res.status(400).json({ error: 'Invalid request body' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}