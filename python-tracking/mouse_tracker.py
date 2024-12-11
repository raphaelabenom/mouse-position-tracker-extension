import pyautogui
import sqlite3
from pynput import keyboard
from datetime import datetime
import queue
import threading

# Fila para armazenar as posições do mouse
position_queue = queue.Queue()

# Conectar ao banco de dados
conn = sqlite3.connect('mouse_positions.db', check_same_thread=False)
c = conn.cursor()

# Criar tabela se não existir
c.execute('''CREATE TABLE IF NOT EXISTS positions
             (x INTEGER, y INTEGER, timestamp TEXT)''')

def save_position():
    while True:
        position = position_queue.get()
        if position is None:
            break
        c.execute("INSERT INTO positions VALUES (?, ?, ?)", position)
        conn.commit()
        print(f"Posição salva: {position[0]}, {position[1]} at {position[2]}")

# Iniciar thread para salvar posições
save_thread = threading.Thread(target=save_position)
save_thread.start()

def on_press(key):
    try:
        if key == keyboard.Key.f8:  # Pressione F8 para salvar a posição
            x, y = pyautogui.position()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            position_queue.put((x, y, timestamp))
    except AttributeError:
        pass

# Configurar o listener do teclado
with keyboard.Listener(on_press=on_press) as listener:
    print("Pressione F8 para salvar a posição do mouse. Pressione Ctrl+C para sair.")
    try:
        listener.join()
    except KeyboardInterrupt:
        pass

# Sinalizar para a thread de salvamento parar
position_queue.put(None)
save_thread.join()

# Fechar a conexão com o banco de dados quando o programa for encerrado
conn.close()