export const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID || 'default-workflow-id';

export function createClientSecretFetcher(workflowId: string) {
  return async () => {
    try {
      const response = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflowId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client secret');
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('[v0] ChatKit session error:', error);
      throw error;
    }
  };
}
