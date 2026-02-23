import './simple-chat.css';

export default class SimpleChat {
  username = 'Anonimo';

  constructor() {
    this.create();
    
    this.addMessage({
      message: '¡Bienvenido al Simple Chat!',
      type: 'system',
      timestamp: Date.now()
    });
  }

  create() {
    this.container ||= document.getElementById('simpleChatContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'simpleChatContainer';
      document.body.appendChild(this.container);
    }

    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Carlito&display=swap');
    document.head.appendChild(linkElem);

    this.userButton = document.createElement('img');
    this.userButton.className = 'chatButton user';
    this.userButton.src = './user.svg';
    this.userButton.alt = 'Cambiar Nombre';
    this.container.appendChild(this.userButton);

    this.connectionButton = document.createElement('img');
    this.connectionButton.className = 'chatButton connection';
    this.connectionButton.src = './disconnected.svg';
    this.connectionButton.alt = 'Estado de Conexión';
    this.container.appendChild(this.connectionButton);

    this.history ||= document.createElement('div');
    this.history.id = 'chatHistory';
    this.container.appendChild(this.history);

    this.inputArea ||= document.createElement('form');
    this.inputArea.id = 'chatInputArea';
    this.container.appendChild(this.inputArea);
    this.inputArea.addEventListener('submit', evt => this.newMessage(evt));

    this.input ||= document.createElement('input');
    this.input.type = 'text';
    this.input.id = 'chatInput';
    this.inputArea.appendChild(this.input);

    this.sendButton ||= document.createElement('button');
    this.sendButton.id = 'chatSendButton';
    this.sendButton.innerText = 'Enviar';
    this.inputArea.appendChild(this.sendButton);

    this.settingsDialog ||= document.createElement('dialog');
    this.settingsDialog.className = 'chatSettingsDialog';
    this.container.appendChild(this.settingsDialog);
    this.settingsDialog.innerHTML = 
      `<form method="dialog">
        <h3>Configuración de Usuario</h3>
        <label for="chatUserNameInput">Nombre de Usuario:</label>
        <input type="text" id="chatUserNameInput" name="chatUserNameInput" />
        <button type="submit">Guardar</button>
        <button type="button" onclick="this.closest('dialog').close()">Cancelar</button>
      </form>`;

    this.userButton.addEventListener('click', () => this.showUserDialog());
    this.settingsDialog.querySelector('form').addEventListener('submit', evt => {
      this.username = this.settingsDialog.querySelector('#chatUserNameInput').value.trim() || 'Anonimo';
      this.ws?.send(JSON.stringify({
        command: 'user',
        message: this.username,
      }));
    });

    this.connectionButton.addEventListener('click', () => {
      if (this.ws) {
        this.disconnect();
      } else {
        this.connect();
      }
    });
  }

  showUserDialog() {
    this.settingsDialog.querySelector('#chatUserNameInput').value = this.username;
    this.settingsDialog.showModal();
  }

  addMessage(data) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'chat-message';
    this.history.appendChild(messageContainer);

    if (data.type === 'system' || data.type === 'user') {
      messageContainer.classList.add('chat-message-system');
    } else if (data.isMine) {
      messageContainer.classList.add('chat-message-mine');
    } else {
      messageContainer.classList.add('chat-message-not-mine');
    }

    const user = document.createElement('div');
    user.className = 'chat-message-user';
    user.innerText = data.user || data.User || 'Anonimo';
    messageContainer.appendChild(user);

    const message = document.createElement('div');
    message.className = 'chat-message-text';
    message.innerText = data.message || data.Message;
    messageContainer.appendChild(message);

    const timestamp = document.createElement('div');
    timestamp.className = 'chat-message-timestamp';
    const time = new Date(data.timestamp || data.dateTime || Date.now());
    timestamp.innerText = time.toLocaleTimeString();
    messageContainer.appendChild(timestamp);

    this.history.scrollTop = this.history.scrollHeight;
  }

  addSystemMessage(message) {
    this.addMessage({ message, type: 'system', timestamp: Date.now() });
  }

  newMessage(evt) {
    evt.preventDefault();
    const message = this.input.value.trim();
    if (!message)
      return;

    this.ws?.send(JSON.stringify({
      command: 'message',
      message,
    }));

    this.addMessage({ message, isMine: true, user: 'Yo', timestamp: Date.now() });
    this.input.value = '';
  }

  connect() {
    this.disconnect();

    this.ws = new WebSocket('wss://localhost:7241/ws/chat');
    this.ws.addEventListener('open', () => {
      this.history.innerHTML = '';
      this.connectionButton.src = './connected.svg';
      this.connectionButton.alt = 'Conectado';
      this.addSystemMessage('Conectado');
    });
    this.ws.addEventListener('close', evt => {
      this.ws = null;
      this.connectionButton.src = './disconnected.svg';
      this.connectionButton.alt = 'Desconectado';
      this.addSystemMessage(`Desconectado`);
    });
    this.ws.addEventListener('message', evt => this.addMessage(JSON.parse(evt.data)));
    this.ws.addEventListener('error', evt => this.addSystemMessage(`Error de conexión: ${evt.message || 'Desconocido'}`));
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.ws = null;
  }
}