document.addEventListener('DOMContentLoaded', function() {
    // Ключи для localStorage
    const MESSAGES_KEY = 'minitwitter_messages';
    const CURRENT_USER_KEY = 'minitwitter_current_user';
    
    // Элементы DOM
    const messageForm = document.getElementById('messageForm');
    const messagesBody = document.getElementById('messagesBody');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const charCount = document.getElementById('charCount');
    const messageInput = document.getElementById('message');
    const totalMessagesEl = document.getElementById('totalMessages');
    const myMessagesEl = document.getElementById('myMessages');
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    const changeUserBtn = document.getElementById('changeUserBtn');
    const userModal = document.getElementById('userModal');
    const newUsernameInput = document.getElementById('newUsername');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    
    // Текущий пользователь (по умолчанию "Гость")
    let currentUser = localStorage.getItem(CURRENT_USER_KEY) || 'Гость';
    
    // ==================== ФУНКЦИИ ====================
    
    // Получить все сообщения
    function getMessages() {
        const messages = localStorage.getItem(MESSAGES_KEY);
        return messages ? JSON.parse(messages) : [];
    }
    
    // Сохранить сообщения
    function saveMessages(messages) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
    
    // Добавить сообщение
    function addMessage(username, text) {
        const messages = getMessages();
        const newMessage = {
            id: Date.now(),
            username: username,
            text: text,
            timestamp: new Date().toLocaleString(),
            userToken: currentUser
        };
        messages.unshift(newMessage); // Добавляем в начало
        saveMessages(messages);
        renderMessages();
    }
    
    // Удалить сообщение
    function deleteMessage(id) {
        const messages = getMessages();
        const filtered = messages.filter(msg => msg.id !== id);
        saveMessages(filtered);
        renderMessages();
    }
    
    // Удалить все сообщения текущего пользователя
    function deleteMyMessages() {
        if (confirm('Удалить все ваши сообщения?')) {
            const messages = getMessages();
            const filtered = messages.filter(msg => msg.userToken !== currentUser);
            saveMessages(filtered);
            renderMessages();
        }
    }
    
    // Отобразить сообщения
    function renderMessages(filter = '') {
        const messages = getMessages();
        const filtered = filter 
            ? messages.filter(msg => 
                msg.text.toLowerCase().includes(filter.toLowerCase()) ||
                msg.username.toLowerCase().includes(filter.toLowerCase()))
            : messages;
        
        // Обновить статистику
        const myMessagesCount = messages.filter(msg => msg.userToken === currentUser).length;
        totalMessagesEl.textContent = messages.length;
        myMessagesEl.textContent = myMessagesCount;
        
        // Очистить таблицу
        messagesBody.innerHTML = '';
        
        if (filtered.length === 0) {
            messagesBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="4">
                        ${filter ? 'Сообщения не найдены' : 'Пока нет сообщений. Будьте первым!'}
                    </td>
                </tr>
            `;
            return;
        }
        
        // Добавить сообщения в таблицу
        filtered.forEach(msg => {
            const isMyMessage = msg.userToken === currentUser;
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <strong>${msg.username}</strong>
                    ${isMyMessage ? '<span style="color: #6a5acd; font-size: 0.9em;"> (Вы)</span>' : ''}
                </td>
                <td>${msg.text}</td>
                <td>${msg.timestamp}</td>
                <td>
                    <button class="delete-btn" 
                            onclick="deleteMessage(${msg.id})"
                            ${!isMyMessage ? 'disabled title="Можно удалять только свои сообщения"' : ''}>
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>
            `;
            
            messagesBody.appendChild(row);
        });
    }
    
    // Обновить имя пользователя
    function updateUsername(newName) {
        if (!newName.trim()) {
            alert('Имя не может быть пустым!');
            return;
        }
        
        currentUser = newName.trim();
        localStorage.setItem(CURRENT_USER_KEY, currentUser);
        currentUserDisplay.textContent = currentUser;
        userModal.style.display = 'none';
        renderMessages();
    }
    
    // ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
    
    // Отправка формы
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Валидация
        let hasError = false;
        
        if (!username) {
            document.getElementById('usernameError').textContent = 'Введите имя';
            hasError = true;
        } else {
            document.getElementById('usernameError').textContent = '';
        }
        
        if (!message) {
            document.getElementById('messageError').textContent = 'Введите сообщение';
            hasError = true;
        } else if (message.length > 280) {
            document.getElementById('messageError').textContent = 'Сообщение слишком длинное';
            hasError = true;
        } else {
            document.getElementById('messageError').textContent = '';
        }
        
        if (!hasError) {
            addMessage(username, message);
            messageForm.reset();
            charCount.textContent = '0';
        }
    });
    
    // Счетчик символов
    messageInput.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 250) {
            charCount.style.color = '#ff3333';
        } else if (count > 200) {
            charCount.style.color = '#ff9900';
        } else {
            charCount.style.color = '#666';
        }
    });
    
    // Поиск
    searchInput.addEventListener('input', function() {
        renderMessages(this.value);
    });
    
    // Очистка сообщений
    clearBtn.addEventListener('click', deleteMyMessages);
    
    // Смена пользователя
    changeUserBtn.addEventListener('click', function() {
        newUsernameInput.value = currentUser;
        userModal.style.display = 'flex';
    });
    
    saveUserBtn.addEventListener('click', function() {
        updateUsername(newUsernameInput.value);
    });
    
    cancelUserBtn.addEventListener('click', function() {
        userModal.style.display = 'none';
    });
    
    // Закрыть модальное окно при клике вне его
    window.addEventListener('click', function(e) {
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
    });
    
    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    
    // Установить текущего пользователя
    currentUserDisplay.textContent = currentUser;
    
    // Загрузить сообщения
    renderMessages();
    
    // Сделать функцию deleteMessage глобально доступной
    window.deleteMessage = deleteMessage;
    
    console.log('Минитвитер запущен! Текущий пользователь:', currentUser);
});
