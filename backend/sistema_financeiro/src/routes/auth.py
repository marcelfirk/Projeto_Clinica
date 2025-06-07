from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User, db
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para autenticação de usuários"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    
    if not email or not password:
        return jsonify({"msg": "Email e senha são obrigatórios"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Credenciais inválidas"}), 401
    
    # Atualiza último login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Cria token JWT
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"name": user.name, "email": user.email},
        expires_delta=timedelta(hours=24)
    )
    
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint para registro de novos usuários"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    name = request.json.get('name', None)
    
    if not email or not password or not name:
        return jsonify({"msg": "Email, senha e nome são obrigatórios"}), 400
    
    # Verifica se usuário já existe
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "Email já cadastrado"}), 409
    
    # Cria novo usuário
    hashed_password = generate_password_hash(password)
    new_user = User(
        email=email,
        password=hashed_password,
        name=name
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "msg": "Usuário registrado com sucesso",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Endpoint para obter informações do usuário autenticado"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
    
    return jsonify({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Endpoint para renovar token JWT"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    access_token = create_access_token(
        identity=current_user_id,
        additional_claims={"name": user.name, "email": user.email},
        expires_delta=timedelta(hours=24)
    )
    
    return jsonify({"access_token": access_token}), 200
