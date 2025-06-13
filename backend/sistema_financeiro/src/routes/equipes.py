from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.equipe import Equipe, db
from datetime import datetime

equipes_bp = Blueprint("equipes", __name__)

@equipes_bp.route("/", methods=["GET"])
@jwt_required()
def listar_equipes():
    """Endpoint para listar todas as equipes"""
    equipes = Equipe.query.all()
    
    resultado = []
    for equipe in equipes:
        resultado.append({
            "id": equipe.id,
            "nome": equipe.nome,
            "descricao": equipe.descricao,
            "data_cadastro": equipe.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@equipes_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_equipe(id):
    """Endpoint para obter uma equipe específica"""
    equipe = Equipe.query.get(id)
    
    if not equipe:
        return jsonify({"msg": "Equipe não encontrada"}), 404
    
    return jsonify({
        "id": equipe.id,
        "nome": equipe.nome,
        "descricao": equipe.descricao,
        "data_cadastro": equipe.data_cadastro.isoformat()
    }), 200

@equipes_bp.route("/", methods=["POST"])
@jwt_required()
def criar_equipe():
    """Endpoint para criar uma nova equipe"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if not nome:
        return jsonify({"msg": "Nome da equipe é obrigatório"}), 400
    
    existing_equipe = Equipe.query.filter_by(nome=nome).first()
    if existing_equipe:
        return jsonify({"msg": "Equipe com este nome já existe"}), 409
    
    nova_equipe = Equipe(
        nome=nome,
        descricao=descricao
    )
    
    db.session.add(nova_equipe)
    db.session.commit()
    
    return jsonify({
        "id": nova_equipe.id,
        "nome": nova_equipe.nome,
        "descricao": nova_equipe.descricao,
        "data_cadastro": nova_equipe.data_cadastro.isoformat()
    }), 201

@equipes_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_equipe(id):
    """Endpoint para atualizar uma equipe existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    equipe = Equipe.query.get(id)
    
    if not equipe:
        return jsonify({"msg": "Equipe não encontrada"}), 404
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if nome:
        existing_equipe = Equipe.query.filter(Equipe.nome == nome, Equipe.id != id).first()
        if existing_equipe:
            return jsonify({"msg": "Equipe com este nome já existe"}), 409
        equipe.nome = nome
    if descricao is not None:
        equipe.descricao = descricao
        
    db.session.commit()
    
    return jsonify({
        "id": equipe.id,
        "nome": equipe.nome,
        "descricao": equipe.descricao,
        "data_cadastro": equipe.data_cadastro.isoformat()
    }), 200

@equipes_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_equipe(id):
    """Endpoint para deletar uma equipe"""
    equipe = Equipe.query.get(id)
    
    if not equipe:
        return jsonify({"msg": "Equipe não encontrada"}), 404
        
    db.session.delete(equipe)
    db.session.commit()
    
    return jsonify({"msg": "Equipe deletada com sucesso"}), 200