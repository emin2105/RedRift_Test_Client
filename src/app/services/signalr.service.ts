import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";
@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection | undefined;

  public startConnection = () => {
    console.log("starting connection");
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7124/gameroom')
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  public EnterTheRoom(userId: string, roomId: string) {
    this.hubConnection?.invoke("Enter", userId, roomId);
  }

  public addListener = (listener: Function) => {
    if (this.hubConnection)
      this.hubConnection.on('Receive', (data) => {
        listener(data);
        console.log(data);
      });
  }
}
