import app
from backend.auth.utils import generate_tokens
from flask_jwt_extended import decode_token

with app.app.app_context():
    token = generate_tokens(1)[0]
    print('TOKEN=' + token)
    print('DECODE=' + str(decode_token(token)))
