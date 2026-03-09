// app/services/signalr/connection.ts
import * as signalR from "@microsoft/signalr";
import { storage } from "../../lib/storage.ts";

let connection: signalR.HubConnection | null = null;

export const getConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/hubs/directMessage`, {
        accessTokenFactory: () => storage.getToken() ?? "",
      })
      .withAutomaticReconnect()
      .build();
  }
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
