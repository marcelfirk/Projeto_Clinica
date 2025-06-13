from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.local_atendimento import LocalAtendimento, db
from datetime import datetime

locais_atendimento_bp = Blueprint("locais_atendimento", __name__)

@locais_atendimento_bp.route("/", methods=["GET"])
@jwt_required()
def listar_locais_atendimento():
    """Endpoint para listar todos os locais de atendimento"""
    locais = LocalAtendimento.query.all()
    
    resultado = []
    for local in locais:
        resultado.append({
            "id": local.id,
            "nome": local.nome,
            "endereco": local.endereco,
            "data_cadastro": local.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@locais_atendimento_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_local_atendimento(id):
    """Endpoint para obter um local de atendimento específico"""
    local = LocalAtendimento.query.get(id)
    
    if not local:
        return jsonify({"msg": "Local de atendimento não encontrado"}), 404
    
    return jsonify({
        "id": local.id,
        "nome": local.nome,
        "endereco": local.endereco,
        "data_cadastro": local.data_cadastro.isoformat()
    }), 200

@locais_atendimento_bp.route("/", methods=["POST"])
@jwt_required()
def criar_local_atendimento():
    """Endpoint para criar um novo local de atendimento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    nome = request.json.get("nome", None)
    endereco = request.json.get("endereco", None)
    
    if not nome:
        return jsonify({"msg": "Nome do local de atendimento é obrigatório"}), 400
    
    existing_local = LocalAtendimento.query.filter_by(nome=nome).first()
    if existing_local:
        return jsonify({"msg": "Local de atendimento com este nome já existe"}), 409
    
    novo_local = LocalAtendimento(
        nome=nome,
        endereco=endereco
    )
    
    db.session.add(novo_local)
    db.session.commit()
    
    return jsonify({
        "id": novo_local.id,
        "nome": novo_local.nome,
        "endereco": novo_local.endereco,
        "data_cadastro": novo_local.data_cadastro.isoformat()
    }), 201

@locais_atendimento_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_local_atendimento(id):
    """Endpoint para atualizar um local de atendimento existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    local = LocalAtendimento.query.get(id)
    
    if not local:
        return jsonify({"msg": "Local de atendimento não encontrado"}), 404
    
    nome = request.json.get("nome", None)
    endereco = request.json.get("endereco", None)
    
    if nome:
        existing_local = LocalAtendimento.query.filter(LocalAtendimento.nome == nome, LocalAtendimento.id != id).first()
        if existing_local:
            return jsonify({"msg": "Local de atendimento com este nome já existe"}), 409
        local.nome = nome
    if endereco is not None:
        local.endereco = endereco
        
    db.session.commit()
    
    return jsonify({
        "id": local.id,
        "nome": local.nome,
        "endereco": local.endereco,
        "data_cadastro": local.data_cadastro.isoformat()
    }), 200

@locais_atendimento_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_local_atendimento(id):
    """Endpoint para deletar um local de atendimento"""
    local = LocalAtendimento.query.get(id)
    
    if not local:
        return jsonify({"msg": "Local de atendimento não encontrado"}), 404
        
    db.session.delete(local)
    db.session.commit()
    
    return jsonify({"msg": "Local de atendimento deletado com sucesso"}), 200