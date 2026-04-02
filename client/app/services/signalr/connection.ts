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
          return token ?? "";
        },
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
