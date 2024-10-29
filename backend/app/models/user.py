# backend/app/models/user.py
# import bcrypt
# from app import db

# class User:
#     @staticmethod
#     def create_user(username, password, email, phone, admin_note, isadmin = False, status = False):
#         if password is not None:
#             hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
#             db.users.insert_one({'username': username, 'password': hashed_password, 'email': email, 'phone': phone, 'admin_note': admin_note, 'isadmin': isadmin, 'status': status})

#     @staticmethod
#     def find_user(email):
#         return db.users.find_one({'email': email})

#     @staticmethod
#     def verify_password(stored_password, provided_password):
#         print("stored_password:", stored_password)
#         print("provided_password:", provided_password)
#         return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)

# backend/app/models/user.py
import bcrypt
import cryptography
from app import db
from bson.objectid import ObjectId
from datetime import datetime
from cryptography.fernet import Fernet
import base64
import os

chatbot_id_secret_key = os.environ.get("chatbot_id_secret_key")

if not chatbot_id_secret_key or len(chatbot_id_secret_key) != 44:  # A valid Fernet key is 44 characters long
    chatbot_id_secret_key = "JRQ2DBZdLny432cd1Hk_1cbfkdKIGjZ6rm4zp1euFG4="

cipher = Fernet(chatbot_id_secret_key)

# Function to encrypt the email
def encrypt_email(email):
    encrypted_email = cipher.encrypt(email.encode()).decode()
    return encrypted_email

# Function to decrypt the email
def decrypt_email(encrypted_email):
    decrypted_email = cipher.decrypt(encrypted_email.encode()).decode()
    return decrypted_email

