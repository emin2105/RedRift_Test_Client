import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignalrService } from './services/signalr.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  userName = "";
  userId = "";
  messageLog = "";
  roomId = "";
  errorMessage = "";
  isLoggedIn = false;
  insideRoom = false;
  gameRooms: any[] = [];

  title = 'redrift-test-client';

  constructor(private http: HttpClient, private signalRservice: SignalrService) { }

  ngOnInit() {
    console.log("init");
    if (localStorage.getItem("userId") != null) {
      this.userId = localStorage.getItem("userId") as string;
      this.userName = localStorage.getItem("userName") as string;
      console.log(this.isLoggedIn);
      this.isLoggedIn = true;
      this.loadRooms();
    }

    this.signalRservice.startConnection();
    this.signalRservice.addListener((data: string) => { this.messageLog += `\n${data}` });
  }

  login() {
    console.log(this.userName);

    this.http.post(`https://localhost:7124/api/User/create?name=${this.userName}`, {}).subscribe((response) => {

      console.log("login response " + response);
      this.userId = response.toString();
      localStorage.setItem("userId", this.userId);
      localStorage.setItem("userName", this.userName);
      this.isLoggedIn = true;
      this.loadRooms();
    });

  }

  loadRooms() {

    this.errorMessage = "";
    this.http.get<any[]>("https://localhost:7124/api/GameRoom/list").subscribe(response => this.gameRooms = response);
  }

  enterRoom(id: string) {
    this.errorMessage = "";
    console.log(id);
    this.http.post(`https://localhost:7124/api/GameRoom/join?userId=${this.userId}&roomId=${id}`, {}).subscribe({
      next: () => {
        this.signalRservice.EnterTheRoom(this.userId, id);
        this.insideRoom = true;
        this.roomId = id;
      },
      error: () => { this.errorMessage += "\nYou are not allowed to join\n" }
    });
  }

  exitRoom() {
    this.errorMessage = "";
    this.errorMessage = "";
    this.roomId = "";
    this.loadRooms();
    this.insideRoom = false;
  }

  createRoom() {
    this.errorMessage = "";
    let room = this.http.post(`https://localhost:7124/api/GameRoom/create?userId=${this.userId}`, {}).subscribe(
      response => {
        this.signalRservice.EnterTheRoom(this.userId, response.toString());
        this.insideRoom = true;
        this.roomId = response.toString();
      }
    )
  };

}
