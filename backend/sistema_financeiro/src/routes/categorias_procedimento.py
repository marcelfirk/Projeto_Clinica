from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.categoria_procedimento import CategoriaProcedimento, db
from datetime import datetime

categorias_procedimento_bp = Blueprint("categorias_procedimento", __name__)

@categorias_procedimento_bp.route("/", methods=["GET"])
@jwt_required()
def listar_categorias_procedimento():
    """Endpoint para listar todas as categorias de procedimento"""
    categorias = CategoriaProcedimento.query.all()
    
    resultado = []
    for categoria in categorias:
        resultado.append({
            "id": categoria.id,
            "nome": categoria.nome,
            "descricao": categoria.descricao,
            "data_cadastro": categoria.data_cadastro.isoformat()
        })
    
    return jsonify(resultado), 200

@categorias_procedimento_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_categoria_procedimento(id):
    """Endpoint para obter uma categoria de procedimento específica"""
    categoria = CategoriaProcedimento.query.get(id)
    
    if not categoria:
        return jsonify({"msg": "Categoria de procedimento não encontrada"}), 404
    
    return jsonify({
        "id": categoria.id,
        "nome": categoria.nome,
        "descricao": categoria.descricao,
        "data_cadastro": categoria.data_cadastro.isoformat()
    }), 200

@categorias_procedimento_bp.route("/", methods=["POST"])
@jwt_required()
def criar_categoria_procedimento():
    """Endpoint para criar uma nova categoria de procedimento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if not nome:
        return jsonify({"msg": "Nome da categoria de procedimento é obrigatório"}), 400
    
    existing_categoria = CategoriaProcedimento.query.filter_by(nome=nome).first()
    if existing_categoria:
        return jsonify({"msg": "Categoria de procedimento com este nome já existe"}), 409
    
    nova_categoria = CategoriaProcedimento(
        nome=nome,
        descricao=descricao
    )
    
    db.session.add(nova_categoria)
    db.session.commit()
    
    return jsonify({
        "id": nova_categoria.id,
        "nome": nova_categoria.nome,
        "descricao": nova_categoria.descricao,
        "data_cadastro": nova_categoria.data_cadastro.isoformat()
    }), 201

@categorias_procedimento_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_categoria_procedimento(id):
    """Endpoint para atualizar uma categoria de procedimento existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    categoria = CategoriaProcedimento.query.get(id)
    
    if not categoria:
        return jsonify({"msg": "Categoria de procedimento não encontrada"}), 404
    
    nome = request.json.get("nome", None)
    descricao = request.json.get("descricao", None)
    
    if nome:
        existing_categoria = CategoriaProcedimento.query.filter(CategoriaProcedimento.nome == nome, CategoriaProcedimento.id != id).first()
        if existing_categoria:
            return jsonify({"msg": "Categoria de procedimento com este nome já existe"}), 409
        categoria.nome = nome
    if descricao is not None:
        categoria.descricao = descricao
        
    db.session.commit()
    
    return jsonify({
        "id": categoria.id,
        "nome": categoria.nome,
        "descricao": categoria.descricao,
        "data_cadastro": categoria.data_cadastro.isoformat()
    }), 200

@categorias_procedimento_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_categoria_procedimento(id):
    """Endpoint para deletar uma categoria de procedimento"""
    categoria = CategoriaProcedimento.query.get(id)
    
    if not categoria:
        return jsonify({"msg": "Categoria de procedimento não encontrada"}), 404
        
    db.session.delete(categoria)
    db.session.commit()
    
    return jsonify({"msg": "Categoria de procedimento deletada com sucesso"}), 200