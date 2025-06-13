from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.refeicao import Refeicao, db
from datetime import datetime

refeicoes_bp = Blueprint("refeicoes", __name__)

@refeicoes_bp.route("/", methods=["GET"])
@jwt_required()
def listar_refeicoes():
    """Endpoint para listar todas as refeições"""
    refeicoes = Refeicao.query.all()
    
    resultado = []
    for refeicao in refeicoes:
        resultado.append({
            "id": refeicao.id,
            "nome": refeicao.nome,
            "descricao": refeicao.descricao,
            "data_cadastro": refeicao.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@refeicoes_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_refeicao(id):
    """Endpoint para obter uma refeição específica"""
    refeicao = Refeicao.query.get(id)
    
    if not refeicao:
        return jsonify({"msg": "Refeição não encontrada"}), 404
    
    return jsonify({
        "id": refeicao.id,
        "nome": refeicao.nome,
        "descricao": refeicao.descricao,
        "data_cadastro": refeicao.data_cadastro.isoformat()
    }), 200

@refeicoes_bp.route("/", methods=["POST"])
@jwt_required()
def criar_refeicao():
    """Endpoint para criar uma nova refeição"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if not nome:
        return jsonify({"msg": "Nome da refeição é obrigatório"}), 400
    
    existing_refeicao = Refeicao.query.filter_by(nome=nome).first()
    if existing_refeicao:
        return jsonify({"msg": "Refeição com este nome já existe"}), 409
    
    nova_refeicao = Refeicao(
        nome=nome,
        descricao=descricao
    )
    
    db.session.add(nova_refeicao)
    db.session.commit()
    
    return jsonify({
        "id": nova_refeicao.id,
        "nome": nova_refeicao.nome,
        "descricao": nova_refeicao.descricao,
        "data_cadastro": nova_refeicao.data_cadastro.isoformat()
    }), 201

@refeicoes_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_refeicao(id):
    """Endpoint para atualizar uma refeição existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    refeicao = Refeicao.query.get(id)
    
    if not refeicao:
        return jsonify({"msg": "Refeição não encontrada"}), 404
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if nome:
        existing_refeicao = Refeicao.query.filter(Refeicao.nome == nome, Refeicao.id != id).first()
        if existing_refeicao:
            return jsonify({"msg": "Refeição com este nome já existe"}), 409
        refeicao.nome = nome
    if descricao is not None:
        refeicao.descricao = descricao
        
    db.session.commit()
    
    return jsonify({
        "id": refeicao.id,
        "nome": refeicao.nome,
        "descricao": refeicao.descricao,
        "data_cadastro": refeicao.data_cadastro.isoformat()
    }), 200

@refeicoes_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_refeicao(id):
    """Endpoint para deletar uma refeição"""
    refeicao = Refeicao.query.get(id)
    
    if not refeicao:
        return jsonify({"msg": "Refeição não encontrada"}), 404
        
    db.session.delete(refeicao)
    db.session.commit()
    
    return jsonify({"msg": "Refeição deletada com sucesso"}), 200