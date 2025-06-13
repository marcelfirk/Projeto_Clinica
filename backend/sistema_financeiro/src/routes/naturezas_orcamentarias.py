from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.natureza_orcamentaria import Natureza, db
from datetime import datetime

naturezas_bp = Blueprint("naturezas", __name__)

@naturezas_bp.route("/", methods=["GET"])
@jwt_required()
def listar_naturezas():
    """Endpoint para listar todas as naturezas"""
    refeicoes = Natureza.query.all()
    
    resultado = []
    for natureza in refeicoes:
        resultado.append({
            "id": natureza.id,
            "nome": natureza.nome,
            "descricao": natureza.descricao,
            "data_cadastro": natureza.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@naturezas_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_natureza(id):
    """Endpoint para obter uma natureza específica"""
    natureza = Natureza.query.get(id)
    
    if not natureza:
        return jsonify({"msg": "Refeição não encontrada"}), 404
    
    return jsonify({
        "id": natureza.id,
        "nome": natureza.nome,
        "descricao": natureza.descricao,
        "data_cadastro": natureza.data_cadastro.isoformat()
    }), 200

@naturezas_bp.route("/", methods=["POST"])
@jwt_required()
def criar_natureza():
    """Endpoint para criar uma nova natureza"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if not nome:
        return jsonify({"msg": "Nome da natureza é obrigatório"}), 400
    
    existing_natureza = Natureza.query.filter_by(nome=nome).first()
    if existing_natureza:
        return jsonify({"msg": "Natureza com este nome já existe"}), 409
    
    nova_natureza = Natureza(
        nome=nome,
        descricao=descricao
    )
    
    db.session.add(nova_natureza)
    db.session.commit()
    
    return jsonify({
        "id": nova_natureza.id,
        "nome": nova_natureza.nome,
        "descricao": nova_natureza.descricao,
        "data_cadastro": nova_natureza.data_cadastro.isoformat()
    }), 201

@naturezas_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_natureza(id):
    """Endpoint para atualizar uma natureza existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    natureza = Natureza.query.get(id)
    
    if not natureza:
        return jsonify({"msg": "Natureza não encontrada"}), 404
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if nome:
        existing_natureza = Natureza.query.filter(Natureza.nome == nome, Natureza.id != id).first()
        if existing_natureza:
            return jsonify({"msg": "Natureza com este nome já existe"}), 409
        natureza.nome = nome
    if descricao is not None:
        natureza.descricao = descricao
        
    db.session.commit()
    
    return jsonify({
        "id": natureza.id,
        "nome": natureza.nome,
        "descricao": natureza.descricao,
        "data_cadastro": natureza.data_cadastro.isoformat()
    }), 200

@naturezas_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_natureza(id):
    """Endpoint para deletar uma natureza"""
    natureza = Natureza.query.get(id)
    
    if not natureza:
        return jsonify({"msg": "Refeição não encontrada"}), 404
        
    db.session.delete(natureza)
    db.session.commit()
    
    return jsonify({"msg": "Refeição deletada com sucesso"}), 200