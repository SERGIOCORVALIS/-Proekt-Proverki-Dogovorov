#!/usr/bin/env python3
"""
Простой mock backend для демонстрации frontend функциональности
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import re
from datetime import datetime
import uuid

# Mock данные
users_db = {
    "test@example.com": {
        "id": 1,
        "email": "test@example.com",
        "full_name": "Тестовый Пользователь",
        "password": "password123",
        "is_active": True,
        "created_at": "2024-01-01T00:00:00"
    }
}

# Предзаполненные тестовые документы
documents_db = [
    {
        "id": 1,
        "filename": "document_1.pdf",
        "original_filename": "Договор поставки.pdf",
        "file_size": 2048000,
        "status": "analyzed",
        "user_id": 1,
        "created_at": "2024-10-14T10:00:00",
        "analysis_results": [
            {
                "id": 1,
                "risk_level": "high",
                "text_fragment": "без возврата",
                "explanation": "Условие о невозврате средств может быть незаконным",
                "confidence_score": 85
            },
            {
                "id": 2,
                "risk_level": "medium",
                "text_fragment": "срок действия договора не определен",
                "explanation": "Неопределенный срок договора может создавать неопределенность",
                "confidence_score": 70
            }
        ]
    },
    {
        "id": 2,
        "filename": "document_2.docx",
        "original_filename": "Соглашение о сотрудничестве.docx",
        "file_size": 1536000,
        "status": "analyzed",
        "user_id": 1,
        "created_at": "2024-10-14T11:30:00",
        "analysis_results": [
            {
                "id": 3,
                "risk_level": "low",
                "text_fragment": "форс-мажор не предусмотрен",
                "explanation": "Отсутствие форс-мажорных обстоятельств может быть рискованным",
                "confidence_score": 60
            }
        ]
    },
    {
        "id": 3,
        "filename": "document_3.doc",
        "original_filename": "Лицензионное соглашение.doc",
        "file_size": 896000,
        "status": "analyzed",
        "user_id": 1,
        "created_at": "2024-10-14T12:15:00",
        "analysis_results": [
            {
                "id": 4,
                "risk_level": "high",
                "text_fragment": "неограниченная ответственность",
                "explanation": "Условие о неограниченной ответственности может быть несправедливым",
                "confidence_score": 90
            },
            {
                "id": 5,
                "risk_level": "medium",
                "text_fragment": "односторонний отказ",
                "explanation": "Право одностороннего отказа может нарушать баланс интересов",
                "confidence_score": 75
            }
        ]
    },
    {
        "id": 4,
        "filename": "document_4.rtf",
        "original_filename": "Договор аренды.rtf",
        "file_size": 512000,
        "status": "analyzed",
        "user_id": 1,
        "created_at": "2024-10-14T13:00:00",
        "analysis_results": [
            {
                "id": 6,
                "risk_level": "low",
                "text_fragment": "автоматическое продление",
                "explanation": "Автоматическое продление договора требует дополнительного внимания",
                "confidence_score": 65
            }
        ]
    }
]
analysis_results_db = []

class MockAPIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Обработка CORS preflight запросов"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
    
    def send_cors_headers(self):
        """Отправка CORS заголовков для всех ответов"""
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def do_POST(self):
        """Обработка POST запросов"""
        if self.path.startswith('/auth/'):
            self.handle_auth_post()
        elif self.path.startswith('/documents/'):
            self.handle_documents_post()
        else:
            self.send_error_response(404, "Not found")
    
    def do_DELETE(self):
        """Обработка DELETE запросов"""
        print(f"DELETE request to: {self.path}")
        if self.path.startswith('/documents/'):
            self.handle_documents_delete()
        else:
            self.send_error_response(404, "Not found")

    def do_GET(self):
        """Обработка GET запросов"""
        print(f"GET request to: {self.path}")  # Отладочная информация
        if self.path.startswith('/auth/'):
            self.handle_auth_get()
        elif self.path.startswith('/documents'):
            self.handle_documents_get()
        elif self.path == '/health':
            self.send_json_response({"status": "healthy"})
        elif self.path == '/':
            self.send_json_response({
                "message": "Legal Document Analysis API",
                "version": "1.0.0"
            })
        else:
            print(f"404 for path: {self.path}")  # Отладочная информация
            self.send_error_response(404, "Not found")

    def handle_auth_post(self):
        """Обработка аутентификации"""
        if self.path == '/auth/login':
            self.handle_login()
        elif self.path == '/auth/register':
            self.handle_register()
        else:
            self.send_error_response(404, "Not found")

    def handle_login(self):
        """Обработка входа"""
        data = self.get_json_data()
        email = data.get('email')
        password = data.get('password')

        if email in users_db and users_db[email]['password'] == password:
            # Используем фиксированный токен для демонстрации
            token = "mock_token_demo_12345"
            self.send_json_response({
                "access_token": token,
                "token_type": "bearer"
            })
        else:
            self.send_error_response(401, "Incorrect email or password")

    def handle_register(self):
        """Обработка регистрации"""
        data = self.get_json_data()
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')

        if email in users_db:
            self.send_error_response(400, "Email already registered")

        user_id = len(users_db) + 1
        users_db[email] = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "password": password,
            "is_active": True,
            "created_at": datetime.now().isoformat()
        }

        self.send_json_response({
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "is_active": True,
            "created_at": users_db[email]['created_at']
        })

    def handle_auth_get(self):
        """Обработка GET запросов аутентификации"""
        if self.path == '/auth/me':
            self.handle_get_me()
        else:
            self.send_error_response(404, "Not found")

    def handle_get_me(self):
        """Получение информации о текущем пользователе"""
        auth_header = self.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            self.send_error_response(401, "Could not validate credentials")

        # Проверяем токен (для демонстрации принимаем любой Bearer токен)
        # Для демонстрации возвращаем тестового пользователя
        user = users_db["test@example.com"]
        self.send_json_response({
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "is_active": user["is_active"],
            "created_at": user["created_at"]
        })

    def handle_documents_post(self):
        """Обработка POST запросов документов"""
        if self.path == '/documents/upload':
            self.handle_document_upload()
        else:
            self.send_error_response(404, "Not found")
    
    def handle_documents_delete(self):
        """Обработка DELETE запросов документов"""
        # Проверяем авторизацию
        auth_header = self.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            self.send_error_response(401, "Could not validate credentials")
            return
        
        # Извлекаем ID документа из пути (например, /documents/123)
        if self.path.startswith('/documents/'):
            doc_id_str = self.path.split('/')[-1]
            try:
                doc_id = int(doc_id_str)
                if self.delete_document(doc_id):
                    self.send_json_response({"message": "Document deleted successfully"})
                else:
                    self.send_error_response(404, "Document not found")
            except ValueError:
                self.send_error_response(400, "Invalid document ID")
        else:
            self.send_error_response(404, "Not found")
    
    def delete_document(self, doc_id):
        """Удаление документа по ID"""
        global documents_db
        original_length = len(documents_db)
        documents_db = [doc for doc in documents_db if doc['id'] != doc_id]
        return len(documents_db) < original_length

    def handle_document_upload(self):
        """Обработка загрузки документа"""
        print("=== Document Upload Started ===")
        
        # Проверяем авторизацию (для демонстрации принимаем любой Bearer токен)
        auth_header = self.headers.get('Authorization', '')
        print(f"Auth header: {auth_header[:20]}...")
        if not auth_header.startswith('Bearer '):
            self.send_error_response(401, "Could not validate credentials")
            return
        
        # Получаем данные формы
        content_type = self.headers.get('Content-Type', '')
        print(f"Content-Type: {content_type}")
        if not content_type.startswith('multipart/form-data'):
            self.send_error_response(400, "Invalid content type")
            return
        
        # Читаем данные формы
        content_length = int(self.headers.get('Content-Length', 0))
        print(f"Content-Length: {content_length}")
        if content_length == 0:
            self.send_error_response(400, "No file uploaded")
            return
        
        # Проверяем размер файла (400MB)
        max_size = 400 * 1024 * 1024  # 400MB
        if content_length > max_size:
            self.send_error_response(400, f"Размер файла превышает 400MB. Размер файла: {content_length / (1024*1024):.1f}MB")
            return
        
        # Простое извлечение имени файла из multipart данных
        post_data = self.rfile.read(content_length).decode('utf-8', errors='ignore')
        print(f"Post data length: {len(post_data)}")
        
        # Ищем имя файла в данных
        filename = "uploaded_document.pdf"
        if 'filename=' in post_data:
            try:
                filename_start = post_data.find('filename="') + 10
                filename_end = post_data.find('"', filename_start)
                if filename_start > 9 and filename_end > filename_start:
                    filename = post_data[filename_start:filename_end]
                    print(f"Extracted filename: {filename}")
            except Exception as e:
                print(f"Error extracting filename: {e}")
                pass
        
        print(f"Final filename: {filename}")
        
        # Определяем расширение файла
        file_extension = filename.lower().split('.')[-1] if '.' in filename else 'pdf'
        print(f"File extension: {file_extension}")
        
        # Поддерживаемые форматы
        supported_formats = ['docx', 'pdf', 'doc', 'rtf', 'txt']
        if file_extension not in supported_formats:
            error_msg = f"Неподдерживаемый формат файла: .{file_extension}. Поддерживаются: {', '.join(supported_formats)}"
            print(f"Format error: {error_msg}")
            self.send_error_response(400, error_msg)
            return
        
        print(f"File format {file_extension} is supported")
        
        # Для демонстрации создаем mock документ
        doc_id = len(documents_db) + 1
        document = {
            "id": doc_id,
            "filename": f"document_{doc_id}.pdf",
            "original_filename": filename,
            "file_size": 1024000,
            "status": "analyzed",
            "user_id": 1,
            "created_at": datetime.now().isoformat(),
            "analysis_results": [
                {
                    "id": 1,
                    "risk_level": "high",
                    "text_fragment": "без возврата",
                    "explanation": "Условие о невозврате средств может быть незаконным",
                    "confidence_score": 85
                },
                {
                    "id": 2,
                    "risk_level": "medium",
                    "text_fragment": "срок действия договора не определен",
                    "explanation": "Неопределенный срок договора может создавать неопределенность",
                    "confidence_score": 70
                }
            ]
        }
        documents_db.append(document)

        self.send_json_response({
            "document_id": doc_id,
            "message": "Document uploaded successfully",
            "status": "analyzed"
        })

    def handle_documents_get(self):
        """Обработка GET запросов документов"""
        print(f"handle_documents_get called with path: {self.path}")  # Отладочная информация
        if self.path == '/documents':
            print("Calling handle_get_documents")  # Отладочная информация
            self.handle_get_documents()
        else:
            print(f"404 in handle_documents_get for path: {self.path}")  # Отладочная информация
            self.send_error_response(404, "Not found")

    def handle_get_documents(self):
        """Получение списка документов"""
        # Проверяем авторизацию
        auth_header = self.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            self.send_error_response(401, "Could not validate credentials")
            return
            
        # Для демонстрации возвращаем все документы
        self.send_json_response(documents_db)

    def get_json_data(self):
        """Получение JSON данных из запроса"""
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))

    def send_json_response(self, data):
        """Отправка JSON ответа"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_error_response(self, code, message):
        """Отправка ошибки"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"detail": message}, ensure_ascii=False).encode('utf-8'))

    def log_message(self, format, *args):
        """Отключение логирования"""
        pass

def run_server():
    """Запуск сервера"""
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print("Mock Backend запущен на http://localhost:8000")
    print("Доступные эндпоинты:")
    print("   POST /auth/login - Вход в систему")
    print("   POST /auth/register - Регистрация")
    print("   GET /auth/me - Информация о пользователе")
    print("   POST /documents/upload - Загрузка документа")
    print("   GET /documents - Список документов")
    print("   GET /health - Проверка здоровья")
    print("\nFrontend должен быть доступен на http://localhost:3000")
    print("\nТестовые данные:")
    print("   Email: test@example.com")
    print("   Пароль: password123")
    print("\nДля остановки нажмите Ctrl+C")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен")
        httpd.server_close()

if __name__ == '__main__':
    run_server()

