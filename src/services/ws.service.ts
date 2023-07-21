let socket: WebSocket;

let wsEndpoint = 'parami-realchar.azurewebsites.net';

const selectCharacter = () => {
  socket.send('1');
}

export const connectSocket = () => {
  // chatWindow.value = "";
  const clientId = Math.floor(Math.random() * 1010000);
  // var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
  const ws_scheme = "wss";
  const ws_path = ws_scheme + '://' + `${wsEndpoint}` + `/ws/${clientId}`;
  socket = new WebSocket(ws_path);
  socket.binaryType = 'arraybuffer';

  socket.onopen = (event) => {
    console.log("successfully connected");
    // connectMicrophone(audioDeviceSelection.value);
    // speechRecognition();
    socket.send("web"); // select web as the platform
  };

  socket.onmessage = (event) => {
    console.log('Message from server');
    if (typeof event.data === 'string') {
      const message = event.data;
      console.log('[message]', message);
      if (message.startsWith('Select')) {
        selectCharacter();
      } else if (message === '[end]\n') {
        // end
      } else if (message.startsWith('[+]')) {
        // [+] indicates the transcription is done. stop playing audio
        //   chatWindow.value += `\nYou> ${message}\n`;
        //   stopAudioPlayback();
      } else if (message.startsWith('[=]')) {
        //   // [=] indicates the response is done
        //   chatWindow.value += "\n\n";
        //   chatWindow.scrollTop = chatWindow.scrollHeight;
      } else {
        // message response
      }
      
    } else {  // binary data
      console.log('[binary data]', event.data);
      // if (!shouldPlayAudio) {
      //   return;
      // }
      // audioQueue.push(event.data);
      // if (audioQueue.length === 1) {
      //   playAudios();
      // }
    }
  };

  socket.onerror = (error) => {
    console.log(`WebSocket Error: `, error);
  };

  socket.onclose = (event) => {
    console.log("Socket closed");
  };
}