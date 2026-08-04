from backend.app import app
import os

client = app.test_client()
email = 'x' + os.urandom(4).hex() + '@example.com'
resp = client.post('/api/auth/register', json={'email': email, 'password': 'Password123!', 'full_name': 'Profile User'})
print('register status:', resp.status_code)
print('register body:', resp.get_json())
if resp.status_code == 201:
    token = resp.get_json()['access_token']
    print('token:', token)
    g = client.get('/api/profile', headers={'Authorization': f'Bearer {token}'})
    print('profile status:', g.status_code)
    print('profile body:', g.get_data(as_text=True))
