export async function notifySocketServer(receiverId: string, message: unknown) {
  const socketServerUrl = process.env.SOCKET_SERVER_URL;
  const internalApiKey = process.env.INTERNAL_API_KEY || "chatify-internal-key";
  
  if (!socketServerUrl) {
    console.warn("SOCKET_SERVER_URL not configured, skipping real-time notification");
    return;
  }

  try {
    const response = await fetch(`${socketServerUrl}/notify`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Internal-API-Key": internalApiKey,
      },
      body: JSON.stringify({ receiverId, message }),
    });

    if (!response.ok) {
      console.error("Socket server responded with:", response.status);
    }
  } catch (error) {
    console.error("Failed to notify socket server:", error);
  }
}
