import './simple-chat.css';

export default class SimpleChat {
  constructor() {
    this.create();
    
    this.addMessage({
      message: 'Bienvenido al Simple Chat!',
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
  }

  addMessage(data) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'chat-message';
    this.history.appendChild(messageContainer);

    if (data.type === 'system') {
      messageContainer.classList.add('chat-message-system');
    } else if (data.isMine) {
      messageContainer.classList.add('chat-message-mine');
    } else {
      messageContainer.classList.add('chat-message-not-mine');
    }

    const user = document.createElement('div');
    user.className = 'chat-message-user';
    user.innerText = data.user || 'Anonimo';
    messageContainer.appendChild(user);

    const message = document.createElement('div');
    message.className = 'chat-message-text';
    message.innerText = data.message;
    messageContainer.appendChild(message);

    const timestamp = document.createElement('div');
    timestamp.className = 'chat-message-timestamp';
    const time = new Date(data.timestamp || Date.now());
    timestamp.innerText = time.toLocaleTimeString();
    messageContainer.appendChild(timestamp);

    this.history.scrollTop = this.history.scrollHeight;
  }

  newMessage(evt) {
    evt.preventDefault();
    const message = this.input.value.trim();
    if (!message)
      return; 

    this.addMessage({ message, isMine: true, user: 'Yo', timestamp: Date.now() });
    this.input.value = '';
  }
}