class User:
    @staticmethod
    # def create_user(username, password, email, phone, admin_note, isadmin=False, status=False):
    #     if password:
    #         user_data = {
    #             'username': username,
    #             'email': email,
    #             'phone': phone,
    #             'admin_note': admin_note,
    #             'isadmin': isadmin,
    #             'status': status,
    #             'registrationDate': datetime.now().strftime("%Y/%m/%d"),
    #         }
    #         user_data['password'] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    #         db.users.insert_one(user_data)
    def create_user(username, password, email = "test@gmail.com", phone = "123456789", admin_note = "", isadmin = False, status = False):
        if password is not None:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            db.users.insert_one({'username': username, 'password': hashed_password, 'email': email, 'phone': phone, 'admin_note': admin_note, 'isadmin': isadmin, 'status': status, 'registrationDate': datetime.now().strftime("%Y/%m/%d")})


    @staticmethod
    def update_user(id, username, email, phone, admin_note, status):
        update_data = {
            'username': username,
            'email': email,
            'phone': phone,
            'admin_note': admin_note,
            'status': status
        }
        db.users.update_one(
            {'_id': ObjectId(id)},
            {'$set': update_data}
        )

    @staticmethod
    def delete_user(id):
        db.users.delete_one({'_id': ObjectId(id)})

    @staticmethod
    def find_user(email_or_id):
        if isinstance(email_or_id, ObjectId):
            return db.users.find_one({'_id': email_or_id})
        return db.users.find_one({'email': email_or_id})

    @staticmethod
    def get_all_users():
        return list(db.users.find()) or []

    @staticmethod
    def verify_password(stored_password, provided_password):
        print("stored_password:", stored_password)
        print("provided_password:", provided_password)
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)

    @staticmethod
    def generate_code(username, email):
        
        # Logic to send the code via email
        encrypted_email = encrypt_email(email)
        code = f"""<style>
            * {{
            box-sizing: border-box;
            }}

            #chatbotWindow {{
            display: flex;
            flex-direction: column;
            align-items: end;
            gap: 10px;
            padding: 48px 100px;
            }}

            #chatbotIframe {{
            width: 100%;
            height: 100%;
            border: none;
            }}


            #chatbotCloseButton {{
            background-color: #3B3B3B;
            z-index: 300;
            color: white;
            border: none;
            border-radius: 100%;
            width: 60px;
            height: 60px;
            cursor: pointer;
            }}

            @media only screen and (max-width: 768px) {{

            #chatbotWindow {{
                padding: 24px 10px;
            }}
            }}
        </style>
        <script defer>
            document.addEventListener('DOMContentLoaded', function () {{
            var chatbotEnabled = false;
            // Create the chatbot button
            var chatbotWindow = document.createElement('div');
            chatbotWindow.style.zIndex = 200;
            chatbotWindow.style.display = 'none';
            chatbotWindow.style.position = 'fixed';
            chatbotWindow.style.top = '0px';
            chatbotWindow.style.right = '0px';
            chatbotWindow.style.left = '0px';
            chatbotWindow.style.bottom = '0px';
            chatbotWindow.style.width = '100%';
            chatbotWindow.style.height = '100%';
            chatbotWindow.id = 'chatbotWindow';

            chatbotWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            var chatbotButton = document.createElement('button');
            chatbotButton.id = 'chatbotButton';
            chatbotButton.style.width = '60px';
            chatbotButton.style.height = '60px';
            chatbotButton.style.position = 'fixed';
            chatbotButton.style.top = '610px';
            chatbotButton.style.right = '20px';
            chatbotButton.style.backgroundColor = '#3B3B3B';
            chatbotButton.style.borderRadius = '100%';
            chatbotButton.style.color = 'white';
            chatbotButton.style.border = 'none';
            chatbotButton.style.cursor = 'pointer';
            chatbotButton.innerHTML = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 23.5H7.5V28.6013L13.8762 23.5H20C21.3787 23.5 22.5 22.3788 22.5 21V11C22.5 9.62125 21.3787 8.5 20 8.5H5C3.62125 8.5 2.5 9.62125 2.5 11V21C2.5 22.3788 3.62125 23.5 5 23.5Z" fill="white"/>
                            <path d="M25 3.5H10C8.62125 3.5 7.5 4.62125 7.5 6H22.5C23.8787 6 25 7.12125 25 8.5V18.5C26.3787 18.5 27.5 17.3787 27.5 16V6C27.5 4.62125 26.3787 3.5 25 3.5Z" fill="white"/>
                            </svg>
                        `;
            // Append the button to the body
            // Create the iframe
            var chatbotIframe = document.createElement('iframe');
            chatbotIframe.id = 'chatbotIframe';
            chatbotIframe.src = 'https://perva-bot.com/chatbot?id={encrypted_email}&companyname={username}';
            var chatbotCloseButton = document.createElement('button');
            chatbotCloseButton.id = 'chatbotCloseButton';
            chatbotCloseButton.innerHTML = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.00007 7.99993L20 20.7279" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 21L20 8.27208" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;


            chatbotWindow.appendChild(chatbotIframe);
            chatbotWindow.appendChild(chatbotCloseButton);
            document.body.appendChild(chatbotWindow);
            document.body.appendChild(chatbotButton);

            chatbotCloseButton.addEventListener('click', function () {{
                chatbotWindow.style.display = 'none';
            }});

            chatbotButton.addEventListener('click', function () {{
                if (chatbotWindow.style.display === 'none') {{
                chatbotWindow.style.display = 'flex';
                chatbotButton.innerHTML = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 23.5H7.5V28.6013L13.8762 23.5H20C21.3787 23.5 22.5 22.3788 22.5 21V11C22.5 9.62125 21.3787 8.5 20 8.5H5C3.62125 8.5 2.5 9.62125 2.5 11V21C2.5 22.3788 3.62125 23.5 5 23.5Z" fill="white"/>
                    <path d="M25 3.5H10C8.62125 3.5 7.5 4.62125 7.5 6H22.5C23.8787 6 25 7.12125 25 8.5V18.5C26.3787 18.5 27.5 17.3787 27.5 16V6C27.5 4.62125 26.3787 3.5 25 3.5Z" fill="white"/>
                    </svg>
                `;

                }}
            }});


            }});


        </script>"""
            
        return code

    # @staticmethod
    # def is_admin(email):
    #     user = User.find_user(email)
    #     return user['isadmin'] if user else False

