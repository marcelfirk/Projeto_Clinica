from src.models import db
from src.models.user import User
from werkzeug.security import generate_password_hash
from src.main import app

with app.app_context():
    email = 'marcelfirkowski@gmail.com'
    password = 's3nh@adm1n123'
    name = 'Administrador'

    if not User.query.filter_by(email=email).first():
        admin = User(
            email=email,
            password=generate_password_hash(password),
            name=name,
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print('Usuário admin criado com sucesso!')
    else:
        print('Usuário admin já existe.')