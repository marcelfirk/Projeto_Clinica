from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.procedimento import Procedimento, db
from datetime import datetime

procedimentos_bp = Blueprint("procedimentos", __name__)

@procedimentos_bp.route("/", methods=["GET"])
@jwt_required()
def listar_procedimentos():
    """Endpoint para listar todos os procedimentos"""
    procedimentos = Procedimento.query.all()
    
    resultado = []
    for procedimento in procedimentos:
        resultado.append({
            "id": procedimento.id,
            "nome": procedimento.nome,
            "descricao": procedimento.descricao,
            "valor_sugerido": procedimento.valor_sugerido,
            "data_cadastro": procedimento.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@procedimentos_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_procedimento(id):
    """Endpoint para obter um procedimento específico"""
    procedimento = Procedimento.query.get(id)
    
    if not procedimento:
        return jsonify({"msg": "Procedimento não encontrado"}), 404
    
    return jsonify({
        "id": procedimento.id,
        "nome": procedimento.nome,
        "descricao": procedimento.descricao,
        "valor_sugerido": procedimento.valor_sugerido,
        "data_cadastro": procedimento.data_cadastro.isoformat()
    }), 200

@procedimentos_bp.route("/", methods=["POST"])
@jwt_required()
def criar_procedimento():
    """Endpoint para criar um novo procedimento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    valor_sugerido = request.json.get("valor_sugerido", None)
    
    if not nome:
        return jsonify({"msg": "Nome do procedimento é obrigatório"}), 400
    
    existing_procedimento = Procedimento.query.filter_by(nome=nome).first()
    if existing_procedimento:
        return jsonify({"msg": "Procedimento com este nome já existe"}), 409
    
    novo_procedimento = Procedimento(
        nome=nome,
        descricao=descricao,
        valor_sugerido=valor_sugerido
    )
    
    db.session.add(novo_procedimento)
    db.session.commit()
    
    return jsonify({
        "id": novo_procedimento.id,
        "nome": novo_procedimento.nome,
        "descricao": novo_procedimento.descricao,
        "valor_sugerido": novo_procedimento.valor_sugerido,
        "data_cadastro": novo_procedimento.data_cadastro.isoformat()
    }), 201

@procedimentos_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_procedimento(id):
    """Endpoint para atualizar um procedimento existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    procedimento = Procedimento.query.get(id)
    
    if not procedimento:
        return jsonify({"msg": "Procedimento não encontrado"}), 404
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    valor_sugerido = request.json.get("valor_sugerido", None)
    
    if nome:
        existing_procedimento = Procedimento.query.filter(Procedimento.nome == nome, Procedimento.id != id).first()
        if existing_procedimento:
            return jsonify({"msg": "Procedimento com este nome já existe"}), 409
        procedimento.nome = nome
    if descricao is not None:
        procedimento.descricao = descricao
    if valor_sugerido is not None:
        procedimento.valor_sugerido = valor_sugerido
        
    db.session.commit()
    
    return jsonify({
        "id": procedimento.id,
        "nome": procedimento.nome,
        "descricao": procedimento.descricao,
        "valor_sugerido": procedimento.valor_sugerido,
        "data_cadastro": procedimento.data_cadastro.isoformat()
    }), 200

@procedimentos_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_procedimento(id):
    """Endpoint para deletar um procedimento"""
    procedimento = Procedimento.query.get(id)
    
    if not procedimento:
        return jsonify({"msg": "Procedimento não encontrado"}), 404
        
    db.session.delete(procedimento)
    db.session.commit()
    
    return jsonify({"msg": "Procedimento deletado com sucesso"}), 200