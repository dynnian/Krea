import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const getConnection = (token: string) => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/chat", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
  }
  return connection;
};

export const startConnection = async (token: string) => {
  const conn = getConnection(token);
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
  return conn;
};

export const stopConnection = async () => {
  if (
    connection &&
    connection.state !== signalR.HubConnectionState.Disconnected
  ) {
    await connection.stop();
    connection = null;
  }
};
