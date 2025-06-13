from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.itens import Item, db
from datetime import datetime

itens_bp = Blueprint("itens", __name__)

@itens_bp.route("/", methods=["GET"])
@jwt_required()
def listar_itens():
    """Endpoint para listar todos os itens"""
    itens = Item.query.all()
    
    resultado = []
    for item in itens:
        resultado.append({
            "id": item.id,
            "nome": item.nome,
            "descricao": item.descricao,
            "quantidade_estoque": item.quantidade_estoque,
            "data_cadastro": item.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@itens_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_item(id):
    """Endpoint para obter um item específico"""
    item = Item.query.get(id)
    
    if not item:
        return jsonify({"msg": "Item não encontrado"}), 404
    
    return jsonify({
        "id": item.id,
        "nome": item.nome,
        "descricao": item.descricao,
        "quantidade_estoque": item.quantidade_estoque,
        "data_cadastro": item.data_cadastro.isoformat()
    }), 200

@itens_bp.route("/", methods=["POST"])
@jwt_required()
def criar_item():
    """Endpoint para criar um novo item"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    quantidade_estoque = request.json.get("quantidade_estoque", 0)
    
    if not nome:
        return jsonify({"msg": "Nome do item é obrigatório"}), 400
    
    existing_item = Item.query.filter_by(nome=nome).first()
    if existing_item:
        return jsonify({"msg": "Item com este nome já existe"}), 409
    
    novo_item = Item(
        nome=nome,
        descricao=descricao,
        quantidade_estoque=quantidade_estoque
    )
    
    db.session.add(novo_item)
    db.session.commit()
    
    return jsonify({
        "id": novo_item.id,
        "nome": novo_item.nome,
        "descricao": novo_item.descricao,
        "quantidade_estoque": novo_item.quantidade_estoque,
        "data_cadastro": novo_item.data_cadastro.isoformat()
    }), 201

@itens_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_item(id):
    """Endpoint para atualizar um item existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    item = Item.query.get(id)
    
    if not item:
        return jsonify({"msg": "Item não encontrado"}), 404
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    quantidade_estoque = request.json.get("quantidade_estoque", None)
    
    if nome:
        existing_item = Item.query.filter(Item.nome == nome, Item.id != id).first()
        if existing_item:
            return jsonify({"msg": "Item com este nome já existe"}), 409
        item.nome = nome
    if descricao is not None:
        item.descricao = descricao
    if quantidade_estoque is not None:
        item.quantidade_estoque = quantidade_estoque
        
    db.session.commit()
    
    return jsonify({
        "id": item.id,
        "nome": item.nome,
        "descricao": item.descricao,
        "quantidade_estoque": item.quantidade_estoque,
        "data_cadastro": item.data_cadastro.isoformat()
    }), 200

@itens_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_item(id):
    """Endpoint para deletar um item"""
    item = Item.query.get(id)
    
    if not item:
        return jsonify({"msg": "Item não encontrado"}), 404
        
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({"msg": "Item deletado com sucesso"}), 200