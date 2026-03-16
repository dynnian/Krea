import * as signalR from "@microsoft/signalr";
import { storage } from "../../lib/storage.ts";

let connection: signalR.HubConnection | null = null;

const hubUrl = import.meta.env.VITE_HUB_BASE_URL;

export const getConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          const token = storage.getToken();
          console.log('🔑 SignalR accessTokenFactory returning:', token ? 'token present' : 'NO TOKEN');
          return token ?? "";
        },
      })
      .withAutomaticReconnect()
      .build();
  }
  console.log("Getting SignalR connection",hubUrl, connection);
  return connection;
};

export const startConnection = async () => {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
    console.log("SignalR connected");
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
